import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ProductForm from '@/components/admin/product-form'
import { missingAdminEnvVars, supabaseAdmin } from '@/lib/supabase-admin.server'
import type { Product, ProductCategory } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Edit product | Mohid Enterprises Admin',
}

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!supabaseAdmin) {
    return (
      <main className="min-h-screen bg-[#f4f7f8] p-8 text-black">
        <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm font-normal">
          <span className="font-semibold">Supabase is not configured on the server.</span>
          {missingAdminEnvVars.length > 0 && (
            <>
              {' '}
              Missing: <code className="font-mono">{missingAdminEnvVars.join(', ')}</code>.
            </>
          )}
        </p>
      </main>
    )
  }

  const [productResult, categoriesResult] = await Promise.all([
    supabaseAdmin.from('products').select('*').eq('id', id).maybeSingle(),
    supabaseAdmin
      .from('product_categories')
      .select('id, name, sort_order, is_active, created_at, updated_at')
      .order('sort_order')
      .order('name'),
  ])

  if (productResult.error) {
    return (
      <main className="min-h-screen bg-[#f4f7f8] p-8 text-black">
        <p
          role="alert"
          className="rounded-2xl border border-[#c62828]/30 bg-[#c62828]/[0.04] p-6 text-sm font-normal text-[#c62828]"
        >
          Failed to load this product: {productResult.error.message}
        </p>
      </main>
    )
  }

  // A malformed or deleted id is a 404, not an error state.
  if (!productResult.data) notFound()

  const product = productResult.data as unknown as Product
  const categories = (categoriesResult.data ?? []) as ProductCategory[]

  return (
    <main className="min-h-screen bg-[#f4f7f8] text-black">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6">
        <Link
          href="/admin/products"
          className="text-xs font-medium text-[#0b7a34] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
        >
          ← Back to catalog
        </Link>

        <h1 className="mb-2 mt-4 text-3xl font-semibold">{product.name}</h1>
        <p className="mb-8 text-sm font-normal text-black/60">
          {product.is_active ? 'Active in the catalog.' : 'Inactive — hidden from quoting.'}
          {product.category ? ` Filed under ${product.category}.` : ''}
        </p>

        <ProductForm categories={categories} product={product} />
      </div>
    </main>
  )
}