// ui-responsiveness-check audit — captures full-page screenshots at 4 widths.
import { chromium } from 'playwright'
import { readFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'd:/mohid/mohid cloned/mohid-enterprises'
const BASE = 'http://localhost:3222'
const WIDTHS = [1440, 1024, 768, 390]
const PUBLIC_ROUTES = ['/', '/showroom', '/factory', '/standards', '/quote', '/admin/login']
const ADMIN_ROUTES = ['/admin', '/admin/products', '/admin/hero', '/admin/quotes']

const outDir = join(ROOT, '.audit')
const shotsDir = join(outDir, 'shots')
mkdirSync(shotsDir, { recursive: true })

// ---------------------------------------------------------------------------
// Admin auth: POST /api/admin/login with the local ADMIN_PASSWORD (read from
// .env.local, never printed) and capture the httpOnly session cookie.
// ---------------------------------------------------------------------------
let adminCookie = null
try {
  const env = readFileSync(join(ROOT, '.env.local'), 'utf8')
  const line = env.split(/\r?\n/).find((l) => l.startsWith('ADMIN_PASSWORD='))
  if (line) {
    const password = line.slice('ADMIN_PASSWORD='.length).trim()
    const res = await fetch(BASE + '/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      const raw = res.headers
        .getSetCookie()
        .map((c) => c.split(';')[0])
        .find((c) => c.startsWith('mohid_admin='))
      adminCookie = raw ?? null
    }
  }
} catch {
  adminCookie = null
}
console.log('admin-auth: ' + (adminCookie ? 'ok' : 'skipped (public routes only)'))

const browser = await chromium.launch()
const results = []

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: 800 },
    deviceScaleFactor: 1,
    isMobile: width < 768,
  })
  if (adminCookie) {
    const [name, ...rest] = adminCookie.split('=')
    await context.addCookies([
      { name, value: rest.join('='), domain: 'localhost', path: '/' },
    ])
  }
  const page = await context.newPage()
  const horizontal = []

  page.on('load', async () => {
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    if (over > 1) horizontal.push(over)
  })

  for (const route of adminCookie ? [...PUBLIC_ROUTES, ...ADMIN_ROUTES] : PUBLIC_ROUTES) {
    const name = (route === '/' ? 'home' : route.replace(/\//g, '-')) + '-' + width
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(1200)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      await page.screenshot({ path: join(shotsDir, name + '.png'), fullPage: true })
      results.push({ route, width, overflow })
    } catch (err) {
      results.push({ route, width, error: String(err).slice(0, 120) })
    }
  }
  await context.close()
}

await browser.close()

// Vertical-stacking check for the portal drawer on a phone viewport.
let drawerTop = null
if (adminCookie) {
  const context = await browser.newContext({ viewport: { width: 390, height: 800 } })
  const [name, ...rest] = adminCookie.split('=')
  await context.addCookies([{ name, value: rest.join('='), domain: 'localhost', path: '/' }])
  const page = await context.newPage()
  try {
    await page.goto(BASE + '/admin', { waitUntil: 'networkidle', timeout: 30000 })
    await page.click('button[aria-controls="admin-mobile-nav"]')
    await page.waitForTimeout(600)
    drawerTop = await page.evaluate(() => {
      const el = document.getElementById('admin-mobile-nav')
      if (!el) return null
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        bottom: Math.round(rect.bottom),
        right: Math.round(rect.right),
        position: style.position,
        zIndex: style.zIndex,
        visibility: style.visibility,
      }
    })
  } catch (err) {
    drawerTop = { error: String(err).slice(0, 120) }
  }
  await context.close()
}

console.log('RESULTS ' + JSON.stringify({ results, drawerTop }, null, 1))
