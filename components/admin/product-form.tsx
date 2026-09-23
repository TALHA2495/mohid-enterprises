'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'

import { deleteProduct, saveProduct } from '@/app/admin/actions'
import { listToCsv, productFormSchema } from '@/lib/product-schema'
import type { ProductFormInput } from '@/lib/product-schema'
import type { Product, ProductCategory } from '@/lib/supabase'

import ProductImagesField from './product-images-field'

// ============================================================================
// PRODUCT FORM — create and edit a catalog product
// ----------------------------------------------------------------------------
// One component serves /admin/products/new and /admin/products/[id]; the only
// difference is whether an existing product (and its `updated_at` revision) is
// supplied. The revision travels back to the server action, which refuses the
// write if another tab saved first.
// ============================================================================

const inputClass =
  'w-full rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2 text-sm text-black placeholder:text-black/55 focus:border-[#00c853] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/30'

type Props = {
  categories: ProductCategory[]
  product?: Product
}

function defaultsFor(product: Product | undefined, categories: ProductCategory[]): ProductFormInput {
  if (product) {
    return {
      name: product.name,
      categoryId: product.category_id ?? '',
      description: product.description ?? '',
      material: product.material,
      widthMm: product.width_mm === null ? '' : String(product.width_mm),
      moqUnits: product.moq_units === null ? '' : String(product.moq_units),
      pricePerUnit: product.price_per_unit === null ? '' : String(product.price_per_unit),
      stockAvailable: String(product.stock_available),
      colors: listToCsv(product.available_colors),
      finishes: listToCsv(product.available_finishes),
      isActive: product.is_active,
      images: product.images ?? [],
    }
  }

  return {
    name: '',
    categoryId: categories.find((category) => category.is_active)?.id ?? '',
    description: '',
    material: '',
    widthMm: '',
    moqUnits: '',
    pricePerUnit: '',
    stockAvailable: '0',
    colors: '',
    finishes: '',
    isActive: true,
    images: [],
  }
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultsFor(product, categories),
  })

  const images = watch('images')
  const selectableCategories = categories.filter((category) => category.is_active || category.id === product?.category_id)

  const onSubmit = (values: ProductFormInput) => {
    setFormError('')
    startTransition(async () => {
      const result = await saveProduct({ ...values, id: product?.id, updatedAt: product?.updated_at })
      if (!result.ok) {
        setFormError(result.error ?? 'The product could not be saved.')
        return
      }
      router.push('/admin/products')
      router.refresh()
    })
  }

  const onDelete = () => {
    if (!product) return
    setFormError('')
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (!result.ok) {
        setFormError(result.error ?? 'The product could not be deleted.')
        setConfirmingDelete(false)
        return
      }
      router.push('/admin/products')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <div aria-live="polite">
        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-[#c62828]/30 bg-[#c62828]/[0.04] p-3 text-sm font-normal text-[#c62828]"
          >
            {formError}
          </p>
        )}
      </div>

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black">Identity</h2>

        {/* Four columns at xl: the product name gets two (long trims names), the
            category one, and the description two — so no single control stretches
            across a 1600px shell. */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 xl:col-span-2" htmlFor="name">
            <span className="text-xs font-medium text-black">Product name</span>
            <input id="name" className={inputClass} placeholder="e.g. Jacquard Elastic Tape" {...register('name')} />
            {errors.name && <span className="text-[11px] font-normal text-[#c62828]">{errors.name.message}</span>}
          </label>

          <label className="grid gap-1.5 xl:col-span-2" htmlFor="categoryId">
            <span className="text-xs font-medium text-black">Category</span>
            <select id="categoryId" className={inputClass} {...register('categoryId')}>
              <option value="">Select a category…</option>
              {selectableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.is_active ? '' : ' (inactive)'}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-[11px] font-normal text-[#c62828]">{errors.categoryId.message}</span>
            )}
          </label>
        </div>

        <label className="grid gap-1.5 sm:col-span-2 xl:col-span-2" htmlFor="description">
          <span className="text-xs font-medium text-black">Description</span>
          <textarea
            id="description"
            rows={3}
            className={`${inputClass} max-w-3xl resize-none`}
            placeholder="How this trim is used, finishes available, lead time…"
            {...register('description')}
          />
          {errors.description && (
            <span className="text-[11px] font-normal text-[#c62828]">{errors.description.message}</span>
          )}
        </label>
      </section>

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black">Specification</h2>

        {/* Column count grows with the viewport so each control keeps a sane width
            now that the form fills the shell instead of a 896px column. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <label className="grid gap-1.5" htmlFor="material">
            <span className="text-xs font-medium text-black">Material</span>
            <input id="material" className={inputClass} placeholder="e.g. Polyester" {...register('material')} />
            {errors.material && <span className="text-[11px] font-normal text-[#c62828]">{errors.material.message}</span>}
          </label>

          <label className="grid gap-1.5" htmlFor="widthMm">
            <span className="text-xs font-medium text-black">Nominal width (mm)</span>
            <input id="widthMm" type="number" min="1" className={inputClass} placeholder="25" {...register('widthMm')} />
            {errors.widthMm ? (
              <span className="text-[11px] font-normal text-[#c62828]">{errors.widthMm.message}</span>
            ) : (
              <span className="text-[11px] font-normal text-black/60">Leave blank if the product has no fixed width.</span>
            )}
          </label>

          <label className="grid gap-1.5" htmlFor="moqUnits">
            <span className="text-xs font-medium text-black">Minimum order quantity</span>
            <input id="moqUnits" type="number" min="1" className={inputClass} placeholder="500" {...register('moqUnits')} />
            {errors.moqUnits ? (
              <span className="text-[11px] font-normal text-[#c62828]">{errors.moqUnits.message}</span>
            ) : (
              <span className="text-[11px] font-normal text-black/60">
                Leave blank if the site does not publish a minimum.
              </span>
            )}
          </label>

          <label className="grid gap-1.5" htmlFor="availableColors">
            <span className="text-xs font-medium text-black">Colours</span>
            <input
              id="availableColors"
              className={inputClass}
              placeholder="Red, Blue, Black"
              {...register('colors')}
            />
            {errors.colors ? (
              <span className="text-[11px] font-normal text-[#c62828]">{errors.colors.message}</span>
            ) : (
              <span className="text-[11px] font-normal text-black/60">Comma separated.</span>
            )}
          </label>

          <label className="grid gap-1.5" htmlFor="availableFinishes">
            <span className="text-xs font-medium text-black">Finishes</span>
            <input id="availableFinishes" className={inputClass} placeholder="Glossy, Matte" {...register('finishes')} />
            {errors.finishes ? (
              <span className="text-[11px] font-normal text-[#c62828]">{errors.finishes.message}</span>
            ) : (
              <span className="text-[11px] font-normal text-black/60">Comma separated.</span>
            )}
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black">Commercial</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <label className="grid gap-1.5" htmlFor="pricePerUnit">
            <span className="text-xs font-medium text-black">Unit price (PKR)</span>
            <input
              id="pricePerUnit"
              type="number"
              min="0"
              step="0.0001"
              className={inputClass}
              placeholder="Leave blank to quote on request"
              {...register('pricePerUnit')}
            />
            {errors.pricePerUnit ? (
              <span className="text-[11px] font-normal text-[#c62828]">{errors.pricePerUnit.message}</span>
            ) : (
              <span className="text-[11px] font-normal text-black/60">Per metre. Blank means priced on request.</span>
            )}
          </label>

          <label className="grid gap-1.5" htmlFor="stockAvailable">
            <span className="text-xs font-medium text-black">Stock available</span>
            <input
              id="stockAvailable"
              type="number"
              min="0"
              className={inputClass}
              placeholder="0"
              {...register('stockAvailable')}
            />
            {errors.stockAvailable && (
              <span className="text-[11px] font-normal text-[#c62828]">{errors.stockAvailable.message}</span>
            )}
          </label>

          <label className="flex items-center gap-2.5 self-end pb-1" htmlFor="isActive">
            <input
              id="isActive"
              type="checkbox"
              className="size-4 rounded border-black/20 text-[#01aa3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
              {...register('isActive')}
            />
            <span className="text-xs font-medium text-black">Active (visible for quoting)</span>
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black">Gallery</h2>
        <ProductImagesField
          value={images}
          onChange={(next) => setValue('images', next, { shouldValidate: true, shouldDirty: true })}
          disabled={isPending}
        />
        {errors.images && <span className="text-[11px] font-normal text-[#c62828]">{errors.images.message}</span>}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#01aa3f] px-6 py-2.5 text-sm font-medium text-black transition-all hover:bg-[#00ff59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          disabled={isPending}
          className="rounded-full border border-black/15 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        {product &&
          (confirmingDelete ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-normal text-black/70">Delete “{product.name}” permanently?</span>
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#c62828]/40 px-4 py-2 text-xs font-medium text-[#c62828] transition-colors hover:bg-[#c62828]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c62828]/40 disabled:opacity-60"
              >
                <Trash2 aria-hidden="true" className="size-3.5" />
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-full px-3 py-2 text-xs font-medium text-black/70 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
              >
                Keep it
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={isPending}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#c62828] transition-colors hover:bg-[#c62828]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c62828]/40 disabled:opacity-60"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
              Delete product
            </button>
          ))}
      </div>

      {product && (
        <p className="text-[11px] font-normal text-black/60">
          Last updated {new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(product.updated_at))} UTC
        </p>
      )}
    </form>
  )
}