'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ShopData {
  id: string
  shopName: string
  ownerName: string
  slug: string
  mobile: string
  whatsapp: string
  shopLink: string
  isSubscriptionActive: boolean
  trialEndsAt: string
  subscriptionEndsAt: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [shop, setShop] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    fetch('/api/shop/me')
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push('/'); return }
        setShop(data.shop)
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [router])

  const handleCopy = () => {
    if (!shop) return
    navigator.clipboard.writeText(shop.shopLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShareWA = () => {
    if (!shop) return
    const msg = encodeURIComponent(
      `Namaskar! 🛒\n\nAb aap ghar baithe *${shop.shopName}* par apna order de sakte hain!\n\n📲 Order karein yahan:\n${shop.shopLink}\n\nGhar baithe order dijiye — hum pahuncha denge! 🏠`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const handleLogout = async () => {
    await fetch('/api/shop/me', { method: 'DELETE' })
    router.push('/')
  }

  const verifyWhatsApp = async () => {
    if (!shop) return
    
    setVerifying(true)
    try {
      const mobile = shop.mobile || shop.whatsapp
      
      if (!mobile) {
        alert('❌ Mobile number nahi mila')
        return
      }

      const res = await fetch('/api/shopkeeper/verify-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setVerified(true)
        alert('✅ WhatsApp verify ho gaya! Ab orders aapke WhatsApp par aayenge.')
      } else {
        alert('⚠️ Verify nahi ho paya. Dobara koshish karein.')
      }
    } catch (err) {
      alert('❌ Error aa gaya. Dobara koshish karein.')
    } finally {
      setVerifying(false)
    }
  }

  const getDaysLeft = () => {
    if (!shop) return 0
    const end = shop.subscriptionEndsAt
      ? new Date(shop.subscriptionEndsAt)
      : new Date(shop.trialEndsAt)
    const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  const isTrialActive = () => {
    if (!shop) return false
    return new Date(shop.trialEndsAt) > new Date() && !shop.subscriptionEndsAt
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-[#5A7A6A] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!shop) return null

  const daysLeft = getDaysLeft()
  const expiringSoon = daysLeft <= 3

  return (
    <main className="min-h-screen bg-[#F7F4EF] flex flex-col items-center justify-start py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2D6A4F] rounded-xl flex items-center justify-center text-xl">🛒</div>
          <div>
            <h1 className="text-sm font-bold text-[#1B3A2F]">{shop.shopName}</h1>
            <p className="text-xs text-[#7A8C85]">Namaste, {shop.ownerName}!</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs text-[#7A8C85] border border-[#DDD9D0] px-3 py-1.5 rounded-lg hover:bg-white transition-colors">
          Logout
        </button>
      </div>

      {/* Expiry Warning */}
      {expiringSoon && daysLeft > 0 && (
        <div className="w-full max-w-md bg-[#FEF0ED] border border-[#F5C4B3] rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm font-bold text-[#993C1D] mb-1">⚠️ Link {daysLeft} din mein expire hogi!</p>
          <p className="text-xs text-[#993C1D] mb-3">Recharge karein — link active rakhen</p>
          <button onClick={() => router.push('/recharge')}
            className="bg-[#D85A30] text-white text-sm font-bold px-5 py-2 rounded-xl">
            ₹149 Recharge Karein →
          </button>
        </div>
      )}

      {daysLeft === 0 && (
        <div className="w-full max-w-md bg-[#FEF0ED] border border-[#F5C4B3] rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm font-bold text-[#993C1D] mb-1">❌ Aapki link expire ho gayi!</p>
          <p className="text-xs text-[#993C1D] mb-3">Customers order nahi de pa rahe. Turant recharge karein.</p>
          <button onClick={() => router.push('/recharge')}
            className="bg-[#D85A30] text-white text-sm font-bold px-5 py-2 rounded-xl">
            ₹149 Recharge Karein →
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl p-7 w-full max-w-md border border-[#E0DDD6] shadow-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔗</div>
          <h2 className="text-lg font-bold text-[#1B3A2F]">Apni Shop Ki Link</h2>
          <p className="text-sm text-[#5A7A6A] mt-1">Ise apne customers ko WhatsApp par share karein</p>
        </div>

        {/* Shop Link Box */}
        <div className="bg-[#F0FAF4] border-2 border-[#B8D5C5] rounded-xl p-4 mb-4">
          <p className="text-xs text-[#7A8C85] mb-2 font-medium">Aapki Permanent Link:</p>
          <p className="text-sm text-[#2D6A4F] font-semibold break-all leading-relaxed">
            {shop.shopLink}
          </p>
        </div>

        {/* Action Buttons */}
        <button onClick={handleCopy}
          className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#245A42] active:scale-[0.99] text-white rounded-xl font-semibold text-base transition-all mb-3 flex items-center justify-center gap-2">
          {copied ? '✓ Link Copy Ho Gayi!' : '📋 Link Copy Karein'}
        </button>

        <button onClick={handleShareWA}
          className="w-full py-3.5 bg-[#25D366] hover:bg-[#1fba59] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
          <span>📤</span> WhatsApp par Share Karein
        </button>

        {/* WhatsApp Verify Step */}
        {!verified && (
          <div className="mt-4 bg-[#FFF8E1] border border-[#FFC107] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div className="flex-1">
                <h3 className="font-semibold text-[#856404] text-sm">WhatsApp Verify Karein</h3>
                <p className="text-xs text-[#856404] mt-1">
                  Orders paane ke liye neeche click karein.
                </p>
                <button
                  onClick={verifyWhatsApp}
                  disabled={verifying}
                  className="mt-3 w-full py-2.5 bg-[#FFC107] text-[#856404] font-semibold rounded-lg hover:bg-[#FFD54F] transition-colors disabled:opacity-50 text-sm"
                >
                  {verifying ? 'Verifying...' : '✅ WhatsApp Verify Karein'}
                </button>
                <p className="text-[10px] text-[#856404] mt-2 text-center">
                  Ya manually: 📞 +1 415 523 8886 → 📝 join fresh-trick
                </p>
              </div>
            </div>
          </div>
        )}

        {verified && (
          <div className="mt-4 bg-[#E8F5E9] border border-[#4CAF50] rounded-xl p-4 text-center">
            <span className="text-2xl">✅</span>
            <p className="text-sm text-[#2E7D32] font-semibold mt-1">
              WhatsApp verify ho gaya! Ab orders aayenge.
            </p>
          </div>
        )}

        {/* Subscription Status */}
        <div className="mt-5 pt-4 border-t border-[#EEE] text-center">
          {isTrialActive() ? (
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#EAF5EE] text-[#1B6B3A] text-xs font-semibold px-3 py-1.5 rounded-full">
                ✅ Free Trial Active
              </span>
              <p className="text-xs text-[#7A8C85] mt-2">{daysLeft} din baaki · Phir ₹149/mahina</p>
            </div>
          ) : shop.subscriptionEndsAt && daysLeft > 0 ? (
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#EAF5EE] text-[#1B6B3A] text-xs font-semibold px-3 py-1.5 rounded-full">
                ✅ Subscription Active
              </span>
              <p className="text-xs text-[#7A8C85] mt-2">{daysLeft} din baaki</p>
            </div>
          ) : (
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#FEF0ED] text-[#993C1D] text-xs font-semibold px-3 py-1.5 rounded-full">
                ❌ Subscription Expired
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="w-full max-w-md mt-4 text-center">
        <p className="text-xs text-[#9AADA6] leading-relaxed">
          ✅ Ye link permanent hai — kabhi change nahi hogi<br />
          Customers link par click karke seedha order denge
        </p>
      </div>
    </main>
  )
}