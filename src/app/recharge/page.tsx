'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

interface ShopData {
  shopName: string
  trialEndsAt: string
  subscriptionEndsAt: string | null
}

export default function RechargePage() {
  const router = useRouter()
  const [shop, setShop] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/shop/me')
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push('/'); return }
        setShop(data.shop)
      })
      .finally(() => setLoading(false))

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [router])

  const handlePayment = async () => {
    setError('')
    setPaying(true)

    try {
      // Create Razorpay order
      const res = await fetch('/api/payment/create-order', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setPaying(false); return }

      // Dev mode — simulate success
      if (data.keyId === 'rzp_test_dev') {
        await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: data.orderId,
            razorpay_payment_id: 'pay_dev_' + Date.now(),
            razorpay_signature: 'dev_signature',
          }),
        })
        setSuccess(true)
        setPaying(false)
        return
      }

      // Real Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'KiranaLink',
        description: '1 Mahina Subscription',
        order_id: data.orderId,
        prefill: {
          name: data.ownerName,
          contact: data.mobile,
          email: data.email,
        },
        theme: { color: '#2D6A4F' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            setSuccess(true)
          } else {
            setError('Payment verify nahi hua. Support se sampark karein.')
          }
          setPaying(false)
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setError('Payment shuru nahi ho paya. Dobara koshish karein.')
      setPaying(false)
    }
  }

  const getDaysLeft = () => {
    if (!shop) return 0
    const end = shop.subscriptionEndsAt
      ? new Date(shop.subscriptionEndsAt)
      : new Date(shop.trialEndsAt)
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
      <p className="text-[#5A7A6A] text-sm">Loading...</p>
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center border border-[#E0DDD6] shadow-sm">
        <div className="w-16 h-16 bg-[#EAF5EE] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
        <h2 className="text-xl font-bold text-[#1B3A2F] mb-2">Subscription Active!</h2>
        <p className="text-sm text-[#5A7A6A] mb-2">Badhai ho! Aapki shop link agle 30 din ke liye active hai.</p>
        <p className="text-xs text-[#9AADA6] mb-6">Customers ab order de sakte hain.</p>
        <button onClick={() => router.push('/dashboard')}
          className="w-full py-3.5 bg-[#2D6A4F] text-white rounded-xl font-bold">
          Dashboard Par Jaao →
        </button>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#F7F4EF] flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#2D6A4F] rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">🔋</div>
          <h1 className="text-xl font-bold text-[#1B3A2F]">Subscription Recharge</h1>
          <p className="text-sm text-[#5A7A6A] mt-1">{shop?.shopName}</p>
        </div>

        {/* Status */}
        <div className={`rounded-xl px-4 py-3 mb-4 text-center ${getDaysLeft() === 0 ? 'bg-[#FEF0ED] border border-[#F5C4B3]' : 'bg-[#FFF8E7] border border-[#F5D98B]'}`}>
          {getDaysLeft() === 0
            ? <p className="text-sm font-bold text-[#993C1D]">❌ Aapki link expire ho gayi hai</p>
            : <p className="text-sm font-bold text-[#7A5800]">⚠️ Sirf {getDaysLeft()} din baaki hain</p>
          }
          <p className="text-xs text-[#7A8C85] mt-1">Recharge karein — link turant active ho jayegi</p>
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-2xl border-2 border-[#2D6A4F] p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-base font-bold text-[#1B3A2F]">Monthly Plan</p>
              <p className="text-xs text-[#5A7A6A]">30 din ki subscription</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#2D6A4F]">₹149</p>
              <p className="text-xs text-[#7A8C85]">per mahina</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-[#5A7A6A]">
            {['✅ Permanent shop link active rahegi', '✅ Unlimited customer orders', '✅ Turant WhatsApp notifications', '✅ Agle recharge tak valid'].map(f => (
              <p key={f}>{f}</p>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[#FEF0ED] border border-[#F5C4B3] rounded-xl px-4 py-3 text-sm text-[#993C1D] mb-4 flex gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <button onClick={handlePayment} disabled={paying}
          className="w-full py-4 bg-[#2D6A4F] hover:bg-[#245A42] text-white rounded-xl font-bold text-base transition-all disabled:opacity-60 shadow-md">
          {paying ? 'Payment ho rahi hai...' : '💳 ₹149 Recharge Karein'}
        </button>

        <p className="text-center text-xs text-[#9AADA6] mt-3">
          🔒 Secure payment — Razorpay ke through<br />
          UPI, Card, Net Banking — sab accept hota hai
        </p>

        <button onClick={() => router.push('/dashboard')} className="w-full text-center text-xs text-[#7A8C85] mt-4 py-2">
          ← Dashboard par wapas jaao
        </button>
      </div>
    </main>
  )
}
