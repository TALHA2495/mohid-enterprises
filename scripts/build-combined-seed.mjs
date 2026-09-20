#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/build-combined-seed.mjs — regenerates supabase/seed-combined.sql
//
//   node --env-file=.env.local scripts/build-combined-seed.mjs
//
// Concatenates the three seed blocks into one runnable file for the Supabase
// SQL Editor. Run AFTER migrations 0004/0005/0006.
//
//   SEED 0004 — products (44 rows, generated)
//   SEED 0005 — factory_sections (6 rows: 3 hero + 3 card)
//   SEED 0006 — certificates (3 rows)
//
// The product block is read back from supabase/seed-products.sql, which
// generate-catalog-seed.mjs writes. It is NOT taken from the generator's
// stdout — that stream carries progress logs, and capturing it corrupts the
// SQL with "Wrote ..." lines.
// ---------------------------------------------------------------------------
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const ROOT = process.cwd()
const PRODUCTS_SQL = `${ROOT}/supabase/seed-products.sql`
const OUT = `${ROOT}/supabase/seed-combined.sql`

// 1. Re-generate the 44-product INSERT block (a2q8u8qtw URLs + real fileIds).
//    stdout is inherited so the generator's progress lines go to the console.
execSync('node --env-file=.env.local scripts/generate-catalog-seed.mjs', {
  cwd: ROOT,
  stdio: 'inherit',
})

const productBlock = readFileSync(PRODUCTS_SQL, 'utf8').trimEnd()

// 2. Factory + certificate seed blocks.
//
// URL rules learned from the live ImageKit CDN (account a2q8u8qtw):
//   * file names contain literal spaces -> encode each space as %20
//   * a literal '&' must stay RAW      -> 'Logistics & Export.png' is reachable
//                                          as Logistics%20&%20Export.png, while
//                                          Logistics%20%26%20Export.png is a 404
const factoryBlock = `-- ============================================================================
-- SEED 0005 - FACTORY_SECTIONS (6 rows: 3 hero + 3 card)
-- ----------------------------------------------------------------------------
-- Idempotent: ON CONFLICT against the (lower(title), kind) expression index.
-- Postgres requires an expression conflict target to be parenthesized.
-- ============================================================================
INSERT INTO factory_sections (kind, title, subtitle, image_url, sort_order, is_active) VALUES
  -- Hero grid (top of /factory) - full-bleed production imagery.
  ('hero', 'Material preparation',     NULL, 'https://ik.imagekit.io/a2q8u8qtw/factory/textile%20production.webp',      10, true),
  ('hero', 'Production floor',         NULL, 'https://ik.imagekit.io/a2q8u8qtw/factory/Braiding%20Winding.webp',        20, true),
  ('hero', 'Packed inventory',         NULL, 'https://ik.imagekit.io/a2q8u8qtw/factory/packed%20inventory.png',         30, true),
  -- Info cards (bottom of /factory) - capability callouts.
  ('card', 'Quality Inspection Protocol', 'Consistent processes, clear specifications, and dependable communication for every order.', 'https://ik.imagekit.io/a2q8u8qtw/factory/quality%20inspection.webp', 10, true),
  ('card', 'Export Packaging',            'Consistent processes, clear specifications, and dependable communication for every order.', 'https://ik.imagekit.io/a2q8u8qtw/factory/global_export.webp',        20, true),
  -- NOTE: the '&' must stay RAW here - '%26' returns HTTP 404 from ImageKit.
  ('card', 'Incoterms & Logistics',       'Consistent processes, clear specifications, and dependable communication for every order.', 'https://ik.imagekit.io/a2q8u8qtw/factory/Logistics%20&%20Export.png', 30, true)
ON CONFLICT ((lower(title)), kind) DO NOTHING;`

const certificateBlock = `-- ============================================================================
-- SEED 0006 - CERTIFICATES (3 rows)
-- ----------------------------------------------------------------------------
-- Idempotent: ON CONFLICT against the lower(title) expression index.
-- ============================================================================
INSERT INTO certificates (title, subtitle, image_url, sort_order, is_active) VALUES
  ('Company Profile - 20 Years',
   'Two decades of trims manufacturing, capacity, and export experience.',
   'https://ik.imagekit.io/a2q8u8qtw/certificates/company%20profile%2020%20year.jpeg',        10, true),
  ('WSO Certificate of Compliance',
   'Bureau verified export compliance for the current production year.',
   'https://ik.imagekit.io/a2q8u8qtw/certificates/wso%20certificate%20of%20compliance.jpeg',  20, true),
  ('WSO Letter of Authorization',
   'Official authorization for worldwide certificate-backed trade.',
   'https://ik.imagekit.io/a2q8u8qtw/certificates/wso%20letter%20of%20authorization.jpeg',    30, true)
ON CONFLICT ((lower(title))) DO NOTHING;`

const combined = `${productBlock}\n\n${factoryBlock}\n\n${certificateBlock}\n`
writeFileSync(OUT, combined, 'utf8')

// Guardrail: the generator's log lines must never leak into the SQL.
for (const marker of ['Wrote ', 'products seeded', 'categories used']) {
  if (combined.includes(marker)) {
    console.error(`\nFATAL: "${marker}" leaked into seed-combined.sql - the SQL is corrupt.`)
    process.exit(1)
  }
}

console.log(`\nseed-combined.sql written (${Buffer.byteLength(combined, 'utf8')} bytes)`)
console.log(`  product block : ${productBlock.length} bytes`)
console.log(`  factory block : ${factoryBlock.length} bytes`)
console.log(`  cert block    : ${certificateBlock.length} bytes`)
