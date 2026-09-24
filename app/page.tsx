import type { Metadata } from 'next'
﻿import { HeroSection } from '@/components/hero-section'
import { StandardsPage } from '@/components/standards-page'
import { FactoryPage } from '@/components/factory-page'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { StructuredData } from '@/components/structured-data'
import { ORGANIZATION_ID, webPageSchema } from '@/lib/seo'

const description =
  'Mohid Enterprises manufactures textile trims in Faisalabad, Pakistan, supplying local and international buyers with 20+ years of manufacturing experience.'

export const metadata: Metadata = {
  title: 'Textile Trims Manufacturer in Faisalabad',
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', siteName: 'Mohid Enterprises', url: '/',
    title: 'Textile Trims Manufacturer in Faisalabad | Mohid Enterprises', description,
    images: [{ url: 'https://ik.imagekit.io/a2q8u8qtw/Hero/Textile%20Trims%20Manufacturing.jpg', alt: 'Textile trims manufacturing floor at Mohid Enterprises in Faisalabad, Pakistan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Textile Trims Manufacturer in Faisalabad | Mohid Enterprises', description,
    images: ['https://ik.imagekit.io/a2q8u8qtw/Hero/Textile%20Trims%20Manufacturing.jpg'],
  },
}

export default function Page() {
  return (
    <main id="main" className="relative min-h-screen overflow-x-hidden bg-[#f4f7f8]">
      <StructuredData data={{ ...webPageSchema('Textile Trims Manufacturer in Faisalabad', '/', description), mainEntity: { '@id': ORGANIZATION_ID } }} />
      <SiteHeader />
      <HeroSection />
      <StandardsPage embedded />
      <FactoryPage embedded />
      <SiteFooter />
    </main>
  )
}
