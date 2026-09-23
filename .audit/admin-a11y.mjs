// Accessibility audit for every admin route at a phone and a desktop width.
import { chromium } from 'playwright'
import { createHmac } from 'node:crypto'

const BASE = 'http://localhost:3000'
const token = createHmac('sha256', process.env.ADMIN_PASSWORD).update('mohid-admin-session-v1').digest('hex')
const PID = 'c10f2f46-5185-40f2-93be-bb77fc893d7d'
const ROUTES = ['/admin', '/admin/products', '/admin/products/new', `/admin/products/${PID}`, '/admin/quotes', '/admin/hero']
const WIDTHS = [375, 1440]

const browser = await chromium.launch({ channel: 'chrome' })
let fails = 0

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.addCookies([{ name: 'mohid_admin', value: token, url: BASE }])
  for (const route of ROUTES) {
    const page = await context.newPage()
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    const p = await page.evaluate(() => {
      const bad = []
      const lum = (c) => {
        const [r, g, b] = c.match(/\d+/g).map(Number).map((v) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const ratio = (a, b) => Math.round(((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)) * 100) / 100

      // one h1, no skipped heading levels
      const h1 = document.querySelectorAll('h1').length
      if (h1 !== 1) bad.push(`h1=${h1}`)
      const levels = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1]))
      for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) bad.push(`heading skip h${levels[i - 1]}→h${levels[i]}`)

      // landmarks + skip link
      if (!document.querySelector('main#main')) bad.push('no main#main')
      if (document.querySelectorAll('main').length > 1) bad.push('multiple <main>')
      const skip = document.querySelector('a[href="#main"]')
      if (!skip) bad.push('no skip link')

      // labelled controls
      const unlabeled = [...document.querySelectorAll('main input, main select, main textarea')].filter((el) => {
        if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false
        if (el.id && document.querySelector(`label[for="${el.id}"]`)) return false
        return !el.closest('label')
      })
      if (unlabeled.length) bad.push(`unlabeled controls=${unlabeled.length}`)

      // accessible name on every button/link
      const nameless = [...document.querySelectorAll('main button, main a')].filter(
        (el) => !(el.textContent || '').trim() && !el.getAttribute('aria-label') && !el.querySelector('[aria-label]'),
      )
      if (nameless.length) bad.push(`no accessible name=${nameless.length}`)

      // alt attributes present
      const noAlt = [...document.querySelectorAll('main img')].filter((i) => i.getAttribute('alt') === null).length
      if (noAlt) bad.push(`img without alt=${noAlt}`)

      // tables
      const ths = [...document.querySelectorAll('main table th')]
      const noScope = ths.filter((t) => !t.getAttribute('scope')).length
      if (noScope) bad.push(`th without scope=${noScope}/${ths.length}`)

      // toggles announce state
      const toggleish = [...document.querySelectorAll('main button')].filter((b) => /^(all|active|inactive)/i.test((b.textContent || '').trim()))
      const missingPressed = toggleish.filter((b) => !b.hasAttribute('aria-pressed')).length
      if (missingPressed) bad.push(`toggle buttons without aria-pressed=${missingPressed}`)

      // contrast, compositing alpha so black/60 on black/2% is not misread as 1:1
      // Chrome serializes computed colors as lab()/oklch() — resolve every color
      // through a 1x1 canvas to get true sRGB channels instead of parsing text.
      const cv = document.createElement('canvas')
      cv.width = cv.height = 1
      const cx = cv.getContext('2d', { willReadFrequently: true })
      const parse = (c) => {
        cx.fillStyle = 'rgba(0, 0, 0, 0)'
        try { cx.fillStyle = c } catch {}
        cx.clearRect(0, 0, 1, 1)
        cx.fillRect(0, 0, 1, 1)
        const d = cx.getImageData(0, 0, 1, 1).data
        return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }
      }
      const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 })
      const lumRgb = (c) => {
        const f = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
      }
      const ratioRgb = (a, b) => Math.round(((Math.max(lumRgb(a), lumRgb(b)) + 0.05) / (Math.min(lumRgb(a), lumRgb(b)) + 0.05)) * 100) / 100
      const white = { r: 255, g: 255, b: 255, a: 1 }
      const stack = (el) => {
        const layers = []
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) layers.push(parse(getComputedStyle(n).backgroundColor))
        return layers.reverse().reduce((acc, l) => over(l, acc), white)
      }
      const low = []
      for (const el of document.querySelectorAll('main button, main a, main p, main span, main td, main th, main dd, main dt, main label, main h1, main h2')) {
        const t = (el.textContent || '').trim()
        if (!t || el.children.length) continue
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.9) continue
        // Gradient text (background-clip + color:transparent) and text sitting on a
        // photo can't be measured from computed styles — excluded rather than
        // reported as a bogus 1:1.
        if (cs.color === 'rgba(0, 0, 0, 0)' || cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue
        let overImage = false
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
          if (getComputedStyle(n).backgroundImage !== 'none') { overImage = true; break }
        }
        if (overImage) continue
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) continue
        const bg = stack(el) // includes the element's own scrim (e.g. bg-black/70 chips)
        const fg = over(parse(cs.color), bg)
        const cr = ratioRgb(fg, bg)
        if (cr < 4.5) low.push(`${cr}:1 "${t.slice(0, 18)}"`)
      }
      if (low.length) bad.push(`low contrast=${low.slice(0, 3).join(', ')}`)
      return bad
    })
    if (p.length) { fails++; console.log(`A11Y ${width} ${route} :: ${p.join(' | ')}`) }
    await page.close()
  }
  await context.close()
}
console.log(`\nA11Y failures=${fails} (12 route-widths checked)`)
await browser.close()
