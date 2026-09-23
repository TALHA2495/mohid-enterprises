'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import ProductDetail from './showroom-detail'
import { FILTER_TYPES, SHOWROOM_FILTERS } from '@/lib/showroom'
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
}

export function ShowroomSection({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null)
  const [filter, setFilter] = useState('All trims')
  const [loadedCount, setLoadedCount] = useState(8)

  // Deep-linkable detail + filter: /showroom?product=<name>&filter=<filter>.
  // Browser back/forward syncs grid <-> detail and filter state.
  useEffect(() => {
    const syncFromUrl = () => {
      const search = new URLSearchParams(window.location.search)
      const name = search.get('product')
      setSelected(name ? products.find((p) => p.name === name) ?? null : null)
      const filterName = search.get('filter')
      if (filterName && SHOWROOM_FILTERS.includes(filterName)) {
        setFilter(filterName)
        setLoadedCount(8)
      } else if (filterName) {
        setFilter('All trims')
      }
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [products])

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
    <section id="showroom" className="relative z-10 flex h-[calc(100vh-5.3125rem)] flex-col px-4 pt-8 text-black sm:px-6 md:h-[calc(100vh-5.0625rem)] lg:px-10">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <div className="mb-8 flex shrink-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="Product filters">
          {SHOWROOM_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleFilterChange(item)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-xs transition ${
                filter === item
                  ? 'border-[#01aa3f] bg-[#01aa3f] text-black'
                  : 'border-white/40 bg-black/[0.04] text-white drop-shadow-sm active:scale-[0.95]'
              }`}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>

        <div aria-label="Product grid" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayed.map((product, index) => (
            <button
              key={product.name}
              type="button"
              onClick={() => handleSelect(product)}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white text-left transition hover:-translate-y-1 hover:border-[#00c853]/50 hover:bg-[#f0f5f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]"
            >
              <div className="relative h-56 overflow-hidden bg-black/5">
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
                <h2 className="text-[13px] font-semibold leading-snug tracking-tight text-black">{product.name}</h2>
              </div>
            </button>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="rounded-full border border-[#00c853] bg-black/[0.04] px-8 py-3 text-sm font-medium text-black drop-shadow-sm transition hover:border-[#00c853]/50 hover:text-black"
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
