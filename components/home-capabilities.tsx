import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Factory, Gauge, Users, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { factoryCapacity } from '@/lib/factory-capacity'

const QUALITY_PILLARS = [
  { title: 'Yarn & Material Inspection', desc: 'Raw tensile testing and fiber purity checks before loom staging.' },
  { title: 'Dimensional Width Tolerance', desc: 'Calibrated ±0.5mm precision across elastic and non-elastic webbings.' },
  { title: 'Pantone Color Fastness', desc: 'Grade 4+ lab-verified wash, friction, and UV stability compliance.' },
  { title: 'Export Packing Audit', desc: 'Moisture-sealed carton packaging with verifiable lot barcode traceability.' },
]

export function HomeCapabilitiesSection() {
  return (
    <section aria-labelledby="home-capabilities-heading" className="relative bg-[#f4f7f8] py-16 sm:py-20 md:py-24">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-12 lg:px-20 xl:px-24">
        <div className="flex flex-col justify-between gap-4 border-b border-[#101412]/10 pb-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0a7d31] sm:text-xs">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#01aa3f]" />
              Industrial Manufacturing Facility
            </p>
            <h2 id="home-capabilities-heading" className="mt-3 text-3xl font-extrabold tracking-tight text-[#101412] sm:text-4xl md:text-5xl">
              Engineered For Bulk Scale &amp; Precision
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#46534c]">
              Operating from Faisalabad, Pakistan—the textile capital of South Asia. We run dedicated multi-spindle braiding, automated narrow weaving, and rigorous in-house quality inspection.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/factory"
              className="inline-flex items-center gap-2 rounded-full border border-[#101412]/20 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101412] transition-colors hover:border-[#101412]/50 hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2"
            >
              Tour Factory <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:grid-flow-dense">
          <div className="group relative overflow-hidden rounded-2xl border border-[#101412]/10 bg-white p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between min-h-[360px] sm:min-h-[420px]">
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#01aa3f]/10 px-3 py-1 text-xs font-semibold text-[#0a7d31]">
                <Factory className="size-3.5" aria-hidden="true" /> High-Speed Looms &amp; Braiders
              </span>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-[#101412] sm:text-3xl">
                Custom Trims, Cords &amp; Elastic Webbing
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#46534c] sm:text-base">
                From 2mm micro-cords to 120mm industrial webbing, we supply leading garment exporters, apparel houses, and technical equipment manufacturers.
              </p>
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 pt-6 border-t border-[#101412]/10 text-xs">
              <div className="rounded-xl bg-[#f7f8f5] p-3 border border-[#101412]/5">
                <span className="text-[#46534c] block font-medium">Daily Output</span>
                <span className="text-[#101412] font-bold text-sm sm:text-base tabular-nums mt-0.5 block">{factoryCapacity.production.dailyOutput}</span>
              </div>
              <div className="rounded-xl bg-[#f7f8f5] p-3 border border-[#101412]/5">
                <span className="text-[#46534c] block font-medium">Lead Time</span>
                <span className="text-[#101412] font-bold text-sm sm:text-base mt-0.5 block">{factoryCapacity.production.standardLeadTime}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#f7f8f5] p-3 border border-[#101412]/5">
                <span className="text-[#46534c] block font-medium">Min Order (MOQ)</span>
                <span className="text-[#101412] font-bold text-sm sm:text-base tabular-nums mt-0.5 block">{factoryCapacity.production.minOrderQuantity} meters</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#101412]/10 bg-white p-6 sm:p-7 lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#101412]/5 px-3 py-1 text-xs font-semibold text-[#101412]">
                  <Gauge className="size-3.5 text-[#0a7d31]" aria-hidden="true" /> Machinery Fleet
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#46534c]">Maintained</span>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-[#101412]">
                Industrial Production Line
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-[#46534c]">
                <li className="flex items-center justify-between rounded-lg bg-[#f7f8f5] px-3.5 py-2.5 border border-[#101412]/5">
                  <span className="font-medium text-[#101412]">Braiding Capacity</span>
                  <span className="font-semibold text-[#0a7d31]">{factoryCapacity.equipment.braiding}</span>
                </li>
                <li className="flex items-center justify-between rounded-lg bg-[#f7f8f5] px-3.5 py-2.5 border border-[#101412]/5">
                  <span className="font-medium text-[#101412]">Weaving Capacity</span>
                  <span className="font-semibold text-[#0a7d31]">{factoryCapacity.equipment.weaving}</span>
                </li>
                <li className="flex items-center justify-between rounded-lg bg-[#f7f8f5] px-3.5 py-2.5 border border-[#101412]/5">
                  <span className="font-medium text-[#101412]">Packaging Lines</span>
                  <span className="font-semibold text-[#0a7d31]">{factoryCapacity.equipment.packaging}</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#101412]/10 flex items-center justify-between text-xs text-[#46534c]">
              <span className="flex items-center gap-1.5 font-medium"><Users className="size-4 text-[#0a7d31]" /> {factoryCapacity.workforce.teamSize}</span>
              <span className="font-semibold text-[#101412]">{factoryCapacity.workforce.expertise.join(' • ')}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#101412]/10 bg-white p-6 sm:p-7 lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#101412]/5 px-3 py-1 text-xs font-semibold text-[#101412]">
                <Truck className="size-3.5 text-[#0a7d31]" aria-hidden="true" /> Export Delivery
              </span>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-[#101412]">
                Global Shipping &amp; Incoterms
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#46534c]">
                Experienced exporter supplying domestic brands and direct international shipments worldwide via air and sea freight.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {factoryCapacity.logistics.incoterms.map((term) => (
                  <span key={term} className="rounded-md border border-[#101412]/10 bg-[#f7f8f5] px-2.5 py-1 text-xs font-semibold text-[#101412]">
                    {term}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#101412]/10 text-xs text-[#46534c]">
              <p className="font-medium text-[#101412]">Partners: {factoryCapacity.logistics.shippingPartners.join(' • ')}</p>
              <p className="mt-1 text-[11px]">Ready for export inspection within {factoryCapacity.logistics.exportLeadTime}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#101412]/10 bg-white p-6 sm:p-7 lg:col-span-7 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#01aa3f]/10 px-3 py-1 text-xs font-semibold text-[#0a7d31]">
                <ShieldCheck className="size-3.5" aria-hidden="true" /> Protocol &amp; Tolerances
              </span>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-[#101412]">
                Rigorous Inspection At Every Stage
              </h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUALITY_PILLARS.map((pillar) => (
                  <div key={pillar.title} className="rounded-xl border border-[#101412]/8 bg-[#f7f8f5] p-3.5">
                    <p className="flex items-center gap-2 text-xs font-bold text-[#101412]">
                      <CheckCircle2 className="size-3.5 text-[#01aa3f] shrink-0" aria-hidden="true" />
                      {pillar.title}
                    </p>
                    <p className="mt-1.5 text-xs text-[#46534c] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#101412]/10 flex items-center justify-between text-xs text-[#46534c]">
              <span className="font-semibold text-[#101412]">Zero Compromise on Colorfastness &amp; Elastic Tension</span>
              <Link href="/standards" className="inline-flex items-center gap-1 font-semibold text-[#0a7d31] hover:underline">
                View Standards <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#101412]/10 bg-[#dfe6e1]">
            <Image
              src="https://ik.imagekit.io/a2q8u8qtw/factory/textile%20production.webp"
              alt="Textile trims production floor at Mohid Enterprises"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#01aa3f]">Floor 01</span>
              <p className="text-sm font-semibold text-white drop-shadow">Textile Trims Weaving</p>
            </div>
          </div>

          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#101412]/10 bg-[#dfe6e1]">
            <Image
              src="https://ik.imagekit.io/a2q8u8qtw/factory/Braiding%20Winding.webp"
              alt="Braiding and winding machine operation"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#01aa3f]">Floor 02</span>
              <p className="text-sm font-semibold text-white drop-shadow">Braiding &amp; Winding Fleet</p>
            </div>
          </div>

          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#101412]/10 bg-[#dfe6e1]">
            <Image
              src="https://ik.imagekit.io/a2q8u8qtw/factory/packed%20inventory.png"
              alt="Packed trims inventory ready for international export"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#01aa3f]">Dispatch</span>
              <p className="text-sm font-semibold text-white drop-shadow">Packed For Export &amp; Audit</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
