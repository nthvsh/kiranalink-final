export type ItemType = 'packet_only' | 'packet_and_loose'

export interface Brand {
  name: string
}

export interface KiranaItem {
  id: string
  name: string
  nameHindi: string
  type: ItemType
  brands: string[]
}

export interface KiranaCategory {
  id: string
  name: string
  nameHindi: string
  icon: string
  items: KiranaItem[]
}

export const KIRANA_CATEGORIES: KiranaCategory[] = [
  {
    id: 'anaaj-atta',
    name: 'Anaaj & Atta',
    nameHindi: 'अनाज और आटा',
    icon: '🌾',
    items: [
      { id: 'basmati-chawal', name: 'Basmati Chawal', nameHindi: 'बासमती चावल', type: 'packet_and_loose', brands: ['India Gate', 'Daawat', 'Kohinoor', 'Fortune', 'Sona Masoori'] },
      { id: 'sona-masoori-chawal', name: 'Sona Masoori Chawal', nameHindi: 'सोना मसूरी चावल', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'India Gate'] },
      { id: 'gehun-atta', name: 'Gehun Atta', nameHindi: 'गेहूं आटा', type: 'packet_and_loose', brands: ['Aashirvaad', 'Pilsbury', 'Fortune', 'Annapurna', 'Patanjali'] },
      { id: 'maida', name: 'Maida', nameHindi: 'मैदा', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Annapurna'] },
      { id: 'suji-rawa', name: 'Suji / Rawa', nameHindi: 'सूजी / रवा', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Aashirvaad'] },
      { id: 'besan', name: 'Besan', nameHindi: 'बेसन', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Rajdhani', 'Patanjali'] },
      { id: 'poha', name: 'Poha', nameHindi: 'पोहा', type: 'packet_and_loose', brands: ['Local', 'Patanjali', 'Ganesh'] },
      { id: 'sabudana', name: 'Sabudana', nameHindi: 'साबूदाना', type: 'packet_and_loose', brands: ['Local', 'Lion'] },
    ],
  },
  {
    id: 'daalen',
    name: 'Daalein',
    nameHindi: 'दालें',
    icon: '🫘',
    items: [
      { id: 'toor-dal', name: 'Toor Dal', nameHindi: 'तूर दाल', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Tata Sampann', 'Patanjali'] },
      { id: 'moong-dal', name: 'Moong Dal', nameHindi: 'मूंग दाल', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Tata Sampann'] },
      { id: 'masoor-dal', name: 'Masoor Dal', nameHindi: 'मसूर दाल', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Tata Sampann'] },
      { id: 'chana-dal', name: 'Chana Dal', nameHindi: 'चना दाल', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Tata Sampann'] },
      { id: 'urad-dal', name: 'Urad Dal', nameHindi: 'उड़द दाल', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Tata Sampann'] },
      { id: 'rajma', name: 'Rajma', nameHindi: 'राजमा', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Tata Sampann'] },
      { id: 'kala-chana', name: 'Kala Chana', nameHindi: 'काला चना', type: 'packet_and_loose', brands: ['Local', 'Fortune'] },
      { id: 'kabuli-chana', name: 'Kabuli Chana', nameHindi: 'काबुली चना', type: 'packet_and_loose', brands: ['Local', 'Fortune', 'Tata Sampann'] },
    ],
  },
  {
    id: 'tel-ghee',
    name: 'Tel & Ghee',
    nameHindi: 'तेल और घी',
    icon: '🫙',
    items: [
      { id: 'sarson-tel', name: 'Sarson Tel', nameHindi: 'सरसों तेल', type: 'packet_only', brands: ['Dhara', 'Fortune', 'Emami', 'Patanjali', 'Engine'] },
      { id: 'refined-tel', name: 'Refined Tel', nameHindi: 'रिफाइंड तेल', type: 'packet_only', brands: ['Fortune', 'Dhara', 'Sundrop', 'Saffola', 'Patanjali'] },
      { id: 'nariyal-tel', name: 'Nariyal Tel', nameHindi: 'नारियल तेल', type: 'packet_only', brands: ['Parachute', 'Coco', 'KLF Nirmal'] },
      { id: 'vanaspati-ghee', name: 'Vanaspati Ghee', nameHindi: 'वनस्पति घी', type: 'packet_only', brands: ['Dalda', 'Rath', 'Panghat'] },
      { id: 'desi-ghee', name: 'Desi Ghee', nameHindi: 'देसी घी', type: 'packet_only', brands: ['Amul', 'Mother Dairy', 'Patanjali', 'Gowardhan', 'Local'] },
    ],
  },
  {
    id: 'masale-pisa',
    name: 'Masale — Pisa Hua',
    nameHindi: 'मसाले — पिसे हुए',
    icon: '🌶️',
    items: [
      { id: 'haldi', name: 'Haldi Powder', nameHindi: 'हल्दी पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Catch', 'Patanjali', 'Local'] },
      { id: 'lal-mirch', name: 'Lal Mirch Powder', nameHindi: 'लाल मिर्च पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Catch', 'Patanjali', 'Local'] },
      { id: 'dhaniya-powder', name: 'Dhaniya Powder', nameHindi: 'धनिया पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Catch', 'Local'] },
      { id: 'garam-masala', name: 'Garam Masala', nameHindi: 'गरम मसाला', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Catch', 'Patanjali'] },
      { id: 'jeera-powder', name: 'Jeera Powder', nameHindi: 'जीरा पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Catch', 'Local'] },
      { id: 'amchur', name: 'Amchur', nameHindi: 'अमचूर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Catch'] },
      { id: 'sabji-masala', name: 'Sabji Masala', nameHindi: 'सब्जी मसाला', type: 'packet_only', brands: ['MDH', 'Everest', 'Catch', 'Patanjali'] },
      { id: 'chaat-masala', name: 'Chaat Masala', nameHindi: 'चाट मसाला', type: 'packet_only', brands: ['MDH', 'Everest', 'Catch'] },
    ],
  },
  {
    id: 'masale-sabut',
    name: 'Masale — Sabut',
    nameHindi: 'मसाले — साबुत',
    icon: '🌿',
    items: [
      { id: 'jeera', name: 'Jeera (Sabut)', nameHindi: 'जीरा साबुत', type: 'packet_and_loose', brands: ['Local', 'MDH', 'Everest'] },
      { id: 'kali-mirch', name: 'Kali Mirch', nameHindi: 'काली मिर्च', type: 'packet_and_loose', brands: ['Local', 'MDH', 'Everest'] },
      { id: 'laung', name: 'Laung', nameHindi: 'लौंग', type: 'packet_and_loose', brands: ['Local', 'MDH'] },
      { id: 'dalchini', name: 'Dalchini', nameHindi: 'दालचीनी', type: 'packet_and_loose', brands: ['Local', 'MDH'] },
      { id: 'elaichi', name: 'Elaichi', nameHindi: 'इलायची', type: 'packet_and_loose', brands: ['Local', 'MDH'] },
      { id: 'sarson', name: 'Sarson (Rai)', nameHindi: 'सरसों / राई', type: 'packet_and_loose', brands: ['Local'] },
      { id: 'methi-dana', name: 'Methi Dana', nameHindi: 'मेथी दाना', type: 'packet_and_loose', brands: ['Local'] },
      { id: 'ajwain', name: 'Ajwain', nameHindi: 'अजवाइन', type: 'packet_and_loose', brands: ['Local', 'MDH'] },
    ],
  },
  {
    id: 'namak-cheeni',
    name: 'Namak, Cheeni & Misc',
    nameHindi: 'नमक, चीनी और अन्य',
    icon: '🧂',
    items: [
      { id: 'namak', name: 'Namak', nameHindi: 'नमक', type: 'packet_and_loose', brands: ['Tata Salt', 'Catch', 'Annapurna', 'Local'] },
      { id: 'cheeni', name: 'Cheeni', nameHindi: 'चीनी', type: 'packet_and_loose', brands: ['Local', 'Triveni', 'Uttam'] },
      { id: 'gud', name: 'Gud (Jaggery)', nameHindi: 'गुड़', type: 'packet_and_loose', brands: ['Local', 'Patanjali'] },
      { id: 'sirka', name: 'Sirka', nameHindi: 'सिरका', type: 'packet_only', brands: ['Druk', 'Local'] },
      { id: 'imli', name: 'Imli', nameHindi: 'इमली', type: 'packet_and_loose', brands: ['Local'] },
    ],
  },
  {
    id: 'chai-coffee',
    name: 'Chai, Coffee & Drinks',
    nameHindi: 'चाय, कॉफी और पेय',
    icon: '☕',
    items: [
      { id: 'chai-patti', name: 'Chai Patti', nameHindi: 'चाय पत्ती', type: 'packet_and_loose', brands: ['Tata Tea', 'Red Label', 'Taj Mahal', 'Wagh Bakri', 'Patanjali', '3 Roses'] },
      { id: 'coffee', name: 'Coffee', nameHindi: 'कॉफी', type: 'packet_only', brands: ['Nescafe', 'Bru', 'Davidoff', 'Sunrise'] },
      { id: 'horlicks', name: 'Horlicks / Health Drink', nameHindi: 'हॉर्लिक्स', type: 'packet_only', brands: ['Horlicks', 'Boost', 'Complan', 'Milo', 'Protinex'] },
      { id: 'cold-drink', name: 'Cold Drink (Bottle)', nameHindi: 'कोल्ड ड्रिंक', type: 'packet_only', brands: ['Coca Cola', 'Pepsi', 'Sprite', 'Limca', 'Thums Up', 'Fanta', 'Maaza'] },
      { id: 'juice', name: 'Juice', nameHindi: 'जूस', type: 'packet_only', brands: ['Real', 'Tropicana', 'B Natural', 'Paper Boat'] },
      { id: 'water-bottle', name: 'Paani Ki Bottle', nameHindi: 'पानी की बोतल', type: 'packet_only', brands: ['Bisleri', 'Kinley', 'Aquafina', 'Bailley'] },
    ],
  },
  {
    id: 'snacks-biscuit',
    name: 'Snacks & Biscuit',
    nameHindi: 'स्नैक्स और बिस्किट',
    icon: '🍪',
    items: [
      { id: 'parle-g', name: 'Parle-G Biscuit', nameHindi: 'पारले-जी बिस्किट', type: 'packet_only', brands: ['Parle-G'] },
      { id: 'glucose-biscuit', name: 'Glucose Biscuit', nameHindi: 'ग्लूकोज बिस्किट', type: 'packet_only', brands: ['Britannia', 'Parle', 'Sunfeast'] },
      { id: 'cream-biscuit', name: 'Cream Biscuit', nameHindi: 'क्रीम बिस्किट', type: 'packet_only', brands: ['Oreo', 'Hide & Seek', 'Bourbon', '5 Star'] },
      { id: 'namkeen', name: 'Namkeen', nameHindi: 'नमकीन', type: 'packet_and_loose', brands: ['Haldiram', 'Bikanervala', 'Balaji', 'Local'] },
      { id: 'chips', name: 'Chips', nameHindi: 'चिप्स', type: 'packet_only', brands: ["Lay's", 'Kurkure', 'Bingo', 'Uncle Chips'] },
      { id: 'maggi', name: 'Maggi / Noodles', nameHindi: 'मैगी / नूडल्स', type: 'packet_only', brands: ['Maggi', 'Yippee', 'Top Ramen', 'Wai Wai'] },
      { id: 'pasta', name: 'Pasta', nameHindi: 'पास्ता', type: 'packet_and_loose', brands: ['Maggi', 'Borges', 'Smith & Jones', 'Bambino'] },
    ],
  },
  {
    id: 'dry-fruits',
    name: 'Dry Fruits & Nuts',
    nameHindi: 'ड्राई फ्रूट्स और मेवे',
    icon: '🥜',
    items: [
      { id: 'badam', name: 'Badam', nameHindi: 'बादाम', type: 'packet_and_loose', brands: ['California', 'Nutraj', 'Local'] },
      { id: 'kaju', name: 'Kaju', nameHindi: 'काजू', type: 'packet_and_loose', brands: ['Local', 'Nutraj', 'Happilo'] },
      { id: 'kismis', name: 'Kismis', nameHindi: 'किशमिश', type: 'packet_and_loose', brands: ['Local', 'Nutraj'] },
      { id: 'pista', name: 'Pista', nameHindi: 'पिस्ता', type: 'packet_and_loose', brands: ['Local', 'Nutraj', 'Happilo'] },
      { id: 'akhrot', name: 'Akhrot', nameHindi: 'अखरोट', type: 'packet_and_loose', brands: ['Local', 'Nutraj'] },
      { id: 'khajoor', name: 'Khajoor', nameHindi: 'खजूर', type: 'packet_and_loose', brands: ['Local', 'Omani', 'Kimia'] },
      { id: 'mungfali', name: 'Mungfali', nameHindi: 'मूंगफली', type: 'packet_and_loose', brands: ['Local'] },
    ],
  },
  {
    id: 'sabun-shampoo',
    name: 'Sabun & Shampoo',
    nameHindi: 'साबुन और शैम्पू',
    icon: '🧼',
    items: [
      { id: 'nahane-sabun', name: 'Nahane Ka Sabun', nameHindi: 'नहाने का साबुन', type: 'packet_only', brands: ['Lifebuoy', 'Dove', 'Dettol', 'Lux', 'Pears', 'Santoor', 'Hamam'] },
      { id: 'shampoo', name: 'Shampoo', nameHindi: 'शैम्पू', type: 'packet_only', brands: ['Head & Shoulders', 'Pantene', 'Clinic Plus', 'Sunsilk', 'Dove', 'TRESemmé'] },
      { id: 'conditioner', name: 'Conditioner', nameHindi: 'कंडीशनर', type: 'packet_only', brands: ['Pantene', 'Dove', 'TRESemmé', 'Sunsilk'] },
      { id: 'tel-baalon-ka', name: 'Balon Ka Tel', nameHindi: 'बालों का तेल', type: 'packet_only', brands: ['Parachute', 'Bajaj Almond', 'Dabur Amla', 'Vatika'] },
      { id: 'toothpaste', name: 'Toothpaste', nameHindi: 'टूथपेस्ट', type: 'packet_only', brands: ['Colgate', 'Pepsodent', 'Dabur Red', 'Sensodyne', 'Close Up', 'Patanjali'] },
      { id: 'toothbrush', name: 'Toothbrush', nameHindi: 'टूथब्रश', type: 'packet_only', brands: ['Colgate', 'Oral B', 'Pepsodent', 'Sensodyne'] },
    ],
  },
  {
    id: 'detergent-safai',
    name: 'Detergent & Safai',
    nameHindi: 'डिटर्जेंट और सफाई',
    icon: '🧹',
    items: [
      { id: 'kapde-dhone-powder', name: 'Kapde Dhone Ka Powder', nameHindi: 'कपड़े धोने का पाउडर', type: 'packet_only', brands: ['Ariel', 'Surf Excel', 'Tide', 'Wheel', 'Nirma', 'Rin'] },
      { id: 'liquid-detergent', name: 'Liquid Detergent', nameHindi: 'लिक्विड डिटर्जेंट', type: 'packet_only', brands: ['Ariel', 'Surf Excel', 'Ezee'] },
      { id: 'bartan-soap', name: 'Bartan Dhone Ka Sabun', nameHindi: 'बर्तन साबुन', type: 'packet_only', brands: ['Vim', 'Pril', 'Exo', 'Patanjali'] },
      { id: 'phenyl', name: 'Phenyl / Floor Cleaner', nameHindi: 'फिनाइल', type: 'packet_only', brands: ['Lizol', 'Colin', 'Harpic', 'Domex', 'Dettol'] },
      { id: 'pocha-kapda', name: 'Pocha / Kapda', nameHindi: 'पोछा / कपड़ा', type: 'packet_only', brands: ['Local', 'Scotch-Brite'] },
      { id: 'toilet-cleaner', name: 'Toilet Cleaner', nameHindi: 'टॉयलेट क्लीनर', type: 'packet_only', brands: ['Harpic', 'Domex', 'Lizol'] },
    ],
  },
  {
    id: 'dairy',
    name: 'Dairy Products',
    nameHindi: 'डेयरी उत्पाद',
    icon: '🥛',
    items: [
      { id: 'doodh', name: 'Doodh (Milk Pouch)', nameHindi: 'दूध', type: 'packet_only', brands: ['Amul', 'Mother Dairy', 'Saras', 'Local Dairy'] },
      { id: 'dahi', name: 'Dahi (Curd)', nameHindi: 'दही', type: 'packet_only', brands: ['Amul', 'Mother Dairy', 'Nestle', 'Epigamia'] },
      { id: 'paneer', name: 'Paneer', nameHindi: 'पनीर', type: 'packet_only', brands: ['Amul', 'Mother Dairy', 'Local'] },
      { id: 'butter', name: 'Butter / Makhan', nameHindi: 'मक्खन', type: 'packet_only', brands: ['Amul', 'Britannia', 'Mother Dairy'] },
      { id: 'cheese', name: 'Cheese', nameHindi: 'चीज़', type: 'packet_only', brands: ['Amul', 'Britannia', 'Kraft'] },
    ],
  },
  {
    id: 'bread-bakery',
    name: 'Bread & Bakery',
    nameHindi: 'ब्रेड और बेकरी',
    icon: '🍞',
    items: [
      { id: 'bread', name: 'Bread', nameHindi: 'ब्रेड', type: 'packet_only', brands: ['Britannia', 'Modern', 'Harvest Gold', 'Local'] },
      { id: 'pav', name: 'Pav', nameHindi: 'पाव', type: 'packet_only', brands: ['Local Bakery', 'Britannia'] },
      { id: 'rusk', name: 'Rusk', nameHindi: 'रस्क', type: 'packet_only', brands: ['Britannia', 'Parle'] },
      { id: 'cake', name: 'Cake / Snack Cake', nameHindi: 'केक', type: 'packet_only', brands: ['Britannia', 'Parle', 'Monginis'] },
    ],
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    nameHindi: 'बेबी केयर',
    icon: '👶',
    items: [
      { id: 'diaper', name: 'Diaper', nameHindi: 'डायपर', type: 'packet_only', brands: ['Pampers', 'Huggies', 'Mamy Poko', 'Supples'] },
      { id: 'baby-powder', name: 'Baby Powder', nameHindi: 'बेबी पाउडर', type: 'packet_only', brands: ["Johnson's", 'Himalaya', 'Sebamed'] },
      { id: 'baby-soap', name: 'Baby Soap', nameHindi: 'बेबी साबुन', type: 'packet_only', brands: ["Johnson's", 'Himalaya', 'Dove Baby'] },
      { id: 'baby-oil', name: 'Baby Oil / Massage Oil', nameHindi: 'बेबी तेल', type: 'packet_only', brands: ["Johnson's", 'Himalaya', 'Dabur Lal Tail'] },
    ],
  },
  {
    id: 'pooja-samagri',
    name: 'Pooja Samagri',
    nameHindi: 'पूजा सामग्री',
    icon: '🪔',
    items: [
      { id: 'agarbatti', name: 'Agarbatti', nameHindi: 'अगरबत्ती', type: 'packet_only', brands: ['Cycle', 'Hem', 'Patanjali', 'Local'] },
      { id: 'dhoop', name: 'Dhoop', nameHindi: 'धूप', type: 'packet_only', brands: ['Cycle', 'Hem', 'Local'] },
      { id: 'camphor', name: 'Camphor (Kapoor)', nameHindi: 'कपूर', type: 'packet_only', brands: ['Patanjali', 'Local'] },
      { id: 'kumkum', name: 'Kumkum / Sindoor', nameHindi: 'कुमकुम / सिंदूर', type: 'packet_only', brands: ['Patanjali', 'Local'] },
      { id: 'diya', name: 'Diya (Mitti)', nameHindi: 'दीया (मिट्टी)', type: 'packet_only', brands: ['Local'] },
    ],
  },
]

// Loose quantity options
export const LOOSE_QUANTITIES = ['100g', '250g', '500g', '1kg', '2kg', '5kg']

// Packet quantity options  
export const PACKET_QUANTITIES = [1, 2, 3, 4, 5, 6, 10]
