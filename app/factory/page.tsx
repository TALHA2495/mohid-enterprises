import type { Metadata } from 'next'
import { FactoryPage } from '@/components/factory-page'

// The page renders DB-driven photo tiles (factory_sections), so it cannot be
// frozen at build time — otherwise an admin edit would stay invisible until the
// next deploy. 60s keeps ISR cheap while edits propagate within a minute.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Factory & Capacity — Faisalabad Manufacturing Base',
  description:
    'Inside the Faisalabad manufacturing base: material preparation, braiding and winding lines, quality inspection protocol, export packaging and logistics for global trims programs.',
  alternates: { canonical: '/factory' },
}

export default function Page() { return <FactoryPage /> }
