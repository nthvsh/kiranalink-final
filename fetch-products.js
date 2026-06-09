const fs = require('fs');
const path = require('path');

const products = [
  { name: "Head & Shoulders Shampoo", category: "Personal Care", image: "" },
  { name: "Dove Shampoo", category: "Personal Care", image: "" },
  { name: "L'Oreal Paris Shampoo", category: "Personal Care", image: "" },
  { name: "Tresemme Shampoo", category: "Personal Care", image: "" },
  { name: "Clinic Plus Shampoo", category: "Personal Care", image: "" },
  { name: "Dove Soap", category: "Soaps", image: "" },
  { name: "Lux Soap", category: "Soaps", image: "" },
  { name: "Lifebuoy Soap", category: "Soaps", image: "" },
  { name: "Colgate Toothpaste", category: "Oral Care", image: "" },
  { name: "Pepsodent Toothpaste", category: "Oral Care", image: "" },
  { name: "Parachute Hair Oil", category: "Hair Oil", image: "" },
  { name: "Ponds Cream", category: "Skin Care", image: "" }
];

const outputPath = path.join(__dirname, '../public/products.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

console.log(`${products.length} products save ho gaye!`);
console.log(`File: public/products.json`);