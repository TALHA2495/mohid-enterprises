import type { Metadata } from 'next'

import AdminOverview from '@/components/admin/admin-overview'

export const metadata: Metadata = {
  title: 'Admin dashboard | Mohid Enterprises',
}

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return (
    <div>
        <p className="section-label mb-4">Overview</p>
        <h1 className="font-display mb-2 text-4xl leading-tight text-black">
          Operations <span className="gradient-brand-text">dashboard</span>
        </h1>
        <p className="mb-8 text-sm text-black/60">Quotes, catalog and customers, at a glance. Orders, invoices and payments are coming soon.</p>
        <AdminOverview />
      </div>
  )
}
