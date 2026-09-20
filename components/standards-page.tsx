import { CertificateGallery } from './certificate-gallery'
import { PageShell } from './page-shell'
import { loadCertificates } from '@/lib/public-data.server'

// ---------------------------------------------------------------------------
// /standards — the certificate gallery is DB-driven (`certificates` via
// lib/public-data.server.ts). The cards below it are copy, not catalog data.
//
// FALLBACK_CERTIFICATES covers an unconfigured/empty `certificates` table; the
// URLs point at the live ImageKit account (a2q8u8qtw) and were verified
// reachable. File names contain spaces, hence the %20 encoding.
// ---------------------------------------------------------------------------

const standardsCards = ['Yarn & Material Inspection', 'Dimensional Width Tolerance', 'Pantone Color Fastness', 'Export Packing Audit', 'Third-Party Testing & Documentation']

const FALLBACK_CERTIFICATES = [
  { title: 'Company Profile — 20 Years', image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/company%20profile%2020%20year.jpeg?tr=w-1200,q-75' },
  { title: 'WSO Certificate of Compliance', image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/wso%20certificate%20of%20compliance.jpeg?tr=w-1200,q-75' },
  { title: 'WSO Letter of Authorization', image: 'https://ik.imagekit.io/a2q8u8qtw/certificates/wso%20letter%20of%20authorization.jpeg?tr=w-1200,q-75' },
]

/** Thumbnail transform for live rows; a stored URL may already carry one. */
const THUMB_TRANSFORM = '?tr=w-1200,q-75'

export async function StandardsPage() {
  const live = await loadCertificates()
  const certificates = live.length > 0
    ? live.map((row) => ({
        title: row.title,
        image: row.imageUrl.includes('?') ? row.imageUrl : `${row.imageUrl}${THUMB_TRANSFORM}`,
      }))
    : FALLBACK_CERTIFICATES

  return <PageShell><section className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853] drop-shadow-sm">Quality & compliance</p><h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-white drop-shadow-md sm:text-5xl">Quality Commitment & Export Compliance</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/80 drop-shadow-sm">Mohid Enterprises follows documented checks across materials, production, packing, and export readiness.</p><div className="mt-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Certificates & compliance</p><CertificateGallery certificates={certificates} /></div><div className="mt-12 grid gap-3 md:grid-cols-2">{standardsCards.map((x,i)=><article key={x} className={`rounded-xl border border-black/10 bg-white p-5 ${i === 4 ? 'md:col-span-2' : ''}`}><div className="flex items-center gap-2.5"><span aria-hidden="true" className="font-mono text-[10px] text-[#00c853]">{String(i + 1).padStart(2, '0')}</span><h2 className="text-sm font-semibold text-black">{x}</h2></div><p className="mt-2 text-xs leading-5 text-black/55">Each order is reviewed against agreed specifications with traceable checks and clear documentation for procurement teams.</p></article>)}</div></section></PageShell>
}
