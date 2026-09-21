'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/components/ui/button-classes'

// ============================================================================
// BUTTON — the single button component for the admin panel.
// ----------------------------------------------------------------------------
// Class tokens live in `button-classes.ts` (directive-free) so Server
// Components can call `buttonClasses()` too. They are imported, never
// re-exported — re-exporting would make them client references again.
//
// 'use client' stays here: <Button> forwards onClick/disabled, which only ever
// arrive from client components. A function prop cannot cross into a Server
// Component, so this must remain a client component.
//
// Variants follow the light-first design language (DESIGN.md / ADMIN_DESIGN.md):
// brand green fills always carry `text-black`; destructive is the only red.
// Every variant keeps a 44px-class touch target on mobile via min-height.
// ============================================================================

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(buttonClasses({ variant, size }), className)} {...props} />
})

export default Button
