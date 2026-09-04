import { ArrowUpRight, BadgeCheck, CircleCheck, Droplets, Factory, Layers, Package, Scissors } from 'lucide-react'

const CAPABILITIES = [
  { title: 'Global Export Expertise', description: 'Regular shipments to Turkey and Japan with complete export documentation.', image: '/images/trims2.webp' },
  { title: 'Advanced Braiding & Winding', description: 'Modern braiding, weaving and winding lines keep every trim consistent.', image: '/images/trims-bg.webp' },
  { title: 'Custom Development', description: 'Sampling-led development for custom laces, cords, tapes and tassels.', image: '/images/fringe-lace.webp' },
  { title: 'Quality Compliance', description: 'Documented checks on width, color fastness and finish for every lot.', image: '/images/woven-belt.webp' },
  { title: 'Ethical Manufacturing', description: 'Responsible production practices at our Faisalabad facility.', image: '/images/hero-yarn.webp' },
  { title: 'Logistics & Export', description: 'Export-grade packing and Incoterms handled end-to-end.', image: '/images/metal-cord.webp' },
]

const STRENGTHS = [
  'Integrated braiding & weaving lines',
  'In-house dyeing & finishing',
  'In-process quality inspection',
  '500K+ meters monthly capacity',
]

const PROCESS_STEPS = [
  { icon: Layers, label: 'Yarn Selection' },
  { icon: Factory, label: 'Braiding & Weaving' },
  { icon: Droplets, label: 'Dyeing & Finishing' },
  { icon: Scissors, label: 'Winding & Cutting' },
  { icon: BadgeCheck, label: 'Quality Assurance' },
  { icon: Package, label: 'Export Packing' },
]

export function HomeSections() {
  return (
    <div className="relative z-10 bg-[#0a0c0b]">
      <section className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00c853]">Why Mohid</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <article key={item.title} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101413]">
              <div className="aspect-[16/10] overflow-hidden bg-black/40">
                <img src={item.image} alt={item.title} className="size-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold tracking-tight text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-16 grid w-full max-w-7xl gap-6 px-4 sm:px-6 sm:mt-20 lg:grid-cols-[1fr_1.4fr] lg:gap-8">
        <div className="rounded-2xl border border-white/10 bg-[#101413] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">Manufacturing strength</h2>
          <ul className="mt-6">
            {STRENGTHS.map((item) => (
              <li key={item} className="flex items-center gap-3 border-b border-white/[0.07] py-4 text-sm text-white/80 last:border-0 last:pb-0">
                <CircleCheck className="size-[18px] shrink-0 text-[#00c853]" strokeWidth={1.6} /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00c853]">Our operation</p>
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for scale. <em className="text-[#1ada67] italic">Engineered for consistency.</em>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/60">
              Reliable production for global trims programs, from sampling through repeat manufacturing.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
              {['Consistent quality', 'Custom widths', 'Bulk production', 'Global shipping'].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                  <CircleCheck className="size-[18px] text-[#00c853]" strokeWidth={1.6} /> {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img src="/images/trims-bg.webp" alt="Mohid Enterprises manufacturing floor" className="aspect-[16/7] w-full object-cover" />
          </div>
        </div>
      </section>
      <section className="mx-auto mt-16 w-full max-w-7xl rounded-2xl border border-white/10 bg-[#101413]/40 px-4 py-12 sm:px-6 sm:mt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00c853]">From yarn to export</p>
        <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {PROCESS_STEPS.map(({ icon: Icon, label }, index) => (
            <li key={label} className="flex flex-col gap-3">
              <span className="font-mono text-[10px] text-white/35">0{index + 1}</span>
              <Icon className="size-6 text-[#00c853]" strokeWidth={1.6} />
              <span className="text-sm font-medium text-white/85">{label}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-[#101413] p-8 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="max-w-xl font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Partner with a factory that delivers <em className="text-[#1ada67] italic">consistency at scale.</em>
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Custom laces, cords, tapes and specialty trims for global procurement teams.
            </p>
          </div>
          <a
            href="/quote"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#01aa3f] px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-px hover:bg-[#00ff59]"
          >
            Request a Quote Now
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </section>
    </div>
  )
}