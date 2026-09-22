import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/admin-auth'
import { missingAdminEnvVars, supabaseAdmin } from '@/lib/supabase-admin.server'
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav'
import { MobileSidebar } from '@/components/admin/mobile-sidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Redirect to the login screen when there is no valid session. The login
  // route handler sets the hmac cookie; this layout reads it server-side on
  // every navigation so the dashboard can't be deep-linked unauthenticated.
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  if (!(await isValidSession(token))) redirect('/admin/login')

  if (!supabaseAdmin) {
    return (
      <main id="main" className="min-h-screen bg-[#f4f7f8] p-8 text-black">
        <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm font-normal">
          <span className="font-semibold">Supabase is not configured.</span>
          {missingAdminEnvVars.length > 0 && (
            <>
              {' '}
              Missing: <code className="font-mono">{missingAdminEnvVars.join(', ')}</code>.
            </>
          )}
        </p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-black">
      {/* Desktop sidebar (>= md). Below md the MobileSidebar drawer takes over —
          at sm (640px) a fixed 256px rail would leave ~360px of usable content. */}
      <aside className="fixed inset-y-0 top-0 hidden w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-black/10 bg-white p-6 md:flex">
        <div>
          <p className="section-label mb-3">Admin</p>
          <Link href="/" className="block w-fit" aria-label="Mohid Enterprises home">
            <Image
              src="/images/LOGO MOHID.webp"
              alt="Mohid Enterprises logo"
              width={120}
              height={32}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <p className="mt-1.5 text-xs text-black/50">Operations console</p>
        </div>

        <AdminSidebarNav />
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            {/* Mobile/tablet: hamburger + compact brand. Desktop: company name. */}
            <div className="flex items-center gap-2.5">
              <MobileSidebar />
              <Link
                href="/"
                aria-label="Mohid Enterprises admin home"
                className="flex items-center gap-2.5 md:hidden"
              >
                <Image
                  src="/images/LOGO MOHID.webp"
                  alt="Mohid Enterprises logo"
                  width={96}
                  height={26}
                  className="h-6 w-auto"
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">
                  Admin
                </span>
              </Link>
            </div>
            <span className="font-mono text-xs text-black/40 hidden md:inline">
              Mohid Enterprises
            </span>
          </div>
        </header>
        {/* Single <main id="main"> landmark — child pages must NOT render their own
            <main> (nested landmarks are an a11y violation). The global skip link
            in app/layout.tsx targets this id. */}
        <main id="main" className="min-h-[calc(100vh-3.5rem)] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
