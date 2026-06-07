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

interface CatalogItem {
  id: string
  name: string
  nameHindi: string
  imageUrl: string | null
  units: string[]
  brands: string[]
}

interface CatalogSubCategory {
  id: string
  name: string
  nameHindi: string
  icon: string | null
  items: CatalogItem[]
}

interface CatalogCategory {
  id: string
  name: string
  nameHindi: string
  icon: string
  subCategories: CatalogSubCategory[]
}

interface CartItem {
  itemId: string
  itemName: string
  brand: string
  unit: string
  quantity: string
  unitLabel: string
  imageUrl: string | null
}

export default function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [shop, setShop] = useState<<ShopInfo | null>(null)
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  
  const [cart, setCart] = useState<<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null)
  
  const [selectedBrand, setSelectedBrand] = useState<<Record<string, string>>({})
  const [selectedUnit, setSelectedUnit] = useState<<Record<string, string>>({})
  const [selectedQuantity, setSelectedQuantity] = useState<<Record<string, string>>({})
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  
  const [homeDelivery, setHomeDelivery] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [orderDone, setOrderDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [shopRes, catRes] = await Promise.all([
          fetch(`/api/shop/${slug}`),
          fetch('/api/shop/categories')
        ])
        
        const shopData = await shopRes.json()
        const catData = await catRes.json()
        
        if (shopData.error) {
          setNotFound(true)
        } else {
          setShop(shopData.shop)
        }
        
        if (!catData.error && catData.categories?.length > 0) {
          setCategories(catData.categories)
          setActiveCategory(catData.categories[0].id)
          if (catData.categories[0].subCategories?.length > 0) {
            setActiveSubCategory(catData.categories[0].subCategories[0].id)
          }
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const activeCat = categories.find(c => c.id === activeCategory)
  const activeSubCat = activeCat?.subCategories.find(s => s.id === activeSubCategory)
  const activeItems = activeSubCat?.items || []

  const addToCart = (item: CatalogItem) => {
    const brand = selectedBrand[item.id] || (item.brands?.[0]) || 'Local'
    const unit = selectedUnit[item.id] || (item.units?.[0]) || 'kg'
    const quantity = selectedQuantity[item.id] || '1'
    
    let unitLabel = ''
    if (unit === 'grams') unitLabel = 'g'
    else if (unit === 'kg') unitLabel = 'kg'
    else if (unit === 'packet') unitLabel = 'pkt'
    else unitLabel = 'pc'
    
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
        brand,
        unit,
        quantity,
        unitLabel,
        imageUrl: item.imageUrl,
      }])
    }
    setExpandedItem(null)
    setSelectedQuantity(prev => ({ ...prev, [item.id]: '1' }))
  }

  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }

  const totalItems = cart.reduce((sum, item) => sum + parseFloat(item.quantity), 0)

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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Shop Not Found</h2>
        <p className="text-sm text-gray-500">This shop link is invalid or inactive.</p>
      </div>
    </div>
  )

  if (!shop?.isActive) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl mb-3">⏸️</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Shop Inactive</h2>
        <p className="text-sm text-gray-500">This shop is currently unavailable.</p>
      </div>
    </div>
  )

  if (orderDone) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-sm w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Placed!</h2>
        <p className="text-sm text-gray-500 mb-4">
          Your order has been sent to <strong>{shop?.shopName}</strong>
        </p>
        <button onClick={() => window.location.reload()}
          className="w-full py-3 bg-[#2D6A4F] text-white rounded-xl font-semibold text-sm">
          Place New Order
        </button>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-white">
      {/* Shop Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-[#2D6A4F] rounded-xl flex items-center justify-center text-white text-xl shrink-0">🏪</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{shop.shopName}</h1>
              <p className="text-xs text-gray-500 mt-0.5">📍 {shop.address}</p>
              <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                <span>⏰ {shop.timing}</span>
                <span>📞 {shop.mobile}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Bar */}
      {cart.length > 0 && (
        <div className="sticky top-0 z-30 bg-[#2D6A4F] text-white px-4 py-2 shadow-md">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <span className="text-sm font-semibold">🛒 {cart.length} items</span>
            <button 
              onClick={() => document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs bg-white/20 px-3 py-1 rounded-full"
            >
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* Categories - Horizontal Scroll */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  setActiveSubCategory(cat.subCategories?.[0]?.id || null)
                }}
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] shrink-0 border-b-2 transition-all ${
                  activeCategory === cat.id 
                    ? 'border-[#2D6A4F] text-[#2D6A4F]' 
                    : 'border-transparent text-gray-500'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] font-medium text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* SubCategory Tabs */}
        {activeCat && activeCat.subCategories.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {activeCat.subCategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubCategory(sub.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeSubCategory === sub.id
                      ? 'bg-[#2D6A4F] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items Grid - Blinkit Style */}
        <div className="p-4">
          {activeItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {activeItems.map(item => {
                const isExpanded = expandedItem === item.id
                const inCart = cart.filter(c => c.itemId === item.id)
                
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    {/* Item Image */}
                    <div className="aspect-square bg-gray-50 relative">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">
                          📦
                        </div>
                      )}
                    </div>
                    
                    {/* Item Info */}
                    <div className="p-3">
                      <p className="text-xs font-bold text-gray-900 leading-tight mb-0.5 line-clamp-2">{item.name}</p>
                      <p className="text-[10px] text-gray-400 mb-2">{item.nameHindi}</p>
                      
                      {/* In-cart badges */}
                      {inCart.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {inCart.map((c, i) => (
                            <span key={i} className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                              {c.brand !== 'Local' ? c.brand : ''} {c.quantity}{c.unitLabel}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ADD Button */}
                      {!isExpanded ? (
                        <button
                          onClick={() => setExpandedItem(item.id)}
                          className="w-full py-2 bg-green-50 text-[#2D6A4F] rounded-lg text-xs font-bold border border-[#2D6A4F]"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {/* Brand */}
                          {item.brands && item.brands.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-600 mb-1">Brand:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.brands.map(brand => (
                                  <button
                                    key={brand}
                                    onClick={() => setSelectedBrand(prev => ({ ...prev, [item.id]: brand }))}
                                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                      (selectedBrand[item.id] || item.brands[0]) === brand
                                        ? 'bg-[#2D6A4F] text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {brand}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Unit */}
                          {item.units && item.units.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-600 mb-1">Unit:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.units.map(unit => (
                                  <button
                                    key={unit}
                                    onClick={() => setSelectedUnit(prev => ({ ...prev, [item.id]: unit }))}
                                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                      (selectedUnit[item.id] || item.units[0]) === unit
                                        ? 'bg-[#2D6A4F] text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {unit === 'grams' ? 'g' : unit === 'kg' ? 'kg' : unit === 'packet' ? 'pkt' : 'pc'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quantity */}
                          <div>
                            <p className="text-[10px] font-bold text-gray-600 mb-1">Qty:</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={selectedQuantity[item.id] || '1'}
                                onChange={e => setSelectedQuantity(prev => ({ ...prev, [item.id]: e.target.value }))}
                                className="flex-1 px-2 py-1 bg-gray-50 rounded text-sm text-gray-900 outline-none text-center border border-gray-200"
                              />
                              <span className="text-[10px] text-gray-400">
                                {(selectedUnit[item.id] || item.units?.[0]) === 'grams' ? 'g' :
                                 (selectedUnit[item.id] || item.units?.[0]) === 'kg' ? 'kg' :
                                 (selectedUnit[item.id] || item.units?.[0]) === 'packet' ? 'pkts' : 'pcs'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => setExpandedItem(null)}
                              className="flex-1 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => addToCart(item)}
                              className="flex-1 py-1.5 bg-[#2D6A4F] text-white rounded-lg text-[10px] font-bold"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-gray-400">No items in this category</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        {cart.length > 0 && (
          <div id="cart-section" className="px-4 pb-4">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                <p className="text-sm font-bold text-gray-900">🛒 Your Cart</p>
              </div>
              <div className="divide-y divide-gray-50">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.brand !== 'Local' ? item.brand + ' ' : ''}{item.itemName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} {item.unitLabel}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="text-red-500 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div className="mt-4 bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeDelivery}
                  onChange={e => setHomeDelivery(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#2D6A4F]"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">🛵 Home Delivery?</p>
                  <p className="text-xs text-gray-400">₹30 delivery charge</p>
                </div>
                {homeDelivery && (
                  <span className="ml-auto text-xs bg-green-50 text-green-700 font-bold px-2 py-1 rounded-lg">+₹30</span>
                )}
              </label>
            </div>

            {/* Customer Details */}
            <div className="mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">👤 Your Details</p>
              </div>
              <div className="px-4 py-4 space-y-3">
                {formError && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
                    ⚠️ {formError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                  <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 outline-none focus:border-[#2D6A4F]" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mobile *</label>
                  <input type="tel" maxLength={10} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 outline-none focus:border-[#2D6A4F]" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} placeholder="10 digit mobile number" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
                  <textarea rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 outline-none focus:border-[#2D6A4F] resize-none" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Enter your address" />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-8">
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Items</span>
                  <span className="font-semibold text-gray-900">{totalItems}</span>
                </div>
                {homeDelivery && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="font-semibold text-gray-900">₹30</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-semibold text-gray-900">{shop?.paymentMethod}</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <button onClick={handleConfirmOrder} className="w-full py-3.5 bg-[#2D6A4F] text-white rounded-xl font-bold text-sm">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Confirm Order?</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
              <p><span className="text-gray-500">Name:</span> <strong className="text-gray-900">{customerName}</strong></p>
              <p><span className="text-gray-500">Mobile:</span> <strong className="text-gray-900">{customerMobile}</strong></p>
              <p><span className="text-gray-500">Items:</span> <strong className="text-gray-900">{totalItems}</strong></p>
              {homeDelivery && <p><span className="text-gray-500">Delivery:</span> <strong className="text-gray-900">Yes (+₹30)</strong></p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl font-semibold text-sm">Cancel</button>
              <button onClick={handleFinalOrder} disabled={submitting} className="flex-1 py-3 bg-[#2D6A4F] text-white rounded-xl font-bold text-sm disabled:opacity-60">
                {submitting ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
