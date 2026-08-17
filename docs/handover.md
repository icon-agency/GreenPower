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

No template ships `srcset`/`sizes`, and the source PNGs are ~1MB at 900×600.
LESSONS.md requires responsive images because the layout keeps growing past the
type cap — single-resolution images go soft on large displays and are far too
heavy for production.

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
| Main nav — hamburger, panels, backdrop (`Main navigation: hamburger`) | 23 | `gp/nav` |
| Auto-hiding header (`Auto-hiding header`) | 23 | `gp/nav` (same file) |
| Photo-frame parallax (`function setShift`) | 24 | `gp/parallax` |
| Scroll-entrance observer (`var STAGGER_MS`) | 24 | `gp/animate` |
| Scroll regions — tables, pre, scrollers (`function labelFor`) | 18 | `gp/scroll-regions` — labels through `t()` |
| Client-logos marquee (`querySelector('[data-logos-playback]')`) | 17 | `gp/logos` |
| Feature banner crossfade (`querySelectorAll('[data-feature-banner]')`) | 16 | `gp/feature-banner` |
| Card-row scroller arrows (`querySelector('[data-scroll-prev]')`) | 8 | `gp/card-scroller` |
| Copy link (`querySelector('[data-copy-link]')`) | 5 | `gp/copy-link` |
| Explainer modals (`querySelectorAll('[data-modal]')`) | 2 | NOT ported as-is — in Drupal the trigger is a link to the explainer node with core's `use-ajax` modal (see `_modal.scss` header); only the `.modal` skin carries over |
| Reveal-after (`querySelectorAll('[data-reveal-after]')`) | 5 | `gp/reveal-after` |
| News filter pills (`querySelector('[data-news-filter]')`) | 4 | NOT ported — reference chrome standing in for the view's AJAX round-trip |
| GSAP SplitText hero (`registerPlugin(SplitText)`) | 1 (home) | self-hosted library + behavior; GovCMS commonly blocks CDNs |

## 3. Forms are webforms

`form-contact.html` and `form-logo-request.html` are presentational halves of
webforms, not paragraphs. Classes map in the webform UI or a `form_alter`
(`.form`, `__field`, `__label`, `__input/__select/__textarea`, `__choice`,
`__file`, `__help`, `__section`). The reCAPTCHA block is a placeholder the
real element replaces. Select options (industry, energy provider) are
placeholder lists — confirm with the client.

## 4. Known placeholders and wireframe filler

- `href="#"` everywhere a real route doesn't exist yet (~1,600 across pages —
  `npm run verify` counts them). Real internal routes already wired:
  news-article, news-landing, impact-stories, downloads-quarterly-reports,
  landing-audits-reports.
- `WIREFRAME FILLER` comments mark copy transcribed from wireframes that
  repeats or contradicts itself (grep the phrase — each explains what needs
  real content). The file sizes/dates on downloads are typed examples; in
  Drupal both come from the file entity, never editorial fields.
- The video embed's `data-oembed-url` records the editor's pasted watch URL;
  the iframe is derived output (core Media oEmbed proxies its own).

## 5. Open decisions (deliberate, not oversights)

- `page-nav` and `page-feedback` are built and imported but rendered on no
  page (removed from the accreditation landing at review). Keep for the
  wireframes' "On this page" / "Was this page useful?" patterns, or delete the
  two partials and their imports.
- `templates/news-article-lead.html` (the panelled article header) is complete
  but hidden from the design system nav while in review — the commented-out
  entry sits in `index.html`.
- The design system's Card demo does not yet show the news/story parts
  (`card__tag`, `card__eyebrow`, `card__cta`, `--news`, `--featured`,
  `--story`) or `btn--tint`; they are documented in `_card.scss` and live on
  the news/impact pages.

## 6. Build notes

- `css/main.css` is COMMITTED (GitHub Pages serves it). Rebuild with
  `npm run build`; `npm run verify` fails if it is stale.
- Sass emits `@import` and one global-builtin deprecation — both removed in
  Dart Sass 3. Migrate to `@use` during the port (mechanical; the layer order
  in `main.scss` is the dependency graph).
- Webfont kit (Typekit `nxc8sxb`) is linked per-template `<head>`; in Drupal
  it is one library. GovCMS environments that block Typekit need the fonts
  self-hosted.
