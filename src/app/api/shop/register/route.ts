import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkDuplicateShop, getUniqueSlug, getTrialEndDate, createSessionToken, validateMobile } from '@/lib/utils'
import { sendWelcomeMessage } from '@/lib/whatsapp'

// Helper: Normalize mobile number — sirf last 10 digits
function normalizeMobile(num: string): string {
  if (!num) return ''
  return num.replace(/\D/g, '').slice(-10)
}

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
    } = body

    // Validation
    if (!shopName || !ownerName || !mobile || !whatsapp || !address || !openTime || !closeTime) {
      return NextResponse.json({ error: 'Sabhi zaroori fields bharein' }, { status: 400 })
    }

    // Validate mobile format
    if (!validateMobile(mobile) || !validateMobile(whatsapp)) {
      return NextResponse.json({ error: 'Sahi mobile number daalo' }, { status: 400 })
    }

    // Normalize numbers — sirf last 10 digits store karo
    const normalizedMobile = normalizeMobile(mobile)
    const normalizedWhatsapp = normalizeMobile(whatsapp)

    // If whatsapp is same as mobile, still fine
    if (!normalizedMobile || !normalizedWhatsapp) {
      return NextResponse.json({ error: 'Invalid mobile number format' }, { status: 400 })
    }

    // Check OTP was verified
    const otpSession = await prisma.otpSession.findFirst({
      where: { mobile: normalizedMobile, verified: true, expiresAt: { gt: new Date(Date.now() - 15 * 60 * 1000) } },
      orderBy: { createdAt: 'desc' },
    })
    if (!otpSession) {
      return NextResponse.json({ error: 'OTP verify nahi hua. Dobara koshish karein.' }, { status: 400 })
    }

    // Anti-duplicate check
    const isDuplicate = await checkDuplicateShop(shopName, address, normalizedMobile)
    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Is shop ka account pehle se exist karta hai. Login karein.' },
        { status: 409 }
      )
    }

    // Check mobile already registered
    const existingMobile = await prisma.shop.findUnique({ where: { mobile: normalizedMobile } })
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
        mobile: normalizedMobile,
        whatsapp: normalizedWhatsapp,
        email: email || null,
        address: address.trim(),
        regNumber: regNumber || null,
        bannerUrl: bannerUrl || null,
        openTime,
        closeTime,
        paymentMethod: 'both',
        slug,
        trialEndsAt: getTrialEndDate(),
        isActive: true,
      },
    })

    // ⬇️ NAYA CODE — Welcome message bhejo (Twilio sandbox auto-verify)
    try {
      await sendWelcomeMessage(normalizedWhatsapp, shop.shopName)
      console.log('✅ Welcome message sent to shopkeeper')
    } catch (err) {
      console.error('⚠️ Welcome message failed:', err)
      // Fail hone par signup nahi rokna — continue
    }

    // Create session token
    const token = await createSessionToken(shop.id, normalizedMobile)

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