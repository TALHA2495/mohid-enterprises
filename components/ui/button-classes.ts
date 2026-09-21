import { cn } from '@/lib/utils'

// ============================================================================
// BUTTON CLASS TOKENS — pure class strings. NOTHING here is a component, and
// this module deliberately has NO 'use client' directive.
// ----------------------------------------------------------------------------
// Why it is a separate module: a file marked 'use client' is a client boundary,
// and every non-component export of it becomes an opaque *client reference*.
// A Server Component that imports such an export gets a proxy, not a function,
// and any call throws at render time:
//   "Attempted to call buttonClasses() from the server but buttonClasses is on
//    the client."
// A build passes in that case — it only fails when the page renders — so the
// tokens must live in a directive-free module that both server and client can
// import and actually call.
//
// `button.tsx` keeps 'use client' (it forwards onClick/disabled from client
// components) and imports from here. It does NOT re-export these symbols, so
// there is exactly one import path and the trap cannot come back.
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline-brand'
export type ButtonSize = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/60 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[#01aa3f] text-black hover:bg-[#00ff59] shadow-sm hover:shadow-md disabled:hover:bg-[#01aa3f]',
  secondary: 'border border-black/15 bg-white text-black hover:bg-black/[0.03]',
  ghost: 'text-black/70 hover:bg-black/[0.05] hover:text-black',
  destructive:
    'border border-[#c62828]/40 text-[#c62828] hover:bg-[#c62828]/[0.06] focus-visible:ring-[#c62828]/40',
  'outline-brand': 'border border-[#00c853] text-black hover:bg-black/[0.03]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 py-1.5 text-xs',
  md: 'min-h-11 px-5 py-2.5 text-sm',
}

/** Class string for a button-styled element (`<button>`, `<Link>`, …). */
export const buttonClasses = ({
  variant = 'primary',
  size = 'md',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
} = {}) => cn(base, variants[variant], sizes[size])
