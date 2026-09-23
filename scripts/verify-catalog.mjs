#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/verify-catalog.mjs — end-to-end check of the product catalog
//
//   node --env-file=.env.local scripts/verify-catalog.mjs
//
// Keys come from the environment and are NEVER printed (presence only).
//
// Creates a throwaway category and product through the service role, asserts
// every rule the admin UI depends on, then deletes both. Sales data is not
// touched: products and categories are ordinary rows, unlike the write-once
// payments ledger.
//
// Requires migration 0002 to have been applied.
// ---------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js'

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY

const STAMP = Date.now()
const CATEGORY_NAME = `Verify Category ${STAMP}`
const PRODUCT_NAME = `Verify Product ${STAMP}`
const IMAGE_URL = 'https://ik.imagekit.io/wavawecyl/products/verify-bot.webp'

let passed = 0
const failures = []

const ok = (name, detail = '') => {
  passed++
  console.log(`  [PASS] ${name}${detail ? `  (${detail})` : ''}`)
}
const bad = (name, detail = '') => {
  failures.push(`${name}${detail ? ` (${detail})` : ''}`)
  console.log(`  [FAIL] ${name}${detail ? `  (${detail})` : ''}`)
}
const assert = (name, condition, detail = '') => (condition ? ok(name, detail) : bad(name, detail))
const section = (title) => console.log(`\n${title}`)
const err = (error) => (error ? `${error.code ?? ''} ${error.message ?? error}`.trim() : '')

let categoryId = null
let productId = null
let admin = null

async function cleanup() {
  if (!admin) return
  if (productId) await admin.from('products').delete().eq('id', productId)
  if (categoryId) await admin.from('product_categories').delete().eq('id', categoryId)
  // Belt and braces: remove anything left behind by a half-finished run.
  await admin.from('products').delete().eq('name', PRODUCT_NAME)
  await admin.from('product_categories').delete().eq('name', CATEGORY_NAME)
}

async function main() {
  section('1. Configuration')
  assert('NEXT_PUBLIC_SUPABASE_URL present', Boolean(URL_))
  assert('NEXT_PUBLIC_SUPABASE_ANON_KEY present', Boolean(ANON))
  assert('SUPABASE_SERVICE_ROLE_KEY present', Boolean(SECRET))
  console.log(`  project host: ${URL_ ? new URL(URL_).host : 'n/a'}`)

  if (!URL_ || !ANON || !SECRET) {
    console.log('\nCannot continue: all three Supabase variables are required.')
    process.exit(1)
  }

  const anon = createClient(URL_, ANON)
  admin = createClient(URL_, SECRET)

  section('2. Catalog tables exist (migration 0002 applied)')
  for (const table of ['product_categories', 'products']) {
    const { error } = await admin.from(table).select('id', { count: 'exact', head: true })
    assert(`${table} reachable`, !error, err(error))
  }
  if (failures.length > 0) {
    console.log('\nRun supabase/migrations/0002_products_catalog.sql first.')
    return
  }

  section('3. RLS: the anon key cannot read the catalog')
  for (const table of ['products', 'product_categories']) {
    const { data, error } = await anon.from(table).select('id').limit(1)
    assert(`anon SELECT ${table} -> 0 rows`, !error && (data ?? []).length === 0, error ? err(error) : `rows=${(data ?? []).length}`)
  }

  section('4. Category lifecycle')
  const created = await admin.from('product_categories').insert({ name: CATEGORY_NAME, sort_order: 999 }).select('*').single()
  assert('category created', !created.error, err(created.error))
  categoryId = created.data?.id ?? null

  const duplicate = await admin.from('product_categories').insert({ name: CATEGORY_NAME.toLowerCase(), sort_order: 1 })
  assert('case-insensitive duplicate name rejected (23505)', duplicate.error?.code === '23505', err(duplicate.error))

  const renamed = await admin
    .from('product_categories')
    .update({ name: `${CATEGORY_NAME} renamed` })
    .eq('id', categoryId)
    .eq('updated_at', created.data?.updated_at)
    .select('id')
  assert('rename with matching revision succeeds', !renamed.error && renamed.data?.length === 1, err(renamed.error))

  const stale = await admin
    .from('product_categories')
    .update({ name: 'Should not apply' })
    .eq('id', categoryId)
    .eq('updated_at', created.data?.updated_at)
    .select('id')
  assert('stale revision is refused (compare-and-set)', !stale.error && stale.data?.length === 0, `matched ${stale.data?.length ?? 0}`)

  const fresh = await admin.from('product_categories').select('updated_at').eq('id', categoryId).single()
  assert('updated_at trigger advanced the revision', fresh.data?.updated_at !== created.data?.updated_at)

  section('5. Product lifecycle')
  const images = [
    { url: IMAGE_URL, fileId: 'verify-file-1', name: 'verify-bot.webp', width: 1200, height: 900 },
    { url: `${IMAGE_URL}?v=2`, fileId: null, name: 'seeded.webp', width: null, height: null },
  ]

  const product = await admin
    .from('products')
    .insert({
      name: PRODUCT_NAME,
      category: `${CATEGORY_NAME} renamed`,
      category_id: categoryId,
      description: 'Automated catalog verification row.',
      material: 'Polyester',
      width_mm: 25,
      available_colors: ['Red', 'Blue'],
      available_finishes: ['Matte'],
      moq_units: null, // 38 of 44 seeded products have no published MOQ
      currency: 'PKR',
      images,
    })
    .select('*')
    .single()

  assert('product created with a NULL moq_units', !product.error, err(product.error))
  productId = product.data?.id ?? null

  assert('images round-trip as JSONB with fileId', product.data?.images?.[0]?.fileId === 'verify-file-1' && product.data?.images?.length === 2)
  assert('nullable image dimensions preserved', product.data?.images?.[1]?.width === null)
  assert('text[] colours preserved', JSON.stringify(product.data?.available_colors) === JSON.stringify(['Red', 'Blue']))

  const duplicateProduct = await admin
    .from('products')
    .insert({ name: PRODUCT_NAME, category: 'X', material: 'Y', moq_units: 1 })
  assert('duplicate product name rejected (23505)', duplicateProduct.error?.code === '23505', err(duplicateProduct.error))

  const bogusCategory = await admin
    .from('products')
    .insert({ name: `${PRODUCT_NAME} bogus`, category: 'X', material: 'Y', moq_units: 1, category_id: crypto.randomUUID() })
  assert('unknown category_id rejected (23503)', bogusCategory.error?.code === '23503', err(bogusCategory.error))
  await admin.from('products').delete().eq('name', `${PRODUCT_NAME} bogus`)

  const tooManyImages = await admin
    .from('products')
    .update({ images: Array.from({ length: 7 }, (_, index) => ({ url: `${IMAGE_URL}?i=${index}`, fileId: null, name: `x${index}`, width: null, height: null })) })
    .eq('id', productId)
  assert('more than 6 images rejected (23514)', tooManyImages.error?.code === '23514', err(tooManyImages.error))

  const notAnArray = await admin.from('products').update({ images: { url: IMAGE_URL } }).eq('id', productId)
  assert('non-array images rejected (23514)', notAnArray.error?.code === '23514', err(notAnArray.error))

  const staleProduct = await admin
    .from('products')
    .update({ name: 'Should not apply' })
    .eq('id', productId)
    .eq('updated_at', '2000-01-01T00:00:00+00:00')
    .select('id')
  assert('stale product revision is refused', !staleProduct.error && staleProduct.data?.length === 0)

  section('6. Referential guard: a category in use cannot be deleted')
  const referencedCount = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
  assert('category reports 1 referencing product', referencedCount.count === 1, `count=${referencedCount.count}`)

  const blockedDelete = await admin.from('product_categories').delete().eq('id', categoryId)
  assert('FK RESTRICT blocks the delete (23503)', blockedDelete.error?.code === '23503', err(blockedDelete.error))

  section('7. Cleanup')
  const productDelete = await admin.from('products').delete().eq('id', productId)
  assert('product deleted', !productDelete.error, err(productDelete.error))
  productId = null

  const categoryDelete = await admin.from('product_categories').delete().eq('id', categoryId)
  assert('category deleted once unreferenced', !categoryDelete.error, err(categoryDelete.error))
  categoryId = null

  const leftovers = await admin.from('product_categories').select('id', { count: 'exact', head: true }).eq('name', CATEGORY_NAME)
  const leftoverProducts = await admin.from('products').select('id', { count: 'exact', head: true }).eq('name', PRODUCT_NAME)
  assert('no test categories left behind', (leftovers.count ?? 0) === 0, `count=${leftovers.count}`)
  assert('no test products left behind', (leftoverProducts.count ?? 0) === 0, `count=${leftoverProducts.count}`)
}

try {
  await main()
} catch (error) {
  bad('unexpected error', error?.message ?? String(error))
} finally {
  await cleanup()
  console.log(`\n${'-'.repeat(58)}`)
  console.log(`RESULT: ${passed} passed, ${failures.length} failed`)
  failures.forEach((failure) => console.log(`  - ${failure}`))
  console.log(`${'-'.repeat(58)}`)
  process.exit(failures.length ? 1 : 0)
}