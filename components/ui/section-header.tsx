import type { ReactNode } from 'react'

// ============================================================================
// SECTION HEADER — the standard page heading pattern used by every admin page:
// section-label eyebrow, display title, optional description, optional action
// slot (e.g. "Add product"). Keeps spacing identical across pages.
// ============================================================================

export default function SectionHeader({
  label,
  title,
  description,
  action,
}: {
  label: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="section-label mb-4">{label}</p>
        <h1 className="font-sans text-3xl leading-tight text-black sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm font-normal text-black/60">{description}</p>}
      </div>
      {action}
    </div>
  )
}
