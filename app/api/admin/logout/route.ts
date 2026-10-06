import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/admin-auth'

// POST /api/admin/logout — clears the httpOnly session cookie. Session-gated:
// an unauthenticated caller gets 401 (there is nothing to log out of).
// Cookie attributes mirror the login route exactly.
export async function POST() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: 'Session expired — sign in again.' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
