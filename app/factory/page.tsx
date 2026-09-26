import type { Metadata } from 'next'
import { FactoryPage } from '@/components/factory-page'
import { StructuredData } from '@/components/structured-data'
import { breadcrumbSchema, webPageSchema } from '@/lib/seo'

// The page renders DB-driven photo tiles (factory_sections), so it cannot be
// frozen at build time — otherwise an admin edit would stay invisible until the
// next deploy. 60s keeps ISR cheap while edits propagate within a minute.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Textile Trims Manufacturing Factory',
  description:
    'Explore textile trims manufacturing at Mohid Enterprises in Faisalabad, Pakistan, with 20+ years of experience serving local and international buyers.',
  alternates: { canonical: '/factory' },
  openGraph: {
    type: 'website', siteName: 'Mohid Enterprises', url: '/factory',
    title: 'Textile Trims Manufacturing Factory | Mohid Enterprises',
    description: 'Explore textile trims manufacturing at Mohid Enterprises in Faisalabad, Pakistan, with 20+ years of experience serving local and international buyers.',
    images: [{ url: 'https://ik.imagekit.io/a2q8u8qtw/factory/textile%20production.webp', alt: 'Textile trims production floor at Mohid Enterprises' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Textile Trims Manufacturing Factory | Mohid Enterprises',
    description: 'Textile trims manufacturing in Faisalabad, Pakistan, with 20+ years of experience.',
    images: ['https://ik.imagekit.io/a2q8u8qtw/factory/textile%20production.webp'],
  },
}

export default function Page() {
  const description = 'Textile trims manufacturing at Mohid Enterprises in Faisalabad, Pakistan, with 20+ years of experience serving local and international buyers.'
  return <><StructuredData data={[webPageSchema('Textile Trims Manufacturing Factory', '/factory', description), breadcrumbSchema('Factory', '/factory')]} /><FactoryPage /></>
}
