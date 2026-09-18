'use client'

import type React from 'react'
import { useState, useTransition } from 'react'

import { reorderHero, saveHero, deleteHero } from '@/app/admin/actions'
import type { HeroSectionRow } from '@/lib/showroom'
import type { HeroFormInput } from '@/lib/hero-schema'

// State + mutation logic for the hero-sections admin list, extracted so the
// render component stays lean. All writes go through server actions; local
// state is patched optimistically and re-sorted by the persisted sort_order.

type Notice = { type: 'ok' | 'error'; message: string } | null

export function useHeroAdmin(initial: HeroSectionRow[]) {
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<HeroSectionRow | null>(null)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<HeroSectionRow | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [isPending, startTransition] = useTransition()

  const bySort = (a: HeroSectionRow, b: HeroSectionRow) =>
    a.sort_order === b.sort_order ? a.label.localeCompare(b.label) : a.sort_order - b.sort_order

  const move = (from: number, to: number) => {
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setItems(next)
  }
  const flushOrder = () => {
    setNotice(null)
    startTransition(async () => {
      const result = await reorderHero(items.map((i) => i.id))
      if (!result.ok) setNotice({ type: 'error', message: result.error ?? 'Reorder failed.' })
    })
  }
  const moveUp = (i: number) => { if (i === 0) return; move(i, i - 1); flushOrder() }
  const moveDown = (i: number) => { if (i === items.length - 1) return; move(i, i + 1); flushOrder() }

  const onDragStart = (e: React.DragEvent<HTMLButtonElement>, index: number) =>
    e.dataTransfer.setData('text/plain', String(index))
    const onDrop = (e: React.DragEvent<HTMLLIElement>, to: number) => {
    const from = Number(e.dataTransfer.getData('text/plain'))
    if (!Number.isNaN(from) && from !== to) { move(from, to); flushOrder() }
  }

  const onSave = (values: HeroFormInput) => {
    setNotice(null)
    const payload = editing
      ? { ...values, id: editing.id, updatedAt: editing.updated_at }
      : values
    startTransition(async () => {
      const result = await saveHero(payload)
      if (!result.ok) {
        setNotice({ type: 'error', message: result.error ?? 'Could not save the card.' })
        return
      }
      const stamp = values.sortOrder === '' ? 0 : Number(values.sortOrder)
      const patch: Partial<HeroSectionRow> = {
        label: values.label, desc: values.desc ?? null, filter: values.filter,
        image: values.image, sort_order: stamp, is_active: values.isActive,
      }
      setItems((prev) => {
        let next: HeroSectionRow[]
        if (editing) {
          next = prev.map((i) => (i.id === editing.id ? { ...i, ...patch } : i))
        } else if (result.id) {
          next = [
            ...prev,
            {
              id: result.id, label: values.label, desc: values.desc ?? null,
              filter: values.filter, image: values.image, sort_order: stamp,
              is_active: values.isActive,
              created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            } as HeroSectionRow,
          ]
        } else {
          next = prev
        }
        return next.sort(bySort)
      })
      setNotice({ type: 'ok', message: editing ? 'Card updated.' : 'Card added.' })
      setEditing(null); setAdding(false)
    })
  }

  const confirmDelete = () => {
    if (!deleting) return
    startTransition(async () => {
      const result = await deleteHero(deleting.id)
      if (!result.ok) { setNotice({ type: 'error', message: result.error ?? 'Could not delete the card.' }); return }
      setItems((prev) => prev.filter((i) => i.id !== deleting.id))
      setDeleting(null)
    })
  }

  const editorInitial: Partial<HeroFormInput> = editing
    ? {
        label: editing.label, desc: editing.desc ?? '', filter: editing.filter as HeroFormInput['filter'],
        image: editing.image, sortOrder: String(editing.sort_order), isActive: editing.is_active,
      }
    : { filter: 'All trims', image: '', sortOrder: '', isActive: true, label: '', desc: '' }

  return {
    items, editing, adding, deleting, notice, isPending,
    moveUp, moveDown, onDragStart, onDrop, onSave, confirmDelete, editorInitial,
    startAdd: () => setAdding(true),
    startEdit: (it: HeroSectionRow) => setEditing(it),
    startDelete: (it: HeroSectionRow) => setDeleting(it),
    cancelEditor: () => { setAdding(false); setEditing(null) },
    dismissDelete: () => setDeleting(null),
  }
}
