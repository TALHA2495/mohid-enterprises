import { NextRequest, NextResponse } from 'next/server'

import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/admin-auth'

// Next.js 16 convention: `proxy.ts` replaces the deprecated `middleware.ts`.
// Protects every /admin route; /admin/login stays reachable so the operator
// can authenticate — but an already-authenticated session is bounced to the
// dashboard so the login form can never be revisited mid-session.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    const authed = await isValidSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
    if (authed) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  const authed = await isValidSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
  if (!authed) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
