// WhatsApp service - Twilio integration

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

  return `🛒 *Naya Order — ${data.shopName}*

👤 Customer: ${data.customerName}
📍 Address: ${data.customerAddress}
📞 Mobile: ${data.customerMobile}

📦 *Order List:*
${itemsList}

${deliveryLine}
💳 Payment: ${data.paymentMethod}
🕐 Order Time: ${data.orderTime}

_KiranaLink se bheja gaya_`
}

export async function sendWhatsAppOrder(
  shopWhatsapp: string,
  message: string
): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM

  if (!accountSid || !authToken) {
    console.log('WhatsApp DEV MODE — message:')
    console.log(message)
    return true
  }

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from || 'whatsapp:+14155238886',
          To: `whatsapp:+91${shopWhatsapp}`,
          Body: message,
        }),
      }
    )

    const data = await response.json()
    console.log('Twilio response:', data.sid)
    return !!data.sid
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return false
  }
}

export async function sendSubscriptionReminder(
  shopWhatsapp: string,
  shopName: string,
  daysLeft: number
): Promise<boolean> {
  const message = `⚠️ *${shopName} — Alert!*

Aapki shop ki link *${daysLeft} din mein expire* hone wali hai.

❌ Link expire hone par customers order nahi de payenge.

✅ Abhi ₹149 recharge karein — link turant active rahegi.

👉 Recharge karein: ${process.env.NEXT_PUBLIC_APP_URL}/recharge

_KiranaLink — Aapki Digital Kirana_`

  return sendWhatsAppOrder(shopWhatsapp, message)
}
