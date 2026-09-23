#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/backfill-product-type-and-specs.mjs — populate the new `type` and
// `specs` columns (migration 0004) for the existing catalog from the REAL
// showroom data in components/showroom-section.tsx.
//
//   node --env-file=.env.local scripts/backfill-product-type-and-specs.mjs
//
// Guarded: only fills rows where type or specs is still NULL, so an admin's
// later edits are never clobbered by a re-run.
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const CATALOG = join(ROOT, 'lib', 'catalog-data.ts')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL / SERVICE_ROLE_KEY env vars.')
  process.exit(1)
}

/** Extract the object/array literal that follows `marker` by brace matching. */
function extractLiteral(source, marker, open, close) {
  const start = source.indexOf(marker)
  if (start === -1) throw new Error(`Marker not found: ${marker}`)
  const from = source.indexOf(open, start + marker.length)
  if (from === -1) throw new Error(`No ${open} following: ${marker}`)
  let depth = 0
  for (let index = from; index < source.length; index++) {
    const char = source[index]
    if (char === open) depth++
    else if (char === close) {
      depth--
      if (depth === 0) return source.slice(from, index + 1)
    }
  }
  throw new Error(`Unbalanced literal after: ${marker}`)
}

const products = new Function(
  `return ${extractLiteral(readFileSync(CATALOG, 'utf8'), 'export const CATALOG_DATA: CatalogProduct[] = ', '[', ']')}`,
)()

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  let updated = 0
  let alreadySet = 0
  let missing = 0

  for (const product of products) {
    const specsJson = JSON.stringify(product.specs ?? [])
    const { data, error } = await supabase
      .from('products')
      .update({ type: product.type, specs: specsJson })
      .eq('name', product.name)
      .or('type.is.null,specs.is.null')
      .select('name')

    if (error) {
      console.error(`FAILED ${product.name}: ${error.message}`)
      process.exit(1)
    }
    if (data && data.length > 0) {
      updated += 1
      console.log(`OK   ${product.name}  type=${product.type}  specs=${(product.specs ?? []).length} entries`)
    } else {
      // Either the product no longer exists, or type+specs were already set.
      const { data: existing } = await supabase
        .from('products')
        .select('name')
        .eq('name', product.name)
      if (existing && existing.length > 0) {
        alreadySet += 1
      } else {
        missing += 1
        console.log(`SKIP ${product.name}  (not in the DB catalog)`)
      }
    }
  }

  console.log('')
  console.log(`updated    : ${updated}`)
  console.log(`already set: ${alreadySet} (guarded — left untouched)`)
  console.log(`not in DB  : ${missing}`)
}

main()
