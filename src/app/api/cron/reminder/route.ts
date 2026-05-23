import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppOrder, normalizeMobile } from '@/lib/whatsapp'

// IST timezone helper
function getISTDate(date: Date = new Date()): Date {
  // Convert UTC to IST (+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000
  return new Date(date.getTime() + istOffset)
}

function getStartOfDayIST(date: Date): Date {
  const istDate = getISTDate(date)
  istDate.setHours(0, 0, 0, 0)
  // Convert back to UTC for DB query
  const utcOffset = 5.5 * 60 * 60 * 1000
  return new Date(istDate.getTime() - utcOffset)
}

function getEndOfDayIST(date: Date): Date {
  const istDate = getISTDate(date)
  istDate.setHours(23, 59, 59, 999)
  const utcOffset = 5.5 * 60 * 60 * 1000
  return new Date(istDate.getTime() - utcOffset)
}

// Send with retry
async function sendWithRetry(
  whatsappNumber: string,
  shopName: string,
  daysLeft: number,
  isExpired: boolean = false
): Promise<boolean> {
  const normalizedNumber = normalizeMobile(whatsappNumber)
  if (!normalizedNumber) {
    console.log(`Skipping ${shopName} — invalid whatsapp number`)
    return false
  }

  let message: string
  if (isExpired) {
    message = `❌ *${shopName} — Link Expired!*\n\nAapki shop ki link expire ho gayi hai.\n\n❌ Ab customers order nahi de payenge.\n\n✅ ₹149 recharge karein — link turant active ho jayegi.\n\n👉 Recharge karein: ${process.env.NEXT_PUBLIC_APP_URL}/recharge\n\n_KiranaLink — Aapki Digital Kirana_`
  } else {
    message = `⚠️ *${shopName} — Alert!*\n\nAapki shop ki link *${daysLeft} din mein expire* hone wali hai.\n\n❌ Link expire hone par customers order nahi de payenge.\n\n✅ Abhi ₹149 recharge karein — link turant active rahegi.\n\n👉 Recharge karein: ${process.env.NEXT_PUBLIC_APP_URL}/recharge\n\n_KiranaLink — Aapki Digital Kirana_`
  }

  // Retry up to 2 times
  for (let attempt = 1; attempt <= 2; attempt++) {
    const success = await sendWhatsAppOrder(normalizedNumber, message)
    if (success) return true
    if (attempt === 1) await new Promise(r => setTimeout(r, 1000)) // Wait 1 sec before retry
  }
  return false
}

export async function GET(req: NextRequest) {
  // Security check — sirf Vercel Cron ya admin call kar sake
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (process.env.NODE_ENV === 'production' && !cronSecret) {
    console.error('CRON_SECRET not set in production!')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const nowUTC = new Date()
    const nowIST = getISTDate(nowUTC)
    
    console.log(`Cron started — UTC: ${nowUTC.toISOString()}, IST: ${nowIST.toLocaleString()}`)

    const results = { sent: 0, skipped: 0, errors: 0 }

    // Process 3,2,1 days remaining
    for (const daysLeft of [3, 2, 1]) {
      const targetDateIST = new Date(nowIST)
      targetDateIST.setDate(targetDateIST.getDate() + daysLeft)
      
      const dayStartUTC = getStartOfDayIST(targetDateIST)
      const dayEndUTC = getEndOfDayIST(targetDateIST)

      // Shops expiring on this day
      const expiringShops = await prisma.shop.findMany({
        where: {
          isActive: true,
          OR: [
            {
              subscriptionEndsAt: { gte: dayStartUTC, lte: dayEndUTC },
            },
            {
              subscriptionEndsAt: null,
              trialEndsAt: { gte: dayStartUTC, lte: dayEndUTC },
            },
          ],
        },
        select: {
          id: true,
          shopName: true,
          whatsapp: true,
        },
      })

      console.log(`Day ${daysLeft}: ${expiringShops.length} shops expiring`)

      // Process in batches of 50
      const batchSize = 50
      for (let i = 0; i < expiringShops.length; i += batchSize) {
        const batch = expiringShops.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(async (shop) => {
            try {
              const sent = await sendWithRetry(shop.whatsapp, shop.shopName, daysLeft, false)
              if (sent) {
                results.sent++
                console.log(`Sent reminder to ${shop.shopName} (${daysLeft} days left)`)
              } else {
                results.errors++
                console.error(`Failed to send to ${shop.shopName}`)
              }
            } catch (error) {
              results.errors++
              console.error(`Error sending to ${shop.shopName}:`, error)
            }
          })
        )
        
        // Delay between batches
        if (i + batchSize < expiringShops.length) {
          await new Promise(r => setTimeout(r, 1000))
        }
      }
    }

    // Expired shops — deactivate and notify
    const expiredShops = await prisma.shop.findMany({
      where: {
        isActive: true,
        OR: [
          { subscriptionEndsAt: { lt: nowUTC } },
          { subscriptionEndsAt: null, trialEndsAt: { lt: nowUTC } },
        ],
      },
      select: { id: true, shopName: true, whatsapp: true },
    })

    console.log(`Found ${expiredShops.length} expired shops`)

    if (expiredShops.length > 0) {
      // Process expired in batches
      const batchSize = 50
      for (let i = 0; i < expiredShops.length; i += batchSize) {
        const batch = expiredShops.slice(i, i + batchSize)
        
        await prisma.shop.updateMany({
          where: { id: { in: batch.map(s => s.id) } },
          data: { isActive: false },
        })

        await Promise.all(
          batch.map(async (shop) => {
            const sent = await sendWithRetry(shop.whatsapp, shop.shopName, 0, true)
            if (sent) {
              console.log(`Sent expiry notification to ${shop.shopName}`)
            }
          })
        )
        
        if (i + batchSize < expiredShops.length) {
          await new Promise(r => setTimeout(r, 1000))
        }
      }
    }

    console.log(`Cron complete — Sent: ${results.sent}, Errors: ${results.errors}, Expired: ${expiredShops.length}`)

    return NextResponse.json({
      success: true,
      remindersSent: results.sent,
      reminderErrors: results.errors,
      shopsExpired: expiredShops.length,
      timestamp: nowUTC.toISOString(),
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
