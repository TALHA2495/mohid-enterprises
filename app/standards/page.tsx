import type { Metadata } from 'next'
import { StandardsPage } from '@/components/standards-page'

// The certificate gallery is now static CDN content, but revalidate is kept so
// the page can be re-wired to live data later without freezing at build time.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Standards & Certificates — Quality Commitment & Export Compliance',
  description:
    'Certificates of compliance, letters of authorization and the documented quality checks Mohid Enterprises applies across materials, production, packing and export readiness.',
  alternates: { canonical: '/standards' },
}

export default function Page() { return <StandardsPage /> }
