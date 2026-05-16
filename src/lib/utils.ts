import { prisma } from './prisma'

// Generate URL-friendly slug from shop name
export function generateSlug(shopName: string): string {
  return shopName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Make slug unique if duplicate
export async function getUniqueSlug(shopName: string): Promise<string> {
  const baseSlug = generateSlug(shopName)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.shop.findUnique({ where: { slug } })
    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// Check anti-duplicate: same shop name + address + mobile
export async function checkDuplicateShop(
  shopName: string,
  address: string,
  mobile: string
): Promise<boolean> {
  const existing = await prisma.shop.findFirst({
    where: {
      AND: [
        { shopName: { equals: shopName, mode: 'insensitive' } },
        { address: { contains: address.substring(0, 20), mode: 'insensitive' } },
        { mobile },
      ],
    },
  })
  return !!existing
}

// Format time for display (08:00 -> 8:00 AM)
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Format payment method
export function formatPayment(method: string): string {
  const map: Record<string, string> = {
    cash: 'Sirf Cash',
    upi: 'Sirf UPI',
    both: 'Cash + UPI Dono',
  }
  return map[method] || method
}

// Calculate trial end date (30 days from now)
export function getTrialEndDate(): Date {
  const date = new Date()
  date.setDate(date.getDate() + (parseInt(process.env.TRIAL_DAYS || '30')))
  return date
}

// Check if shop subscription is active
export function isShopActive(shop: {
  trialEndsAt: Date
  subscriptionEndsAt: Date | null
  isActive: boolean
}): boolean {
  if (!shop.isActive) return false
  const now = new Date()
  if (now <= shop.trialEndsAt) return true
  if (shop.subscriptionEndsAt && now <= shop.subscriptionEndsAt) return true
  return false
}

// Format order time
export function formatOrderTime(date: Date): string {
  return date.toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
}

// Validate Indian mobile number
export function validateMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile)
}

// Session token for shopkeeper (simple JWT-like)
import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-this'
)

export async function createSessionToken(shopId: string, mobile: string): Promise<string> {
  return await new SignJWT({ shopId, mobile })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function verifySessionToken(
  token: string
): Promise<{ shopId: string; mobile: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { shopId: string; mobile: string }
  } catch {
    return null
  }
}
