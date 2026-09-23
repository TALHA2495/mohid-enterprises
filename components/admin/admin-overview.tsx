import Link from 'next/link'

import { missingAdminEnvVars, supabaseAdmin } from '@/lib/supabase-admin.server'

type Counts = {
  quotes: number
  products: number
  orders: number
  invoices: number
  payments: number
  customers: number
}

async function fetchCounts(): Promise<{ counts: Partial<Counts> | null; error: string | null }> {
  if (!supabaseAdmin) return { counts: null, error: null }

  // Core modules. These tables always exist in the schema.
  const [quotes, products, customers] = await Promise.all([
    supabaseAdmin.from('quotes').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }),
  ])

  const failure = [quotes, products, customers].find((result) => result.error)?.error

  if (failure) {
    return { counts: null, error: `${failure.code ?? ''} ${failure.message}`.trim() }
  }

  const counts: Partial<Counts> = {
    quotes: quotes.count ?? 0,
    products: products.count ?? 0,
    customers: customers.count ?? 0,
  }

  // Optional modules (orders / invoices / payments) are not shipped yet. A
  // missing table (Postgres 42P01) means "not shipped" — show 0 instead of
  // failing the whole dashboard; any other error is logged but non-fatal.
  for (const entry of [
    { key: 'orders', table: 'orders' },
    { key: 'invoices', table: 'invoices' },
    { key: 'payments', table: 'payments' },
  ] as const) {
    const { count, error } = await supabaseAdmin.from(entry.table).select('id', { count: 'exact', head: true })
    if (!error) counts[entry.key] = count ?? 0
    else if (error.code !== '42P01') console.error(`[AdminOverview] count(${entry.table}) failed:`, error.message)
  }

  return { counts, error: null }
}
export default async function AdminOverview() {
  const { counts, error } = await fetchCounts()
  const configMissing = missingAdminEnvVars.length > 0

  return (
    <div className="grid gap-6">
      {!counts || Object.keys(counts).length === 0 ? (
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
            If this is a fresh database, run{' '}
            <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">supabase/schema.sql</code> in
            the Supabase SQL editor, then reload. See{' '}
            <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs">supabase/README.md</code>.
          </p>
        </div>
      ) : (
        // 2-up stays right on phones (numeric tiles), then the row grows with the
        // viewport so six stats read as one band instead of three sprawling rows
        // of half-width cards on an ultrawide display.
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          {(
            [
              { key: 'quotes', label: 'Quotes', href: '/admin/quotes' },
              { key: 'products', label: 'Products', href: '/admin/products' },
              { key: 'customers', label: 'Customers' },
              { key: 'orders', label: 'Orders', soon: true },
              { key: 'invoices', label: 'Invoices', soon: true },
              { key: 'payments', label: 'Payments', soon: true },
            ] as { key: keyof Counts; label: string; href?: string; soon?: boolean }[]
          ).map((stat) => {
            const body = (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-black/60">
                  {stat.label}{stat.soon ? ' · soon' : ''}
                </div>
                <div className="font-display mt-2 text-3xl sm:text-4xl tabular-nums text-black">
                  {counts[stat.key] ?? '—'}
                </div>
              </>
            )

            return stat.href ? (
              <Link
                key={stat.key}
                href={stat.href}
                className="min-w-0 rounded-2xl border border-black/10 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#01aa3f]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/60"
              >
                {body}
              </Link>
            ) : (
              <div
                key={stat.key}
                className={`min-w-0 rounded-2xl border p-5 ${stat.soon ? 'border-dashed border-black/15 bg-black/[0.02]' : 'border-black/10 bg-white'}`}
              >
                {body}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
