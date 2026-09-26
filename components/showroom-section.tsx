'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import ProductDetail from './showroom-detail'
import { FILTER_TYPES, SHOWROOM_FILTERS } from '@/lib/showroom'
import { SURFACE_WHITE } from '@/lib/design-tokens'
import type { ProductType } from '@/lib/showroom'

export type Product = {
  name: string
  type: ProductType
  description: string
  material: string
  width: string
  colors: string
  finish: string
  image: string
  /** Raw CDN URLs for every uploaded image. Detail page thumbnails use these. */
  images: string[]
  specs: [string, string][]
  moq?: number
  pricingTiers?: { quantity: number; pricePerMeter: number }[]
  leadTime?: string
  weight?: string
  compliance?: { oekotex?: boolean; certificates?: string[] }
}

export function ShowroomSection({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null)
  const [filter, setFilter] = useState('All trims')
  const [loadedCount, setLoadedCount] = useState(8)
  const activeFilterRef = useRef<HTMLButtonElement | null>(null)
  const filterRowRef = useRef<HTMLDivElement | null>(null)

  // Deep-linkable detail + filter: /showroom?product=<name>&filter=<filter>.
  // Browser back/forward syncs grid <-> detail and filter state.
  useEffect(() => {
    const syncFromUrl = () => {
      const search = new URLSearchParams(window.location.search)
      const name = search.get('product')
      setSelected(name ? products.find((p) => p.name === name) ?? null : null)
      const filterName = search.get('filter')?.trim()
      if (filterName) {
        // Case-insensitive match so ?filter=shoelaces / %20Shoelaces resolve to
        // the same pill. Unknown values degrade safely to "All trims".
        const matched = SHOWROOM_FILTERS.find(
          (f) => f.toLowerCase() === filterName.toLowerCase(),
        )
        if (!matched && process.env.NODE_ENV !== 'production') {
          console.warn(
            `[showroom] unknown filter "${filterName}" - falling back to "All trims".`,
          )
        }
        setFilter(matched ?? 'All trims')
        setLoadedCount(8)
      }
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [products])

  // The filter row is horizontally scrollable and holds 12+ pills, so a deep
  // link like /showroom?filter=Shoelaces activates a pill that is off-screen.
  // Centre it. Scrolling the row itself (not scrollIntoView) guarantees the
  // PAGE never scrolls down to the grid.
  useEffect(() => {
    const row = filterRowRef.current
    const active = activeFilterRef.current
    if (!row || !active) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const left = active.offsetLeft - row.clientWidth / 2 + active.clientWidth / 2
    row.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' })
  }, [filter])

  const handleSelect = (product: Product) => {
    setSelected(product)
    const params = new URLSearchParams(window.location.search)
    params.set('product', product.name)
    window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`)
  }

  const handleBack = () => {
    setSelected(null)
    const params = new URLSearchParams(window.location.search)
    params.delete('product')
    const query = params.toString()
    window.history.pushState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname)
  }

  const visible = products.filter((product) => filter === 'All trims' || (FILTER_TYPES[filter]?.includes(product.type) ?? false))
  const displayed = visible.slice(0, loadedCount)
  const hasMore = loadedCount < visible.length

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    setLoadedCount(8)
    const params = new URLSearchParams(window.location.search)
    if (newFilter === 'All trims') params.delete('filter')
    else params.set('filter', newFilter)
    const query = params.toString()
    window.history.pushState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname)
  }

  const handleLoadMore = () => {
    setLoadedCount((prev) => prev + 8)
  }

  if (selected) return <ProductDetail key={selected.name} product={selected} onBack={handleBack} />

  return (
    <section id="showroom" className="relative z-10 flex h-[calc(100vh-5.3125rem)] flex-col px-4 pt-8 text-[#101412] sm:px-6 md:h-[calc(100vh-5.0625rem)] lg:px-10">
      {/* The grid has no visible heading by design (cards are the content), but
          the page still needs exactly one h1 for SEO/screen readers — same
          sr-only pattern as the home hero and /quote. Product cards keep h2. */}
      <h1 className="sr-only">Showroom — Woven &amp; Woven Label Trims Catalog</h1>
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <div ref={filterRowRef} className="mb-3 flex shrink-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="Product filters">
          {SHOWROOM_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleFilterChange(item)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-xs transition ${
                filter === item
                  ? 'border-[#01aa3f] bg-[#01aa3f] text-[#07120b]'
                  : 'border-[#101412]/20 bg-transparent text-[#101412] hover:border-[#101412]/35 hover:bg-[#e8eeea] active:bg-[#dce5df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5]'
              }`}
              ref={filter === item ? activeFilterRef : undefined}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>

        <p aria-live="polite" className="mb-4 shrink-0 text-xs text-[#46534c]">
          Showing {visible.length} {filter === 'All trims' ? 'products' : filter}
        </p>
        <div aria-label="Product grid" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayed.map((product, index) => (
            <Link
              key={product.name}
              href={`/showroom/${encodeURIComponent(product.name)}`}
              className="block"
            >
              <button
                type="button"
                className={`w-full group overflow-hidden rounded-xl border border-[#101412]/12 ${SURFACE_WHITE} text-left transition hover:-translate-y-1 hover:border-[#0a7d31]/50 hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412]`}
              >
                <div className="relative h-56 overflow-hidden bg-[#e8eeea]">
                  <Image
                      src={product.image}
                      alt={`${product.name} textile trim`}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      quality={70}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </div>
                <div className="flex items-center justify-center p-3.5 text-center">
                  <h2 className="text-[15px] font-semibold leading-snug tracking-tight text-[#101412]">{product.name}</h2>
                </div>
              </button>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="rounded-full border border-[#101412]/20 bg-transparent px-8 py-3 text-sm font-medium text-[#101412] transition hover:border-[#0a7d31]/50 hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412]"
            >
              Load more
            </button>
          </div>
        )}
        </div>
      </div>
    </section>
  )
}
