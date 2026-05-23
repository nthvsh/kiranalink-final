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

export async function sendWhatsAppOrder(
  shopWhatsapp: string,
  message: string
): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  // Normalize number — sirf last 10 digits
  const normalized = shopWhatsapp.replace(/\D/g, '').slice(-10)
  const toNumber = `91${normalized}`

  console.log('📱 Original:', shopWhatsapp)
  console.log('📱 Normalized to:', toNumber)

  if (!accessToken || !phoneNumberId) {
    console.log('⚠️ WhatsApp DEV MODE — missing credentials')
    console.log('Message would be sent:', message)
    return true
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: toNumber,
          type: 'text',
          text: { body: message },
        }),
      }
    )

    const data = await response.json()
    console.log('📨 Meta Response:', JSON.stringify(data))

    if (data.error) {
      console.error('❌ Meta API Error:', data.error)
      return false
    }

    return !!data.messages?.[0]?.id
  } catch (error) {
    console.error('❌ WhatsApp send error:', error)
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
