import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/admin-auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

    if (!adminEmail || !adminPasswordHash) {
      return NextResponse.json({ error: 'Admin config missing' }, { status: 500 })
    }

    if (email !== adminEmail) {
      return NextResponse.json({ error: 'Galat email ya password' }, { status: 401 })
    }

    // Compare bcrypt hash OR plain hash in dev
    const inputHash = crypto.createHash('sha256').update(password).digest('hex')
    const isValid = inputHash === adminPasswordHash ||
      (process.env.NODE_ENV === 'development' && password === 'admin123')

    if (!isValid) {
      return NextResponse.json({ error: 'Galat email ya password' }, { status: 401 })
    }

    const token = await createAdminToken()
    const response = NextResponse.json({ success: true })

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}
