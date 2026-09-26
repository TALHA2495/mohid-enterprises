# Mohid Enterprises — Skills Playbook

> **Read this file first** when you want to improve, refactor, or polish any part of the codebase. It catalogues every reusable "skill" (a playbook of rules and conventions) the agent follows, and embeds the guidance needed to make consistent, minimal, on-brand changes.

---

## What is a "Skill" here?

A **skill** is a reusable, human-readable playbook — a list of rules, conventions, and checks that the agent applies whenever it touches a related area of the code. Instead of inventing behavior each time, the agent consults the relevant skill so every edit stays consistent with the rest of the project.

This project keeps its skills **in one file** (`skills.md`) plus two long-form reference documents already in the repo:

| Reference | Location | Purpose |
|---|---|---|
| Codebase structure & conventions | `CODEBASE_STRUCTURE.md` | Directory tree, tech stack, naming, image/CSS conventions, config files |
| Design system | `DESIGN.md` | Light-first tokens, typography, layout, components, motion, do/don't list |
| **Skills index (this file)** | `skills.md` | Quick index + embedded skill playbooks |

---

## How to use this file

1. Read `CODEBASE_STRUCTURE.md` first to understand the project layout.
2. Read `DESIGN.md` for the single source of truth on styling.
3. Pick the skill below that matches the task (structure, UI, review, performance, forms).
4. Apply that skill's rules **plus** the relevant reference doc. When in doubt, follow `DESIGN.md`'s Do/Don't list — it overrides generic web conventions.

---

## Skill Index

| Skill | When to invoke | Section |
|---|---|---|
| **Project playbooks** | Always, before editing | `CODEBASE_STRUCTURE.md` · `DESIGN.md` |
| **Code Structure** | Adding/refactoring components, data, or lib modules | [Code Structure](#skill-code-structure) |
| **UI Consistency** | Any styling, layout, or component change | [UI Consistency](#skill-ui-consistency) |
| **Code Review / Quality** | Before committing or merging | [Code Review / Quality](#skill-code-review--quality) |
| **Git & GitHub Workflow** | **Always** — before any `git` command | [Git & GitHub Workflow](#skill-git--github-workflow-automation) |
| **Performance** | Optimizing load, images, Lighthouse | [Performance](#skill-performance) |
| **RFQ Forms & Validation** | Editing the quote form, schema, or WhatsApp handoff | [RFQ Forms & Validation](#skill-rfq-forms--validation) |
| **Supabase & Admin** | Editing DB schema, the intake RPC, or `/admin` pages/actions | [Supabase & Admin](#skill-supabase--admin) |
| **Built-in agent skills** | Environment-provided capabilities | [Built-in agent skills](#built-in-agent-skills) |
| **Roadmap** | Planned future skills | [Roadmap](#roadmap) |
---

## Skill: Code Structure

**Goal:** Keep the codebase organized, predictable, and easy to refactor without breaking existing behavior.

### Rules

1. **Server-first, client only where needed.** Default components to Server Components (no `'use client'`). Add `'use client'` only when a component uses state, effects, event handlers, or browser APIs. See `components/showroom-section.tsx`, `showroom-detail.tsx`, `quote-form.tsx`, `site-header.tsx`, `analytics-loader.tsx` (all client) vs. `factory-page.tsx`, `standards-page.tsx`, `hero-section.tsx`, `site-footer.tsx` (server).

2. **One component per file, PascalCase file name.** Keep page wrappers (`app/*/page.tsx`) thin — they should just render a component from `components/`. Do not build large page logic inline in `app/`.

3. **Separate data from presentation.** Product data currently lives inside `components/showroom-section.tsx` (see the `products: Product[]` array). When the data grows, extract it to a typed module (e.g. `lib/products.ts`) and import the type + array. Do **not** change the data values themselves (content is immutable — see DESIGN.md).

4. **Business logic lives in `lib/`.** Validation, schema builders, and helpers belong in `lib/` (e.g. `lib/rfq-schema.ts`, `lib/utils.ts`). Components should not re-implement business rules.

5. **Reuse the `cn()` helper.** Use `lib/utils.ts` `cn()` (tailwind-merge + clsx) for conditional class composition — never hand-write `clsx`/template strings for merge-heavy cases.

6. **No API routes.** This is a static marketing site. The only "backend" interaction is the WhatsApp deep link. Don't add API routes unless explicitly requested.

7. **Minimal diffs.** Reuse existing utilities and patterns. Do not add wrappers, dependencies, or effects unless required.

8. **Docs live with the change.** Any change to a component’s structure or visual behavior updates its descriptions in `DESIGN.md` (Components + File map) and `CODEBASE_STRUCTURE.md` (tree + component table) in the same change set. Stale docs are treated as bugs.

---

## Skill: UI Consistency

**Goal:** Every page looks like it belongs to the same design system. All rules below are derived from `DESIGN.md` — treat that file as authoritative.

### Non-negotiables (from DESIGN.md)

1. **Light-first.** The site is always light. Never reintroduce dark surfaces (`#0a0c0b`, `#101413`, `text-white` on light surfaces, `border-white/10` cards). The `.dark` / `prefers-color-scheme: dark` blocks were removed.
2. **Green is the only accent.** `#00c853` (accent), `#01aa3f` (primary button), `#1ada67` (hero `<em>` highlights), `#00ff59` (button hover). Never introduce a secondary accent hue or use `emerald-*` / `zinc-*` palettes (legacy classes).
3. **Content is immutable.** Design changes touch class strings only. Never rewrite copy, links, product data, or structure.
4. **No overlays over photos.** Backdrop photos have **no** white/light scrims or overlays. Text sitting on photos uses `text-white` (+ `text-white/80`) with `drop-shadow-sm`/`drop-shadow-md` for legibility.

### Token checklist

| Element | Class pattern |
|---|---|
| Page background | `#f4f7f8` on `<main>`, sections, footer |
| Card | `rounded-2xl border border-black/10 bg-white` |
| Primary pill | `rounded-full bg-[#01aa3f] px-7 py-3.5 text-sm font-medium text-black transition-all hover:-translate-y-px hover:bg-[#00ff59] hover:text-black active:scale-[0.98]` + `ArrowUpRight size-4` |
| Ghost pill (over photo) | `rounded-full border border-white/60 px-7 py-3.5 text-sm text-white drop-shadow-md hover:border-white/80 hover:bg-white/10 active:scale-[0.98]` |
| Eyebrow | `font-mono text-[10px]–[11px] uppercase tracking-[0.2em] text-[#00c853]` (add `drop-shadow-sm` over photos) |
| Form input | `rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm text-black outline-none focus:border-[#00c853] placeholder:text-black/45` |
| Error text | `text-[#c62828]` on validation messages (`role="alert"`) |
| Checklist item | `flex items-center gap-2/3 text-sm text-black/80` + `CircleCheck size-[18px] text-[#00c853] strokeWidth={1.6}` |
| Text on light surfaces | `text-black` headings · `text-black/85` `/70` `/55` `/50` body/captions |
| Text over photos | `text-white` · `text-white/80` + drop-shadow |

### Typography

- **Sans:** Instrument Sans (`--font-sans`) — default body/UI. Variable font (wght 400–700, wdth axis); only 400–700 weights are used.
- **Display:** Fraunces (`--font-fraunces`) via `font-[family-name:var(--font-fraunces)]` for page titles and band headings. Two-tone: white statement over photos + `<em className="text-[#1ada67] italic">green phrase</em>`; `text-black` on light surfaces.
- **Serif:** Playfair Display (`--font-serif`) — legacy product-detail title only.
- **Numbers/figures:** `tabular-nums` on stat values, spec rows, and data-heavy text.

### Layout

- Container: `mx-auto max-w-7xl px-4 sm:px-6` (hero, showroom, factory). Narrow: `max-w-2xl` (quote), `max-w-5xl` (standards).
- Cards: `rounded-2xl`; chips/inputs `rounded-lg`/`rounded-xl`.
- Only `lucide-react` icons, `strokeWidth={1.6}` for feature icons, `size-4`/`size-5` inline, accent `text-[#00c853]`.

### Motion (nothing else)

- `transition-colors` on links/buttons; `hover:-translate-y-px` on primary CTAs; `hover:-translate-y-1` on grid cards; image zoom `duration-500`; mobile menu slide/fade `duration-500 ease-in-out` (always-mounted + `will-change-transform` — do **not** mount/unmount, it kills the exit animation); `active:scale-[0.98]`/`[0.95]` press states; `prefers-reduced-motion` block in `globals.css`.
- **Seamless marquee (hero):** animate `transform` only with `linear` timing; the half-track (one category set x2) must be wider than the widest supported viewport so the `-50%` wrap happens off-screen; duplicate tiles load `eager` (lazy duplicates pop in mid-scroll = flicker); keep the hover/focus pause and the `prefers-reduced-motion` static-row fallback; soft edge fade via `[data-marquee]` `mask-image` is allowed.
---

## Skill: Code Review / Quality

**Goal:** Never merge code that breaks conventions or regresses the site.

### Pre-commit / pre-merge checklist

1. **TypeScript is clean.** `npx tsc --noEmit` (or `pnpm build`) passes. Fix type errors before committing.
2. **Build succeeds.** Run `pnpm build` (or at minimum `pnpm lint`/tsc) and confirm the production build completes.
3. **No dark-theme leftovers.** Grep for `#0a0c0b`, `#101413`, `bg-black/[0.8]`, `border-white/10` on light surfaces, `.dark`, or `prefers-color-scheme`. Any hit on a light surface is a bug.
4. **No new hexes or palettes.** Only the DESIGN.md tokens. No `emerald-*`, `zinc-*`, or invented colors.
5. **No new dependencies.** Only add a package if explicitly requested. This repo deliberately keeps deps minimal (see `package.json`).
6. **Images follow conventions.** `next/image` `<Image>` everywhere with explicit `quality` (55–75) and `sizes`; only the certificate lightbox uses a native `<img>` (full-resolution, encode-safe URL). Quality ladder is `[55, 70, 75]`.
7. **Icons are generated, not hand-edited.** Favicons come from `scripts/generate-icons.mjs`; don't edit them manually.
8. **Content is unchanged.** Product data, copy, and links must not be rewritten during refactors or restyles.
9. **Mobile considered.** No horizontal overflow on small screens; mobile scrollbar-hiding CSS in `globals.css` is preserved; product filter row stays scrollable.
10. **Minimal diff.** Reuse existing patterns; no gratuitous refactors or added effects.

---

## Skill: Git & GitHub Workflow Automation

**Goal:** Every change lands on a feature branch as one atomic, verified, conventionally-named commit. Nothing is ever committed directly to `main` or `dev`.

> **Full policy:** `.agents/skills/git-github-automation/SKILL.md` · **Always-on trigger:** `.clinerules/git-github-automation.md` · **Init directive:** `rules.md`.
> The agent emits a `<git_plan>` pre-flight block before running **any** git command.

1. **Pre-flight, every time.** Print `<git_plan>` first: intent, current branch, `git status --short`, staged stat, gate result, target branch, commit message, blast radius, secrets check. No git command runs before the block is complete.
2. **Never touch `main`.** No commit, no push, no merge — not even a one-line hotfix. Feature work lives on `feature/*` / `bugfix/*`; the merge is the owner's call.
3. **`dev` is the integration branch.** It replaces the generic `development` / `develop` / `staging` names. Feature branches cut from `dev`, never from `main`. New branches use `feature/*` — `feat/*` is legacy history only.
4. **Gate = `npx tsc --noEmit` + `npm run build`.** This repo has no test runner. A failing build means halt and report — never commit red code, never `--no-verify`.
5. **Conventional Commits, atomic scope.** `<type>(<scope>): <subject>` in present tense, subject <= 72 chars, body explains **why**. Stage per path (`git add <path>`), inspect `git diff --staged`, then commit. Never `git add -A` blindly.
6. **Rebase before push.** `git pull --rebase origin <branch>`, then `git push -u origin <branch>`. Linear history, conflicts surfaced locally.
7. **Force-push is forbidden.** No `--force`; `--force-with-lease` only on explicit request after a rebase. Never amend or rebase an already-pushed commit.
8. **No Pull Requests.** `gh` is not installed and none should be created. The flow stops at local branch + commit + push. Report branch, short SHA, and the compare URL.
9. **Stash before switching.** Dirty tree -> `git stash push -u -m "<why>"` -> switch -> `git stash pop`. Never `git checkout .` / `git restore .` to "clean" the tree.
10. **Destructive commands need a yes.** `reset --hard`, `clean -fd`, `branch -D`, `push --delete`, history rewrites, and any `git config` write are described and confirmed first.
11. **Never commit scaffolding or secrets.** `.agents/`, `.claude/`, `.clinerules/`, `.aider-desk/`, `skills-lock.json`, `*.log` and `.env*.local` stay untracked.

---

## Skill: Performance

**Goal:** Keep the site fast and pass Lighthouse/perf budgets.

1. **`next/image` everywhere** with explicit `quality` (55–75) and `sizes`. Use `loading` intentionally: `eager` for above-the-fold (first few grid items), `lazy` elsewhere. `fill` + `object-cover` for backdrops and cards.
2. **Backdrop hero images:** `h-[min(760px,100vh)]` (lg up to `100vh`/`95vh`), `<Image fill quality={70} sizes="100vw">`, `object-cover`. No overlays.
3. **Honor the quality ladder** in `next.config.mjs` (`qualities: [55, 70, 75]`). Don’t request arbitrary quality values — verify allowed values against the config at author time, not from memory (a hero tile once shipped `quality={78}`).
4. **Lazy-load below the fold.** Product grid uses incremental loading (`loadedCount` +8) and lazy images after the first 4.
5. **Bundle hygiene.** `next.config.mjs` sets `optimizePackageImports: ['lucide-react']` and `experimental.inlineCss`. Import icons by name (tree-shakeable), not from `lucide-react` barrel patterns that defeat it.
6. **Analytics only in production.** `@vercel/analytics` renders only when `process.env.NODE_ENV === 'production'` via `AnalyticsLoader`.
7. **Re-encode images with sharp** via `scripts/optimize-images.mjs` rather than committing heavy originals.
8. **Preload only what's above the fold.** Use `priority` on hero images only; keep fonts `preload: false` where possible (Playfair Display is loaded `preload: false`).

---

## Skill: RFQ Forms & Validation

**Goal:** Keep the quote form correct, validated, and consistent with the WhatsApp handoff.

1. **Schema lives in `lib/rfq-schema.ts`.** Use `createRfqSchema(productContext)` to build the strict Zod schema. Do not inline validation rules in the component.
2. **Data-driven MOQ floor.** When a buyer arrives from a showroom product, the product's "Minimum order quantity" spec is parsed via `parseMoq()` and enforced with `superRefine` on the `quantity` field. Preserve this behavior.
3. **Fields:** inquiry (min 10), companyName (min 2), workEmail (email), phone (international format, normalized by stripping spaces/dashes), quantity (numeric > 0), destinationPort (min 2), notes (optional, max 500). Do not change messages/requirements unless asked.
4. **react-hook-form + @hookform/resolvers (zod).** Use `zodResolver` with the schema. `RfqFormInput` (pre-parse, `z.coerce` makes quantity unknown) vs `RfqInput` (post-parse) — keep the two types straight.
5. **Submission = Supabase RPC + WhatsApp handoff.** Valid input first persists through the `create_quote` RPC (`supabase.rpc('create_quote', …)` — server-side dedup + customer upsert + audit log, atomic), then opens the WhatsApp deep link to `NEXT_PUBLIC_WHATSAPP_NUMBER` (international format, no `+`/spaces) with the Quote ID in the message. Keep the payload encoding intact. A persistence failure must never block the lead — fall back to WhatsApp-only and surface a notice.
6. **Graceful degradation.** When Supabase env vars are unset (`isSupabaseConfigured === false`), skip persistence and behave like the pre-Supabase form. Never crash `/quote` for a missing environment.
7. **Suspense-wrapped.** The quote page is wrapped in `Suspense` (client hooks need it). Don't remove it.
8. **Standalone layout.** `/quote` has no `SiteHeader` — logo + wordmark + close button over the backdrop photo. Don't add the global header to this page.

---

## Skill: Supabase & Admin

**Goal:** The database stays the single source of truth, the public key stays useless to attackers, and every mutation is audited.

1. **Schema source of truth is `supabase/schema.sql`.** Table/enum changes go there first, then mirror into the TypeScript types in `lib/supabase.ts`. `supabase/README.md` documents run order, verification queries, and deviations from the original draft.
2. **Two clients, never one.** `lib/supabase.ts` (anon key, client-safe, RLS-locked) vs `lib/supabase-admin.server.ts` (service role, server-only guard). Never import the admin client from a `'use client'` module — that leaks the service-role key.
3. **Public writes only via the `create_quote` SECURITY DEFINER RPC.** RLS is enabled with zero policies — do not add public SELECT policies without a PII review; the admin dashboard reads with the service-role key instead.
4. **Admin auth is the HMAC cookie session** (`proxy.ts` + `lib/admin-auth.ts` + `POST /api/admin/login`). Never authenticate via `?pwd=` query params. Next.js 16 convention is `proxy.ts`, not the deprecated `middleware.ts`.
5. **Admin mutations are server actions** in `app/admin/actions.ts`: session check → service-role update → `audit_log` insert (best-effort) → `revalidatePath`. No direct supabase calls from client components.
6. **Money is NUMERIC end to end.** Render with `Intl.NumberFormat` (PKR); never floats, never string math. Payment corrections go through `payment_status = 'reversed'` — the payments table is write-once by trigger, don't try to UPDATE ledger columns or DELETE rows.
7. **Duplicate RFQs are handled server-side** (per-email sliding window inside `create_quote`); the form only displays the result. Don't reimplement the check client-side.
8. **Verification is scripted, not manual.** After any schema change run `node --env-file=.env.local scripts/verify-supabase.mjs` (52 assertions: intake, dedup, server-side validation, RLS, persistence, cleanup — no residue, no key output). For the admin area run `scripts/smoke-admin.mjs` against a dev server (guard, login, cookie flags, dashboard). Ledger/trigger behavior is verified inside a rolled-back SQL transaction (`supabase/README.md` § 4b) because payment rows are undeletable by design.
9. **Never commit a secret — not even in a test script.** Read `ADMIN_PASSWORD`/keys from the environment; never hardcode a key, password or token in a script, fixture or commit. This rule exists because a smoke script once shipped with the admin password inlined and had to be purged from history.
10. **Hosting env config is part of the contract.** Five variables must exist in the Vercel environment and be ticked for the right scope: a Preview deployment only sees Preview variables, Production only sees Production. `NEXT_PUBLIC_*` values are inlined by Next.js at **build** time, so changing one requires a rebuild - promoting or rolling back a deployment reuses the old artifacts and silently keeps the old value. Save `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` as Secret (write-only: changing one means deleting and recreating it). The admin dashboard and the login page print the **names** of missing variables so the failure explains itself; never print a value. See `supabase/README.md` section 8.

---

## Built-in agent skills

The environment also exposes reusable agent skills that can be invoked on demand:

| Skill | Purpose |
|---|---|
| `frontend-design` | Frontend design guidance and patterns |
| `web-design-guidelines` | General web design best practices |
| `ui-responsiveness-check` | Verify UI responsiveness across breakpoints |
| `review-team` | Coordinated code/design review workflow |
| `knowledge-catalog-discovery` | Discover/dispatch project knowledge |
| `skill-creator` | Create, edit, and benchmark new skills |

Use these for specific tasks (e.g. run `ui-responsiveness-check` after a layout change, `review-team` before merging). For styling, still defer to `DESIGN.md` tokens over generic guidance.

Project-local (not environment-provided): **`git-github-automation`** is gated on every git action — see [Skill: Git & GitHub Workflow Automation](#skill-git--github-workflow-automation).

---

## Roadmap

Planned future skills to add to this file:

- **Accessibility audit** — contrast (WCAG AA on all tokens), focus states, `aria-*` on interactive elements, alt text on all images.
- **SEO / Metadata** — per-page `metadata`, Open Graph, structured data for a manufacturer site.
- **Testing** — unit tests for `lib/rfq-schema.ts` and utilities (see `scripts/rfq-whatsapp.test.mts` pattern with `node --test`).
- **Analytics review** — verify Vercel Analytics events/counts and production-only rendering.
- **Responsive QA** — device-by-device pass on hero, showroom grid, filters, quote form, and mobile menu.
- **Content workflow** — how to add/update products, certificates, and imagery without breaking immutability or image conventions.

Add each as a `## Skill: <Name>` section above the Roadmap and register it in the Skill Index table.

---

## Rules for editing this file

1. Keep every skill **rule-based and actionable** — a checklist an agent can follow, not prose.
2. Derive rules from the actual codebase (`CODEBASE_STRUCTURE.md`, `DESIGN.md`, `globals.css`, `package.json`) — do not invent conventions.
3. When you add a skill, also add a row to the Skill Index and keep the anchor links in sync.
4. Keep the "Content is immutable" and "Green is the only accent" rules as absolute constraints.
