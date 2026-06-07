import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                name: true,
                nameHindi: true,
                imageUrl: true,
                units: true,
                brands: true,
                subCategoryId: true,
              }
            }
          }
        }
      }
    })

    // Flatten for frontend — nested structure mein bhejo
    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      nameHindi: cat.nameHindi,
      icon: cat.icon,
      subCategories: cat.subCategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        nameHindi: sub.nameHindi,
        icon: sub.icon,
        items: sub.items.map(item => ({
          id: item.id,
          name: item.name,
          nameHindi: item.nameHindi,
          imageUrl: item.imageUrl,
          units: item.units,
          brands: item.brands,
        }))
      }))
    }))

    return NextResponse.json({ categories: formatted })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', categories: [] },
      { status: 500 }
    )
  }
}
