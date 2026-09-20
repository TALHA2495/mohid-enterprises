#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/seed-public-pages.mjs — seed `factory_sections` + `certificates`
//
//   node --env-file=.env.local scripts/seed-public-pages.mjs
//
// This is the CLI equivalent of supabase/seed-factory.sql and
// supabase/seed-certificates.sql. Both SQL files remain the canonical record
// for the Supabase SQL Editor; this runner exists because the CLI in this
// environment has no psql/pg client, so the SQL cannot be piped directly.
//
// All image URLs were verified against the live ImageKit CDN (account
// a2q8u8qtw) with HTTP HEAD before being written here:
//   * file names contain literal spaces -> encoded as %20
//   * the '&' in "Logistics & Export.png" must stay RAW (%26 is a 404)
//
// Idempotent: rows are matched on the same keys as the SQL seeds —
// (lower(title), kind) for factory sections, lower(title) for certificates —
// so re-running never duplicates or overwrites an admin's edits.
// ---------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_ROLE_SERVICE_KEY.')
  process.exit(1)
}
const db = createClient(url, key)

const CDN = 'https://ik.imagekit.io/a2q8u8qtw'

const CARD_BODY =
  'Consistent processes, clear specifications, and dependable communication for every order.'

const FACTORY_SECTIONS = [
  // Hero grid (top of /factory) — full-bleed production imagery.
  { kind: 'hero', title: 'Material preparation', subtitle: null, image_url: `${CDN}/factory/textile%20production.webp`, sort_order: 10, is_active: true },
  { kind: 'hero', title: 'Production floor', subtitle: null, image_url: `${CDN}/factory/Braiding%20Winding.webp`, sort_order: 20, is_active: true },
  { kind: 'hero', title: 'Packed inventory', subtitle: null, image_url: `${CDN}/factory/packed%20inventory.png`, sort_order: 30, is_active: true },
  // Info cards (bottom of /factory) — capability callouts.
  { kind: 'card', title: 'Quality Inspection Protocol', subtitle: CARD_BODY, image_url: `${CDN}/factory/quality%20inspection.webp`, sort_order: 10, is_active: true },
  { kind: 'card', title: 'Export Packaging', subtitle: CARD_BODY, image_url: `${CDN}/factory/global_export.webp`, sort_order: 20, is_active: true },
  { kind: 'card', title: 'Incoterms & Logistics', subtitle: CARD_BODY, image_url: `${CDN}/factory/Logistics%20&%20Export.png`, sort_order: 30, is_active: true },
]

const CERTIFICATES = [
  {
    title: 'Company Profile — 20 Years',
    subtitle: 'Two decades of trims manufacturing, capacity, and export experience.',
    image_url: `${CDN}/certificates/company%20profile%2020%20year.jpeg`,
    sort_order: 10,
    is_active: true,
  },
  {
    title: 'WSO Certificate of Compliance',
    subtitle: 'Bureau verified export compliance for the current production year.',
    image_url: `${CDN}/certificates/wso%20certificate%20of%20compliance.jpeg`,
    sort_order: 20,
    is_active: true,
  },
  {
    title: 'WSO Letter of Authorization',
    subtitle: 'Official authorization for worldwide certificate-backed trade.',
    image_url: `${CDN}/certificates/wso%20letter%20of%20authorization.jpeg`,
    sort_order: 30,
    is_active: true,
  },
]

/** Compare CDN urls ignoring the ?tr= delivery transform. */
const bareUrl = (value) => String(value ?? '').split('?')[0]

async function seed({ table, rows, keyOf, label }) {
  const { data: existing, error } = await db.from(table).select('*')
  if (error) {
    console.error(`${label}: could not read ${table} — ${error.message}`)
    process.exit(1)
  }

  const byKey = new Map(existing.map((row) => [keyOf(row), row]))
  let inserted = 0
  let repaired = 0
  let unchanged = 0

  for (const row of rows) {
    const current = byKey.get(keyOf(row))
    if (!current) {
      const { error: insertError } = await db.from(table).insert(row)
      if (insertError) {
        console.error(`${label}: insert failed for "${row.title}" — ${insertError.message}`)
        process.exit(1)
      }
      inserted += 1
      console.log(`  INSERT  ${row.title}`)
      continue
    }

    // Rows seeded by an earlier bad URL (e.g. %26 in the Logistics filename)
    // would silently 404, so repair the image when it differs.
    if (bareUrl(current.image_url) !== bareUrl(row.image_url)) {
      const { error: fixError } = await db
        .from(table)
        .update({ image_url: row.image_url })
        .eq('id', current.id)
      if (fixError) {
        console.error(`${label}: repair failed for "${row.title}" — ${fixError.message}`)
        process.exit(1)
      }
      repaired += 1
      console.log(`  FIX URL ${row.title}`)
      console.log(`            ${bareUrl(current.image_url)}`)
      console.log(`         -> ${bareUrl(row.image_url)}`)
      continue
    }
    unchanged += 1
  }

  const { count } = await db.from(table).select('*', { count: 'exact', head: true })
  console.log(`${label}: ${inserted} inserted, ${repaired} repaired, ${unchanged} unchanged — ${count} row(s) total.\n`)
}

await seed({
  table: 'factory_sections',
  rows: FACTORY_SECTIONS,
  keyOf: (row) => `${row.kind}|${String(row.title).toLowerCase()}`,
  label: 'factory_sections',
})

await seed({
  table: 'certificates',
  rows: CERTIFICATES,
  keyOf: (row) => String(row.title).toLowerCase(),
  label: 'certificates',
})
