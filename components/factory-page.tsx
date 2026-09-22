import Image from 'next/image'
import { PageShell } from './page-shell'
import { loadFactorySections } from '@/lib/public-data.server'
import type { FactorySection } from '@/lib/public-data.server'

// ---------------------------------------------------------------------------
// /factory — the photo grid and capability cards are DB-driven
// (`factory_sections` via lib/public-data.server.ts). Each row is either
// kind='hero' (the three full-bleed tiles) or kind='card' (the three white
// cards); sort_order decides the running order.
//
// The FALLBACK_* arrays below are the local tiles this page shipped before the
// photography moved to the ImageKit CDN. They render only when Supabase is
// unconfigured, the table is missing, or no rows are published for that kind —
// so the page never degrades to an empty grid.
// ---------------------------------------------------------------------------

// Fallback content — the SAME ImageKit URLs the seed writes to
// `factory_sections`, so the page looks identical whether the rows come from
// Supabase or not. (The old local paths, /factory webp images/..., no longer
// exist: that folder was renamed to /factory.)
const CDN = 'https://ik.imagekit.io/a2q8u8qtw/factory'

const FALLBACK_HERO: FactorySection[] = [
  { id: 'fallback-hero-1', kind: 'hero', title: 'Material preparation', subtitle: null, imageUrl: `${CDN}/textile%20production.webp`, sortOrder: 10 },
  { id: 'fallback-hero-2', kind: 'hero', title: 'Production floor', subtitle: null, imageUrl: `${CDN}/Braiding%20Winding.webp`, sortOrder: 20 },
  { id: 'fallback-hero-3', kind: 'hero', title: 'Packed inventory', subtitle: null, imageUrl: `${CDN}/packed%20inventory.png`, sortOrder: 30 },
]

const FALLBACK_CARDS: FactorySection[] = [
  { id: 'fallback-card-1', kind: 'card', title: 'Quality Inspection Protocol', subtitle: null, imageUrl: `${CDN}/quality%20inspection.webp`, sortOrder: 10 },
  { id: 'fallback-card-2', kind: 'card', title: 'Export Packaging', subtitle: null, imageUrl: `${CDN}/global_export.webp`, sortOrder: 20 },
  // NOTE: '&' stays RAW — %26 is a 404 on this CDN.
  { id: 'fallback-card-3', kind: 'card', title: 'Incoterms & Logistics', subtitle: null, imageUrl: `${CDN}/Logistics%20&%20Export.png`, sortOrder: 30 },
]

// Body copy for the capability cards. Published rows may override it per card
// with their own `subtitle`.
const CARD_BODY = 'Consistent processes, clear specifications, and dependable communication for every order.'

/** Published rows for a kind, or the shipped tiles when none are published. */
function pickKind(sections: FactorySection[], kind: FactorySection['kind'], fallback: FactorySection[]): FactorySection[] {
  const rows = sections.filter((section) => section.kind === kind)
  return rows.length > 0 ? rows : fallback
}

export async function FactoryPage() {
  const sections = await loadFactorySections()
  const heroes = pickKind(sections, 'hero', FALLBACK_HERO)
  const cards = pickKind(sections, 'card', FALLBACK_CARDS)

  return <PageShell><section className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#00c853] drop-shadow-sm">Our operation</p><h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white drop-shadow-md sm:text-5xl">Faisalabad Manufacturing Base & Capacity</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 drop-shadow-sm">Reliable production for global trims programs, from sampling through repeat manufacturing.</p><div className="mt-8 grid gap-3 md:grid-cols-3">{heroes.map((x)=><div key={x.id} className="relative aspect-[1.55] overflow-hidden rounded-xl border border-black/10"><Image src={x.imageUrl} alt="Textile manufacturing detail" fill quality={70} sizes="(min-width: 768px) 33vw, 100vw" className="size-full object-cover" /><span className="absolute bottom-3 left-3 text-xs font-medium text-white drop-shadow-sm">{x.title}</span></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cards.map((x)=><article key={x.id} className="relative overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="relative aspect-[16/10] overflow-hidden bg-black/5"><Image src={x.imageUrl} alt={x.title} fill loading="lazy" quality={70} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="size-full object-cover" /></div><div className="p-4"><h2 className="text-sm font-semibold text-black">{x.title}</h2><p className="mt-2 text-xs leading-5 text-black/55">{x.subtitle ?? CARD_BODY}</p></div></article>)}</div></section></PageShell>
}
