import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function unauthorized() {
  return new NextResponse('Acesso restrito', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protege /admin e qualquer subrota
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASS

  // Se não configurou as envs, bloqueia
  if (!user || !pass) return unauthorized()

  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Basic ')) return unauthorized()

  const base64 = auth.split(' ')[1] ?? ''
  const decoded = Buffer.from(base64, 'base64').toString()
  const [u, p] = decoded.split(':')

  if (u !== user || p !== pass) return unauthorized()

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
