import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 })
    }

    // Fetch all data in parallel
    const [categoriesRes, subCategoriesRes, itemsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/Category?select=*&isActive=eq.true&order=sortOrder.asc`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      }),
      fetch(`${supabaseUrl}/rest/v1/SubCategory?select=*&isActive=eq.true&order=sortOrder.asc`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      }),
      fetch(`${supabaseUrl}/rest/v1/Item?select=*&isActive=eq.true&order=sortOrder.asc`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      })
    ])

    const categories = await categoriesRes.json()
    const subCategories = await subCategoriesRes.json()
    const items = await itemsRes.json()

    // Format nested data
    const formatted = categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      nameHindi: cat.nameHindi,
      icon: cat.icon,
      subCategories: subCategories
        .filter((sub: any) => sub.categoryId === cat.id)
        .map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          nameHindi: sub.nameHindi,
          icon: sub.icon,
          items: items.filter((item: any) => item.subCategoryId === sub.id)
        }))
    }))

    return NextResponse.json({ categories: formatted })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed', details: String(error) }, { status: 500 })
  }
}
