/**
 * Image size optimizer — re-encodes oversized source images in place.
 * Paths and dimensions are unchanged (UI-safe); only bytes shrink.
 * Run: node scripts/optimize-images.mjs
 * Git keeps the originals, so any file can be reverted if needed.
 */
import sharp from 'sharp'
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const QUALITY = 78          // default webp/jpeg quality
const HERO_QUALITY = 70    // hero / full-bleed backgrounds (heavy overlay on top)
const MIN_SAVINGS = 0.05   // only overwrite when we save at least 5%

const targets = [
  'public/images',
  'public/certificates',
  'public/factory webp images',
  'public/product images compressed',
]

// Max source width per directory (rendered sizes are <= 100vw; retina-safe caps)
const MAX_WIDTH = {
  'public/images': 2560,
  'public/certificates': 2400,
  'public/factory webp images': 1920,
  'public/product images compressed': 1600,
}

// Files that sit behind dark overlays or are full-bleed heroes → more aggressive
const aggressive = new Set([
  'hero-bg.webp',
  'trims2.webp',
  'bg-img-for-mobile-screen.webp',
  'trims-bg.webp',
])

let beforeTotal = 0
let afterTotal = 0
let changed = 0

for (const dir of targets) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name)
    if (!statSync(file).isFile()) continue
    const ext = extname(name).toLowerCase()
    if (!['.webp', '.jpg', '.jpeg'].includes(ext)) continue

    const before = statSync(file).size
    const input = readFileSync(file)
    const quality = aggressive.has(name) ? HERO_QUALITY : QUALITY
    let pipeline = sharp(input)

    const maxWidth = MAX_WIDTH[dir]
    if (maxWidth) {
      const meta = await pipeline.metadata()
      if (meta.width > maxWidth) {
        pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
      }
    }

    let output
    if (ext === '.webp') {
      output = await pipeline.webp({ quality, effort: 6 }).toBuffer()
    } else {
      output = await pipeline.jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer()
    }

    beforeTotal += before
    afterTotal += output.length

    if (output.length < before * (1 - MIN_SAVINGS)) {
      writeFileSync(file, output)
      changed++
      console.log(
        `${dir}/${name}: ${(before / 1024).toFixed(1)} KB -> ${(output.length / 1024).toFixed(1)} KB`
      )
    }
  }
}

console.log(
  `\nDone. ${changed} files re-encoded. ` +
    `Total: ${(beforeTotal / 1024).toFixed(0)} KB -> ${(afterTotal / 1024).toFixed(0)} KB ` +
    `(saved ${(((beforeTotal - afterTotal) / 1024) | 0)} KB)`
)
