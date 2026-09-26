import Image from 'next/image'
import Link from 'next/link'

import { loadHeroCategories } from '@/lib/public-data.server'

const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'

export async function HomeCategoryDirectory() {
  const categories = await loadHeroCategories()

  return (
    <section aria-labelledby="category-directory-title" className="bg-[#f4f7f8] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#00a83c]">Product range</p>
            <h2 id="category-directory-title" className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">Explore textile trims</h2>
          </div>
          <Link href="/showroom" className="hidden text-sm font-medium text-black/65 transition-colors hover:text-[#01aa3f] sm:inline-flex">View all products</Link>
        </div>

        <div aria-label="Product categories" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/showroom?filter=${encodeURIComponent(category.filter)}`}
              aria-label={`View ${category.label} products`}
              className="group relative block h-52 touch-manipulation overflow-hidden rounded-2xl border border-black/10 bg-black/5 transition-[border-color,transform] hover:-translate-y-1 hover:border-[#00c853] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] active:scale-[0.98] sm:h-60"
            >
              <Image
                src={category.image}
                alt=""
                fill
                quality={70}
                sizes={CARD_SIZES}
                className="size-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 title={category.label} className="line-clamp-2 break-words text-balance text-base font-semibold leading-snug text-white drop-shadow">
                  {category.label}
                </h3>
                <p title={category.desc} className="mt-1 line-clamp-2 break-words text-[12px] leading-snug text-white/85 drop-shadow">
                  {category.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
