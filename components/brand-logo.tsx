import Image from 'next/image'

// ============================================================================
// The ONE brand lockup for the whole site (public pages, footer, admin).
//
// The icon is the transparent PNG from the ImageKit /Brand folder; the wordmark
// is plain HTML text so it stays crisp, selectable and scale-independent.
// Palette rule: "MOHID" brand blue, "ENTERPRISES" ink — identical to the navbar.
// tone="light" keeps the exact same geometry and only swaps the colours, for
// dark/photo backdrops where ink text would be unreadable.
// ============================================================================

// NEXT_PUBLIC_LOGO_URL overrides the CDN path when set; the literal keeps every
// lockup rendering if the variable is blank.
export const BRAND_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL?.trim() ||
  `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? 'https://ik.imagekit.io/a2q8u8qtw'}/MOHID_ENTERPRISES_LOGO.png`




type Tone = 'ink' | 'light'
type Scale = 'sm' | 'md' | 'lg'

// One scale for every placement. `md` is the navbar reference size.
const SCALES: Record<Scale, { logo: string; top: string; bottom: string; sizes: string }> = {
  sm: { logo: 'h-[21px]', top: 'text-[19px]', bottom: 'text-[14px]', sizes: '21px' },
  md: { logo: 'h-[40px]', top: 'text-[20px]', bottom: 'text-[16px]', sizes: '40px' },
  lg: { logo: 'h-[33px]', top: 'text-[24px]', bottom: 'text-[18px]', sizes: '33px' },
}

export function BrandLogo({
  tone = 'ink',
  scale = 'md',
  icon = true,
  priority = false,
}: {
  tone?: Tone
  scale?: Scale
  /** Set false for text-only wordmark placements (keeps the two-tone rule). */
  icon?: boolean
  priority?: boolean
}) {
  const s = SCALES[scale]
  const light = tone === 'light'

  return (
    <span className="flex items-center gap-2.5">
      {icon ? (
        <Image
          src={BRAND_LOGO_URL}
          alt="Mohid Enterprises logo"
          width={1600}
          height={1491}
          sizes={s.sizes}
          priority={priority}
          className={`${s.logo} w-auto object-contain`}
        />
      ) : null}
      <span className={`brand-wordmark flex flex-col leading-[1.15]${light ? ' drop-shadow-sm' : ''}`}>
        <span className={`${s.top} font-bold tracking-[0.055em] ${light ? 'text-white' : 'text-[#1B5C95]'}`}>
          MOHID
        </span>
        <span className={`${s.bottom} font-semibold tracking-[0.12em] ${light ? 'text-white/90' : 'text-[#101412]'}`}>
          ENTERPRISES
        </span>
      </span>
    </span>
  )
}
