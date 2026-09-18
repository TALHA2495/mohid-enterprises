'use client'

import type { HeroSectionRow } from '@/lib/showroom'

// Modal confirmation for removing a hero card.
type Props = {
  item: HeroSectionRow
  open: boolean
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function HeroDeleteDialog({ item, open, pending, onCancel, onConfirm }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold">Remove “{item.label}”?</h2>
        <p className="mb-5 text-sm text-black/60">
          Removes the card from the home page only — the image file is untouched.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-medium text-black/70 hover:bg-black/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="rounded-full bg-[#c62828] px-4 py-2 text-sm font-medium text-white hover:bg-[#c62828]/90 disabled:opacity-60"
          >
            {pending ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}
