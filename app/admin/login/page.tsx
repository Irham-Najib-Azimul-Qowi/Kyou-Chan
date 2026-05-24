'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    
    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Invalid password')
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-5"
         style={{ background: 'var(--void)' }}>
      
      {/* Background blob */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-[0.05]"
           style={{ background: 'var(--jade)' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="rounded-2xl border p-8"
             style={{ background: 'var(--surface)', borderColor: 'var(--b1)' }}>
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-3xl font-serif mb-1" style={{ color: 'var(--jade)' }}>名人強</div>
            <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>ADMIN DASHBOARD</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--raised)',
                  border: '1px solid var(--b1)',
                  color: 'var(--text-1)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--jade)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--b1)'}
              />
            </div>
            
            {error && (
              <p className="text-xs font-mono text-[var(--maple)]">{error}</p>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl text-sm font-bold font-mono
                         disabled:opacity-40 transition-all cursor-pointer"
              style={{ background: 'var(--jade)', color: 'var(--void)' }}
            >
              {loading ? 'Signing in...' : 'SIGN IN →'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
