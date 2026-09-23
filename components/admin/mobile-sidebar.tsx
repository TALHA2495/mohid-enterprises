'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav'

// Mobile/tablet navigation drawer (< md breakpoint). The desktop sidebar lives
// in the layout as a fixed <aside>; below md it is hidden, so this component
// owns the hamburger toggle, the slide-in drawer and the backdrop.
//
// The backdrop and drawer render through a portal to document.body: the admin
// header uses `backdrop-blur`, which creates a containing block for
// fixed-position descendants. Without the portal the "fixed" drawer is
// clipped to the 56px header and paints underneath page content.
//
// Z-ladder (app-wide): content 0-10 < sticky header 10 < film grain 30 <
// backdrop 40 < drawer / dialogs / lightbox 50.
export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const drawerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Portals need the DOM; gate on client mount to avoid a hydration mismatch.
  useEffect(() => setMounted(true), [])

  // Close the drawer after any navigation so it never stays open over new content.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Escape closes; body scroll locks and focus moves into the drawer while open.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    drawerRef.current?.focus()
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
        className="flex h-11 w-11 items-center justify-center rounded-xl text-black transition-colors hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/60 md:hidden"
      >
        <Menu aria-hidden="true" strokeWidth={2} className="h-5 w-5" />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Backdrop: closes on tap. */}
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            />

            {/* Drawer. 85vw on phones, capped at 320px. Top padding respects
                notched-phone safe areas. inert + aria-hidden while closed
                keeps the links out of tab order and the a11y tree. */}
            <aside
              ref={drawerRef}
              id="admin-mobile-nav"
              aria-label="Admin navigation"
              aria-hidden={!open}
              inert={!open}
              tabIndex={-1}
              className={`fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[320px] flex-col gap-6 overflow-y-auto border-r border-black/10 bg-white p-6 pt-[max(1.5rem,env(safe-area-inset-top))] shadow-2xl transition-transform duration-200 md:hidden ${
                open ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  
                  <p className="font-display text-2xl leading-tight text-black">
                    Mohid<span className="gradient-brand-text">.</span>
                  </p>
                  <p className="mt-1.5 text-xs text-black/60">Operations console</p>
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
          </>,
          document.body,
        )}
    </>
  )
}