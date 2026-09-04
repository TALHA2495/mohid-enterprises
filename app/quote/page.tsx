import { SiteHeader } from '@/components/site-header'
import { QuoteForm } from '@/components/quote-form'

export default function QuotePage() {
  return <main className="min-h-screen bg-[#0a0c0b] text-white"><SiteHeader /><section className="mx-auto max-w-2xl px-5 py-10 sm:py-16"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Export inquiries</p><h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight">Request specifications & quote</h1><p className="mt-3 text-sm leading-6 text-white/60">Share a few details and our team will follow up with the right production information.</p><div className="mt-8 rounded-2xl border border-white/10 bg-[#101413] p-5 sm:p-7"><QuoteForm /></div></section></main>
}
