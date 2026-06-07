import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        nameHindi: true,
        icon: true,
        categoryId: true,
        isActive: true,
      }
    })
    
    return NextResponse.json({ subCategories })
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategories', subCategories: [] },
      { status: 500 }
    )
  }
}
