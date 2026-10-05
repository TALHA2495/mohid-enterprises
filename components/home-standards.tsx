import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CertificateGallery } from '@/components/certificate-gallery'

const CERTIFICATES = [
  {
    title: 'OEKO-TEX Standard 100 Certification',
    image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/oeko-tex-standard-100-certification-mohid-enterprises.jpg.jpeg?updatedAt=1790174344574&tr=w-1200,f-auto,q-70',
  },
]

// Homepage standards strip. Minimal by design: one headline, one certificate and
// a single link to the full certifications page. The long CTA panel and repeated
// compliance claims were removed in the UI redesign.
export function HomeStandardsSection() {
  return (
    <section aria-labelledby="home-standards-heading" className="relative border-t border-[#101412]/10 bg-[#f7f8f5] py-16 sm:py-20 md:py-24">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-12 lg:px-20 xl:px-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0a7d31] sm:text-xs">Verified compliance</p>
        <h2 id="home-standards-heading" className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-[#101412] sm:text-4xl md:text-5xl">
          Certified quality
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#46534c]">
          Manufactured to international textile standards.
        </p>

        <div className="mt-10">
          <CertificateGallery certificates={CERTIFICATES} single />
        </div>

        <div className="mt-10">
          <Link href="/standards" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#101412]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#101412] transition-colors hover:border-[#101412]/50 hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5]">
            View all certifications <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}