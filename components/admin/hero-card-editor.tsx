'use client'

import { useState } from 'react'
import { heroFormSchema, type HeroFormInput } from '@/lib/hero-schema'

const inputClass =
  'w-full rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2 text-sm text-black placeholder:text-black/55 focus:border-[#00c853] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/30'

const FILTERS = [
  'All trims', 'Egg Belts', 'Pom Poms', 'Accessories', 'Tapes', 'Elastics',
  'Cords & Tassels', 'Shoelaces', 'Ribbons', 'Belts', 'Lace', 'Yarn',
]

type Props = {
  initial?: Partial<HeroFormInput>
  saving: boolean
  onSave: (values: HeroFormInput) => void
  onCancel: () => void
}

/** Inline add/edit form for a single hero card. Shared by add and edit flows. */
export default function HeroCardEditor({ initial, saving, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Partial<HeroFormInput>>({
    label: '', desc: '', filter: 'All trims', image: '', sortOrder: '', isActive: true, ...initial,
  })
  const [error, setError] = useState('')

  const field = (label: string, name: keyof HeroFormInput) => (
    <label className="block text-xs font-medium text-black/70">
      {label}
      <input
        type={name === 'sortOrder' ? 'number' : 'text'}
        min={name === 'sortOrder' ? '0' : undefined}
        value={(draft[name] as string | undefined) ?? ''}
        onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
        className={`${inputClass} mt-1`}
      />
    </label>
  )

  const handleSave = () => {
    setError('')
    const parsed = heroFormSchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input.')
      return
    }
    onSave(parsed.data)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {field('Title', 'label')}
      <label className="block text-xs font-medium text-black/70">
        Description
        <textarea
          value={(draft.desc as string | undefined) ?? ''}
          onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
          className={`${inputClass} mt-1 min-h-[60px] resize-y`}
        />
      </label>
      <label className="block text-xs font-medium text-black/70">
        Showroom filter
        <select
          value={(draft.filter as string) ?? ''}
          onChange={(e) => setDraft({ ...draft, filter: e.target.value as HeroFormInput['filter'] })}
          className={`${inputClass} mt-1`}
        >
          {FILTERS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>
      {field('Image path', 'image')}
      {field('Sort order', 'sortOrder')}
      <label className="flex items-end gap-2 text-xs font-medium text-black/70">
        <input
          type="checkbox"
          checked={!!draft.isActive}
          onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
          className="rounded border-black/20 text-[#01aa3f] focus:ring-[#00c853]"
        />
        Active (shown on the home page)
      </label>

      {error && <p role="alert" className="sm:col-span-2 text-xs text-[#c62828]">{error}</p>}

      <div className="sm:col-span-2 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-[#01aa3f] px-4 py-2 text-xs font-medium text-black hover:bg-[#00ff59] focus-visible:outline-none focus-visible:ring-2 focus:ring-[#00c853] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-black hover:bg-black/[0.03]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
