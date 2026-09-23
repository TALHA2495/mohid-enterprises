// ---------------------------------------------------------------------------
// lib/public-data.server.ts — server-side readers for the public pages.
//
// Every public catalog read goes through the service-role client, so the anon
// key never needs read access and RLS keeps zero anon policies.
//
// NOTE: this module is the home for ALL server-side public data fetching. It
// must never be imported from a 'use client' component — importing
// supabase-admin.server on the client trips its service-role guard.
//
// Each loader returns an empty array when Supabase is not configured, so the
// pages fall back to their static content instead of erroring.
// ---------------------------------------------------------------------------
import { supabaseAdmin, missingAdminEnvVars } from './supabase-admin.server'
import { HERO_CATEGORIES, PRODUCT_TYPES } from './showroom'
import type { HeroCategory, HeroSectionRow, ProductType } from './showroom'
import { CATALOG_DATA } from './catalog-data'

export type ShowroomProduct = {
  name: string
  type: ProductType
  image: string
  /** Raw CDN URLs from the DB `images` JSONB — no transform. Detail page thumbnails use these. */
  images: string[]
  description: string
  material: string
  width: string
  colors: string
  finish: string
  specs: [string, string][]
}

export type FactorySection = {
  id: string
  kind: 'hero' | 'card'
  title: string
  subtitle: string | null
  imageUrl: string
  sortOrder: number
}

/** ImageKit delivery transform used across the public pages. */
const TRANSFORM = '?tr=w-1200,f-auto,q-70'

type Row = Record<string, unknown>

/** First image URL of a product row, transformed for the web. */
function firstImage(row: Row): string {
  const images = Array.isArray(row.images) ? (row.images as Row[]) : []
  const url = typeof images[0]?.url === 'string' ? (images[0].url as string) : ''
  if (!url) return ''
  return url.includes('?') ? url : `${url}${TRANSFORM}`
}

/** `specs` is [[label, value], ...]; pull one value out by label. */
function specValue(specs: unknown, label: string): string | null {
  if (!Array.isArray(specs)) return null
  for (const entry of specs as unknown[]) {
    if (Array.isArray(entry) && typeof entry[0] === 'string' && entry[0].toLowerCase() === label.toLowerCase()) {
      return typeof entry[1] === 'string' ? entry[1] : null
    }
  }
  return null
}

function textList(value: unknown, separator: string): string {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string').join(separator)
  return typeof value === 'string' && value.trim() ? value : ''
}

/** Static catalog entry per product name — fills gaps in a partially-filled DB row. */
const CATALOG_BY_NAME = new Map(CATALOG_DATA.map((product) => [product.name.toLowerCase(), product]))

/** Coerce the DB `type` tag onto the canonical ProductType union. */
function toProductType(value: unknown, name: string): ProductType {
  if (typeof value === 'string' && (PRODUCT_TYPES as readonly string[]).includes(value)) {
    return value as ProductType
  }
  // Fall back to the type the showroom shipped with for this product name.
  return CATALOG_BY_NAME.get(name.toLowerCase())?.type ?? PRODUCT_TYPES[0]
}

/** `specs` value coerced to the [[label, value], ...] shape the UI renders. */
function mapSpecs(value: unknown): [string, string][] {
  if (!Array.isArray(value)) return []
  return (value as unknown[])
    .filter((entry): entry is [string, string] => Array.isArray(entry) && entry.length >= 2)
    .map((entry) => [String(entry[0]), String(entry[1])] as [string, string])
}

function mapProduct(row: Row): ShowroomProduct {
  const name = String(row.name ?? '')
  // Static entry for this product, if the showroom ever shipped it. A DB row
  // that only carries a name + image still renders a complete detail page.
  const fallback = CATALOG_BY_NAME.get(name.toLowerCase())
  const widthMm = typeof row.width_mm === 'number' ? row.width_mm : null
  const specs = mapSpecs(row.specs)
  return {
    name,
    type: toProductType(row.type, name),
    image: firstImage(row) || fallback?.image || '',
    /** Raw CDN URLs — no transform. Detail page thumbnails construct their own. */
    images: ((): string[] => {
      const raw = Array.isArray(row.images)
        ? (row.images as Row[]).map((img) => (img as Row).url).filter((u): u is string => typeof u === 'string')
        : []
      if (raw.length > 0) return raw
      // Static-fallback path: catalog entries carry a single transformed `image`.
      return fallback?.image ? [fallback.image] : []
    })(),
    description: String(row.description ?? '') || fallback?.description || '',
    material: String(row.material ?? '') || fallback?.material || '',
    width:
      (specValue(row.specs, 'Available widths') ?? (widthMm ? `${widthMm}mm` : '')) ||
      fallback?.width ||
      'Various',
    colors:
      textList(row.available_colors, ', ') ||
      specValue(row.specs, 'Color options') ||
      fallback?.colors ||
      'Various',
    finish:
      textList(row.available_finishes, ' / ') ||
      specValue(row.specs, 'Finish') ||
      fallback?.finish ||
      'Various',
    specs: specs.length > 0 ? specs : fallback?.specs ?? [],
  }
}

export async function loadShowroomProducts(): Promise<ShowroomProduct[]> {
  if (!supabaseAdmin) {
    if (missingAdminEnvVars.length > 0) {
      console.warn(`[public-data] Supabase not configured (missing: ${missingAdminEnvVars.join(', ')}).`)
    }
    return []
  }
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('name, type, description, material, width_mm, available_colors, available_finishes, specs, images')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.warn(`[public-data] products query failed: ${error.message}`)
    return []
  }
  return (data ?? []).filter((row) => row.name).map((row) => mapProduct(row as Row))
}

export async function loadFactorySections(): Promise<FactorySection[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin
    .from('factory_sections')
    .select('id, kind, title, subtitle, image_url, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.warn(`[public-data] factory_sections query failed: ${error.message}`)
    return []
  }
  return (data ?? []).map((row) => ({
    id: String(row.id),
    kind: row.kind === 'card' ? 'card' : 'hero',
    title: String(row.title ?? ''),
    subtitle: typeof row.subtitle === 'string' ? row.subtitle : null,
    imageUrl: String(row.image_url ?? ''),
    sortOrder: typeof row.sort_order === 'number' ? row.sort_order : 0,
  }))
}

// ---------------------------------------------------------------------------
// Home hero cards (hero_sections). Lives here rather than lib/showroom.ts:
// that module is imported by 'use client' components, so it can never touch
// the service-role client — moving the query back there would re-trip the
// "service-role key must never be exposed to the browser" guard.
// ---------------------------------------------------------------------------

/** Column is `description` in hero_sections — not `desc`. */
function toHeroCategory(row: Row): HeroCategory {
  return {
    id: String(row.id ?? ''),
    label: String(row.label ?? ''),
    desc: typeof row.description === 'string' ? row.description : '',
    filter: String(row.filter ?? ''),
    image: String(row.image ?? ''),
  }
}

/** Sorted set of currently-published hero cards (static fallback on any failure). */
export async function loadHeroCategories(): Promise<HeroCategory[]> {
  if (!supabaseAdmin) return [...HERO_CATEGORIES]

  const { data, error } = await supabaseAdmin
    .from('hero_sections')
    .select('id, label, description, filter, image, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn(`[hero-sections] load failed — falling back to static list: ${error.message}`)
    return [...HERO_CATEGORIES]
  }

  const rows = (data ?? []).map((row) => toHeroCategory(row as Row)).filter((row) => row.label && row.image)
  // Never render an empty hero: an admin can deactivate every row.
  return rows.length > 0 ? rows : [...HERO_CATEGORIES]
}