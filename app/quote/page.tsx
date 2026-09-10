import { Suspense } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { QuoteForm } from '@/components/quote-form'

export default function QuotePage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-[#f4f7f8] text-black">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]">
        <Image src="/images/trims2.webp" alt="" fill priority fetchPriority="high" quality={70} sizes="100vw" className="size-full object-cover" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-4 sm:px-6">
        <a href="/" aria-label="Mohid Enterprises home" className="flex items-center gap-2.5">
          <Image src="/images/LOGO%20MOHID.webp" alt="Mohid Enterprises logo" width={1600} height={1491} className="h-11 w-auto object-contain md:h-[30px]" priority />
          <span className="flex flex-col leading-[1.15]">
            <span className="text-[13px] font-semibold tracking-[0.08em] text-white drop-shadow-sm">MOHID</span>
            <span className="text-[10px] font-medium tracking-[0.14em] text-white opacity-90 drop-shadow-sm">ENTERPRISES</span>
          </span>
        </a>
        <a href="/" aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-black/[0.04] text-white drop-shadow-sm backdrop-blur-sm transition-colors hover:bg-white/10">
          <X className="size-5" />
        </a>
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pb-8 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853] drop-shadow-sm">Export inquiries</p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-white drop-shadow-md sm:text-4xl">Request specifications & quote</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 drop-shadow-sm">Share a few details and our team will follow up with the right production information.</p>
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
          <Suspense fallback={<div className="min-h-[420px] animate-pulse rounded-xl bg-black/[0.03]" />}>
            <QuoteForm />
          </Suspense>
        </div>
      </section>
    </main>
  )
}