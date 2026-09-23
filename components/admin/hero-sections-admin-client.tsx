'use client'

import { Plus } from 'lucide-react'

import type { HeroSectionRow } from '@/lib/showroom'
import { useHeroAdmin } from '@/lib/use-hero-admin'
import HeroCardEditor from './hero-card-editor'
import HeroCardRow from './hero-card-row'
import HeroDeleteDialog from './hero-delete-dialog'

// HERO SECTIONS admin page — renders the list, add/edit pane, and delete
// dialog. All state + mutation logic lives in useHeroAdmin; presentational
// pieces live in HeroCardRow / HeroCardEditor / HeroDeleteDialog.

export default function HeroSectionsAdminClient({ hero }: { hero: HeroSectionRow[] }) {
  const {
    items, editing, adding, deleting, notice, isPending,
    moveUp, moveDown, onDragStart, onDrop, onSave, confirmDelete, editorInitial,
    startAdd, startEdit, startDelete, cancelEditor, dismissDelete,
  } = useHeroAdmin(hero)

  return (
    <div className="space-y-5">
      {notice && (
        <p
          role="status"
          className={`rounded-lg border p-3 text-xs ${notice.type === 'ok' ? 'border-[#0b7a34]/30 bg-[#0b7a34]/[0.04] text-[#0b7a34]' : 'border-[#c62828]/30 bg-[#c62828]/[0.04] text-[#c62828]'}`}
        >
          {notice.message}
        </p>
      )}

      {(adding || editing) && (
        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-black">{adding ? 'Add a card' : 'Edit card'}</h2>
          <HeroCardEditor initial={editorInitial} saving={isPending} onSave={onSave} onCancel={cancelEditor} />
        </section>
      )}

      <section className="rounded-2xl border border-black/10 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black">Cards ({items.length})</h2>
          <button
            type="button"
            onClick={startAdd}
            disabled={!!editing}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#00c853] px-3.5 py-1.5 text-xs font-medium text-black hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus:ring-[#00c853]"
          >
            <Plus className="size-4" /> Add card
          </button>
        </div>

        <ul className="divide-y divide-black/5">
          {items.map((item, index) => (
            <HeroCardRow
              key={item.id}
              item={item}
              index={index}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onEdit={startEdit}
              onRemove={startDelete}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              isLast={index === items.length - 1}
              disabled={isPending}
            />
          ))}
        </ul>
      </section>

      {deleting && (
        <HeroDeleteDialog
          item={deleting}
          open
          pending={isPending}
          onCancel={dismissDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
