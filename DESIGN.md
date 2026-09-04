# Mohid Enterprises — Design System

Dark-first design language for the marketing site. Single source of truth for anyone editing pages or components.

## Principles

1. **Dark-first.** Every surface uses the token set below. There is no light/dark switch — the site is always dark.
2. **Content is immutable.** Design changes touch class strings only. Copy, links, product data and structure come from the existing code and must not be rewritten.
3. **Green is the only accent.** Never introduce secondary accent hues.
4. **Minimal diffs.** Reuse existing utilities and patterns; do not add dependencies, wrappers, or effects.

## Color tokens

| Token | Value | Usage |
|---|---|---|
| Page background | `#0a0c0b` | `<main>`, section backgrounds |
| Card background | `#101413` | cards, panels, form card, mobile menu |
| Card hover | `#151a19` | showroom grid card hover |
| Primary button | `bg-[#01aa3f]`, hover `#00ff59` | CTAs, header "Request a Quote" |
| Accent | `#00c853` | mono eyebrows, check icons, active borders, links |
| Hero accent | `#1ada67` | serif `<em>` highlights, hero eyebrow |
| Text primary | `text-white` | headings |
| Text secondary | `text-white/80` · `text-white/60` | body copy, list items |
| Text tertiary | `text-white/55` · `text-white/45` · `text-white/35` | captions, labels, index numbers |
| Borders | `white/10` cards · `white/15` controls · `white/[0.07]` row dividers | all strokes |
| Inputs | `bg-white/[0.04]` + `border-white/10`, focus `border-[#00c853]` | form fields |

## Typography

- **Sans:** Inter (`--font-sans`) — default body.
- **Display:** Fraunces (`--font-fraunces`) via `font-[family-name:var(--font-fraunces)]` for page titles and band headings. Two-tone pattern: white statement + `<em className="text-[#1ada67] italic">green phrase</em>`.
- **Serif:** Playfair Display (`--font-serif`) — showroom product-detail title.
- **Eyebrow pattern:** `font-mono text-[10px]–[11px] uppercase tracking-[0.2em–0.28em] text-[#00c853]` above headings.

## Layout

- Container: `mx-auto max-w-7xl px-4 sm:px-6` (hero, home bands, showroom, factory).
- Narrow containers: `max-w-2xl` (quote), `max-w-5xl` (standards).
- Rhythm: first band `pt-16 sm:pt-20`; between bands `mt-16 sm:mt-20`; closing band `py-16 sm:py-20`.
- Cards: `rounded-2xl border border-white/10 bg-[#101413]`; chips/inputs use `rounded-lg`/`rounded-xl`.

## Components

- **Primary pill:** `rounded-full bg-[#01aa3f] px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-px hover:bg-[#00ff59]` + trailing `ArrowUpRight className="size-4"`.
- **Ghost pill:** `rounded-full border border-white/30 px-7 py-3.5 text-sm text-white hover:border-white/55 hover:bg-white/[0.06]`.
- **Checklist item:** `flex items-center gap-2/3 text-sm text-white/80` + `CircleCheck className="size-[18px] text-[#00c853]" strokeWidth={1.6}`.
- **Label/value chip:** uppercase `text-[10px] tracking-[0.14em] text-white/45` label over `text-sm text-white/90` value.
- **Form input:** `rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-[#00c853] placeholder:text-white/35`.
- **Image card:** media `aspect-[16/10]` over `bg-black/40`, `group-hover:scale-105 duration-500` zoom; body `p-5`.

## Icons

- `lucide-react` only. `strokeWidth={1.6}` for feature icons, `size-4`/`size-5` inline, accent `text-[#00c853]`.

## Motion

- `transition-colors` on links/buttons; `hover:-translate-y-px` on primary CTAs; `hover:-translate-y-1` on grid cards; image zoom `duration-500`. Nothing else.

## Do / Don't

- **DO** reuse the tokens above. **DON'T** invent new hexes or use `emerald-*` / `zinc-*` palettes (legacy light-era classes).
- **DON'T** reintroduce light surfaces (`#f4f7f8`, `bg-white`, `border-[#d8e1e0]`). The light theme and the `.showroom-light` / `.light-shell` CSS overrides were removed in the dark conversion.
- **DON'T** edit product data arrays, copy, or links while restyling.
- **DON'T** add new fonts, dependencies, or animation libraries.

## File map

- `app/page.tsx` — home: fixed hero backdrop + `HeroSection` + `HomeSections` + footer, all on `#0a0c0b`.
- `components/home-sections.tsx` — capability grid, strength band, process strip, CTA band.
- `components/hero-section.tsx` / `hero-stats.tsx` — hero; visual reference for every other page.
- `components/showroom-section.tsx` — showroom grid + dark product detail (carousel, spec chips, cards).
- `components/company-pages.tsx` — `/factory` and `/standards` via `DarkShell`.
- `app/quote/page.tsx` + `components/quote-form.tsx` — dark quote form.
- `components/site-header.tsx` — dark on every route (no light/dark branching).
- `components/site-footer.tsx` — dark footer.
- `app/globals.css` — Tailwind v4 setup; keep the mobile scrollbar-hiding query and `.product-cards-grid > div:empty`.
