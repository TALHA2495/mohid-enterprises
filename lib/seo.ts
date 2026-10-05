import { yearsEstablishedLabel } from './company-years'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mohid-enterprises.com').replace(/\/$/, '')
export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const ORGANIZATION_SCHEMA = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Mohid Enterprises',
  url: `${SITE_URL}/`,
  email: 'mohident149@gmail.com',
  description:
    `Textile trims manufacturer in Faisalabad, Pakistan, supplying local and international buyers with ${yearsEstablishedLabel()} years of manufacturing experience.`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Plot #79, Gulshan Rafiq Colony Samanabad',
    addressLocality: 'Faisalabad',
    addressRegion: 'Punjab',
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
