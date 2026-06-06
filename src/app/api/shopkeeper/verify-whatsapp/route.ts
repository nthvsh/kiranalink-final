import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeMessage } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json()
    const result = await sendWelcomeMessage(mobile, 'KiranaLink Shop')
    return NextResponse.json({ success: result })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}