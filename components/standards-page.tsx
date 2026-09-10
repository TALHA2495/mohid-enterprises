import Image from 'next/image'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { CertificateGallery } from './certificate-gallery'

const standardsCards = ['Yarn & Material Inspection', 'Dimensional Width Tolerance', 'Pantone Color Fastness', 'Export Packing Audit', 'Third-Party Testing & Documentation']
const certificates = [
  { title: 'Company Profile — 20 Years', image: '/certificates/company profile 20 year.jpeg' },
  { title: 'WSO Certificate of Compliance', image: '/certificates/wso certificate of compliance.jpeg' },
  { title: 'WSO Letter of Authorization', image: '/certificates/wso letter of authorization.jpeg' },
]

function DarkShell({ children }: { children: React.ReactNode }) {
  return <main className="relative min-h-screen bg-[#f4f7f8] text-black"><div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]"><Image src="/images/trims2.webp" alt="" priority fetchPriority="high" fill sizes="100vw" quality={70} className="size-full object-cover" /></div><div className="relative z-10"><SiteHeader />{children}<SiteFooter /></div></main>
}

export function StandardsPage() {
  return <DarkShell><section className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853] drop-shadow-sm">Quality & compliance</p><h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-white drop-shadow-md sm:text-5xl">Quality Commitment & Export Compliance</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/80 drop-shadow-sm">Mohid Enterprises follows documented checks across materials, production, packing, and export readiness.</p><div className="mt-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Certificates & compliance</p><CertificateGallery certificates={certificates} /></div><div className="mt-12 hidden gap-3 md:grid md:grid-cols-2">{standardsCards.map((x,i)=><article key={x} className={`rounded-xl border border-black/10 bg-white p-5 ${i === 4 ? 'sm:col-span-2' : ''}`}><h2 className="text-sm font-semibold text-black">{x}</h2><p className="mt-2 text-xs leading-5 text-black/55">Each order is reviewed against agreed specifications with traceable checks and clear documentation for procurement teams.</p></article>)}</div></section></DarkShell>
}