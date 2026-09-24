import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const LANDSCAPE_IMAGE =
  'https://ik.imagekit.io/a2q8u8qtw/Hero/Textile%20Trims%20Manufacturing.jpg'
const MOBILE_IMAGE =
  'https://ik.imagekit.io/a2q8u8qtw/Hero/Trims%20Manufacturing.jpg'

const credibility = [
  'Quality-Focused Production',
  'Local & International Markets',
  'Export Experience',
] as const

export function HeroSection() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate flex min-h-[calc(100svh-5.25rem)] items-end overflow-hidden bg-[#101412] text-white md:min-h-[calc(100svh-4.375rem)]"
    >
      <Image
        src={MOBILE_IMAGE}
        alt="Textile trim manufacturing floor with machinery, material rolls, and production workers"
        fill
        priority
        quality={88}
        sizes="(max-width: 767px) 100vw, 0px"
        className="-z-20 size-full object-cover object-[52%_center] md:hidden"
      />
      <Image
        src={LANDSCAPE_IMAGE}
        alt="Textile trim manufacturing floor with machinery, material rolls, and production workers"
        fill
        quality={90}
        sizes="(min-width: 768px) 100vw, 0px"
        className="-z-20 hidden size-full object-cover object-[62%_center] md:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,9,7,0.12)_0%,rgba(4,9,7,0.32)_36%,rgba(4,9,7,0.88)_100%)] md:bg-[linear-gradient(90deg,rgba(3,8,6,0.88)_0%,rgba(3,8,6,0.66)_38%,rgba(3,8,6,0.18)_72%,rgba(3,8,6,0.08)_100%)]"
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-5 pt-6 pb-8 sm:px-8 sm:pb-10 md:px-12 md:pt-5 md:pb-12 lg:px-20 lg:pb-14 xl:px-24">
        <div className="max-w-5xl md:max-w-[760px] lg:max-w-[820px]">
          <p className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white sm:text-xs">
            <span aria-hidden="true" className="h-px w-8 bg-[#01aa3f]" />
            Mohid Enterprises
          </p>
          <h1 id="home-hero-title" className="font-sans text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.32)]">
            <span className="block text-[clamp(4.25rem,17vw,6.5rem)] font-[850] leading-[0.74] tracking-[-0.085em] sm:text-[clamp(5.5rem,15vw,7.5rem)] md:text-[clamp(4.75rem,10vw,7rem)]">
              20+
              <span className="ml-[0.16em] text-[0.5em] font-extrabold tracking-[-0.055em]">YEARS</span>
            </span>
            <span className="mt-3 block max-w-[720px] text-[clamp(0.78rem,2.3vw,1.15rem)] font-bold uppercase leading-[1.2] tracking-[0.14em] sm:mt-4 md:text-xl">
              Of manufacturing experience
            </span>
          </h1>
          <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-white/85 sm:mt-6 sm:text-base md:max-w-md md:text-lg">
            Textile trims manufactured in Faisalabad, Pakistan for local and international buyers.
          </p>
          <ul
            aria-label="Manufacturing credentials"
            className="mt-5 grid max-w-[700px] grid-cols-1 gap-x-5 gap-y-2 border-y border-white/20 py-3 text-[11px] font-medium uppercase leading-relaxed tracking-[0.08em] text-white/75 sm:grid-cols-2 sm:text-xs md:mt-7 md:grid-cols-3 md:py-4"
          >
            {credibility.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-[#01aa3f]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3 min-[430px]:flex-row md:mt-7">
            <Link
              href="/quote"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#01aa3f] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-colors hover:bg-[#00be48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101412] active:bg-[#009637] min-[430px]:min-w-48"
            >
              Request a Quote <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/showroom"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/65 bg-black/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101412] active:bg-white/15 min-[430px]:min-w-48"
            >
              Explore Products <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
