# Content Rhythm

## Section rhythm (vertical spacing between blocks)

One ladder governs every vertical gap on a page. Each step has one job; pick
by role, not by eye. (Reference px are at 375 → 1280 viewports; everything is
fluid and keeps growing past `xl` with the root clamp.)

| Step | Token | Role |
|---|---|---|
| Prose flow | `--space-m` (24 → 30) | element to element inside `.page-content__section` |
| Heading-binds-to-panel | `--space-l` (32 → 40) | a heading that introduces an accordion / card stack / download list |
| Block rhythm | `--space-2xl` (64 → 77) | blocks inside a column (`.page-content > * + *`, `.page-split__body > * + *`, `.page-body > * + *`) |
| Section meet | `--space-s-l` + `--space-xl` (64 → 94) | where two sections meet: the closer's `s-l` + the opener's `xl` |

### The rules

1. **Sections open at `--space-xl` and close at `--space-s-l`** — the
   asymmetric frame `.card-section` established (open big, close on the
   container's own gutter). `.page-body`, `.pathway-section` (which closes at
   `--space-xs`: its panels frame themselves), `.client-logos` and
   `.bento-grid` all follow it. Consecutive sections therefore meet on
   `s-l + xl`, never a doubled `3xl`.
2. **A closed panel provides its own closure.** After the header band, a
   feature banner, or before the footer band, the neighbouring section's
   single token is the whole gap — the panel edge is the break. This is why
   the band → first-section gap is `--space-xl` at every width, on every page.
3. **`--space-3xl` is not a section token.** It survives only inside
   compositions that need a deliberate outsize break; nothing in the section
   ladder uses it.
4. **A heading that introduces a panel binds to it** at `--space-l` — the
   `:has()`-gated step-down exists in both `.page-content` and
   `.page-split__body`. Without `:has()` the block rhythm stands.
5. **Exception:** `.page-body` keeps a `--space-m` bottom on phones (the
   `s-l` closer takes over from `sm`).

## Typography
- Use a clear type scale with consistent steps.
- Keep line length comfortable for reading.
- Avoid oversized headings that dominate smaller screens.

## Spacing
- Use token-based spacing only.
- Maintain consistent vertical rhythm between sections and elements.
- Avoid one-off spacing overrides unless documented.

## Readability
- Maintain comfortable measure in text-heavy sections.

## Text wrapping
- `text-wrap: pretty` is the site-wide default — set once on `body` (`scss/base/_typography.scss`), it inherits to every text node, headings included.
- The hero h1 (`.hero__title`) is the lone exception: kept on `text-wrap: balance` so its large display headline reads with evenly filled lines.
- Both are progressive enhancements, so no fallback is required (Safari ignores `pretty` gracefully).
- Set it in base styles, not per-component overrides — the hero exception is the only place a component re-applies it.

## Dense government content
- Break long content into digestible sections.
- Use lists, callouts, tables, and summaries carefully.
- Prioritize scanning without losing formality.
