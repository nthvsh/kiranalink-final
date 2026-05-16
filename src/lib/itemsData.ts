export interface Brand {
  name: string
}

export interface Item {
  id: string
  name: string
  nameHindi: string
  type: 'packet_only' | 'packet_and_loose'
  brands: string[]
}

export interface Category {
  id: string
  name: string
  nameHindi: string
  icon: string
  items: Item[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'anaaj-atta',
    name: 'Anaaj & Atta',
    nameHindi: 'अनाज & आटा',
    icon: '🌾',
    items: [
      { id: 'basmati-chawal', name: 'Basmati Chawal', nameHindi: 'बासमती चावल', type: 'packet_and_loose', brands: ['India Gate', 'Daawat', 'Kohinoor', 'Fortune', 'Patanjali'] },
      { id: 'sona-masoori', name: 'Sona Masoori Chawal', nameHindi: 'सोना मसूरी चावल', type: 'packet_and_loose', brands: ['Lal Qilla', 'India Gate', 'Swad', 'Local'] },
      { id: 'gehun-atta', name: 'Gehun Atta', nameHindi: 'गेहूं आटा', type: 'packet_and_loose', brands: ['Aashirvaad', 'Pillsbury', 'Fortune', 'Patanjali', 'Shakti Bhog'] },
      { id: 'maida', name: 'Maida', nameHindi: 'मैदा', type: 'packet_and_loose', brands: ['Fortune', 'Patanjali', 'Local', 'Shakti Bhog'] },
      { id: 'suji-rawa', name: 'Suji / Rawa', nameHindi: 'सूजी / रवा', type: 'packet_and_loose', brands: ['Fortune', 'Patanjali', 'Local'] },
      { id: 'besan', name: 'Besan', nameHindi: 'बेसन', type: 'packet_and_loose', brands: ['Fortune', 'Patanjali', 'Rajdhani', 'Local'] },
      { id: 'makka-atta', name: 'Makka Atta', nameHindi: 'मक्का आटा', type: 'packet_and_loose', brands: ['Patanjali', 'Local'] },
      { id: 'jowar-atta', name: 'Jowar Atta', nameHindi: 'ज्वार आटा', type: 'packet_and_loose', brands: ['Patanjali', 'Local'] },
    ]
  },
  {
    id: 'daale',
    name: 'Daalein',
    nameHindi: 'दालें',
    icon: '🫘',
    items: [
      { id: 'toor-dal', name: 'Toor Dal', nameHindi: 'तूर दाल', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Fortune', 'Local'] },
      { id: 'moong-dal', name: 'Moong Dal (Dhuli)', nameHindi: 'मूंग दाल (धुली)', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Local'] },
      { id: 'moong-sabut', name: 'Moong Sabut', nameHindi: 'मूंग साबुत', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Local'] },
      { id: 'masoor-dal', name: 'Masoor Dal', nameHindi: 'मसूर दाल', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Local'] },
      { id: 'chana-dal', name: 'Chana Dal', nameHindi: 'चना दाल', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Local'] },
      { id: 'urad-dal', name: 'Urad Dal (Dhuli)', nameHindi: 'उड़द दाल (धुली)', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Local'] },
      { id: 'urad-sabut', name: 'Urad Sabut', nameHindi: 'उड़द साबुत', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Local'] },
      { id: 'rajma', name: 'Rajma', nameHindi: 'राजमा', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Local'] },
      { id: 'kabuli-chana', name: 'Kabuli Chana', nameHindi: 'काबुली चना', type: 'packet_and_loose', brands: ['Tata Sampann', 'Patanjali', 'Local'] },
      { id: 'kala-chana', name: 'Kala Chana', nameHindi: 'काला चना', type: 'packet_and_loose', brands: ['Patanjali', 'Local'] },
    ]
  },
  {
    id: 'tel-ghee',
    name: 'Tel & Ghee',
    nameHindi: 'तेल & घी',
    icon: '🫙',
    items: [
      { id: 'sarson-tel', name: 'Sarson Tel', nameHindi: 'सरसों तेल', type: 'packet_only', brands: ['Dhara', 'Fortune', 'Patanjali', 'Engine', 'Emami'] },
      { id: 'refined-tel', name: 'Refined Tel (Sunflower)', nameHindi: 'रिफाइंड तेल', type: 'packet_only', brands: ['Fortune', 'Dhara', 'Saffola', 'Sundrop', 'Patanjali'] },
      { id: 'groundnut-tel', name: 'Groundnut Tel', nameHindi: 'मूंगफली तेल', type: 'packet_only', brands: ['Fortune', 'Dhara', 'Patanjali', 'Local'] },
      { id: 'coconut-tel', name: 'Coconut Tel', nameHindi: 'नारियल तेल', type: 'packet_only', brands: ['Parachute', 'Patanjali', 'Coco Soul'] },
      { id: 'desi-ghee', name: 'Desi Ghee', nameHindi: 'देसी घी', type: 'packet_only', brands: ['Amul', 'Patanjali', 'Mother Dairy', 'Gowardhan', 'Nestle'] },
      { id: 'vanaspati', name: 'Vanaspati (Dalda)', nameHindi: 'वनस्पति', type: 'packet_only', brands: ['Dalda', 'Rath', 'Patanjali'] },
    ]
  },
  {
    id: 'masale-pisa',
    name: 'Masale — Pisa Hua',
    nameHindi: 'मसाले — पिसा हुआ',
    icon: '🌶️',
    items: [
      { id: 'haldi', name: 'Haldi Powder', nameHindi: 'हल्दी पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali', 'Catch', 'Local'] },
      { id: 'lal-mirch', name: 'Lal Mirch Powder', nameHindi: 'लाल मिर्च पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali', 'Catch', 'Local'] },
      { id: 'dhaniya', name: 'Dhaniya Powder', nameHindi: 'धनिया पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali', 'Catch', 'Local'] },
      { id: 'jeera-powder', name: 'Jeera Powder', nameHindi: 'जीरा पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali', 'Catch'] },
      { id: 'garam-masala', name: 'Garam Masala', nameHindi: 'गरम मसाला', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali', 'Catch'] },
      { id: 'chaat-masala', name: 'Chaat Masala', nameHindi: 'चाट मसाला', type: 'packet_only', brands: ['MDH', 'Everest', 'Catch'] },
      { id: 'sabzi-masala', name: 'Sabzi Masala', nameHindi: 'सब्जी मसाला', type: 'packet_only', brands: ['MDH', 'Everest', 'Patanjali', 'Catch'] },
      { id: 'rajma-masala', name: 'Rajma Masala', nameHindi: 'राजमा मसाला', type: 'packet_only', brands: ['MDH', 'Everest', 'Patanjali'] },
      { id: 'chicken-masala', name: 'Chicken Masala', nameHindi: 'चिकन मसाला', type: 'packet_only', brands: ['MDH', 'Everest', 'Catch', 'Badshah'] },
      { id: 'amchur', name: 'Amchur Powder', nameHindi: 'आमचूर पाउडर', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali', 'Local'] },
    ]
  },
  {
    id: 'masale-sabut',
    name: 'Masale — Sabut',
    nameHindi: 'मसाले — साबुत',
    icon: '🌿',
    items: [
      { id: 'jeera-sabut', name: 'Jeera (Sabut)', nameHindi: 'जीरा (साबुत)', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali', 'Local'] },
      { id: 'rai', name: 'Rai / Sarson', nameHindi: 'राई / सरसों', type: 'packet_and_loose', brands: ['MDH', 'Patanjali', 'Local'] },
      { id: 'methi-dana', name: 'Methi Dana', nameHindi: 'मेथी दाना', type: 'packet_and_loose', brands: ['MDH', 'Patanjali', 'Local'] },
      { id: 'kali-mirch', name: 'Kali Mirch (Sabut)', nameHindi: 'काली मिर्च (साबुत)', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali'] },
      { id: 'long', name: 'Long (Cloves)', nameHindi: 'लौंग', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali'] },
      { id: 'elaichi', name: 'Elaichi (Choti)', nameHindi: 'इलायची (छोटी)', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Patanjali'] },
      { id: 'dalchini', name: 'Dalchini', nameHindi: 'दालचीनी', type: 'packet_and_loose', brands: ['MDH', 'Everest', 'Local'] },
      { id: 'tejpatta', name: 'Tejpatta', nameHindi: 'तेजपत्ता', type: 'packet_and_loose', brands: ['MDH', 'Patanjali', 'Local'] },
      { id: 'kalonji', name: 'Kalonji', nameHindi: 'कलौंजी', type: 'packet_and_loose', brands: ['MDH', 'Patanjali', 'Local'] },
      { id: 'saunf', name: 'Saunf', nameHindi: 'सौंफ', type: 'packet_and_loose', brands: ['MDH', 'Patanjali', 'Local'] },
      { id: 'ajwain', name: 'Ajwain', nameHindi: 'अजवाइन', type: 'packet_and_loose', brands: ['MDH', 'Patanjali', 'Local'] },
    ]
  },
  {
    id: 'namak-cheeni',
    name: 'Namak, Cheeni & Misc',
    nameHindi: 'नमक, चीनी & अन्य',
    icon: '🧂',
    items: [
      { id: 'namak', name: 'Namak', nameHindi: 'नमक', type: 'packet_and_loose', brands: ['Tata Salt', 'Catch', 'Patanjali', 'Aashirvaad'] },
      { id: 'cheeni', name: 'Cheeni (Chini)', nameHindi: 'चीनी', type: 'packet_and_loose', brands: ['Local/Market', 'Patanjali', 'Uttam'] },
      { id: 'gud', name: 'Gud (Jaggery)', nameHindi: 'गुड़', type: 'packet_and_loose', brands: ['Patanjali', 'Local'] },
      { id: 'sirka', name: 'Sirka (Vinegar)', nameHindi: 'सिरका', type: 'packet_only', brands: ['Patanjali', 'Local'] },
      { id: 'imli', name: 'Imli', nameHindi: 'इमली', type: 'packet_and_loose', brands: ['Local', 'Patanjali'] },
    ]
  },
  {
    id: 'snacks-biscuit',
    name: 'Snacks & Biscuit',
    nameHindi: 'स्नैक्स & बिस्किट',
    icon: '🍪',
    items: [
      { id: 'parle-g', name: 'Parle-G Biscuit', nameHindi: 'पारले-जी बिस्किट', type: 'packet_only', brands: ['Parle-G 56g', 'Parle-G 100g', 'Parle-G 200g', 'Parle-G 400g'] },
      { id: 'britannia-good-day', name: 'Good Day Biscuit', nameHindi: 'गुड डे बिस्किट', type: 'packet_only', brands: ['Good Day Butter', 'Good Day Cashew', 'Good Day Pista-Almond'] },
      { id: 'hide-seek', name: 'Hide & Seek Biscuit', nameHindi: 'हाइड एंड सीक', type: 'packet_only', brands: ['Hide & Seek Original', 'Hide & Seek Fab', 'Hide & Seek Milano'] },
      { id: 'marie-biscuit', name: 'Marie Biscuit', nameHindi: 'मैरी बिस्किट', type: 'packet_only', brands: ['Britannia Marie', 'Parle Marie', 'Patanjali Marie'] },
      { id: 'cream-biscuit', name: 'Cream Biscuit', nameHindi: 'क्रीम बिस्किट', type: 'packet_only', brands: ['Oreo', 'Bourbon', '5 Star Creme', 'Treat'] },
      { id: 'kurkure', name: 'Kurkure / Namkeen', nameHindi: 'कुरकुरे / नमकीन', type: 'packet_only', brands: ['Kurkure Masala Munch', 'Kurkure Green Chutney', 'Lay\'s Classic', 'Lay\'s Magic Masala', 'Bingo', 'Haldiram Namkeen'] },
      { id: 'chips', name: 'Chips', nameHindi: 'चिप्स', type: 'packet_only', brands: ['Lay\'s Classic', 'Lay\'s Magic Masala', 'Pringles Original', 'Bingo Mad Angles', 'Too Yumm'] },
      { id: 'monaco', name: 'Monaco / Cracker', nameHindi: 'मोनाको / क्रेकर', type: 'packet_only', brands: ['Monaco Original', 'Monaco Zeera', 'Unibic Cookies'] },
      { id: 'popcorn', name: 'Popcorn', nameHindi: 'पॉपकॉर्न', type: 'packet_only', brands: ['Act II Butter', 'Act II Masala', 'Bingo Tedhe Medhe'] },
    ]
  },
  {
    id: 'chai-coffee',
    name: 'Chai, Coffee & Drinks',
    nameHindi: 'चाय, कॉफी & ड्रिंक्स',
    icon: '☕',
    items: [
      { id: 'chai-patti', name: 'Chai Patti', nameHindi: 'चाय पत्ती', type: 'packet_and_loose', brands: ['Tata Tea Gold', 'Tata Tea Premium', 'Red Label', 'Wagh Bakri', 'Patanjali', '3 Roses'] },
      { id: 'green-tea', name: 'Green Tea', nameHindi: 'ग्रीन टी', type: 'packet_only', brands: ['Lipton Green', 'Tata Green', 'Tetley Green', 'Organic India'] },
      { id: 'coffee', name: 'Coffee', nameHindi: 'कॉफी', type: 'packet_only', brands: ['Nescafe Classic', 'Bru Original', 'Nescafe Gold', 'Davidoff'] },
      { id: 'horlicks', name: 'Horlicks / Health Drink', nameHindi: 'हॉर्लिक्स', type: 'packet_only', brands: ['Horlicks Original', 'Horlicks Junior', 'Bournvita', 'Complan', 'Boost'] },
      { id: 'cold-drink', name: 'Cold Drink (Bottle)', nameHindi: 'कोल्ड ड्रिंक', type: 'packet_only', brands: ['Coca-Cola 250ml', 'Pepsi 250ml', 'Sprite 250ml', 'Thums Up 250ml', 'Limca 250ml', 'Fanta 250ml', 'Maaza 250ml', '7UP 250ml'] },
      { id: 'juice', name: 'Juice', nameHindi: 'जूस', type: 'packet_only', brands: ['Real Mixed Fruit', 'Real Orange', 'Tropicana', 'Slice Mango', 'B Natural'] },
      { id: 'lassi', name: 'Lassi / Buttermilk', nameHindi: 'लस्सी / छाछ', type: 'packet_only', brands: ['Amul Lassi', 'Mother Dairy Lassi', 'Patanjali Lassi'] },
    ]
  },
  {
    id: 'dairy',
    name: 'Dairy Products',
    nameHindi: 'डेयरी प्रोडक्ट्स',
    icon: '🥛',
    items: [
      { id: 'doodh', name: 'Doodh (Milk)', nameHindi: 'दूध', type: 'packet_only', brands: ['Amul Full Cream 500ml', 'Amul Toned 500ml', 'Mother Dairy 500ml', 'Patanjali 500ml'] },
      { id: 'paneer', name: 'Paneer', nameHindi: 'पनीर', type: 'packet_only', brands: ['Amul Paneer 200g', 'Amul Paneer 500g', 'Mother Dairy Paneer', 'Verka Paneer'] },
      { id: 'dahi', name: 'Dahi (Curd)', nameHindi: 'दही', type: 'packet_only', brands: ['Amul Dahi 200g', 'Amul Dahi 400g', 'Mother Dairy', 'Patanjali'] },
      { id: 'butter', name: 'Butter', nameHindi: 'बटर', type: 'packet_only', brands: ['Amul Butter 100g', 'Amul Butter 500g', 'Mother Dairy Butter', 'Patanjali Butter'] },
      { id: 'cheese', name: 'Cheese Slices', nameHindi: 'चीज़ स्लाइस', type: 'packet_only', brands: ['Amul Cheese Slices', 'Britannia Cheese', 'Go Cheese'] },
    ]
  },
  {
    id: 'sabun-shampoo',
    name: 'Sabun, Shampoo & Personal Care',
    nameHindi: 'साबुन, शैम्पू & पर्सनल केयर',
    icon: '🧴',
    items: [
      { id: 'naha-sabun', name: 'Nahane Ka Sabun', nameHindi: 'नहाने का साबुन', type: 'packet_only', brands: ['Lifebuoy', 'Dove', 'Dettol', 'Lux', 'Pears', 'Santoor', 'Godrej No.1', 'Patanjali'] },
      { id: 'shampoo', name: 'Shampoo', nameHindi: 'शैम्पू', type: 'packet_only', brands: ['Head & Shoulders', 'Pantene', 'Sunsilk', 'Dove Shampoo', 'Clinic Plus', 'Patanjali Kesh Kanti'] },
      { id: 'conditioner', name: 'Conditioner', nameHindi: 'कंडीशनर', type: 'packet_only', brands: ['Pantene Conditioner', 'Dove Conditioner', 'TRESemmé'] },
      { id: 'face-wash', name: 'Face Wash', nameHindi: 'फेस वॉश', type: 'packet_only', brands: ['Himalaya', 'Garnier', 'Nivea', 'Clean & Clear', 'Patanjali'] },
      { id: 'moisturizer', name: 'Moisturizer / Cream', nameHindi: 'मॉइस्चराइज़र', type: 'packet_only', brands: ['Nivea', 'Vaseline', 'Ponds', 'Himalaya', 'Patanjali Moisturizer'] },
      { id: 'deo', name: 'Deodorant', nameHindi: 'डियोडरेंट', type: 'packet_only', brands: ['Axe', 'Dove Deo', 'Old Spice', 'Fogg', 'Engage', 'Wild Stone'] },
      { id: 'toothpaste', name: 'Toothpaste', nameHindi: 'टूथपेस्ट', type: 'packet_only', brands: ['Colgate Strong Teeth', 'Colgate MaxFresh', 'Pepsodent', 'Dabur Red', 'Patanjali Dant Kanti', 'Sensodyne'] },
      { id: 'toothbrush', name: 'Toothbrush', nameHindi: 'टूथब्रश', type: 'packet_only', brands: ['Colgate ZigZag', 'Oral-B', 'Pepsodent', 'Patanjali'] },
      { id: 'razor', name: 'Razor / Shaving', nameHindi: 'रेज़र / शेविंग', type: 'packet_only', brands: ['Gillette Guard', 'Gillette Mach3', '7 O\'Clock', 'Vi-John Shaving Cream'] },
      { id: 'sanitizer', name: 'Hand Sanitizer', nameHindi: 'हैंड सैनिटाइज़र', type: 'packet_only', brands: ['Dettol Sanitizer', 'Lifebuoy Sanitizer', 'Himalaya Sanitizer'] },
    ]
  },
  {
    id: 'detergent',
    name: 'Detergent & Safai Samagri',
    nameHindi: 'डिटर्जेंट & सफाई सामग्री',
    icon: '🧹',
    items: [
      { id: 'kapde-dhona', name: 'Kapde Dhone Ka Powder', nameHindi: 'कपड़े धोने का पाउडर', type: 'packet_only', brands: ['Ariel', 'Surf Excel', 'Tide', 'Wheel', 'Rin', 'Patanjali'] },
      { id: 'liquid-detergent', name: 'Liquid Detergent', nameHindi: 'लिक्विड डिटर्जेंट', type: 'packet_only', brands: ['Surf Excel Liquid', 'Ariel Liquid', 'Comfort'] },
      { id: 'bartan-sabun', name: 'Bartan Dhone Ka Soap', nameHindi: 'बर्तन धोने का साबुन', type: 'packet_only', brands: ['Vim Bar', 'Pril Bar', 'Patanjali Bartan Bar'] },
      { id: 'bartan-liquid', name: 'Bartan Liquid / Gel', nameHindi: 'बर्तन लिक्विड', type: 'packet_only', brands: ['Vim Liquid', 'Pril Liquid', 'Exo Liquid'] },
      { id: 'floor-cleaner', name: 'Floor Cleaner', nameHindi: 'फ्लोर क्लीनर', type: 'packet_only', brands: ['Lizol Citrus', 'Lizol Pine', 'Colin', 'Domex', 'Patanjali'] },
      { id: 'toilet-cleaner', name: 'Toilet Cleaner', nameHindi: 'टॉयलेट क्लीनर', type: 'packet_only', brands: ['Harpic Power Plus', 'Lizol Toilet', 'Domex Toilet'] },
      { id: 'phenol', name: 'Phenol / Disinfectant', nameHindi: 'फिनाइल', type: 'packet_only', brands: ['Dettol Liquid', 'Savlon', 'Local Phenol'] },
      { id: 'pocha-kapda', name: 'Pocha / Mop Cloth', nameHindi: 'पोछा / मॉप', type: 'packet_only', brands: ['Local', 'Scotch-Brite'] },
    ]
  },
  {
    id: 'poha-noodles',
    name: 'Poha, Noodles & Pasta',
    nameHindi: 'पोहा, नूडल्स & पास्ता',
    icon: '🍜',
    items: [
      { id: 'poha', name: 'Poha', nameHindi: 'पोहा', type: 'packet_and_loose', brands: ['Patanjali', 'Local', 'Fortune'] },
      { id: 'sabudana', name: 'Sabudana', nameHindi: 'साबूदाना', type: 'packet_and_loose', brands: ['Patanjali', 'Local'] },
      { id: 'maggi', name: 'Maggi Noodles', nameHindi: 'मैगी नूडल्स', type: 'packet_only', brands: ['Maggi 2-Minute', 'Maggi Masala', 'Maggi Chicken', 'Maggi Oats'] },
      { id: 'top-ramen', name: 'Top Ramen / Yippee', nameHindi: 'टॉप रामेन / यिप्पी', type: 'packet_only', brands: ['Yippee Magic Masala', 'Yippee Mood Masala', 'Top Ramen Masala'] },
      { id: 'pasta', name: 'Pasta', nameHindi: 'पास्ता', type: 'packet_and_loose', brands: ['Barilla', 'Del Monte', 'Patanjali', 'Local'] },
      { id: 'sewai', name: 'Sewai / Vermicelli', nameHindi: 'सेवई', type: 'packet_and_loose', brands: ['Patanjali', 'Bambino', 'Local'] },
    ]
  },
  {
    id: 'dry-fruits',
    name: 'Dry Fruits & Nuts',
    nameHindi: 'ड्राई फ्रूट्स & नट्स',
    icon: '🥜',
    items: [
      { id: 'badam', name: 'Badam (Almonds)', nameHindi: 'बादाम', type: 'packet_and_loose', brands: ['California Almonds', 'Patanjali', 'Happilo', 'Local'] },
      { id: 'kaju', name: 'Kaju (Cashews)', nameHindi: 'काजू', type: 'packet_and_loose', brands: ['W320 Grade', 'Patanjali', 'Happilo', 'Local'] },
      { id: 'kishmish', name: 'Kishmish (Raisins)', nameHindi: 'किशमिश', type: 'packet_and_loose', brands: ['Afghan Green', 'Patanjali', 'Happilo', 'Local'] },
      { id: 'akhrot', name: 'Akhrot (Walnuts)', nameHindi: 'अखरोट', type: 'packet_and_loose', brands: ['Kashmiri Akhrot', 'Patanjali', 'Happilo', 'Local'] },
      { id: 'pista', name: 'Pista (Pistachios)', nameHindi: 'पिस्ता', type: 'packet_and_loose', brands: ['Iranian Pista', 'Patanjali', 'Happilo'] },
      { id: 'chhuara', name: 'Chhuara (Dry Dates)', nameHindi: 'छुहारा', type: 'packet_and_loose', brands: ['Local', 'Patanjali'] },
      { id: 'anjeer', name: 'Anjeer (Figs)', nameHindi: 'अंजीर', type: 'packet_and_loose', brands: ['Afghan Anjeer', 'Patanjali', 'Happilo'] },
      { id: 'mungfali', name: 'Mungfali (Peanuts)', nameHindi: 'मूंगफली', type: 'packet_and_loose', brands: ['Local', 'Patanjali'] },
    ]
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    nameHindi: 'बेबी केयर',
    icon: '👶',
    items: [
      { id: 'diaper', name: 'Diaper', nameHindi: 'डायपर', type: 'packet_only', brands: ['Pampers Small', 'Pampers Medium', 'Pampers Large', 'Huggies Small', 'Huggies Medium', 'MamyPoko'] },
      { id: 'baby-soap', name: 'Baby Soap', nameHindi: 'बेबी साबुन', type: 'packet_only', brands: ['Johnson\'s Baby Soap', 'Dove Baby', 'Himalaya Baby Soap'] },
      { id: 'baby-powder', name: 'Baby Powder', nameHindi: 'बेबी पाउडर', type: 'packet_only', brands: ['Johnson\'s Baby Powder', 'Himalaya Baby Powder', 'Patanjali Baby Powder'] },
      { id: 'baby-oil', name: 'Baby Oil / Massage Oil', nameHindi: 'बेबी ऑयल', type: 'packet_only', brands: ['Johnson\'s Baby Oil', 'Himalaya Baby Oil', 'Dabur Lal Tel'] },
      { id: 'baby-food', name: 'Baby Food / Cerelac', nameHindi: 'बेबी फूड / सेरेलक', type: 'packet_only', brands: ['Cerelac Wheat', 'Cerelac Rice', 'Nestum', 'Farex'] },
    ]
  },
  {
    id: 'pooja-samagri',
    name: 'Pooja Samagri',
    nameHindi: 'पूजा सामग्री',
    icon: '🪔',
    items: [
      { id: 'agarbatti', name: 'Agarbatti', nameHindi: 'अगरबत्ती', type: 'packet_only', brands: ['Cycle Pure', 'Patanjali', 'Mangaldeep', 'Hem', 'HiMedia'] },
      { id: 'camphor', name: 'Camphor / Kapoor', nameHindi: 'कपूर', type: 'packet_only', brands: ['Patanjali', 'Mangaldeep', 'Local'] },
      { id: 'dhoop', name: 'Dhoop Batti / Cone', nameHindi: 'धूप बत्ती', type: 'packet_only', brands: ['Cycle Pure', 'Patanjali', 'Mangaldeep'] },
      { id: 'roli-kumkum', name: 'Roli / Kumkum', nameHindi: 'रोली / कुमकुम', type: 'packet_only', brands: ['Local', 'Patanjali'] },
      { id: 'haldi-pooja', name: 'Haldi (Pooja)', nameHindi: 'हल्दी (पूजा)', type: 'packet_only', brands: ['Patanjali', 'Local'] },
      { id: 'diya-batti', name: 'Diya / Batti (Wicks)', nameHindi: 'दीया / बत्ती', type: 'packet_only', brands: ['Local'] },
    ]
  },
  {
    id: 'bread-bakery',
    name: 'Bread & Bakery',
    nameHindi: 'ब्रेड & बेकरी',
    icon: '🍞',
    items: [
      { id: 'bread', name: 'Bread', nameHindi: 'ब्रेड', type: 'packet_only', brands: ['Britannia Bread', 'Harvest Gold', 'Modern Bread', 'Local Bakery'] },
      { id: 'pav', name: 'Pav Bread', nameHindi: 'पाव', type: 'packet_only', brands: ['Britannia Pav', 'Local Bakery'] },
      { id: 'rusk', name: 'Rusk / Toast', nameHindi: 'रस्क / टोस्ट', type: 'packet_only', brands: ['Britannia Rusk', 'Elite Rusk', 'Patanjali Rusk'] },
      { id: 'khari', name: 'Khari Biscuit', nameHindi: 'खारी बिस्किट', type: 'packet_only', brands: ['Local Bakery', 'Parle'] },
    ]
  },
]

// Loose quantity options
export const LOOSE_QUANTITIES = ['100g', '250g', '500g', '1kg', '2kg', '5kg']

// Packet quantity options (count)
export const PACKET_QUANTITIES = [1, 2, 3, 4, 5, 6, 10, 12]
