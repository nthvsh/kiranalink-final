import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isShopActive, formatOrderTime } from '@/lib/utils'
import { sendWhatsAppOrder, formatOrderMessage } from '@/lib/whatsapp'

// Customer confirmation message
function formatCustomerConfirmationMessage(
  shopName: string,
  customerName: string,
  itemsCount: number,
  homeDelivery: boolean,
  paymentMethod: string
): string {
  const deliveryText = homeDelivery
    ? '🛵 आपका ऑर्डर होम डिलीवरी के लिए कन्फर्म हो गया है। ₹30 डिलीवरी चार्ज जुड़ेगा।'
    : '🏪 आपका ऑर्डर कन्फर्म हो गया है। कृपया शॉप से खुद ले जाएं।'

  return `✅ *ऑर्डर कन्फर्म — ${shopName}*

नमस्ते ${customerName}!

${deliveryText}

📦 कुल आइटम: ${itemsCount}
💳 पेमेंट: ${paymentMethod}

शॉपकीपर जल्द ही आपसे संपर्क करेगा।

_KiranaLink — धन्यवाद!_`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      shopId,
      customerName,
      customerMobile,
      customerAddress,
      items,
      homeDelivery,
      paymentMethod,
    } = body

    // Validation
    if (!shopId || !customerName || !customerMobile || !customerAddress || !items?.length) {
      return NextResponse.json(
        { error: 'Sabhi zaroori details bharein.' },
        { status: 400 }
      )
    }

    // Get shop
    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: 'Shop nahi mili' }, { status: 404 })
    }

    // Check subscription
    if (!isShopActive(shop)) {
      return NextResponse.json(
        { error: 'Is shop ka subscription expire ho gaya hai. Shopkeeper se sampark karein.' },
        { status: 403 }
      )
    }

    const deliveryCharge = homeDelivery ? 30 : 0
    const now = new Date()

    // Save order to DB
    const order = await prisma.order.create({
      data: {
        shopId,
        customerName,
        customerMobile,
        customerAddress,
        items,
        homeDelivery,
        deliveryCharge,
        paymentMethod,
        status: 'new',
        createdAt: now,
      },
    })

    const orderTime = formatOrderTime(now)
    let shopkeeperWhatsappSent = false
    let customerWhatsappSent = false

    // 1. Send WhatsApp to shopkeeper
    console.log('🚀 === SHOPKEEPER WA START ===')
    console.log('🚀 Shop object:', JSON.stringify(shop))
    console.log('🚀 Shop whatsapp field:', shop.whatsapp)
    console.log('🚀 Shop whatsapp type:', typeof shop.whatsapp)
    console.log('🚀 Shop whatsapp empty:', !shop.whatsapp)
    console.log('🚀 Shop mobile field:', shop.mobile)

    const waMessage = formatOrderMessage({
      shopName: shop.shopName,
      customerName,
      customerMobile,
      customerAddress,
      items,
      homeDelivery,
      paymentMethod,
      orderTime,
    })

    console.log('🚀 Message formatted, length:', waMessage.length)

    try {
      shopkeeperWhatsappSent = await sendWhatsAppOrder(shop.whatsapp, waMessage)
      console.log('🚀 === SHOPKEEPER WA END === result:', shopkeeperWhatsappSent)
    } catch (err) {
      console.error('❌ === SHOPKEEPER WA ERROR ===', err)
      shopkeeperWhatsappSent = false
    }

    console.log(`📤 Shopkeeper WA sent: ${shopkeeperWhatsappSent}`)

    // 2. Send WhatsApp confirmation to customer
    console.log('🚀 === CUSTOMER WA START ===')
    
    const customerMessage = formatCustomerConfirmationMessage(
      shop.shopName,
      customerName,
      items.length,
      homeDelivery,
      paymentMethod
    )

    // Customer mobile number normalize
    const customerMobileNormalized = customerMobile.replace(/\D/g, '').slice(-10)
    const customerWhatsappNumber = `91${customerMobileNormalized}`

    console.log('🚀 Customer number:', customerWhatsappNumber)

    try {
      customerWhatsappSent = await sendWhatsAppOrder(customerWhatsappNumber, customerMessage)
      console.log('🚀 === CUSTOMER WA END === result:', customerWhatsappSent)
    } catch (err) {
      console.error('❌ === CUSTOMER WA ERROR ===', err)
      customerWhatsappSent = false
    }

    console.log(`📤 Customer WA sent: ${customerWhatsappSent}`)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      shopkeeperWhatsappSent,
      customerWhatsappSent,
      message: 'Order confirm ho gaya!',
    })
  } catch (error) {
    console.error('❌ Order create error:', error)
    return NextResponse.json(
      { error: 'Order nahi ho paya. Dobara koshish karein.' },
      { status: 500 }
    )
  }
}