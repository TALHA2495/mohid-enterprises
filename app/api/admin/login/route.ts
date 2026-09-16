import { NextRequest, NextResponse } from 'next/server'

import { ADMIN_SESSION_COOKIE, computeSessionToken } from '@/lib/admin-auth'

// POST /api/admin/login — exchanges the admin password for an httpOnly session
// cookie (never a ?pwd= query param — those leak into URLs, history, and logs).
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { password?: string }
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!expectedPassword) {
    return NextResponse.json(
      { error: 'Server misconfigured: ADMIN_PASSWORD is not set. Add it to the environment and redeploy.' },
      { status: 500 },
    )
  }

  if (!body.password || body.password !== expectedPassword) {
    return NextResponse.json({ error: 'Incorrect password. Try again.' }, { status: 401 })
  }

  const token = await computeSessionToken(expectedPassword)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12, // 12-hour session
  })
  return response
}
