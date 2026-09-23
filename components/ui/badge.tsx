import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

// ============================================================================
// BADGE — status indicator. One component, one palette; replaces the
// per-component STATUS_STYLES maps (quotes) and ad-hoc active chips.
// `interactive` keeps press/focus affordances for toggleable badges.
// ============================================================================

type Variant =
  | 'neutral'
  | 'active'
  | 'info'
  | 'cyan'
  | 'warning'
  | 'danger'

const variants: Record<Variant, string> = {
  neutral: 'bg-black/[0.06] text-black/70',
  active: 'bg-[#00c853]/15 text-[#0b7a34]',
  info: 'bg-blue-100 text-blue-800',
  cyan: 'bg-cyan-100 text-cyan-800',
  warning: 'bg-orange-100 text-orange-800',
  danger: 'bg-[#c62828]/10 text-[#c62828]',
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: Variant }

export default function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
