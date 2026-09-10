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
          <p className="mt-2.5 text-[11.5px] font-medium tracking-[0.16em] text-white/80 drop-shadow-sm uppercase">
            Est. 1999
          </p>
        </div>
        <p className="hidden items-center justify-center gap-2.5 text-[11.5px] font-medium tracking-[0.16em] text-[#1ada67] uppercase lg:flex">
          <span>Faisalabad</span>
          <span aria-hidden="true" className="text-[11px] text-white/60 drop-shadow-sm">
            -
          </span>
          <span>Pakistan</span>
          <span aria-hidden="true" className="text-[11px] text-white/60 drop-shadow-sm">
            -
          </span>
          <span>Est. 1999</span>
        </p>

        <h1 className="mt-6 font-[family-name:var(--font-fraunces)] text-[clamp(52px,6vw,88px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-white drop-shadow-md">
          Textile trims,
          <br />
          <em className="text-[#1ada67] italic">made</em> for scale.
        </h1>

        <p className="mt-6 max-w-[36ch] text-base font-light leading-[1.5] text-white/80 drop-shadow-sm">
          Custom laces, cords, tapes and specialty trims for global procurement
          teams.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href="/showroom"
            className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/60 px-4 py-3 text-[13px] text-white drop-shadow-md transition-colors hover:border-white/80 hover:bg-white/10 sm:flex-initial sm:gap-2 sm:px-7 sm:py-3.5 sm:text-sm"
          >
            Showroom
            <ArrowUpRight className="size-3.5 sm:size-4" />
          </a>
          <a
            href="/quote"
            className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#01aa3f] px-4 py-3 text-[13px] font-medium text-white transition-all hover:-translate-y-px hover:bg-[#00ff59] sm:flex-initial sm:gap-2 sm:px-7 sm:py-3.5 sm:text-sm"
          >
            Start an RFQ
            <ArrowUpRight className="size-3.5 sm:size-4" />
          </a>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <HeroStats />
      </div>
    </section>
  )
}
