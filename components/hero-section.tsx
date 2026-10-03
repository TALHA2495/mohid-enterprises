import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { HeroCategoryMarquee } from '@/components/hero-category-marquee'
import { loadHeroCategories } from '@/lib/public-data.server'

export async function HeroSection() {
  const categories = await loadHeroCategories()

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate flex min-h-[calc(100svh-5.25rem)] items-start overflow-hidden bg-[#f7f8f5] text-[#101412] md:min-h-[calc(100svh-4.375rem)] md:items-end"
    >
      <div className="relative mx-auto w-full max-w-[1600px] px-5 pt-6 pb-8 sm:px-8 sm:pb-10 md:px-12 md:pt-5 md:pb-12 lg:px-20 lg:pb-14 xl:px-24">

        <div className="homepage-motion-hero max-w-5xl md:max-w-[760px] lg:max-w-[820px]">
          <p className="mb-3 flex items-center gap-3 text-base font-semibold uppercase tracking-[0.2em] text-[#101412] sm:text-lg">
            <span aria-hidden="true" className="h-px w-8 bg-[#01aa3f]" />
            Mohid Enterprises
          </p>
          <p className="mb-4"><span className="inline-flex items-center rounded-full bg-[#01aa3f] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-[0_6px_18px_rgba(1,170,63,0.22)] sm:text-base">Manufacturer, Importer, Exporter</span></p>
          <h1 id="home-hero-title" className="font-sans">
            <span className="block text-[clamp(4.25rem,17vw,6.5rem)] font-[850] leading-[0.74] tracking-[-0.085em] sm:text-[clamp(5.5rem,15vw,7.5rem)] md:text-[clamp(4.75rem,10vw,7rem)]">
               <span className='text-[#0a7d31]'>20+</span>
              <span className="ml-[0.16em] text-[0.5em] font-extrabold tracking-[-0.055em]">YEARS</span>
            </span>
            <span className="mt-3 block max-w-[720px] text-[clamp(0.78rem,2.3vw,1.15rem)] font-bold uppercase leading-[1.2] tracking-[0.14em] sm:mt-4 md:text-xl">
              Of manufacturing experience
            </span>
          </h1>
          <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-[#46534c] sm:mt-6 sm:text-base md:max-w-md md:text-lg">
            Textile trims manufactured in Faisalabad, Pakistan for local and international buyers.
          </p>
          <HeroCategoryMarquee categories={categories} />
          <div className="mt-5 flex flex-nowrap items-stretch gap-2 sm:gap-3 md:mt-7 lg:gap-4 xl:gap-5">
            <Link
              href="/showroom"
              className="inline-flex min-w-0 flex-1 basis-0 whitespace-nowrap rounded-3xl min-h-12 items-center justify-center gap-1.5 border border-[#101412]/30 bg-transparent px-3 py-3 text-[13px] font-semibold text-[#101412] transition-colors hover:border-[#101412]/55 hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5] active:bg-[#dce5df] sm:gap-2 sm:px-5 sm:text-sm md:basis-auto md:flex-none md:min-w-48 md:px-6"
            >
              Explore Products <ArrowUpRight aria-hidden="true" className="size-4 max-[379px]:hidden" />
            </Link>
            <Link
              href="/quote"
              className="inline-flex min-w-0 flex-1 basis-0 whitespace-nowrap rounded-3xl min-h-12 items-center justify-center gap-1.5 bg-[#01aa3f] px-3 py-3 text-[13px] font-bold text-[#07120b] shadow-[0_6px_18px_rgba(1,170,63,0.18)] transition-colors hover:bg-[#00be48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5] active:bg-[#009637] sm:gap-2 sm:px-5 sm:text-sm md:basis-auto md:flex-none md:min-w-48 md:px-6"
            >
              Request a Quote <ArrowUpRight aria-hidden="true" className="size-4 max-[379px]:hidden" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
