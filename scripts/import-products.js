const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importProducts() {
  console.log('⏳ Database mein products daal rahe hain...');
  
  const productsPath = path.join(__dirname, '..', 'public', 'blinkit-products.json');
  
  // Check if file exists
  if (!fs.existsSync(productsPath)) {
    console.error('❌ File not found:', productsPath);
    console.log('Pehle scrape-blinkit.js chalao products banane ke liye');
    return;
  }
  
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log(`📦 Total products in file: ${products.length}`);
  
  let count = 0;
  let skipCount = 0;
  
  for (const product of products) {
    try {
      await prisma.item.create({
        data: {
          name: product.name,
          category: product.category,
        }
      });
      count++;
      
      if (count % 100 === 0) {
        console.log(`✓ ${count} products dal diye...`);
      }
      
    } catch (err) {
      if (err.code === 'P2002') {
        skipCount++;
      } else {
        console.log(`❌ Error in ${product.name}:`, err.message);
      }
    }
  }
  
  console.log(`\n✅ Kaam ho gaya!`);
  console.log(`   Naye products: ${count}`);
  console.log(`   Already the: ${skipCount}`);
  console.log(`   Total products: ${products.length}`);
}

importProducts()
  .then(() => {
    console.log('\n🎉 Done! Ab apne system mein products dekh sakte ho');
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error('❌ Import fail ho gaya:', e);
    prisma.$disconnect();
  });