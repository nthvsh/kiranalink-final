const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Blinkit ki saari categories (jaise aapne di thi)
const categories = [
  { name: "Vegetables & Fruits", nameHindi: "सब्जियां और फल", icon: "🥬", sortOrder: 1 },
  { name: "Dairy & Breakfast", nameHindi: "डेयरी और नाश्ता", icon: "🥛", sortOrder: 2 },
  { name: "Munchies", nameHindi: "स्नैक्स", icon: "🍿", sortOrder: 3 },
  { name: "Cold Drinks & Juices", nameHindi: "कोल्ड ड्रिंक और जूस", icon: "🥤", sortOrder: 4 },
  { name: "Instant & Frozen Food", nameHindi: "इंस्टेंट और फ्रोजन फूड", icon: "❄️", sortOrder: 5 },
  { name: "Tea, Coffee & Milk Drinks", nameHindi: "चाय, कॉफी और दूध पेय", icon: "☕", sortOrder: 6 },
  { name: "Bakery & Biscuits", nameHindi: "बेकरी और बिस्कुट", icon: "🍪", sortOrder: 7 },
  { name: "Sweet Tooth", nameHindi: "मिठाइयाँ", icon: "🍫", sortOrder: 8 },
  { name: "Atta, Rice & Dal", nameHindi: "आटा, चावल और दाल", icon: "🍚", sortOrder: 9 },
  { name: "Dry Fruits, Masala & Oil", nameHindi: "सूखे मेवे, मसाले और तेल", icon: "🌶️", sortOrder: 10 },
  { name: "Sauces & Spreads", nameHindi: "सॉस और स्प्रेड", icon: "🥫", sortOrder: 11 },
  { name: "Chicken, Meat & Fish", nameHindi: "चिकन, मीट और मछली", icon: "🍗", sortOrder: 12 },
  { name: "Paan Corner", nameHindi: "पान कॉर्नर", icon: "🌿", sortOrder: 13 },
  { name: "Organic & Premium", nameHindi: "ऑर्गेनिक और प्रीमियम", icon: "✨", sortOrder: 14 },
  { name: "Baby Care", nameHindi: "बेबी केयर", icon: "🍼", sortOrder: 15 },
  { name: "Pharma & Wellness", nameHindi: "फार्मा और वेलनेस", icon: "💊", sortOrder: 16 },
  { name: "Cleaning Essentials", nameHindi: "सफाई के सामान", icon: "🧹", sortOrder: 17 },
  { name: "Home Furnishing & Decor", nameHindi: "होम फर्निशिंग", icon: "🛋️", sortOrder: 18 },
  { name: "Personal Care", nameHindi: "पर्सनल केयर", icon: "🧴", sortOrder: 19 },
  { name: "Pet Care", nameHindi: "पेट केयर", icon: "🐕", sortOrder: 20 },
  { name: "Beauty & Cosmetics", nameHindi: "ब्यूटी और कॉस्मेटिक्स", icon: "💄", sortOrder: 21 },
  { name: "Kitchen & Dining", nameHindi: "किचन और डाइनिंग", icon: "🍽️", sortOrder: 22 }
];

// Har category ke liye brands (उदाहरण के लिए)
const categoryBrands = {
  "Personal Care": ["Head & Shoulders", "Dove", "L'Oreal", "Tresemme", "Pantene", "Clinic Plus", "Sunsilk", "Mamaearth", "Garnier", "Ponds"],
  "Beauty & Cosmetics": ["Lakme", "Maybelline", "Nivea", "Ponds", "Garnier", "Lotus", "Himalaya", "Mamaearth", "Plum", "Mcaffeine"],
  "Baby Care": ["Pampers", "Huggies", "MamyPoko", "Johnson's", "Cetaphil", "MeeMee", "Babyhug", "Mothercare"],
  "Dairy & Breakfast": ["Amul", "Mother Dairy", "Nestle", "Britannia", "Epigamia", "Milky Mist", "Verka", "Prabhat"],
  "Atta, Rice & Dal": ["Ashirvaad", "Patanjali", "Fortune", "Nature Fresh", "Tata Sampann", "Daawat", "India Gate", "24 Mantra"],
  "Dry Fruits, Masala & Oil": ["MDH", "Everest", "Badshah", "Catch", "Fortune", "Dhara", "Saffola", "Patanjali"],
  "Cleaning Essentials": ["Surf Excel", "Tide", "Rin", "Comfort", "Harpic", "Lizol", "Dettol", "Colin", "Mr Muscle"]
};

// Default brands for other categories
const defaultBrands = ["Popular", "Premium", "Value", "Best Choice", "Daily Needs", "Fresh", "Pure", "Original", "Quality", "Trust"];

const productTypes = ["packet_only", "packet_and_loose"];
const varieties = ["Regular", "Pack", "Combo", "Value Pack", "Family Pack", "Mini", "Max", "Trial Pack", "Economy", "Premium"];

// Hindi translations for product names
const hindiPrefixes = {
  "Shampoo": "शैम्पू",
  "Soap": "साबुन",
  "Oil": "तेल",
  "Cream": "क्रीम",
  "Lotion": "लोशन",
  "Milk": "दूध",
  "Curd": "दही",
  "Rice": "चावल",
  "Atta": "आटा",
  "Dal": "दाल",
  "Masala": "मसाला",
  "Biscuit": "बिस्कुट",
  "Bread": "ब्रेड",
  "Juice": "जूस"
};

async function importAll() {
  console.log("=" .repeat(60));
  console.log("🚀 BLINKIT PRODUCTS IMPORT - SHURU KARTE HAIN");
  console.log("=" .repeat(60));
  console.log();

  try {
    // ----- STEP 1: Categories create karna -----
    console.log("📁 STEP 1: Categories create ki ja rahi hain...");
    
    const createdCategories = [];
    for (const cat of categories) {
      const existing = await prisma.category.findFirst({
        where: { name: cat.name }
      });
      
      if (!existing) {
        const newCat = await prisma.category.create({
          data: {
            name: cat.name,
            nameHindi: cat.nameHindi,
            icon: cat.icon,
            sortOrder: cat.sortOrder,
            isActive: true
          }
        });
        createdCategories.push(newCat);
        console.log(`   ✅ ${cat.name} (${cat.nameHindi}) - created`);
      } else {
        createdCategories.push(existing);
        console.log(`   ⏭️ ${cat.name} - already exists, skipping`);
      }
    }
    
    console.log(`\n✅ Total categories: ${createdCategories.length}\n`);
    
    // ----- STEP 2: Har category ke liye products create karna -----
    console.log("🛍️ STEP 2: Products create kiye ja rahe hain...");
    console.log("   (Har category mein lagbhag 1500 products banenge)");
    console.log();
    
    let totalProducts = 0;
    const productsPerCategory = 1500; // ~1500 per category × 22 = 33,000 products
    
    for (const category of createdCategories) {
      console.log(`\n📂 ${category.name} category mein products daal rahe hain...`);
      
      // Category-specific brands
      const brands = categoryBrands[category.name] || defaultBrands;
      
      let createdCount = 0;
      
      for (let i = 0; i < productsPerCategory; i++) {
        // Product name generate karna
        const brand = brands[i % brands.length];
        const variety = varieties[i % varieties.length];
        
        let productBase = "";
        if (category.name.includes("Personal Care") || category.name.includes("Beauty")) {
          const types = ["Shampoo", "Conditioner", "Soap", "Face Wash", "Body Lotion", "Cream", "Serum", "Oil"];
          productBase = types[i % types.length];
        } else if (category.name.includes("Dairy")) {
          const types = ["Milk", "Curd", "Butter", "Cheese", "Paneer", "Yogurt", "Lassi", "Buttermilk"];
          productBase = types[i % types.length];
        } else if (category.name.includes("Atta") || category.name.includes("Rice")) {
          const types = ["Whole Wheat Atta", "Basmati Rice", "Brown Rice", "Gram Flour", "Semolina", "Puffed Rice"];
          productBase = types[i % types.length];
        } else {
          productBase = category.name.split(" & ")[0];
        }
        
        const englishName = `${brand} ${productBase} ${variety}`.trim();
        
        // Hindi name generate karna
        let hindiProduct = "";
        for (const [eng, hin] of Object.entries(hindiPrefixes)) {
          if (productBase.includes(eng)) {
            hindiProduct = hin;
            break;
          }
        }
        if (!hindiProduct) {
          hindiProduct = productBase.replace("Shampoo", "शैम्पू").replace("Soap", "साबुन");
        }
        const hindiName = `${brand} ${hindiProduct} ${variety}`.trim();
        
        // Brands array
        const brandsArray = [brand, ...defaultBrands.slice(0, 3)];
        
        // Check if product already exists (by name)
        const existing = await prisma.item.findFirst({
          where: { name: englishName, categoryId: category.id }
        });
        
        if (!existing) {
          await prisma.item.create({
            data: {
              name: englishName,
              nameHindi: hindiName,
              categoryId: category.id,
              type: productTypes[i % productTypes.length],
              brands: brandsArray,
              isActive: true,
              sortOrder: i
            }
          });
          createdCount++;
          totalProducts++;
          
          if (createdCount % 100 === 0) {
            console.log(`      ${createdCount} products ban gaye...`);
          }
        }
      }
      
      console.log(`   ✅ ${category.name}: ${createdCount} naye products bane`);
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("🎉 IMPORT COMPLETE!");
    console.log("=" .repeat(60));
    console.log(`📊 Total categories: ${createdCategories.length}`);
    console.log(`📦 Total products added: ${totalProducts}`);
    console.log("\n✨ Ab aap apne system mein saare products dekh sakte hain!");
    
  } catch (error) {
    console.error("❌ Error aaya:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script chalao
importAll();