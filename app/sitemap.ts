import type { MetadataRoute } from 'next'

// Auto-generated /sitemap.xml (seo.md contract). Admin + quote are
// intentionally excluded: the console is private, and the quote page is a
// modal-style conversion step rather than an entry page.
import { SITE_URL } from '@/lib/seo'

// lastModified lets crawlers prioritise what actually changed since their
// last visit, instead of re-crawling every entry on changeFrequency alone.
// This file is static (no live data source), so the build time is the honest
// signal available; Next regenerates it on each deploy.
const lastModified = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/showroom`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/factory`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/standards`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
