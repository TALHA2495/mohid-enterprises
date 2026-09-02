import { ArrowRight } from 'lucide-react'
import { HeroStats } from './hero-stats'

export function HeroSection() {
  return (
    <section className="relative z-10 flex-1">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-10 pb-12 text-center sm:px-6 sm:pt-16">
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
          Faisalabad · Pakistan · Est. 1999
        </p>

        <h1 className="mt-6 font-serif text-5xl leading-[1.05] font-bold tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
          Textile trims, <em className="text-emerald-400 italic">made</em> for
          scale.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60 text-pretty sm:text-lg">
          A trusted manufacturing partner. Custom laces, cords, tapes and
          specialty trims engineered in Faisalabad for global procurement teams.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="/quote"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
          >
            Start an RFQ
            <ArrowRight className="size-4" />
          </a>
          <a
            href="/showroom"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Explore showroom
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <HeroStats />
      </div>
    </section>
  )
}
