#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/migrate-product-images.mjs — move every product image from the old
// ImageKit account (wavawecyl) to the current account (a2q8u8qtw).
//
//   node --env-file=.env.local scripts/migrate-product-images.mjs
//
// Reads every product's `images` JSONB, downloads each file from its current
// CDN URL, and re-uploads it to the SAME folder path on the current account.
// All-or-nothing on ImageKit errors (no mapping written); a missing source
// file is skipped and reported so affected products keep working old URLs.
// Writes supabase/product-image-map.json for apply-product-image-map.mjs.
// ---------------------------------------------------------------------------
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const MAP_OUT = join(ROOT, 'supabase', 'product-image-map.json')

const ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const missing = [
  ...(ENDPOINT ? [] : ['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT']),
  ...(PRIVATE_KEY ? [] : ['IMAGEKIT_PRIVATE_KEY']),
  ...(SUPABASE_URL ? [] : ['NEXT_PUBLIC_SUPABASE_URL']),
  ...(SERVICE_KEY ? [] : ['SUPABASE_SERVICE_ROLE_KEY']),
]
if (missing.length > 0) {
  console.error(`Missing env vars: ${missing.join(', ')}`)
  process.exit(1)
}

const authHeader = `Basic ${Buffer.from(`${PRIVATE_KEY}:`).toString('base64')}`

/** Strip any query string (`?tr=`, `?updatedAt=`) to get the bare CDN URL. */
const bareUrl = (url) => url.split('?')[0]

/** URL path -> ImageKit folder ("product images webp"). */
function folderFromUrl(url) {
  const path = decodeURIComponent(new URL(url).pathname)
  const segments = path.split('/').filter(Boolean)
  segments.pop()
  return segments.join('/')
}

/** Target folder on the new account — everything lands in `products` (the
 *  app's own upload folder; ImageKit rejects spaces in the folder parameter). */
const TARGET_FOLDER = 'products'

/** URL path -> original file name ("all Cotton Fringe.webp"). */
function fileNameFromUrl(url) {
  const path = decodeURIComponent(new URL(url).pathname)
  return path.split('/').pop()
}

async function withTimeout(ms, run) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await run(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}

async function downloadSource(url) {
  const response = await withTimeout(60_000, (signal) => fetch(bareUrl(url), { signal, cache: 'no-store' }))
  if (!response.ok) return { ok: false, status: response.status }
  const buffer = Buffer.from(await response.arrayBuffer())
  return { ok: true, buffer }
}

async function uploadToImageKit(fileName, folder, buffer) {
  const form = new FormData()
  form.append('file', new Blob([buffer]), fileName)
  form.append('fileName', fileName)
  form.append('folder', `/${TARGET_FOLDER}`)
  // Predictable name (no UUID suffix) + overwrite keeps the migration re-runnable.
  form.append('useUniqueFileName', 'false')
  form.append('overwriteFile', 'true')

  const response = await withTimeout(120_000, (signal) =>
    fetch('https://api.imagekit.io/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: form,
      signal,
    }),
  )
  const body = await response.json().catch(() => null)
  if (!response.ok || !body) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body)
    return { ok: false, status: response.status, error: String(detail ?? '').slice(0, 300) }
  }
  return { ok: true, url: body.url, filePath: body.filePath, fileId: body.fileId, name: body.name }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data: products, error } = await supabase.from('products').select('name, images')
  if (error) {
    console.error('Failed to read products:', error.message)
    process.exit(1)
  }

  const sources = new Map() // bareUrl -> { url, products: [] }
  for (const product of products ?? []) {
    for (const image of product.images ?? []) {
      const url = bareUrl(image.url ?? '')
      if (!url || !url.includes('ik.imagekit.io')) continue
      if (!sources.has(url)) sources.set(url, { url, products: [] })
      sources.get(url).products.push(product.name)
    }
  }

  console.log(`Products read     : ${products?.length ?? 0}`)
  console.log(`Unique image URLs : ${sources.size}`)
  if (sources.size === 0) {
    console.log('Nothing to migrate.')
    process.exit(0)
  }

  const results = []
  const skipped = []
  const failed = []

  let index = 0
  for (const source of sources.values()) {
    index += 1
    const fileName = fileNameFromUrl(source.url)
    const folder = folderFromUrl(source.url)
    const label = `${index}/${sources.size}`

    const download = await downloadSource(source.url)
    if (!download.ok) {
      console.log(`SKIP ${label}  source ${download.status}  ${fileName}  (products: ${source.products.join(', ')})`)
      skipped.push({ oldUrl: source.url, fileName, folder, reason: `source ${download.status}`, products: source.products })
      continue
    }

    let upload = null
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      upload = await uploadToImageKit(fileName, folder, download.buffer)
      if (upload.ok) break
      console.log(`  upload attempt ${attempt} failed (${upload.status}): ${upload.error ?? 'unknown'}`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    if (!upload.ok) {
      console.log(`FAIL ${label}  ${fileName}  ->  aborting before any DB change.`)
      failed.push({ oldUrl: source.url, fileName, folder, error: upload.error ?? 'upload failed' })
      continue
    }

    const newUrl = bareUrl(upload.url ?? `${ENDPOINT}${upload.filePath ?? ''}`)
    console.log(`OK   ${label}  ${fileName}  ->  ${newUrl}`)
    results.push({
      oldUrl: source.url,
      newUrl,
      fileId: upload.fileId ?? null,
      fileName: upload.name ?? fileName,
      folder: TARGET_FOLDER,
      products: source.products,
    })
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  console.log('')
  console.log(`migrated : ${results.length}`)
  console.log(`skipped  : ${skipped.length} (source missing — products keep old URLs)`)
  console.log(`failed   : ${failed.length}`)

  if (failed.length > 0) {
    console.error('\nUpload errors (no mapping written, DB untouched):')
    for (const item of failed) console.error(`  - ${item.fileName}: ${item.error}`)
    process.exit(1)
  }

  writeFileSync(MAP_OUT, JSON.stringify({ migrated: results, skipped }, null, 2), 'utf8')
  console.log(`\nWrote ${MAP_OUT}`)
  if (skipped.length > 0) {
    console.log('\nSkipped entries need manual attention (old URLs keep working):')
    for (const item of skipped) console.log(`  - ${item.fileName} (${item.reason})`)
  }
}

main()

