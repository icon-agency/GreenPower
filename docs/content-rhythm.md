# Content Rhythm

## Section rhythm (vertical spacing between blocks)

One ladder governs every vertical gap on a page. Each step has one job; pick
by role, not by eye. (Reference px are each token's clamp bounds — the 375
minimum and the 1440 maximum; everything is fluid between them and keeps
growing past `xl` with the root clamp.)

| Step | Token | Role |
|---|---|---|
| Tight top | `--space-s-l` (16 → 40) | a section opening under something that already provides closure (`.card-section--tight-top`, the directories under the header band) |
| Prose flow | `--space-m` (24 → 30) | element to element inside `.page-content__section` |
| Introducer | `--space-l` (32 → 40) | a line that introduces what follows — a heading above an accordion / card stack / download list, or a status line above a result list (`p[role="status"]`). `.page-body--label-top` gives a body that OPENS on such a label the same step above it, so the label sits equidistant between the band and the list |
| Block rhythm | `--space-2xl` (64 → 80) | blocks inside a column (`.page-content > * + *`, `.page-split__body > * + *`, `.page-body > * + *`) |
| Section meet | `--space-s-l` + `--space-xl` (64 → 100) | where two sections meet: the closer's `s-l` + the opener's `xl` |

### The rules

1. **Sections open at `--space-xl` and close at `--space-s-l`** — the
   asymmetric frame `.card-section` established (open big, close on the
   container's own gutter). `.page-body` and `.client-logos` follow it;
   `.bento-grid` opens at `xl` but stays even at BOTH ends — its painted band
   makes the closing space internal. Consecutive sections therefore meet on
   `s-l + xl`, never a doubled `3xl`.
2. **A closed panel provides its own closure.** After the header band, a
   feature banner, or before the footer band, the neighbouring section's
   single token is the whole gap — the panel edge is the break. This is why
   the band → first-section gap is `--space-xl` at every width, on every page
   (or the tight-top `--space-s-l` where the section is a listing the band's
   H1 already titles — the directories, `.card-section--tight-top`).
3. **`--space-3xl` is not a section token** — with one surviving exception:
   the generator/provider directories close at it, a deliberate outsize break
   under an interactive map-and-list tool. Nothing else in the section ladder
   uses it.
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
