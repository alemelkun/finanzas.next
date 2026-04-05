'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/cuentas',      icon: '⊞', label: 'Cuentas'     },
  { href: '/movimientos',  icon: '↕', label: 'Movimientos' },
  { href: '/presupuestos', icon: '◎', label: 'Presupuesto' },
  { href: '/reportes',     icon: '↗', label: 'Reportes'    },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0e0f14', color: '#f0f1f5', fontFamily: 'var(--font-sans)' }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {children}
      </main>
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0e0f14', zIndex: 50 }}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', padding: '6px 16px', borderRadius: '10px', background: active ? 'rgba(127,119,221,0.12)' : 'transparent' }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontSize: '10px', color: active ? '#7f77dd' : '#7b7f96' }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}