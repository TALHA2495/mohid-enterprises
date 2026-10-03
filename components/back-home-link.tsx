import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Shared "Back to Home" affordance for the public sub-pages (showroom, factory,
// standards). Deliberately medium and visible, per the minimal redesign.
export function BackHomeLink() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#101412]/15 bg-white px-4 py-2 text-sm font-medium text-[#101412] transition-colors hover:border-[#101412]/35 hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5] sm:text-base"
    >
      <ArrowLeft className="size-4 sm:size-5" aria-hidden="true" />
      Back to Home
    </Link>
  )
}