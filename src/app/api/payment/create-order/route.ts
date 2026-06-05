import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken, isShopActive, getDaysRemaining } from '@/lib/utils'

// Calculate new subscription expiry date
function calculateNewExpiryDate(shop: {
  trialEndsAt: Date
  subscriptionEndsAt: Date | null
}): Date {
  const now = new Date()
  let currentEndDate: Date

  // Agar active subscription hai to uske end date se extend karo
  if (shop.subscriptionEndsAt && shop.subscriptionEndsAt > now) {
    currentEndDate = shop.subscriptionEndsAt
  } else if (shop.trialEndsAt > now) {
    currentEndDate = shop.trialEndsAt
  } else {
    currentEndDate = now
  }

  // Add 30 days
  const newEndDate = new Date(currentEndDate)
  newEndDate.setDate(newEndDate.getDate() + 30)
  return newEndDate
}

export async function POST(req: NextRequest) {
  try {
    // Get session
    const token = req.cookies.get('kirana_session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const session = await verifySessionToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get shop
    const shop = await prisma.shop.findUnique({ 
      where: { id: session.shopId } 
    })
    if (!shop) {
      return NextResponse.json({ error: 'Shop nahi mili' }, { status: 404 })
    }

    // Check if shop already has active subscription (grace period included)
    if (isShopActive(shop)) {
      const daysLeft = getDaysRemaining(shop)
      return NextResponse.json({ 
        error: `Aapki shop already active hai. ${daysLeft} din baad recharge karein.`,
        alreadyActive: true,
        daysLeft
      }, { status: 400 })
    }

    // Check if there's a pending payment for this shop
    const existingPending = await prisma.payment.findFirst({
      where: {
        shopId: shop.id,
        status: 'pending',
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }
    })

    if (existingPending) {
      return NextResponse.json({ 
        error: 'Aapka ek payment already pending hai. Kuch der baad try karein.',
        pendingOrderId: existingPending.razorpayOrderId
      }, { status: 400 })
    }

    // Get amount from env
    const amount = parseInt(process.env.SUBSCRIPTION_PRICE || '14900')
    if (!amount || amount <= 0) {
      console.error('Invalid SUBSCRIPTION_PRICE:', process.env.SUBSCRIPTION_PRICE)
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    // Calculate new expiry date
    const newExpiryDate = calculateNewExpiryDate(shop)

    // DEV MODE — mock response
    if (!keyId || !keySecret || process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Mock payment order created')
      const mockOrderId = `order_dev_${shop.id}_${Date.now()}`
      
      // Save pending payment
      await prisma.payment.create({
        data: {
          shopId: shop.id,
          razorpayOrderId: mockOrderId,
          amount,
          status: 'pending',
        },
      })

      return NextResponse.json({
        orderId: mockOrderId,
        amount,
        currency: 'INR',
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        mobile: shop.mobile,
        email: shop.email || '',
        keyId: 'rzp_test_dev',
        isDevMode: true,
      })
    }

    // Create Razorpay order
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `sub_${shop.id}_${Date.now()}`,
        notes: { 
          shopId: shop.id, 
          shopName: shop.shopName,
          newExpiryDate: newExpiryDate.toISOString()
        },
      }),
    })

    const rzpData = await rzpRes.json()
    
    if (rzpData.error) {
      console.error('Razorpay error:', rzpData.error)
      return NextResponse.json({ 
        error: rzpData.error.description || 'Payment order create failed' 
      }, { status: 500 })
    }

    // Save pending payment
    await prisma.payment.create({
      data: {
        shopId: shop.id,
        razorpayOrderId: rzpData.id,
        amount,
        status: 'pending',
      },
    })

    return NextResponse.json({
      orderId: rzpData.id,
      amount,
      currency: 'INR',
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      mobile: shop.mobile,
      email: shop.email || '',
      keyId,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Server error. Dobara koshish karein.' }, { status: 500 })
  }
}