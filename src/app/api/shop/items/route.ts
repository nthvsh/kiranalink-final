import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        nameHindi: true,
        imageUrl: true,
        units: true,
        brands: true,
        categoryId: true,
        subCategoryId: true,
        isActive: true,
      }
    })
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items', items: [] },
      { status: 500 }
    )
  }
}
