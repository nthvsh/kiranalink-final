import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken, isShopActive } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('kirana_session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const session = await verifySessionToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({
      where: { id: session.shopId },
      select: {
        id: true,
        shopName: true,
        ownerName: true,
        slug: true,
        whatsapp: true,
        isActive: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        createdAt: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop nahi mili' }, { status: 404 })
    }

    const active = isShopActive(shop)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kiranalink.in'

    return NextResponse.json({
      shop: {
        ...shop,
        isSubscriptionActive: active,
        shopLink: `${appUrl}/shop/${shop.slug}`,
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Logout
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('kirana_session')
  return response
}
