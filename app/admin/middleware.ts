import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization')

  if (!auth) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin"',
      },
    })
  }

  const [scheme, encoded] = auth.split(' ')

  if (scheme !== 'Basic') {
    return NextResponse.redirect(req.nextUrl)
  }

  const decoded = atob(encoded)
  const [user, pass] = decoded.split(':')

  const USER = process.env.ADMIN_USER!
  const PASS = process.env.ADMIN_PASS!

  if (user !== USER || pass !== PASS) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin"',
      },
    })
  }

  return NextResponse.next()
}
