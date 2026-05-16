import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/utils'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('kirana_session')?.value
    if (!token) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (keySecret) {
      const body = razorpay_order_id + '|' + razorpay_payment_id
      const expectedSig = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex')

      if (expectedSig !== razorpay_signature) {
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
      }
    }

    // Extend subscription by 30 days
    const shop = await prisma.shop.findUnique({ where: { id: session.shopId } })
    if (!shop) return NextResponse.json({ error: 'Shop nahi mili' }, { status: 404 })

    const now = new Date()
    const currentEnd = shop.subscriptionEndsAt && shop.subscriptionEndsAt > now
      ? shop.subscriptionEndsAt
      : now

    const newEnd = new Date(currentEnd)
    newEnd.setDate(newEnd.getDate() + 30)

    await prisma.shop.update({
      where: { id: session.shopId },
      data: { subscriptionEndsAt: newEnd, isActive: true },
    })

    // Update payment record
    await prisma.payment.updateMany({
      where: { shopId: session.shopId, razorpayOrderId: razorpay_order_id },
      data: { razorpayPaymentId: razorpay_payment_id, status: 'success' },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription active ho gayi! 30 din ke liye.',
      subscriptionEndsAt: newEnd,
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
