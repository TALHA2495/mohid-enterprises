import type { Metadata } from 'next'
import { FactoryPage } from '@/components/factory-page'

// The page renders DB-driven photo tiles (factory_sections), so it cannot be
// frozen at build time — otherwise an admin edit would stay invisible until the
// next deploy. 60s keeps ISR cheap while edits propagate within a minute.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Factory & Capacity — 20+ Years of Trims Manufacturing',
  description:
    'Faisalabad manufacturing base: textile trims, ribbons, tassels, elastic, jute cord and more. 20+ years of export-grade production for B2B bulk buyers.',
  alternates: { canonical: '/factory' },
  // Declared in full on purpose: a page-level `openGraph` supersedes the root
  // layout's, so leaving `images` out here would drop the social preview card.
  openGraph: {
    type: 'website',
    siteName: 'Mohid Enterprises',
    url: '/factory',
    locale: 'en_US',
    title: 'Faisalabad Manufacturing Base — 20+ Years of Trims Manufacturing',
    description:
      'Ribbons, tassels, elastic, jute cord, conveyor belts and more — 20+ years of export-grade trims production for B2B bulk buyers.',
    images: [
      {
        url: '/images/hero-bg.webp',
        width: 1600,
        height: 900,
        alt: 'Mohid Enterprises — textile trims manufacturing floor in Faisalabad',
      },
    ],
  },
}

export default function Page() { return <FactoryPage /> }
