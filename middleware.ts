import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Só protege /admin e subrotas
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const auth = req.headers.get('authorization')
  if (!auth) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    })
  }

  const [scheme, encoded] = auth.split(' ')
  if (scheme !== 'Basic' || !encoded) {
    return new NextResponse('Invalid auth', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    })
  }

  // ✅ Edge-safe: usa atob (Buffer não existe no middleware)
  let decoded = ''
  try {
    decoded = atob(encoded)
  } catch {
    return new NextResponse('Invalid auth', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    })
  }

  const [user, pass] = decoded.split(':')

  const USER = process.env.ADMIN_USER || 'admin'
  const PASS = process.env.ADMIN_PASS || '1234'

  if (user !== USER || pass !== PASS) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
