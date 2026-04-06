'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function MovimientosPage() {
  const router = useRouter()
  const [transactions, setTxs] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100)
      .then(({ data }) => { if (data) setTxs(data) })
  }, [])

  const fmt = (n: number, cur = 'ars') => cur === 'usd'
    ? 'U$D ' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '$' + Math.round(Math.abs(n)).toLocaleString('es-AR')

  const filtered = transactions.filter(tx => {
    if (filter === 'income'   && tx.type !== 'income')   return false
    if (filter === 'expense'  && tx.type !== 'expense')  return false
    if (filter === 'transfer' && tx.type !== 'transfer') return false
    if (search && !tx.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalInc = filtered.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0)
  const totalExp = filtered.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0)
  const balance  = totalInc - totalExp

  const grouped: Record<string, any[]> = {}
  filtered.forEach(tx => {
    const date = tx.date || 'Sin fecha'
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(tx)
  })

  const dateLabel = (d: string) => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (d === today) return 'Hoy'
    if (d === yesterday) return 'Ayer'
    return d
  }

  return (
    <div style={{ paddingTop: '20px', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#7b7f96', letterSpacing: '.1em', textTransform: 'uppercase' }}>Finanzas</div>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#f0f1f5', marginTop: '2px' }}>Movimientos</h1>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ margin: '0 20px 14px', background: '#16181f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#7b7f96', marginBottom: '3px' }}>Balance</div>
          <div style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: 300, color: balance >= 0 ? '#5dcaa5' : '#f0997b' }}>
            {fmt(balance)}
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', background: 'rgba(29,158,117,0.13)', color: '#5dcaa5', padding: '3px 10px', borderRadius: '20px' }}>+ {fmt(totalInc)}</span>
          <span style={{ fontSize: '11px', background: 'rgba(216,90,48,0.13)', color: '#f0997b', padding: '3px 10px', borderRadius: '20px' }}>− {fmt(totalExp)}</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ padding: '0 20px', display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[['all','Todos'],['income','Ingresos'],['expense','Gastos'],['transfer','Transferencias']].map(([val, label]) => (
          <div key={val} onClick={() => setFilter(val)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '8px', border: `1px solid ${filter === val ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`, background: filter === val ? '#1d2030' : 'transparent', color: filter === val ? '#f0f1f5' : '#7b7f96', fontSize: '12px', cursor: 'pointer' }}>
            {label}
          </div>
        ))}
        <input
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', background: '#16181f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '6px 12px', color: '#f0f1f5', fontSize: '12px', outline: 'none', width: '120px' }}
        />
      </div>

      {/* Lista */}
      <div style={{ padding: '0 20px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#7b7f96', fontSize: '14px' }}>
            Sin movimientos todavía
          </div>
        )}

        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <div style={{ fontSize: '11px', color: '#7b7f96', textTransform: 'uppercase', letterSpacing: '.08em', padding: '10px 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {dateLabel(date)}
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>
            {txs.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: tx.type === 'income' ? 'rgba(29,158,117,.15)' : tx.type === 'transfer' ? 'rgba(127,119,221,.15)' : 'rgba(216,90,48,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {tx.category?.emoji ?? (tx.type === 'income' ? '↓' : tx.type === 'transfer' ? '⇄' : '↑')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: '#f0f1f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.description || tx.category?.name || 'Sin descripción'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7b7f96', marginTop: '2px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {tx.account && (
                      <span style={{ padding: '1px 6px', borderRadius: '4px', background: `${tx.account.color}22`, color: tx.account.color, fontSize: '10px' }}>
                        {tx.account.name}
                      </span>
                    )}
                    {tx.category?.name}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 500, color: tx.type === 'income' ? '#5dcaa5' : tx.type === 'transfer' ? '#ccc8f8' : '#f0997b' }}>
                    {tx.type === 'income' ? '+' : '−'} {fmt(tx.amount, tx.currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/movimientos/nueva')}
        style={{ position: 'fixed', bottom: '90px', right: '20px', width: '52px', height: '52px', borderRadius: '50%', background: '#7f77dd', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(127,119,221,.4)', zIndex: 40 }}>
        +
      </button>
    </div>
  )
}
