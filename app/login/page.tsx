'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const login = async () => {
    setMsg('Verificando...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setMsg('Error: ' + error.message); return }
    setMsg('OK! Redirigiendo...')
    window.location.replace('https://finanzas-next-nu.vercel.app/cuentas')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0e0f14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
      <h1 style={{ color: '#f0f1f5', marginBottom: '24px' }}>Finanzas</h1>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', width: '300px', marginBottom: '10px', padding: '12px', borderRadius: '8px', border: 'none', background: '#16181f', color: '#f0f1f5', fontSize: '14px' }} />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', width: '300px', marginBottom: '10px', padding: '12px', borderRadius: '8px', border: 'none', background: '#16181f', color: '#f0f1f5', fontSize: '14px' }} />
      <button onClick={login}
        style={{ display: 'block', width: '300px', padding: '12px', borderRadius: '8px', border: 'none', background: '#7f77dd', color: 'white', fontSize: '15px', cursor: 'pointer', marginBottom: '10px' }}>
        Ingresar
      </button>
      {msg && <div style={{ color: '#f0997b', marginTop: '10px' }}>{msg}</div>}
    </div>
  )
}