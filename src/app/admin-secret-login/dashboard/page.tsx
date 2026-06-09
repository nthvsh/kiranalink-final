'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────
interface Stats {
  totalShops: number; activeShops: number; trialShops: number
  expiredShops: number; todayOrders: number; totalOrders: number; totalRevenue: number
}
interface Shop {
  id: string; shopName: string; ownerName: string; mobile: string
  address: string; isActive: boolean; subscriptionStatus: string
  daysLeft: number; totalOrders: number; createdAt: string
}
interface Order {
  id: string; customerName: string; customerMobile: string
  homeDelivery: boolean; paymentMethod: string; status: string
  createdAt: string; shop: { shopName: string; slug: string }
}
interface Category {
  id: string; name: string; nameHindi: string; icon: string
  isActive: boolean; _count: { items: number }
}
interface SubCategory {
  id: string; name: string; nameHindi: string; icon?: string
  isActive: boolean; categoryId: string
}
interface Item {
  id: string; name: string; nameHindi: string
  units: string[]; brands: string[]; imageUrl?: string
  isActive: boolean; category: { name: string }
  subCategory: { name: string }
  categoryId: string; subCategoryId: string
}

type Section = 'dashboard' | 'shops' | 'payments' | 'orders' | 'items'

// ─── Helpers ─────────────────────────────────────────
const statusBadge = (status: string, daysLeft: number) => {
  if (status === 'paid') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-900/40 text-green-400">✅ Paid ({daysLeft}d)</span>
  if (status === 'trial') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/40 text-blue-400">🆓 Trial ({daysLeft}d)</span>
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/40 text-red-400">❌ Expired</span>
}

const fmt = (d: string) => new Date(d).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })

const UNIT_OPTIONS = [
  { value: 'grams', label: '⚖️ Grams' },
  { value: 'kg', label: '🏋️ KG' },
  { value: 'packet', label: '📦 Packet' },
  { value: 'piece', label: '🔢 Piece' },
]

// ─── Main Component ───────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const [section, setSection] = useState<Section>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [filteredSubCats, setFilteredSubCats] = useState<SubCategory[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [shopSearch, setShopSearch] = useState('')
  const [shopStatus, setShopStatus] = useState('all')
  const [selCategory, setSelCategory] = useState('')
  const [selSubCategory, setSelSubCategory] = useState('')
  const [showItemModal, setShowItemModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showSubCatModal, setShowSubCatModal] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [newItem, setNewItem] = useState({
    name: '', nameHindi: '', categoryId: '', subCategoryId: '',
    units: [] as string[], brands: '', imageUrl: ''
  })
  const [newCat, setNewCat] = useState({ name: '', nameHindi: '', icon: '' })
  const [newSubCat, setNewSubCat] = useState({ name: '', nameHindi: '', icon: '', categoryId: '' })
  const [msg, setMsg] = useState('')

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const load = useCallback(async (s: Section) => {
    setLoading(true)
    try {
      if (s === 'dashboard') {
        const r = await fetch('/api/admin/stats'); const d = await r.json()
        if (d.error) { router.push('/admin-secret-login'); return }
        setStats(d)
      } else if (s === 'shops' || s === 'payments') {
        const r = await fetch(`/api/admin/shops?search=${shopSearch}&status=${shopStatus}`)
        const d = await r.json(); if (!d.error) setShops(d.shops)
      } else if (s === 'orders') {
        const r = await fetch('/api/admin/orders'); const d = await r.json()
        if (!d.error) setOrders(d.orders)
      } else if (s === 'items') {
        const [cr, sr, ir] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/subcategories'),
          fetch(`/api/admin/items${selSubCategory ? `?subCategoryId=${selSubCategory}` : selCategory ? `?categoryId=${selCategory}` : ''}`)
        ])
        const [cd, sd, id] = await Promise.all([cr.json(), sr.json(), ir.json()])
        if (!cd.error) setCategories(cd.categories)
        if (!sd.error) setSubCategories(sd.subCategories)
        if (!id.error) setItems(id.items)
      }
    } finally { setLoading(false) }
  }, [shopSearch, shopStatus, selCategory, selSubCategory, router])

  useEffect(() => { load(section) }, [section, load])

  // Filter subcategories when category changes
  useEffect(() => {
    if (selCategory) {
      setFilteredSubCats(subCategories.filter(s => s.categoryId === selCategory))
      setSelSubCategory('')
    } else {
      setFilteredSubCats([])
      setSelSubCategory('')
    }
  }, [selCategory, subCategories])

  const toggleShop = async (shopId: string, isActive: boolean) => {
    await fetch('/api/admin/shops', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shopId, isActive }) })
    flash(isActive ? '✅ Shop active kar di' : '❌ Shop band kar di')
    load('shops')
  }

  const deleteShop = async (shopId: string, shopName: string) => {
    if (!confirm(`⚠️ "${shopName}" delete karein? Ye action undo nahi ho sakta!`)) return
    await fetch('/api/admin/delete-shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopId })
    })
    flash('🗑️ Shop delete ho gayi')
    load('shops')
  }

  const toggleUnit = (unit: string) => {
    setNewItem(p => ({
      ...p,
      units: p.units.includes(unit) ? p.units.filter(u => u !== unit) : [...p.units, unit]
    }))
  }

  const saveItem = async () => {
    const brandsArr = newItem.brands.split(',').map(b => b.trim()).filter(Boolean)
    const method = editItem ? 'PATCH' : 'POST'
    const body = editItem
      ? {
          id: editItem.id, name: newItem.name, nameHindi: newItem.nameHindi,
          units: newItem.units, brands: brandsArr, imageUrl: newItem.imageUrl || null
        }
      : {
          name: newItem.name, nameHindi: newItem.nameHindi,
          categoryId: newItem.categoryId, subCategoryId: newItem.subCategoryId,
          units: newItem.units, brands: brandsArr, imageUrl: newItem.imageUrl || null
        }
    await fetch('/api/admin/items', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    flash(editItem ? '✅ Item update ho gayi' : '✅ Item add ho gayi')
    setShowItemModal(false); setEditItem(null)
    setNewItem({ name: '', nameHindi: '', categoryId: '', subCategoryId: '', units: [], brands: '', imageUrl: '' })
    load('items')
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Item delete karein?')) return
    await fetch('/api/admin/items', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    flash('🗑️ Item delete ho gayi'); load('items')
  }

  const saveCat = async () => {
    await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCat) })
    flash('✅ Category add ho gayi'); setShowCatModal(false)
    setNewCat({ name: '', nameHindi: '', icon: '' }); load('items')
  }

  const saveSubCat = async () => {
    await fetch('/api/admin/subcategories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSubCat) })
    flash('✅ Sub-Category add ho gayi'); setShowSubCatModal(false)
    setNewSubCat({ name: '', nameHindi: '', icon: '', categoryId: '' }); load('items')
  }

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin-secret-login')
  }

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'shops', label: 'Shopkeepers', icon: '🏪' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'items', label: 'Items', icon: '🛒' },
  ]

  return (
    <div className="min-h-screen bg-[#0d1117] flex">

      {/* Sidebar */}
      <aside className="w-56 bg-[#161b22] border-r border-[#30363d] flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-[#30363d]">
          <div className="text-xl mb-0.5">🛒</div>
          <p className="text-sm font-bold text-white">KiranaLink</p>
          <p className="text-[10px] text-[#8b949e]">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setSection(n.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${section === n.id ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'}`}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#30363d]">
          <button onClick={logout} className="w-full px-3 py-2 text-xs text-[#8b949e] hover:text-red-400 rounded-lg hover:bg-[#21262d] transition-colors text-left">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold text-white capitalize">{section === 'dashboard' ? '📊 Dashboard Overview' : navItems.find(n => n.id === section)?.icon + ' ' + navItems.find(n => n.id === section)?.label}</h1>
          {msg && <span className="text-xs bg-green-900/40 text-green-400 px-3 py-1 rounded-full border border-green-800">{msg}</span>}
          {loading && <span className="text-xs text-[#8b949e]">Loading...</span>}
        </div>

        <div className="p-6">

          {/* ═══ SECTION 1: DASHBOARD ═══ */}
          {section === 'dashboard' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Shops', value: stats.totalShops, icon: '🏪' },
                  { label: 'Active (Paid)', value: stats.activeShops, icon: '✅' },
                  { label: 'Free Trial', value: stats.trialShops, icon: '🆓' },
                  { label: 'Expired', value: stats.expiredShops, icon: '❌' },
                ].map(card => (
                  <div key={card.label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                    <p className="text-2xl mb-1">{card.icon}</p>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-[#8b949e] mt-0.5">{card.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <p className="text-3xl mb-1">📦</p>
                  <p className="text-2xl font-bold text-white">{stats.todayOrders}</p>
                  <p className="text-xs text-[#8b949e]">Aaj ke Orders</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <p className="text-3xl mb-1">📈</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                  <p className="text-xs text-[#8b949e]">Total Orders (Sabhi)</p>
                </div>
                <div className="bg-[#161b22] border border-[#1f6feb] rounded-xl p-4 bg-gradient-to-br from-[#161b22] to-[#0d2040]">
                  <p className="text-3xl mb-1">💰</p>
                  <p className="text-2xl font-bold text-[#58a6ff]">₹{stats.totalRevenue.toLocaleString('hi-IN')}</p>
                  <p className="text-xs text-[#8b949e]">Total Revenue</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SECTION 2: SHOPKEEPERS ═══ */}
          {section === 'shops' && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <input
                  className="flex-1 min-w-48 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb] placeholder:text-[#4a5568]"
                  placeholder="🔍 Shop naam, mobile..."
                  value={shopSearch}
                  onChange={e => { setShopSearch(e.target.value); load('shops') }}
                />
                <select
                  className="px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-white outline-none"
                  value={shopStatus}
                  onChange={e => { setShopStatus(e.target.value); load('shops') }}>
                  <option value="all">Sabhi</option>
                  <option value="active">Active (Paid)</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#30363d] bg-[#21262d]">
                    <tr>
                      {['Shop', 'Owner / Mobile', 'Status', 'Orders', 'Joined', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8b949e]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {shops.map(shop => (
                      <tr key={shop.id} className="hover:bg-[#21262d] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white text-xs">{shop.shopName}</p>
                          <p className="text-[10px] text-[#6e7681] truncate max-w-32">{shop.address}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#c9d1d9]">{shop.ownerName}</p>
                          <p className="text-[10px] text-[#8b949e]">{shop.mobile}</p>
                        </td>
                        <td className="px-4 py-3">{statusBadge(shop.subscriptionStatus, shop.daysLeft)}</td>
                        <td className="px-4 py-3 text-xs text-[#c9d1d9] font-medium">{shop.totalOrders}</td>
                        <td className="px-4 py-3 text-[10px] text-[#8b949e]">{fmt(shop.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => toggleShop(shop.id, !shop.isActive)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${shop.isActive ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}`}>
                              {shop.isActive ? 'Band Karo' : 'Active Karo'}
                            </button>
                            <button onClick={() => deleteShop(shop.id, shop.shopName)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors">
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {shops.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#8b949e]">Koi shop nahi mili</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ SECTION 3: PAYMENTS ═══ */}
          {section === 'payments' && (
            <div className="space-y-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#30363d] bg-[#21262d]">
                    <tr>
                      {['Shop', 'Owner / Mobile', 'Subscription Status', 'Days Left', 'Total Orders'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8b949e]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {shops.map(shop => (
                      <tr key={shop.id} className="hover:bg-[#21262d] transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-white">{shop.shopName}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#c9d1d9]">{shop.ownerName}</p>
                          <p className="text-[10px] text-[#8b949e]">{shop.mobile}</p>
                        </td>
                        <td className="px-4 py-3">{statusBadge(shop.subscriptionStatus, shop.daysLeft)}</td>
                        <td className="px-4 py-3 text-xs text-[#c9d1d9] font-bold">{shop.daysLeft} din</td>
                        <td className="px-4 py-3 text-xs text-[#c9d1d9]">{shop.totalOrders}</td>
                      </tr>
                    ))}
                    {shops.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#8b949e]">Koi data nahi</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ SECTION 4: ORDERS ═══ */}
          {section === 'orders' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <p className="text-2xl font-bold text-white">{orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}</p>
                  <p className="text-xs text-[#8b949e]">📦 Aaj ke Orders</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                  <p className="text-xs text-[#8b949e]">📈 Total Orders</p>
                </div>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#30363d] bg-[#21262d]">
                    <tr>
                      {['Shop', 'Customer', 'Delivery', 'Payment', 'Time'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8b949e]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-[#21262d] transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-white">{order.shop.shopName}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#c9d1d9]">{order.customerName}</p>
                          <p className="text-[10px] text-[#8b949e]">{order.customerMobile}</p>
                        </td>
                        <td className="px-4 py-3">
                          {order.homeDelivery
                            ? <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full font-bold">🛵 Home</span>
                            : <span className="text-[10px] bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded-full">🏪 Pickup</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#c9d1d9]">{order.paymentMethod}</td>
                        <td className="px-4 py-3 text-[10px] text-[#8b949e]">{fmt(order.createdAt)}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#8b949e]">Koi order nahi mila</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ SECTION 5: ITEMS ═══ */}
          {section === 'items' && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap items-center justify-between">
                <div className="flex gap-3 flex-wrap">
                  <select
                    className="px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-white outline-none"
                    value={selCategory}
                    onChange={e => setSelCategory(e.target.value)}>
                    <option value="">Sabhi Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name} ({c._count.items})</option>)}
                  </select>
                  {selCategory && (
                    <select
                      className="px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-white outline-none"
                      value={selSubCategory}
                      onChange={e => setSelSubCategory(e.target.value)}>
                      <option value="">Sabhi Sub-Categories</option>
                      {filteredSubCats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowCatModal(true)}
                    className="px-3 py-2 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] rounded-lg text-xs font-bold hover:border-[#1f6feb] transition-colors">
                    + Category
                  </button>
                  <button onClick={() => setShowSubCatModal(true)}
                    className="px-3 py-2 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] rounded-lg text-xs font-bold hover:border-[#1f6feb] transition-colors">
                    + Sub-Category
                  </button>
                  <button onClick={() => {
                    setEditItem(null)
                    setNewItem({ name: '', nameHindi: '', categoryId: selCategory, subCategoryId: selSubCategory, units: [], brands: '', imageUrl: '' })
                    setShowItemModal(true)
                  }}
                    className="px-3 py-2 bg-[#1f6feb] text-white rounded-lg text-xs font-bold hover:bg-[#388bfd] transition-colors">
                    + Item Add
                  </button>
                </div>
              </div>

              {/* Categories overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <div key={cat.id}
                    className={`bg-[#161b22] border rounded-xl p-3 flex items-center gap-2 cursor-pointer transition-colors ${selCategory === cat.id ? 'border-[#1f6feb]' : 'border-[#30363d] hover:border-[#1f6feb]'}`}
                    onClick={() => setSelCategory(selCategory === cat.id ? '' : cat.id)}>
                    <span className="text-xl">{cat.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{cat.name}</p>
                      <p className="text-[10px] text-[#8b949e]">{cat._count.items} items</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* SubCategories overview */}
              {selCategory && filteredSubCats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {filteredSubCats.map(sub => (
                    <div key={sub.id}
                      className={`border rounded-lg p-2 flex items-center gap-1.5 cursor-pointer transition-colors ${selSubCategory === sub.id ? 'border-[#1f6feb] bg-[#1f6feb]/10' : 'border-[#30363d] bg-[#161b22] hover:border-[#1f6feb]'}`}
                      onClick={() => setSelSubCategory(selSubCategory === sub.id ? '' : sub.id)}>
                      {sub.icon && <span className="text-sm">{sub.icon}</span>}
                      <p className="text-[10px] font-medium text-white truncate">{sub.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Items table */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#30363d] bg-[#21262d]">
                    <tr>
                      {['Item Naam', 'Category / Sub-Cat', 'Units', 'Brands', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8b949e]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-[#21262d] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded object-cover" />}
                            <div>
                              <p className="text-xs font-medium text-white">{item.name}</p>
                              <p className="text-[10px] text-[#8b949e]">{item.nameHindi}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#c9d1d9]">{item.category.name}</p>
                          <p className="text-[10px] text-[#8b949e]">{item.subCategory.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(item.units as string[]).map(u => (
                              <span key={u} className="text-[9px] bg-[#21262d] text-[#8b949e] px-1.5 py-0.5 rounded font-medium uppercase">{u}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-[#8b949e] max-w-32 truncate">
                          {(item.brands as string[]).slice(0, 3).join(', ')}
                          {(item.brands as string[]).length > 3 && ` +${(item.brands as string[]).length - 3}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => {
                              setEditItem(item)
                              setNewItem({
                                name: item.name, nameHindi: item.nameHindi,
                                categoryId: item.categoryId, subCategoryId: item.subCategoryId,
                                units: item.units as string[],
                                brands: (item.brands as string[]).join(', '),
                                imageUrl: item.imageUrl || ''
                              })
                              setShowItemModal(true)
                            }} className="text-[10px] bg-[#21262d] text-[#c9d1d9] px-2 py-1 rounded-lg hover:text-white">✏️ Edit</button>
                            <button onClick={() => deleteItem(item.id)}
                              className="text-[10px] bg-red-900/20 text-red-400 px-2 py-1 rounded-lg hover:bg-red-900/40">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#8b949e]">
                        {selCategory ? 'Is category mein koi item nahi' : 'Koi item nahi — upar se add karein'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Item Modal ── */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white mb-4">{editItem ? '✏️ Item Edit Karein' : '➕ Naya Item Add Karein'}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Item Naam (English)*</label>
                  <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                    placeholder="Basmati Rice" value={newItem.name}
                    onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Hindi Naam</label>
                  <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                    placeholder="बासमती चावल" value={newItem.nameHindi}
                    onChange={e => setNewItem(p => ({ ...p, nameHindi: e.target.value }))} />
                </div>
              </div>

              {!editItem && (
                <>
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1 block">Category*</label>
                    <select className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none"
                      value={newItem.categoryId}
                      onChange={e => {
                        setNewItem(p => ({ ...p, categoryId: e.target.value, subCategoryId: '' }))
                        setFilteredSubCats(subCategories.filter(s => s.categoryId === e.target.value))
                      }}>
                      <option value="">— Category chunein —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1 block">Sub-Category*</label>
                    <select className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none"
                      value={newItem.subCategoryId}
                      onChange={e => setNewItem(p => ({ ...p, subCategoryId: e.target.value }))}>
                      <option value="">— Sub-Category chunein —</option>
                      {filteredSubCats.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-[#8b949e] mb-2 block">Units* (jo bhi applicable ho select karein)</label>
                <div className="grid grid-cols-2 gap-2">
                  {UNIT_OPTIONS.map(u => (
                    <button key={u.value} onClick={() => toggleUnit(u.value)}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors ${newItem.units.includes(u.value) ? 'bg-[#1f6feb] text-white' : 'bg-[#0d1117] text-[#8b949e] border border-[#30363d]'}`}>
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Brands (comma se alag karein)</label>
                <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                  placeholder="India Gate, Daawat, Fortune, Local"
                  value={newItem.brands}
                  onChange={e => setNewItem(p => ({ ...p, brands: e.target.value }))} />
              </div>

              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Image URL (optional)</label>
                <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                  placeholder="https://..." value={newItem.imageUrl}
                  onChange={e => setNewItem(p => ({ ...p, imageUrl: e.target.value }))} />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowItemModal(false); setEditItem(null) }}
                  className="flex-1 py-2.5 border border-[#30363d] text-[#8b949e] rounded-xl text-sm">Cancel</button>
                <button onClick={saveItem}
                  className="flex-1 py-2.5 bg-[#1f6feb] text-white rounded-xl text-sm font-bold hover:bg-[#388bfd]">
                  {editItem ? 'Update Karein' : 'Add Karein'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Modal ── */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-sm font-bold text-white mb-4">➕ Naya Category Add Karein</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Category Naam*</label>
                <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                  placeholder="Dairy & Breakfast" value={newCat.name}
                  onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Hindi Naam</label>
                <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                  placeholder="डेयरी और नाश्ता" value={newCat.nameHindi}
                  onChange={e => setNewCat(p => ({ ...p, nameHindi: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Icon (emoji)*</label>
                <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                  placeholder="🥛" value={newCat.icon}
                  onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCatModal(false)}
                  className="flex-1 py-2.5 border border-[#30363d] text-[#8b949e] rounded-xl text-sm">Cancel</button>
                <button onClick={saveCat}
                  className="flex-1 py-2.5 bg-[#1f6feb] text-white rounded-xl text-sm font-bold">Add Karein</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SubCategory Modal ── */}
      {showSubCatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-sm font-bold text-white mb-4">➕ Naya Sub-Category Add Karein</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Category Chunein*</label>
                <select className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none"
                  value={newSubCat.categoryId}
                  onChange={e => setNewSubCat(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">— Category chunein —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Sub-Category Naam*</label>
                <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                  placeholder="Basmati Rice" value={newSubCat.name}
                  onChange={e => setNewSubCat(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Hindi Naam</label>
                <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                  placeholder="बासमती चावल" value={newSubCat.nameHindi}
                  onChange={e => setNewSubCat(p => ({ ...p, nameHindi: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Icon (emoji, optional)</label>
                <input className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white outline-none focus:border-[#1f6feb]"
                  placeholder="🍚" value={newSubCat.icon}
                  onChange={e => setNewSubCat(p => ({ ...p, icon: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowSubCatModal(false)}
                  className="flex-1 py-2.5 border border-[#30363d] text-[#8b949e] rounded-xl text-sm">Cancel</button>
                <button onClick={saveSubCat}
                  className="flex-1 py-2.5 bg-[#1f6feb] text-white rounded-xl text-sm font-bold">Add Karein</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
