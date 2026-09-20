#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/apply-product-image-map.mjs — swap migrated product images in the
// DB, the seed file, and the showroom array from the old ImageKit account
// (wavawecyl) to the new one (a2q8u8qtw), using supabase/product-image-map.json
// produced by scripts/migrate-product-images.mjs.
//
//   node --env-file=.env.local scripts/apply-product-image-map.mjs
//
// Updates three places:
//   1. products.images JSONB in the DB (url + fileId per entry).
//   2. supabase/seed-products.sql — old URL string replaced with the new one.
//   3. components/showroom-section.tsx — product `image` fields (the
//      `?tr=...` suffix on each is preserved because the map keys on the bare
//      URL, which is a prefix of the full URL).
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const MAP_IN = join(ROOT, 'supabase', 'product-image-map.json')
const SEED = join(ROOT, 'supabase', 'seed-products.sql')
const SHOWROOM = join(ROOT, 'components', 'showroom-section.tsx')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL / SERVICE_ROLE_KEY env vars.')
  process.exit(1)
}

const map = JSON.parse(readFileSync(MAP_IN, 'utf8'))
const byOld = new Map(map.migrated.map((entry) => [entry.oldUrl, entry]))
if (byOld.size === 0) {
  console.error('The map contains no migrated entries — run migrate-product-images.mjs first.')
  process.exit(1)
}

/** Replace every occurrence of each old bare URL with its new bare URL. */
function replaceUrls(text) {
  let updated = text
  let hits = 0
  for (const [oldUrl, entry] of byOld) {
    while (updated.includes(oldUrl)) {
      updated = updated.replace(oldUrl, entry.newUrl)
      hits += 1
    }
  }
  return { updated, hits }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // ---- 1. DB: rewrite each product's images JSONB ---------------------------
  const { data: products, error } = await supabase.from('products').select('name, images')
  if (error) {
    console.error('Failed to read products:', error.message)
    process.exit(1)
  }

  let rowsUpdated = 0
  let imagesUpdated = 0
  for (const product of products ?? []) {
    if (!Array.isArray(product.images) || product.images.length === 0) continue
    let changed = false
    const nextImages = product.images.map((image) => {
      const entry = byOld.get((image.url ?? '').split('?')[0])
      if (!entry) return image
      changed = true
      imagesUpdated += 1
      return { ...image, url: entry.newUrl, fileId: entry.fileId ?? image.fileId ?? null }
    })
    if (!changed) continue

    const { error: updateError } = await supabase
      .from('products')
      .update({ images: nextImages })
      .eq('name', product.name)
    if (updateError) {
      console.error(`FAILED to update ${product.name}: ${updateError.message}`)
      process.exit(1)
    }
    rowsUpdated += 1
  }
  console.log(`DB      : ${rowsUpdated} products updated, ${imagesUpdated} image entries rewritten`)

  // ---- 2. Seed file: swap old -> new URLs -----------------------------------
  const seed = readFileSync(SEED, 'utf8')
  const seedSwap = replaceUrls(seed)
  if (seedSwap.hits > 0) writeFileSync(SEED, seedSwap.updated, 'utf8')
  console.log(`Seed    : ${seedSwap.hits} URL occurrences rewritten in seed-products.sql`)

  // ---- 3. Showroom array: swap old -> new URLs -------------------------------
  const showroom = readFileSync(SHOWROOM, 'utf8')
  const showroomSwap = replaceUrls(showroom)
  if (showroomSwap.hits > 0) writeFileSync(SHOWROOM, showroomSwap.updated, 'utf8')
  console.log(`Showroom: ${showroomSwap.hits} URL occurrences rewritten in showroom-section.tsx`)

  console.log('\nDone. Every migrated image now points at the current ImageKit account.')
}

main()
