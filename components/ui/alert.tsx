import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

// ============================================================================
// ALERT — inline status message (form errors, action results). Three tones:
// error (red, role=alert), success (brand green), info (neutral).
// ============================================================================

type Tone = 'error' | 'success' | 'info'

const tones: Record<Tone, string> = {
  error: 'border-[#c62828]/30 bg-[#c62828]/[0.04] text-[#c62828]',
  success: 'border-[#00c853]/30 bg-[#00c853]/[0.06] text-[#0b7a34]',
  info: 'border-black/10 bg-black/[0.03] text-black/70',
}

export default function Alert({
  tone = 'info',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border p-3 text-sm font-normal', tones[tone], className)}
    >
      {children}
    </div>
  )
}
