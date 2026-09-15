import Link from 'next/link'
import { Suspense } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { QuoteForm } from '@/components/quote-form'

export default function QuotePage() {
  return (
    <main id="main" className="relative flex min-h-screen flex-col bg-[#f4f7f8] text-black">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]">
        <Image src="/images/trims2.webp" alt="" fill priority fetchPriority="high" quality={70} sizes="100vw" className="size-full object-cover" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-4 sm:px-6">
        <Link href="/" aria-label="Mohid Enterprises home" className="flex items-center gap-2.5">
          <Image src="/images/LOGO%20MOHID.webp" alt="Mohid Enterprises logo" width={1600} height={1491} className="h-11 w-auto object-contain md:h-[30px]" priority />
          <span className="flex flex-col leading-[1.15]">
            <span className="text-[13px] font-semibold tracking-[0.08em] text-white drop-shadow-sm">MOHID</span>
            <span className="text-[10px] font-medium tracking-[0.14em] text-white opacity-90 drop-shadow-sm">ENTERPRISES</span>
          </span>
        </Link>
        <Link href="/" aria-label="Close" className="inline-flex size-11 items-center justify-center rounded-full border border-white/40 bg-black/[0.04] text-white drop-shadow-sm backdrop-blur-sm transition-colors hover:bg-white/10">
          <X className="size-5" />
        </Link>
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pb-8 pt-4 sm:px-6">
        {/* Visible header removed by design; sr-only h1 keeps the page semantic for screen readers/SEO. */}
        <h1 className="sr-only">Request specifications &amp; quote</h1>
        <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
          <Suspense fallback={<div className="min-h-[420px] animate-pulse rounded-xl bg-black/[0.03]" />}>
            <QuoteForm />
          </Suspense>
        </div>
      </section>
    </main>
  )
}