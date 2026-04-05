'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login'|'signup'>('login')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else window.location.href = '/cuentas'

  return (
    <div style={{ minHeight: '100vh', background: '#0e0f14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
      <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#f0f1f5', marginBottom: '8px' }}>Finanzas Personales</h1>
      <p style={{ fontSize: '14px', color: '#7b7f96', marginBottom: '32px', textAlign: 'center' }}>
        {mode === 'login' ? 'Ingresá a tu cuenta' : 'Creá tu cuenta'}
      </p>

      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', background: '#16181f', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '10px', padding: '12px 14px', color: '#f0f1f5', fontSize: '14px', outline: 'none' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', background: '#16181f', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '10px', padding: '12px 14px', color: '#f0f1f5', fontSize: '14px', outline: 'none' }}
        />

        {error && (
          <div style={{ background: 'rgba(216,90,48,0.13)', border: '1px solid rgba(216,90,48,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f0997b' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '13px', background: '#7f77dd', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}
        >
          {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          style={{ padding: '10px', background: 'transparent', border: 'none', color: '#7f77dd', fontSize: '13px', cursor: 'pointer' }}
        >
          {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
        </button>
      </div>
    </div>
  )
}