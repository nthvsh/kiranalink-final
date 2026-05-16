import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { items: true } } },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, nameHindi, icon } = await req.json()
  if (!name || !icon) return NextResponse.json({ error: 'Fields missing' }, { status: 400 })
  const category = await prisma.category.create({
    data: { name, nameHindi: nameHindi || name, icon, sortOrder: 0 },
  })
  return NextResponse.json({ category })
}

export async function PATCH(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...data } = await req.json()
  const category = await prisma.category.update({ where: { id }, data })
  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
