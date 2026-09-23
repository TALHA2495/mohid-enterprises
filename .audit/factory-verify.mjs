// Temporary /factory validation — content assertions + 4-width screenshots.
// Targets the already-running dev server (port 3000), not audit-ui.mjs (3222).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.AUDIT_BASE ?? 'http://localhost:3000'
const WIDTHS = [1440, 1024, 768, 390]
// Expected rows per the responsive spec: tiles 3/3/2/1, snapshot 3/3/2/1.
const EXPECT = { 1440: 1, 1024: 1, 768: 2, 390: 3 }
mkdirSync('.audit/shots', { recursive: true })

let failed = 0
const res = await fetch(`${BASE}/factory`)
const html = await res.text()
const count = (re) => (html.match(re) ?? []).length

// NOTE: raw dev HTML carries React's RSC flight payload, so class strings appear
// twice (markup + payload). Only structural tags are counted here; the exact
// tile/metric counts are asserted against the live DOM below.
const checks = [
  ['HTTP 200', res.status === 200],
  ['single h1', count(/<h1/g) === 1],
  ['new H1 copy', html.includes('20+ Years of Proven Trims Manufacturing')],
  ['eyebrow Our Factory', html.includes('Our Factory')],
  ['new intro', html.includes('jute cord, conveyor belts, and more')],
  ['tile label 1', html.includes('Textile Trims')],
  ['tile label 2', html.includes('Braids &amp; Cords') || html.includes('Braids & Cords')],
  ['tile label 3', html.includes('Packed for Export')],
  ['metric labels', html.includes('Trims Types') && html.includes('Years Manufacturing')],
  ['CTA to /quote', html.includes('href="/quote"')],
  ['cards REMOVED', !html.includes('Quality Inspection Protocol') && !html.includes('Incoterms')],
  ['old H1 gone', !html.includes('Faisalabad Manufacturing Base &amp; Capacity')],
  ['old eyebrow gone', !html.includes('OUR OPERATION')],
  ['metadata desc updated', html.includes('20+ years of export-grade production')],
  ['og:image present', html.includes('og:image')],
  ['canonical /factory', html.includes('rel="canonical"')],
]
console.log('--- content checks ---')
for (const [name, ok] of checks) {
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
}

const imgSrcs = [...html.matchAll(/src="(\/_next\/image\?url=[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'))
console.log(`--- ${imgSrcs.length} optimized images ---`)
for (const src of imgSrcs) {
  const r = await fetch(BASE + src)
  const kb = Math.round(Number(r.headers.get('content-length') ?? 0) / 1024)
  const ok = r.status === 200
  if (!ok) failed += 1
  const name = (decodeURIComponent(src).match(/factory%2F([^&?]+)/) ?? [])[1] ?? ''
  console.log(`${ok ? 'PASS' : 'FAIL'} ${r.status} ${String(kb).padStart(4)}KB ${name}`)
}

// Chrome is installed locally, so this avoids Playwright's browser download.
const browser = await chromium.launch({ channel: 'chrome' })
console.log('--- responsive render (live DOM) ---')
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  await page.goto(`${BASE}/factory`, { waitUntil: 'networkidle' })
  const m = await page.evaluate(() => {
    const rows = (sel) => {
      const els = [...document.querySelectorAll(sel)]
      return { n: els.length, rows: new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size }
    }
    const cta = [...document.querySelectorAll('a[href="/quote"]')].find((a) => a.closest('section'))
    const h1 = document.querySelector('h1')
    return {
      tiles: rows('figure'),
      stats: rows('ul > li'),
      h1Count: document.querySelectorAll('h1').length,
      h1Size: getComputedStyle(h1).fontSize,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ctaH: cta ? Math.round(cta.getBoundingClientRect().height) : 0,
      tileH: Math.round(document.querySelector('figure').getBoundingClientRect().height),
      imgLoaded: [...document.querySelectorAll('figure img')].every((i) => i.complete && i.naturalWidth > 0),
    }
  })
  await page.screenshot({ path: `.audit/shots/factory-${width}.png`, fullPage: true })
  const ok =
    m.tiles.rows === EXPECT[width] &&
    m.stats.rows === EXPECT[width] &&
    m.h1Count === 1 &&
    m.imgLoaded &&
    !m.overflow &&
    m.ctaH >= 44
  if (!ok) failed += 1
  console.log(
    `${ok ? 'PASS' : 'FAIL'} ${String(width).padStart(4)}px tiles=${m.tiles.n}/rows=${m.tiles.rows} stats=${m.stats.n}/rows=${m.stats.rows} h1=${m.h1Size} tileH=${m.tileH}px cta=${m.ctaH}px imgs=${m.imgLoaded ? 'ok' : 'BROKEN'} overflow=${m.overflow}`,
  )
  await page.close()
}
await browser.close()
console.log(failed === 0 ? 'ALL CHECKS PASSED' : `${failed} CHECK(S) FAILED`)
