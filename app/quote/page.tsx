import { SiteHeader } from '@/components/site-header'
import { QuoteForm } from '@/components/quote-form'

export default function QuotePage() {
  return <main className="relative min-h-screen bg-[#0a0c0b] text-white"><div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]"><img src="/images/trims2.webp" alt="" className="size-full object-cover" /><div className="absolute inset-0 bg-black/40" /><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#0a0c0b]" /></div><section className="relative z-10 mx-auto max-w-2xl px-5 py-10 sm:py-16"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Export inquiries</p><h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight">Request specifications & quote</h1><p className="mt-3 text-sm leading-6 text-white/60">Share a few details and our team will follow up with the right production information.</p><div className="mt-8 rounded-2xl border border-white/10 bg-[#101413] p-5 sm:p-7"><QuoteForm /></div></section></main>
}
