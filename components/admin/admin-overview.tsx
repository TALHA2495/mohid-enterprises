import Link from 'next/link'

import { supabaseAdmin } from '@/lib/supabase-admin.server'

const NAV_LINKS = [
  { href: '/admin/quotes', label: 'Quotes', emoji: '📋' },
  { href: '/admin/orders', label: 'Orders', emoji: '📦' },
  { href: '/admin/invoices', label: 'Invoices', emoji: '💰' },
  { href: '/admin/payments', label: 'Payments', emoji: '✓' },
  { href: '/admin/customers', label: 'Customers', emoji: '👥' },
] as const

async function fetchCounts() {
  if (!supabaseAdmin) return null

  const [quotes, orders, invoices, payments, customers] = await Promise.all([
    supabaseAdmin.from('quotes').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('invoices').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('payments').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }),
  ])

  return {
    quotes: quotes.count ?? 0,
    orders: orders.count ?? 0,
    invoices: invoices.count ?? 0,
    payments: payments.count ?? 0,
    customers: customers.count ?? 0,
  }
}

export default async function AdminOverview() {
  const counts = await fetchCounts()

  return (
    <div className="grid gap-6">
      {!counts ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm font-normal text-black/70">
          <p className="font-semibold text-black">Supabase is not configured.</p>
          <p className="mt-2">
            Add <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
            <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{' '}
            <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> to the
            environment, then run <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">supabase/schema.sql</code>{' '}
            in the Supabase SQL editor. See <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">supabase/README.md</code>.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {(
              [
                { key: 'quotes', label: 'Quotes', href: '/admin/quotes' },
                { key: 'customers', label: 'Customers', href: '/admin/customers' },
                { key: 'orders', label: 'Orders', href: '/admin/orders' },
                { key: 'invoices', label: 'Invoices', href: '/admin/invoices' },
                { key: 'payments', label: 'Payments', href: '/admin/payments' },
              ] as const
            ).map((stat) => (
              <Link
                key={stat.key}
                href={stat.href}
                className="rounded-2xl border border-black/10 bg-white p-5 transition-colors hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
              >
                <div className="text-xs font-medium text-black/60">{stat.label}</div>
                <div className="mt-2 text-3xl font-semibold tabular-nums text-black">{counts[stat.key]}</div>
              </Link>
            ))}
          </div>

          <nav aria-label="Admin sections" className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-black/10 bg-white p-4 text-center text-sm font-medium text-black transition-colors hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
              >
                <span aria-hidden="true" className="mr-1.5">{link.emoji}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  )
}
