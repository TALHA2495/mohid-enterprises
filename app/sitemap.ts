import type { MetadataRoute } from 'next'

// Auto-generated /sitemap.xml (seo.md contract). Admin + quote are
// intentionally excluded: the console is private, and the quote page is a
// modal-style conversion step rather than an entry page.
import { SITE_URL } from '@/lib/seo'
import { loadShowroomProducts } from '@/lib/public-data.server'
import { CATALOG_DATA } from '@/lib/catalog-data'

// lastModified lets crawlers prioritise what actually changed since their
// last visit, instead of re-crawling every entry on changeFrequency alone.
// This file is static (no live data source), so the build time is the honest
// signal available; Next regenerates it on each deploy.
const lastModified = new Date()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Product detail pages are indexable; live catalog with the same static
  // fallback the showroom pages use (empty when Supabase is unconfigured).
  const live = await loadShowroomProducts()
  const products = live.length > 0 ? live : CATALOG_DATA

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/showroom`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    ...products.map((product) => ({
      url: `${SITE_URL}/showroom/${encodeURIComponent(product.name)}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/factory`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/standards`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
