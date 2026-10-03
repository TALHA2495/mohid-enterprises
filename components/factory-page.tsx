import Image from 'next/image'
import { PageShell } from './page-shell'
import { BackHomeLink } from './back-home-link'
import { loadFactorySections } from '@/lib/public-data.server'
import type { FactorySection } from '@/lib/public-data.server'

// /factory — minimal by design. The three DB-driven photo tiles answer the two
// questions bulk buyers ask (what do you make / can you scale) without the former
// Production Capacity block (output, workforce, equipment, logistics), which was
// removed in the UI redesign. Tiles stay DB-driven via factory_sections (kind=hero).
const CDN = 'https://ik.imagekit.io/a2q8u8qtw/factory'

const FALLBACK_HERO: FactorySection[] = [
  { id: 'fallback-hero-1', kind: 'hero', title: 'Textile Trims', subtitle: null, imageUrl: `${CDN}/textile%20production.webp`, sortOrder: 10 },
  { id: 'fallback-hero-2', kind: 'hero', title: 'Braids & Cords', subtitle: null, imageUrl: `${CDN}/Braiding%20Winding.webp`, sortOrder: 20 },
  { id: 'fallback-hero-3', kind: 'hero', title: 'Packed for Export', subtitle: null, imageUrl: `${CDN}/packed%20inventory.png`, sortOrder: 30 },
]

function pickHeroes(sections: FactorySection[]): FactorySection[] {
  const rows = sections.filter((section) => section.kind === 'hero')
  return rows.length > 0 ? rows : FALLBACK_HERO
}

export async function FactoryPage({ embedded = false }: { embedded?: boolean } = {}) {
  const heroes = pickHeroes(await loadFactorySections())
  const Heading = embedded ? 'h2' : 'h1'

  const content = (
    <section className={embedded ? 'homepage-motion-section border-t border-[#101412]/10 bg-[#f7f8f5] px-5 pb-16 pt-8 text-[#101412] sm:px-8 sm:pb-20 sm:pt-10' : 'mx-auto max-w-7xl px-5 py-8 text-[#101412] sm:px-8'}>
      {!embedded && <BackHomeLink />}
      <Heading className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-[#101412] sm:text-5xl">
        {embedded ? 'Sampling to Bulk Production' : '20+ Years of Proven Trims Manufacturing'}
      </Heading>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#46534c]">From sampling to bulk production: ribbons, tassels, elastic, jute cord, conveyor belts, and more.</p>

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        {heroes.map((tile) => (
          <figure key={tile.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#101412]/12">
            <Image src={tile.imageUrl} alt={`${tile.title} manufacturing at Mohid Enterprises`} fill loading="lazy" quality={70} sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 92vw" className="size-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 text-xs font-medium text-white drop-shadow-md">{tile.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )

  return embedded ? content : <PageShell>{content}</PageShell>
}