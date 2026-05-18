import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!await getAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // Har query alag try-catch mein — ek fail ho to baki chale
    const totalShops = await prisma.shop.count().catch(() => 0)
    const activeShops = await prisma.shop.count({
      where: { isActive: true, subscriptionEndsAt: { gt: now } }
    }).catch(() => 0)
    const trialShops = await prisma.shop.count({
      where: { isActive: true, subscriptionEndsAt: null, trialEndsAt: { gt: now } }
    }).catch(() => 0)
    const expiredShops = await prisma.shop.count({
      where: { isActive: false }
    }).catch(() => 0)
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: todayStart } }
    }).catch(() => 0)
    const totalOrders = await prisma.order.count().catch(() => 0)
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'success' },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }))

    return NextResponse.json({
      totalShops,
      activeShops,
      trialShops,
      expiredShops,
      todayOrders,
      totalOrders,
      totalRevenue: Math.floor(((totalRevenue._sum.amount as number) || 0) / 100),
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({
      totalShops: 0,
      activeShops: 0,
      trialShops: 0,
      expiredShops: 0,
      todayOrders: 0,
      totalOrders: 0,
      totalRevenue: 0,
    }, { status: 200 }) // 500 ki jagah 200 — dashboard crash nahi hoga
  }
}
