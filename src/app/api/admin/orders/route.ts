import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get('shopId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const where = shopId ? { shopId } : {}

  try {
    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0)

    const [orders, total, todayCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          customerName: true,
          customerMobile: true,
          homeDelivery: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
          shop: { select: { shopName: true, slug: true } },
        },
      }),
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, createdAt: { gte: todayStart } } }),
    ])

    return NextResponse.json({ orders, total, todayCount, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
