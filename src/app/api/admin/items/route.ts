import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId')
  const subCategoryId = searchParams.get('subCategoryId')

  const items = await prisma.item.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(subCategoryId ? { subCategoryId } : {}),
    },
    orderBy: { sortOrder: 'asc' },
    include: {
      category: { select: { name: true } },
      subCategory: { select: { name: true } },
    },
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { name, nameHindi, categoryId, subCategoryId, units, brands, imageUrl } = await req.json()
  
  if (!name || !categoryId || !subCategoryId || !units) {
    return NextResponse.json({ error: 'Fields missing' }, { status: 400 })
  }

  const item = await prisma.item.create({
    data: {
      name,
      nameHindi: nameHindi || name,
      categoryId,
      subCategoryId,
      imageUrl: imageUrl || null,
      units: units || [],
      brands: brands || [],
      sortOrder: 0,
    },
  })
  return NextResponse.json({ item })
}

export async function PATCH(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id, ...data } = await req.json()
  
  if ('type' in data) delete data.type
  
  const item = await prisma.item.update({ where: { id }, data })
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id } = await req.json()
  await prisma.item.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
