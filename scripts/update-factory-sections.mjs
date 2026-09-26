#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/update-factory-sections.mjs — apply the 2026 /factory restructure to
// the live `factory_sections` rows.
//
//   node --env-file=.env.local scripts/update-factory-sections.mjs
//
// Two jobs:
//   1. Relabel the three hero tiles with their buyer-facing names.
//   2. Retire (is_active = false) the capability cards, which the page no
//      longer renders. The rows are NOT deleted — the copy and photography
//      stay one UPDATE away from coming back.
//
// Idempotent, and matched on the STABLE part of the URL (the filename) rather
// than on `title`. Matching on `title` would break the second run precisely
// because the title is what this script rewrites, and renaming via a title-keyed
// INSERT collides with the (lower(title), kind) unique index — that is the
// duplicate-tile trap this script exists to avoid.
// ---------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.')
  console.error('Run as: node --env-file=.env.local scripts/update-factory-sections.mjs')
  process.exit(1)
}

/** ImageKit filename (percent-encoded, as it appears in image_url) → new label. */
const RENAMES = [
  ['textile%20production.webp', 'Textile Trims'],
  ['Braiding%20Winding.webp', 'Braids & Cords'],
  ['packed%20inventory.png', 'Packed for Export'],
]

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // Read the hero rows once and match in JS: a LIKE '%...%20...' pattern would
  // treat the '%' inside the encoded filename as a wildcard.
  const { data: heroRows, error: heroError } = await supabase
    .from('factory_sections')
    .select('id, title, image_url')
    .eq('kind', 'hero')

  if (heroError) {
    console.error(`FAILED to list hero rows: ${heroError.message}`)
    process.exit(1)
  }

  let renamed = 0
  let skipped = 0

  for (const [filename, title] of RENAMES) {
    const matches = (heroRows ?? []).filter(
      (row) => typeof row.image_url === 'string' && row.image_url.includes(filename),
    )

    if (matches.length === 0) {
      console.log(`SKIP   ${filename}  (no hero row points at it)`)
      skipped += 1
      continue
    }
    if (matches.length > 1) {
      console.error(`REFUSED ${filename}: ${matches.length} hero rows match — resolve the duplicates first.`)
      process.exit(1)
    }
    const row = matches[0]
    if (row.title === title) {
      console.log(`OK     ${filename}  already "${title}"`)
      skipped += 1
      continue
    }

    const { error } = await supabase.from('factory_sections').update({ title }).eq('id', row.id)
    if (error) {
      console.error(`FAILED ${filename}: ${error.message}`)
      process.exit(1)
    }
    renamed += 1
    console.log(`RENAME ${filename}  "${row.title}" -> "${title}"`)
  }

  // Retire the capability cards — the page renders kind='hero' only.
  const { data: cards, error: cardError } = await supabase
    .from('factory_sections')
    .select('id, title')
    .eq('kind', 'card')
    .eq('is_active', true)

  if (cardError) {
    console.error(`FAILED to list card rows: ${cardError.message}`)
    process.exit(1)
  }

  let retired = 0
  for (const card of cards ?? []) {
    const { error } = await supabase.from('factory_sections').update({ is_active: false }).eq('id', card.id)
    if (error) {
      console.error(`FAILED to retire "${card.title}": ${error.message}`)
      process.exit(1)
    }
    retired += 1
    console.log(`RETIRE "${card.title}"  (kept in the table, is_active=false)`)
  }
  if (retired === 0) console.log('OK     no active card rows — already retired')

  // Read back exactly what the page will render.
  const { data: live, error: liveError } = await supabase
    .from('factory_sections')
    .select('kind, title, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  if (liveError) {
    console.error(`FAILED to read back: ${liveError.message}`)
    process.exit(1)
  }

  console.log('')
  console.log(`renamed: ${renamed}   skipped: ${skipped}   retired: ${retired}`)
  console.log(`active rows the /factory hero renders (${(live ?? []).length}):`)
  for (const row of live ?? []) console.log(`  ${row.kind}  ${String(row.sort_order).padStart(2)}  ${row.title}`)
}

main()
