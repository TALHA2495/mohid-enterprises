// ---------------------------------------------------------------------------
// lib/showroom.ts — CLIENT-SAFE declarations for the showroom and home hero.
//
// This module is imported by client components (ShowroomSection) and by the
// hero admin editor, so it MUST stay free of server-only imports.
//
// It previously imported the service-role client (lib/supabase-admin.server)
// to run its own data fetching. Because ShowroomSection is a 'use client'
// component, that pulled the service-role client into the browser bundle and
// tripped its guard:
//
//   "lib/supabase-admin.server.ts imported on the client — the service-role
//    key must never be exposed to the browser."
//
// Server-side readers now live in lib/public-data.server.ts
// (loadHeroCategories, loadShowroomProducts, loadFactorySections,
// loadCertificates). Data fetching must never move back into this file.
// ---------------------------------------------------------------------------

// Canonical product type tags shared by the showroom product data and filters.
// FRINGE and PARTY were added so every product maps to a filter category.
export const PRODUCT_TYPES = [
  'ELASTIC',
  'TAPE',
  'RIBBON',
  'CORD',
  'TASSEL',
  'SHOELACE',
  'UTILITY',
  'EGG BELT',
  'POM POM',
  'LACE',
  'FRINGE',
  'YARN',
  'POUCH',
  'PARTY',
] as const

export type ProductType = (typeof PRODUCT_TYPES)[number]

export const SHOWROOM_FILTERS: readonly string[] = [
  'All trims',
  'Egg Belts',
  'Pom Poms',
  'Accessories',
  'Tapes',
  'Elastics',
  'Cords & Tassels',
  'Shoelaces',
  'Ribbons',
  'Belts',
  'Lace',
  'Yarn',
]

export const FILTER_TYPES: Record<string, readonly ProductType[]> = {
  Elastics: ['ELASTIC'],
  Tapes: ['TAPE'],
  Ribbons: ['RIBBON'],
  'Cords & Tassels': ['CORD', 'TASSEL'],
  Shoelaces: ['SHOELACE'],
  Belts: ['UTILITY'],
  'Egg Belts': ['EGG BELT'],
  'Pom Poms': ['POM POM'],
  Lace: ['LACE', 'FRINGE'],
  Yarn: ['YARN'],
  Accessories: ['POUCH', 'PARTY'],
}

export type HeroCategory = {
  id: string
  label: string
  desc: string
  filter: string
  image: string
}

// Category cards shown in the home hero. Each links to the showroom with the
// matching filter applied.
//
// Images are the SAME product photos the catalog serves, on the live ImageKit
// account (a2q8u8qtw). They used to be local paths under
// /product%20images%20webp/ and /product%20images%20compressed/ — those folders
// were renamed, so every card rendered a broken image. Each URL here was
// verified HTTP 200.
const CDN = 'https://ik.imagekit.io/a2q8u8qtw/products'
const TRANSFORM = '?tr=w-1200,f-auto,q-70'

export const HERO_CATEGORIES: readonly HeroCategory[] = [
  { id: '01', label: 'Industrial Egg Belts', desc: 'Specialized belting for agricultural systems.', filter: 'Egg Belts', image: `${CDN}/pp_woven_egg_conveyor_belt.avif${TRANSFORM}` },
  { id: '02', label: 'Pom Poms & Lace', desc: 'Delicate Guipure and playful accents for apparel.', filter: 'Pom Poms', image: `${CDN}/Pom_Pom_Trim.webp${TRANSFORM}` },
  { id: '03', label: 'Accessories & Crafts', desc: 'Custom packaging and specialty finished goods.', filter: 'Accessories', image: `${CDN}/Party_Hat.webp${TRANSFORM}` },
  { id: '04', label: 'Tapes & Ribbons', desc: 'Structural strength and high-polish finishes.', filter: 'Tapes', image: `${CDN}/Twill_Tape.webp${TRANSFORM}` },
  { id: '05', label: 'Elastics & Belts', desc: 'Custom waistbands and durable utility webbing.', filter: 'Elastics', image: `${CDN}/Jacquard_Elastic___Tape.webp${TRANSFORM}` },
  { id: '06', label: 'Cords & Tassels', desc: 'Functional drawstrings and decorative end-finishes.', filter: 'Cords & Tassels', image: `${CDN}/Flat_Draw_Cord.webp${TRANSFORM}` },
]

// ---------------------------------------------------------------------------
// HERO SECTIONS — row shape of the editable `hero_sections` table.
//
// The reader for these rows is loadHeroCategories() in
// lib/public-data.server.ts, which falls back to HERO_CATEGORIES above when
// Supabase is unavailable, the table is missing, or no rows are published.
// ---------------------------------------------------------------------------

export type HeroSectionRow = {
  id: string
  label: string
  /** The column is `description` in hero_sections — not `desc`. */
  description: string | null
  filter: string
  image: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}
