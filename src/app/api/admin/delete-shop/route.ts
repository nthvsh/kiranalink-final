import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { mobile, shopId } = await req.json()
    
    if (shopId) {
      await prisma.shop.delete({ where: { id: shopId } })
    } else if (mobile) {
      await prisma.shop.deleteMany({ where: { mobile } })
    } else {
      return NextResponse.json({ error: 'mobile ya shopId chahiye' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, message: 'Shop delete ho gayi' })
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}