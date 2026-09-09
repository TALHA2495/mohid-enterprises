// One-time icon generator: derives all favicon/tab icons from public/images/LOGO MOHID.webp
// Pure asset replacement — no app code, logic, or UI changes. Offline script, not part of `next build`.
// Balanced performance: trim -> lanczos3 downscale -> adaptive quality ladder under hard size budgets.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'public', 'images', 'LOGO MOHID.webp')
const PUB = path.join(ROOT, 'public')

const PNG_OPTS = { palette: true, compressionLevel: 9, effort: 10 }
// [quality, palette colors] — strongest settings last; highest-quality combination that fits wins
const COMPRESSION_LADDER = [
  [80, 256],
  [70, 256],
  [60, 128],
  [50, 128],
  [40, 64],
  [30, 64],
]
const BUDGETS = {
  'icon-light-32x32.png': 2 * 1024,
  'icon-dark-32x32.png': 2 * 1024,
  'apple-icon.png': 10 * 1024,
  'icon.svg': 20 * 1024,
  'favicon.ico': 5 * 1024,
}

// Trim excess transparent padding, then letterbox onto a transparent square canvas
// (aspect preserved, lanczos3 downscaling, no upscaling).
function square(size) {
  return sharp(SRC)
    .trim()
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: true,
    })
}

// Adaptive compression ladder: highest-quality combination whose FINAL output (after any
// base64 SVG wrapping) fits the budget.
async function withinBudget(size, budget, wrap) {
  const svgWrap = (pngBuffer) =>
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">` +
        `<image href="data:image/png;base64,${pngBuffer.toString('base64')}" width="180" height="180"/>` +
        `</svg>`,
      'utf8',
    )

  let last = null
  for (const [quality, colors] of COMPRESSION_LADDER) {
    const pngBuffer = await square(size).png({ ...PNG_OPTS, quality, colors }).toBuffer()
    const out = wrap ? svgWrap(pngBuffer) : pngBuffer
    last = { out, quality, colors }
    if (out.length <= budget) return { ...last, over: false }
  }
  return { ...last, over: true }
}

// Minimal ICO container embedding PNG images (Vista+ format, supported by all modern browsers).
function buildIco(pngBuffers, sizes) {
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(count, 4)

  const entries = Buffer.alloc(16 * count)
  let offset = 6 + 16 * count
  const blobs = []

  pngBuffers.forEach((buffer, i) => {
    const size = sizes[i]
    const entry = entries.subarray(i * 16, i * 16 + 16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette colors
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // color planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(buffer.length, 8) // bytes in resource
    entry.writeUInt32LE(offset, 12) // image offset
    blobs.push(buffer)
    offset += buffer.length
  })

  return Buffer.concat([header, entries, ...blobs])
}

let failed = false
function report(name, out, quality, colors) {
  const ok = out.length <= BUDGETS[name]
  if (!ok) failed = true
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}: ${(out.length / 1024).toFixed(2)} KB (budget ${(BUDGETS[name] / 1024).toFixed(0)} KB, quality ${quality}, colors ${colors})`)
}

// Overwrite in place: same filenames, same paths the existing metadata.icons already references
const light = await withinBudget(32, BUDGETS['icon-light-32x32.png'])
writeFileSync(path.join(PUB, 'icon-light-32x32.png'), light.out)
report('icon-light-32x32.png', light.out, light.quality, light.colors)

const dark = await withinBudget(32, BUDGETS['icon-dark-32x32.png'])
writeFileSync(path.join(PUB, 'icon-dark-32x32.png'), dark.out)
report('icon-dark-32x32.png', dark.out, dark.quality, dark.colors)

// 152x152 is a standard apple-touch-icon size — fits the 10 KB budget without degrading
// the metallic logo colors beyond the quality floor.
const apple = await withinBudget(152, BUDGETS['apple-icon.png'])
writeFileSync(path.join(PUB, 'apple-icon.png'), apple.out)
report('apple-icon.png', apple.out, apple.quality, apple.colors)

// SVG wrapper embeds a compressed 180x180 base — NOT 512, to keep the SVG tiny.
// Budget is measured on the FINAL svg (base64 inflates ~4/3x over the PNG).
const svgAsset = await withinBudget(180, BUDGETS['icon.svg'], true)
writeFileSync(path.join(PUB, 'icon.svg'), svgAsset.out)
report('icon.svg', svgAsset.out, svgAsset.quality, svgAsset.colors)

const ico16 = await withinBudget(16, BUDGETS['favicon.ico'])
const ico32 = await withinBudget(32, BUDGETS['favicon.ico'])
const icoOut = buildIco([ico16.out, ico32.out], [16, 32])
writeFileSync(path.join(PUB, 'favicon.ico'), icoOut)
report('favicon.ico', icoOut, `${ico16.quality}/${ico32.quality}`, `${ico16.colors}/${ico32.colors}`)

console.log(failed ? '\nICON GENERATION FAILED BUDGETS' : '\nALL ICONS GENERATED WITHIN BUDGETS')
process.exit(failed ? 1 : 0)

