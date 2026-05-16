import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { mobile, otp } = await req.json()

    if (!mobile || !otp) {
      return NextResponse.json({ error: 'Mobile aur OTP dono zaroori hain' }, { status: 400 })
    }

    // Find valid OTP
    const otpSession = await prisma.otpSession.findFirst({
      where: {
        mobile,
        otp,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otpSession) {
      return NextResponse.json(
        { error: 'Galat ya expired OTP. Dobara bhejein.' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await prisma.otpSession.update({
      where: { id: otpSession.id },
      data: { verified: true },
    })

    // Find shop
    const shop = await prisma.shop.findUnique({ where: { mobile } })

    if (!shop) {
      return NextResponse.json({ error: 'Shop nahi mili. Signup karein.' }, { status: 404 })
    }

    // Create session token
    const token = await createSessionToken(shop.id, mobile)

    const response = NextResponse.json({
      success: true,
      shop: {
        id: shop.id,
        shopName: shop.shopName,
        slug: shop.slug,
        trialEndsAt: shop.trialEndsAt,
        subscriptionEndsAt: shop.subscriptionEndsAt,
      },
    })

    // Set httpOnly cookie
    response.cookies.set('kirana_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
