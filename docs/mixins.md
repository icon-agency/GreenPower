# Mixin Catalog

Reusable SCSS mixins live in `scss/abstracts/_mixins.scss` (layout + utilities),
`scss/abstracts/_breakpoints.scss` (media queries), `scss/abstracts/_animations.scss`
(keyframes + animation mixins) and `scss/abstracts/_angle-badge.scss` (the brand
angle shape).

**Rule:** reach for a mixin before writing raw CSS for anything on this list.
Don't write `@media (min-width: 1024px)` by hand. Don't hand-roll a focus ring.
Don't re-implement `visually-hidden`.

This catalog lists what EXISTS — every entry below is a real mixin in the file
named. If you add one, add it here in the same pass.

---

## Media queries — `_breakpoints.scss`

### `respond-to($name)`

The default way to write a media query. Named breakpoints only
(`sm` 640 · `md` 960 · `lg` 1200 · `nav` 1380 · `xl` 1440). Mobile-first
min-width. Need a new stop? Add it to the `$breakpoints` map, never a raw px.

```scss
.card {
  padding: $spacing-md;

  @include respond-to('lg') {
    padding: $spacing-xl;
  }
}
```

### `respond-between($min, $max)`

Bounded band: min up to just below max, for the rare treatment that must apply
at one band and revert at the next (e.g. the article split's tablet layout).
Prefer `respond-to()`; reach for this only when a min-width rule would leak
into a wider breakpoint.

### `short($max)`

The HEIGHT axis: `@media (max-height: …)`. For the one case width can't
answer — "does this sticky block fit the viewport?" (see `.article-lead__thumb`).
Takes a length, not a token: there is no shared scale of viewport heights, and
the value is always measured against the block being seated.

One sanctioned exception to "no raw @media": a query keyed to
`$container-max-width` (see `_variables.scss` and the client-logos edge fade) —
`npm run verify` allows exactly that and flags everything else.

---

## Accessibility — `_mixins.scss`

### `focus-ring($color: $color-ui-focus, $offset: 2px)`

WCAG 2.4.11-compliant focus ring. Apply on `:focus-visible` of every
interactive element. `$color-brand-mint` variant for dark surfaces.

### `visually-hidden`

Screen-reader-only content. The `.visually-hidden` utility class already
exists — use the class in markup, the mixin only when composing inside a
selector. **LESSONS.md:** any element hosting a visually-hidden child needs a
positioned ancestor, or the absolutely-positioned span resolves against the
root and inflates the document.

---

## Layout — `_mixins.scss`

### `container($max: $container-max-width)`

Page-width wrapper: max-width, centred, `--space-s-l` inline padding. Use on
top-level section wrappers.

### `flex-row($gap, $align, $justify)` / `flex-col($gap)`

Flex shorthands. Defaults: `$spacing-md`, `center`, `flex-start`. `flex-row`
sets `flex-direction: row` explicitly — load-bearing when overriding a
mobile-first `flex-col` (LESSONS.md).

---

## Links — `_mixins.scss`

### `link-inline`

THE inline text link: `$color-ui-link` with a resting underline (never colour
alone — WCAG 1.4.1), hover turns blue while a centre-out bar grows via
background-gradient and replaces the underline. Shared by prose
(`.page-content__section a`), the contact rail and form notes — one definition,
so every in-text link renders identically. Use it for any new body-copy link;
never restyle from the base `a`.

The background-gradient build (not a positioned `::after`) is deliberate:
links wrap, and a pseudo strikes one bar across fragments where a background
paints per line — and it leaves `::after` free for stretched-link covers
(see `.download__link`).

---

## Components — `_mixins.scss`

### `button-reset`

Strip browser button chrome. First line of any custom button.

### `transition($props, $duration, $easing)`

Standard transition shorthand (`all`, `0.2s`, `ease-in-out`) so durations stay
consistent.

### `tag-pill($font-size: $font-size-xs)`

The dark-green label pill (`card__tag`, `article-meta__tag`, provider badges).
White on Dark Green, pill radius; size parameter per placement.

### `empty-state` / `empty-state-title` / `empty-state-text`

The "no results" block a filtered listing shows (news listing, generator
directory). Three mixins because the pieces sit on different elements.

---

## Animation — `_animations.scss`

`anim-fade-in-up`, `anim-fade-in-down`, `anim-fade-in`, `anim-fade-out` — all
`($duration, $easing, $delay, $fill)`. Mount/state-class fades (mega-menu
panels, feature banner). Scroll-entrance is NOT these: that is the one shared
`data-animate` system — see `docs/animation.md` rule 1.

---

## Angle badge — `_angle-badge.scss`

`angle-badge-box` / `angle-badge-shape` / `angle-badge-curve` — the hero shape
as a corner badge (caption image, feature banner location pin, page-header
angle). Geometry assumes a ONE-LINE label; see LESSONS.md before touching.

---

## Local mixins

`card-horizontal` lives inside `_card.scss`, not abstracts — no other
component composes it. Promote a local mixin only at 3+ uses (the rule below).

## When to write a new mixin

- The pattern appears in 3+ components and would otherwise be copy-pasted.
- It has parameters that vary across usages.
- It is hard to remember or easy to get wrong (focus ring, visually-hidden).

Don't add one for a one-off — the SCSS should read like a description of the
component, not a series of opaque `@include` calls.
