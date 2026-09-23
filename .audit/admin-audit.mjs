// Geometry + console/network audit for every admin route x width.
import { chromium } from 'playwright'
import { createHmac } from 'node:crypto'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:3000'
const token = createHmac('sha256', process.env.ADMIN_PASSWORD).update('mohid-admin-session-v1').digest('hex')
const PID = 'c10f2f46-5185-40f2-93be-bb77fc893d7d'
const ROUTES = ['/admin', '/admin/products', '/admin/products/new', `/admin/products/${PID}`, '/admin/quotes', '/admin/hero']
const WIDTHS = [320, 375, 414, 640, 768, 1024, 1440, 1920, 2560]
mkdirSync('.audit/shots/admin2', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
let fails = 0
let checks = 0

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.addCookies([{ name: 'mohid_admin', value: token, url: BASE }])
  for (const route of ROUTES) {
    const page = await context.newPage()
    const errs = []
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console:' + m.text().slice(0, 80)) })
    page.on('pageerror', (e) => errs.push('pageerror:' + String(e).slice(0, 80)))
    page.on('requestfailed', (r) => errs.push('reqfail:' + r.url().slice(-45)))
    page.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url().slice(-40)) })

    await page.goto(BASE + route, { waitUntil: 'networkidle' }).catch(() => {})
    const m = await page.evaluate(() => {
      const p = []
      const de = document.documentElement
      const content = document.querySelector('main#main').firstElementChild
      const cr = Math.round(content.getBoundingClientRect().right)
      const cw = content.clientWidth
      if (de.scrollWidth > de.clientWidth) p.push(`docScrollW=${de.scrollWidth}>${de.clientWidth}`)
      window.scrollTo(9999, 0)
      const sl = Math.round(document.scrollingElement.scrollLeft)
      if (sl > 0) p.push(`window-h-scroll=${sl}`)
      window.scrollTo(0, 0)
      // overflowing element, ignoring intended inner scroll regions
      const clipped = (el) => {
        for (let q = el.parentElement; q && q !== document.body; q = q.parentElement) {
          if (getComputedStyle(q).overflowX !== 'visible') return true
        }
        return false
      }
      for (const el of document.querySelectorAll('main *')) {
        const r = el.getBoundingClientRect()
        if (!r.width && !r.height) continue
        if (Math.round(r.right) > cr + 1 && !clipped(el)) {
          p.push(`overflow <${el.tagName}.${String(el.className).slice(0, 26)}> ${Math.round(r.right)}>${cr}`)
          break
        }
      }
      const s = document.querySelector('main input[type=search]')
      const search = s ? { w: Math.round(s.getBoundingClientRect().width), pct: Math.round((s.getBoundingClientRect().width / cw) * 100), right: Math.round(s.getBoundingClientRect().right), cr } : null
      const chip = document.querySelector('main [aria-pressed="true"]')
      const chipBox = chip ? { h: Math.round(chip.getBoundingClientRect().height), text: (chip.textContent || '').trim().slice(0, 10) } : null
      if (chipBox && window.innerWidth < 768 && chipBox.h < 44) p.push(`chip tap target ${chipBox.h}px < 44px`)
      // the filter toolbar must span to the content edge on wide screens
      const inp = s
      const row = inp ? inp.parentElement.parentElement : null
      const chipsGroup = row && row.children.length > 1 ? row.children[1] : null
      let filterGap = null
      if (chipsGroup && window.innerWidth >= 640) {
        filterGap = Math.round(cr - chipsGroup.getBoundingClientRect().right)
        if (filterGap > 2) p.push(`filters not right-aligned (gap ${filterGap}px)`)
      }
      return { p, search, chipBox, filterGap }
    })

    checks++
    const problems = [...m.p, ...(errs.length ? [`console/network=${errs.length} (${errs[0]})`] : [])]
    if (problems.length) { fails++; console.log(`FAIL ${width} ${route} :: ${problems.join(' | ')}`) }
    if (route === '/admin/products' && [320, 1024, 2560].includes(width)) {
      console.log(`ok   ${width} search=${JSON.stringify(m.search)} chip=${JSON.stringify(m.chipBox)}`)
      await page.screenshot({ path: `.audit/shots/admin2/products-${width}.png`, fullPage: true })
    }
    await page.close()
  }
  await context.close()
}
console.log(`\nTOTAL route-width checks=${checks}  failures=${fails}`)
await browser.close()
