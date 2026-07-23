# Content Rhythm

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
