import { NextRequest, NextResponse } from 'next/server'

import { ADMIN_SESSION_COOKIE, computeSessionToken } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin.server'

// Rate-limit budget: 5 failed attempts per IP per 15 minutes, then 429.
const MAX_FAILED_ATTEMPTS = 5
const WINDOW_MINUTES = 15
const CLEANUP_AFTER_HOURS = 24
const FAILURE_DELAY_MS = 100

// Vercel puts the client IP first in x-forwarded-for.
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first || request.headers.get('x-real-ip') || 'unknown'
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Best-effort bookkeeping: a Supabase failure never blocks login outright —
// we degrade to the constant failure delay instead of locking the operator out.
async function isRateLimited(ip: string): Promise<boolean> {
  if (!supabaseAdmin) return false
  try {
    // Manual cleanup: purge rows past the 24-hour retention window.
    const staleBefore = new Date(Date.now() - CLEANUP_AFTER_HOURS * 60 * 60 * 1000)
    await supabaseAdmin.from('login_attempts').delete().lt('failed_at', staleBefore.toISOString())

    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
    const { count, error } = await supabaseAdmin
      .from('login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('failed_at', windowStart.toISOString())
    if (error) return false
    return (count ?? 0) >= MAX_FAILED_ATTEMPTS
  } catch {
    return false
  }
}

async function recordFailure(ip: string): Promise<void> {
  if (!supabaseAdmin) return
  try {
    await supabaseAdmin.from('login_attempts').insert({ ip })
  } catch {
    // Never fail the response because bookkeeping failed.
  }
}

async function clearFailures(ip: string): Promise<void> {
  if (!supabaseAdmin) return
  try {
    await supabaseAdmin.from('login_attempts').delete().eq('ip', ip)
  } catch {
    // Best-effort clean slate on success.
  }
}

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

  const ip = clientIp(request)

  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  if (!body.password || body.password !== expectedPassword) {
    await sleep(FAILURE_DELAY_MS) // constant delay slows brute-force; invisible to UX
    await recordFailure(ip)
    return NextResponse.json({ error: 'Incorrect password. Try again.' }, { status: 401 })
  }

  await clearFailures(ip)

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
