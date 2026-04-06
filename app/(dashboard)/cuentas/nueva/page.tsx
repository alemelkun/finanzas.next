'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const BANCOS_DEBIT = ['Brubank', 'Mercado Pago', 'Ualá', 'Naranja X', 'Lemon', 'Belo', 'Fiwind', 'Santander', 'Galicia', 'Banco Nación', 'BBVA', 'HSBC', 'Macro', 'Otro']
const BANCOS_CREDIT = ['Galicia', 'Santander', 'BBVA', 'HSBC', 'Macro', 'Naranja X', 'Otro']
const COLORES = ['#1d9e75','#ef9f27','#d85a30','#7f77dd','#378add','#d4537e','#85b7eb','#f7931a','#5dcaa5','#639922']
const TIPOS = [
  { value: 'ars-debit',  label: 'Débito ARS',   emoji: '💳' },
  { value: 'usd-debit',  label: 'Débito USD',   emoji: '💵' },
  { value: 'ars-credit', label: 'Crédito ARS',  emoji: '🔴' },
  { value: 'usd-credit', label: 'Crédito USD',  emoji: '🔵' },
  { value: 'fintech',    label: 'Fintech',       emoji: '📱' },
]

export default function NuevaCuentaPage() {
  const router = useRouter()
  const [type, setType]       = useState('ars-debit')
  const [bank, setBank]       = useState('')
  const [name, setName]       = useState('')
  const [balance, setBalance] = useState('')
  const [limit, setLimit]     = useState('')
  const [closing, setClosing] = useState('15')
  const [color, setColor]     = useState(COLORES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const isCredit = type.includes('credit')
  const bancos = isCredit ? BANCOS_CREDIT : BANCOS_DEBIT

  const handleSave = async () => {
    if (!bank || !name) { setError('Completá banco y nombre'); return }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No estás autenticado'); setLoading(false); return }

    const payload: any = {
      user_id:    user.id,
      type,
      bank,
      name,
      balance:    parseFloat(balance) || 0,
      color,
      is_active:  true,
    }
    if (isCredit) {
      payload.limit_amount = parseFloat(limit) || 0
      payload.closing_day  = parseInt(closing) || 15
      payload.payment_days = 10
    }

    const { error: err } = await supabase.from('accounts').insert(payload)
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/cuentas')
  }

  const input = { width: '100%', background: '#16181f', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '10px', padding: '11px 14px', color: '#f0f1f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' }

  return (
    <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/cuentas')} style={{ background: 'none', border: 'none', color: '#7b7f96', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#f0f1f5' }}>Nueva cuenta</h1>
      </div>

      {/* Tipo */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '8px' }}>Tipo de cuenta</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {TIPOS.map(t => (
            <div key={t.value} onClick={() => { setType(t.value); setBank('') }} style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${type === t.value ? color : 'rgba(255,255,255,0.13)'}`, background: type === t.value ? `${color}22` : '#16181f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: type === t.value ? '#f0f1f5' : '#7b7f96' }}>
              <span>{t.emoji}</span>{t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Banco */}
      <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Banco / entidad</div>
      <select value={bank} onChange={e => { setBank(e.target.value); if (!name) setName(e.target.value) }} style={{ ...input as any }}>
        <option value="">Seleccioná...</option>
        {bancos.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      {/* Nombre */}
      <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Nombre personalizado</div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder={bank ? `${bank} ${type.includes('usd') ? 'dólares' : 'pesos'}` : 'Ej: Brubank pesos'} style={input as any} />

      {/* Saldo */}
      <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>{isCredit ? 'Saldo consumido actual' : 'Saldo inicial'}</div>
      <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" style={input as any} />

      {/* Crédito extra */}
      {isCredit && <>
        <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Límite de crédito</div>
        <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="0" style={input as any} />
        <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Día de cierre</div>
        <input type="number" value={closing} onChange={e => setClosing(e.target.value)} min="1" max="28" style={input as any} />
      </>}

      {/* Color */}
      <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '8px' }}>Color identificador</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {COLORES.map(c => (
          <div key={c} onClick={() => setColor(c)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: c, cursor: 'pointer', border: color === c ? '3px solid white' : '3px solid transparent', transition: 'border .15s' }} />
        ))}
      </div>

      {error && <div style={{ color: '#f0997b', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

      <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '14px', background: color, border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: 500, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
        {loading ? 'Guardando...' : 'Agregar cuenta'}
      </button>
    </div>
  )
}