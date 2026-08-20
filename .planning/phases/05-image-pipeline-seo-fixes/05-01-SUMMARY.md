---
phase: 05-image-pipeline-seo-fixes
plan: 01
subsystem: images
tags: [gatsby-plugin-image, gatsby-image, gatsbyImageData, og:image, sharp, gatsby-config]

# Dependency graph
requires:
  - phase: 03-core-upgrade
    provides: Gatsby 5.16.1 + gatsby-plugin-sharp 5.16.0 lockstep stack (gatsbyImageData resolver)
provides:
  - gatsby-plugin-image 3.16.0 installed and SSR-registered in gatsby-config
  - blog-post surface migrated to GatsbyImage + gatsbyImageData (constrained)
  - tracedSVG removed from gatsby-remark-images options (BLURRED placeholder path)
  - og:image on post pages fixed via getSrc() — real absolute URL, zero [object Object]
affects: [05-02 (index-page + post-card migration), 05-03, 05-04, phase 6 performance verification]

# Tech tracking
tech-stack:
  added:
    - "gatsby-plugin-image 3.16.0 (exact pin, no caret; registry-verified — no 5.x line exists)"
  patterns:
    - "gatsbyImageData GraphQL resolver args: layout CONSTRAINED enum (uppercase unquoted), breakpoints, placeholder enum"
    - "getSrc() at call site for Seo image prop (string-only contract)"
    - "Image ? <GatsbyImage> : \"\" guard preserved for posts without featuredImage"

key-files:
  created: []
  modified:
  - package.json
  - yarn.lock
  - gatsby-config.js
  - src/templates/blog-post.js

key-decisions:
  - "gatsby-plugin-image pinned at 3.16.0 (exact) — research-verified correction of D-01's non-existent 5.16.0"
  - "layout uses the GraphQL enum form CONSTRAINED, not the lowercase string — Gatsby GraphQL validation rejects the string form (build gate caught it)"
  - "gatsby-image stays installed (^3.11.0) until 05-02 migrates the remaining three consumers"
  - "blog-post stays lazy-loaded; eager is reserved for the index hero (05-02)"
  - "banner parity (50vh) held out as a visual check — conditional absolute-fill CSS NOT applied (05-03)"

patterns-established:
  - "String entries in gatsby-config plugins array use double quotes (\"gatsby-plugin-image\") matching gatsby-plugin-sitemap/offline"
  - "Exact-pin lockstep discipline: \"gatsby-plugin-image\": \"3.16.0\" — no caret"

requirements-completed: [IMAG-01, IMAG-02, IMAG-03]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "gatsby-plugin-image 3.16.0 installed (exact pin), registered in gatsby-config plugins array, tracedSVG removed from gatsby-remark-images options"
    requirement: IMAG-01
    verification:
      - kind: unit
        ref: "grep package.json for \"gatsby-plugin-image\": \"3.16.0\" (exact pin, no caret)"
        status: pass
      - kind: unit
        ref: "grep gatsby-config.js for \"gatsby-plugin-image\" plugins entry and absence of tracedSVG"
        status: pass
      - kind: other
        ref: "yarn build exit 0 (full Gatsby build with plugin installed + registered)"
        status: pass
    human_judgment: false
  - id: D2
    description: "blog-post surface migrated to gatsbyImageData(gatsbyImageData CONSTRAINED layout) + GatsbyImage render with guard; og:image on post pages is a real absolute URL via getSrc with zero [object Object]"
    requirement: IMAG-01
    verification:
      - kind: unit
        ref: "grep src/templates/blog-post.js (import swap, getImage/getSrc, image={imageSrc}, breakpoints, BLURRED, featured-image className, no gatsby-image)"
        status: pass
      - kind: other
        ref: "yarn build exit 0; grep public/farfalla-blu/index.html for gatsby-image-wrapper present, og:image content=\"https://laryart.it/static/...\", 0 x \"object Object\", 0 gatsby-image-outer-wrapper"
        status: pass
      - kind: other
        ref: "yarn test — 10 suites / 85 tests pass (no regressions)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Blog-post 50vh banner visual parity (held-out check per UI-SPEC backstop E1 — landscape gap / portrait clip under constrained layout)"
    verification: []
    human_judgment: true
    rationale: "UI-SPEC backstop E1 is a human visual judgment on real post pages (landscape/portrait orientation) after build; the conditional absolute-fill CSS fix is documented (RESEARCH Pattern 3) but deliberately NOT applied preemptively — automation cannot decide whether the delta is observable or acceptable"

# Metrics
duration: 6 min
completed: 2026-08-20
status: complete
---

# Phase 05 Plan 01: Image Pipeline Wave-1 Tracer Summary

**gatsby-plugin-image 3.16.0 installed + SSR-registered, tracedSVG dropped, blog-post surface migrated end-to-end to GatsbyImage/gatsbyImageData with getSrc-wired og:image — the wave-1 tracer proves the whole install → config → query → render → built-HTML pipeline on one real page, with zero [object Object] in post HTML.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-20T08:01:32Z
- **Completed:** 2026-08-20T08:04:48Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Installed `gatsby-plugin-image` at the registry-verified **3.16.0** exact pin (correcting CONTEXT D-01's non-existent "5.16.0") — 2 new deps (gatsby-plugin-image + objectFitPolyfill), zero resolution conflicts; peer deps match Gatsby 5.16.1 / sharp 5.16.0 / React 18
- Registered `"gatsby-plugin-image"` in the gatsby-config plugins array (SSR registration — shared `.gatsby-image-wrapper` CSS present in built HTML; no inline-fallback styling)
- Removed `tracedSVG: true` from gatsby-remark-images options; all other options (maxWidth 1024, showCaptions, linkImagesToOriginal, loading lazy) verbatim (D-08)
- Migrated `src/templates/blog-post.js`: `fluid` fragments → `gatsbyImageData(layout: CONSTRAINED, quality: 80, breakpoints: [350, 700, 1050, 1400], placeholder: BLURRED)`; `Img` → `GatsbyImage` with guard preserved; og:image resolved via `getSrc()` → string into `<Seo image={imageSrc}>`
- Verified built output: `public/farfalla-blu/index.html` shows the plugin's `gatsby-image-wrapper`, `og:image content="https://laryart.it/static/..."` (real absolute URL), **0** occurrences of `[object Object]`, **0** legacy `gatsby-image-outer-wrapper`
- Full jest suite green (10 suites / 85 tests) — no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install gatsby-plugin-image 3.16.0, register in gatsby-config, remove tracedSVG (IMAG-01/02)** - `0e44ecd` (feat)
2. **Task 2: End-to-end blog-post migration: gatsbyImageData query, GatsbyImage render, getSrc og:image (IMAG-01/03, D-02/D-03/D-04/D-10)** - `a3c3ab4` (feat)

**Plan metadata:** `a3c3ab4` (docs: complete plan — commit containing SUMMARY.md)

## Files Created/Modified

- `package.json` - `"gatsby-plugin-image": "3.16.0"` exact pin added (alphabetized); `gatsby-image ^3.11.0` intentionally retained until 05-02
- `yarn.lock` - resolution tree for gatsby-plugin-image 3.16.0 + objectFitPolyfill 2.3.5
- `gatsby-config.js` - `"gatsby-plugin-image"` string entry added after `gatsby-plugin-sharp` (line 38); `tracedSVG: true` removed from gatsby-remark-images options (D-08 keeps every other option)
- `src/templates/blog-post.js` - import swap; `getImage`/`getSrc` data extraction; `<Seo image={imageSrc}>`; `<GatsbyImage>` render with preserved guard; query swapped to `gatsbyImageData` (also Prettier-reformatted the existing `props.previous &&` expression)

## Decisions Made

- **3.16.0 not 5.16.0:** RESEARCH.md's registry-verified correction supersedes CONTEXT D-01 — the 3.16.0 pin is lockstep-era (internal .16 family) and its peer deps match the installed stack exactly
- **`layout: CONSTRAINED` enum form:** Gatsby's GraphQL schema validates `ImageLayout` as an enum — the plan's documented lowercase string `"constrained"` was rejected at query-extraction (`ERROR #85924`); uppercase enum is the correct resolver-arg form (documented as deviation)
- **Double-quoted plugin entry:** registered as `"gatsby-plugin-image"` (matching the file's `gatsby-plugin-sitemap`/`gatsby-plugin-offline` string entries) to satisfy the acceptance gate's exact-grep; backticks would not match

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] gatsbyImageData `layout` requires the GraphQL enum form**
- **Found during:** Task 2 (tracer — build gate)
- **Issue:** The plan's documented arg `layout: "constrained"` (lowercase string) fails GraphQL validation at query-extraction: `Enum "ImageLayout" cannot represent non-enum value: "constrained"` — the plan's own acceptance grep (`layout: "constrained"`) is not satisfiable together with a green build
- **Fix:** Changed to the enum form `layout: CONSTRAINED` — the uppercase, unquoted resolver enum; no other args changed
- **Files modified:** src/templates/blog-post.js (query block)
- **Verification:** `yarn build` exit 0; built post HTML renders through `.gatsby-image-wrapper`; full jest suite green
- **Committed in:** `a3c3ab4` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix is required for the build to pass — the tracer served exactly its purpose (de-risking 05-02's arg-shape risk). No scope creep; the same enum form applies to the other surfaces in 05-02/05-03.

## Issues Encountered

- `yarn format` script runs Prettier over the whole repo (the script's glob ignores a file argument); it reformatted ~100 unrelated files. Reverted all non-task files with `git checkout`; only the task file's intended formatting change was kept — no stray formatting landed in the commits.
- `yarn build` twice caught the layout enum error before it could ship — the automated gate worked as designed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The tracer proves the full image pipeline: install → config registration → gatsbyImageData resolver (sharp 5.16.0) → GatsbyImage SSR render → built-HTML with real og:image URL
- 05-02 can now migrate index-page (hero: DOMINANT_COLOR + eager) and post-card/blog-list/blog-list-home (card: width/height 540/360 + cropFocus CENTER) with the verified arg shapes
- Held-out visual checks for the blog-post banner (E1) and hero (E3) remain open until the phase-level verifier

---
*Phase: 05-image-pipeline-seo-fixes*
*Completed: 2026-08-20*
