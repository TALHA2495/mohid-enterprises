// Temporary /admin responsiveness validation. Auth is injected by computing the
// same HMAC session the login route sets, so no manual sign-in is needed.
import { chromium } from 'playwright'
import { createHmac } from 'node:crypto'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:3000'
const token = createHmac('sha256', process.env.ADMIN_PASSWORD).update('mohid-admin-session-v1').digest('hex')
const PID = 'c10f2f46-5185-40f2-93be-bb77fc893d7d'
const ROUTES = ['/admin', '/admin/products', '/admin/products/new', `/admin/products/${PID}`, '/admin/quotes', '/admin/hero']
const WIDTHS = [320, 375, 414, 768, 1024, 1440, 1920, 2560]
const SHOT = [320, 768, 1920, 2560]

mkdirSync('.audit/shots/admin', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.addCookies([{ name: 'mohid_admin', value: token, url: BASE }])
  const page = await context.newPage()
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' }).catch(() => {})
    const m = await page.evaluate(() => {
      // An element only counts as overflow if no ancestor clips it (inner
      // overflow-x-auto regions are intentional horizontal scroll).
      const clipped = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const ox = getComputedStyle(p).overflowX
          if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true
        }
        return false
      }
      const bad = []
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (!r.width && !r.height) continue
        if (r.right > window.innerWidth + 1 && !clipped(el)) bad.push(el.tagName + '|' + (el.className || '').toString().slice(0, 48))
        if (bad.length > 2) break
      }
      const vis = (el) => !!el && el.getBoundingClientRect().width > 0
      const main = document.querySelector('main#main')
      const controls = [...document.querySelectorAll('main input, main select, main textarea')].map((e) => e.getBoundingClientRect().width)
      return {
        scrollW: document.documentElement.scrollWidth,
        mainW: main ? Math.round(main.getBoundingClientRect().width) : null,
        table: vis(document.querySelector('table')),
        cards: vis(document.querySelector('ul[aria-label="Products"]')),
        widestField: controls.length ? Math.round(Math.max(...controls)) : 0,
        h1: document.querySelectorAll('h1').length,
        bad,
      }
    })
    const flag = m.scrollW > width ? 'VIEWPORT-OVERFLOW' : 'no-overflow'
    console.log(`${width}\t${route}\tscrollW=${m.scrollW} ${flag} mainW=${m.mainW} table=${m.table ? 'Y' : 'n'} cards=${m.cards ? 'Y' : 'n'} widestField=${m.widestField} h1=${m.h1} ${m.bad.length ? 'ELEM→' + m.bad.join(' ; ') : ''}`)
    if (SHOT.includes(width) && (route === '/admin' || route === '/admin/products' || route === '/admin/products/new')) {
      await page.screenshot({ path: `.audit/shots/admin/${route.replaceAll('/', '_') || '_root'}-${width}.png`, fullPage: true })
    }
  }
  await context.close()
}
await browser.close()
