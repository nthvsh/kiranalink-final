import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isShopActive, formatTime, formatPayment } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await prisma.shop.findUnique({
      where: { slug },
      select: {
        id: true,
        shopName: true,
        ownerName: true,
        address: true,
        mobile: true,
        bannerUrl: true,
        openTime: true,
        closeTime: true,
        paymentMethod: true,
        isActive: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop nahi mili' }, { status: 404 })
    }

    const active = isShopActive(shop)

    return NextResponse.json({
      shop: {
        id: shop.id,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        address: shop.address,
        mobile: shop.mobile,
        bannerUrl: shop.bannerUrl,
        timing: `${formatTime(shop.openTime)} – ${formatTime(shop.closeTime)}`,
        paymentMethod: formatPayment(shop.paymentMethod),
        paymentRaw: shop.paymentMethod,
        isActive: active,
      },
    })
  } catch (error) {
    console.error('Shop info error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
