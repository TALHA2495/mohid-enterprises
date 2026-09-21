# Mohid Enterprises â€” Admin Panel Design System

Light-first design language for the admin operations dashboard. Single source of truth for anyone editing admin pages or components. Shares the brand palette, typography stack, and light-first principles from `DESIGN.md` (the marketing-site design document).

## Principles

1. **Light-first.** Every surface uses the token set below. The admin panel is always light â€” no dark mode, no toggle.
2. **Green is the only accent.** Brand green `#01aa3f` / `#00ff59` is the sole interactive color. No secondary hues.
3. **Text on brand is black.** Never white text on brand-green fills. All primary buttons, active nav states, and green badges use `text-black`.
4. **Content is immutable.** Design changes touch class strings only. Copy, product/quote data, and page structure must not be rewritten.
5. **Minimal diffs.** Reuse existing utilities and patterns. Do not add dependencies, wrapper components, or new animation libraries.
6. **One input style.** `Input`, `Select`, and `Textarea` share the same border, background, focus ring, error state, and label/hint pattern. There are no per-form `inputClass` strings.

## Color tokens

| Token | Value | Usage |
|---|---|---|
| Page background | `#f4f7f8` | `<main>` surface, free space |
| Card background | `bg-white` | cards, panels, form cards, drawers |
| Primary button fill | `bg-[#01aa3f]` | CTAs, primary actions |
| Primary button hover | `#00ff59` | hover state, keeps `text-black` |
| Brand accent (muted) | `#00c853` | eyebrows, labels, focus rings, active nav pill, status "active" badge, inline icons, monospace accents |
| Brand dark (status) | `#0b7a34` | active-state text on green badges, success alert text, accepted-quote timestamps |
| Error red | `#c62828` | validation errors, destructive actions, rejected-quote timestamps |
| Danger surface tint | `#c62828/10` | danger badge background, error alert background |
| Text on light surfaces | `text-black` headings Â· `text-black/85` `/70` `/55` `/50` body/captions | everything on white / `#f4f7f8` surfaces |
| Borders (light surfaces) | `black/10` cards Â· `black/15` controls Â· `black/[0.07]` row dividers Â· `black/10` alert border | all strokes |
| Input background | `bg-black/[0.03]` | text inputs, selects, textareas |
| Input border (default) | `border-black/10` | all form controls |
| Input border (focus) | `border-[#00c853]` | keyboard focus on form controls |
| Input border (error) | `border-[#c62828]/50` | validation error on form controls |
| Component focus ring (green) | `ring-[#00c853]/30` on inputs, `ring-[#00c853]/60` on buttons, `ring-[#00c853]/50` on badges | keyboard focus ring within components |
| Global focus outline | `2px solid #00c853`, offset 2px | `:focus-visible` in `app/globals.css` |

**Do not** introduce `emerald-*` / `zinc-*` Tailwind palette classes, `text-white` on light surfaces, or dark surfaces (`#0a0c0b`, `#101413`, `border-white/10` cards). The dark theme tokens and `.dark` / `prefers-color-scheme: dark` CSS blocks were removed in the light conversion.

## Typography

| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Body / UI | Instrument Sans (`--font-sans`) | `text-sm` (14px) body, `text-xs` (12px) captions | Variable font (wght 400â€“700). Only 400â€“700 weights used. |
| Headings | Fraunces (`--font-fraunces`) via `font-display` class | `text-3xl` / `text-4xl` (h1), `text-2xl` (h2) | Page titles and section headings. On light surfaces: `text-black`. |
| Labels / eyebrows | Mono (`font-mono`) | `text-[10px]`â€“`text-[11px]` uppercase tracking `[0.15em]`â€“`[0.2em]` | Section labels (`.section-label`), status pills, table headers, IDs. Color: brand accent or ink depending on surface. |
| Numbers / figures | Any, with `tabular-nums` | â€” | Stat values, prices, quantities, IDs, dates. Always use `tabular-nums` for numeric data. |

### Section-label pill (used in `SectionHeader` eyebrows)

Rendered via the `.section-label` CSS class in `app/globals.css`:

```
display: inline-flex; align-items: center; gap: 0.75rem;
border-radius: 9999px;
border: 1px solid color-mix(in srgb, var(--brand) 30%, transparent);
background: color-mix(in srgb, var(--brand) 5%, transparent);
padding: 0.5rem 1.25rem;
font-family: var(--font-mono), monospace;
font-size: 0.75rem; letter-spacing: 0.15em;
text-transform: uppercase; color: var(--ink);
::before { content: ''; width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: var(--brand); }
```

In admin pages the section-label is the `section-label` Tailwind utility class inside `SectionHeader`'s eyebrow `<p>`.

## Spacing scale

Uses Tailwind's default spacing scale. Common admin spacing values:

| Token | px | Usage |
|---|---|---|
| `0.5` | 2px | tight icon gaps, badge padding |
| `1` | 4px | internal gaps inside compact rows |
| `1.5` | 6px | field gap between label/input |
| `2` | 8px | gap between tightly coupled items |
| `2.5` | 10px | card inner padding (compact) |
| `3` | 12px | alert padding, small gaps |
| `4` | 16px | card body padding (`p-5`), section gaps |
| `5` | 20px | panel gaps, form section spacing |
| `6` | 24px | page margins, card padding (standard) |
| `8` | 32px | section-header bottom margin, between major sections |
| `10` | 40px | spacious gaps |
| `12` | 48px | large section gaps |

**Card padding convention:** `p-5` (16px) for standard card bodies; `p-6` (24px) for form cards and login card; `p-4` (12px) for compact summary strips (total/notes block in quote detail).

**Form grid gaps:** `grid gap-1.5` (6px) around each field (label + control + hint). `grid gap-4` (16px) for detail blocks inside expanded quote card.

## Border / radius scale

| Token | Usage |
|---|---|
| `rounded-lg` (~0.5rem / 8px) | form controls, badges, compact cards, buttons |
| `rounded-2xl` (~1rem / 16px) | cards, panels, form card, login card, detail strips |
| `rounded-full` | badges, pills, filter chips |
| `border-black/10` | card borders, default field borders |
| `border-black/15` | button borders (secondary variant) |
| `border-black/[0.07]` | table row dividers |
| `border-[#c62828]/30` | error alert border |
| `border-[#00c853]/30` | success alert border |

**Card surface:** `rounded-2xl border border-black/10 bg-white`. Hovered card adds `transition-all duration-200 hover:-translate-y-0.5 hover:border-[#01aa3f]/40 hover:shadow-lg` (mirrors the `.admin-card` CSS class in `globals.css`).

## Shadow scale

| Token | Usage |
|---|---|
| `shadow-sm` | default primary button |
| `shadow-md` | primary button on hover |
| `shadow-xl` | login card (prominent elevation) |
| `shadow-lg` | hovered card |
| *(none)* | secondary/ghost buttons, non-hovered cards |

No box-shadow on form controls, badges, or alerts.

## Component library

All components live in `components/ui/`. Seven base components:

### Button — `components/ui/button.tsx`

Default export `Button`. Class strings live in **`components/ui/button-classes.ts`** — a directive-free module exporting `buttonClasses()` plus the `ButtonVariant` / `ButtonSize` types.

```tsx
import Button from '@/components/ui/button'                     // the component (client)
import { buttonClasses } from '@/components/ui/button-classes'  // class string, server-safe
```

Use `buttonClasses()` when you need button styling on an element that isn't a `<button>` — e.g. a Next `<Link>`:

```tsx
<Link href="/admin/products/new" className={buttonClasses({ variant: 'primary' })}>Add product</Link>
```

**Props:** `variant?`, `size?`, plus all standard `ButtonHTMLAttributes<HTMLButtonElement>` (`className`, `type`, `disabled`, `onClick`, …).

**Variants:**

| Variant | Classes | Usage |
|---|---|---|
| `primary` (default) | `bg-[#01aa3f] text-black hover:bg-[#00ff59] shadow-sm hover:shadow-md disabled:hover:bg-[#01aa3f]` | Main CTAs, "Save", "Add product", status change actions |
| `secondary` | `border border-black/15 bg-white text-black hover:bg-black/[0.03]` | Pagination, secondary actions, status chips |
| `ghost` | `text-black/70 hover:bg-black/[0.05] hover:text-black` | Inline actions, expand controls, delete triggers |
| `destructive` | `border border-[#c62828]/40 text-[#c62828] hover:bg-[#c62828]/[0.06] focus-visible:ring-[#c62828]/40` | Reject quote, delete actions |
| `outline-brand` | `border border-[#00c853] text-black hover:bg-black/[0.03]` | Brand-outlined actions |

**Sizes:**

| Size | Classes | Min-height |
|---|---|---|
| `sm` | `min-h-9 px-3.5 py-1.5 text-xs` | ~36px |
| `md` (default) | `min-h-11 px-5 py-2.5 text-sm` | ~44px |

Both sizes enforce a 44px-class touch target minimum on mobile via `min-h`.

**Base classes (all variants):** `inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]/60 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]`.

**Always use `<Button>`**, not raw `<button>` with ad-hoc classes, in admin pages.

### Input / Select / Textarea — `components/ui/input.tsx`, `components/ui/select-textarea.tsx`

The three field primitives share one visual contract (principle 6): `FieldLabel` above, the control, then a hint/error `<span>` below. `controlBase` and `controlState(invalid)` supply the border, background, focus ring and error palette. Both are exported from a **directive-free** module, so a field needing custom markup composes them instead of writing new class strings:

```tsx
import { FieldLabel } from '@/components/ui/input'                         // component, server-safe
import { controlBase, controlState } from '@/components/ui/field-classes'  // tokens, server-safe
import { cn } from '@/lib/utils'

<div className="grid gap-1.5">
  <FieldLabel htmlFor={id}>…</FieldLabel>
  <input id={id} className={cn(controlBase, controlState(Boolean(error)))} />
  <span className={cn('text-[11px] font-normal', error ? 'text-[#c62828]' : 'text-black/50')}>{error}</span>
</div>
```

Existing precedents: `categories-panel.tsx` (`controlInline`) and `admin-login-form.tsx`.
To reserve room for an in-field affordance, append a right-padding utility *after* the tokens: `Select` uses `pr-9` for its chevron, the password field below uses `pr-11` for its toggle. `cn` (twMerge) keeps `px-3` for the left and lets `pr-*` win on the right.

### Never export a non-component from a `'use client'` module

A `'use client'` file is a **client boundary**. Every export of it that isn't a component is replaced by an opaque *client reference*. If a Server Component imports one, the call throws at **render** time — not build time:

> Attempted to call buttonClasses() from the server but buttonClasses is on the client. It's not possible to invoke a client function from the server…

The build stays green; only the page crashes. So:

| Export kind | Allowed in a `'use client'` module? |
|---|---|
| Component | ✅ Server Components may render it |
| Hook (`useX`) | ✅ but only callable from a client component |
| Type / interface | ✅ erased at compile time |
| **Function or const value** | ❌ move it to a directive-free module |

The class-token modules exist for exactly this reason: `button-classes.ts` and `field-classes.ts`. Put a new shared token there rather than in a component file, and **never re-export** one through a `'use client'` module — a re-export re-creates the trap and leaves two import paths.

#### Password reveal toggle

`components/admin/admin-login-form.tsx` is the only field in the admin not using `<Input>`, because the shared primitive has no trailing slot to pin a button inside the control. It swaps `type` between `password` and `text`, uses `<Button variant="ghost" size="sm" className="px-1.5">` with an `Eye` / `EyeOff` icon, and announces state with a **changing `aria-label`** ("Show password" / "Hide password") rather than `aria-pressed` — it is an action, not a toggle state. `<Button>` already defaults to `type="button"`, so the toggle can never submit the form.

If a second password field is ever needed, add an optional `trailing` slot to `<Input>` and retire this exception.
