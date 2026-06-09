import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId')

  const subCategories = await prisma.subCategory.findMany({
    where: categoryId ? { categoryId } : {},
    orderBy: { sortOrder: 'asc' },
    include: {
      category: { select: { name: true } },
      _count: { select: { items: true } },
    },
  })
  return NextResponse.json({ subCategories })
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { name, nameHindi, categoryId, icon } = await req.json()
  
  if (!name || !categoryId) {
    return NextResponse.json({ error: 'Name and categoryId required' }, { status: 400 })
  }

  const subCategory = await prisma.subCategory.create({
    data: {
      name,
      nameHindi: nameHindi || name,
      categoryId,
      icon: icon || null,
      sortOrder: 0,
    },
  })
  return NextResponse.json({ subCategory })
}

export async function PATCH(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id, ...data } = await req.json()
  const subCategory = await prisma.subCategory.update({ where: { id }, data })
  return NextResponse.json({ subCategory })
}

export async function DELETE(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id } = await req.json()
  await prisma.subCategory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
