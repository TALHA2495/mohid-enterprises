import type { Metadata } from 'next'

import AdminOverview from '@/components/admin/admin-overview'

export const metadata: Metadata = {
  title: 'Admin dashboard | Mohid Enterprises',
}

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f8] text-black">
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6">
        <p className="section-label mb-4">Overview</p>
        <h1 className="font-display mb-2 text-4xl leading-tight text-black">
          Operations <span className="gradient-brand-text">dashboard</span>
        </h1>
        <p className="mb-8 text-sm text-black/60">Quote → order → invoice → payment, at a glance.</p>
        <AdminOverview />
      </div>
    </main>
  )
}
