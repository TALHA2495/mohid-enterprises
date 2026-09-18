#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/generate-catalog-seed.mjs — build supabase/seed-products.sql
//
//   node scripts/generate-catalog-seed.mjs
//
// The catalog is seeded from the REAL showroom data in
// components/showroom-section.tsx — nothing is invented, so the admin catalog
// starts out matching what the website already advertises. Categories come from
// lib/showroom.ts FILTER_TYPES, the same map the showroom filter chips use.
//
// Re-runnable: the generated SQL is `on conflict (name) do nothing`, so it can
// never overwrite a product an admin has since edited.
//
// Prices are deliberately NOT seeded: the showroom publishes no prices because
// quotes are negotiated, so `price_per_unit` stays NULL until an admin sets one.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SHOWROOM = join(ROOT, 'components', 'showroom-section.tsx')
const SHOWROOM_LIB = join(ROOT, 'lib', 'showroom.ts')
const OUT = join(ROOT, 'supabase', 'seed-products.sql')

/** Extract the object/array literal that follows `marker` by brace matching. */
function extractLiteral(source, marker, open, close) {
  const start = source.indexOf(marker)
  if (start === -1) throw new Error(`Marker not found: ${marker}`)
  // Start scanning AFTER the marker: markers like `Product[]` contain the very
  // delimiters we are looking for, and would otherwise match themselves.
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

/** The literals contain only strings/arrays/objects — safe to evaluate. */
const parseLiteral = (literal) => new Function(`return ${literal}`)()

const sqlText = (value) => `'${String(value).replace(/'/g, "''")}'`
const sqlNullableText = (value) => (value === null || value === undefined || value === '' ? 'NULL' : sqlText(value))
const sqlArray = (values) =>
  values.length === 0 ? `'{}'::text[]` : `ARRAY[${values.map(sqlText).join(', ')}]::text[]`

/** "10mm–50mm" -> 10 (the nominal lower bound); null when there is no number. */
function firstNumber(value) {
  const match = String(value ?? '').match(/\d+(\.\d+)?/)
  return match ? Math.round(Number(match[0])) : null
}

const showroomSource = readFileSync(SHOWROOM, 'utf8')
const showroomLib = readFileSync(SHOWROOM_LIB, 'utf8')

const products = parseLiteral(extractLiteral(showroomSource, 'const products: Product[] = ', '[', ']'))
const filterTypes = parseLiteral(extractLiteral(showroomLib, 'FILTER_TYPES', '{', '}'))

// Reverse the showroom's type-tag -> filter-group map: LACE -> "Lace".
const typeToCategory = new Map()
for (const [categoryName, types] of Object.entries(filterTypes)) {
  for (const type of types) typeToCategory.set(type, categoryName)
}

const rows = []
const skipped = []

for (const product of products) {
  const category = typeToCategory.get(product.type)
  if (!category) {
    skipped.push(`${product.name} (no filter group for type ${product.type})`)
    continue
  }

  const specs = new Map(product.specs ?? [])
  // Only 6 of the 44 showroom products publish an MOQ — the rest are seeded as
  // NULL rather than given an invented figure.
  const moq = firstNumber(specs.get('Minimum order quantity'))

  const colors = /^custom$/i.test(product.colors ?? '') ? [] : String(product.colors ?? '').split(/[,/]/).map((c) => c.trim()).filter(Boolean)
  const finishes = product.finish ? [product.finish] : []
  const imageName = decodeURIComponent(product.image.split('/').pop().split('?')[0])
  const images = [{ url: product.image.split('?')[0], fileId: null, name: imageName, width: null, height: null }]

  rows.push(
    `  (${sqlText(product.name)}, ${sqlText(category)}, ` +
      `(SELECT id FROM product_categories WHERE lower(name) = lower(${sqlText(category)})), ` +
      `${sqlNullableText(product.description)}, ${sqlText(product.material)}, ${firstNumber(product.width) ?? 'NULL'}, ` +
      `${sqlArray(colors)}, ${sqlArray(finishes)}, ${moq ?? 'NULL'}, 'PKR', true, ${sqlText(JSON.stringify(images))}::jsonb)`,
  )
}

const sql = `-- ============================================================================
-- SEED — PRODUCT CATALOG from the live showroom
-- ----------------------------------------------------------------------------
-- GENERATED FILE — do not edit by hand.
--   pnpm exec node scripts/generate-catalog-seed.mjs
--
-- Source of truth: components/showroom-section.tsx (names, descriptions,
-- materials, specs, CDN images) and lib/showroom.ts (category names).
--
-- Run AFTER supabase/migrations/0002_products_catalog.sql.
--
--   * 'on conflict (name) do nothing' => re-running is safe and never
--     overwrites a product an admin has edited, renamed or deactivated.
--   * price_per_unit is left NULL on purpose: the showroom publishes no prices
--     because quotes are negotiated. Set prices in /admin/products.
--   * moq_units is NULL for the 38 products whose showroom entry publishes no
--     "Minimum order quantity" spec — the site never stated one, so the seed
--     does not invent one. Fill them in at /admin/products.
--   * images[].fileId is NULL: these files were uploaded to ImageKit outside
--     this app, so the admin UI will never delete them from the CDN.
--   * width_mm stores the nominal lower bound of the published range.
-- ============================================================================

INSERT INTO products (
  name, category, category_id, description, material, width_mm,
  available_colors, available_finishes, moq_units, currency, is_active, images
) VALUES
${rows.join(',\n')}
ON CONFLICT (name) DO NOTHING;
`

writeFileSync(OUT, sql, 'utf8')

console.log(`Wrote ${OUT}`)
console.log(`  products seeded : ${rows.length}`)
console.log(`  categories used : ${[...new Set(rows.map((row) => row.match(/lower\('([^']+)'\)/)?.[1]))].length}`)
if (skipped.length > 0) {
  console.log(`  skipped (${skipped.length}):`)
  for (const item of skipped) console.log(`    - ${item}`)
}