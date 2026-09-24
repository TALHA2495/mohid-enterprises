import { CertificateGallery } from './certificate-gallery'
import { PageShell } from './page-shell'

// ---------------------------------------------------------------------------
// /standards — the certificate gallery renders the four compliance documents
// DIRECTLY (no card body, no caption) from the ImageKit CDN (a2q8u8qtw).
// All four URLs were verified reachable; the `updatedAt` suffix is ImageKit's
// cache-busting param and composes with the house ?tr= delivery transform.
// The cards below the gallery are copy, not catalog data.
// ---------------------------------------------------------------------------

const standardsCards = ['Yarn & Material Inspection', 'Dimensional Width Tolerance', 'Pantone Color Fastness', 'Export Packing Audit', 'Third-Party Testing & Documentation']

const CERTIFICATES = [
  { title: 'OEKO-TEX Standard 100 Certification', image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/oeko-tex-standard-100-certification-mohid-enterprises.jpg.jpeg?updatedAt=1790174344574&tr=w-1200,f-auto,q-70' },
  { title: 'WSO W-TEX Standard Certificate 2026 (1)', image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/wso-wtex-standard-certificate-mohid-2026%20(1).jpeg?updatedAt=1790175929899' },
  { title: 'WSO W-TEX Standard Certificate 2026 (2)', image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/wso-wtex-standard-certificate-mohid-2026%20(2).jpeg?updatedAt=1790174345052&tr=w-1200,f-auto,q-70' },
  { title: 'WSO W-Tex 9000 Recycled Polyester Certification', image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/wso-w-tex-9000-recycled-polyester-certification-mohid.jpg.jpeg?updatedAt=1790174344912&tr=w-1200,f-auto,q-70' },
]

export function StandardsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const Heading = embedded ? 'h2' : 'h1'
  const content = (

    <section className={embedded ? 'homepage-motion-section bg-[#f7f8f5] px-5 pb-16 pt-8 text-[#101412] sm:px-8 sm:pb-20 sm:pt-10' : 'mx-auto max-w-5xl px-5 py-8 sm:px-8'}>
      <Heading className={`mt-2 text-3xl font-semibold tracking-tight ${embedded ? 'text-[#101412]' : 'text-white drop-shadow-md'} sm:text-5xl`}>Quality Commitment & Export Compliance</Heading>

      <p className={`mt-3 max-w-3xl text-sm leading-6 ${embedded ? 'text-[#46534c]' : 'text-white/80 drop-shadow-sm'}`}>Mohid Enterprises follows documented checks across materials, production, packing, and export readiness.</p>

      <div className="mt-8"><CertificateGallery certificates={CERTIFICATES} /></div>
    </section>
  )

  return embedded ? content : <PageShell>{content}</PageShell>
}
