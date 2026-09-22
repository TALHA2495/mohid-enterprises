import type { MetadataRoute } from 'next'

// Auto-generated /sitemap.xml (seo.md contract). Admin + quote are
// intentionally excluded: the console is private, and the quote page is a
// modal-style conversion step rather than an entry page.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mohident.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/showroom`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/factory`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/standards`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
