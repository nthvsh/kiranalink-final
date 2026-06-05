import twilio from 'twilio'

export interface OrderNotificationData {
  shopName: string
  customerName: string
  customerMobile: string
  customerAddress: string
  items: Array<{ name: string; brand?: string; quantity: string; unit?: string }>
  homeDelivery: boolean
  paymentMethod: string
  orderTime: string
}

export function formatOrderMessage(data: OrderNotificationData): string {
  const itemsList = data.items
    .map(item => {
      const brand = item.brand ? `${item.brand} ` : ''
      const unit = item.unit ? ` ${item.unit}` : ''
      return `• ${brand}${item.name}${unit} x${item.quantity}`
    })
    .join('\n')

  const deliveryLine = data.homeDelivery
    ? '🛵 Home Delivery: Haan (+₹30)'
    : '🏪 Pickup: Haan (Shop se lenge)'

  return `🛒 *Naya Order — ${data.shopName}*\n\n👤 Customer: ${data.customerName}\n📍 Address: ${data.customerAddress}\n📞 Mobile: ${data.customerMobile}\n\n📦 *Order List:*\n${itemsList}\n\n${deliveryLine}\n💳 Payment: ${data.paymentMethod}\n🕐 Order Time: ${data.orderTime}\n\n_KiranaLink se bheja gaya_`
}

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    console.log('⚠️ Twilio DEV MODE — missing credentials')
    return null
  }

  return twilio(accountSid, authToken)
}

function formatWhatsAppNumber(number: string): string {
  const digits = number.replace(/\D/g, '')
  const last10 = digits.slice(-10)
  return `whatsapp:+91${last10}`
}

export async function sendWhatsAppOrder(
  shopWhatsapp: string,
  message: string
): Promise<boolean> {
  const client = getTwilioClient()
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM

  const toNumber = formatWhatsAppNumber(shopWhatsapp)

  console.log('📱 Original:', shopWhatsapp)
  console.log('📱 Formatted to:', toNumber)
  console.log('📤 From:', fromNumber)

  if (!client || !fromNumber) {
    console.log('⚠️ Twilio DEV MODE — message would be sent:')
    console.log('To:', toNumber)
    console.log('Message:', message)
    return true
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    })

    console.log('📨 Twilio Message SID:', result.sid)
    console.log('📨 Status:', result.status)

    return !!result.sid
  } catch (error: any) {
    console.error('❌ Twilio send error:', error.message)
    console.error('❌ Error code:', error.code)
    return false
  }
}

export async function sendSubscriptionReminder(
  shopWhatsapp: string,
  shopName: string,
  daysLeft: number
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kiranalink-final.vercel.app'
  
  const message = `⚠️ *${shopName} — Alert!*\n\nAapki shop ki link *${daysLeft} din mein expire* hone wali hai.\n\n❌ Link expire hone par customers order nahi de payenge.\n\n✅ Abhi ₹149 recharge karein — link turant active rahegi.\n\n👉 Recharge karein: ${appUrl}/recharge\n\n_KiranaLink — Aapki Digital Kirana_`
  
  return sendWhatsAppOrder(shopWhatsapp, message)
}