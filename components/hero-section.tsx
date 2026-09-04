import { ArrowUpRight } from 'lucide-react'
import { HeroStats } from './hero-stats'

export function HeroSection() {
  return (
    <section className="relative z-10 flex-1">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pt-10 pb-12 text-left sm:px-6 sm:pt-16 lg:items-center lg:text-center">
        <div className="lg:hidden">
          <p className="text-[11.5px] font-medium tracking-[0.16em] text-[#1ada67] uppercase">
            Faisalabad - Pakistan
          </p>
          <div aria-hidden="true" className="mt-2.5 h-px w-28 bg-[#1ada67]/50" />
          <p className="mt-2.5 text-[11.5px] font-medium tracking-[0.16em] text-white/50 uppercase">
            Est. 1999
          </p>
        </div>
        <p className="hidden items-center justify-center gap-2.5 text-[11.5px] font-medium tracking-[0.16em] text-[#1ada67] uppercase lg:flex">
          <span>Faisalabad</span>
          <span aria-hidden="true" className="text-[11px] text-white/30">
            -
          </span>
          <span>Pakistan</span>
          <span aria-hidden="true" className="text-[11px] text-white/30">
            -
          </span>
          <span>Est. 1999</span>
        </p>

        <h1 className="mt-6 font-[family-name:var(--font-fraunces)] text-[clamp(52px,6vw,88px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-white">
          Textile trims,
          <br />
          <em className="text-[#1ada67] italic">made</em> for scale.
        </h1>

        <p className="mt-6 max-w-[36ch] text-base font-light leading-[1.5] text-white/65">
          Custom laces, cords, tapes and specialty trims for global procurement
          teams.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/quote"
            className="inline-flex items-center gap-2 rounded-full bg-[#01aa3f] px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-px hover:bg-[#00ff59]"
          >
            Start an RFQ
            <ArrowUpRight className="size-4" />
          </a>
          <a
            href="/showroom"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm text-white transition-colors hover:border-white/55 hover:bg-white/[0.06]"
          >
            Explore showroom
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <HeroStats />
      </div>
    </section>
  )
}
