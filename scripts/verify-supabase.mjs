#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/verify-supabase.mjs - end-to-end check of the Mohid Enterprises schema
//
//   node --env-file=.env.local scripts/verify-supabase.mjs
//
// Keys come from the environment and are NEVER printed (presence only).
// Writes 4 test rows through the public `create_quote` RPC, asserts them, then
// deletes them again. orders / invoices / payments are deliberately NOT touched
// here: payments are write-once (DELETE is blocked by a trigger), so the ledger
// is verified inside a rolled-back transaction - see supabase/README.md 4b.
// ---------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js'

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY

const TEST_EMAIL = `verify+${Date.now()}@mohid-verify.test`
const TEST_PHONE = '+923000000000'
const QUOTE_ID_RE = /^Q-\d{8}-[0-9A-F]{6}$/
const TABLES = [
  'customers',
  'products',
  'quotes',
  'quote_line_items',
  'orders',
  'invoices',
  'payments',
  'audit_log',
]

let passed = 0
const failures = []

const ok = (n, d = '') => {
  passed++
  console.log(`  [PASS] ${n}${d ? `  (${d})` : ''}`)
}
const bad = (n, d = '') => {
  failures.push(`${n}${d ? ` (${d})` : ''}`)
  console.log(`  [FAIL] ${n}${d ? `  (${d})` : ''}`)
}
const assert = (n, cond, d = '') => (cond ? ok(n, d) : bad(n, d))
const section = (t) => console.log(`\n${t}`)
const err = (e) => (e ? `${e.code ?? ''} ${e.message ?? e}`.trim() : '')

// --- 1. configuration ------------------------------------------------------
section('1. Configuration')
assert('NEXT_PUBLIC_SUPABASE_URL present', Boolean(URL_))
assert('NEXT_PUBLIC_SUPABASE_ANON_KEY present', Boolean(ANON))
assert('SUPABASE_SERVICE_ROLE_KEY present', Boolean(SECRET))
if (!URL_ || !ANON) {
  console.log('\nCannot continue: public keys missing from .env.local.')
  process.exit(1)
}
console.log(`  project host: ${new URL(URL_).host}`)

const anon = createClient(URL_, ANON)
const admin = SECRET ? createClient(URL_, SECRET) : null

async function counts(client) {
  const out = {}
  for (const t of TABLES) {
    const { count, error } = await client.from(t).select('*', { count: 'exact', head: true })
    out[t] = error ? `ERR:${error.code ?? error.message}` : count
  }
  return out
}

let quoteId = null
let customerId = null

async function main() {
  // --- 2. reachability -----------------------------------------------------
  section('2. All 8 tables respond (anon key)')
  for (const t of TABLES) {
    const { error } = await anon.from(t).select('*', { count: 'exact', head: true })
    assert(`${t} reachable`, !error, err(error))
  }

  // --- 3. RLS --------------------------------------------------------------
  section('3. RLS locked: no direct client access')
  const read = await anon.from('quotes').select('id').limit(1)
  assert(
    'anon SELECT quotes -> 0 rows',
    !read.error && (read.data ?? []).length === 0,
    read.error ? err(read.error) : `rows=${(read.data ?? []).length}`,
  )

  const write = await anon
    .from('customers')
    .insert({ email: 'rls-probe@mohid-verify.test', phone: '0', name: 'probe' })
  assert(
    'anon INSERT customers -> rejected',
    Boolean(write.error),
    write.error ? err(write.error) : 'INSERT SUCCEEDED - RLS IS NOT LOCKED',
  )

  if (!admin) {
    console.log('\nSUPABASE_SERVICE_ROLE_KEY missing: skipping admin, row and cleanup checks.')
    return
  }

  const before = await counts(admin)

  // --- 4. public intake RPC ------------------------------------------------
  section('4. Public intake: create_quote() RPC (anon key)')
  const args = {
    p_full_name: 'Verify Bot',
    p_company_name: 'Mohid Verify',
    p_email: TEST_EMAIL,
    p_phone: TEST_PHONE,
    p_product_name: 'Elastic Trim',
    p_material: 'Polyester',
    p_width_mm: 20,
    p_quantity: 500,
    p_rfq_details: {
      inquiry: 'automated verification run',
      destinationPort: 'Karachi',
      source: 'verify-supabase.mjs',
    },
    p_validity_days: 7,
  }

  const r1 = await anon.rpc('create_quote', args)
  assert('call #1 succeeds (duplicate = false)', !r1.error, err(r1.error))
  const row = Array.isArray(r1.data) ? r1.data[0] : r1.data
  quoteId = row?.quote_id ?? null
  customerId = row?.customer_id ?? null
  assert('quote_id format Q-YYYYMMDD-XXXXXX', QUOTE_ID_RE.test(String(quoteId)), String(quoteId))
  assert('customer_id returned', Boolean(customerId), String(customerId))
  assert('duplicate flag is false', row?.duplicate === false, String(row?.duplicate))

  const r2 = await anon.rpc('create_quote', args)
  const row2 = Array.isArray(r2.data) ? r2.data[0] : r2.data
  assert('call #2 detects the duplicate', row2?.duplicate === true, String(row2?.duplicate))
  assert('duplicate call returns the SAME quote_id', row2?.quote_id === quoteId, String(row2?.quote_id))

  const r3 = await anon.rpc('create_quote', { ...args, p_email: 'not-an-email' })
  assert(
    'invalid email is rejected server-side',
    Boolean(r3.error) && /invalid_email/.test(err(r3.error)),
    err(r3.error),
  )

  // --- 5. persisted rows ---------------------------------------------------
  section('5. Persisted rows (service key)')
  const cust = await admin.from('customers').select('*').eq('email', TEST_EMAIL).maybeSingle()
  assert('customers row created', Boolean(cust.data), err(cust.error))
  assert(
    'customer phone + company stored',
    cust.data?.phone === TEST_PHONE && cust.data?.company_name === 'Mohid Verify',
    `${cust.data?.phone} / ${cust.data?.company_name}`,
  )
  assert('create_quote returned the real customer id', cust.data?.id === customerId)
  if (cust.data?.id) customerId = cust.data.id

  const quotes = await admin.from('quotes').select('*').eq('customer_id', customerId)
  assert(
    'exactly ONE quote for the customer',
    (quotes.data ?? []).length === 1,
    `found ${(quotes.data ?? []).length}`,
  )
  const q = (quotes.data ?? [])[0]
  assert('quote_status = sent', q?.quote_status === 'sent', String(q?.quote_status))
  assert('quote_number is QT-####', /^QT-\d{4,}$/.test(String(q?.quote_number)), String(q?.quote_number))
  assert(
    'valid_until set after valid_from',
    Boolean(q?.valid_until) && new Date(q.valid_until) > new Date(q.valid_from),
    `${q?.valid_from} -> ${q?.valid_until}`,
  )
  assert(
    'rfq_details payload preserved',
    q?.rfq_details?.destinationPort === 'Karachi',
    JSON.stringify(q?.rfq_details),
  )

  const lines = await admin.from('quote_line_items').select('*').eq('quote_id', quoteId)
  assert(
    'quote_line_items snapshot created',
    (lines.data ?? []).length === 1,
    `found ${(lines.data ?? []).length}`,
  )
  const li = (lines.data ?? [])[0]
  assert(
    'line item specs correct',
    li?.product_name === 'Elastic Trim' &&
      li?.material === 'Polyester' &&
      Number(li?.width_mm) === 20 &&
      Number(li?.quantity_requested) === 500 &&
      li?.product_id === null,
    `${li?.product_name} / ${li?.material} / ${li?.width_mm}mm / ${li?.quantity_requested}m`,
  )

  const audit = await admin.from('audit_log').select('*').eq('entity_id', quoteId)
  assert('audit_log entry written', (audit.data ?? []).length === 1, `found ${(audit.data ?? []).length}`)
  const a = (audit.data ?? [])[0]
  assert(
    'audit entry is quote/created/web_form',
    a?.action === 'created' && a?.changed_by === 'web_form' && a?.entity_type === 'quote',
    `${a?.entity_type} / ${a?.action} / ${a?.changed_by}`,
  )

  // --- 6. admin read path (what /admin does) -------------------------------
  section('6. Admin read path (service-key counts, as on /admin)')
  const after = await counts(admin)
  const delta = (t) =>
    typeof before[t] === 'number' && typeof after[t] === 'number' ? after[t] - before[t] : 'n/a'
  for (const t of ['customers', 'quotes', 'quote_line_items', 'audit_log']) {
    assert(`${t} +1`, delta(t) === 1, `${before[t]} -> ${after[t]}`)
  }
  for (const t of ['products', 'orders', 'invoices', 'payments']) {
    assert(`${t} unchanged`, delta(t) === 0, `${before[t]} -> ${after[t]}`)
  }

  // --- 7. cleanup ----------------------------------------------------------
  section('7. Cleanup of test rows')
  const d1 = await admin.from('audit_log').delete().eq('entity_id', quoteId)
  const d2 = await admin.from('quote_line_items').delete().eq('quote_id', quoteId)
  const d3 = await admin.from('quotes').delete().eq('id', quoteId)
  const d4 = await admin.from('customers').delete().eq('id', customerId)
  assert('audit rows deleted', !d1.error, err(d1.error))
  assert('line items deleted', !d2.error, err(d2.error))
  assert('quote deleted', !d3.error, err(d3.error))
  assert('customer deleted', !d4.error, err(d4.error))

  const final = await counts(admin)
  for (const t of TABLES) {
    assert(`${t} back to baseline`, String(final[t]) === String(before[t]), `${before[t]} -> ${final[t]}`)
  }

  quoteId = null
  customerId = null
}

try {
  await main()
} catch (e) {
  bad('unexpected error', e?.message ?? String(e))
} finally {
  // best-effort cleanup if main() aborted half-way
  if (admin && (quoteId || customerId)) {
    console.log('\n  .. cleanup after failure')
    if (quoteId) {
      await admin.from('audit_log').delete().eq('entity_id', quoteId)
      await admin.from('quote_line_items').delete().eq('quote_id', quoteId)
      await admin.from('quotes').delete().eq('id', quoteId)
    }
    if (customerId) await admin.from('customers').delete().eq('id', customerId)
  }
  console.log(`\n${'-'.repeat(58)}`)
  console.log(`RESULT: ${passed} passed, ${failures.length} failed`)
  failures.forEach((f) => console.log(`  - ${f}`))
  console.log('-'.repeat(58))
  process.exit(failures.length ? 1 : 0)
}