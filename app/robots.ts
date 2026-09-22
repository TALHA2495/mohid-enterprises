import type { MetadataRoute } from 'next'

// Auto-generated /robots.txt (seo.md contract). The admin console and the
// quote modal must never be crawled or indexed.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mohident.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/quote', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
