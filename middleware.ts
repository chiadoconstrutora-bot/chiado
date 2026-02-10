import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function unauthorized() {
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Segurança extra: se NÃO for /admin, nem tenta autenticar
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const auth = req.headers.get('authorization')
  if (!auth) return unauthorized()

  const [scheme, encoded] = auth.split(' ')
  if (scheme !== 'Basic' || !encoded) return unauthorized()

  // Edge-safe (não usa Buffer)
  const decoded = atob(encoded)
  const [user, pass] = decoded.split(':')

  const USER = process.env.ADMIN_USER || 'admin'
  const PASS = process.env.ADMIN_PASS || '1234'

  if (user !== USER || pass !== PASS) return unauthorized()

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
