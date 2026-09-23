import type { Metadata } from 'next'

import { supabaseAdmin } from '@/lib/supabase-admin.server'
import QuotesAdminClient, { type AdminQuote } from '@/components/admin/quotes-admin-client'

export const metadata: Metadata = {
  title: 'Quotes | Mohid Enterprises Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminQuotesPage() {
  if (!supabaseAdmin) {
    return (
      <div>
        <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm font-normal">
          Supabase is not configured on the server — see <code className="font-mono">supabase/README.md</code>.
        </p>
      </div>
    )
  }

  const { data, error } = await supabaseAdmin
    .from('quotes')
    .select(
      `id, quote_number, quote_status, quote_status_updated_at, total_amount, currency,
       tax_amount, valid_until, created_at, accepted_at, rejected_at, rejection_reason,
       customer_notes, internal_notes, rfq_details,
       customers ( name, email, phone, company_name ),
       quote_line_items ( id, product_name, material, width_mm, quantity_requested, unit_price, line_total )`,
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[AdminQuotesPage] fetch failed:', error)
    return (
      <div>
        <p role="alert" className="rounded-2xl border border-[#c62828]/30 bg-[#c62828]/[0.04] p-6 text-sm font-normal text-[#c62828]">
          Failed to load quotes: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div>
        <p className="section-label mb-4">Quotes</p>
        <h1 className="font-display mb-2 text-4xl leading-tight">Quote management</h1>
        <p className="mb-8 text-sm font-normal text-black/60">Track and manage every incoming RFQ.</p>
        <QuotesAdminClient initialQuotes={(data as unknown as AdminQuote[]) ?? []} />
      </div>
  )
}
