// ============================================================================
// FIELD CLASS TOKENS — the one border/background/focus/error palette shared by
// <Input>, <Select> and <Textarea>. Pure class strings, NO component, and this
// module deliberately has NO 'use client' directive.
// ----------------------------------------------------------------------------
// Same reason as button-classes.ts: exports of a 'use client' module that are
// not components become client references, and calling one from a Server
// Component throws at render time. These tokens are the ones ADMIN_DESIGN.md
// tells you to compose for a custom field, so they must be server-importable.
//
// `input.tsx` keeps 'use client' (it uses useId + forwardRef) and imports from
// here. It does NOT re-export these symbols — one import path only.
//
// `FieldLabel` is intentionally NOT here: it is a component, so a Server
// Component may import and render it straight from `input.tsx` without issue.
// ============================================================================

export const controlBase =
  'w-full rounded-lg border bg-black/[0.03] px-3 py-2 text-sm font-normal text-black placeholder:text-black/45 transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60'

/** Border + focus-ring palette. Append right-padding *after* this in `cn`. */
export const controlState = (invalid: boolean) =>
  invalid
    ? 'border-[#c62828]/50 focus-visible:border-[#c62828] focus-visible:ring-[#c62828]/25'
    : 'border-black/10 focus-visible:border-[#00c853] focus-visible:ring-[#00c853]/30'
