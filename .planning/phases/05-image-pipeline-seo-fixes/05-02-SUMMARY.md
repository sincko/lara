---
phase: 05-image-pipeline-seo-fixes
plan: 02
subsystem: images
tags: [gatsby-plugin-image, gatsby-image, gatsbyImageData, DOMINANT_COLOR, cropFocus, transformOptions, yarn]

# Dependency graph
requires:
  - phase: 05-image-pipeline-seo-fixes
    provides: 05-01 tracer — gatsby-plugin-image 3.16.0 installed + SSR-registered, gatsbyImageData arg shapes live-verified (layout CONSTRAINED enum form), blog-post surface migrated
provides:
  - IMAG-01 complete: all five surfaces (blog-post, index-page, blog-list, post-card, blog-list-home) render via gatsby-plugin-image; zero gatsby-image imports in src/; package removed from package.json + yarn.lock
  - IMAG-02 hero contract: DOMINANT_COLOR placeholder + eager loading on the index hero only; BLURRED everywhere else
  - Card crop parity: transformOptions { fit: COVER, cropFocus: CENTER } on both card queries (540x360 constrained)
  - Test co-changes: dead gatsby-image jest.mock removed, UPGR-01 + scaffold tests updated to the removed-package reality
affects: [05-03 (banner parity visuals), 05-04, phase 6 performance verification, /gsd-verify-work phase 5]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "gatsbyImageData hero args: layout CONSTRAINED enum, quality 80, breakpoints [960, 1440], placeholder DOMINANT_COLOR — eager loading override hero-only"
    - "gatsbyImageData card args: layout CONSTRAINED, width 540, height 360, quality 80, transformOptions { fit: COVER, cropFocus: CENTER }, placeholder BLURRED — byte-identical in both list queries"
    - "className=featured-image lands on the GatsbyImage wrapper (gatsby-image-wrapper gatsby-image-wrapper-constrained featured-image) — SCSS hooks preserved without style.scss edits"

key-files:
  created: []
  modified:
    - src/templates/index-page.js
    - src/components/post-card.js
    - src/templates/blog-list.js
    - src/components/blog-list-home.js
    - package.json
    - yarn.lock
    - src/templates/blog-list.test.js
    - phase3-upgrade-matrix.test.js
    - phase1-test-scaffold.test.js

key-decisions:
  - "layout: CONSTRAINED enum form (uppercase, unquoted) in all four gatsbyImageData queries — the lowercase string form is rejected by Gatsby GraphQL (ERROR #85924); inherited from 05-01's live-verified deviation"
  - "gatsby-image ^3.11.0 removed (D-05) only after the three migration commits; removal co-changed the three test files that asserted the legacy package (test-update discipline)"
  - "yarn remove gatsby-image regenerated yarn.lock with zero conflicts; gatsby-plugin-image 3.16.0 exact pin untouched"

patterns-established:
  - "Test co-change discipline: when a dependency removal invalidates contract tests, update the asserting tests in the SAME commit (CONTEXT canonical refs — Phase 4 precedent)"

requirements-completed: [IMAG-01, IMAG-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Index-page hero migrated: import { GatsbyImage, getImage }, query gatsbyImageData(layout: CONSTRAINED, quality: 80, breakpoints: [960, 1440], placeholder: DOMINANT_COLOR), GatsbyImage render with className=featured-image + loading=eager; no gatsby-image import; build green; built home HTML has gatsby-image-wrapper + featured-image class and zero gatsby-image-outer-wrapper"
    requirement: IMAG-02
    verification:
      - kind: unit
        ref: "grep src/templates/index-page.js (import swap, DOMINANT_COLOR, eager, breakpoints, no fluid fragment)"
        status: pass
      - kind: other
        ref: "yarn build exit 0; grep public/index.html (gatsby-image-wrapper present, featured-image class on wrapper, data-placeholder-image x2, gatsby-image-outer-wrapper count 0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Post-card surface migrated across all three files in one change: post-card.js GatsbyImage swap (objectFit cover, objectPosition 50% 50%, alt title - Featured image, className featured-image), blog-list.js pageQuery and blog-list-home.js StaticQuery byte-identical card queries (width 540, height 360, transformOptions fit COVER / cropFocus CENTER, BLURRED); /blog and /blog/2 render 9 cards each and home 6 cards with featured-image wrapper class, no legacy outer-wrapper anywhere in public/"
    requirement: IMAG-01
    verification:
      - kind: unit
        ref: "grep the three files (import swap, transformOptions x2, width 540 / height 360, no maxWidth/maxHeight, no GatsbyImageSharpFluid anywhere in src/)"
        status: pass
      - kind: other
        ref: "yarn build exit 0; grep public/blog/index.html + public/blog/2/index.html + public/index.html (gatsby-image-wrapper + featured-image present per card, outer-wrapper 0, card counts 9/9/6)"
        status: pass
    human_judgment: false
  - id: D3
    description: "gatsby-image ^3.11.0 removed from package.json and yarn.lock (yarn remove); zero gatsby-image imports in src/; full install → build → test loop green (85 tests / 10 suites); blog-list.test.js dead gatsby-image mock dropped, UPGR-01 and scaffold contract tests updated to the removed-package reality"
    verification:
      - kind: unit
        ref: "grep package.json + yarn.lock for gatsby-image (0 matches); grep src/ for imports (0 matches); grep public/ for gatsby-image-outer-wrapper (0 files)"
        status: pass
      - kind: other
        ref: "yarn install && yarn build && yarn test — exit 0, 10 suites / 85 tests pass"
        status: pass
    human_judgment: false

# Metrics
duration: 16 min
completed: 2026-08-20
status: complete
---

# Phase 05 Plan 02: Wave-2 Horizontal Migration Summary

**All five featured-image surfaces (index hero, post cards on both lists, blog-post from wave 1) now render through gatsby-plugin-image; gatsby-image is gone from package.json and yarn.lock; the index hero carries the DOMINANT_COLOR + eager contract and the card queries lock the legacy 540x360 center crop via transformOptions — IMAG-01 and IMAG-02 fully complete.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-20T08:18:29Z
- **Completed:** 2026-08-20T08:21:53Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Migrated the index-page hero: `Img`/`fluid` → `GatsbyImage`/`gatsbyImageData(layout: CONSTRAINED, quality: 80, breakpoints: [960, 1440], placeholder: DOMINANT_COLOR)` with `loading="eager"` — the only eager + DOMINANT_COLOR surface (D-07). Built home HTML confirms `data-placeholder-image` renders and the wrapper carries `featured-image` (SCSS hooks intact, zero style.scss edits)
- Migrated the post-card surface in one commit across three files: `GatsbyImage` with `objectFit="cover"`/`objectPosition="50% 50%"`, and the two card queries swapped to `gatsbyImageData(width: 540, height: 360, transformOptions: { fit: COVER, cropFocus: CENTER }, placeholder: BLURRED)` — byte-identical after the swap, restoring the legacy center crop (D-03)
- Removed `gatsby-image ^3.11.0` from package.json + yarn.lock via `yarn remove`; zero imports remain in src/, and the full `yarn install && yarn build && yarn test` loop is green (10 suites / 85 tests)
- Verified built output: `gatsby-image-wrapper` on / (hero), /blog (9 cards), /blog/2 (9 cards), /; `gatsby-image-outer-wrapper` count 0 repo-wide; wrapper class on the card row matches the SCSS hooks
- Test co-changes in the removal commit: dropped the now-dead `jest.mock("gatsby-image")` from blog-list.test.js (module no longer exists), UPGR-01 asserts removal, and the scaffold test now expects the 4 remaining mocks

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate index-page hero: DOMINANT_COLOR + eager (IMAG-01/02, D-03/D-07)** - `864f5ad` (feat)
2. **Task 2: Migrate card surface (post-card + blog-list + blog-list-home) (IMAG-01, D-02/D-03/D-04)** - `44682ea` (feat)
3. **Task 3: Remove gatsby-image from package.json + yarn.lock (IMAG-01, D-05)** - `d79a221` (feat)

**Plan metadata:** `d79a221` (docs: complete plan — commit containing SUMMARY.md)

## Files Created/Modified

- `src/templates/index-page.js` - import `{ GatsbyImage, getImage }`; `const Image = getImage(...)` (guard shape kept, null-safe); hero query `gatsbyImageData(layout: CONSTRAINED, quality: 80, breakpoints: [960, 1440], placeholder: DOMINANT_COLOR)`; `<GatsbyImage image={Image} alt className="featured-image" loading="eager" />`
- `src/components/post-card.js` - import swap; `<GatsbyImage image={getImage(...)} objectFit="cover" objectPosition="50% 50%" alt={...} className="featured-image" />` inside the existing Link wrapper; no loading prop (lazy default is the contract)
- `src/templates/blog-list.js` - card query in pageQuery swapped to `gatsbyImageData(width: 540, height: 360, quality: 80, transformOptions: { fit: COVER, cropFocus: CENTER }, placeholder: BLURRED)`
- `src/components/blog-list-home.js` - identical swap in the StaticQuery (byte-identical to blog-list's)
- `package.json` - `"gatsby-image": "^3.11.0"` removed; `gatsby-plugin-image: 3.16.0` exact pin untouched
- `yarn.lock` - gatsby-image resolution tree gone
- `src/templates/blog-list.test.js` - dead `jest.mock("gatsby-image")` block removed (post-card fully mocked); comment updated
- `phase3-upgrade-matrix.test.js` - UP-01 test renamed + asserts `gatsby-image` is `undefined` now
- `phase1-test-scaffold.test.js` - "5 mocks" → "4 mocks", gatsby-image mock reference removed

## Decisions Made

- **Enum form across all four queries:** `layout: CONSTRAINED` (uppercase, unquoted) — the lowercase string from the plan arg matrix is rejected by Gatsby's GraphQL schema (ERROR #85924); inherited as the verified form from 05-01 and applied to all four 05-02 query sites
- **transformOptions locked on the cards:** `{ fit: COVER, cropFocus: CENTER }` is REQUIRED — the default `cropFocus` is attention/saliency which would shift the crop from the legacy center (T-05-06); both list queries carry it
- **Removal co-changed three contract tests in the same commit:** the plan's Task-3 gate (`yarn test` exit 0) cannot pass while `jest.mock("gatsby-image")` references the removed module and UP-01 asserts the old pin — test-update discipline (Phase 4 precedent, CONTEXT canonical refs) applied
- **No `style.scss` edits:** `className="featured-image"` verified to land on the GatsbyImage wrapper (`gatsby-image-wrapper gatsby-image-wrapper-constrained featured-image`) so all `.post-card .featured-image` SCSS hooks keep matching (UI-SPEC parity rule 4)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test suite broken by gatsby-image removal — co-changed the three asserting tests**
- **Found during:** Task 3 (removal — `yarn test` gate)
- **Issue:** `yarn remove gatsby-image` broke two suites: (a) `blog-list.test.js:7` — `jest.mock("gatsby-image", ...)` now fails module resolution ("Cannot find module 'gatsby-image'"); (b) `phase3-upgrade-matrix.test.js:49-52` — UPGR-01 asserts `pkg.dependencies["gatsby-image"] === "^3.11.0"`, now false; (c) `phase1-test-scaffold.test.js:96` — asserts the removed mock declaration exists
- **Fix:** (a) deleted the dead gatsby-image mock (post-card is mocked entirely, so no gatsby-plugin-image mock is needed — per PATTERNS.md the mock block is dead); (b) UPGR-01 test now asserts `gatsby-image` is `undefined` (D-05); (c) scaffold test expects the 4 remaining mocks (was 5)
- **Files modified:** src/templates/blog-list.test.js, phase3-upgrade-matrix.test.js, phase1-test-scaffold.test.js
- **Verification:** `yarn test` → 10 suites / 85 tests pass; `yarn install && yarn build && yarn test` exit 0
- **Committed in:** `d79a221` (Task 3 commit — same-change co-change per test-update discipline)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for the Task-3 acceptance gate (`yarn test` exit 0). The test updates assert the post-removal reality; the file's comments now describe the actual mock set. No scope creep — no test behavior beyond the gatsby-image assertion was touched.

## Issues Encountered

- None after the deviation above was resolved — the automated gates caught both failures at the introducing commit, exactly as designed (T-05-10 block succeeded: removal happened only after the zero-import grep passed, and the test gate surfaced the contract tests needing the same-change update)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- IMAG-01 fully complete: all five surfaces (blog-post, index-page, blog-list, post-card, blog-list-home) on gatsby-plugin-image; zero legacy imports in src/; package + lockfile clean
- IMAG-02 fully complete: DOMINANT_COLOR + eager hero-only contract enforced and verified in built HTML; BLURRED everywhere else; tracedSVG already removed (05-01)
- Held-out visual checks remain open for the phase-level verifier: hero renders on / after build (must-haves truth #6), cards at legacy center crop on /blog (truth #7)
- gatsby-image removal unlocks the Phase 3 D-01 follow-ups (sharp 5.x lockstep simplification)

---
*Phase: 05-image-pipeline-seo-fixes*
*Completed: 2026-08-20*

## Self-Check: PASSED

- SUMMARY.md exists at `.planning/phases/05-image-pipeline-seo-fixes/05-02-SUMMARY.md`
- All commits present: `864f5ad` (Task 1), `44682ea` (Task 2), `d79a221` (Task 3), `89a9aab` (docs)
- All four migrated source files exist: index-page.js, post-card.js, blog-list.js, blog-list-home.js
- Final verification re-run: `yarn install && yarn build && yarn test` exit 0 (10 suites / 85 tests); zero `gatsby-image` in package.json/yarn.lock/src/; zero `gatsby-image-outer-wrapper` in public/
