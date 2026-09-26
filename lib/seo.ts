export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mohident.com').replace(/\/$/, '')
export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const ORGANIZATION_SCHEMA = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Mohid Enterprises',
  url: `${SITE_URL}/`,
  description:
    'Textile trims manufacturer in Faisalabad, Pakistan, supplying local and international buyers with 20+ years of manufacturing experience.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Faisalabad',
    addressCountry: 'PK',
  },
} as const

export const WEBSITE_SCHEMA = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: 'Mohid Enterprises',
  publisher: { '@id': ORGANIZATION_ID },
  inLanguage: 'en',
} as const

export function absoluteUrl(path = '/') {
  return new URL(path, `${SITE_URL}/`).toString()
}

export function breadcrumbSchema(name: string, path: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name, item: absoluteUrl(path) },
    ],
  }
}

export function webPageSchema(name: string, path: string, description: string) {
  return {
    '@type': 'WebPage',
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
  }
}
