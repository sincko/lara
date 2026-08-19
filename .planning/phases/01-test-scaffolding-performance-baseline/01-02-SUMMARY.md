---
phase: 01-test-scaffolding-performance-baseline
plan: 02
subsystem: testing
tags: [jest, testing-library, gatsby, pagination, navigation, gatsby-node, regression-net]

# Dependency graph
requires:
  - phase: 01-test-scaffolding-performance-baseline
    provides: jest 29 pipeline (jest.config.js moduleNameMapper, babel-preset-gatsby transform, __mocks__/gatsby.js, jest.setup.js jest-dom)
provides:
  - src/templates/blog-list.test.js: pagination math locked in for pages 1-3 of 3 (isFirst/isLast/prevPage/nextPage, blogSlug "/blog/")
  - src/components/navigation.test.js: handleToggleClick state toggle covered (menu-trigger is-active flip)
  - gatsby-node.test.js: createPages covered under node env with injected mocks — post pages, /blog pagination at 9/page, prev/next wiring, panicOnBuild
  - jest.setup.js hardened for node-env suites (typeof window guard)
affects: [01-03/01-04 (independent), phase 3 (Gatsby 5.16 upgrade — suites must stay green), phase 4 (FORM-04 un-skip; gatsby-node context wiring reference)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - jsdom component suites scope queries with within() on a container (mocked Layout renders Pagination directly)
    - jest.mock of gatsby-image with __esModule: true + renderable-JSX component mocks to keep trees light
    - node-env suite (/** @jest-environment node */) requiring ./gatsby-node with injected graphql/actions/reporter
    - Deterministic inline fixtures (10 posts) instead of real content — pagination expectations derived from fixture math

key-files:
  created:
    - src/templates/blog-list.test.js
    - src/components/navigation.test.js
    - gatsby-node.test.js
  modified:
    - jest.setup.js

key-decisions:
  - "gatsby-node.test.js lives at repo root next to gatsby-node.js → require('./gatsby-node') (plan's '../gatsby-node' typo corrected at execution)"
  - "gatsby-node context stores the node object directly (posts[index+1].node) — assertions read context.previous.id, not .node.id (plan phrasing corrected to match gatsby-node.js lines 39-42)"
  - "jest.setup.js matchMedia mock guarded by typeof window check — node-env suites otherwise crash the setup file"
  - "formik.test.js 'Mui-error' act() warning is pre-existing (plan 01 suite) — no assertion impact, suite green"

patterns-established:
  - "Pagination-math verification via rendered Link hrefs (behavioral, not implementation) — pages 1/2/3 of 3"
  - "Class-component state verified through rendered className (menu-trigger is-active flip)"

requirements-completed: [FNDT-05]

coverage:
  - id: D1
    description: "blog-list pagination math verified for all three pagination positions (isFirst, middle, isLast) via rendered Link hrefs and is-active class"
    requirement: FNDT-05
    verification:
      - kind: unit
        ref: "src/templates/blog-list.test.js#Pagination"
        status: pass
    human_judgment: false
  - id: D2
    description: "navigation handleToggleClick state toggle verified through rendered button class (on/off/on)"
    requirement: FNDT-05
    verification:
      - kind: unit
        ref: "src/components/navigation.test.js#Navigation toggle"
        status: pass
    human_judgment: false
  - id: D3
    description: "gatsby-node createPages verified under node env with injected mocks: post pages + /blog pagination, prev/next context wiring, panicOnBuild on GraphQL errors"
    requirement: FNDT-05
    verification:
      - kind: unit
        ref: "gatsby-node.test.js#createPages"
        status: pass
    human_judgment: false

# Metrics
duration: 9min
completed: 2026-08-19
status: complete
---

# Phase 1 Plan 2: Blog-list Pagination + Navigation Toggle + gatsby-node Page Creation Suites Summary

**Three new green test suites expanding the regression net: blog-list pagination math locked in for pages 1-3 of 3 via rendered Link hrefs, navigation menu-trigger is-active toggle, and gatsby-node createPages covered under the node environment with injected mocks (post pages, /blog pagination at 9/page, panicOnBuild) — `yarn test` exits 0 with 4 suites / 8 passed + 1 skipped**

## Performance

- **Duration:** 9 min
- **Started:** 2026-08-19T06:58:00Z
- **Completed:** 2026-08-19T07:07:17Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- **`src/templates/blog-list.test.js`** — `describe("Pagination")` with 3 passing tests: page 1 of 3 (no Previous, Next → `/blog/2`, number 1 is-active), page 2 of 3 (Previous → `/blog/` prevPage special case, Next → `/blog/3`), page 3 of 3 (Previous → `/blog/2`, no Next, number 3 is-active). All 5 required jest.mock calls (gatsby-image with `__esModule: true`, post-card, @reach/router, layout, seo) before the BlogIndex import; Layout/Seo mocks return renderable JSX so the Pagination block renders inside the mocked tree. Literal href strings "/blog/2" and "/blog/" asserted (acceptance criterion 3)
- **`src/components/navigation.test.js`** — `describe("Navigation toggle")`: button className has no "is-active" initially, gains it after fireEvent.click, loses it on the second click (handleToggleClick flips showMenu)
- **`gatsby-node.test.js`** — `describe("createPages")` at repo root, `/** @jest-environment node */`: (1) 10-post inline fixture → `/post-1`..`/post-10` + `/blog` + `/blog/2` (Math.ceil(10/9)=2, no `/blog/3`), no panicOnBuild; (2) prev/next context wiring per gatsby-node.js lines 39-42 — `/post-1` has previous = next edge's node, next = null; middle and last-post boundary cases; (3) errors fixture → `panicOnBuild("Error while running GraphQL query.")` and no pages created
- **FNDT-05 completion:** all four D-04 priority targets (formik validation — plan 01, blog-list pagination math, navigation toggle, gatsby-node page creation) now have at least one passing assertion (D-06). D-10 co-location honored.
- `yarn test` exits 0: 4 suites, 8 passed, 1 skipped (the intentional plan-01 FORM-04 red test), 0 failed. No production code modified — only test files + the jest.setup.js environment guard.

## Task Commits

Each task was committed atomically:

1. **Task 1: Test blog-list pagination math — pages 1, 2, 3 of 3 via rendered Link hrefs** - `3825e06` (test)
2. **Task 2: Test navigation handleToggleClick state toggle** - `c58d1a5` (test)
3. **Task 3: Test gatsby-node createPages in a node environment** - `a0b024c` (test, incl. jest.setup.js guard)
4. **Task 3 follow-up: Prettier formatting** - `969321d` (style)

**Plan metadata:** `…` (docs: complete plan — committed with this SUMMARY)

## Files Created/Modified

- `src/templates/blog-list.test.js` - Pagination math suite (3 cases: pages 1/2/3 of 3) with 5 jest.mock calls, within() scoping on `.pagination`
- `src/components/navigation.test.js` - Navigation toggle suite (initial off, click on, click off)
- `gatsby-node.test.js` - createPages suite at repo root (3 cases: pagination + post pages, prev/next wiring, panicOnBuild), 10-post deterministic fixture
- `jest.setup.js` - `typeof window !== "undefined"` guard added around the matchMedia mock so node-env suites do not crash the setup file (auto-fix, Rule 3)

## Decisions Made

- **gatsby-node.test.js require path:** plan text said `require("../gatsby-node")` but the file lives at repo root next to gatsby-node.js (plan's own structural spec) — used `require("./gatsby-node")`. The plan's artifact location spec wins over the typo in the code sample.
- **Prev/next context assertions:** the plan described `context.previous.node`; actual gatsby-node.js stores the node object directly (`posts[index + 1].node` at line 41). Assertions use `context.previous.id` — the code's real semantics (production code cannot change this phase).
- **jest.setup.js guard:** node-env suites have no `window`; the plan-01 matchMedia mock crashed gatsby-node.test.js. Added `typeof window !== "undefined"` guard — required for the planned node-env suite to run at all.
- **Prettier:** two test files needed a `prettier --write` pass to match repo style (trailing commas on multi-line args per prettier 3 config) — committed separately as a style commit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] jest.setup.js crashed gatsby-node.test.js (no `window` in node env)**
- **Found during:** Task 3 (first run of gatsby-node.test.js)
- **Issue:** `jest.setup.js` line 3 `if (!window.matchMedia)` throws `ReferenceError: window is not defined` under `@jest-environment node` — every node-env suite would fail
- **Fix:** guarded with `if (typeof window !== "undefined" && !window.matchMedia)`
- **Files modified:** jest.setup.js
- **Verification:** `yarn test gatsby-node.test.js` green; full `yarn test` green (4 suites)
- **Committed in:** a0b024c (Task 3 commit)

**2. [Rule 1 - Bug] Test asserted wrong context shape for prev/next**
- **Found during:** Task 3 (test run, second suite)
- **Issue:** Plan described `context.previous.node` — actual gatsby-node.js stores the node directly (line 41: `posts[index + 1].node`), so `previous.node.id` threw TypeError
- **Fix:** Assert `context.previous.id` / `context.next.id` (matches lines 39-42 exactly; the plan's "exact ordering semantics" intent preserved)
- **Files modified:** gatsby-node.test.js
- **Verification:** context-wiring suite passes; full `yarn test` green
- **Committed in:** a0b024c (Task 3 commit)

**3. [Rule 1 - Bug] Prettier style violations in two test files**
- **Found during:** Post-task 3 CONVENTIONS check (semicolon scan + prettier --check)
- **Issue:** blog-list.test.js and gatsby-node.test.js had a few lines prettier would reformat (e.g. multi-line jest.mock calls, trailing commas)
- **Fix:** `yarn prettier --write` on the two files — formatting-only diff
- **Files modified:** src/templates/blog-list.test.js, gatsby-node.test.js
- **Verification:** `yarn prettier --check` all 3 test files passes; `yarn test` still green (4 suites, 8 passed, 1 skipped)
- **Committed in:** 969321d (style)

**Total deviations:** 3 auto-fixed (2 blocking/bug, 1 formatting)
**Impact on plan:** All necessary for green execution; no production code touched, no scope creep.

## Issues Encountered

- **node-env setup crash:** The matchMedia mock in jest.setup.js (from plan 01, an insurance for MUI) was unguarded and crashed the first gatsby-node.test.js run — fixed with the typeof window guard (deviation 1). Plan 01's jsdom-only assumption is now explicitly broadened to all environments.
- **Plan text typo (require path):** `require("../gatsby-node")` in the Task 3 action vs the file's actual location at repo root — resolved to `require("./gatsby-node")` (decision above).
- **Pre-existing warning (not introduced by this plan):** formik.test.js emits an `act` warning at render time in full-suite runs (present since plan 01's suite; the suite still passes). Noted, not fixed — out of scope for a test-only plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **FNDT-05 fully covered:** all four priority targets have passing assertions; `yarn test` exits 0 on 4 suites.
- **Ready for the next plan:** 01-03 (Lighthouse/PSI baseline capture) and 01-04 — no test-half interference; baseline tooling does not touch the jest pipeline.
- **Phase 4 (FORM-04):** the skipped red test in src/components/formik.test.js remains the one-commit un-skip target; un-skip after fixing formik.js line 51.
- **Phase 3 note:** when Gatsby 5.16 arrives, re-run `yarn test` — the gatsby-node suite exercises createPages with injected mocks, so the upgrade risk surface is the jsdom suites only.

---

*Phase: 01-test-scaffolding-performance-baseline*
*Completed: 2026-08-19*

## Self-Check: PASSED

- Files exist: src/templates/blog-list.test.js, src/components/navigation.test.js, gatsby-node.test.js (all on disk, all prettier-clean)
- Commits present: 3825e06 (Task 1 test), c58d1a5 (Task 2 test), a0b024c (Task 3 test), 969321d (style) — verified in git log
- `yarn test` exits 0: 4 suites passed, 8 passed + 1 skipped, 0 failed
- No production source modified: `git status` shows only the 3 test files + jest.setup.js (+ untracked .planning/config.json, pre-existing)
- Acceptance criteria met: 5 jest.mock calls present before BlogIndex import (grep-counted 1 each); literal hrefs "/blog/2" and "/blog/" in test source; absence-of-Next asserted; gatsby-node paths /blog + /blog/2 asserted for the 10-post fixture; panicOnBuild asserted; semicolon scan clean (only for-loop header + comment usage)
