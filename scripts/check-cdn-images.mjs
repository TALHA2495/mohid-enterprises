#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/check-cdn-images.mjs — audit every ImageKit URL referenced in source
//
//   node scripts/check-cdn-images.mjs
//
// Scans app/, components/ and lib/ for ik.imagekit.io URLs and issues a HEAD
// request to each one. Any non-200 response is a broken image on the live site
// (next/image renders the alt text and an empty box, it does not throw).
//
// No credentials and no network writes: public CDN GET/HEAD only. Exits 1 when
// at least one referenced asset is missing, so it can gate a release.
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['app', 'components', 'lib']
const SCAN_EXT = new Set(['.ts', '.tsx', '.mjs', '.js', '.jsx'])
const URL_RE = /https:\/\/ik\.imagekit\.io\/[^"'`\s)]+/g
const CONCURRENCY = 8

async function collect(dir, found = []) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return found // directory absent — nothing to scan
  }

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      await collect(path, found)
    } else if (SCAN_EXT.has(extname(entry.name))) {
      found.push(path)
    }
  }
  return found
}

/** url -> list of "file:line" references, so a failure can be traced to its source. */
function extract(urlsByLocation) {
  const map = new Map()
  for (const [file, text] of urlsByLocation) {
    const lines = text.split(/\r?\n/)
    lines.forEach((line, index) => {
      for (const match of line.matchAll(URL_RE)) {
        const url = match[0]
        if (!map.has(url)) map.set(url, [])
        map.get(url).push(`${relative(ROOT, file)}:${index + 1}`)
      }
    })
  }
  return map
}

async function check(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.status
  } catch (error) {
    return `ERR ${error.message}`
  }
}

const files = (await Promise.all(SCAN_DIRS.map((dir) => collect(join(ROOT, dir))))).flat().sort()
const scanned = files.map((file) => [file, readFileSync(file, 'utf8')])
const references = extract(scanned)
const urls = [...references.keys()].sort()

if (urls.length === 0) {
  console.log('No ImageKit URLs found under app/, components/, lib/.')
  process.exit(0)
}

console.log(`Checking ${urls.length} ImageKit URL(s) from ${files.length} source file(s)...\n`)

const results = []
let cursor = 0
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++]
      results.push({ url, status: await check(url) })
    }
  }),
)

const ok = results.filter((result) => result.status === 200)
const bad = results.filter((result) => result.status !== 200)

// Group by CDN folder so a whole missing folder reads as one finding.
const byFolder = new Map()
for (const { url, status } of bad) {
  const folder = decodeURIComponent(url.replace('https://ik.imagekit.io/', '').split('/').slice(0, 2).join('/'))
  if (!byFolder.has(folder)) byFolder.set(folder, [])
  byFolder.get(folder).push({ url, status })
}

for (const { url, status } of ok) {
  console.log(`  200  ${decodeURIComponent(url.replace('https://ik.imagekit.io/', '')).split('/').slice(1).join('/')}`)
}

for (const [folder, items] of byFolder) {
  console.log(`\n  MISSING (${items.length}) in /${folder.split('/')[1] ?? ''}:`)
  for (const { url, status } of items) {
    const name = decodeURIComponent(url.split('/').pop().split('?')[0])
    console.log(`    ${status}  ${name}`)
    for (const where of references.get(url)) console.log(`           referenced at ${where}`)
  }
}

console.log(`\n${'-'.repeat(58)}`)
console.log(`RESULT: ${ok.length} reachable, ${bad.length} missing`)
console.log(`${'-'.repeat(58)}`)

process.exit(bad.length ? 1 : 0)