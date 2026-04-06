'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CuentasPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<any[]>([])
  const [fxRates, setFxRates] = useState({ blue: 1270, oficial: 1080, mep: 1255 })
  const [viewCur, setViewCur] = useState('orig')

  useEffect(() => {
    supabase.from('accounts').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setAccounts(data)
    })
    fetch('https://dolarapi.com/v1/dolares').then(r => r.json()).then(data => {
      const find = (n: string) => data.find((d: any) => d.nombre?.toLowerCase().includes(n))
      setFxRates({ blue: find('blue')?.venta ?? 1270, oficial: find('oficial')?.venta ?? 1080, mep: find('bolsa')?.venta ?? 1255 })
    }).catch(() => {})
  }, [])

  const fmt = (n: number, cur = 'ars') => cur === 'usd'
    ? 'U$D ' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '$' + Math.round(Math.abs(n)).toLocaleString('es-AR')

  const toARS = (acc: any) => acc.type?.startsWith('ars') ? Number(acc.balance) : Number(acc.balance) * fxRates.blue
  const toUSD = (acc: any) => acc.type?.startsWith('usd') ? Number(acc.balance) : Number(acc.balance) / fxRates.blue

  const debit  = accounts.filter(a => !a.type?.includes('credit'))
  const credit = accounts.filter(a => a.type?.includes('credit'))
  const totalARS  = debit.filter(a => a.type === 'ars-debit' || a.type === 'fintech').reduce((s, a) => s + Number(a.balance), 0)
  const totalUSD  = debit.filter(a => a.type === 'usd-debit').reduce((s, a) => s + Number(a.balance), 0)
  const totalDebt = credit.reduce((s, a) => s + Math.abs(Number(a.balance)), 0)
  const netWorth  = totalARS + totalUSD * fxRates.blue - totalDebt

  const displayBal = (acc: any) => {
    if (viewCur === 'usd') return fmt(toUSD(acc), 'usd')
    if (viewCur === 'ars') return fmt(toARS(acc), 'ars')
    return acc.type?.startsWith('usd') ? fmt(Number(acc.balance), 'usd') : fmt(Number(acc.balance), 'ars')
  }

  const TYPE_LABELS: Record<string, string> = {
    'ars-debit': 'Débito ARS', 'usd-debit': 'Débito USD',
    'ars-credit': 'Crédito ARS', 'usd-credit': 'Crédito USD', 'fintech': 'Fintech'
  }

  const cardGrad = (color: string, type: string) => {
    const bases: Record<string, string[]> = {
      'ars-debit': ['#1a2218','#0f1a10'], 'fintech': ['#1a2a3a','#0d1f2d'],
      'usd-debit': ['#0f1a2a','#091220'], 'ars-credit': ['#2a1a1a','#1f1010'],
      'usd-credit': ['#1a1228','#110d1e'],
    }
    const b = bases[type] ?? bases['fintech']
    return `linear-gradient(135deg,${color}30 0%,${color}0e 100%),linear-gradient(135deg,${b[0]},${b[1]})`
  }

  return (
    <div style={{ paddingTop: '20px' }}>

      {/* Header */}
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#7b7f96', letterSpacing: '.1em', textTransform: 'uppercase' }}>Finanzas</div>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#f0f1f5', marginTop: '2px' }}>Mis cuentas</h1>
        </div>
        <button onClick={() => router.push('/cuentas/nueva')} style={{ marginTop: '8px', padding: '7px 14px', background: 'rgba(127,119,221,0.12)', border: '1px solid #7f77dd', borderRadius: '8px', color: '#ccc8f8', fontSize: '12px', cursor: 'pointer' }}>
          + Agregar
        </button>
      </div>

      {/* FX Banner */}
      <div style={{ margin: '0 20px 14px', background: '#16181f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '10px 0', display: 'flex' }}>
        {[['Blue', fxRates.blue], ['Oficial', fxRates.oficial], ['MEP', fxRates.mep]].map(([label, val], i, arr) => (
          <div key={label as string} style={{ flex: 1, textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
            <div style={{ fontSize: '10px', color: '#7b7f96', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 500, color: '#f0f1f5' }}>${Math.round(val as number).toLocaleString('es-AR')}</div>
          </div>
        ))}
      </div>

      {/* Patrimonio */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ fontSize: '12px', color: '#7b7f96', marginBottom: '4px' }}>Patrimonio neto</div>
        <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 300, color: '#f0f1f5' }}>
          {viewCur === 'usd' ? fmt(netWorth / fxRates.blue, 'usd') : fmt(netWorth, 'ars')}
        </div>
        <div style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap' as const }}>
          <span style={{ fontSize: '12px', color: '#7b7f96' }}>ARS <strong style={{ color: '#5dcaa5' }}>{fmt(totalARS)}</strong></span>
          <span style={{ fontSize: '12px', color: '#7b7f96' }}>USD <strong style={{ color: '#5dcaa5' }}>{fmt(totalUSD, 'usd')}</strong></span>
          <span style={{ fontSize: '12px', color: '#7b7f96' }}>Deuda <strong style={{ color: '#f0997b' }}>{fmt(totalDebt)}</strong></span>
        </div>
      </div>

      {/* Toggle moneda */}
      <div style={{ display: 'flex', margin: '0 20px 14px', background: '#16181f', borderRadius: '10px', padding: '3px', gap: '2px' }}>
        {[['ARS','ars'],['USD','usd'],['Original','orig']].map(([label, val]) => (
          <div key={val} onClick={() => setViewCur(val)} style={{ flex: 1, textAlign: 'center', padding: '8px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer', background: viewCur === val ? '#1d2030' : 'transparent', color: viewCur === val ? '#f0f1f5' : '#7b7f96', fontWeight: viewCur === val ? 500 : 400, transition: 'all .15s' }}>
            {label}
          </div>
        ))}
      </div>

      {/* Cuentas débito */}
      <div style={{ padding: '0 20px 8px', fontSize: '11px', color: '#7b7f96', textTransform: 'uppercase', letterSpacing: '.08em' }}>
        Cuentas débito &amp; fintech
      </div>

      {debit.length === 0 && (
        <div onClick={() => router.push('/cuentas/nueva')} style={{ padding: '20px', margin: '0 20px', background: '#16181f', borderRadius: '14px', textAlign: 'center', color: '#7b7f96', fontSize: '14px', cursor: 'pointer' }}>
          + Agregá tu primera cuenta
        </div>
      )}

      {debit.map(acc => (
        <div key={acc.id} style={{ margin: '0 20px 10px', borderRadius: '16px', padding: '16px 18px', background: cardGrad(acc.color ?? '#7f77dd', acc.type), border: `1px solid ${acc.color ?? '#7f77dd'}44`, color: 'white', position: 'relative' as const }}>
          <div style={{ position: 'absolute' as const, top: '12px', right: '14px', fontSize: '10px', padding: '3px 8px', borderRadius: '5px', background: 'rgba(255,255,255,.13)', color: 'rgba(255,255,255,.75)' }}>
            {TYPE_LABELS[acc.type] ?? acc.type}
          </div>
          <div style={{ fontSize: '11px', opacity: .6, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '3px' }}>{acc.bank}</div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '11px' }}>{acc.name}</div>
          <div style={{ fontSize: '11px', opacity: .6, marginBottom: '2px' }}>Saldo disponible</div>
          <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 300 }}>{displayBal(acc)}</div>
        </div>
      ))}

      {/* Tarjetas crédito */}
      {credit.length > 0 && (
        <>
          <div style={{ padding: '8px 20px', fontSize: '11px', color: '#7b7f96', textTransform: 'uppercase', letterSpacing: '.08em' }}>Tarjetas de crédito</div>
          {credit.map(acc => {
            const used  = Math.abs(Number(acc.balance))
            const pct   = Math.min(Math.round(used / (acc.limit_amount ?? 1) * 100), 100)
            const avail = (acc.limit_amount ?? 0) - used
            return (
              <div key={acc.id} style={{ margin: '0 20px 10px', borderRadius: '16px', padding: '16px 18px', background: cardGrad(acc.color ?? '#d85a30', acc.type), border: `1px solid ${acc.color ?? '#d85a30'}44`, color: 'white', position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, top: '12px', right: '14px', fontSize: '10px', padding: '3px 8px', borderRadius: '5px', background: 'rgba(255,255,255,.13)', color: 'rgba(255,255,255,.75)' }}>
                  {TYPE_LABELS[acc.type] ?? acc.type}
                </div>
                <div style={{ fontSize: '11px', opacity: .6, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '3px' }}>{acc.bank}</div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '11px' }}>{acc.name}</div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', opacity: .55, marginBottom: '2px' }}>Consumido</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 300 }}>{displayBal(acc)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', opacity: .55, marginBottom: '2px' }}>Disponible</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 300, opacity: .8 }}>{fmt(avail)}</div>
                  </div>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,.15)', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(255,255,255,.55)', borderRadius: '10px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: .65 }}>
                  <span>{pct}% usado</span>
                  <span>Cierre día {acc.closing_day} · Vence día {(acc.closing_day ?? 15) + (acc.payment_days ?? 10)}</span>
                </div>
              </div>
            )
          })}
        </>
      )}

      <div style={{ height: '20px' }} />
    </div>
  )
}