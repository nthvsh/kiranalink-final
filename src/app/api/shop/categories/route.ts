import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Step 1: Categories fetch karo with ::text cast
    const categories = await prisma.$queryRawUnsafe`
      SELECT 
        id::text, 
        name, 
        "nameHindi", 
        icon, 
        "sortOrder", 
        "isActive" 
      FROM "Category" 
      WHERE "isActive" = true 
      ORDER BY "sortOrder" ASC
    `

    // Step 2: SubCategories fetch karo with ::text cast
    const subCategories = await prisma.$queryRawUnsafe`
      SELECT 
        id::text, 
        "categoryId"::text, 
        name, 
        "nameHindi", 
        icon, 
        "sortOrder", 
        "isActive"
      FROM "SubCategory"
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC
    `

    // Step 3: Items fetch karo with ::text cast
    const items = await prisma.$queryRawUnsafe`
      SELECT 
        id::text, 
        "categoryId"::text, 
        "subCategoryId"::text, 
        name, 
        "nameHindi", 
        "imageUrl", 
        units, 
        brands, 
        "sortOrder", 
        "isActive"
      FROM "Item"
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC
    `

    // Step 4: Manually nest data
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
      { error: 'Failed to fetch categories', details: String(error) },
      { status: 500 }
    )
  }
}
