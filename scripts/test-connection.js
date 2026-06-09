const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('⏳ Database se connection check ho raha hai...');
  
  try {
    // Pehle dekhte hain kitne products already hain
    const count = await prisma.item.count();
    console.log(`📊 Database mein already ${count} products hain.`);
    
    // Ek test product daalne ki koshish
    const testProduct = await prisma.item.create({
      data: {
        name: "Test Product - " + new Date().getTime(),
        category: "Test Category"
      }
    });
    
    console.log("✅ Connection successful! Test product added:");
    console.log(`   ID: ${testProduct.id}`);
    console.log(`   Name: ${testProduct.name}`);
    
    // Test product delete karte hain (saaf rakhte hain database)
    await prisma.item.delete({ where: { id: testProduct.id } });
    console.log("✅ Test product delete ho gaya.");
    
  } catch (err) {
    console.error("❌ Connection failed!");
    console.error("Error message:", err.message);
    console.log("\n📌 Solution: .env file mein DATABASE_URL check karo");
  } finally {
    await prisma.$disconnect();
  }
}

test();