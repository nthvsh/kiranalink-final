import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0)

    const [totalShops, activeShops, trialShops, expiredShops, todayOrders, totalOrders, totalRevenue] = await Promise.all([
      prisma.shop.count(),
      prisma.shop.count({ where: { isActive: true, subscriptionEndsAt: { gt: now } } }),
      prisma.shop.count({ where: { isActive: true, subscriptionEndsAt: null, trialEndsAt: { gt: now } } }),
      prisma.shop.count({ where: { isActive: false } }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count(),
      prisma.payment.aggregate({ where: { status: 'success' }, _sum: { amount: true } }),
    ])

    return NextResponse.json({
      totalShops,
      activeShops,
      trialShops,
      expiredShops,
      todayOrders,
      totalOrders,
      totalRevenue: Math.floor((totalRevenue._sum.amount || 0) / 100),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
