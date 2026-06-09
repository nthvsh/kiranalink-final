const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importItems() {
  try {
    console.log('============================================================');
    console.log('🚀 ITEMS IMPORT - SHURU KARTE HAIN');
    console.log('============================================================\n');

    // JSON file read karo
    const dataPath = path.join(__dirname, '..', 'data', 'blinkit_kirana_dairy_items.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    const items = jsonData.items;
    console.log(`📦 Total items found in JSON: ${items.length}\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      // Check if item already exists
      const existing = await prisma.item.findFirst({
        where: {
          name: item.product_name,
          AND: {
            unit: item.unit
          }
        }
      });

      if (existing) {
        console.log(`   ⏭️ Skipping (already exists): ${item.product_name}`);
        skippedCount++;
        continue;
      }

      // Category find karo (main_category se match karo)
      let category = await prisma.category.findFirst({
        where: {
          name: {
            contains: item.main_category.split(' - ')[0] // "Dairy" ya "Grocery"
          }
        }
      });

      // Agar category nahi mili to default "Grocery" le lo
      if (!category) {
        category = await prisma.category.findFirst({
          where: { name: { contains: 'Grocery' } }
        });
      }

      // Create item
      await prisma.item.create({
        data: {
          name: item.product_name,
          description: `${item.brand} ${item.product_name} - ${item.unit}`,
          price: item.price_inr,
          mrp: item.price_inr,
          unit: item.unit,
          stock: item.in_stock ? 100 : 0,
          image: null,
          brand: item.brand,
          categoryId: category?.id || 1,
          shopId: 1, // Assuming shop with id 1 exists
        }
      });

      console.log(`   ✅ Created: ${item.product_name} (₹${item.price_inr})`);
      createdCount++;
    }

    console.log('\n============================================================');
    console.log(`✅ IMPORT COMPLETE!`);
    console.log(`   📝 Created: ${createdCount} items`);
    console.log(`   ⏭️ Skipped: ${skippedCount} items`);
    console.log(`   📦 Total: ${items.length} items`);
    console.log('============================================================');

  } catch (error) {
    console.error('❌ Error aaya:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importItems();