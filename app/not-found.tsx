import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { siteNavLinks } from '@/lib/navigation'

// Branded site-wide 404. Previously only /admin had one, so a bad public URL
// rendered Next's default white page. Full shell keeps navigation + SEO.
export default function NotFound() {
  return (
    <main id="main" className="relative min-h-screen bg-[#f4f7f8] text-black">
      <SiteHeader />
      <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#0a7d31]">404 — page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          This page took a wrong turn
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-black/60">
          The link may be outdated. Browse the showroom, or head back home — the full catalog is one click away.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#01aa3f] px-6 py-3 text-sm font-medium text-[#07120b] transition-colors hover:bg-[#00be48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2"
          >
            Back to home
          </Link>
          <Link
            href="/showroom"
            className="inline-flex items-center justify-center rounded-full border border-[#101412]/20 px-6 py-3 text-sm text-[#101412] transition-colors hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2"
          >
            Open the showroom
          </Link>
        </div>
        <nav aria-label="All pages" className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-black/60">
          {siteNavLinks.map(([label, href]) => (
            <Link key={href} href={href} className="transition-colors hover:text-[#0a7d31]">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <SiteFooter />
    </main>
  )
}
