import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendOTP } from '@/lib/otp'
import { validateMobile, normalizeMobile } from '@/lib/utils'

// ⚠️ TEST MODE: Jab NEXT_PUBLIC_TEST_MODE=true ho to OTP hamesha 123456 hoga
const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

export async function POST(req: NextRequest) {
  try {
    const { mobile, purpose } = await req.json()
    
    // Normalize mobile number — sirf last 10 digits
    const normalizedMobile = normalizeMobile(mobile)
    
    if (!normalizedMobile || !validateMobile(normalizedMobile)) {
      return NextResponse.json(
        { error: 'Sahi mobile number daalo (10 digits, 6-9 se shuru)' },
        { status: 400 }
      )
    }

    // For login, check if shop exists
    if (purpose === 'login') {
      const shop = await prisma.shop.findUnique({ 
        where: { mobile: normalizedMobile } 
      })
      if (!shop) {
        return NextResponse.json(
          { error: 'Is number se koi account nahi mila. Pehle signup karein.' },
          { status: 404 }
        )
      }
    }

    // For signup, check if mobile already registered
    if (purpose === 'signup') {
      const existingShop = await prisma.shop.findUnique({
        where: { mobile: normalizedMobile }
      })
      if (existingShop) {
        return NextResponse.json(
          { error: 'Ye mobile number pehle se registered hai. Login karein.' },
          { status: 409 }
        )
      }
    }

    // Delete old OTPs for this mobile
    await prisma.otpSession.deleteMany({ 
      where: { mobile: normalizedMobile } 
    })

    // TEST MODE mein OTP hamesha 123456
    const otp = TEST_MODE ? '123456' : generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.otpSession.create({
      data: { 
        mobile: normalizedMobile, 
        otp, 
        expiresAt 
      },
    })

    // TEST MODE mein real SMS nahi bhejte
    if (!TEST_MODE) {
      const sent = await sendOTP(normalizedMobile, otp)
      if (!sent) {
        return NextResponse.json(
          { error: 'OTP bhejne mein error aaya. Dobara koshish karein.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `OTP ${normalizedMobile} par bheja gaya`,
      // Test mode mein OTP response mein dikhao
      ...(TEST_MODE ? { devOtp: otp, testMode: true } : {}),
      // Normal dev mode mein bhi dikhao
      ...(process.env.NODE_ENV === 'development' && !TEST_MODE ? { devOtp: otp } : {}),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
