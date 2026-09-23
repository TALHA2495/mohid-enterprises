import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

// ============================================================================
// CARD — the one surface for the admin panel: white, hairline border,
// rounded-2xl. `hover` adds the brand gradient wash (mirrors .admin-card).
// ============================================================================

export function Card({ hover = false, className, ...props }: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-black/10 bg-white',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-[#01aa3f]/40 hover:shadow-lg',
        className,
      )}
      {...props}
    />
  )
}

/** Section header inside a card/form section — keeps every panel identical. */
export function CardSectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('text-sm font-semibold text-black', className)}>{children}</h2>
}
