'use client'

import { forwardRef, useId, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'
import { FieldLabel } from '@/components/ui/input'
import { controlBase, controlState } from '@/components/ui/field-classes'

// ============================================================================
// SELECT + TEXTAREA — same visual contract as <Input>: label above, error or
// hint below, one border/focus palette for the whole admin.
// ============================================================================

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string }
>(function Select({ label, error, hint, className, id, children, ...props }, ref) {
  const autoId = useId()
  const selectId = id ?? autoId
  const hintId = `${selectId}-hint`
  return (
    <div className="grid gap-1.5">
      <FieldLabel htmlFor={selectId}>{label}</FieldLabel>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? hintId : undefined}
        className={cn(controlBase, controlState(Boolean(error)), 'cursor-pointer appearance-none bg-[length:1rem] pr-9', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-opacity='0.45' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.625rem center',
        }}
        {...props}
      >
        {children}
      </select>
      <span id={hintId} className={cn('text-[11px] font-normal', error ? 'text-[#c62828]' : 'text-black/50')}>
        {error ?? hint}
      </span>
    </div>
  )
})

Select.displayName = 'Select'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string }
>(function Textarea({ label, error, hint, className, id, rows = 3, ...props }, ref) {
  const autoId = useId()
  const areaId = id ?? autoId
  const hintId = `${areaId}-hint`
  return (
    <div className="grid gap-1.5">
      <FieldLabel htmlFor={areaId}>{label}</FieldLabel>
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? hintId : undefined}
        className={cn(controlBase, controlState(Boolean(error)), 'resize-none', className)}
        {...props}
      />
      <span id={hintId} className={cn('text-[11px] font-normal', error ? 'text-[#c62828]' : 'text-black/50')}>
        {error ?? hint}
      </span>
    </div>
  )
})

Textarea.displayName = 'Textarea'
