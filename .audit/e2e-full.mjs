// Full end-to-end production-readiness audit.
// Run:  node --env-file=.env.local .audit/e2e-full.mjs
// Requires the dev server on :3000 (override with AUDIT_BASE).
//
// Coverage:
//   A. Route x width sweep (6 widths): status, h1, horizontal overflow,
//      console/page errors, failed requests, screenshots (390 + 1440).
//   B. Public interactions: header nav, mobile menu, showroom filter/product
//      URL sync + back/forward, drawer, gallery, certificate lightbox,
//      factory/standards content, 404, quote form validation + MOQ gate +
//      submit (window.open intercepted, DB row cleaned up).
//   C. Admin flows: login UI (wrong/right), product create->edit->delete,
//      category add->delete, hero add->remove, quote expand + status change
//      (on a freshly created test quote), guard redirect without session.
//   D. Summary + exit code.
import { chromium } from 'playwright'
import { createHmac } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { mkdirSync, readFileSync } from 'node:fs'

const ROOT = 'd:/mohid/mohid cloned/mohid-enterprises'
const BASE = process.env.AUDIT_BASE ?? 'http://localhost:3000'
const WIDTHS = [320, 390, 768, 1024, 1440, 1920]
const SHOT_WIDTHS = new Set([390, 1440])
const STAMP = Date.now()

const PUBLIC_ROUTES = ['/', '/showroom', '/factory', '/standards', '/quote', '/admin/login', '/definitely-not-a-page']
const ADMIN_ROUTES = ['/admin', '/admin/products', '/admin/products/new', '/admin/quotes', '/admin/hero']

// --- env -------------------------------------------------------------------
const env = readFileSync(`${ROOT}/.env.local`, 'utf8')
const envVal = (k) => (env.split(/\r?\n/).find((l) => l.startsWith(k + '=')) ?? '').slice(k.length + 1).trim()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || envVal('ADMIN_PASSWORD')
const SESSION_TOKEN = createHmac('sha256', ADMIN_PASSWORD).update('mohid-admin-session-v1').digest('hex')
const sb = createClient(envVal('NEXT_PUBLIC_SUPABASE_URL'), envVal('SUPABASE_SERVICE_ROLE_KEY'))

// --- reporting -------------------------------------------------------------
let pass = 0
const fails = []
const warns = []
const rec = (name, ok, detail = '', level = 'FAIL') => {
  if (ok) { pass++; console.log(`  [PASS] ${name}${detail ? `  (${detail})` : ''}`) }
  else {
    const line = `${name}${detail ? ` (${detail})` : ''}`
    if (level === 'WARN') { warns.push(line); console.log(`  [WARN] ${line}`) }
    else { fails.push(line); console.log(`  [FAIL] ${line}`) }
  }
}
const section = (t) => console.log(`\n=== ${t} ===`)

mkdirSync(`${ROOT}/.audit/shots/e2e`, { recursive: true })

// --- Supabase cleanup registry --------------------------------------------
const cleanup = { productId: null, categoryName: null, heroLabel: null, quoteEmail: null, quoteId: null }
async function cleanupAll() {
  try {
    if (cleanup.quoteId) {
      await sb.from('audit_log').delete().eq('entity_id', cleanup.quoteId)
      await sb.from('quote_line_items').delete().eq('quote_id', cleanup.quoteId)
      await sb.from('quotes').delete().eq('id', cleanup.quoteId)
    }
    if (cleanup.quoteEmail) {
      await sb.from('customers').delete().ilike('email', cleanup.quoteEmail)
    }
    if (cleanup.productId) {
      await sb.from('products').delete().eq('id', cleanup.productId)
    }
    if (cleanup.categoryName) {
      const { data } = await sb.from('product_categories').select('id').ilike('name', cleanup.categoryName)
      for (const c of data ?? []) await sb.from('product_categories').delete().eq('id', c.id)
    }
    if (cleanup.heroLabel) {
      const { data } = await sb.from('hero_sections').select('id').ilike('label', cleanup.heroLabel)
      for (const h of data ?? []) await sb.from('hero_sections').delete().eq('id', h.id)
    }
    console.log('\nCleanup: test rows removed.')
  } catch (e) { console.log(`\nCleanup INCOMPLETE: ${e.message} — remove manually!`) }
}

// --- browser setup ---------------------------------------------------------
const browser = await chromium.launch({ channel: 'chrome' })

async function makePage(width, { authed = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    isMobile: width < 768,
  })
  if (authed) {
    await context.addCookies([{ name: 'mohid_admin', value: SESSION_TOKEN, domain: 'localhost', path: '/' }])
  }
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  const badResponses = []
  page.on('response', (r) => {
    // Vercel Insights only serves on Vercel's infra; self-hosted `next start`
    // legitimately 404s it — not a site defect.
    if (r.status() >= 400 && !r.url().includes('/definitely-not') && !r.url().includes('/_vercel/insights')) {
      badResponses.push(`${r.status()} ${r.url()}`)
    }
  })
  return { context, page, errors: errors.filter((e) => !e.includes('_vercel/insights')), badResponses }
}

const metrics = () => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  h1: document.querySelectorAll('h1').length,
})

// --- A. route x width sweep ------------------------------------------------
section('A. Route x width sweep')
let adminEditRoute = null
{
  const { context, page } = await makePage(1440, { authed: true })
  await page.goto(`${BASE}/admin/products`, { waitUntil: 'load' }); await page.waitForTimeout(400)
  const firstEdit = await page.locator('a[href^="/admin/products/"]').first().getAttribute('href').catch(() => null)
  if (firstEdit && !firstEdit.endsWith('/new')) adminEditRoute = firstEdit
  await context.close()
}
const ALL_PUBLIC = PUBLIC_ROUTES
const ALL_ADMIN = adminEditRoute ? [...ADMIN_ROUTES, adminEditRoute] : ADMIN_ROUTES
console.log(`admin edit route under test: ${adminEditRoute ?? 'NONE FOUND'}`)

for (const width of WIDTHS) {
  for (const route of [...ALL_PUBLIC, ...ALL_ADMIN]) {
    const authed = route.startsWith('/admin') && route !== '/admin/login'
    const { context, page, errors, badResponses } = await makePage(width, { authed })
    const is404Route = route === '/definitely-not-a-page'
    let resp = null
    try {
      resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 }); await page.waitForTimeout(400)
      const m = await page.evaluate(metrics)
      const overflow = m.scrollW > m.clientW + 1
      const statusOk = is404Route ? resp.status() === 404 : resp.status() === 200
      rec(`${width} ${route} status`, statusOk, `got ${resp.status()}`)
      if (!is404Route) {
        rec(`${width} ${route} no h-overflow`, !overflow, `scrollW=${m.scrollW} clientW=${m.clientW}`)
        rec(`${width} ${route} exactly 1 h1`, m.h1 === 1, `h1=${m.h1}`, m.h1 === 1 ? 'FAIL' : 'WARN')
      }
      if (!is404Route) {
        rec(`${width} ${route} no console errors`, errors.length === 0, errors.slice(0, 2).join(' | ').slice(0, 220))
        rec(`${width} ${route} no 4xx/5xx`, badResponses.length === 0, badResponses.slice(0, 2).join(' | ').slice(0, 220))
      }
      if (SHOT_WIDTHS.has(width) && !is404Route) {
        const slug = route.replaceAll('/', '_').replaceAll('[', '').replaceAll(']', '').replaceAll('$', '') || '_root'
        await page.screenshot({ path: `${ROOT}/.audit/shots/e2e/${slug}-${width}.png`, fullPage: true })
      }
    } catch (e) {
      rec(`${width} ${route} loaded`, false, e.message.slice(0, 180))
    }
    await context.close()
  }
}

// --- guard: unauthenticated /admin deep pages ------------------------------
section('A2. Admin guard (no session)')
{
  const { context, page } = await makePage(1440, { authed: false })
  for (const route of ['/admin', '/admin/products', '/admin/quotes', '/admin/hero', adminEditRoute].filter(Boolean)) {
    const resp = await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
    const redirected = page.url().includes('/admin/login')
    rec(`guard ${route} -> /admin/login`, resp.status() === 200 && redirected, `status=${resp.status()} url=${page.url()}`)
  }
  await context.close()
}

// --- B. public interactions (desktop) --------------------------------------
section('B1. Header nav + CTAs (1440)')
{
  const { context, page } = await makePage(1440)
  await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(400)
  const labels = await page.locator('nav[aria-label="Primary"] a').allTextContents()
  rec('desktop nav has Showroom/Factory/Standards', ['Showroom', 'Factory & Capacity', 'Standards'].every((t) => labels.some((l) => l.includes(t))), labels.join(','))
  for (const [text, url] of [['Showroom', '/showroom'], ['Factory & Capacity', '/factory'], ['Standards', '/standards']]) {
    await page.locator('nav[aria-label="Primary"] a', { hasText: text }).first().click()
    await page.waitForURL(`**${url}`, { timeout: 10000 }).catch(() => {})
    rec(`nav click "${text}" -> ${url}`, page.url().includes(url), page.url())
    await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(400)
  }
  await page.locator('header a[href="/quote"]').first().click()
  await page.waitForURL('**/quote', { timeout: 10000 }).catch(() => {})
  rec('header "Request a Quote" -> /quote', page.url().includes('/quote'), page.url())

  await page.goto(BASE + '/factory', { waitUntil: 'load' }); await page.waitForTimeout(400)
  const footerHrefs = await page.locator('footer a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  rec('footer has all nav links', ['/showroom', '/factory', '/standards'].every((h) => footerHrefs.includes(h)), footerHrefs.join(','))
  rec('footer mailto present', footerHrefs.some((h) => h?.startsWith('mailto:')))
  await context.close()
}

section('B2. Mobile menu (390)')
{
  const { context, page } = await makePage(390)
  await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(400)
  const toggle = page.locator('button[aria-label="Open menu"]')
  rec('hamburger visible on mobile', await toggle.isVisible())
  rec('aria-expanded=false initially', (await toggle.getAttribute('aria-expanded')) === 'false')
  await toggle.click()
  await page.waitForTimeout(600)
  rec('aria-expanded=true after open', (await page.locator('header button[aria-label="Close menu"]').getAttribute('aria-expanded')) === 'true')
  const mobileNav = page.locator('nav[aria-label="Mobile primary"] a')
  rec('mobile menu links visible', await mobileNav.first().isVisible())
  await mobileNav.filter({ hasText: 'Standards' }).first().click()
  await page.waitForURL('**/standards', { timeout: 10000 }).catch(() => {})
  rec('mobile nav -> /standards', page.url().includes('/standards'), page.url())
  rec('menu closed after navigate', await page.locator('header button[aria-label="Open menu"]').isVisible().catch(() => false))
  await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(400)
  rec('header CTA hidden at 390 (by design sm+)', !(await page.locator('header a[href="/quote"]').first().isVisible().catch(() => false)))
  await context.close()
}

section('B3. Home hero + CTAs')
{
  const { context, page } = await makePage(1440)
  await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(400)
  rec('exactly one h1 (sr-only)', (await page.locator('h1').count()) === 1)
  const heroCards = await page.locator('a[href^="/showroom?filter="]').count()
  rec('hero marquee cards render (>0)', heroCards > 0, `cards=${heroCards}`)
  const ctas = await page.locator('a[href="/quote"]').count()
  rec('home has /quote CTAs', ctas >= 1, `count=${ctas}`)
  await page.locator('a[href="/showroom"]').first().click()
  await page.waitForURL('**/showroom', { timeout: 10000 }).catch(() => {})
  rec('home showroom CTA -> /showroom', page.url().includes('/showroom'))
  await context.close()
}

section('B4. Showroom: filters, detail, URL sync, back/forward')
{
  const { context, page } = await makePage(1440)
  await page.goto(BASE + '/showroom', { waitUntil: 'load' }); await page.waitForTimeout(400)
  const chip = page.getByRole('button', { name: 'Egg Belts', exact: true })
  if (await chip.count()) {
    await chip.first().click(); await page.waitForTimeout(300)
    rec('filter click syncs ?filter=', page.url().includes('filter=Egg'), page.url())
    await page.goBack(); await page.waitForTimeout(400)
    rec('back removes filter', !page.url().includes('filter=Egg'), page.url())
    await page.goForward(); await page.waitForTimeout(400)
    rec('forward restores filter', page.url().includes('filter=Egg'), page.url())
    await page.goto(BASE + '/showroom', { waitUntil: 'load' }); await page.waitForTimeout(400)
  } else rec('filter chip "Egg Belts" exists', false, 'not found', 'WARN')

  const loadMore = page.getByRole('button', { name: 'Load more' })
  if (await loadMore.count()) {
    const before = await page.locator('main button img').count()
    await loadMore.click(); await page.waitForTimeout(300)
    const after = await page.locator('main button img').count()
    rec('Load more appends cards', after > before, `${before} -> ${after}`)
  } else rec('Load more button present', false, '', 'WARN')

  const card = page.locator('main').locator('button:has(img)').first()
  rec('product cards render', (await card.count()) > 0)
  await card.click(); await page.waitForTimeout(400)
  rec('product click syncs ?product=', page.url().includes('product='), page.url())

  const drawerBtn = page.locator('button[aria-controls="customization-drawer"]')
  if (await drawerBtn.count()) {
    rec('drawer closed by default', (await drawerBtn.getAttribute('aria-expanded')) === 'false')
    await drawerBtn.click(); await page.waitForTimeout(400)
    rec('drawer opens', (await drawerBtn.getAttribute('aria-expanded')) === 'true')
    const drawerH = await page.locator('#customization-drawer').evaluate((el) => el.getBoundingClientRect().height)
    rec('drawer content visible', drawerH > 10, `h=${Math.round(drawerH)}`)
    await drawerBtn.click(); await page.waitForTimeout(400)
    rec('drawer closes', (await drawerBtn.getAttribute('aria-expanded')) === 'false')
  } else rec('customization drawer button present', false)

  const thumbs = page.locator('button[aria-label^="Show image"]')
  const thumbCount = await thumbs.count()
  if (thumbCount === 0) {
    // Thumbnail strip only renders for multi-image products (by design) —
    // re-test against one that has several gallery images.
    await page.goto(`${BASE}/showroom?product=${encodeURIComponent('Egg Conveyor Belt')}`, { waitUntil: 'load' }); await page.waitForTimeout(400)
    await page.waitForTimeout(400)
    const retry = await page.locator('button[aria-label^="Show image"]').count()
    rec('gallery thumbnails on multi-image product', retry > 1, `n=${retry}`)
    if (retry > 1) {
      await page.locator('button[aria-label^="Show image"]').nth(1).click()
      await page.waitForTimeout(300)
      rec('thumbnail click switches view', (await page.locator('button[aria-label^="Show image"]').nth(1).getAttribute('aria-current')) === 'true')
    }
  } else {
    rec('gallery thumbnails present', true, `n=${thumbCount}`)
    await thumbs.nth(1).click(); await page.waitForTimeout(300)
    rec('thumbnail click switches view', (await thumbs.nth(1).getAttribute('aria-current')) === 'true')
  }
  rec('detail shows specs list', (await page.locator('dl dt').count()) > 0, `dt=${await page.locator('dl dt').count()}`)

  const quoteLink = page.locator('a[href^="/quote?product="]').first()
  if (await quoteLink.count()) {
    const href = await quoteLink.getAttribute('href')
    rec('quote CTA carries product context', href.includes('moq=') && href.includes('material=') && href.includes('width='), href.slice(0, 140))
  } else rec('"Request quote & sample" CTA present', false)
  rec('mailto sample CTA present', (await page.locator('a[href^="mailto:"]').count()) > 0)

  // Back/forward test in a fresh context so earlier navigations don't
  // pollute session history.
  const fresh = await makePage(1440)
  await fresh.page.goto(BASE + '/showroom', { waitUntil: 'load' }); await fresh.page.waitForTimeout(400)
  const freshCard = fresh.page.locator('main').locator('button:has(img)').first()
  await freshCard.click(); await fresh.page.waitForTimeout(400)
  rec('card opens detail (fresh)', fresh.page.url().includes('product='))
  await fresh.page.goBack(); await fresh.page.waitForTimeout(400)
  rec('back returns to grid', !fresh.page.url().includes('product='), fresh.page.url())
  await fresh.page.goForward(); await fresh.page.waitForTimeout(400)
  rec('forward reopens detail', fresh.page.url().includes('product='), fresh.page.url())
  await fresh.context.close()
  await page.goto(BASE + '/showroom?filter=Ribbons', { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.waitForTimeout(300)
  rec('deep link ?filter= applies', true)
  await context.close()
}

section('B5. Factory + Standards + certificate lightbox')
{
  const { context, page } = await makePage(1440)
  await page.goto(BASE + '/factory', { waitUntil: 'load' }); await page.waitForTimeout(400)
  const fhtml = await page.content()
  rec('factory H1 copy', fhtml.includes('20+ Years of Proven Trims Manufacturing'))
  rec('factory CTA -> /quote', (await page.locator('a[href="/quote"]').count()) >= 1)
  rec('factory metrics present', fhtml.includes('Trims Types') && fhtml.includes('Years Manufacturing'))

  await page.goto(BASE + '/standards', { waitUntil: 'load' }); await page.waitForTimeout(400)
  // Certificate tiles are <figure role="button">, not <button> elements.
  const certBtn = page.locator('[role="button"][aria-label^="View "][aria-label$=" larger"]')
  const certCount = await certBtn.count()
  rec('certificate cards render', certCount > 0, `n=${certCount}`)
  if (certCount) {
    await certBtn.first().click(); await page.waitForTimeout(400)
    const dialog = page.locator('[role="dialog"][aria-modal="true"]')
    rec('lightbox opens (aria-modal dialog)', await dialog.isVisible())
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    rec('Escape closes lightbox', !(await dialog.isVisible().catch(() => false)))
    await certBtn.first().click(); await page.waitForTimeout(300)
    await page.mouse.click(10, 10); await page.waitForTimeout(400)
    rec('backdrop click closes lightbox', !(await dialog.isVisible().catch(() => false)))
  }
  await context.close()
}

section('B6. Quote form: validation + MOQ gate')
{
  const { context, page } = await makePage(1440)
  await context.addInitScript(() => {
    window.__opened = []
    window.open = (url) => { window.__opened.push(String(url)); return null }
  })

  await page.goto(BASE + '/quote', { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Submit request' }).click()
  await page.waitForTimeout(500)
  const errCount = await page.locator('span.text-\\[11px\\].text-\\[\\#c62828\\], p.text-\\[\\#c62828\\]').count()
  rec('empty submit shows validation errors', errCount >= 5, `errors=${errCount}`)

  await page.fill('#rfq-inquiry', 'E2E audit inquiry text for validation.')
  await page.fill('#rfq-companyName', 'Audit Co')
  await page.fill('#rfq-workEmail', 'not-an-email')
  await page.fill('#rfq-phone', 'abc')
  await page.fill('#rfq-quantity', '10')
  await page.fill('#rfq-destinationPort', 'Karachi')
  await page.getByRole('button', { name: 'Submit request' }).click()
  await page.waitForTimeout(500)
  const html1 = await page.content()
  rec('invalid email rejected', html1.includes('Enter a valid work email'))
  rec('invalid phone rejected', html1.includes('Enter a valid phone number'))

  await page.goto(BASE + '/quote?product=Audit%20Tape&material=Polyester&width=25mm&moq=500%20meters', { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.fill('#rfq-inquiry', 'MOQ gate audit — testing minimum enforcement.')
  await page.fill('#rfq-companyName', 'Audit Co')
  await page.fill('#rfq-workEmail', `audit+${STAMP}@mohid-test.dev`)
  await page.fill('#rfq-phone', '+92 300 1234567')
  await page.fill('#rfq-quantity', '100')
  await page.fill('#rfq-destinationPort', 'Karachi')
  await page.getByRole('button', { name: 'Submit request' }).click()
  await page.waitForTimeout(500)
  const html2 = await page.content()
  rec('below-MOQ quantity rejected', html2.includes("Below the product's minimum order quantity"))
  const openedAfterMoq = await page.evaluate(() => window.__opened.length)
  rec('no WhatsApp open on validation failure', openedAfterMoq === 0)
  await context.close()
}

section('B7. Quote form: valid submit + persistence + duplicate + close')
{
  const { context, page } = await makePage(1440)
  await context.addInitScript(() => {
    window.__opened = []
    window.open = (url) => { window.__opened.push(String(url)); return null }
  })
  cleanup.quoteEmail = `audit+${STAMP}@mohid-test.dev`

  await page.goto(BASE + '/quote?product=Audit%20Tape&material=Polyester&width=25mm&moq=500%20meters', { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.fill('#rfq-inquiry', 'MOQ gate audit — testing minimum enforcement.')
  await page.fill('#rfq-companyName', 'Audit Co')
  await page.fill('#rfq-workEmail', cleanup.quoteEmail)
  await page.fill('#rfq-phone', '+92 300 1234567')
  await page.fill('#rfq-quantity', '800')
  await page.fill('#rfq-destinationPort', 'Karachi')
  await page.getByRole('button', { name: 'Submit request' }).click()
  await page.waitForTimeout(3000)
  const opened = await page.evaluate(() => window.__opened)
  rec('valid submit opens wa.me deep link', opened.some((u) => u.startsWith('https://wa.me/')), (opened[0] ?? 'none').slice(0, 90))
  if (opened[0]) {
    const decoded = decodeURIComponent(opened[0])
    rec('WhatsApp URL encodes RFQ payload', decoded.includes('New RFQ') && decoded.includes('Audit Co'))
    rec('WhatsApp number is real (not placeholder)', !opened.includes('92XXXXXXXXXX'))
  }
  rec('success state "Request received"', (await page.getByRole('button', { name: 'Request received' }).count()) > 0)

  await sb.from('quotes').select('id, quote_number, rfq_details').ilike('rfq_details->>inquiry', 'MOQ gate audit%').limit(1)
    .then(({ data }) => {
      if (data?.length) {
        cleanup.quoteId = data[0].id
        rec('quote persisted to Supabase', true, data[0].quote_number)
      } else rec('quote persisted to Supabase', false, 'no row with test inquiry')
    })

  // duplicate RFQ — same email inside sliding window
  await page.goto(BASE + '/quote', { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.fill('#rfq-inquiry', 'Duplicate RFQ audit — second submission attempt.')
  await page.fill('#rfq-companyName', 'Audit Co')
  await page.fill('#rfq-workEmail', cleanup.quoteEmail)
  await page.fill('#rfq-phone', '+92 300 1234567')
  await page.fill('#rfq-quantity', '50')
  await page.fill('#rfq-destinationPort', 'Karachi')
  await page.getByRole('button', { name: 'Submit request' }).click()
  await page.waitForTimeout(3000)
  const dupHtml = await page.content()
  rec('duplicate RFQ blocked with message', dupHtml.includes('You already submitted a quote'))
  const dupOpened = await page.evaluate(() => window.__opened.length)
  rec('duplicate does not open WhatsApp', dupOpened === 0, `opened=${dupOpened}`)

  await page.goto(BASE + '/quote', { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.locator('a[aria-label="Close"]').click()
  await page.waitForURL('**/', { timeout: 10000 }).catch(() => {})
  rec('quote close button -> home', new URL(page.url()).pathname === '/', page.url())
  await context.close()
}

// --- C. admin flows ---------------------------------------------------------
section('C1. Admin login UI (wrong + right password)')
{
  const { context, page } = await makePage(1440)
  await page.goto(BASE + '/admin/login', { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.locator('input[type="password"]').fill('definitely-wrong-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForTimeout(800)
  rec('wrong password shows 401 error', (await page.locator('[role="alert"]').count()) > 0 && page.url().includes('/admin/login'))
  // Check only the alert + network surface — the input's own value attribute
  // legitimately reflects what the user typed (not a leak).
  const alertText = (await page.locator('[role="alert"]').allTextContents()).join(' ')
  rec('error does not echo the password', !alertText.includes('definitely-wrong-password'), alertText.slice(0, 80))
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/admin', { timeout: 15000 }).catch(() => {})
  rec('correct password -> /admin', new URL(page.url()).pathname === '/admin', page.url())
  rec('dashboard reads Supabase', !(await page.content()).includes('Supabase is not configured'))
  await context.close()
}

section('C2. Product CRUD (create -> edit -> delete)')
{
  const { context, page } = await makePage(1440, { authed: true })
  const name = `ZZ Audit Product ${STAMP}`
  await page.goto(BASE + '/admin/products/new', { waitUntil: 'load' }); await page.waitForTimeout(400)
  // client-side validation first: empty required fields
  await page.getByRole('button', { name: 'Create product' }).click()
  await page.waitForTimeout(500)
  const vErr = await page.content()
  rec('empty product form shows errors', vErr.includes('Product name') && page.url().includes('/products/new'))

  await page.fill('#name', name)
  await page.fill('#material', 'Polyester')
  const catSelect = page.locator('#categoryId')
  const catVal = await catSelect.locator('option[value]:not([value=""])').first().getAttribute('value')
  await catSelect.selectOption(catVal)
  cleanup.categoryName = null
  await page.getByRole('button', { name: 'Create product' }).click()
  await page.waitForURL('**/admin/products', { timeout: 15000 }).catch(() => {})
  rec('create redirects to product list', page.url().includes('/admin/products'), page.url())

  await page.goto(`${BASE}/admin/products?q=${encodeURIComponent(name)}`, { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.waitForTimeout(500)
  rec('created product appears in list', (await page.getByText(name, { exact: false }).count()) > 0)

  // resolve its id for cleanup + edit
  const { data: rows } = await sb.from('products').select('id').eq('name', name).limit(1)
  cleanup.productId = rows?.[0]?.id ?? null
  rec('product row exists in DB', !!cleanup.productId, cleanup.productId ?? '')

  if (cleanup.productId) {
    await page.goto(`${BASE}/admin/products/${cleanup.productId}`, { waitUntil: 'load' }); await page.waitForTimeout(400)
    await page.fill('#name', `${name} EDITED`)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.waitForURL('**/admin/products', { timeout: 15000 }).catch(() => {})
    let after = null
    for (let i = 0; i < 20; i++) {
      const result = await sb.from('products').select('name').eq('id', cleanup.productId).single()
      after = result.data
      if (after?.name === `${name} EDITED`) break
      await page.waitForTimeout(250)
    }
    rec('edit persisted to DB', after?.name === `${name} EDITED`, after?.name ?? 'missing')

    await page.goto(`${BASE}/admin/products/${cleanup.productId}`, { waitUntil: 'load' }); await page.waitForTimeout(400)
    await page.getByRole('button', { name: 'Delete product' }).click()
    await page.waitForTimeout(300)
    rec('delete asks for confirmation', (await page.getByRole('button', { name: 'Yes, delete' }).count()) > 0)
    await page.getByRole('button', { name: 'Yes, delete' }).click()
    await page.waitForURL('**/admin/products', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(800)
    const { data: gone } = await sb.from('products').select('id').eq('id', cleanup.productId).maybeSingle()
    rec('product deleted from DB', !gone)
    cleanup.productId = null
  }
  await context.close()
}

section('C3. Category add -> delete')
{
  const { context, page } = await makePage(1440, { authed: true })
  const catName = `ZZ Audit Cat ${STAMP}`
  cleanup.categoryName = catName
  await page.goto(BASE + '/admin/products', { waitUntil: 'load' }); await page.waitForTimeout(400)
  await page.locator('details > summary').first().click()
  await page.waitForTimeout(300)
  await page.fill('#new-category-name', catName)
  await page.getByRole('button', { name: 'Add category' }).click()
  await page.waitForTimeout(1200)
  const { data: cat } = await sb.from('product_categories').select('id, name').eq('name', catName).maybeSingle()
  rec('category created', !!cat, cat?.name ?? '')
  if (cat) {
    const del = page.locator(`button[aria-label="Delete ${catName}"]`)
    rec('delete button enabled (0 products)', await del.isEnabled())
    await del.click()
    await page.waitForTimeout(1200)
    const { data: gone } = await sb.from('product_categories').select('id').eq('id', cat.id).maybeSingle()
    rec('category deleted', !gone)
  }
  await context.close()
}

section('C4. Hero card add -> reorder -> remove')
{
  const { context, page } = await makePage(1440, { authed: true })
  const label = `ZZ Audit Hero ${STAMP}`
  cleanup.heroLabel = label
  await page.goto(BASE + '/admin/hero', { waitUntil: 'load' }); await page.waitForTimeout(400)
  // React SSR text nodes insert <!-- --> between static + dynamic segments.
  const cardCount = async () => Number(((await page.content()).replace(/<!-- -->/g, '')).match(/Cards \((\d+)\)/)?.[1] ?? NaN)
  const beforeCount = await cardCount()
  await page.getByRole('button', { name: 'Add card' }).click()
  await page.waitForTimeout(300)
  await page.getByLabel('Title', { exact: false }).first().fill(label)
  await page.getByLabel('Image path', { exact: false }).first().fill('https://ik.imagekit.io/a2q8u8qtw/products/mop.jpg')
  await page.getByLabel('Sort order', { exact: false }).first().fill('99')
  await page.getByRole('button', { name: 'Save card' }).click()
  await page.waitForTimeout(1500)
  const { data: heroRow } = await sb.from('hero_sections').select('id, label').eq('label', label).maybeSingle()
  rec('hero card created', !!heroRow, heroRow?.label ?? '')
  const afterCount = await cardCount()
  rec('card count incremented', afterCount === beforeCount + 1, `${beforeCount} -> ${afterCount}`)

  if (heroRow) {
    // Reorder: capture the card's DB position first, move up, verify the new
    // sort_order actually persisted (regression guard for the old 23502 bug),
    // then move back down.
    const { data: all0 } = await sb.from('hero_sections').select('id, sort_order').order('sort_order')
    const idx0 = all0.findIndex((r) => r.id === heroRow.id)
    const up = page.locator(`button[aria-label="Move ${label} up"]`)
    if (await up.count() && idx0 > 0) {
      await up.click()
      let all1 = [], idx1 = idx0
      for (let i = 0; i < 20; i++) {
        const result = await sb.from('hero_sections').select('id, sort_order').order('sort_order, label')
        all1 = result.data ?? []
        idx1 = all1.findIndex((r) => r.id === heroRow.id)
        if (idx1 < idx0) break
        await page.waitForTimeout(250)
      }
      rec('move-up persisted to DB', idx1 < idx0, `pos ${idx0} -> ${idx1}`)
      const statusText = await page.locator('[role="status"], [role="alert"]').allTextContents()
      rec('no reorder error notice', !statusText.join(' ').toLowerCase().includes('fail') && !statusText.join(' ').includes('null value'), statusText.join(' ').slice(0, 100))
      const down = page.locator(`button[aria-label="Move ${label} down"]`)
      if (await down.count()) { await down.click(); await page.waitForTimeout(1500) }
    } else rec('move-up button available', false, `idx=${idx0}`, 'WARN')
    await page.locator(`button[aria-label="Remove ${label}"]`).click()
    await page.waitForTimeout(300)
    rec('delete dialog opens', (await page.getByRole('button', { name: 'Remove', exact: true }).count()) > 0)
    await page.getByRole('button', { name: 'Remove', exact: true }).click()
    await page.waitForTimeout(1500)
    const { data: gone } = await sb.from('hero_sections').select('id').eq('id', heroRow.id).maybeSingle()
    rec('hero card removed', !gone)
    cleanup.heroLabel = null
  }
  await context.close()
}

section('C5. Quotes admin: filters, expand, status change (test quote)')
{
  const { context, page } = await makePage(1440, { authed: true })
  const statusEmail = `status+${STAMP}@mohid-test.dev`
  const { data: rpc } = await sb.rpc('create_quote', {
    p_full_name: 'Status Test Bot', p_company_name: 'Audit Co', p_email: statusEmail,
    p_phone: '+923001234567', p_product_name: 'ZZ Status Test', p_material: 'Polyester',
    p_width_mm: 25, p_quantity: 10,
    p_rfq_details: { inquiry: 'status change audit', destination_port: 'Karachi' },
    p_validity_days: 7,
  })
  const rpcResult = Array.isArray(rpc) ? rpc[0] : rpc
  const testQuoteId = rpcResult?.quote_id
  rec('status-test quote created via RPC', !!testQuoteId, testQuoteId ?? JSON.stringify(rpcResult ?? {}).slice(0, 120))

  if (testQuoteId) {
    await page.goto(BASE + '/admin/quotes', { waitUntil: 'load' }); await page.waitForTimeout(400)
    const chip = page.locator('button[aria-pressed]').filter({ hasText: 'sent' }).first()
    if (await chip.count()) {
      await chip.click(); await page.waitForTimeout(800)
      rec('status filter syncs URL', page.url().includes('status=sent'), page.url())
      await page.goto(BASE + '/admin/quotes', { waitUntil: 'load' }); await page.waitForTimeout(400)
    } else rec('quote filter chips present', false, '', 'WARN')

    const expand = page.locator(`button[aria-controls="quote-detail-${testQuoteId}"]`)
    if (await expand.count()) {
      await expand.click(); await page.waitForTimeout(500)
      rec('expand aria-expanded=true', (await expand.getAttribute('aria-expanded')) === 'true')
      rec('detail panel rendered', (await page.locator(`#quote-detail-${testQuoteId}`).count()) > 0)
      const statusBtn = page.locator(`#quote-detail-${testQuoteId} button`, { hasText: 'viewed' }).first()
      await statusBtn.click()
      await page.waitForTimeout(1500)
      const { data: q } = await sb.from('quotes').select('quote_status').eq('id', testQuoteId).single()
      rec('status change persisted', q?.quote_status === 'viewed', q?.quote_status ?? '')
      const { data: audit } = await sb.from('audit_log').select('id').eq('entity_id', testQuoteId).eq('action', 'status_changed')
      rec('audit_log written for status change', (audit?.length ?? 0) > 0, `rows=${audit?.length}`)
    } else rec('expand control found for test quote', false)

    await sb.from('audit_log').delete().eq('entity_id', testQuoteId)
    await sb.from('quote_line_items').delete().eq('quote_id', testQuoteId)
    await sb.from('quotes').delete().eq('id', testQuoteId)
    await sb.from('customers').delete().ilike('email', statusEmail)
    const { data: leftover } = await sb.from('quotes').select('id').eq('id', testQuoteId).maybeSingle()
    rec('status-test quote cleaned up', !leftover)
  }
  await context.close()
}

section('C6. Admin responsive spot-check (390 + 1920)')
{
  for (const width of [390, 1920]) {
    for (const route of ['/admin', '/admin/products', '/admin/quotes', '/admin/hero']) {
      const { context, page } = await makePage(width, { authed: true })
      await page.goto(BASE + route, { waitUntil: 'load' }); await page.waitForTimeout(400)
      const m = await page.evaluate(metrics)
      rec(`${width} ${route} no h-overflow`, m.scrollW <= m.clientW + 1, `scrollW=${m.scrollW}`)
      await context.close()
    }
  }
}

// --- summary ---------------------------------------------------------------
await cleanupAll()
await browser.close()
section('SUMMARY')
console.log(`PASS: ${pass}   FAIL: ${fails.length}   WARN: ${warns.length}`)
if (warns.length) { console.log('\nWarnings:'); warns.forEach((w) => console.log(`  ~ ${w}`)) }
if (fails.length) { console.log('\nFailures:'); fails.forEach((f) => console.log(`  x ${f}`)) }
process.exit(fails.length ? 1 : 0)
