import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/utils'
import crypto from 'crypto'

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Get shop
    const shop = await prisma.shop.findUnique({ where: { id: session.shopId } })
    if (!shop) {
      return NextResponse.json({ error: 'Shop nahi mili' }, { status: 404 })
    }

    // Find pending payment
    const pendingPayment = await prisma.payment.findFirst({
      where: {
        shopId: session.shopId,
        razorpayOrderId: razorpay_order_id,
        status: 'pending',
      },
    })

    if (!pendingPayment) {
      return NextResponse.json({ 
        error: 'Payment record not found or already verified' 
      }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const keyId = process.env.RAZORPAY_KEY_ID

    // Verify signature (required in production)
    if (process.env.NODE_ENV === 'production' && !keySecret) {
      console.error('RAZORPAY_KEY_SECRET missing in production')
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 })
    }

    let isValidSignature = false

    if (keySecret) {
      const body = razorpay_order_id + '|' + razorpay_payment_id
      const expectedSig = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex')

      isValidSignature = expectedSig === razorpay_signature
    } else {
      // Dev mode — accept any signature for testing
      console.log('DEV MODE: Skipping signature verification')
      isValidSignature = true
    }

    if (!isValidSignature) {
      await prisma.payment.update({
        where: { id: pendingPayment.id },
        data: { status: 'failed' },
      })
      return NextResponse.json({ error: 'Payment verification failed - invalid signature' }, { status: 400 })
    }

    // Optional: Verify amount with Razorpay (recommended)
    let verifiedAmount = pendingPayment.amount
    if (keyId && keySecret && process.env.NODE_ENV === 'production') {
      try {
        const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: { Authorization: `Basic ${credentials}` },
        })
        const paymentData = await paymentRes.json()
        if (paymentData.amount !== pendingPayment.amount) {
          console.error(`Amount mismatch: expected ${pendingPayment.amount}, got ${paymentData.amount}`)
          return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
        }
        verifiedAmount = paymentData.amount
      } catch (error) {
        console.error('Failed to verify payment with Razorpay:', error)
        // Continue anyway — signature already verified
      }
    }

    // Calculate new subscription end date
    const now = new Date()
    let currentEnd: Date

    // Agar already active subscription hai to uske end date se extend karo
    if (shop.subscriptionEndsAt && shop.subscriptionEndsAt > now) {
      currentEnd = shop.subscriptionEndsAt
    } else if (shop.trialEndsAt > now) {
      currentEnd = shop.trialEndsAt
    } else {
      currentEnd = now
    }

    const newEnd = new Date(currentEnd)
    newEnd.setDate(newEnd.getDate() + 30)

    // Update shop subscription
    await prisma.shop.update({
      where: { id: session.shopId },
      data: { 
        subscriptionEndsAt: newEnd, 
        isActive: true,
        // Trial period cleanup: agar trial already active hai to reset karo
        ...(shop.trialEndsAt > now ? { trialEndsAt: new Date(0) } : {}),
      },
    })

    // Update payment record
    await prisma.payment.update({
      where: { id: pendingPayment.id },
      data: { 
        razorpayPaymentId: razorpay_payment_id, 
        status: 'success',
        subscriptionEndsAt: newEnd,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription active ho gayi! 30 din ke liye.',
      subscriptionEndsAt: newEnd,
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: 'Server error. Dobara koshish karein.' }, { status: 500 })
  }
}
