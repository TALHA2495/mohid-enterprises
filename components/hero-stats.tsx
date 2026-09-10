const stats = [
  { value: '500K+', label: 'meters / month capacity' },
  { value: '5–80mm', label: 'custom sizing' },
  { value: '5 Materials', label: 'Nylon, Cotton, Polyester, Acrylic, P.P.' },
  { value: 'TR · JP', label: 'export countries' },
]

export function HeroStats() {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.value}
          className="flex flex-col gap-1 rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur-md transition-colors hover:border-emerald-400/40 hover:bg-white/80"
        >
          <dt className="text-lg font-semibold tracking-tight text-black">
            {stat.value}
          </dt>
          <dd className="text-sm leading-relaxed text-black/55 text-pretty">
            {stat.label}
          </dd>
        </div>
      ))}
    </dl>
  )
}
