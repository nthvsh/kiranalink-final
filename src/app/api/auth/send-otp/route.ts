import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendOTP } from '@/lib/otp'
import { validateMobile } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { mobile, purpose } = await req.json()

    if (!mobile || !validateMobile(mobile)) {
      return NextResponse.json(
        { error: 'Sahi mobile number daalo (10 digits, 6-9 se shuru)' },
        { status: 400 }
      )
    }

    // For login, check if shop exists
    if (purpose === 'login') {
      const shop = await prisma.shop.findUnique({ where: { mobile } })
      if (!shop) {
        return NextResponse.json(
          { error: 'Is number se koi account nahi mila. Pehle signup karein.' },
          { status: 404 }
        )
      }
    }

    // Delete old OTPs for this mobile
    await prisma.otpSession.deleteMany({ where: { mobile } })

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.otpSession.create({
      data: { mobile, otp, expiresAt },
    })

    // Send OTP
    const sent = await sendOTP(mobile, otp)

    if (!sent) {
      return NextResponse.json(
        { error: 'OTP bhejne mein error aaya. Dobara koshish karein.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `OTP ${mobile} par bheja gaya`,
      // Only in dev
      ...(process.env.NODE_ENV === 'development' ? { devOtp: otp } : {}),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
