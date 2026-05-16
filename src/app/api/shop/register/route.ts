import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkDuplicateShop, getUniqueSlug, getTrialEndDate, createSessionToken, validateMobile } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      shopName,
      ownerName,
      mobile,
      whatsapp,
      email,
      address,
      regNumber,
      bannerUrl,
      openTime,
      closeTime,
      paymentMethod,
      verifiedOtp,
    } = body

    // Validation
    if (!shopName || !ownerName || !mobile || !whatsapp || !address || !openTime || !closeTime || !paymentMethod) {
      return NextResponse.json({ error: 'Sabhi zaroori fields bharein' }, { status: 400 })
    }

    if (!validateMobile(mobile) || !validateMobile(whatsapp)) {
      return NextResponse.json({ error: 'Sahi mobile number daalo' }, { status: 400 })
    }

    // Check OTP was verified
    const otpSession = await prisma.otpSession.findFirst({
      where: { mobile, verified: true, expiresAt: { gt: new Date(Date.now() - 15 * 60 * 1000) } },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpSession) {
      return NextResponse.json({ error: 'OTP verify nahi hua. Dobara koshish karein.' }, { status: 400 })
    }

    // Anti-duplicate check
    const isDuplicate = await checkDuplicateShop(shopName, address, mobile)
    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Is shop ka account pehle se exist karta hai. Login karein.' },
        { status: 409 }
      )
    }

    // Check mobile already registered
    const existingMobile = await prisma.shop.findUnique({ where: { mobile } })
    if (existingMobile) {
      return NextResponse.json(
        { error: 'Ye mobile number pehle se registered hai. Login karein.' },
        { status: 409 }
      )
    }

    // Generate unique slug
    const slug = await getUniqueSlug(shopName)

    // Create shop
    const shop = await prisma.shop.create({
      data: {
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        mobile,
        whatsapp,
        email: email || null,
        address: address.trim(),
        regNumber: regNumber || null,
        bannerUrl: bannerUrl || null,
        openTime,
        closeTime,
        paymentMethod,
        slug,
        trialEndsAt: getTrialEndDate(),
        isActive: true,
      },
    })

    // Create session
    const token = await createSessionToken(shop.id, mobile)

    const response = NextResponse.json({
      success: true,
      shop: {
        id: shop.id,
        shopName: shop.shopName,
        slug: shop.slug,
        trialEndsAt: shop.trialEndsAt,
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
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Server error. Dobara koshish karein.' }, { status: 500 })
  }
}
