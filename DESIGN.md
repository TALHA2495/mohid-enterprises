# Mohid Enterprises — Design System

Light-first design language for the marketing site. Single source of truth for anyone editing pages or components.

## Principles

1. **Light-first.** Every surface uses the token set below. There is no light/dark switch — the site is always light.
2. **Content is immutable.** Design changes touch class strings only. Copy, links, product data and structure come from the existing code and must not be rewritten.
3. **Green is the only accent.** Never introduce secondary accent hues.
4. **Minimal diffs.** Reuse existing utilities and patterns; do not add dependencies, wrappers, or effects.

## Color tokens

| Token | Value | Usage |
|---|---|---|
| Page background | `#f4f7f8` | `<main>`, section backgrounds, footer |
| Card background | `bg-white` | cards, panels, form card, mobile menu, showroom cards |
| Card hover | `#f0f5f4` | showroom grid card hover |
| Primary button | `bg-[#01aa3f]`, hover `#00ff59` | CTAs, header "Request a Quote" |
| Accent | `#00c853` | mono eyebrows, check icons, type labels, links, focus borders |
| Hero accent | `#1ada67` | serif `<em>` highlights, hero eyebrow |
| Text on light surfaces | `text-black` headings · `text-black/85` `/70` `/55` `/50` body/captions | everything on white/`#f4f7f8` surfaces |
| Text over photos | `text-white` · `text-white/80` + `drop-shadow-sm`/`drop-shadow-md` | hero/eyebrow/lead text sitting directly on backdrop photos |
| Borders (light surfaces) | `black/10` cards · `black/15` `black/20` controls · `black/[0.07]` row dividers | all strokes |
| Borders (over-photo controls) | `border-white/40`–`/60` + `drop-shadow` | ghost pills, filter chips, quote close button |
| Inputs | `bg-black/[0.03]` + `border-black/10`, focus `border-[#00c853]`, `placeholder:text-black/45` | form fields |

## Typography

- **Sans:** Inter (`--font-sans`) — default body.
- **Display:** Fraunces (`--font-fraunces`) via `font-[family-name:var(--font-fraunces)]` for page titles and band headings. Two-tone pattern: white statement (over backdrop photo) + `<em className="text-[#1ada67] italic">green phrase</em>`; on light surfaces the statement is `text-black`.
- **Serif:** Playfair Display (`--font-serif`) — loaded `preload: false`; legacy product-detail title.
- **Eyebrow pattern:** `font-mono text-[10px]–[11px] uppercase tracking-[0.2em] text-[#00c853]` above headings (over photos add `drop-shadow-sm`).

## Layout

- Container: `mx-auto max-w-7xl px-4 sm:px-6` (hero, showroom, factory).
- Narrow containers: `max-w-2xl` (quote), `max-w-5xl` (standards).
- Hero backdrops: `h-[min(760px,100vh)]` (lg up to `100vh`/`95vh`), `<Image fill quality={70} sizes="100vw">`, `object-cover` — **no overlays**; over-photo text relies on drop-shadow for legibility.
- Cards: `rounded-2xl border border-black/10 bg-white`; chips/inputs use `rounded-lg`/`rounded-xl`.

## Components

- **Primary pill:** `rounded-full bg-[#01aa3f] px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-px hover:bg-[#00ff59]` + trailing `ArrowUpRight className="size-4"`.
- **Ghost pill (over photo):** `rounded-full border border-white/60 px-7 py-3.5 text-sm text-white drop-shadow-md transition-colors hover:border-white/80 hover:bg-white/10`.
- **Checklist item:** `flex items-center gap-2/3 text-sm text-black/80` + `CircleCheck className="size-[18px] text-[#00c853]" strokeWidth={1.6}`.
- **Label/value row:** uppercase `text-[11px] tracking-[0.14em] text-black/40` label over `text-sm text-black/85` value, divided by `border-b border-black/[0.07]`.
- **Form input:** `rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm text-black outline-none focus:border-[#00c853] placeholder:text-black/45`.
- **Image card:** media `aspect-[16/10]` letterboxed on `bg-black/5`, `group-hover:scale-105 duration-500` zoom; body `p-4`; card `hover:-translate-y-1 hover:border-[#00c853]/50 hover:bg-[#f0f5f4]`.

## Icons

- `lucide-react` only. `strokeWidth={1.6}` for feature icons, `size-4`/`size-5` inline, accent `text-[#00c853]`.

## Motion

- `transition-colors` on links/buttons; `hover:-translate-y-px` on primary CTAs; `hover:-translate-y-1` on grid cards; image zoom `duration-500`; mobile menu slide/fade `duration-500 ease-in-out` (always-mounted + `will-change-transform` — mount/unmount would kill the exit animation). Nothing else.

## Do / Don't

- **DO** reuse the tokens above. **DON'T** invent new hexes or use `emerald-*` / `zinc-*` palettes (legacy classes).
- **DON'T** reintroduce dark surfaces (`#0a0c0b`, `#101413`, `text-white` on light surfaces, `border-white/10` cards). The dark theme tokens and the `.dark` / `prefers-color-scheme: dark` CSS blocks were removed in the light conversion.
- **DON'T** add white/light overlays or scrims over backdrop photos — over-photo text uses `text-white` + `drop-shadow` instead.
- **DON'T** edit product data arrays, copy, or links while restyling.
- **DON'T** add new fonts, dependencies, or animation libraries.

## File map

- `app/page.tsx` — home: fixed hero backdrop (next/image, priority, mobile + desktop variants) + `SiteHeader` + `HeroSection` + footer, all on `#f4f7f8`.
- `components/hero-section.tsx` / `hero-stats.tsx` — hero (frosted stat cards over the photo); visual reference for every other page.
- `components/showroom-section.tsx` — product data + showroom grid; `components/showroom-detail.tsx` — product detail (gallery views, spec chips, cards).
- `components/factory-page.tsx` / `components/standards-page.tsx` — `/factory` and `/standards`, each with its own light `DarkShell` copy (legacy name); `components/certificate-gallery.tsx` — certificate lightbox.
- `app/quote/page.tsx` + `components/quote-form.tsx` — compact single-screen quote form (logo + wordmark + close button over the photo, no site header).
- `components/site-header.tsx` — white header with hairline border on every route; animated mobile menu.
- `components/site-footer.tsx` — light footer on `#f4f7f8`.
- `app/globals.css` — Tailwind v4 setup; keep the mobile scrollbar-hiding query and `.product-cards-grid > div:empty`.
