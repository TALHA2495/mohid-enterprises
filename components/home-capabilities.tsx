const CAPABILITIES = [
  {
    title: 'Woven & Braided Trims',
    desc: 'Narrow fabrics, laces, cords, elastics and tapes made to your required width and finish.',
  },
  {
    title: 'Custom Specs & Colours',
    desc: 'Pantone colour matching, custom widths and special finishing on request.',
  },
  {
    title: 'Bulk & Export Ready',
    desc: 'Sampling to bulk volume, packed and documented for international shipping.',
  },
] as const

// Homepage capabilities strip. Deliberately minimal: three plain cards, no
// machine counts, output figures or capacity claims (removed in the UI redesign).
export function HomeCapabilitiesSection() {
  return (
    <section aria-labelledby="home-capabilities-heading" className="relative border-t border-[#101412]/10 bg-[#f4f7f8] py-16 sm:py-20 md:py-24">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-12 lg:px-20 xl:px-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0a7d31] sm:text-xs">What we do</p>
        <h2 id="home-capabilities-heading" className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-[#101412] sm:text-4xl md:text-5xl">
          Trims built for real production runs
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[#101412]/10 bg-white p-6 sm:p-8">
              <h3 className="text-xl font-bold tracking-tight text-[#101412]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#46534c] sm:text-base">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}