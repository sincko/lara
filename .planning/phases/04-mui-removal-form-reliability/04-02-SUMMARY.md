---
phase: 04-mui-removal-form-reliability
plan: 02
subsystem: testing
tags: [formik, jest, emailjs, mui-removal, regression-net]

# Dependency graph
requires:
  - phase: 04-mui-removal-form-reliability
    provides: 04-01 plain-CSS form (helper <p> with locked `error` class on both input and helper)
provides:
  - formik.test.js asserting the plain-CSS `error` class on the helper text elements
  - jest.mock("@emailjs/browser") with the default-export factory { init, sendForm }
  - @emailjs/browser 4.4.1 installed early (Rule 3 blocking fix) so the suite resolves the mock
affects:
  - 04-03 (emailjs swap: yarn remove emailjs-com completes the dependency transition; the mock rename is already in place)
  - 04-04 (false-success fix: unskips the it.skip regression test this plan deliberately left skipped)

# Tech tracking
tech-stack:
  added: ["@emailjs/browser 4.4.1 (installed early as Rule 3 blocking fix — the plan-pinned version)"]
  patterns:
    - "jest.mock factory returns the default-export object { init, sendForm } to match `import emailjs from \"@emailjs/browser\"` (Pitfall 5)"
    - "Error-class assertions target the helper <p> elements via screen.getByText, not the input (Pitfall 7)"

key-files:
  created: []
  modified:
    - src/components/formik.test.js
    - package.json
    - yarn.lock

key-decisions:
  - "Installed @emailjs/browser@4.4.1 early (Rule 3 blocking fix) — the plan's verify requires jest.mock(\"@emailjs/browser\") to resolve, but the package swap is 04-03's task; installing the plan-pinned version unblocks the suite without stealing 04-03's emailjs-com removal"
  - "Kept the it.skip FORM-04 regression test untouched — unskipping is 04-04's job (D-12, T-04-07 block disposition)"

patterns-established:
  - "jest.mock-before-import with the default-export factory object — matches the default-import style locked by D-07"
  - "Error-class assertion on the helper text element — the implementation must put the `error` class on the helper <p> (Pitfall 7)"

requirements-completed: [FORM-02]

# Coverage metadata (#1602) — one entry per shipped deliverable. Drives DETERMINISTIC UAT routing in verify-work.
coverage:
  - id: D1
    description: "formik.test.js updated: jest.mock(\"@emailjs/browser\") with default-export factory, Mui-error assertions replaced with toHaveClass(\"error\") on the helper text elements, it.skip regression test untouched"
    requirement: "FORM-02"
    verification:
      - kind: unit
        ref: "yarn test src/components/formik.test.js (1 passed, 1 skipped — exit 0)"
        status: pass
      - kind: other
        ref: "grep acceptance: jest.mock(\"@emailjs/browser\" present; zero emailjs-com; toHaveClass(\"error\") present; zero Mui-error; it.skip still present"
        status: pass
    human_judgment: false

# Metrics
duration: 5min
completed: 2026-08-19
status: complete
---

# Phase 4 Plan 2: Formik Test Update Summary

**formik.test.js now asserts the plain-CSS `error` class on the helper text elements and mocks @emailjs/browser — the Formik validation UX regression net is green against the 04-01 plain-element form**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-19T20:02:39Z
- **Completed:** 2026-08-19T20:07:09Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- jest.mock module renamed from `emailjs-com` to `@emailjs/browser` (D-10) with the factory kept as the default-export object `{ init: jest.fn(), sendForm: jest.fn() }` — matches `import emailjs from "@emailjs/browser"` (Pitfall 5)
- Mui-error class assertions replaced with `toHaveClass("error")` on the helper text elements (`screen.getByText("Nome richiesto")` / `screen.getByText("Email richiesta")`) — the locked class name from Pitfall 7, asserted exactly where the 04-01 implementation puts it
- Explanatory comment updated to reference the error class instead of Mui-error
- The `it.skip` FORM-04 regression test left untouched — unskipping is 04-04's job (D-12, T-04-07 block disposition)
- Suite green: `yarn test src/components/formik.test.js` → 1 passed, 1 skipped, exit 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Update formik.test.js: mock module rename + error class assertion (FORM-02, D-06/D-10)** - `c4225bc` (test)
2. **Rule 3 blocking fix: add @emailjs/browser 4.4.1 dependency** - `941a287` (chore)

**Plan metadata:** committed with the SUMMARY (docs)

## Files Created/Modified

- `src/components/formik.test.js` - jest.mock("@emailjs/browser") + toHaveClass("error") assertions on the helper texts; it.skip regression test untouched
- `package.json` - @emailjs/browser 4.4.1 added to dependencies (Rule 3 blocking fix)
- `yarn.lock` - @emailjs/browser tree added (Rule 3 blocking fix)

## Decisions Made

- Installed `@emailjs/browser@4.4.1` early as a Rule 3 blocking fix: the plan's verify requires the mock module to resolve, but the package swap is 04-03's task. Installing the plan-pinned version (RESEARCH.md §Standard Stack) unblocks the suite without stealing 04-03's `yarn remove emailjs-com` step — emailjs-com remains in package.json for 04-03 to remove.
- Kept the `it.skip` FORM-04 regression test skipped — D-12 assigns the unskip to 04-04 after the false-success fix; unskipping here would fail against the still-buggy onSubmit (T-04-07).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @emailjs/browser not installed — jest.mock resolution failed**

- **Found during:** Task 1 (verify step)
- **Issue:** `yarn test src/components/formik.test.js` failed with `Cannot find module '@emailjs/browser'` — the renamed jest.mock cannot resolve because the package swap is 04-03's task and the package was not yet installed
- **Fix:** Installed the plan-pinned `@emailjs/browser@4.4.1` (the exact version 04-03 will use, per RESEARCH.md §Standard Stack) via `yarn add @emailjs/browser@4.4.1`. emailjs-com was left in place — its removal stays 04-03's job.
- **Files modified:** package.json, yarn.lock
- **Verification:** `yarn test src/components/formik.test.js` → 1 passed, 1 skipped, exit 0
- **Committed in:** 941a287 (separate chore commit, keeping the task commit purely the test-file edit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix installs the exact dependency 04-03 will adopt, so 04-03's task 1 (`yarn add @emailjs/browser@4.4.1`) becomes a no-op add + `yarn remove emailjs-com`. No scope creep; the plan's own verify made the install unavoidable.

## Issues Encountered

- `yarn format` (the package script) globs the whole repo — avoided by running `yarn prettier --write src/components/formik.test.js` on the single file instead (same lesson as 04-01). The file was already Prettier-clean (unchanged).

## Known Stubs

- `it.skip("does NOT navigate to /thanks when emailjs.sendForm rejects...")` in `src/components/formik.test.js:31` — intentional deferred state: the regression net stays skipped until 04-04 fixes the false-success bug (D-12). Not a defect of this plan; 04-04 unskips it.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for 04-03 (emailjs swap): the jest.mock rename is already in place, and @emailjs/browser 4.4.1 is installed — 04-03's task 1 only needs `yarn remove emailjs-com` to complete the dependency transition
- Ready for 04-04 (false-success fix): the it.skip regression test is intact and waiting for the unskip after the onSubmit fix
- The suite is green against the 04-01 plain-CSS form — the Formik validation UX preservation (FORM-02) is proven

---

*Phase: 04-mui-removal-form-reliability*
*Completed: 2026-08-19*

## Self-Check: PASSED

- Task commit c4225bc verified in git log
- Rule 3 fix commit 941a287 verified in git log
- Key file exists on disk: src/components/formik.test.js
- Plan-level verification re-run: `yarn test src/components/formik.test.js` → 1 passed, 1 skipped, exit 0
- All acceptance greps pass: jest.mock("@emailjs/browser" present, zero emailjs-com, toHaveClass("error") present, zero Mui-error, it.skip still present
