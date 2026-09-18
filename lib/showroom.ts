// Single source of truth for showroom filters and home-hero category cards.
// ShowroomSection and HeroSection both import from here - keeps the category
// labels, type mappings, and hero artwork in one place.

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
// matching filter applied. Images are existing compressed product photos.
export const HERO_CATEGORIES: readonly HeroCategory[] = [
  { id: '01', label: 'Industrial Egg Belts', desc: 'Specialized belting for agricultural systems.', filter: 'Egg Belts', image: '/product%20images%20webp/pp%20woven%20egg%20conveyor%20belt.avif' },
  { id: '02', label: 'Pom Poms & Lace', desc: 'Delicate Guipure and playful accents for apparel.', filter: 'Pom Poms', image: '/product%20images%20compressed/Pom%20Pom%20Trim_compressed.webp' },
  { id: '03', label: 'Accessories & Crafts', desc: 'Custom packaging and specialty finished goods.', filter: 'Accessories', image: '/product%20images%20compressed/Party%20Hat_compressed.webp' },
  { id: '04', label: 'Tapes & Ribbons', desc: 'Structural strength and high-polish finishes.', filter: 'Tapes', image: '/product%20images%20compressed/Twill%20Tape_compressed.webp' },
  { id: '05', label: 'Elastics & Belts', desc: 'Custom waistbands and durable utility webbing.', filter: 'Elastics', image: '/product%20images%20compressed/Jacquard%20Elastic%20%26%20Tape_compressed.webp' },
  { id: '06', label: 'Cords & Tassels', desc: 'Functional drawstrings and decorative end-finishes.', filter: 'Cords & Tassels', image: '/product%20images%20compressed/Flat%20Draw%20Cord_compressed.webp' },
]

// ============================================================================
// HERO SECTIONS — live, editor-managed catalog of the home-page cards
// ----------------------------------------------------------------------------
// The home page reads published rows via loadHeroSections() (server-side, using
// the service-role client so the public site never needs the anon key to hold
// catalog read access). When Supabase is unavailable, the table is missing, or
// no rows are published, it transparently falls back to the static
// HERO_CATEGORIES above — so a misconfigured deployment still renders.
// ============================================================================
import { supabaseAdmin } from '@/lib/supabase-admin.server'

export type HeroSectionRow = {
  id: string
  label: string
  desc: string | null
  filter: string
  image: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Map a DB row back to the legacy HeroCategory shape the home page expects. */
function toHeroCategory(row: HeroSectionRow): HeroCategory {
  return {
    id: row.id,
    label: row.label,
    desc: row.desc ?? '',
    filter: row.filter,
    image: row.image,
  }
}

/** Sorted set of currently-published hero cards (static fallback on any failure). */
export async function loadHeroCategories(): Promise<HeroCategory[]> {
  if (!supabaseAdmin) return [...HERO_CATEGORIES]

    const { data, error } = await supabaseAdmin
    .from('hero_sections')
    .select('id, label, desc, filter, image, sort_order, is_active, created_at, updated_at')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error || !(data?.length)) {
    console.error('[hero-sections] load failed — falling back to static list:', error?.message ?? 'no rows')
    return [...HERO_CATEGORIES]
  }

  return data.map(toHeroCategory)
}
