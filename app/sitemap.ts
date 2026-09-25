import type { MetadataRoute } from 'next'

// Auto-generated /sitemap.xml (seo.md contract). Admin + quote are
// intentionally excluded: the console is private, and the quote page is a
// modal-style conversion step rather than an entry page.
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/showroom`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/factory`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/standards`, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
