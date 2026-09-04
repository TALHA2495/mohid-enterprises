import { X } from 'lucide-react'
import { QuoteForm } from '@/components/quote-form'

export default function QuotePage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-[#0a0c0b] text-white">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]">
        <img src="/images/trims2.webp" alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#0a0c0b]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-4 sm:px-6">
        <a href="/" aria-label="Mohid Enterprises home" className="flex items-center gap-2.5">
          <img src="/images/LOGO%20MOHID.webp" alt="Mohid Enterprises logo" className="h-11 w-auto object-contain md:h-[30px]" />
          <span className="flex flex-col leading-[1.15]">
            <span className="text-[13px] font-semibold tracking-[0.08em]">MOHID</span>
            <span className="text-[10px] font-medium tracking-[0.14em] text-current opacity-60">ENTERPRISES</span>
          </span>
        </a>
        <a href="/" aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-sm transition-colors hover:bg-white/10">
          <X className="size-5" />
        </a>
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pb-8 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Export inquiries</p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight sm:text-4xl">Request specifications & quote</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">Share a few details and our team will follow up with the right production information.</p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#101413] p-5 sm:p-6">
          <QuoteForm />
        </div>
      </section>
    </main>
  )
}