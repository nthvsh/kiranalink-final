import { prisma } from './prisma'

// Normalize mobile number — sirf last 10 digits
export function normalizeMobile(mobile: string): string {
  if (!mobile) return ''
  const cleaned = mobile.replace(/\D/g, '')
  if (cleaned.length < 10) return ''
  return cleaned.slice(-10)
}

// Normalize string for slug (Unicode support for Indian languages)
export function normalizeForSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')  // \p{L} for letters, \p{N} for numbers (Unicode)
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Generate URL-friendly slug from shop name
export function generateSlug(shopName: string): string {
  let slug = normalizeForSlug(shopName)
  // Fallback if slug becomes empty
  if (!slug) {
    slug = 'shop-' + Date.now()
  }
  return slug
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
  const normalizedMobile = normalizeMobile(mobile)
  const existing = await prisma.shop.findFirst({
    where: {
      AND: [
        { shopName: { equals: shopName.trim(), mode: 'insensitive' } },
        { address: { contains: address.substring(0, 30), mode: 'insensitive' } },
        { mobile: normalizedMobile },
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
  const trialDays = Number(process.env.TRIAL_DAYS) || 30
  const date = new Date()
  date.setDate(date.getDate() + trialDays)
  return date
}

// Check if shop subscription is active (with 48 hours grace period)
export function isShopActive(shop: {
  trialEndsAt: Date
  subscriptionEndsAt: Date | null
  isActive: boolean
}): boolean {
  if (!shop.isActive) return false
  
  const now = new Date()
  const gracePeriodMs = 48 * 60 * 60 * 1000 // 48 hours grace
  
  // Trial period + grace
  if (now.getTime() <= shop.trialEndsAt.getTime() + gracePeriodMs) return true
  
  // Subscription period + grace
  if (shop.subscriptionEndsAt && now.getTime() <= shop.subscriptionEndsAt.getTime() + gracePeriodMs) return true
  
  return false
}

// Get days remaining until expiry (for reminders)
export function getDaysRemaining(shop: {
  trialEndsAt: Date
  subscriptionEndsAt: Date | null
}): number {
  const now = new Date()
  let expiryDate: Date | null = null
  
  if (now <= shop.trialEndsAt) {
    expiryDate = shop.trialEndsAt
  } else if (shop.subscriptionEndsAt && now <= shop.subscriptionEndsAt) {
    expiryDate = shop.subscriptionEndsAt
  }
  
  if (!expiryDate) return 0
  
  const diffMs = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
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

// Validate Indian mobile number (10 digits, starts with 6-9)
export function validateMobile(mobile: string): boolean {
  const normalized = normalizeMobile(mobile)
  return /^[6-9]\d{9}$/.test(normalized)
}

// Session token for shopkeeper
import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is required in production')
  }
  const secretKey = secret || 'fallback-secret-change-this-for-development-only'
  return new TextEncoder().encode(secretKey)
}

export async function createSessionToken(shopId: string, mobile: string): Promise<string> {
  const normalizedMobile = normalizeMobile(mobile)
  return await new SignJWT({ shopId, mobile: normalizedMobile })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifySessionToken(
  token: string
): Promise<{ shopId: string; mobile: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as { shopId: string; mobile: string }
  } catch {
    return null
  }
}
