# Animation

This project currently has four animation systems. Use each for the right purpose — they are not interchangeable.

| System | Trigger | Where |
|---|---|---|
| `anim-*` keyframe fades | mount / state class | `scss/abstracts/_animations.scss` |
| JS-measured height animations | open/close of variable-height UI | inline nav script in both templates |
| GSAP SplitText masked reveal | page load (hero headline + panel summary) | inline script + pinned CDN in `home.html` |
| Auto-hiding header | scroll direction | shared script in both templates + `_main-nav.scss` (`.is-pinned`/`.is-shown`) |
| Parallax | scroll | section 2 below |
| Scroll-entrance (`data-animate`) | element enters viewport | section 3 below (`scss/utilities/_scroll-animations.scss` + inline observer) |

> **Note:** the scroll-entrance (`data-animate`) system is now built — one shared utility, one `IntersectionObserver` (section 3). Add new entrances with the attribute; never write per-component observer code (rule 1).

---

## 1. Mount-driven animations

### 1a. `anim-*` keyframe fades (CSS)

**What it does:** Fades an element in (optionally with a small rise or drop) the moment it renders or gains a state class.

**Where the code lives:** `scss/abstracts/_animations.scss` — keyframes `anim-fade-in-up`, `anim-fade-in-down`, `anim-fade-in`, `anim-fade-out`, each with a same-named mixin taking `($duration, $easing, $delay, $fill)`.

**Current uses:** the mega menu (`scss/organisms/_main-nav.scss`) — panels enter with `anim-fade-in-down(0.25s, ease-out, 80ms, both)` and cross-fade out with `anim-fade-out(0.15s, ease-out)` on `.is-leaving`. The feature banner (`scss/organisms/_feature-banner.scss`) uses the `anim-kenburns` keyframes (slow `scale` drift, 16s infinite alternate) on its active media image — `animation-play-state` paused/running per `.is-active` so an outgoing image freezes mid-zoom while it crossfades, and the whole declaration sits behind `prefers-reduced-motion: no-preference` (a global 0.01ms kill would park `forwards` fills on their end frame).

```scss
.my-panel.is-open {
  @include anim-fade-in-up; // or with overrides: (0.3s, ease-out, 100ms)
}
```

### 1b. JS-measured height animations

**What it does:** Animates open/close of variable-height UI — the mobile menu sheet, nav accordions, and the search flip region — where CSS cannot transition to `height: auto`.

**Where the code lives:** the inline nav `<script>` in both templates (`setMenuHeight`, `setPanelHeight`).

**The pattern:** measure the natural height in px → set it → force a reflow (`void el.offsetHeight`) → toggle the state class so the transition runs → release to `auto` once opening completes; reverse the steps (pin the current px height first) when closing. Never try to transition `height: auto` directly, and never delete the forced reflow — without it the browser coalesces the style writes and the animation collapses into a snap.

### 1c. GSAP SplitText hero reveal

**What it does:** Splits the homepage hero `h1` into lines, wraps each line in an extra clipping mask element, and slides the lines up into view with a stagger on load.

**Where the code lives:** `templates/home.html` — pinned CDN builds of GSAP 3.13 + SplitText plus the inline reveal script.

**Behaviour contract:** the headline is hidden only *after* GSAP is confirmed present, so no-js, blocked-CDN, and reduced-motion visitors always get static text; splitting waits for `document.fonts.ready` so line breaks match the real webfont. The reveal is the last step of the hero entrance timeline (shape panel slides up → CTA buttons and utilities appear on the nav-dropdown timing family → headline lines rise in). The split **persists** (`autoSplit` re-measures on resize) because scrolling into the hero journey plays a scroll-exit — lines rise out through their masks bottom-line-first, reversing when the user scrolls back to the top. Drupal: self-host both files as a theme library (GovCMS commonly blocks third-party CDNs) and wrap the script in a `once()`-guarded behavior.

### Reduced motion

One global kill switch in `scss/base/_reset.scss` collapses every CSS animation and transition to 0.01ms under `prefers-reduced-motion: reduce` — components do not need individual resets. JS-driven motion (parallax, the GSAP reveal, the hero video rotation) cannot be caught by that CSS rule, so each of those scripts checks the media query itself.

---

## 2. Parallax (vanilla JS, scroll-based)

**What it does:** Moves decorative hero background media at a slower rate than the scroll, creating a depth effect.

**Where the code lives:** Inline `<script>` block in the template (not shared). Look for the `data-parallax-bg` hook. The layer's positioning and overscan bleed live in `scss/organisms/_hero.scss` (`.hero__media`).

### Current parallax instances

| Template | Element | Speed factor | Notes |
|---|---|---|---|
| `home.html` | `.hero__media` (`data-parallax-bg`) | `0.2` | Full-screen background video; RISES at 20% of scroll speed (opposite the page). Bleed (`inset: -30% -2px` in `_hero.scss`) exceeds the max travel so edges never show; reduced motion / no-js collapse the bleed to `-2px`. |
| `home.html` | `.card__media img` + `.feature-banner__stage img` | `RANGE 0.04` | Decorative photos drift a few px against the scroll. One shared rAF-throttled script (selector `.card__media, .feature-banner__stage`). A baseline `scale()` gives the travel room so no edge shows — the card's resting `scale: 1.1` (`_card.scss`) or the banner's `anim-kenburns` 1.1 floor; `overflow: hidden` on the frame/stage clips it. The banner stacks 3 images, so EVERY image in a frame is shifted (only the active shows). Writes the independent `translate` property, composing with the CSS `scale` + the banner's hover `transform`. Images only — never text. |

### How it works

The real snippet from `home.html` (condensed). The offset is measured from the
hero's own `getBoundingClientRect().top` — **never** `window.scrollY` or
`offsetParent` (see LESSONS.md: `offsetParent` resolves to `<body>` here and
overshoots the bleed):

```js
var ticking = false;
function update() {
  if (!reduced.matches) {
    var heroTop = hero.getBoundingClientRect().top;
    var frameTop = frame.getBoundingClientRect().top; // sticky frame
    media.style.transform = 'translateY(' + (heroTop * 0.2 - frameTop).toFixed(1) + 'px)';
  }
  ticking = false;
}
function requestUpdate() {
  if (!ticking) {
    requestAnimationFrame(update);
    ticking = true;
  }
}
window.addEventListener('scroll', requestUpdate);
window.addEventListener('resize', requestUpdate);
update();
```

The `ticking` flag ensures only one `requestAnimationFrame` is queued per scroll event — this keeps performance smooth and avoids layout thrashing. The `resize` listener re-syncs the offset after viewport changes, and the immediate `update()` call sets the correct position on load. When `prefers-reduced-motion` is on, the update is skipped entirely and the script clears any applied transform.

**Why `- frameTop`:** the target is the media's position *in the viewport*, not inside its container. While the sticky frame is pinned `frameTop` is `0` and the term does nothing. Once the hero's sticky range runs out and the frame scrolls away at full speed, subtracting `frameTop` cancels that travel so the footage keeps drifting at 20% instead of leaving with the frame — the parallax stays visible right through the hero's exit, which is when the following section scrolls into view. Without it the effect appears to stop the moment the next section appears.

### Important: don't add a base transform offset

The JS only applies a scroll delta. The layer's starting position and overscan come from SCSS (`.hero__media { inset: -30% -2px }` — the bleed that hides the moving edges). Do not fold a base offset into the JS transform — it causes a visible jump when the first update fires, and the bleed already guarantees coverage as long as it exceeds the maximum travel (20% of the hero's total height).

---

## 3. Scroll-entrance animations (`data-animate`)

**What it does:** Fades an element in with a small upward slide as it scrolls into view. One-shot — it never replays when you scroll back.

**Where the code lives:** CSS in `scss/utilities/_scroll-animations.scss`; a single `IntersectionObserver` in an inline `<script>` duplicated in `templates/home.html` and the root `index.html` (the design system) — in Drupal this becomes ONE shared theme-library behavior. This is THE shared system — never add another observer.

### Authoring

```html
<!-- single element -->
<h2 data-animate>Heading</h2>

<!-- a group: direct data-animate children cascade, 80ms apart -->
<div data-animate-stagger>
  <article data-animate>…</article>   <!-- delay 0ms -->
  <article data-animate>…</article>   <!-- delay 80ms -->
  <article data-animate>…</article>   <!-- delay 160ms -->
</div>

<!-- override one element's delay (the stagger won't clobber it) -->
<p data-animate style="--animate-delay: 200ms">…</p>
```

Stagger groups can nest — e.g. the home card section is a `data-animate-stagger` (heading → intro) that contains a `data-animate-stagger` grid (each card cascades). A non-`data-animate` child (like the grid wrapper inside the outer group) is skipped in the count.

### How it works (the contract)

- **CSS owns the motion.** The hidden state (`opacity: 0`, `translateY(--animate-distance)`) and the `opacity`/`transform` transition live in the stylesheet, scoped under `.js-animations`. The script's only job is to add `.is-visible` (which the transition carries to) and to write `--animate-delay` on staggered children.
- **Progressive enhancement is load-bearing.** `.js-animations` is added to `<html>` **only after** the observer is wired and every element is observed. So with JS disabled, still parsing, thrown, or where `IntersectionObserver` is unsupported, the class is absent, the hidden state never applies, and everything paints fully visible. Never move that class into the static HTML or an early inline script.
- **One-shot.** On intersect the observer adds `.is-visible` and `unobserve()`s the element — it cannot re-hide on scroll-back.
- **Reduced motion, both layers.** The script bails (returns before adding `.js-animations`) under `prefers-reduced-motion: reduce`, and a CSS media query neutralises the hidden state as belt-and-braces. Same fallback path as "no `IntersectionObserver`": show everything.
- **`will-change`** is set on the primed element and released to `auto` on `.is-visible`.

### Tweakables

| Value | Where | Default |
|---|---|---|
| distance / duration / easing | CSS custom properties (`:root`, `_scroll-animations.scss`) | `12px` / `600ms` / `ease-out` |
| stagger step | `STAGGER_MS` in the observer script | `80ms` |
| trigger point | `ROOT_MARGIN` / `THRESHOLD` in the script | `-8%` bottom / `0.01` |

**Drupal:** wrap the observer in a `once()`-guarded behavior and load it as a theme library shared across pages; the CSS ships with the theme. The `data-animate` attributes are authored in Twig, so any paragraph/field template can opt in.

---

## Rules

1. **The scroll-entrance system is `data-animate` (section 3).** Use the attribute; if you need a new entrance behaviour, extend that ONE utility and its single `IntersectionObserver` — never write per-component observer code.
2. **Keep parallax to decorative media only** — hero background video/SVG, or the card *images* (section 2). Never apply parallax to text, or anything the user needs to read.
3. **Always pair CSS animations with a `prefers-reduced-motion` reset.**
4. **Parallax JS uses the `ticking` rAF pattern.** Always throttle scroll listeners with `requestAnimationFrame` — never bind expensive work directly to the scroll event.
5. **Don't use JS to animate things CSS can handle** (hover states, focus rings, transitions). JS animation is for scroll-driven or mount-driven effects only.
