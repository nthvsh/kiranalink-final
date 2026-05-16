import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isShopActive, formatOrderTime } from '@/lib/utils'
import { sendWhatsAppOrder, formatOrderMessage } from '@/lib/whatsapp'

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

    // Send WhatsApp to shopkeeper — turant!
    const orderTime = formatOrderTime(now)

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

    // Send async — don't wait (so customer doesn't wait)
    sendWhatsAppOrder(shop.whatsapp, waMessage).catch(err =>
      console.error('WA send failed:', err)
    )

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order confirm ho gaya! Shopkeeper ko WhatsApp par bhej diya gaya.',
    })
  } catch (error) {
    console.error('Order create error:', error)
    return NextResponse.json({ error: 'Order nahi ho paya. Dobara koshish karein.' }, { status: 500 })
  }
}
