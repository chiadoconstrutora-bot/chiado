import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/admin/:path*'],
}

export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization')

  // Se não tem auth -> pede login
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

  // Edge-safe
  let decoded = ''
  try {
    decoded = atob(encoded)
  } catch {
    return new NextResponse('Invalid auth', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    })
  }

  const idx = decoded.indexOf(':')
  const user = idx >= 0 ? decoded.slice(0, idx) : ''
  const pass = idx >= 0 ? decoded.slice(idx + 1) : ''

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
