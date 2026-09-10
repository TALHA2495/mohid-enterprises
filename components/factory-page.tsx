import Image from 'next/image'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

const factoryCards = [
  { title: '500k+ Meters / Month Capacity', image: '/factory webp images/textile production.webp' },
  { title: 'Material Range', image: '/factory webp images/Ethical Manufacturing.webp' },
  { title: 'Size & Width Tolerances', image: '/factory webp images/Braiding %26 Winding.webp' },
  { title: 'Quality Inspection Protocol', image: '/factory webp images/trims quality inspection.webp' },
  { title: 'Export Packaging', image: '/factory webp images/global export.webp' },
  { title: 'Incoterms & Logistics', image: '/factory webp images/Logistics %26 Export.webp' },
]

function DarkShell({ children }: { children: React.ReactNode }) {
  return <main className="relative min-h-screen bg-[#f4f7f8] text-black"><div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]"><Image src="/images/trims2.webp" alt="" priority fetchPriority="high" fill sizes="100vw" quality={70} className="size-full object-cover" /></div><div className="relative z-10"><SiteHeader />{children}<SiteFooter /></div></main>
}

export function FactoryPage() {
  return <DarkShell><section className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853] drop-shadow-sm">Our operation</p><h1 className="mt-2 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-white drop-shadow-md sm:text-5xl">Faisalabad Manufacturing Base & Capacity</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 drop-shadow-sm">Reliable production for global trims programs, from sampling through repeat manufacturing.</p><div className="mt-8 grid gap-3 md:grid-cols-3">{['/factory webp images/textile production.webp','/factory webp images/Braiding %26 Winding.webp','/factory webp images/packed inventory.webp'].map((src,i)=><div key={i} className="relative aspect-[1.55] overflow-hidden rounded-xl border border-black/10"><Image src={src} alt="Textile manufacturing detail" fill quality={70} sizes="(min-width: 768px) 33vw, 100vw" className="size-full object-cover" /><span className="absolute bottom-3 left-3 text-xs font-medium text-white">{['Material preparation','Production floor','Packed inventory'][i]}</span></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{factoryCards.filter(c=>!['500k+ Meters / Month Capacity','Material Range','Size & Width Tolerances'].includes(c.title)).map((x)=><article key={x.title} className="relative overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="relative aspect-[16/10] overflow-hidden bg-black/5"><Image src={x.image} alt={x.title} fill loading="lazy" quality={70} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="size-full object-cover" /></div><div className="p-4"><h2 className="text-sm font-semibold text-black">{x.title}</h2><p className="mt-2 text-xs leading-5 text-black/55">Consistent processes, clear specifications, and dependable communication for every order.</p></div></article>)}</div></section></DarkShell>
}