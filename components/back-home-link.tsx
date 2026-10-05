import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Shared "Back to Home" affordance for the public sub-pages (showroom, factory,
// standards). Deliberately medium and visible, per the minimal redesign.
export function BackHomeLink() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#0a7d31] underline-offset-4 transition-colors hover:text-[#101412] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5] sm:text-base"
    >
      <ArrowLeft className="size-4 sm:size-5" aria-hidden="true" />
      Back to Home
    </Link>
  )
}