import type { Metadata } from 'next'
import { StandardsPage } from '@/components/standards-page'
import { StructuredData } from '@/components/structured-data'
import { breadcrumbSchema, webPageSchema } from '@/lib/seo'

// The certificate gallery is now static CDN content, but revalidate is kept so
// the page can be re-wired to live data later without freezing at build time.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Quality Standards & Textile Trim Certifications',
  description:
    'View available textile quality, material and export compliance documents from Mohid Enterprises, a textile trims manufacturer in Faisalabad, Pakistan.',
  alternates: { canonical: '/standards' },
  openGraph: {
    type: 'website', siteName: 'Mohid Enterprises', url: '/standards',
    title: 'Quality Standards & Textile Trim Certifications | Mohid Enterprises',
    description: 'Available textile quality, material and export compliance documents from Mohid Enterprises in Faisalabad, Pakistan.',
    images: ['https://ik.imagekit.io/a2q8u8qtw/certificates/oeko-tex-standard-100-certification-mohid-enterprises.jpg.jpeg?updatedAt=1790174344574&tr=w-1200,f-auto,q-70'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quality Standards & Textile Trim Certifications | Mohid Enterprises',
    description: 'Available textile quality, material and export compliance documents from Mohid Enterprises.',
    images: ['https://ik.imagekit.io/a2q8u8qtw/certificates/oeko-tex-standard-100-certification-mohid-enterprises.jpg.jpeg?updatedAt=1790174344574&tr=w-1200,f-auto,q-70'],
  },
}

export default function Page() {
  const description = 'Available textile quality, material and export compliance documents from Mohid Enterprises, a textile trims manufacturer in Faisalabad, Pakistan.'
  return <><StructuredData data={[webPageSchema('Quality Standards & Textile Trim Certifications', '/standards', description), breadcrumbSchema('Standards', '/standards')]} /><StandardsPage /></>
}
