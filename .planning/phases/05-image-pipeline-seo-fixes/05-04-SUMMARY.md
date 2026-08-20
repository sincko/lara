---
phase: 05-image-pipeline-seo-fixes
plan: 04
subsystem: ui
tags: [scss, gatsby-plugin-image, absolute-fill, pagination, privacy, target-blank, typography]

# Dependency graph
requires:
  - phase: 05-image-pipeline-seo-fixes
    provides: 05-01/05-02/05-03 — gatsby-plugin-image migration complete on all five surfaces, Italian SEO meta, clean privacy markdown
provides:
  - IMAG-01 banner parity: blog-post featured image centered (display: block) and absolute-filled into the 50vh banner (additive img rule, RESEARCH Pattern 3)
  - SEOS-02 pagination visibility: /blog prev/next + page numbers readable on the pink background (white pills, dark text; active = dark pill)
  - SEOS-03 privacy page: all 8 external links open target="_blank" rel="noopener noreferrer"; headings render in Ubuntu (text font) not Parisienne
  - Full phase-gate re-run green after the fixes: install/build/test exit 0, all rendered-source greps pass on a pristine public/
affects: [phase 6 performance verification, /gsd-verify-work phase 5]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Absolute-fill banner: .blog-post .featured-image { display: block } + .blog-post .featured-image img { position: absolute; inset: 0; object-fit: cover } — additive, restores legacy Img fill under constrained layout"
    - "Pagination visibility: white pill (background #fff, text #8c1a3f) for inactive links, dark pill (background #8c1a3f, text #fff) for the active page — both ≥ 4.5:1 on the pink page background"
    - "Raw-HTML <a> for target=_blank in markdown: kramdown {:attr} syntax is NOT processed by gatsby-transformer-remark 6.16.0 (remark-parse 9); raw HTML passthrough is the proven path (contatti.md precedent)"
    - "Scoped font override via a distinct wrapper class (.privacy-content) instead of the shared .contact-page .wrapper — prevents leaking the Ubuntu-heading override to /contatti"

key-files:
  created: []
  modified:
    - src/assets/scss/style.scss
    - src/templates/privacy.js
    - src/content/pages/privacy.md

key-decisions:
  - "Banner fix combines the user-prescribed display: block centering with the RESEARCH Pattern 3 absolute-fill img rule — the plugin's .gatsby-image-wrapper-constrained is inline-block, which made the pre-existing margin: 0 auto inert (left-aligned image)"
  - "Pagination treatment: white pill with #8c1a3f text for inactive links (contrast ~8.9:1 on #ff1c65), dark #8c1a3f pill with white text for the active page; .pagination.-post (blog-post prev/next) resets background/border-radius so the pill stays scoped to /blog"
  - "target=_blank via raw HTML <a> form, NOT kramdown {:target=\"_blank\"} — verified remark-parse 9 in gatsby-transformer-remark 6.16.0 does not process kramdown attributes (they would render as literal text); raw HTML passthrough proven by contatti.md's built output"
  - "Privacy heading override scoped via a new 'privacy-content' class on the privacy template wrapper — contatti.js uses the identical .contact-page .wrapper structure, and the user's complaint was privacy-specific"

patterns-established:
  - "Additive-only SCSS discipline: the banner fix adds display: block to the existing rule and appends a nested img rule — zero existing selectors rewritten (plan prohibition honored)"
  - "Contrast-first pagination: any link color on the pink --primary-color background must be white or dark-on-white; never inherit the global pink link color"

requirements-completed: [IMAG-01, IMAG-02, IMAG-03, SEOS-01, SEOS-02, SEOS-03]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Blog-post banner parity: .blog-post .featured-image is display:block + margin:0 auto (centered under the article header) and the inner img absolute-fills the 50vh banner (inset 0, object-fit cover, 50% 50%) — compiled CSS verified in public/styles.*.css; zero existing selectors rewritten"
    requirement: IMAG-01
    verification:
      - kind: other
        ref: "grep public/styles.*.css for '.blog-post .featured-image{border-radius:12px;display:block;margin:0 auto;min-height:50vh}' and '.blog-post .featured-image img{height:100%;inset:0;object-fit:cover;object-position:50% 50%;position:absolute;width:100%}'"
        status: pass
    human_judgment: false
  - id: D2
    description: "/blog pagination links visible: .pagination a is a white pill with #8c1a3f text, .is-active is a dark #8c1a3f pill with white text, hover inverts — all ≥ 4.5:1 on the pink page background; .pagination.-post resets the pill so blog-post prev/next is unaffected"
    requirement: SEOS-02
    verification:
      - kind: other
        ref: "grep public/styles.*.css for '.pagination a{background-color:#fff;border-radius:12px;color:#8c1a3f' and '.pagination a.is-active,.pagination a:hover{background-color:#8c1a3f;color:#fff}'"
        status: pass
    human_judgment: false
  - id: D3
    description: "All 8 privacy external links open in a new tab: raw-HTML <a href=... target=\"_blank\" rel=\"noopener noreferrer\"> form in privacy.md (kramdown {:attr} unsupported by remark-parse 9); built /privacy HTML contains target=\"_blank\" on all 8 external links with link text preserved verbatim"
    requirement: SEOS-03
    verification:
      - kind: other
        ref: "grep -c 'target=\"_blank\"' public/privacy/index.html → 10 (8 external + wa.me + mailto); grep the 8 hrefs each with target=\"_blank\" rel=\"noopener noreferrer\""
        status: pass
    human_judgment: false
  - id: D4
    description: "Privacy headings render in Ubuntu: privacy.js wrapper gains class 'privacy-content'; .contact-page .privacy-content h1-h6 override the global Parisienne title font with var(--font-family); compiled CSS verified; /contatti unaffected (no markdown headings, plain wrapper)"
    requirement: SEOS-03
    verification:
      - kind: other
        ref: "grep public/styles.*.css for '.contact-page .privacy-content h1,...,h6{font-family:var(--font-family)}'; grep public/privacy/index.html for 'class=\"wrapper privacy-content\"'"
        status: pass
    human_judgment: false
  - id: D5
    description: "Full phase-gate re-run after the fixes: yarn clean && yarn build exit 0, yarn test 10 suites / 85 tests pass, and every rendered-source grep holds on the fresh public/ (outer-wrapper 0, og:image object Object 0, lang=it, rel=alternate 0, Stackrole 0, Blog — Pagina 2 title, chiocciola 0, site-wide object Object 0, privacy p-tags balanced 20/20)"
    verification:
      - kind: other
        ref: "TMPDIR=/home/simos/tmp yarn clean && yarn build && yarn test; full grep suite from 05-04-PLAN.md task 1"
        status: pass
    human_judgment: false

# Metrics
duration: 65 min
completed: 2026-08-20
status: complete
---

# Phase 05 Plan 04: Visual-Delta Fixes + Phase-Gate Verification Summary

**The four user-reported visual deltas from the held-out checkpoint are fixed and committed (banner centering + absolute-fill, /blog pagination visibility, privacy target=_blank links, privacy Ubuntu headings), the full phase-gate loop (install/build/test + the rendered-source grep suite) re-runs green on a pristine public/, and the plan's conditional CSS task is closed on evidence — IMAG-01/02/03 and SEOS-01/02/03 all verified.**

## Performance

- **Duration:** 65 min
- **Started:** 2026-08-20T08:36:00Z (checkpoint resume)
- **Completed:** 2026-08-20T09:41:08Z
- **Tasks:** 3 (task 1 gate re-run, task 2 checkpoint resolved with 4 deltas, task 3 conditional fix applied)
- **Files modified:** 3

## Accomplishments

- **Delta 1 — blog-post banner centered + absolute-filled (IMAG-01):** the plugin's `.gatsby-image-wrapper-constrained` is `display: inline-block`, which made the pre-existing `.blog-post .featured-image { margin: 0 auto }` inert — the image sat left-aligned under the centered `.article-header`. Added `display: block` to the existing rule (additive, no selector rewritten) and appended the RESEARCH Pattern 3 absolute-fill rule (`.blog-post .featured-image img { position: absolute; inset: 0; width/height 100%; object-fit: cover; object-position: 50% 50% }`) so the image fills the 50vh banner exactly as legacy `Img` did. Compiled CSS verified: `.blog-post .featured-image{border-radius:12px;display:block;margin:0 auto;min-height:50vh}` + the img fill rule.
- **Delta 2 — /blog pagination links visible (SEOS-02):** `.pagination a` inherited the global pink `--home-link-color` on the pink `--primary-color` page background (zero contrast), and `.is-active` used `--header-bg` = pink-on-pink (also invisible). New treatment: inactive links are white pills with `#8c1a3f` text (contrast ~8.9:1), the active page is a dark `#8c1a3f` pill with white text, hover inverts. The `.pagination.-post` variant (blog-post prev/next) resets background/border-radius so the pill stays scoped to the /blog row. Compiled CSS verified.
- **Delta 3 — privacy external links open in new tab (SEOS-03):** all 8 external links converted from markdown to raw-HTML `<a href="..." target="_blank" rel="noopener noreferrer">` form, restoring the pre-migration behavior (c724ad6 had `target="_blank"` on all 8). **Verified decision:** kramdown-style `{:target="_blank"}` attributes are NOT processed by gatsby-transformer-remark 6.16.0 (remark-parse 9) — they would render as literal text; raw HTML passthrough is the proven path (contatti.md's raw `<a target="_blank">` renders intact in built HTML). Built /privacy HTML: `target="_blank"` on all 8 external links (10 total including wa.me + mailto), link text preserved verbatim on all 8.
- **Delta 4 — privacy headings in Ubuntu (SEOS-03):** the global `h1-h6 { font-family: var(--font-family-titles) }` applied Parisienne to the privacy headings. Scoped an override via a new `privacy-content` class on the privacy template wrapper (`.contact-page .privacy-content h1-h6 { font-family: var(--font-family) }`) — **decision with evidence:** contatti.js uses the identical `.contact-page .wrapper` structure, so scoping to the shared wrapper would have changed /contatti too; the user's complaint was privacy-specific, and contatti.md has zero markdown headings to protect. Compiled CSS verified.
- **Full phase-gate re-run green:** `yarn clean && yarn build` exit 0, `yarn test` 10 suites / 85 tests pass, and every rendered-source grep holds on the fresh `public/` (see verification record below).

## Task Commits

Each task was committed atomically:

1. **Task 1: Phase-gate verification (install/build/test + grep suite)** - no commit (all green on first run, per plan)
2. **Task 2: Held-out visual checkpoint (human-verify)** - resolved by user with 4 deltas
3. **Task 3: Conditional banner CSS + the 4 delta fixes** - `68d7cfe` (fix: banner), `16dfa0d` (fix: pagination), `521a046` (fix: privacy headings), `22032c7` (fix: privacy links)

**Plan metadata:** pending (docs: complete plan — commit containing SUMMARY.md)

## Files Created/Modified

- `src/assets/scss/style.scss` - `.blog-post .featured-image` gains `display: block` + nested absolute-fill `img` rule (Delta 1); `.pagination a` white-pill treatment with dark text, `.is-active` dark pill, `.-post` reset (Delta 2); `.contact-page .privacy-content h1-h6` Ubuntu override (Delta 4)
- `src/templates/privacy.js` - wrapper `className="wrapper privacy-content"` (Delta 4 scope hook)
- `src/content/pages/privacy.md` - 8 external links converted to raw-HTML `<a target="_blank" rel="noopener noreferrer">` form, link text preserved (Delta 3)

## Decisions Made

- **Banner fix = centering + absolute-fill together:** the user's prescribed `display: block` fix addresses the left-alignment (inline-block wrapper made `margin: 0 auto` inert); the RESEARCH Pattern 3 img rule restores the fill behavior the earlier check flagged. Both are additive — the plan's prohibition on rewriting existing selectors is honored.
- **Pagination colors chosen for contrast, not aesthetics:** `#8c1a3f` (the site's existing dark nav/menu color) on white gives ~8.9:1 on the pink background; the active page inverts to a dark pill — every link state is clearly readable (≥ 4.5:1), which was the user's requirement.
- **Raw HTML over kramdown attributes:** verified against the installed remark-parse 9 (gatsby-transformer-remark 6.16.0) that `{:target="_blank"}` is not processed — the raw-HTML form is the only path that both renders and carries the attribute, and it is proven by contatti.md's built output.
- **Privacy-only font scope:** a distinct `privacy-content` class rather than the shared `.contact-page .wrapper` — evidence: contatti.js renders the identical wrapper structure, and the user's complaint named /privacy specifically.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Blog-post featured image left-aligned under the centered header**
- **Found during:** Task 2 checkpoint (user delta 1)
- **Issue:** the plugin's `.gatsby-image-wrapper-constrained` sets `display: inline-block`, so the existing `.blog-post .featured-image { margin: 0 auto }` had no effect — the image sat left-aligned under the centered `.article-header`.
- **Fix:** added `display: block` to the existing rule (additive) plus the RESEARCH Pattern 3 absolute-fill `img` rule (position absolute + inset 0 + object-fit cover) so the image fills the 50vh banner as legacy `Img` did.
- **Files modified:** src/assets/scss/style.scss
- **Verification:** compiled CSS contains `display:block` on `.blog-post .featured-image` and the absolute-fill img rule; build green; all gate greps re-pass
- **Committed in:** `68d7cfe` (Task 3 commit)

**2. [Rule 1 - Bug] /blog pagination links invisible (pink on pink)**
- **Found during:** Task 2 checkpoint (user delta 2)
- **Issue:** `.pagination a` inherited the global `a { color: var(--home-link-color) }` = `#ff1c65` on the pink `--primary-color` page background (zero contrast); `.is-active` used `--header-bg` = pink-on-pink too. Pre-existing bug (live site CSS showed the same).
- **Fix:** white pill with `#8c1a3f` text for inactive links, dark `#8c1a3f` pill with white text for the active page, hover inversion; `.-post` variant reset so the blog-post prev/next row is untouched.
- **Files modified:** src/assets/scss/style.scss
- **Verification:** compiled CSS contains the new color rules; all pagination link states ≥ 4.5:1 contrast on the pink background
- **Committed in:** `16dfa0d` (Task 3 commit)

**3. [Rule 1 - Bug] Privacy external links lost target="_blank" in the markdown rebuild**
- **Found during:** Task 2 checkpoint (user delta 3)
- **Issue:** the 05-03 markdown rebuild (D-19) dropped the `target="_blank" rel="noopener noreferrer"` attributes the pre-migration markdown (c724ad6) had on all 8 external links.
- **Fix:** converted the 8 markdown links to raw-HTML `<a>` form with `target="_blank" rel="noopener noreferrer"` — kramdown `{:attr}` syntax is not supported by remark-parse 9 (verified), raw HTML passthrough is the proven path (contatti.md precedent).
- **Files modified:** src/content/pages/privacy.md
- **Verification:** built /privacy HTML has `target="_blank"` on all 8 external links; link text preserved verbatim on all 8
- **Committed in:** `22032c7` (Task 3 commit)

**4. [Rule 1 - Bug] Privacy headings render in Parisienne (title font) instead of Ubuntu**
- **Found during:** Task 2 checkpoint (user delta 4)
- **Issue:** the global `h1-h6 { font-family: var(--font-family-titles) }` applied Parisienne to the privacy page headings.
- **Fix:** scoped override `.contact-page .privacy-content h1-h6 { font-family: var(--font-family) }` with a new `privacy-content` class on the privacy template wrapper — privacy-only scope (contatti shares the wrapper structure but has no markdown headings and the complaint was privacy-specific).
- **Files modified:** src/assets/scss/style.scss, src/templates/privacy.js
- **Verification:** compiled CSS contains the override; built /privacy HTML has the `privacy-content` class
- **Committed in:** `521a046` (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (4 bugs — all user-reported deltas from the held-out checkpoint)
**Impact on plan:** All four fixes are the checkpoint's conditional task materializing on evidence — exactly the plan's design (the CSS fix lands only on a human-reported delta). No scope creep; the other checkpoint items (hero, cards) were approved and untouched.

## Issues Encountered

- **kramdown attribute verification:** the checkpoint brief asked to verify whether `{:target="_blank"}` is processed by the remark config. Verified against the installed gatsby-transformer-remark 6.16.0 dependency tree (remark-parse 9): kramdown-style inline attributes are not supported — the raw-HTML form was chosen and proven in built output.
- **`</p>` vs `<p>` grep count (19 vs 20)** on public/privacy/index.html — the known naive-grep artifact from 05-03 (`<p ` with attributes is missed); the python tag-walker confirms 20/20 balanced. No fix needed.
- **Pagination pill leakage:** the new `.pagination a` pill treatment would have applied to the `.pagination.-post` variant (blog-post prev/next) — reset with `background: none; border-radius: 0` in the `.-post` block so the fix stays scoped to /blog.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- IMAG-01 complete with banner parity: centered + absolute-filled 50vh banner verified in compiled CSS
- IMAG-02/IMAG-03 verified: DOMINANT_COLOR hero, zero [object Object] site-wide
- SEOS-01/02/03 complete: lang=it, zero hreflang, Italian meta, visible pagination, privacy page with target=_blank links and Ubuntu headings
- Full phase-gate loop green on a pristine public/ — the site is ready for the phase-6 comparison with zero marker regressions
- Remaining for the phase verifier: a final visual pass on the fixed surfaces (banner fill, pagination pills, privacy links/headings) — the machine-verifiable criteria are all green

---
*Phase: 05-image-pipeline-seo-fixes*
*Completed: 2026-08-20*
