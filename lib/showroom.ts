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
