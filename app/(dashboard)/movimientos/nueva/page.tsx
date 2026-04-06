'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NuevaTransaccionPage() {
  const router = useRouter()
  const [type, setType]         = useState<'expense'|'income'|'transfer'>('expense')
  const [amount, setAmount]     = useState('')
  const [description, setDesc]  = useState('')
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [accountId, setAccId]   = useState('')
  const [toAccountId, setToAcc] = useState('')
  const [categoryId, setCatId]  = useState('')
  const [fxRate, setFxRate]     = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCats]   = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    supabase.from('accounts').select('*').eq('is_active', true).then(({ data }) => { if (data) setAccounts(data) })
    supabase.from('categories').select('*, subs:subcategories(*)').order('sort_order').then(({ data }) => { if (data) setCats(data) })
  }, [])

  const selectedAcc    = accounts.find(a => a.id === accountId)
  const selectedToAcc  = accounts.find(a => a.id === toAccountId)
  const isCross        = type === 'transfer' && selectedAcc && selectedToAcc &&
    selectedAcc.type?.startsWith('ars') !== selectedToAcc.type?.startsWith('ars')

  const handleSave = async () => {
    if (!amount || !accountId) { setError('Completá monto y cuenta'); return }
    if (type === 'transfer' && !toAccountId) { setError('Seleccioná cuenta destino'); return }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No autenticado'); setLoading(false); return }

    const payload: any = {
      user_id:     user.id,
      type,
      amount:      parseFloat(amount),
      description,
      date,
      account_id:  accountId,
      currency:    selectedAcc?.type?.startsWith('usd') ? 'usd' : 'ars',
    }
    if (categoryId) payload.category_id = categoryId
    if (type === 'transfer') {
      payload.to_account_id = toAccountId
      if (fxRate) payload.fx_rate = parseFloat(fxRate)
    }

    const { error: err } = await supabase.from('transactions').insert(payload)
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/movimientos')
  }

  const input = { width: '100%', background: '#16181f', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '10px', padding: '11px 14px', color: '#f0f1f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' }

  const typeColor = type === 'income' ? '#5dcaa5' : type === 'transfer' ? '#7f77dd' : '#f0997b'

  return (
    <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/movimientos')} style={{ background: 'none', border: 'none', color: '#7b7f96', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#f0f1f5' }}>Nueva transacción</h1>
      </div>

      {/* Tipo */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['expense','income','transfer'] as const).map(t => (
          <div key={t} onClick={() => setType(t)} style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px', border: `1px solid ${type === t ? typeColor : 'rgba(255,255,255,0.1)'}`, background: type === t ? `${typeColor}18` : '#16181f', color: type === t ? typeColor : '#7b7f96', fontSize: '12px', fontWeight: type === t ? 500 : 400, cursor: 'pointer' }}>
            {t === 'expense' ? '↑ Gasto' : t === 'income' ? '↓ Ingreso' : '⇄ Transferencia'}
          </div>
        ))}
      </div>

      {/* Monto */}
      <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Monto</div>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ ...input as any, fontSize: '22px', fontFamily: 'monospace', color: typeColor }} />

      {/* Cuenta origen */}
      <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>{type === 'transfer' ? 'Cuenta origen' : 'Cuenta'}</div>
      <select value={accountId} onChange={e => setAccId(e.target.value)} style={input as any}>
        <option value="">Seleccioná cuenta...</option>
        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type?.startsWith('usd') ? 'USD' : 'ARS'})</option>)}
      </select>

      {/* Cuenta destino */}
      {type === 'transfer' && (
        <>
          <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Cuenta destino</div>
          <select value={toAccountId} onChange={e => setToAcc(e.target.value)} style={input as any}>
            <option value="">Seleccioná cuenta...</option>
            {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name} ({a.type?.startsWith('usd') ? 'USD' : 'ARS'})</option>)}
          </select>
          {isCross && (
            <>
              <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Cotización de la operación (ARS por USD)</div>
              <input type="number" value={fxRate} onChange={e => setFxRate(e.target.value)} placeholder="Ej: 1400" style={input as any} />
            </>
          )}
        </>
      )}

      {/* Categoría */}
      {type !== 'transfer' && (
        <>
          <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Categoría</div>
          <select value={categoryId} onChange={e => setCatId(e.target.value)} style={input as any}>
            <option value="">Sin categoría</option>
            {categories.filter(c => c.type === type || c.type === 'both').map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </>
      )}

      {/* Descripción */}
      <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Descripción</div>
      <input value={description} onChange={e => setDesc(e.target.value)} placeholder="Ej: Supermercado, sueldo..." style={input as any} />

      {/* Fecha */}
      <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '6px' }}>Fecha</div>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={input as any} />

      {error && <div style={{ color: '#f0997b', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

      <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '14px', background: typeColor, border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: 500, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
        {loading ? 'Guardando...' : 'Guardar transacción'}
      </button>
    </div>
  )
}