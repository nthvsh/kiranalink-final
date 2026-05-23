import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken, normalizeMobile, validateMobile } from '@/lib/utils'

const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

export async function POST(req: NextRequest) {
  try {
    const { mobile, otp, purpose } = await req.json()

    if (!mobile || !otp) {
      return NextResponse.json({ error: 'Mobile aur OTP dono zaroori hain' }, { status: 400 })
    }

    // Normalize mobile number
    const normalizedMobile = normalizeMobile(mobile)
    
    if (!normalizedMobile || !validateMobile(normalizedMobile)) {
      return NextResponse.json({ error: 'Invalid mobile number format' }, { status: 400 })
    }

    // TEST MODE: 123456 hamesha valid
    if (TEST_MODE && otp === '123456') {
      // OTP session ko verified mark karo
      const session = await prisma.otpSession.findFirst({
        where: { mobile: normalizedMobile },
        orderBy: { createdAt: 'desc' },
      })
      if (session) {
        await prisma.otpSession.update({
          where: { id: session.id },
          data: { verified: true },
        })
      }

      // Agar login purpose hai to shop dhundho
      if (purpose === 'login') {
        const shop = await prisma.shop.findUnique({ 
          where: { mobile: normalizedMobile } 
        })
        if (!shop) {
          return NextResponse.json({ error: 'Shop nahi mili. Signup karein.' }, { status: 404 })
        }
        const token = await createSessionToken(shop.id, normalizedMobile)
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
        response.cookies.set('kirana_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        })
        return response
      }

      // Signup ke liye sirf success return karo
      return NextResponse.json({ success: true, verified: true })
    }

    // NORMAL MODE: Database se OTP check karo
    const otpSession = await prisma.otpSession.findFirst({
      where: {
        mobile: normalizedMobile,
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

    // Mark OTP as verified
    await prisma.otpSession.update({
      where: { id: otpSession.id },
      data: { verified: true },
    })

    // Login ke liye shop dhundho aur session banao
    if (purpose === 'login') {
      const shop = await prisma.shop.findUnique({ 
        where: { mobile: normalizedMobile } 
      })
      if (!shop) {
        return NextResponse.json({ error: 'Shop nahi mili. Signup karein.' }, { status: 404 })
      }
      const token = await createSessionToken(shop.id, normalizedMobile)
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
      response.cookies.set('kirana_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
      return response
    }

    // Signup ke liye sirf verified return karo
    return NextResponse.json({ success: true, verified: true })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
