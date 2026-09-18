'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Pencil, Search } from 'lucide-react'

import { setProductActive } from '@/app/admin/actions'
import { productImageUrl } from '@/lib/imagekit'
import type { ProductImage } from '@/lib/supabase'

// ============================================================================
// PRODUCTS LIST — search, category filter, status filter, pagination
// ----------------------------------------------------------------------------
// Filters live in the URL (?q=&category=&status=&page=) so a filtered view can
// be linked, bookmarked and reloaded — and the back button behaves as expected.
// The catalog is small enough (a few dozen trims) that filtering and paging
// happen in the browser over the full list fetched by the server page.
// ============================================================================

export type AdminProductRow = {
  id: string
  name: string
  category: string
  category_id: string | null
  price_per_unit: number | null
  moq_units: number | null
  stock_available: number
  is_active: boolean
  updated_at: string
  images: ProductImage[] | null
}

type Props = {
  products: AdminProductRow[]
  categories: { id: string; name: string; is_active: boolean }[]
}

const PAGE_SIZE = 12

const money = (value: number | null) =>
  value === null
    ? 'On request'
    : new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)

const day = (iso: string) =>
  new Intl.DateTimeFormat('en-PK', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(iso),
  )

export default function ProductsAdminClient({ products, categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState('')

  const query = searchParams.get('q') ?? ''
  const categoryParam = searchParams.get('category') ?? 'all'
  const status = searchParams.get('status') ?? 'all'
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)

  /** Update one filter in the URL, resetting pagination unless told otherwise. */
  const setParam = (key: string, value: string, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === 'all') params.delete(key)
    else params.set(key, value)
    if (resetPage) params.delete('page')
    const queryString = params.toString()
    router.replace(queryString ? `/admin/products?${queryString}` : '/admin/products', { scroll: false })
  }

  const needle = query.trim().toLowerCase()
  const filtered = products.filter((product) => {
    if (needle && !`${product.name} ${product.category}`.toLowerCase().includes(needle)) return false
    if (categoryParam !== 'all' && product.category_id !== categoryParam) return false
    if (status === 'active' && !product.is_active) return false
    if (status === 'inactive' && product.is_active) return false
    return true
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const countForCategory = (id: string) => products.filter((product) => product.category_id === id).length

  const toggleActive = (id: string, next: boolean) => {
    setActionError('')
    startTransition(async () => {
      const result = await setProductActive(id, next)
      if (!result.ok) setActionError(result.error ?? 'The status could not be changed.')
    })
  }

  const chipBase =
    'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50'

  const chip = (isActive: boolean) =>
    `${chipBase} ${isActive ? 'bg-[#01aa3f] text-white' : 'border border-black/10 bg-white text-black hover:bg-black/[0.03]'}`

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
          <input
            type="search"
            value={query}
            onChange={(event) => setParam('q', event.target.value)}
            placeholder="Search products by name or category…"
            aria-label="Search products"
            className="w-full rounded-lg border border-black/10 bg-white py-2 pl-9 pr-3 text-sm text-black placeholder:text-black/45 focus:border-[#00c853] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/30"
          />
        </div>

        <div role="group" aria-label="Filter by status" className="flex gap-2">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
            ] as const
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setParam('status', option.key)}
              aria-pressed={status === option.key}
              className={chip(status === option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => setParam('category', 'all')}
          aria-pressed={categoryParam === 'all'}
          className={chip(categoryParam === 'all')}
        >
          All categories ({products.length})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setParam('category', category.id)}
            aria-pressed={categoryParam === category.id}
            className={chip(categoryParam === category.id)}
          >
            {category.name} ({countForCategory(category.id)})
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {actionError && (
          <p
            role="alert"
            className="rounded-lg border border-[#c62828]/30 bg-[#c62828]/[0.04] p-3 text-xs font-normal text-[#c62828]"
          >
            {actionError}
          </p>
        )}
        {isPending && <p className="text-xs font-normal text-black/50">Updating…</p>}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
          <p className="text-sm font-medium text-black">
            {products.length === 0 ? 'No products yet' : 'No products match these filters'}
          </p>
          <p className="mt-1 text-sm font-normal text-black/60">
            {products.length === 0
              ? 'Add the first product to start building the catalog.'
              : 'Try a different search term, category or status.'}
          </p>
          {products.length === 0 && (
            <Link
              href="/admin/products/new"
              className="mt-4 inline-block rounded-full bg-[#01aa3f] px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-[#00ff59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]"
            >
              Add a product
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02] text-left">
                  <th scope="col" className="px-3 py-2 font-medium text-black/60">
                    <span className="sr-only">Image</span>
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium text-black/60">Product</th>
                  <th scope="col" className="px-3 py-2 font-medium text-black/60">Category</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium text-black/60">Price</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium text-black/60">MOQ</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium text-black/60">Stock</th>
                  <th scope="col" className="px-3 py-2 font-medium text-black/60">Status</th>
                  <th scope="col" className="px-3 py-2 font-medium text-black/60">Updated</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium text-black/60">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => {
                  const cover = product.images?.[0]
                  return (
                    <tr key={product.id} className="border-b border-black/[0.07] last:border-0">
                      <td className="px-3 py-2">
                        <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-black/10 bg-black/5">
                          {cover ? (
                            <Image
                              src={productImageUrl(cover.url, 200)}
                              alt=""
                              fill
                              sizes="44px"
                              quality={70}
                              className="object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="grid h-full w-full place-items-center text-[10px] text-black/35"
                            >
                              none
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium text-black underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-black/70">{product.category}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-black">{money(product.price_per_unit)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-black/70">{product.moq_units ?? '—'}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-black/70">{product.stock_available}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(product.id, !product.is_active)}
                          aria-pressed={product.is_active}
                          aria-label={`${product.is_active ? 'Deactivate' : 'Activate'} ${product.name}`}
                          className={`${chipBase} ${
                            product.is_active ? 'bg-[#00c853]/15 text-[#0b7a34]' : 'bg-black/[0.06] text-black/70'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-black/60">{day(product.updated_at)}</td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/admin/products/${product.id}`}
                          aria-label={`Edit ${product.name}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#0b7a34] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
                        >
                          <Pencil aria-hidden="true" className="size-3.5" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-normal text-black/60">
              Showing {visible.length} of {filtered.length} product{filtered.length === 1 ? '' : 's'}
              {query || categoryParam !== 'all' || status !== 'all' ? ' (filtered)' : ''}
            </p>

            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setParam('page', String(safePage - 1), false)}
                  disabled={safePage <= 1}
                  className="rounded-full border border-black/15 px-4 py-1.5 text-xs font-medium text-black transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-normal tabular-nums text-black/60">
                  Page {safePage} of {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setParam('page', String(safePage + 1), false)}
                  disabled={safePage >= pageCount}
                  className="rounded-full border border-black/15 px-4 py-1.5 text-xs font-medium text-black transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}