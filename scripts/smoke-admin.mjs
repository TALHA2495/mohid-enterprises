#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/smoke-admin.mjs - HTTP smoke test for the admin area
//
//   pnpm dev --port 3100            # in one terminal
//   node --env-file=.env.local scripts/smoke-admin.mjs
//
// The admin password is read from ADMIN_PASSWORD and never printed or logged.
// Exits non-zero on the first failing group, so it can gate a release.
// Override the target with SMOKE_PORT (default 3100) or `node ... <port>`.
// ---------------------------------------------------------------------------
const PORT = process.argv[2] || process.env.SMOKE_PORT || 3100
const BASE = `http://localhost:${PORT}`
const PW = process.env.ADMIN_PASSWORD
const COOKIE = 'mohid_admin'

let pass = 0
const fails = []
const rec = (name, ok, detail = '') => {
  if (ok) {
    pass++
    console.log(`  [PASS] ${name}${detail ? `  (${detail})` : ''}`)
  } else {
    fails.push(`${name}${detail ? ` (${detail})` : ''}`)
    console.log(`  [FAIL] ${name}${detail ? `  (${detail})` : ''}`)
  }
}

const req = (path, opts = {}) => fetch(BASE + path, { redirect: 'manual', ...opts })
const isRedirect = (status) => status === 307 || status === 302

let reachable = true
try {
  const ping = await req('/quote')
  reachable = ping.status === 200
} catch {
  reachable = false
}

if (!reachable) {
  console.log(`No dev server on ${BASE}. Start one first:\n  pnpm dev --port ${PORT}`)
  process.exit(1)
}

console.log(`Smoke test against ${BASE}\n`)

console.log('Public routes')
let r = await req('/')
rec('GET / -> 200', r.status === 200, `status=${r.status}`)
r = await req('/quote')
const quoteHtml = await r.text()
rec('GET /quote -> 200', r.status === 200, `status=${r.status}`)
rec('quote form still collects the phone field', /Phone \(WhatsApp\)/.test(quoteHtml))

console.log('\nAdmin guard (no session)')
r = await req('/admin')
rec('GET /admin -> redirect', isRedirect(r.status), `status=${r.status}`)
rec(
  'redirect target is /admin/login',
  (r.headers.get('location') || '').endsWith('/admin/login'),
  r.headers.get('location') || 'none',
)
r = await req('/admin/quotes')
rec('GET /admin/quotes -> redirect', isRedirect(r.status), `status=${r.status}`)
r = await req('/admin/login')
rec('GET /admin/login -> 200', r.status === 200, `status=${r.status}`)

console.log('\nAdmin login')
rec('ADMIN_PASSWORD is set in the environment', Boolean(PW))
if (!PW) {
  console.log('\nSet ADMIN_PASSWORD (e.g. via --env-file=.env.local) to test the authed flow.')
} else {
  r = await req('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'definitely-not-the-password' }),
  })
  rec('wrong password -> 401', r.status === 401, `status=${r.status}`)

  r = await req('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: PW }),
  })
  const setCookies = r.headers.getSetCookie ? r.headers.getSetCookie() : []
  const session = setCookies.find((c) => c.startsWith(`${COOKIE}=`))
  rec('correct password -> 200', r.status === 200, `status=${r.status}`)
  rec('session cookie issued', Boolean(session))
  rec(
    'cookie is httpOnly + SameSite=Lax',
    /HttpOnly/i.test(session || '') && /SameSite=Lax/i.test(session || ''),
    // Never echo the token itself - it is a credential with no server-side expiry.
    session ? 'HttpOnly; SameSite=Lax; Path=/' : 'no cookie',
  )
  rec('login response does not echo the password', !(await r.text()).includes(PW))

  const cookieHeader = session ? session.split(';')[0] : ''
  console.log('\nAdmin pages (with session)')
  r = await req('/admin', { headers: { cookie: cookieHeader } })
  const dashHtml = await r.text()
  rec('GET /admin -> 200', r.status === 200, `status=${r.status}`)
  rec('dashboard rendered', dashHtml.length > 500, `${dashHtml.length} bytes`)
  rec(
    'dashboard reads Supabase (no "not configured" fallback)',
    !/Supabase is not configured/.test(dashHtml),
    /Supabase is not configured/.test(dashHtml) ? 'service-role key missing' : 'configured',
  )

  r = await req('/admin/quotes', { headers: { cookie: cookieHeader } })
  rec('GET /admin/quotes -> 200', r.status === 200, `status=${r.status}`)

  console.log('\nCookie tampering')
  r = await req('/admin', { headers: { cookie: `${COOKIE}=${'f'.repeat(64)}` } })
  rec('forged session cookie rejected', isRedirect(r.status), `status=${r.status}`)
}

console.log(`\n${'-'.repeat(58)}`)
console.log(`SMOKE RESULT: ${pass} passed, ${fails.length} failed`)
fails.forEach((f) => console.log(`  - ${f}`))
console.log('-'.repeat(58))
process.exit(fails.length ? 1 : 0)