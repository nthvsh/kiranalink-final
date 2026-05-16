import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('kirana_session')?.value
    if (!token) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const shop = await prisma.shop.findUnique({ where: { id: session.shopId } })
    if (!shop) return NextResponse.json({ error: 'Shop nahi mili' }, { status: 404 })

    const amount = parseInt(process.env.SUBSCRIPTION_PRICE || '14900') // ₹149 in paise

    // Razorpay order create
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      // Dev mode — mock response
      return NextResponse.json({
        orderId: 'order_dev_' + Date.now(),
        amount,
        currency: 'INR',
        shopName: shop.shopName,
        keyId: 'rzp_test_dev',
      })
    }

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
        notes: { shopId: shop.id, shopName: shop.shopName },
      }),
    })

    const rzpData = await rzpRes.json()
    if (rzpData.error) {
      return NextResponse.json({ error: 'Payment order create failed' }, { status: 500 })
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
