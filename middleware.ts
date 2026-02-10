import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // só protege /admin
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

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
  if (scheme !== 'Basic') return NextResponse.next()

  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  const [user, pass] = decoded.split(':')

  if (user !== 'admin' || pass !== '1234') {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
