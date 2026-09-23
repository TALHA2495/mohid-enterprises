'use client'

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { controlBase, controlState } from '@/components/ui/field-classes'

// ============================================================================
// FIELD PRIMITIVES — label, hint, error affordances shared by every input.
// ----------------------------------------------------------------------------
// The class tokens live in `field-classes.ts` (directive-free) so a Server
// Component can compose them too. They are imported, never re-exported.
//
// `FieldLabel` and `Input` stay in this 'use client' module on purpose:
//   - `FieldLabel` is a *component*, and a Server Component may import and
//     render it directly — a component export is not a client reference.
//   - `Input` uses useId + forwardRef, so it must be a client component.
//
// One control style for the whole admin: `rounded-lg border-black/10
// bg-black/[0.03]`, green focus border, red error border + message below.
// Error text is announced to AT because the control gets aria-invalid.
// ============================================================================

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium text-black">
      {children}
    </label>
  )
}

/** Single-line text-ish input. `error` swaps the border and renders the message. */
export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }
>(function Input({ label, error, hint, className, id, ...props }, ref) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`
  return (
    <div className="grid gap-1.5">
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? hintId : undefined}
        className={cn(controlBase, controlState(Boolean(error)), className)}
        {...props}
      />
      <span id={hintId} className={cn('text-[11px] font-normal', error ? 'text-[#c62828]' : 'text-black/50')}>
        {error ?? hint}
      </span>
    </div>
  )
})

Input.displayName = 'Input'
