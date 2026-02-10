import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Só protege /admin e subrotas
  const { pathname } = req.nextUrl
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
    return new NextResponse('Invalid auth', { status: 401 })
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  const [user, pass] = decoded.split(':')

  // Troque para o seu usuário e senha:
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
