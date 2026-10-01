import Link from 'next/link'
import { ArrowUpRight, Award, CheckCircle2 } from 'lucide-react'
import { CertificateGallery } from '@/components/certificate-gallery'

const CERTIFICATES = [
  {
    title: 'OEKO-TEX Standard 100 Certification',
    image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/oeko-tex-standard-100-certification-mohid-enterprises.jpg.jpeg?updatedAt=1790174344574&tr=w-1200,f-auto,q-70',
  },
  {
    title: 'WSO W-TEX Standard Certificate 2026 (1)',
    image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/wso-wtex-standard-certificate-mohid-2026%20(1).jpeg?updatedAt=1790175929899',
  },
  {
    title: 'WSO W-TEX Standard Certificate 2026 (2)',
    image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/wso-wtex-standard-certificate-mohid-2026%20(2).jpeg?updatedAt=1790174345052&tr=w-1200,f-auto,q-70',
  },
  {
    title: 'WSO W-Tex 9000 Recycled Polyester Certification',
    image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/wso-w-tex-9000-recycled-polyester-certification-mohid.jpg.jpeg?updatedAt=1790174344912&tr=w-1200,f-auto,q-70',
  },
]

export function HomeStandardsSection() {
  return (
    <section aria-labelledby="home-standards-heading" className="relative border-t border-[#101412]/10 bg-[#f7f8f5] py-16 sm:py-20 md:py-24">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-12 lg:px-20 xl:px-24">
        <div className="flex flex-col justify-between gap-4 border-b border-[#101412]/10 pb-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0a7d31] sm:text-xs">
              <Award className="size-4 text-[#01aa3f]" aria-hidden="true" />
              Verified Compliance &amp; Credentials
            </p>
            <h2 id="home-standards-heading" className="mt-3 text-3xl font-extrabold tracking-tight text-[#101412] sm:text-4xl md:text-5xl">
              Certified Quality Standards
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#46534c]">
              Our manufacturing protocols comply with international textile standards. Click any certificate to inspect full compliance documentation and testing validity.
            </p>
          </div>
          <Link
            href="/standards"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#101412]/20 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101412] transition-colors hover:border-[#101412]/50 hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2"
          >
            All Certifications <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        <div className="mt-10">
          {/* Home previews only the first certificate (OEKO-TEX); the remaining documents live on /standards. */}
          <CertificateGallery certificates={CERTIFICATES.slice(0, 1)} single={false} />
        </div>

        <div className="mt-16 sm:mt-20 rounded-3xl border border-[#101412]/12 bg-gradient-to-b from-white to-[#f4f7f8] p-8 sm:p-12 lg:p-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#01aa3f]/10 px-4 py-1.5 text-xs font-bold text-[#0a7d31]">
            <CheckCircle2 className="size-4" aria-hidden="true" /> Ready for Production &amp; Sampling
          </span>
          <h3 className="mt-5 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#101412] max-w-2xl mx-auto">
            Need Custom Spec Trims Or Bulk Volume Supply?
          </h3>
          <p className="mt-3 text-sm sm:text-base text-[#46534c] max-w-xl mx-auto">
            Send your design specifications, pantone codes, or target yardage. Our Faisalabad team provides rapid turnarounds and direct WhatsApp quoting.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex w-full sm:w-auto min-h-12 items-center justify-center gap-2 rounded-full bg-[#01aa3f] px-8 py-3 text-sm font-bold text-[#07120b] shadow-[0_6px_18px_rgba(1,170,63,0.18)] transition-colors hover:bg-[#00be48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5]"
            >
              Request a Custom Quote <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/showroom"
              className="inline-flex w-full sm:w-auto min-h-12 items-center justify-center gap-2 rounded-full border border-[#101412]/25 bg-white px-8 py-3 text-sm font-semibold text-[#101412] transition-colors hover:border-[#101412]/50 hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5]"
            >
              Explore Full Showroom <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
