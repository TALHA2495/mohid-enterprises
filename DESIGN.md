# Mohid Enterprises — Design System

**The homepage (`components/hero-section.tsx`) is the reference implementation.**
Every public page must match it. Tokens live in `lib/design-tokens.ts`.

> The previous design document is preserved at `docs/DESIGN_LEGACY.md`.
> Where it conflicts with this file or the code, this file and the code win.
---

## Brand idea

An established textile trims manufacturer in Faisalabad, Pakistan.
Industrial, precise, restrained. Not a fashion store, not a startup.

---

## Colour

| Token | Value | Use | Ratio on `#f7f8f5` |
|---|---|---|---|
| `GREEN` | `#01aa3f` | **Surfaces only** — button fills, rules, markers | 2.9:1 FAIL |
| `GREEN_TEXT` | `#0a7d31` | Large/bold text, links, accents | 4.6:1 PASS |
| `GREEN_ON` | `#07120b` | Text sitting **on** a green fill | 6.2:1 PASS |
| `INK` | `#101412` | Headings, primary text | 16.1:1 PASS |
| `INK_MUTED` | `#46534c` | Body copy, metadata | 7.2:1 PASS |
| `SURFACE` | `#f7f8f5` | Page background | — |
| `SURFACE_ALT` | `#e8eeea` | Hover fills | — |
| `SURFACE_PRESSED` | `#dce5df` | Active fills | — |

### The rule that matters most

> **Brand green `#01aa3f` is a surface colour, never a text colour.**

At 2.9:1 it fails WCAG 1.4.3 (3:1 required, even for large text).
Use it for fills, rules and decorative marks. For green *text* use `#0a7d31`.

### Never use

- `#00c853` / `#00ff59` — the old "neon" greens. Removed site-wide. They fail
  contrast on light surfaces (~2.2:1) and clash with the brand green.
- `text-white` + `drop-shadow` on light surfaces to fake contrast. Fix the colour.
- `text-white` is only ever used on top of a photographic overlay (e.g. the
  factory image captions), never on a light page background.

---

## Typography

One family: **Inter**. No secondary display or mono face.

| Role | Classes |
|---|---|
| H1 | `text-3xl font-semibold tracking-tight sm:text-5xl` |
| H2 | `text-xl font-semibold tracking-tight sm:text-2xl` |
| Body | `text-[15px] leading-relaxed text-[#46534c] sm:text-base` |
| Meta / eyebrow | `text-[11px] font-medium uppercase tracking-[0.1em] sm:text-xs` |

The hero `20+ YEARS` is a deliberate exception — `font-extrabold`, tight
negative tracking, fluid `clamp()` sizing. It is the single largest element on
the site and should stay that way.

---

## Radius

| Token | Value | Use |
|---|---|---|
| `RADIUS_CARD` | `rounded-xl` | Cards, images, tiles |
| `RADIUS_PILL` | `rounded-full` | Chips, filter pills, header CTA only |

---

## Spacing

4px base grid. Section padding: `px-5 sm:px-8 lg:px-12`.
Vertical rhythm steps 8 / 12 / 16. No oversized gaps.

---

## Borders & focus

- Resting border: `border-[#101412]/12`
- Emphasis border: `border-[#101412]/20`
- **Focus ring is always `#101412`** (ink), never green — it must be visible on
  every surface we use. Offset `ring-offset-[#f7f8f5]`.
- Minimum interactive target: 44px. Primary CTAs are `min-h-12` (48px).

---

## Page shell

`components/page-shell.tsx` — warm `#f7f8f5` surface, ink text, header, footer.
**No full-bleed backdrop photo.** Light pages; photography belongs in content
blocks, not behind text.

---

## Motion

Restrained. `prefers-reduced-motion` disables everything. No animation
libraries. Transform/opacity only — never layout-affecting properties.

---

## Accessibility checklist

- [x] Exactly one `<h1>` per page
- [x] Body text >= 4.5:1
- [x] Large text >= 3:1
- [x] Visible focus on every interactive element
- [x] Touch targets >= 44px
- [x] Decorative images `alt=""`, meaningful images described
- [x] `prefers-reduced-motion` honoured
- [x] Keyboard-navigable lightbox with focus return

---

## Component specs

### Buttons
- **Primary:** `bg-[#01aa3f] text-[#07120b]`, hover `#00be48`, active `#009637`
- **Secondary:** transparent, `border-[#101412]/20`, ink text, hover `#e8eeea`

### Filter pills (showroom)
- Active: green fill, `#07120b` text
- Inactive: transparent, `#101412]/20` border, ink text

### Product cards
`rounded-xl`, `border-[#101412]/12`, `bg-white`, hover lifts 1px and tints
`#e8eeea`.

### Certificate tiles
Uniform `aspect-[3/4]`, `object-contain` so the whole document stays visible.
On the homepage the single tile is capped at `min(70vh, 26rem)` so it can never
exceed ~80vh of the viewport.
