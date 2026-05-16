'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Email aur password dono bharein.'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin-secret-login/dashboard')
    } catch {
      setError('Network error. Dobara koshish karein.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
      <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-[#0f3460] rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">🔐</div>
          <h1 className="text-xl font-bold text-white">Admin Login</h1>
          <p className="text-xs text-[#8892b0] mt-1">KiranaLink System Control</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-2.5 text-sm text-red-300 mb-4 flex gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#8892b0] mb-1.5">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-[#0f3460] border border-[#1a4a7a] rounded-xl text-sm text-white outline-none focus:border-[#e94560] transition-colors placeholder:text-[#4a5568]"
              placeholder="admin@kiranalink.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8892b0] mb-1.5">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 bg-[#0f3460] border border-[#1a4a7a] rounded-xl text-sm text-white outline-none focus:border-[#e94560] transition-colors placeholder:text-[#4a5568]"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-[#e94560] hover:bg-[#c73652] text-white rounded-xl font-bold text-sm mt-2 transition-all disabled:opacity-60"
          >
            {loading ? 'Login ho raha hai...' : 'Login Karein →'}
          </button>
        </div>
      </div>
    </main>
  )
}
