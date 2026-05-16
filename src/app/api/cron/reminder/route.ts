import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSubscriptionReminder } from '@/lib/whatsapp'

// Ye route Vercel Cron se call hoga — din mein 2 baar (subah + shaam)
// vercel.json mein set karein: "0 4,13 * * *" (UTC = 9:30 AM + 6:30 PM IST)

export async function GET(req: NextRequest) {
  // Security check — sirf Vercel Cron ya admin call kar sake
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    // Shops jinka subscription 1, 2, ya 3 din mein expire hoga
    const results = { sent: 0, skipped: 0, errors: 0 }

    for (const daysLeft of [3, 2, 1]) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + daysLeft)
      const dayStart = new Date(targetDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(targetDate)
      dayEnd.setHours(23, 59, 59, 999)

      // Shops expiring on this day (trial OR subscription)
      const expiringShops = await prisma.shop.findMany({
        where: {
          isActive: true,
          OR: [
            {
              subscriptionEndsAt: { gte: dayStart, lte: dayEnd },
            },
            {
              subscriptionEndsAt: null,
              trialEndsAt: { gte: dayStart, lte: dayEnd },
            },
          ],
        },
        select: {
          id: true,
          shopName: true,
          whatsapp: true,
        },
      })

      for (const shop of expiringShops) {
        try {
          await sendSubscriptionReminder(shop.whatsapp, shop.shopName, daysLeft)
          results.sent++
          // Small delay to avoid rate limiting
          await new Promise(r => setTimeout(r, 200))
        } catch {
          results.errors++
        }
      }
    }

    // Expired shops — link deactivate karo
    const expiredShops = await prisma.shop.findMany({
      where: {
        isActive: true,
        OR: [
          { subscriptionEndsAt: { lt: now } },
          { subscriptionEndsAt: null, trialEndsAt: { lt: now } },
        ],
      },
      select: { id: true, shopName: true, whatsapp: true },
    })

    if (expiredShops.length > 0) {
      await prisma.shop.updateMany({
        where: { id: { in: expiredShops.map((s: { id: string; shopName: string; whatsapp: string }) => s.id) } },
        data: { isActive: false },
      })

      // Expired notification
      for (const shop of expiredShops) {
        try {
          await sendSubscriptionReminder(shop.whatsapp, shop.shopName, 0)
          await new Promise(r => setTimeout(r, 200))
        } catch { /* silent */ }
      }
    }

    console.log(`Cron complete: ${results.sent} reminders sent, ${expiredShops.length} expired`)

    return NextResponse.json({
      success: true,
      remindersSent: results.sent,
      shopsExpired: expiredShops.length,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
