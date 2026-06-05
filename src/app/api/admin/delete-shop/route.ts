import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json()
    
    await prisma.shop.deleteMany({
      where: { mobile }
    })
    
    return NextResponse.json({ success: true, message: 'Shop deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}