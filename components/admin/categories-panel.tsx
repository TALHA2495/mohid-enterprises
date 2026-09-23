'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { deleteCategory, saveCategory } from '@/app/admin/actions'
import type { ProductCategory } from '@/lib/supabase'

// ============================================================================
// CATEGORIES PANEL — create, rename, reorder, deactivate and delete categories
// ----------------------------------------------------------------------------
// Rendered inside a <details> on /admin/products so the catalog stays the focus.
// Renaming a category also rewrites the mirrored `products.category` text for
// its products (the server action does that), so nothing goes stale.
// ============================================================================

type Props = {
  categories: ProductCategory[]
  productCounts: Record<string, number>
}

// max-w-2xl: these name fields sit in a 1fr grid track, which on a 2560px display
// stretches them to ~1900px. The sort-order inputs sharing this class are `sm:w-24`,
// so the cap does not affect them.
const inputClass =
  'w-full max-w-2xl rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2 text-sm text-black placeholder:text-black/45 focus:border-[#00c853] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/30'

export default function CategoriesPanel({ categories, productCounts }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [newName, setNewName] = useState('')
  const [newOrder, setNewOrder] = useState(String((categories.at(-1)?.sort_order ?? 0) + 10))

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftOrder, setDraftOrder] = useState('')

  const reset = () => {
    setError('')
    setNotice('')
  }

  const addCategory = () => {
    reset()
    startTransition(async () => {
      const result = await saveCategory({ name: newName, sortOrder: newOrder, isActive: true })
      if (!result.ok) {
        setError(result.error ?? 'The category could not be created.')
        return
      }
      setNewName('')
      setNewOrder(String(Number(newOrder) + 10))
      setNotice('Category added.')
    })
  }

  const startEditing = (category: ProductCategory) => {
    reset()
    setEditingId(category.id)
    setDraftName(category.name)
    setDraftOrder(String(category.sort_order))
  }

  const saveEdit = (category: ProductCategory) => {
    reset()
    startTransition(async () => {
      const result = await saveCategory({
        id: category.id,
        updatedAt: category.updated_at,
        name: draftName,
        sortOrder: draftOrder,
        isActive: category.is_active,
      })
      if (!result.ok) {
        setError(result.error ?? 'The category could not be saved.')
        return
      }
      setEditingId(null)
      setNotice('Category saved.')
    })
  }

  const toggleActive = (category: ProductCategory) => {
    reset()
    startTransition(async () => {
      const result = await saveCategory({
        id: category.id,
        updatedAt: category.updated_at,
        name: category.name,
        sortOrder: String(category.sort_order),
        isActive: !category.is_active,
      })
      if (!result.ok) setError(result.error ?? 'The category could not be updated.')
    })
  }

  const removeCategory = (category: ProductCategory) => {
    reset()
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (!result.ok) {
        setError(result.error ?? 'The category could not be deleted.')
        return
      }
      setNotice(`Deleted “${category.name}”.`)
    })
  }

  const chipBase =
    'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50'

  return (
    <details className="rounded-2xl border border-black/10 bg-white">
      <summary className="cursor-pointer list-none px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50">
        <span className="text-sm font-semibold text-black">Categories ({categories.length})</span>
        <span className="ml-2 text-xs font-normal text-black/55">
          Add, rename, reorder or deactivate the taxonomy products are filed under.
        </span>
      </summary>

      <div className="grid gap-4 border-t border-black/10 p-5">
        <div aria-live="polite" className="text-xs font-normal">
          {error && (
            <p role="alert" className="rounded-lg border border-[#c62828]/30 bg-[#c62828]/[0.04] p-2 text-[#c62828]">
              {error}
            </p>
          )}
          {notice && <p className="text-[#0b7a34]">{notice}</p>}
          {isPending && <p className="text-black/50">Saving…</p>}
        </div>

        {categories.length === 0 ? (
          <p className="text-sm font-normal text-black/60">
            No categories yet. Create one below, then file products under it.
          </p>
        ) : (
          <ul className="grid gap-2">
            {categories.map((category) => {
              const count = productCounts[category.id] ?? 0
              const isEditing = editingId === category.id

              return (
                <li
                  key={category.id}
                  className="grid items-center gap-3 rounded-xl border border-black/10 p-3 sm:grid-cols-[1fr_auto_auto_auto]"
                >
                  {isEditing ? (
                    <input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      aria-label={`Name for ${category.name}`}
                      className={inputClass}
                    />
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-black">{category.name}</p>
                      <p className="text-[11px] font-normal text-black/55">
                        {count} product{count === 1 ? '' : 's'} · sort {category.sort_order}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <input
                      type="number"
                      min="0"
                      value={draftOrder}
                      onChange={(event) => setDraftOrder(event.target.value)}
                      aria-label={`Sort order for ${category.name}`}
                      className={`${inputClass} sm:w-24`}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => toggleActive(category)}
                    disabled={isPending}
                    aria-pressed={category.is_active}
                    aria-label={`${category.is_active ? 'Deactivate' : 'Activate'} ${category.name}`}
                    className={`${chipBase} ${
                      category.is_active ? 'bg-[#00c853]/15 text-[#0b7a34]' : 'bg-black/[0.06] text-black/70'
                    } disabled:opacity-50`}
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </button>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(category)}
                          disabled={isPending}
                          className="rounded-full bg-[#01aa3f] px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-[#00ff59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-full px-2 py-1 text-xs font-medium text-black/70 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditing(category)}
                        className="rounded-full px-3 py-1 text-xs font-medium text-[#0b7a34] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50"
                      >
                        Rename
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      disabled={isPending || count > 0}
                      aria-label={`Delete ${category.name}`}
                      title={
                        count > 0
                          ? `${count} product${count === 1 ? '' : 's'} still use this category`
                          : 'Delete category'
                      }
                      className="rounded-full p-1.5 text-[#c62828] transition-colors hover:bg-[#c62828]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c62828]/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="grid items-end gap-3 rounded-xl border border-dashed border-black/15 p-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="grid gap-1.5" htmlFor="new-category-name">
            <span className="text-xs font-medium text-black">New category</span>
            <input
              id="new-category-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="e.g. Zippers"
              className={inputClass}
            />
          </label>

          <label className="grid gap-1.5" htmlFor="new-category-order">
            <span className="text-xs font-medium text-black">Sort</span>
            <input
              id="new-category-order"
              type="number"
              min="0"
              value={newOrder}
              onChange={(event) => setNewOrder(event.target.value)}
              className={`${inputClass} sm:w-24`}
            />
          </label>

          <button
            type="button"
            onClick={addCategory}
            disabled={isPending || newName.trim().length < 2}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#00c853] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add category
          </button>
        </div>
      </div>
    </details>
  )
}