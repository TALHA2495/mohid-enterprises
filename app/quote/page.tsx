import { SiteHeader } from '@/components/site-header'
import { QuoteForm } from '@/components/quote-form'

export default function QuotePage() {
  return <main className="light-shell min-h-screen bg-[#f4f7f8] text-[#17201e]"><div className="border-b border-[#d8e1e0] bg-white"><SiteHeader /></div><section className="mx-auto max-w-2xl px-5 py-10 sm:py-16"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-emerald-700">Export inquiries</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Request specifications & quote</h1><p className="mt-3 text-sm leading-6 text-[#61706d]">Share a few details and our team will follow up with the right production information.</p><div className="mt-8 rounded-2xl border border-[#d4dfdf] bg-white p-5 sm:p-7"><QuoteForm /></div></section></main>
}
