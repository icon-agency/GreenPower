# CLAUDE.md

This file is loaded automatically at the start of every session. Its whole job
is to pull in the instructions that already exist, so nobody has to remember to
ask for them.

@AGENTS.md

Read the files AGENTS.md lists under "Read these files first" — including
`LESSONS.md` — before making changes, not after. They are not background
reading: they carry the planning rule, the SCSS layering, the Drupal mapping
conventions and the known mistakes not to repeat.

Two that are easy to skip and shouldn't be:

- **Plan first.** Any new component, page, or multi-file change gets a short
  plan (3–6 bullets, affected files) and waits for approval. Single-file
  tweaks, small fixes and copy changes proceed directly.
- **Verify before claiming done.** `npm run verify` — it checks that the
  committed `css/main.css` matches a fresh Sass build, plus the raw-colour,
  raw-`@media`, inline-style and tag-balance rules. Then validate against
  `docs/definition-of-done.md`.

SCSS is the source of truth; `css/main.css` is built. Run `npm run build`
after editing SCSS and commit both, or `verify` will fail on the mismatch.
