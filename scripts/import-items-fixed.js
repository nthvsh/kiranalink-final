const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importItems() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'blinkit_kirana_dairy_items.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    const items = jsonData.items;

    console.log(`Total: ${items.length} items found\n`);

    let created = 0;
    let skipped = 0;

    for (const item of items) {
      const existing = await prisma.item.findFirst({
        where: { name: item.product_name }
      });

      if (existing) {
        console.log(`⏭️ Skip: ${item.product_name}`);
        skipped++;
        continue;
      }

      await prisma.item.create({
        data: {
          name: item.product_name,
          nameHindi: item.product_name,
          type: item.sub_category,
          brands: [item.brand],
          isActive: true,
          sortOrder: 0,
          categoryId: "089cb949-5ddb-41e4-aba8-303eed259df0"  // ← ये ID तुम्हारी किसी एक category की है
        }
      });

      console.log(`✅ Created: ${item.product_name}`);
      created++;
    }

    console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importItems();