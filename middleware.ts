import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function unauthorized() {
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  })
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // TRAVA TOTAL: não faz nada fora do /admin
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const auth = req.headers.get('authorization')
  if (!auth) return unauthorized()

  const [scheme, encoded] = auth.split(' ')
  if (scheme !== 'Basic' || !encoded) return unauthorized()

  // Edge-safe (sem Buffer)
  let decoded = ''
  try {
    decoded = atob(encoded)
  } catch {
    return unauthorized()
  }

  const i = decoded.indexOf(':')
  const user = i >= 0 ? decoded.slice(0, i) : ''
  const pass = i >= 0 ? decoded.slice(i + 1) : ''

  const USER = process.env.ADMIN_USER || ''
  const PASS = process.env.ADMIN_PASS || ''

  // Se não existir env na Vercel, bloqueia (pra você perceber)
  if (!USER || !PASS) return unauthorized()

  if (user !== USER || pass !== PASS) return unauthorized()

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
