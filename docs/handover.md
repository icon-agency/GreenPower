# Dev Handover — Port Checklist

The state of the build at handover, and the tasks the port must do. Read with
`drupal-handoff.md` (the philosophy) and `drupal-mapping-pattern.md` (the
three-piece pattern). Every organism's SCSS partial carries its own Drupal
mapping header — that is the per-component spec; this file is the cross-cutting
list.

Run `npm run verify` before trusting a working copy — it checks the committed
CSS is a fresh build, the hard rules (no raw colour outside tokens, no raw
width `@media`, no inline styles), and that every page's structural tags
balance. Warnings (not failures) flag the known prototype gaps below.

---

## 1. Images: srcset + re-encode — the #1 task

No template ships `srcset`/`sizes`, and the source PNGs run 0.25–5.4MB — the
landscape set is ~1MB at 900×600, but the square 1500×1500 heroes are the heavy
end (gas.png 5.4MB, wind.png 4.4MB, emerging.png 3.1MB). LESSONS.md requires
responsive images because the layout keeps growing past the type cap —
single-resolution images go soft on large displays and are far too heavy for
production.

- Re-encode to WebP/AVIF, target <150KB per image.
- In Drupal this is image styles + responsive image mappings on the media view
  modes — no template work beyond the field formatter.
- Cover images (`download__cover`) are portrait A4-ish: enforce the ratio with
  an image style rather than trusting uploads.

## 2. One behavior per script — the inline copies are throwaway

Every template carries its own copy of the shared inline scripts. That was a
deliberate prototype convenience, and it has already produced one drift (a
`labelFor` copy announcing a card row as "Scrollable table"). At port, each
becomes ONE `once()`-guarded Drupal behavior in the theme library; port from
the NEWEST copy and delete the rest. Copies at handover:

| Inline script (grep marker) | Copies | Behavior |
|---|---|---|
| Main nav — hamburger, panels, backdrop (`Main navigation: hamburger`) | 24 | `gp/nav` |
| Auto-hiding header (`Auto-hiding header`) | 24 | `gp/nav` (same file) |
| Photo-frame parallax (`function setShift`) | 25 | `gp/parallax` |
| Scroll-entrance observer (`var STAGGER_MS`) | 25 | `gp/animate` |
| Scroll regions — tables, pre, scrollers (`function labelFor`) | 19 | `gp/scroll-regions` — labels through `t()` |
| Client-logos marquee (`querySelector('[data-logos-playback]')`) | 18 | `gp/logos` |
| Feature banner crossfade (`querySelectorAll('[data-feature-banner]')`) | 17 | `gp/feature-banner` |
| Card-row scroller arrows (`querySelector('[data-scroll-prev]')`) | 9 | `gp/card-scroller` |
| Copy link (`querySelector('[data-copy-link]')`) | 6 | `gp/copy-link` |
| Explainer modals (`querySelectorAll('[data-modal]')`) | 2 | NOT ported as-is — in Drupal the trigger is a link to the explainer node with core's `use-ajax` modal (see `_modal.scss` header); only the `.modal` skin carries over |
| Reveal-after (`querySelectorAll('[data-reveal-after]')`) | 6 | `gp/reveal-after` |
| News filter pills (`querySelector('[data-news-filter]')`) | 4 | NOT ported — reference chrome standing in for the view's AJAX round-trip |
| GSAP SplitText hero (`registerPlugin(SplitText)`) | 1 (home) | self-hosted library + behavior; GovCMS commonly blocks CDNs |

## 3. Forms are webforms

`form-contact.html`, `form-logo-request.html` and `form-newsletter.html` are
presentational halves of webforms, not paragraphs. Classes map in the webform
UI or a `form_alter` (`.form`, `__field`, `__label`,
`__input/__select/__textarea`, `__choice`, `__file`, `__help`, `__section`).
The reCAPTCHA block is a placeholder the real element replaces. The contact and
logo-request select options (industry, energy provider) are placeholder lists —
confirm with the client. The NEWSLETTER form needs no such confirmation: its
field set (email, name, About-you select, privacy consent) and the eight
About-you options are client-confirmed (Aug 2026).

## 4. Known placeholders and wireframe filler

- `href="#"` everywhere a real route doesn't exist yet — `npm run verify`
  prints the current count (~2,300 at writing; treat verify's number as the
  truth, not this one). Where a destination template EXISTS the link is real:
  the article/landing/form templates cross-link each other (news pair, impact
  pair, event-article, downloads, audits landing, the newsletter form via
  every footer Subscribe CTA), so the `#`s that remain are routes with no
  template — section landings, policy pages, external programme links.
- `WIREFRAME FILLER` comments mark copy transcribed from wireframes that
  repeats or contradicts itself (grep the phrase — each explains what needs
  real content). The file sizes/dates on downloads are typed examples; in
  Drupal both come from the file entity, never editorial fields.
- The video embed's `data-oembed-url` records the editor's pasted watch URL;
  the iframe is derived output (core Media oEmbed proxies its own).
- Producer descriptions on the gas tool are wireframe filler EXCEPT Malabar,
  which carries real supplied copy — and doubles as the field's worked
  length example (953 characters). Configure `field_description` with
  `maxlength` 1,200 on the widget (aim under 1,000; one sentence to two
  short paragraphs) — the limit is editorial, enforced at entry; the card's
  disclosure never truncates. Full note in `_generator-card.scss` and the
  design system's Generator card section.

## 5. Open decisions (deliberate, not oversights)

- `page-nav` and `page-feedback` are built and imported but rendered on no
  page (removed from the accreditation landing at review). Keep for the
  wireframes' "On this page" / "Was this page useful?" patterns, or delete the
  two partials and their imports.
- `templates/news-article-lead.html` (the panelled article header) is complete
  but hidden from the design system nav while in review — a placeholder
  comment in `index.html` marks where its entry goes.
- News + events: one content type or two? The event article
  (`templates/event-article.html`) is the news template with an "Event" tag,
  the event date range shown and the publish date suppressed — cleanly one
  type with a type term and optional event dates, or two types sharing view
  modes. Confirm before Drupal config; the field naming holds either way
  (see the template's header comment and `_article-meta.scss`).
- News landing: the FEATURED lead is exempt from the type filter — it stays on
  screen under every pill (client decision, Aug 2026), so it cannot be the
  listing view's first result the way the markup originally assumed. An
  exposed filter re-runs the whole view, so the lead needs its own source: a
  second view display with no exposed filter (sort promoted first, range 1),
  or an entity reference on the landing page, rendered above the listing —
  with the listing view excluding that node so it cannot appear twice under
  All. Confirm which with the Drupal dev; the teaser markup is identical
  either way (`card--news card--featured`, plus `data-news-featured`, which is
  the prototype's exemption hook and does not need to survive the port).

## 6. Build notes

- `css/main.css` is COMMITTED (GitHub Pages serves it). Rebuild with
  `npm run build`; `npm run verify` fails if it is stale.
- Sass emits `@import` deprecations and one global-builtin deprecation
  (`mix()` → `color.mix`, at three call sites) — both removed in Dart Sass 3.
  Migrate to `@use` during the port (mechanical; the layer order in
  `main.scss` is the dependency graph).
- Webfont kit (Typekit `nxc8sxb`) is linked per-template `<head>`; in Drupal
  it is one library. GovCMS environments that block Typekit need the fonts
  self-hosted.
