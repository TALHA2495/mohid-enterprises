import Link from 'next/link'

import { missingAdminEnvVars, supabaseAdmin } from '@/lib/supabase-admin.server'

const NAV_LINKS = [
  { href: '/admin/quotes', label: 'Quotes', emoji: '📋', ready: true },
  { href: '/admin/products', label: 'Products', emoji: '🧵', ready: true },
  { href: '/admin/orders', label: 'Orders', emoji: '📦', ready: false },
  { href: '/admin/invoices', label: 'Invoices', emoji: '💰', ready: false },
  { href: '/admin/payments', label: 'Payments', emoji: '✓', ready: false },
  { href: '/admin/customers', label: 'Customers', emoji: '👥', ready: false },
] as const

type Counts = {
  quotes: number
  products: number
  orders: number
  invoices: number
  payments: number
  customers: number
}

async function fetchCounts(): Promise<{ counts: Counts | null; error: string | null }> {
  if (!supabaseAdmin) return { counts: null, error: null }

  const [quotes, products, orders, invoices, payments, customers] = await Promise.all([
    supabaseAdmin.from('quotes').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('invoices').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('payments').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }),
  ])

  const failure = [quotes, products, orders, invoices, payments, customers].find((result) => result.error)?.error

  if (failure) {
    return { counts: null, error: `${failure.code ?? ''} ${failure.message}`.trim() }
  }

  return {
    counts: {
      quotes: quotes.count ?? 0,
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      invoices: invoices.count ?? 0,
      payments: payments.count ?? 0,
      customers: customers.count ?? 0,
    },
    error: null,
  }
}

export default async function AdminOverview() {
  const { counts, error } = await fetchCounts()
  const configMissing = missingAdminEnvVars.length > 0

  return (
    <div className="grid gap-6">
      {!counts ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm font-normal text-black/70">
          <p className="font-semibold text-black">
            {configMissing ? 'Supabase is not configured.' : 'Supabase answered, but the query failed.'}
          </p>
          {configMissing ? (
            <>
              <p className="mt-2">Missing from the environment of this deployment:</p>
              <ul className="mt-2 list-disc pl-5 font-mono text-xs text-black">
                {missingAdminEnvVars.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              <p className="mt-4">
                Add each one in Vercel under Settings, Environment Variables, tick Production and Preview, then
                redeploy: environment changes never apply to an existing deployment. NEXT_PUBLIC_* values are inlined at
                build time, so they must be present when the build runs, and promoting or rolling back a deployment
                reuses the old build instead.
              </p>
            </>
          ) : null}
          {error ? (
            <p className="mt-4">
              Supabase replied with{' '}
              <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">{error}</code>
            </p>
          ) : null}
          <p className="mt-4">
            Run <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">supabase/schema.sql</code> in
            the Supabase SQL editor, then reload. See{' '}
            <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">supabase/README.md</code>.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                { key: 'quotes', label: 'Quotes', href: '/admin/quotes' },
                { key: 'products', label: 'Products', href: '/admin/products' },
                { key: 'customers', label: 'Customers' },
                { key: 'orders', label: 'Orders' },
                { key: 'invoices', label: 'Invoices' },
                { key: 'payments', label: 'Payments' },
              ] as { key: keyof Counts; label: string; href?: string }[]
            ).map((stat) => {
              const body = (
                <>
                  <div className="text-xs font-medium text-black/60">{stat.label}</div>
                  <div className="mt-2 text-3xl font-semibold tabular-nums text-black">{counts[stat.key]}</div>
                  {stat.href ? null : (
                    <div className="mt-1 text-[10px] font-normal uppercase tracking-wide text-black/35">Soon</div>
                  )}
                </>
              )

              // Only link to a section that exists — a card leading to a 404 is worse than an inert one.
              return stat.href ? (
                <Link
                  key={stat.key}
                  href={stat.href}
                  className="rounded-2xl border border-black/10 bg-white p-5 transition-colors hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
                >
                  {body}
                </Link>
              ) : (
                <div key={stat.key} className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-5">
                  {body}
                </div>
              )
            })}
          </div>

          <nav aria-label="Admin sections" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {NAV_LINKS.map((link) =>
              link.ready ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-black/10 bg-white p-4 text-center text-sm font-medium text-black transition-colors hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
                >
                  <span aria-hidden="true" className="mr-1.5">
                    {link.emoji}
                  </span>
                  {link.label}
                </Link>
              ) : (
                <span
                  key={link.href}
                  className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-4 text-center text-sm font-normal text-black/45"
                >
                  <span aria-hidden="true" className="mr-1.5">
                    {link.emoji}
                  </span>
                  {link.label}
                  <span className="sr-only"> (not built yet)</span>
                </span>
              ),
            )}
          </nav>
        </>
      )}
    </div>
  )
}
