import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

const factoryCards = ['500k+ Meters / Month Capacity', 'Material Range', 'Size & Width Tolerances', 'Quality Inspection Protocol', 'Export Packaging', 'Incoterms & Logistics']
const standardsCards = ['Yarn & Material Inspection', 'Dimensional Width Tolerance', 'Pantone Color Fastness', 'Export Packing Audit', 'Third-Party Testing & Documentation']

function DarkShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#0a0c0b] text-white"><SiteHeader />{children}<SiteFooter /></main>
}

export function FactoryPage() {
  return <DarkShell><section className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Our operation</p><h1 className="mt-2 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight sm:text-5xl">Faisalabad Manufacturing Base & Capacity</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Reliable production for global trims programs, from sampling through repeat manufacturing.</p><div className="mt-8 grid gap-3 md:grid-cols-3">{['/images/trims-bg.webp','/images/trims-bg.webp','/images/trims-bg.webp'].map((src,i)=><div key={i} className="relative aspect-[1.55] overflow-hidden rounded-xl border border-white/10"><img src={src} alt="Textile manufacturing detail" className="size-full object-cover" /><span className="absolute bottom-3 left-3 text-xs font-medium text-white">{['Material preparation','Production floor','Packed inventory'][i]}</span></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{factoryCards.map((x)=><article key={x} className="rounded-xl border border-white/10 bg-[#101413] p-4"><h2 className="text-sm font-semibold text-white">{x}</h2><p className="mt-2 text-xs leading-5 text-white/55">Consistent processes, clear specifications, and dependable communication for every order.</p></article>)}</div></section></DarkShell>
}

export function StandardsPage() {
  return <DarkShell><section className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853]">Quality & compliance</p><h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight sm:text-5xl">Quality Commitment & Export Compliance</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">Mohid Enterprises follows documented checks across materials, production, packing, and export readiness.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{standardsCards.map((x,i)=><article key={x} className={`rounded-xl border border-white/10 bg-[#101413] p-5 ${i === 4 ? 'sm:col-span-2' : ''}`}><h2 className="text-sm font-semibold text-white">{x}</h2><p className="mt-2 text-xs leading-5 text-white/55">Each order is reviewed against agreed specifications with traceable checks and clear documentation for procurement teams.</p></article>)}</div></section></DarkShell>
}
