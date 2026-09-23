import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import CategoriesPanel from '@/components/admin/categories-panel'
import ProductsAdminClient, { type AdminProductRow } from '@/components/admin/products-admin-client'
import { missingAdminEnvVars, supabaseAdmin } from '@/lib/supabase-admin.server'
import type { ProductCategory } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Products | Mohid Enterprises Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  if (!supabaseAdmin) {
    return (
      <div>
        <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm font-normal">
          <span className="font-semibold">Supabase is not configured on the server.</span>
          {missingAdminEnvVars.length > 0 && (
            <>
              {' '}
              Missing: <code className="font-mono">{missingAdminEnvVars.join(', ')}</code>.
            </>
          )}{' '}
          See <code className="font-mono">supabase/README.md</code>.
        </p>
      </div>
    )
  }

  const [productsResult, categoriesResult] = await Promise.all([
    supabaseAdmin
      .from('products')
      .select(
        'id, name, category, category_id, price_per_unit, moq_units, stock_available, is_active, updated_at, images',
      )
      .order('name'),
    supabaseAdmin
      .from('product_categories')
      .select('id, name, sort_order, is_active, created_at, updated_at')
      .order('sort_order')
      .order('name'),
  ])

  const failure = productsResult.error ?? categoriesResult.error
  if (failure) {
    console.error('[AdminProductsPage] fetch failed:', failure)
    return (
      <div>
        <p
          role="alert"
          className="rounded-2xl border border-[#c62828]/30 bg-[#c62828]/[0.04] p-6 text-sm font-normal text-[#c62828]"
        >
          Failed to load the catalog: {failure.message}
          {failure.code === '42P01' && (
            <>
              {' '}
              Run <code className="font-mono">supabase/migrations/0002_products_catalog.sql</code> in the Supabase SQL
              editor.
            </>
          )}
        </p>
      </div>
    )
  }

  const products = (productsResult.data ?? []) as unknown as AdminProductRow[]
  const categories = (categoriesResult.data ?? []) as ProductCategory[]

  const productCounts: Record<string, number> = {}
  for (const product of products) {
    if (!product.category_id) continue
    productCounts[product.category_id] = (productCounts[product.category_id] ?? 0) + 1
  }

  return (
    <div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label mb-4">Catalog</p>
            <h1 className="font-display text-4xl leading-tight">Product catalog</h1>
            <p className="mt-2 text-sm font-normal text-black/60">
              {products.length} product{products.length === 1 ? '' : 's'} across {categories.length} categor
              {categories.length === 1 ? 'y' : 'ies'}.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="btn-brand text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]"
          >
            Add product
          </Link>
        </div>

        <div className="grid gap-6">
          <Suspense fallback={<p className="text-sm font-normal text-black/60">Loading catalog…</p>}>
            <ProductsAdminClient products={products} categories={categories} />
          </Suspense>

          <CategoriesPanel categories={categories} productCounts={productCounts} />
        </div>
      </div>
  )
}