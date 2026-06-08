import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Seedha SQL se fetch karo — Prisma relations ke bina
    const categories = await prisma.$queryRaw`
      SELECT id, name, "nameHindi", icon, "sortOrder", "isActive" 
      FROM "Category" 
      WHERE "isActive" = true 
      ORDER BY "sortOrder" ASC
    `

    const subCategories = await prisma.$queryRaw`
      SELECT id, "categoryId", name, "nameHindi", icon, "sortOrder", "isActive"
      FROM "SubCategory"
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC
    `

    const items = await prisma.$queryRaw`
      SELECT id, "categoryId", "subCategoryId", name, "nameHindi", "imageUrl", units, brands, "sortOrder", "isActive"
      FROM "Item"
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC
    `

    // Manually nest
    const formatted = (categories as any[]).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      nameHindi: cat.nameHindi,
      icon: cat.icon,
      subCategories: (subCategories as any[])
        .filter((sub: any) => sub.categoryId === cat.id)
        .map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          nameHindi: sub.nameHindi,
          icon: sub.icon,
          items: (items as any[])
            .filter((item: any) => item.subCategoryId === sub.id)
            .map((item: any) => ({
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
