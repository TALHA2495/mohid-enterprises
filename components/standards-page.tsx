import Image from 'next/image'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { CertificateGallery } from './certificate-gallery'

const standardsCards = ['Yarn & Material Inspection', 'Dimensional Width Tolerance', 'Pantone Color Fastness', 'Export Packing Audit', 'Third-Party Testing & Documentation']
const certificates = [
  { title: 'Company Profile — 20 Years', image: 'https://ik.imagekit.io/wavawecyl/certificates/company%20profile%2020%20year.jpeg?updatedAt=1788845951259&tr=w-1200,q-75' },
  { title: 'WSO Certificate of Compliance', image: 'https://ik.imagekit.io/wavawecyl/certificates/wso%20certificate%20of%20compliance.jpeg?updatedAt=1788845951371&tr=w-1200,q-75' },
  { title: 'WSO Letter of Authorization', image: 'https://ik.imagekit.io/wavawecyl/certificates/wso%20letter%20of%20authorization.jpeg?updatedAt=1788845951255&tr=w-1200,q-75' },
]

function DarkShell({ children }: { children: React.ReactNode }) {
  return <main className="relative min-h-screen bg-[#0a0c0b] text-white"><div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]"><Image src="/images/trims2.webp" alt="" priority fetchPriority="high" fill sizes="100vw" quality={70} className="size-full object-cover" /><div className="absolute inset-0 bg-black/40" /><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#0a0c0b]" /></div><div className="relative z-10"><SiteHeader />{children}<SiteFooter /></div></main>
}

export function StandardsPage() {
  return <DarkShell><section className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Quality & compliance</p><h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight sm:text-5xl">Quality Commitment & Export Compliance</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">Mohid Enterprises follows documented checks across materials, production, packing, and export readiness.</p><div className="mt-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Certificates & compliance</p><CertificateGallery certificates={certificates} /></div><div className="mt-12 hidden gap-3 md:grid md:grid-cols-2">{standardsCards.map((x,i)=><article key={x} className={`rounded-xl border border-white/10 bg-[#101413] p-5 ${i === 4 ? 'sm:col-span-2' : ''}`}><h2 className="text-sm font-semibold text-white">{x}</h2><p className="mt-2 text-xs leading-5 text-white/55">Each order is reviewed against agreed specifications with traceable checks and clear documentation for procurement teams.</p></article>)}</div></section></DarkShell>
}