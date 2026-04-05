'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else { window.location.href = '/cuentas' }
    } catch(e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0e0f14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
      <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#f0f1f5', marginBottom: '32px' }}>Finanzas Personales</h1>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', background: '#16181f', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '10px', padding: '12px 14px', color: '#f0f1f5', fontSize: '14px', outline: 'none' }}
        />
        <input
          id="password"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', background: '#16181f', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '10px', padding: '12px 14px', color: '#f0f1f5', fontSize: '14px', outline: 'none' }}
        />
        {error && <div style={{ color: '#f0997b', fontSize: '13px', padding: '8px' }}>{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '13px', background: '#7f77dd', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}
        >
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}