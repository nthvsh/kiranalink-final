'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'signup' | 'login'
type Step = 'form' | 'otp' | 'success'

interface ShopFormData {
  shopName: string
  ownerName: string
  mobile: string
  whatsapp: string
  email: string
  address: string
  regNumber: string
  openTime: string
  closeTime: string
  paymentMethod: string
}

const inp = "w-full px-3.5 py-2.5 border-[1.5px] border-[#DDD9D0] rounded-xl text-sm text-[#1B3A2F] bg-[#FAFAF8] outline-none focus:border-[#2D6A4F] focus:bg-white transition-colors"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider pt-1 pb-1 border-b-2 border-[#E8F5EE]">
      {children}
    </h3>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#3D5A50] mb-1.5">
        {label} {required && <span className="text-[#D85A30]">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('signup')
  const [step, setStep] = useState<Step>('form')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loginMobile, setLoginMobile] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shopLink, setShopLink] = useState('')
  const [successShopName, setSuccessShopName] = useState('')
  const [copied, setCopied] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const [form, setForm] = useState<ShopFormData>({
    shopName: '', ownerName: '', mobile: '', whatsapp: '',
    email: '', address: '', regNumber: '',
    openTime: '08:00', closeTime: '22:00', paymentMethod: '',
  })

  const updateForm = (field: keyof ShopFormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const currentMobile = tab === 'signup' ? form.mobile : loginMobile

  const sendOTP = async (mobile: string, purpose: Tab) => {
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, purpose }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setStep('otp')
    } catch { setError('Network error. Dobara koshish karein.') }
    finally { setLoading(false) }
  }

  const handleSignupSubmit = () => {
    const { shopName, ownerName, mobile, whatsapp, address, paymentMethod } = form
    if (!shopName || !ownerName || !mobile || !whatsapp || !address || !paymentMethod) {
      setError('Kripya sabhi zaroori (*) fields bharein.'); return
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) { setError('Sahi mobile number daalo (10 digits).'); return }
    sendOTP(mobile, 'signup')
  }

  const handleLoginSubmit = () => {
    if (!/^[6-9]\d{9}$/.test(loginMobile)) { setError('Sahi mobile number daalo (10 digits).'); return }
    sendOTP(loginMobile, 'login')
  }

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[idx] = val.slice(-1)
    setOtp(newOtp)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('')
    if (otpValue.length < 6) { setError('Poora 6-digit OTP daalo.'); return }
    setError(''); setLoading(true)
    try {
      if (tab === 'signup') {
        const res = await fetch('/api/shop/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, verifiedOtp: otpValue }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        setShopLink(`${window.location.origin}/shop/${data.shop.slug}`)
        setSuccessShopName(data.shop.shopName)
        setStep('success')
      } else {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: loginMobile, otp: otpValue }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        router.push('/dashboard')
      }
    } catch { setError('Network error. Dobara koshish karein.') }
    finally { setLoading(false) }
  }

  const switchTab = (t: Tab) => {
    setTab(t); setStep('form'); setError('')
    setOtp(['', '', '', '', '', ''])
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF] flex flex-col items-center justify-start py-8 px-4">
      {/* Brand */}
      <div className="text-center mb-7">
        <div className="w-16 h-16 bg-[#2D6A4F] rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">🛒</div>
        <h1 className="text-2xl font-bold text-[#1B3A2F] tracking-tight">
          KiranaLink
        </h1>
        <p className="text-sm text-[#5A7A6A] mt-1">Apni kirana shop ko digital banao — aaj hi</p>
      </div>

      <div className="bg-white rounded-2xl p-7 w-full max-w-md border border-[#E0DDD6] shadow-sm">
        {error && (
          <div className="bg-[#FEF0ED] border border-[#F5C4B3] rounded-xl px-4 py-3 text-sm text-[#993C1D] mb-4 flex gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* TABS */}
        {step === 'form' && (
          <div className="flex bg-[#F0EDE8] rounded-xl p-1 mb-6">
            {(['signup', 'login'] as Tab[]).map((t) => (
              <button key={t} onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all ${tab === t ? 'bg-white text-[#1B3A2F] shadow-sm' : 'text-[#7A8C85]'}`}>
                {t === 'signup' ? 'Naya Account' : 'Login Karein'}
              </button>
            ))}
          </div>
        )}

        {/* SIGNUP FORM */}
        {step === 'form' && tab === 'signup' && (
          <div className="space-y-4">
            <SectionTitle>🏪 Shop Ki Jankari</SectionTitle>
            <Field label="Shop Ka Naam" required>
              <input className={inp} placeholder="" value={form.shopName} onChange={e => updateForm('shopName', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Owner Ka Naam" required>
                <input className={inp} placeholder="" value={form.ownerName} onChange={e => updateForm('ownerName', e.target.value)} />
              </Field>
              <Field label="Reg. Number">
                <input className={inp} placeholder="" value={form.regNumber} onChange={e => updateForm('regNumber', e.target.value)} />
              </Field>
            </div>
            <Field label="Shop Ka Pata" required>
              <textarea className={`${inp} h-16 resize-none`} placeholder="" value={form.address} onChange={e => updateForm('address', e.target.value)} />
            </Field>

            <SectionTitle>📞 Contact Details</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mobile Number" required>
                <input className={inp} type="tel" maxLength={10} placeholder="" value={form.mobile} onChange={e => updateForm('mobile', e.target.value)} />
              </Field>
              <Field label="WhatsApp Number" required>
                <input className={inp} type="tel" maxLength={10} placeholder="" value={form.whatsapp} onChange={e => updateForm('whatsapp', e.target.value)} />
              </Field>
            </div>
            <Field label="Email ID">
              <input className={inp} type="email" placeholder="" value={form.email} onChange={e => updateForm('email', e.target.value)} />
            </Field>

            <SectionTitle>⏰ Timing & Payment</SectionTitle>
            <Field label="Shop Timing" required>
              <div className="flex items-center gap-2">
                <input type="time" className={`${inp} flex-1`} value={form.openTime} onChange={e => updateForm('openTime', e.target.value)} />
                <span className="text-xs text-[#7A8C85]">se</span>
                <input type="time" className={`${inp} flex-1`} value={form.closeTime} onChange={e => updateForm('closeTime', e.target.value)} />
              </div>
            </Field>
            <Field label="Payment Method" required>
              <select className={inp} value={form.paymentMethod} onChange={e => updateForm('paymentMethod', e.target.value)}>
                <option value="">— Chunein —</option>
                <option value="cash">Sirf Cash</option>
                <option value="upi">Sirf UPI</option>
                <option value="both">Cash + UPI Dono</option>
              </select>
            </Field>

            <SectionTitle>🖼️ Shop Ka Banner / Logo</SectionTitle>
            <label className="block border-2 border-dashed border-[#B8D5C5] rounded-xl p-4 text-center bg-[#F2FAF5] cursor-pointer hover:border-[#2D6A4F] transition-colors">
              <div className="text-2xl mb-1">📸</div>
              <p className="text-sm text-[#5A7A6A]">{uploadName || 'Banner ya Logo upload karein'}</p>
              <p className="text-xs text-[#9AADA6]">JPG, PNG — Max 2MB</p>
              <input type="file" className="hidden" accept="image/*" onChange={e => setUploadName(e.target.files?.[0]?.name || '')} />
            </label>

            <button onClick={handleSignupSubmit} disabled={loading}
              className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#245A42] active:scale-[0.99] text-white rounded-xl font-semibold text-base mt-2 transition-all disabled:opacity-60">
              {loading ? 'Bhej rahe hain...' : 'OTP Bhejo — Account Banao 🚀'}
            </button>
            <p className="text-center text-xs text-[#7A8C85]">
              Pehle se account hai?{' '}
              <button onClick={() => switchTab('login')} className="text-[#2D6A4F] font-semibold">Login karein</button>
            </p>
          </div>
        )}

        {/* LOGIN FORM */}
        {step === 'form' && tab === 'login' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <div className="text-4xl mb-3">👋</div>
              <h2 className="text-lg font-bold text-[#1B3A2F]">Wapas Aaiye!</h2>
              <p className="text-sm text-[#5A7A6A] mt-1">Mobile number daalo — OTP se login karein</p>
            </div>
            <Field label="Mobile Number" required>
              <input className={inp} type="tel" maxLength={10} placeholder="" value={loginMobile} onChange={e => setLoginMobile(e.target.value)} />
            </Field>
            <button onClick={handleLoginSubmit} disabled={loading}
              className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#245A42] text-white rounded-xl font-semibold text-base transition-all disabled:opacity-60">
              {loading ? 'Bhej rahe hain...' : 'OTP Bhejo 📱'}
            </button>
            <p className="text-center text-xs text-[#7A8C85]">
              Naya account chahiye?{' '}
              <button onClick={() => switchTab('signup')} className="text-[#2D6A4F] font-semibold">Register karein</button>
            </p>
          </div>
        )}

        {/* OTP SCREEN */}
        {step === 'otp' && (
          <div className="text-center py-2">
            <div className="text-4xl mb-3">📱</div>
            <h2 className="text-xl font-bold text-[#1B3A2F] mb-2">OTP Aaya Hoga!</h2>
            <p className="text-sm text-[#5A7A6A] mb-6">
              Aapke number <strong className="text-[#1B3A2F]">{currentMobile}</strong> par<br />6-digit OTP bheja gaya hai
            </p>
            <div className="flex gap-2.5 justify-center mb-5">
              {otp.map((digit, i) => (
                <input key={i} ref={el => { otpRefs.current[i] = el }} type="tel" maxLength={1} value={digit}
                  onChange={e => handleOtpChange(e.target.value, i)} onKeyDown={e => handleOtpKeyDown(e, i)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-[#DDD9D0] rounded-xl outline-none text-[#1B3A2F] bg-[#FAFAF8] focus:border-[#2D6A4F] focus:bg-white transition-colors" />
              ))}
            </div>
            <p className="text-xs text-[#7A8C85] mb-4">
              OTP nahi aaya?{' '}
              <button onClick={() => sendOTP(currentMobile, tab)} className="text-[#2D6A4F] font-semibold">Dobara Bhejo</button>
            </p>
            <button onClick={handleVerifyOTP} disabled={loading}
              className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#245A42] text-white rounded-xl font-semibold text-base transition-all disabled:opacity-60">
              {loading ? 'Verify ho raha hai...' : 'OTP Verify Karein ✓'}
            </button>
            <button onClick={() => { setStep('form'); setError('') }} className="text-xs text-[#7A8C85] mt-3 hover:text-[#3D5A50] block mx-auto">
              ← Wapas Jaao
            </button>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {step === 'success' && (
          <div className="text-center py-2">
            <div className="w-16 h-16 bg-[#EAF5EE] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
            <h2 className="text-xl font-bold text-[#1B3A2F] mb-2">Shop Live Ho Gayi!</h2>
            <p className="text-sm text-[#5A7A6A] mb-5 leading-relaxed">
              Badhai ho! <strong className="text-[#1B3A2F]">{successShopName}</strong> ki permanent link taiyar hai.<br />
              Ise apne customers ko WhatsApp par share karein.
            </p>
            <div className="bg-[#F0FAF4] border border-[#B8D5C5] rounded-xl p-3.5 flex items-center justify-between mb-4">
              <span className="text-xs text-[#2D6A4F] font-medium text-left break-all">{shopLink}</span>
              <button onClick={() => { navigator.clipboard.writeText(shopLink); setCopied(true); setTimeout(() => setCopied(false), 2500) }}
                className="ml-3 bg-[#2D6A4F] text-white text-xs font-bold rounded-lg px-3 py-1.5 whitespace-nowrap shrink-0">
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <button onClick={() => {
              const msg = encodeURIComponent(`Namaskar! 🛒\n\nAb aap ghar baithe *${successShopName}* par apna order de sakte hain!\n\n📲 Order karein yahan:\n${shopLink}\n\nGhar baithe order dijiye — hum pahuncha denge! 🏠`)
              window.open(`https://wa.me/?text=${msg}`, '_blank')
            }} className="w-full py-3.5 bg-[#25D366] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-3">
              <span>📤</span> WhatsApp par Share Karein
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="w-full py-3 border border-[#DDD9D0] text-[#3D5A50] rounded-xl font-medium text-sm hover:bg-[#F7F4EF] transition-colors">
              Dashboard Dekho →
            </button>
            <p className="text-xs text-[#9AADA6] mt-3">✅ Pehle 30 din bilkul FREE · Uske baad sirf ₹149/mahina</p>
          </div>
        )}
      </div>
    </main>
  )
}
