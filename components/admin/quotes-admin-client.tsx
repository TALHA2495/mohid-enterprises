'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

import { updateQuoteStatus } from '@/app/admin/actions'
import type { QuoteStatus } from '@/lib/supabase'

export type AdminQuote = {
  id: string
  quote_number: string
  quote_status: QuoteStatus
  quote_status_updated_at: string | null
  total_amount: number | null
  currency: string
  tax_amount: number | null
  valid_until: string | null
  created_at: string
  accepted_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  customer_notes: string | null
  internal_notes: string | null
  rfq_details: Record<string, unknown> | null
  customers: { name: string; email: string; phone: string | null; company_name: string | null } | null
  quote_line_items: {
    id: string
    product_name: string
    material: string | null
    width_mm: number | null
    quantity_requested: number
    unit_price: number | null
    line_total: number | null
  }[]
}

const STATUSES: QuoteStatus[] = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired']

const STATUS_STYLES: Record<QuoteStatus, string> = {
  draft: 'bg-black/[0.06] text-black/70',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-cyan-100 text-cyan-800',
  accepted: 'bg-[#00c853]/15 text-[#0b7a34]',
  rejected: 'bg-[#c62828]/10 text-[#c62828]',
  expired: 'bg-orange-100 text-orange-800',
}

// Fixed UTC timezone keeps server-rendered and client-rendered dates identical
// (hydration-safe); money uses Intl formatting with tabular numerals.
const money = (value: number | null) =>
  value === null
    ? '—'
    : new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)

const day = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('en-PK', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(iso)) : '—'

export default function QuotesAdminClient({ initialQuotes }: { initialQuotes: AdminQuote[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const filterParam = searchParams.get('status')
  const filter: QuoteStatus | 'all' = STATUSES.includes(filterParam as QuoteStatus) ? (filterParam as QuoteStatus) : 'all'

  const setFilter = (next: QuoteStatus | 'all') => {
    setActionError('')
    router.replace(next === 'all' ? '/admin/quotes' : `/admin/quotes?status=${next}`, { scroll: false })
  }

  const quotes = filter === 'all' ? initialQuotes : initialQuotes.filter((q) => q.quote_status === filter)
  const countFor = (status: QuoteStatus) => initialQuotes.filter((q) => q.quote_status === status).length

  const changeStatus = (quoteId: string, newStatus: QuoteStatus) => {
    setActionError('')
    startTransition(async () => {
      const result = await updateQuoteStatus(quoteId, newStatus)
      if (!result.ok) setActionError(result.error ?? 'Status update failed.')
    })
  }

  const chipBase =
    'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50'

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter quotes by status">
        {(['all', ...STATUSES] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status as QuoteStatus | 'all')}
            aria-pressed={filter === status}
            className={`${chipBase} ${
              filter === status
                ? 'bg-[#01aa3f] text-white'
                : 'border border-black/10 bg-white text-black hover:bg-black/[0.03]'
            }`}
          >
            {status}
            {status !== 'all' && ` (${countFor(status as QuoteStatus)})`}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {actionError && (
          <p role="alert" className="rounded-lg border border-[#c62828]/30 bg-[#c62828]/[0.04] p-3 text-xs font-normal text-[#c62828]">
            {actionError}
          </p>
        )}
        {isPending && <p className="text-xs font-normal text-black/50">Updating…</p>}
      </div>

      {/* relative + min-w-0 + data-scroll-x: relative contains the absolutely
          positioned .sr-only spans in the table (otherwise they escape the clip
          and scroll the whole page); min-w-0 releases the grid item's automatic
          minimum; data-scroll-x keeps the scrollbar visible below 768px. */}
      <div data-scroll-x className="relative min-w-0 overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-black/[0.02]">
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-black">Quote</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-black">Customer</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-black">Product</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-black">Total</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-black">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-black">Received</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-black">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm font-normal text-black/50">
                  No quotes {filter === 'all' ? 'yet' : `with status “${filter}”`}.
                </td>
              </tr>
            )}
            {quotes.map((quote) => {
              const customer = quote.customers
              const firstItem = quote.quote_line_items?.[0]
              const extraItems = (quote.quote_line_items?.length ?? 0) - 1
              return (
                <tr key={quote.id} className="border-b border-black/10 last:border-b-0 hover:bg-black/[0.015]">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-black/80">{quote.id}</div>
                    <div className="text-[11px] text-black/50">{quote.quote_number}</div>
                  </td>
                  <td className="max-w-[180px] px-4 py-3">
                    <div className="truncate text-sm font-medium text-black">{customer?.name ?? '—'}</div>
                    <div className="truncate text-xs text-black/55">{customer?.email ?? ''}</div>
                  </td>
                  <td className="max-w-[160px] px-4 py-3">
                    <div className="truncate text-sm text-black/85">{firstItem?.product_name ?? '—'}</div>
                    {extraItems > 0 && (
                      <div className="text-[11px] text-black/50">+{extraItems} more item{extraItems > 1 ? 's' : ''}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-sm font-medium text-black">{money(quote.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[quote.quote_status]}`}>
                      {quote.quote_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums text-black/65">{day(quote.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      aria-expanded={expandedId === quote.id}
                      aria-controls={`quote-detail-${quote.id}`}
                      onClick={() => setExpandedId(expandedId === quote.id ? null : quote.id)}
                      className="rounded px-2 py-1 text-sm font-medium text-[#01aa3f] transition-colors hover:bg-[#00c853]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
                    >
                      {expandedId === quote.id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {expandedId &&
        quotes
          .filter((quote) => quote.id === expandedId)
          .map((quote) => {
            const customer = quote.customers
            const rfq = (quote.rfq_details ?? {}) as {
              inquiry?: string
              notes?: string | null
              destination_port?: string
              product_context?: Record<string, string>
            }
            return (
              <section
                key={quote.id}
                id={`quote-detail-${quote.id}`}
                aria-label={`Quote details for ${quote.id}`}
                className="rounded-2xl border border-black/10 bg-white p-6"
              >
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#01aa3f]">Customer</h2>
                    <dl className="grid gap-1.5 text-sm font-normal">
                      <div className="flex gap-2"><dt className="text-black/55">Name</dt><dd className="min-w-0 truncate text-black">{customer?.name ?? '—'}</dd></div>
                      <div className="flex gap-2"><dt className="text-black/55">Email</dt><dd className="min-w-0 truncate text-black">{customer?.email ?? '—'}</dd></div>
                      <div className="flex gap-2"><dt className="text-black/55">Phone</dt><dd className="min-w-0 truncate text-black">{customer?.phone ?? '—'}</dd></div>
                      <div className="flex gap-2"><dt className="text-black/55">Company</dt><dd className="min-w-0 truncate text-black">{customer?.company_name ?? '—'}</dd></div>
                      <div className="flex gap-2"><dt className="text-black/55">Port</dt><dd className="min-w-0 truncate text-black">{rfq.destination_port ?? '—'}</dd></div>
                    </dl>
                  </div>

                  <div>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#01aa3f]">Pricing</h2>
                    <dl className="grid gap-1.5 text-sm font-normal tabular-nums">
                      <div className="flex gap-2"><dt className="text-black/55">Total</dt><dd className="text-black">{money(quote.total_amount)}</dd></div>
                      <div className="flex gap-2"><dt className="text-black/55">Tax</dt><dd className="text-black">{money(quote.tax_amount)}</dd></div>
                      <div className="flex gap-2"><dt className="text-black/55">Valid until</dt><dd className="text-black">{day(quote.valid_until)}</dd></div>
                    </dl>
                  </div>

                  <div>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#01aa3f]">Request</h2>
                    <p className="max-h-32 overflow-y-auto text-sm font-normal text-black/80">{rfq.inquiry ?? '—'}</p>
                    {rfq.notes && <p className="mt-2 text-xs font-normal text-black/55">Notes: {rfq.notes}</p>}
                  </div>
                </div>

                {quote.quote_line_items?.length > 0 && (
                  <div className="mt-6 border-t border-black/10 pt-4">
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#01aa3f]">Line items</h2>
                    <ul className="grid gap-2">
                      {quote.quote_line_items.map((item) => (
                        <li key={item.id} className="rounded-lg bg-black/[0.02] p-2.5 text-sm font-normal text-black/85">
                          {item.product_name} • {item.quantity_requested} m
                          {item.width_mm ? ` • ${item.width_mm} mm` : ''}
                          {item.material ? ` • ${item.material}` : ''}
                          <span className="tabular-nums"> • {money(item.line_total)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 border-t border-black/10 pt-4">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#01aa3f]">Set status</h2>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={isPending || quote.quote_status === status}
                        onClick={() => changeStatus(quote.id, status)}
                        aria-pressed={quote.quote_status === status}
                        className={`${chipBase} ${
                          quote.quote_status === status
                            ? 'bg-[#01aa3f] text-white'
                            : 'border border-black/10 bg-white text-black hover:bg-black/[0.03]'
                        } disabled:opacity-40`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-6 border-t border-black/10 pt-4 text-[11px] font-normal text-black/45">
                  {quote.quote_number} • received {day(quote.created_at)} (UTC)
                  {quote.accepted_at && ` • accepted ${day(quote.accepted_at)}`}
                  {quote.rejected_at && ` • rejected ${day(quote.rejected_at)}${quote.rejection_reason ? `: ${quote.rejection_reason}` : ''}`}
                </p>
              </section>
            )
          })}
    </div>
  )
}
