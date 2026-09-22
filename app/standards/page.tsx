import type { Metadata } from 'next'
import { StandardsPage } from '@/components/standards-page'

// The certificate gallery is DB-driven (certificates), so revalidate instead of
// freezing the page at build time — an admin edit appears within a minute.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Standards & Certificates — Quality Commitment & Export Compliance',
  description:
    'Certificates of compliance, letters of authorization and the documented quality checks Mohid Enterprises applies across materials, production, packing and export readiness.',
  alternates: { canonical: '/standards' },
}

export default function Page() { return <StandardsPage /> }
