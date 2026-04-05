import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value
    ?? req.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)?.value

  const isLoginPage = req.nextUrl.pathname === '/login'

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/cuentas', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}