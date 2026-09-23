'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Image as ImageIcon, FileText, type LucideIcon } from 'lucide-react'

const NAV_LINKS: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: '/admin', label: 'Dashboard', icon: Home, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/hero', label: 'Hero cards', icon: ImageIcon },
  { href: '/admin/quotes', label: 'Quotes', icon: FileText },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
}

export function AdminSidebarNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-1.5">
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href, link.exact)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/60 ${
              active
                ? 'border-[#01aa3f]/25 bg-[#01aa3f]/[0.06] text-black shadow-sm'
                : 'border-transparent text-black/70 hover:-translate-y-0.5 hover:border-black/5 hover:bg-black/[0.03] hover:text-black hover:shadow-sm'
            }`}
          >
            <Icon
              aria-hidden="true"
              strokeWidth={2}
              className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-[#01aa3f]' : 'text-black/40 group-hover:text-black/60'}`}
            />
            {link.label}
            <span
              aria-hidden="true"
              className={`ml-auto h-1.5 w-1.5 rounded-full transition-all ${active ? 'bg-[#01aa3f]' : 'bg-transparent group-hover:bg-[#01aa3f]/40'}`}
            />
          </Link>
        )
      })}
    </nav>
  )
}
