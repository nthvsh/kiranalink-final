import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const limit = 20

  const now = new Date()

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { shopName: { contains: search, mode: 'insensitive' } },
      { ownerName: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
    ]
  }
  if (status === 'active') where.isActive = true
  if (status === 'expired') where.isActive = false
  if (status === 'trial') { where.isActive = true; where.subscriptionEndsAt = null }

  try {
    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, shopName: true, ownerName: true, mobile: true,
          whatsapp: true, address: true, isActive: true,
          trialEndsAt: true, subscriptionEndsAt: true, createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.shop.count({ where }),
    ])

    const shopsWithStatus = shops.map((s: typeof shops[0]) => ({
      ...s,
      subscriptionStatus: !s.isActive ? 'expired'
        : s.subscriptionEndsAt && s.subscriptionEndsAt > now ? 'paid'
        : s.trialEndsAt > now ? 'trial' : 'expired',
      daysLeft: s.subscriptionEndsAt
        ? Math.max(0, Math.ceil((s.subscriptionEndsAt.getTime() - now.getTime()) / 86400000))
        : Math.max(0, Math.ceil((s.trialEndsAt.getTime() - now.getTime()) / 86400000)),
      totalOrders: s._count.orders,
    }))

    return NextResponse.json({ shops: shopsWithStatus, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Toggle shop active/inactive
export async function PATCH(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { shopId, isActive } = await req.json()
  await prisma.shop.update({ where: { id: shopId }, data: { isActive } })
  return NextResponse.json({ success: true })
}
