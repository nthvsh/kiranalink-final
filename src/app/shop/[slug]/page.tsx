'use client'

import { useEffect, useState, use } from 'react'

interface ShopInfo {
  id: string
  shopName: string
  ownerName: string
  address: string
  mobile: string
  bannerUrl: string | null
  timing: string
  paymentMethod: string
  paymentRaw: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  nameHindi: string
  icon: string
}

interface SubCategory {
  id: string
  name: string
  nameHindi: string
  icon: string | null
}

interface Item {
  id: string
  name: string
  nameHindi: string
  imageUrl: string | null
  units: string[]  // ['grams', 'kg', 'packet', 'piece']
  brands: string[]
  categoryId: string
  subCategoryId: string
}

interface CartItem {
  itemId: string
  itemName: string
  brand: string
  unit: string  // 'grams' | 'kg' | 'packet' | 'piece'
  quantity: string  // user entered value
  unitLabel: string  // for display: 'g', 'kg', 'packet', 'piece'
}

export default function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [shop, setShop] = useState<ShopInfo | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  
  // Selection state for each item
  const [selectedBrand, setSelectedBrand] = useState<Record<string, string>>({})
  const [selectedUnit, setSelectedUnit] = useState<Record<string, string>>({})
  const [selectedQuantity, setSelectedQuantity] = useState<Record<string, string>>({})
  
  const [homeDelivery, setHomeDelivery] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [orderDone, setOrderDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [formError, setFormError] = useState('')

  // Fetch shop and items data
  useEffect(() => {
    async function fetchData() {
      try {
        const shopRes = await fetch(`/api/shop/${slug}`)
        const shopData = await shopRes.json()
        if (shopData.error) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setShop(shopData.shop)

        // Fetch categories, subcategories, items from API
        const [catRes, subCatRes, itemsRes] = await Promise.all([
          fetch('/api/shop/categories'),
          fetch('/api/shop/subcategories'),
          fetch('/api/shop/items')
        ])
        
        const catData = await catRes.json()
        const subCatData = await subCatRes.json()
        const itemsData = await itemsRes.json()
        
        if (!catData.error) setCategories(catData.categories)
        if (!subCatData.error) setSubCategories(subCatData.subCategories)
        if (!itemsData.error) setItems(itemsData.items)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const getItemsBySubCategory = (subCategoryId: string) => {
    return items.filter(item => item.subCategoryId === subCategoryId && item.isActive !== false)
  }

  const getSubCategoriesByCategory = (categoryId: string) => {
    return subCategories.filter(sub => sub.categoryId === categoryId && sub.isActive !== false)
  }

  const addToCart = (item: Item) => {
    const brand = selectedBrand[item.id] || item.brands[0] || 'Local'
    const unit = selectedUnit[item.id] || (item.units[0] || 'kg')
    const quantity = selectedQuantity[item.id] || '1'
    
    let unitLabel = ''
    if (unit === 'grams') unitLabel = 'g'
    else if (unit === 'kg') unitLabel = 'kg'
    else if (unit === 'packet') unitLabel = 'packet'
    else unitLabel = 'piece'
    
    const existingIndex = cart.findIndex(c => 
      c.itemId === item.id && c.brand === brand && c.unit === unit
    )
    
    if (existingIndex >= 0) {
      const newCart = [...cart]
      const newQty = parseFloat(newCart[existingIndex].quantity) + parseFloat(quantity)
      newCart[existingIndex].quantity = String(newQty)
      setCart(newCart)
    } else {
      setCart(prev => [...prev, {
        itemId: item.id,
        itemName: item.name,
        brand: brand,
        unit: unit,
        quantity: quantity,
        unitLabel: unitLabel,
      }])
    }
    setExpandedItem(null)
    // Reset selection for this item
    setSelectedQuantity(prev => ({ ...prev, [item.id]: '1' }))
  }

  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }

  const totalItems = cart.reduce((sum, item) => sum + parseFloat(item.quantity), 0)
  const deliveryCharge = homeDelivery ? 30 : 0

  const handleConfirmOrder = async () => {
    if (!shop) return
    setFormError('')
    if (!customerName.trim()) { setFormError('Apna naam bharein.'); return }
    if (!customerMobile.trim() || !/^[6-9]\d{9}$/.test(customerMobile)) { setFormError('Sahi mobile number bharein.'); return }
    if (!customerAddress.trim()) { setFormError('Apna pata bharein.'); return }
    if (cart.length === 0) { setFormError('Koi item cart mein nahi hai.'); return }
    setShowConfirmModal(true)
  }

  const handleFinalOrder = async () => {
    if (!shop) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          customerName,
          customerMobile,
          customerAddress,
          items: cart.map(c => ({
            name: c.itemName,
            brand: c.brand !== 'Local' ? c.brand : undefined,
            quantity: c.quantity,
            unit: c.unit,
            unitLabel: c.unitLabel,
          })),
          homeDelivery,
          paymentMethod: shop.paymentRaw === 'both' ? 'Cash / UPI' : shop.paymentRaw === 'cash' ? 'Cash on Delivery' : 'UPI',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); setShowConfirmModal(false); return }
      setOrderId(data.orderId)
      setShowConfirmModal(false)
      setOrderDone(true)
    } catch {
      setFormError('Order nahi ho paya. Dobara koshish karein.')
      setShowConfirmModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3 animate-bounce">🛒</div><p className="text-[#5A7A6A] text-sm">Shop load ho rahi hai...</p></div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4">
      <div className="text-center bg-white rounded-2xl p-8 max-w-sm w-full border border-[#E0DDD6]">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="text-lg font-bold text-[#1B3A2F] mb-2">Shop Nahi Mili</h2>
        <p className="text-sm text-[#5A7A6A]">Ye shop link sahi nahi hai ya shop band ho gayi hai.</p>
      </div>
    </div>
  )

  if (!shop?.isActive) return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4">
      <div className="text-center bg-white rounded-2xl p-8 max-w-sm w-full border border-[#E0DDD6]">
        <div className="text-4xl mb-3">⏸️</div>
        <h2 className="text-lg font-bold text-[#1B3A2F] mb-2">Shop Abhi Band Hai</h2>
        <p className="text-sm text-[#5A7A6A]">Shopkeeper ka subscription expire ho gaya hai. Baad mein koshish karein.</p>
      </div>
    </div>
  )

  if (orderDone) return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4 py-8">
      <div className="text-center bg-white rounded-2xl p-8 max-w-sm w-full border border-[#E0DDD6] shadow-sm">
        <div className="w-20 h-20 bg-[#EAF5EE] rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
        <h2 className="text-xl font-bold text-[#1B3A2F] mb-2">Order Ho Gaya!</h2>
        <p className="text-sm text-[#5A7A6A] mb-4 leading-relaxed">
          Aapka order <strong className="text-[#1B3A2F]">{shop?.shopName}</strong> ko mil gaya hai.<br />
          Jaldi taiyar karke {homeDelivery ? 'ghar pahuncha denge' : 'shop par available rahega'}.
        </p>
        <div className="bg-[#F7F4EF] rounded-xl p-3 mb-4">
          <p className="text-xs text-[#7A8C85]">Order ID</p>
          <p className="text-sm font-mono font-bold text-[#1B3A2F]">{orderId.slice(-8).toUpperCase()}</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="w-full py-3 bg-[#2D6A4F] text-white rounded-xl font-semibold text-sm">
          Naya Order Dena Hai
        </button>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#F7F4EF]">

      {/* Shop Header - SAME AS BEFORE */}
      <div className="bg-[#2D6A4F] text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          {shop.bannerUrl && (
            <img src={shop.bannerUrl} alt="Shop banner" className="w-full h-28 object-cover rounded-xl mb-3 opacity-90" />
          )}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">🛒</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold leading-tight">{shop.shopName}</h1>
              <p className="text-xs text-green-100 mt-0.5 truncate">📍 {shop.address}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <p className="text-[10px] text-green-200">Timing</p>
              <p className="text-xs font-semibold leading-tight">{shop.timing}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <p className="text-[10px] text-green-200">Payment</p>
              <p className="text-xs font-semibold leading-tight">{shop.paymentMethod}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <p className="text-[10px] text-green-200">Contact</p>
              <p className="text-xs font-semibold">{shop.mobile}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-3 py-4 pb-40">

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="bg-[#2D6A4F] text-white rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between sticky top-2 z-20 shadow-lg">
            <span className="text-sm font-semibold">🛒 {totalItems} item{totalItems > 1 ? 's' : ''} select hua</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Neeche dekho ↓</span>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl px-4 py-3 mb-4 border border-[#E0DDD6]">
          <p className="text-sm font-bold text-[#1B3A2F] mb-1">📋 Order Kaise Karein?</p>
          <p className="text-xs text-[#5A7A6A] leading-relaxed">Category select karein → Sub-category select karein → Item chunein → Brand, unit aur quantity daalein → "Cart Mein Daalo" press karein → Neeche apna naam/pata bharein → Order Confirm karein</p>
        </div>

        {/* Categories - 2 Level Navigation */}
        {categories.filter(c => c.isActive !== false).map(category => {
          const subCats = getSubCategoriesByCategory(category.id)
          const isCatExpanded = expandedCategory === category.id
          
          return (
            <div key={category.id} className="bg-white rounded-xl border border-[#E0DDD6] mb-3 overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isCatExpanded ? null : category.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-[#1B3A2F]">{category.name}</p>
                    <p className="text-xs text-[#7A8C85]">{subCats.length} sub-categories</p>
                  </div>
                </div>
                <span className="text-[#7A8C85] text-lg">{isCatExpanded ? '▲' : '▼'}</span>
              </button>

              {isCatExpanded && (
                <div className="border-t border-[#F0EDE8] divide-y divide-[#F7F4EF]">
                  {subCats.map(subCat => {
                    const isSubExpanded = expandedSubCategory === subCat.id
                    const subCatItems = getItemsBySubCategory(subCat.id)
                    
                    return (
                      <div key={subCat.id}>
                        <button
                          onClick={() => setExpandedSubCategory(isSubExpanded ? null : subCat.id)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left bg-[#FAFAF8]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{subCat.icon || '📁'}</span>
                            <p className="text-sm font-medium text-[#1B3A2F]">{subCat.name}</p>
                            <span className="text-[10px] text-[#7A8C85]">({subCatItems.length})</span>
                          </div>
                          <span className="text-[#7A8C85] text-sm">{isSubExpanded ? '▲' : '▼'}</span>
                        </button>
                        
                        {isSubExpanded && (
                          <div className="divide-y divide-[#F7F4EF] bg-white">
                            {subCatItems.map(item => {
                              const isItemExpanded = expandedItem === item.id
                              const inCart = cart.filter(c => c.itemId === item.id)
                              
                              return (
                                <div key={item.id} className="px-4 py-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      {item.imageUrl && (
                                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-[#F7F4EF]" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1B3A2F]">{item.name}</p>
                                        <p className="text-[10px] text-[#7A8C85] truncate">{item.nameHindi}</p>
                                        {inCart.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {inCart.map((c, i) => (
                                              <span key={i} className="text-[9px] bg-[#EAF5EE] text-[#1B6B3A] px-1.5 py-0.5 rounded-full">
                                                {c.brand !== 'Local' ? c.brand + ' ' : ''}{c.quantity}{c.unitLabel} ✓
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setExpandedItem(isItemExpanded ? null : item.id)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                                        isItemExpanded ? 'bg-[#F0EDE8] text-[#5A7A6A]' : 'bg-[#2D6A4F] text-white'
                                      }`}
                                    >
                                      {isItemExpanded ? 'Band Karo' : inCart.length > 0 ? '+ Aur' : 'Chunein'}
                                    </button>
                                  </div>

                                  {/* Item Selector */}
                                  {isItemExpanded && (
                                    <div className="mt-3 bg-[#F7F4EF] rounded-xl p-3 space-y-3">
                                      
                                      {/* Brand Selection */}
                                      {item.brands && item.brands.length > 0 && (
                                        <div>
                                          <p className="text-xs font-bold text-[#3D5A50] mb-1.5">Brand Chunein:</p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {item.brands.map(brand => (
                                              <button
                                                key={brand}
                                                onClick={() => setSelectedBrand(prev => ({ ...prev, [item.id]: brand }))}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                  (selectedBrand[item.id] || item.brands[0]) === brand
                                                    ? 'bg-[#2D6A4F] text-white'
                                                    : 'bg-white text-[#3D5A50] border border-[#DDD9D0]'
                                                }`}
                                              >
                                                {brand}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Unit Selection */}
                                      {item.units && item.units.length > 0 && (
                                        <div>
                                          <p className="text-xs font-bold text-[#3D5A50] mb-1.5">Unit Chunein:</p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {item.units.map(unit => {
                                              let label = ''
                                              if (unit === 'grams') label = '⚖️ Grams'
                                              else if (unit === 'kg') label = '🏋️ KG'
                                              else if (unit === 'packet') label = '📦 Packet'
                                              else label = '🔢 Piece'
                                              
                                              return (
                                                <button
                                                  key={unit}
                                                  onClick={() => setSelectedUnit(prev => ({ ...prev, [item.id]: unit }))}
                                                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                    (selectedUnit[item.id] || item.units[0]) === unit
                                                      ? 'bg-[#2D6A4F] text-white'
                                                      : 'bg-white text-[#3D5A50] border border-[#DDD9D0]'
                                                  }`}
                                                >
                                                  {label}
                                                </button>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {/* Quantity - Manual Input */}
                                      <div>
                                        <p className="text-xs font-bold text-[#3D5A50] mb-1.5">
                                          Quantity:
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            value={selectedQuantity[item.id] || '1'}
                                            onChange={e => setSelectedQuantity(prev => ({ ...prev, [item.id]: e.target.value }))}
                                            className="flex-1 px-3 py-2 bg-white border border-[#DDD9D0] rounded-lg text-sm text-[#1B3A2F] outline-none focus:border-[#2D6A4F]"
                                            placeholder="Kitna?"
                                          />
                                          <span className="text-xs text-[#7A8C85]">
                                            {(selectedUnit[item.id] || item.units?.[0] || 'kg') === 'grams' ? 'g' :
                                             (selectedUnit[item.id] || item.units?.[0] || 'kg') === 'kg' ? 'kg' :
                                             (selectedUnit[item.id] || item.units?.[0] || 'kg') === 'packet' ? 'packets' : 'pieces'}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => addToCart(item)}
                                        className="w-full py-2.5 bg-[#2D6A4F] text-white rounded-xl text-sm font-bold"
                                      >
                                        ✓ Cart Mein Daalo
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                            {subCatItems.length === 0 && (
                              <div className="px-4 py-6 text-center text-xs text-[#7A8C85]">
                                Is sub-category mein koi item nahi hai.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {subCats.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-[#7A8C85]">
                      Is category mein koi sub-category nahi hai.
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {categories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[#7A8C85]">Koi category available nahi hai.</p>
          </div>
        )}

        {/* Cart Review */}
        {cart.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E0DDD6] mb-4 overflow-hidden">
            <div className="px-4 py-3 bg-[#F0FAF4] border-b border-[#E0DDD6]">
              <p className="text-sm font-bold text-[#1B3A2F]">🛒 Aapka Cart</p>
            </div>
            <div className="divide-y divide-[#F7F4EF]">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-[#1B3A2F]">
                      {item.brand !== 'Local' ? item.brand + ' ' : ''}{item.itemName}
                    </p>
                    <p className="text-xs text-[#7A8C85]">
                      {item.quantity} {item.unitLabel}{item.unit === 'packet' || item.unit === 'piece' ? (parseFloat(item.quantity) > 1 ? 's' : '') : ''}
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(i)} className="text-[#D85A30] text-xs font-bold ml-2 px-2 py-1 rounded-lg hover:bg-[#FEF0ED]">
                    Hatao
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Option */}
        {cart.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E0DDD6] mb-4 px-4 py-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={homeDelivery}
                onChange={e => setHomeDelivery(e.target.checked)}
                className="w-5 h-5 rounded accent-[#2D6A4F]"
              />
              <div>
                <p className="text-sm font-bold text-[#1B3A2F]">🛵 Home Delivery Chahiye?</p>
                <p className="text-xs text-[#7A8C85]">Tick karein — ₹30 delivery charge lagega</p>
              </div>
              {homeDelivery && (
                <span className="ml-auto text-xs bg-[#EAF5EE] text-[#1B6B3A] font-bold px-2 py-1 rounded-lg">+₹30</span>
              )}
            </label>
          </div>
        )}

        {/* Customer Details */}
        {cart.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E0DDD6] mb-4 overflow-hidden">
            <div className="px-4 py-3 bg-[#F7F4EF] border-b border-[#E0DDD6]">
              <p className="text-sm font-bold text-[#1B3A2F]">👤 Aapki Details</p>
            </div>
            <div className="px-4 py-4 space-y-3">
              {formError && (
                <div className="bg-[#FEF0ED] border border-[#F5C4B3] rounded-xl px-3 py-2.5 text-xs text-[#993C1D] flex gap-2">
                  <span>⚠️</span><span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#3D5A50] mb-1">Aapka Naam <span className="text-[#D85A30]">*</span></label>
                <input className="w-full px-3.5 py-2.5 border-[1.5px] border-[#DDD9D0] rounded-xl text-sm text-[#1B3A2F] bg-[#FAFAF8] outline-none focus:border-[#2D6A4F]" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3D5A50] mb-1">Mobile Number <span className="text-[#D85A30]">*</span></label>
                <input type="tel" maxLength={10} className="w-full px-3.5 py-2.5 border-[1.5px] border-[#DDD9D0] rounded-xl text-sm text-[#1B3A2F] bg-[#FAFAF8] outline-none focus:border-[#2D6A4F]" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3D5A50] mb-1">Ghar Ka Pata <span className="text-[#D85A30]">*</span></label>
                <textarea rows={2} className="w-full px-3.5 py-2.5 border-[1.5px] border-[#DDD9D0] rounded-xl text-sm text-[#1B3A2F] bg-[#FAFAF8] outline-none focus:border-[#2D6A4F] resize-none" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Order Summary + Confirm Button */}
        {cart.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E0DDD6] overflow-hidden mb-4">
            <div className="px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#5A7A6A]">Total Items</span>
                <span className="font-semibold text-[#1B3A2F]">{totalItems}</span>
              </div>
              {homeDelivery && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#5A7A6A]">🛵 Delivery Charge</span>
                  <span className="font-semibold text-[#1B3A2F]">₹30</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-[#F0EDE8] pt-1.5">
                <span className="text-[#5A7A6A]">Payment</span>
                <span className="font-semibold text-[#1B3A2F]">{shop?.paymentMethod}</span>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button onClick={handleConfirmOrder} className="w-full py-4 bg-[#2D6A4F] text-white rounded-xl font-bold text-base">
                ✅ Order Confirm Karein
              </button>
            </div>
          </div>
        )}

        {cart.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">👆</p>
            <p className="text-sm text-[#7A8C85]">Upar se apni zaroorat ki cheezein chunein</p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🛒</div>
              <h3 className="text-lg font-bold text-[#1B3A2F]">Order Confirm Karein?</h3>
            </div>
            <div className="bg-[#F7F4EF] rounded-xl p-3 mb-4 text-sm space-y-1">
              <p><span className="text-[#7A8C85]">Naam:</span> <strong className="text-[#1B3A2F]">{customerName}</strong></p>
              <p><span className="text-[#7A8C85]">Mobile:</span> <strong className="text-[#1B3A2F]">{customerMobile}</strong></p>
              <p><span className="text-[#7A8C85]">Items:</span> <strong className="text-[#1B3A2F]">{totalItems}</strong></p>
              {homeDelivery && <p><span className="text-[#7A8C85]">Delivery:</span> <strong className="text-[#1B3A2F]">Haan (+₹30)</strong></p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 border border-[#DDD9D0] text-[#5A7A6A] rounded-xl font-semibold text-sm">Wapas Jaao</button>
              <button onClick={handleFinalOrder} disabled={submitting} className="flex-1 py-3 bg-[#2D6A4F] text-white rounded-xl font-bold text-sm disabled:opacity-60">
                {submitting ? 'Ho raha hai...' : '✅ Haan, Confirm Karo!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
