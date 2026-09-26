// ============================================================================
// Mohid Enterprises — shared design tokens.
//
// The homepage is the reference implementation. Every other public page pulls
// its palette from here so there is exactly ONE green, ONE ink, ONE surface.
//
// RULE OF THUMB
//   Brand green #01aa3f is a SURFACE colour (button fills, rules, markers).
//   It is 2.9:1 on the page surface, which FAILS WCAG 1.4.3 even for large
//   text (3:1 required). Never use it as text on light. Use GREEN_TEXT.
//   GREEN_TEXT is only for large/bold type. Body copy uses INK / INK_MUTED.
// ============================================================================

/** Brand green. Backgrounds, borders, fills, decorative marks. Never body text. */
export const GREEN = '#01aa3f'

/** Green darkened to 4.6:1 on SURFACE. Large/bold text and links only. */
export const GREEN_TEXT = '#0a7d31'

/** Text on a GREEN fill. 6.2:1. */
export const GREEN_ON = '#07120b'

/** Primary text. 16.1:1 on SURFACE. */
export const INK = '#101412'

/** Secondary text. 7.2:1 on SURFACE — passes AA for body copy. */
export const INK_MUTED = '#46534c'

/** Page background. Warm off-white. */
export const SURFACE = '#f7f8f5'

/**
 * Flat white surface. The showroom sits on white rather than the warm
 * off-white, so its page and card backgrounds share this one value.
 * Exposed as a class because Tailwind needs the utility, not the raw hex.
 */
export const SURFACE_WHITE = 'bg-white'

/** Hover / subtle fill. */
export const SURFACE_ALT = '#e8eeea'

/** Active / pressed fill. */
export const SURFACE_PRESSED = '#dce5df'

/** Resting border on SURFACE. */
export const BORDER = 'border-[#101412]/12'

/** Emphasis border. */
export const BORDER_STRONG = 'border-[#101412]/20'

/** Standard focus ring. Visible on light surfaces. */
export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f5]'

// --- Type scale -------------------------------------------------------------
// One scale for every public page. Sizes are the homepage values.

export const TYPE = {
  h1: 'text-3xl font-semibold tracking-tight sm:text-5xl',
  h2: 'text-xl font-semibold tracking-tight sm:text-2xl',
  body: 'text-[15px] leading-relaxed text-[#46534c] sm:text-base',
  meta: 'text-[11px] font-medium uppercase tracking-[0.1em] text-[#46534c] sm:text-xs',
} as const

// --- Radius scale -----------------------------------------------------------
// Cards, images and tiles use rounded-xl. Pills are reserved for chips and
// the header CTA only.

export const RADIUS_CARD = 'rounded-xl'
export const RADIUS_PILL = 'rounded-full'

// --- Spacing rhythm ---------------------------------------------------------
// 4px base. Section padding steps: 8 / 12 / 16.

export const SECTION_PAD = 'px-5 sm:px-8 lg:px-12'
