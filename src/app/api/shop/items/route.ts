import { NextResponse } from 'next/server'

export async function GET() {
  // Ab sab categories API mein aa jata hai
  return NextResponse.json({ 
    message: 'Use /api/shop/categories — sab kuch wahan hai',
    items: [] 
  })
}
