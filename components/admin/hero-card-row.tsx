'use client'

import type React from 'react'
import { GripVertical, Trash2 } from 'lucide-react'
import type { HeroSectionRow } from '@/lib/showroom'

// A single hero-card row: drag handle + move up/down buttons + edit/remove.
// Kept presentational so the parent owns all state and reorder logic.

type Props = {
  item: HeroSectionRow
  index: number
  onDragStart: (e: React.DragEvent<HTMLButtonElement>, index: number) => void
  onDrop: (e: React.DragEvent<HTMLLIElement>, to: number) => void
  onEdit: (item: HeroSectionRow) => void
  onRemove: (item: HeroSectionRow) => void
  disabled?: boolean
}

export default function HeroCardRow({ item, index, onDragStart, onDrop, onEdit, onRemove, disabled }: Props) {
  return (
    <li
      className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, index)}
    >
      <button
        type="button"
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        aria-label={`Drag ${item.label}`}
        className="cursor-grab text-black/30 hover:text-black/60 focus:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="tabular-nums text-xs text-black/40 w-5 text-right">{index + 1}</span>
      <div className="flex-1 truncate text-sm font-medium text-black">{item.label}</div>
      <span className="hidden text-xs text-black/50 sm:inline">Filter: {item.filter}</span>
      {!item.is_active && <span className="text-[10px] font-medium text-[#c62828]">(inactive)</span>}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.label}`}
          className="rounded-full p-1.5 text-[#0b7a34] hover:bg-[#00c853]/10 focus-visible:outline-none focus-visible:ring-2 focus:ring-[#00c853]"
          title="Edit"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => onRemove(item)}
          aria-label={`Remove ${item.label}`}
          className="rounded-full p-1.5 text-[#c62828] hover:bg-[#c62828]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus:ring-[#c62828]"
          title="Remove"
          disabled={disabled}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  )
}
