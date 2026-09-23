import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { HERO_CATEGORIES } from '@/lib/showroom'
// loadHeroCategories lives in the server-only module — lib/showroom.ts is
// client-safe and must never re-import the service-role client.
import { loadHeroCategories } from '@/lib/public-data.server'

const CARD_SIZES = '50vw'

function HeroCategoryGrid({ categories }: { categories: readonly { id: string; label: string; desc: string; filter: string; image: string }[] }) {
  return (
    <div
      aria-label="Product categories"
      className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6"
    >
                  {categories.map((category, index) => (
        <Link
          key={category.id}
          href={`/showroom?filter=${encodeURIComponent(category.filter)}`}
          aria-label={`View ${category.label} products`}
          className="group relative block h-64 touch-manipulation overflow-hidden rounded-2xl border border-black/10 bg-black/5 transition-[border-color,transform] hover:-translate-y-1 hover:border-[#00c853] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] active:scale-[0.98] sm:h-72 lg:h-80"
        >
          <Image
            src={category.image}
            alt=""
            fill
            priority={index < 2}
            quality={75}
            sizes={CARD_SIZES}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
          {/* Dark scrim keeps the white caption readable on any photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">

            <h2 className="mt-0.5 text-balance text-lg font-semibold leading-snug text-white drop-shadow">
              {category.label}
            </h2>
            <p className="hidden sm:block mt-1 line-clamp-2 text-[13px] leading-snug text-white/85 drop-shadow">
              {category.desc}
            </p>
            <div className="hidden sm:flex mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors group-hover:text-[#00c853]">
              Explore category
              <span aria-hidden="true">&rarr;</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export async function HeroSection() {
  const categories = await loadHeroCategories()
  return (
    <section className="relative z-10 flex min-h-[calc(90vh-5.25rem)] flex-col justify-center py-10 sm:py-12 md:min-h-[calc(90vh-4.375rem)]">
      {/* Invisible page heading - the visible hero is cards + CTAs only. */}
      <h1 className="sr-only">Mohid Enterprises — garment trims manufacturer, Faisalabad, Pakistan</h1>

            <HeroCategoryGrid categories={categories} />

      <div className="mx-auto hidden w-full max-w-7xl flex-wrap items-center justify-center gap-2 px-4 pt-10 sm:gap-4 sm:px-6 sm:pt-12">
        <Link
          href="/showroom"
          className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/60 px-4 py-3 text-[13px] text-white drop-shadow-md transition-colors hover:border-white/80 hover:bg-white/10 active:scale-[0.98] sm:flex-initial sm:gap-2 sm:px-7 sm:py-3.5 sm:text-sm"
        >
          Showroom
          <ArrowUpRight className="size-3.5 sm:size-4" />
        </Link>
        <Link
          href="/quote"
          className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#01aa3f] px-4 py-3 text-[13px] font-medium text-black transition-all hover:-translate-y-px hover:bg-[#00ff59] hover:text-black active:scale-[0.98] sm:flex-initial sm:gap-2 sm:px-7 sm:py-3.5 sm:text-sm"
        >
          Start an RFQ
          <ArrowUpRight className="size-3.5 sm:size-4" />
        </Link>
      </div>
    </section>
  )
}
