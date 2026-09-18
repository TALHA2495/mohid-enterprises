'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav'

// Mobile-only navigation drawer (< sm breakpoint). The desktop sidebar lives
// in the layout as a fixed <aside>; on phones it is hidden, so this component
// owns the hamburger toggle, the slide-in drawer and the backdrop.
export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the drawer after any navigation so it never stays open over new content.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Escape closes; body scroll locks while open.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-black transition-colors hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/60 sm:hidden"
      >
        <Menu aria-hidden="true" strokeWidth={2} className="h-5 w-5" />
      </button>

      {/* Backdrop: closes on tap. */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 sm:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Drawer. Width: 85vw on phones (generous), capped at 320px so it never
          dominates the screen. Top padding respects notched-phone safe areas. */}
      <aside
        id="admin-mobile-nav"
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[320px] flex-col gap-6 overflow-y-auto border-r border-black/10 bg-white p-6 pt-[max(1.5rem,env(safe-area-inset-top))] transition-transform duration-200 sm:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-label mb-3">Admin</p>
            <p className="font-display text-2xl leading-tight text-black">
              Mohid<span className="gradient-brand-text">.</span>
            </p>
            <p className="mt-1.5 text-xs text-black/50">Operations console</p>
          </div>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-black/60 transition-colors hover:bg-black/[0.05] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/60"
          >
            <X aria-hidden="true" strokeWidth={2} className="h-5 w-5" />
          </button>
        </div>

        <AdminSidebarNav />
      </aside>
    </>
  )
}
