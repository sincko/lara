---
phase: 04-mui-removal-form-reliability
plan: 04
subsystem: ui
tags: [formik, emailjs, gatsby, jest, react, form-reliability]

# Dependency graph
requires:
  - phase: 04-mui-removal-form-reliability
    provides: 04-01 plain-SCSS form elements, 04-02 updated test mock/assertions, 04-03 @emailjs/browser + GATSBY_* env vars
provides:
  - Honest async submit chain: redirect only on .then, inline Italian error on .catch, values kept
  - disabled={isSubmitting} double-send guard on the submit button
  - Unskipped FORM-04 regression test with inline-alert assertion
  - Owner checkpoint handoff: Netlify GATSBY_EMAILJS_* env vars + cache-cleared redeploy + live form test
affects: [04-verify-work, phase-4-verification, netlify-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Formik async submit: return the sendForm promise so Formik awaits it and manages isSubmitting"
    - "Submit-level error state via Formik status (actions.setStatus) rendered as <p role=\"alert\">"

key-files:
  created: []
  modified:
    - src/components/formik.js
    - src/components/formik.test.js

key-decisions:
  - "Redirect to /thanks moved inside .then only; .catch sets status sendError + setSubmitting(false) without reset (D-11)"
  - "setStatus({ sendError: false }) at the top of onSubmit clears stale errors per submit (RESEARCH Open Question 1)"
  - "console.log calls kept in both handlers (RESEARCH Open Question 2 — matches D-04 'behave as before')"
  - "Added the missing `import emailjs from \"@emailjs/browser\"` to formik.test.js — the test body referenced emailjs but the file never imported it (invisible while it.skip was active)"

patterns-established:
  - "Pattern 1: honest async submit — return the promise chain from onSubmit; all post-send actions live inside .then/.catch"
  - "Pattern 2: submit-level error via Formik status + role=\"alert\" for testability"

requirements-completed: [FORM-03, FORM-04]

# Coverage metadata (#1602) — one entry per shipped deliverable.
coverage:
  - id: D1
    description: "Honest promise chain in formik.js — redirect only on send success, inline Italian error on failure, values kept, disabled={isSubmitting} double-send guard"
    requirement: FORM-04
    verification:
      - kind: unit
        ref: "src/components/formik.test.js#does NOT navigate to /thanks when emailjs.sendForm rejects — regression net for FORM-04"
        status: pass
      - kind: other
        ref: "yarn build && yarn test (full suite: 9 suites, 72 tests, 0 skipped)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Unskipped FORM-04 regression test with inline-alert assertion (D-12)"
    requirement: FORM-04
    verification:
      - kind: unit
        ref: "src/components/formik.test.js#does NOT navigate to /thanks when emailjs.sendForm rejects — regression net for FORM-04"
        status: pass
    human_judgment: false
  - id: D3
    description: "Owner checkpoint: GATSBY_EMAILJS_* env vars set in Netlify UI, cache-cleared redeploy, live form send verified end-to-end (D-09, A2)"
    requirement: FORM-03
    verification:
      - kind: manual
        ref: "User confirmed: Netlify GATSBY_EMAILJS_* env vars set, cache-cleared redeploy, live form send → /thanks + email received"
        status: pass
    human_judgment: true
    rationale: "Netlify UI configuration and live email delivery cannot be automated from the repo — requires the owner's dashboard access and a real inbox check"

# Metrics
duration: 3min
completed: 2026-08-19
status: complete
---

# Phase 4 Plan 4: False-Success Fix + Regression Net Summary

**Honest async submit chain in formik.js (redirect only on .then, inline Italian error on .catch, disabled-while-submitting button) with the FORM-04 regression test unskipped and green**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-19T20:14:57Z
- **Completed:** 2026-08-19T20:17:51Z
- **Tasks:** 3 of 3 (task 3 was a manual owner checkpoint — user-confirmed complete)
- **Files modified:** 2

## Accomplishments

- False-success bug killed: `onSubmit` now returns the `emailjs.sendForm` promise; `resetForm` + `document.location.assign("/thanks")` live only inside `.then`; `.catch` sets `status.sendError` and `setSubmitting(false)` without reset — values kept, no redirect (D-11, T-04-12 blocked)
- Double-send guard added: submit button `disabled={props.isSubmitting}` (UI-SPEC Delta Register, T-04-13 mitigated); Formik awaits the returned promise so `isSubmitting` stays true during the send (Pitfall 4)
- Inline send-error `<p className="send-error" role="alert">` with the locked Italian copy "Si è verificato un errore nell'invio del messaggio. Riprova." (UI-SPEC Copywriting Contract)
- FORM-04 regression net unskipped and green: rejected `sendForm` → no redirect + inline alert asserted via `getByRole("alert")` (D-12)
- Owner checkpoint documented and handed off: Netlify GATSBY_EMAILJS_* env vars + cache-cleared redeploy + live form test (D-09, A2, T-04-14 blocked)

## Task Commits

Each task was committed atomically:

1. **Task 1: Honest promise chain: redirect only in .then, inline error in .catch, disabled={isSubmitting} (FORM-04, D-11/D-13)** - `e8ebfca` (fix)
2. **Task 2: Unskip the FORM-04 regression test + assert the inline alert (FORM-04, D-12)** - `f48764f` (test)
3. **Task 3: Owner checkpoint: set GATSBY_EMAILJS_* in Netlify + cache-cleared redeploy + live form test** - COMPLETE (user-confirmed: env vars set, cache-cleared redeploy done, live form send → /thanks + email received)

**Plan metadata:** committed with this SUMMARY (docs)

## Files Created/Modified

- `src/components/formik.js` - onSubmit rewritten to return the sendForm promise; redirect/resetForm only in `.then`; `.catch` sets sendError status + setSubmitting(false); `setStatus({ sendError: false })` at submit start; button `disabled={props.isSubmitting}`; send-error `<p role="alert">` with locked Italian copy
- `src/components/formik.test.js` - `it.skip` removed from the FORM-04 regression test; stale FNDT-05/buggy-code comments removed; inline-alert assertion added; missing `emailjs` import added (Rule 3 fix)

## Decisions Made

- Redirect moved inside `.then` only; `.catch` keeps values and shows the inline error (D-11) — no deviation from plan
- `setStatus({ sendError: false })` at the top of onSubmit (RESEARCH Open Question 1 recommendation followed)
- `console.log` calls kept in both handlers (RESEARCH Open Question 2 — matches D-04 "behave as before")
- Added `import emailjs from "@emailjs/browser"` to the test file — the test body referenced `emailjs` but the file never imported it; the broken reference was invisible while `it.skip` was active (Rule 3 blocking issue)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing `emailjs` import in formik.test.js**
- **Found during:** Task 2 (unskip the FORM-04 regression test)
- **Issue:** The unskipped test failed with `ReferenceError: emailjs is not defined` at `emailjs.sendForm.mockRejectedValue(...)`. The test body referenced `emailjs` but the file never imported the module — the broken reference was invisible while the test was skipped (04-02's mock update changed the `jest.mock` module name but no import binding existed).
- **Fix:** Added `import emailjs from "@emailjs/browser"` after the `jest.mock` block (jest hoists the mock factory, so the import receives the mock object with `init`/`sendForm` jest.fn()s).
- **Files modified:** src/components/formik.test.js
- **Verification:** `yarn test src/components/formik.test.js` → 2/2 pass; full suite 9 suites / 72 tests / 0 skipped green
- **Committed in:** f48764f (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was necessary for the unskipped test to run at all — no scope creep; the plan's test-body contract ("keep the body exactly as-is") was preserved, only the missing import binding was added.

## Issues Encountered

- `yarn format` runs the repo-wide prettier glob (`**/*.{js,jsx,json,md}`), which reformatted ~120 unrelated files on first run. Reverted all non-target files with `git checkout --` and formatted only the target files with `./node_modules/.bin/prettier --write <file>` instead. No lasting impact.

## User Setup Required

**External services require manual configuration.** The plan's Task 3 was a manual owner checkpoint (not executable from the repo):

### Owner Checkpoint: Netlify env vars + live form test (FORM-03/FORM-04, D-09) — COMPLETE

1. **Netlify → Site settings → Environment variables:** add
   - `GATSBY_EMAILJS_PUBLIC_KEY=user_06xz85hi92oABMZqCIUu7`
   - `GATSBY_EMAILJS_SERVICE_ID=service_q3997uk`
   - `GATSBY_EMAILJS_TEMPLATE_ID=template_m6tzcmm`
   (values from `.env.example`, D-09)
2. **Redeploy with cleared cache** (Pitfall 2 — GATSBY_* values are inlined at build time; a cached deploy serves stale bundles)
3. **Live form test on laryart.it:** submit the contact form with valid data → expect redirect to /thanks and an email in the inbox (verifies A2: the EmailJS service/template are still active). Optionally verify the failure path by temporarily breaking a value → expect the inline Italian error, no redirect.
4. **Report the result back** so the phase can be marked verified.

**Status: PASS — user confirmed all four steps.** Env vars set in Netlify, cache-cleared redeploy done, live form send → /thanks + email received.

## Next Phase Readiness

- FORM-04 is code-complete and regression-tested: the form only reports success when the send resolves; failures show the inline Italian error with values kept; the double-send guard is in place
- The phase's only non-automatable verification (Netlify env vars + live send) has PASSED — user confirmed env vars set, cache-cleared redeploy, live form send → /thanks + email received
- Ready for `/gsd-verify-work 4`

## Self-Check: PASSED

- `src/components/formik.js` exists on disk: FOUND
- `src/components/formik.test.js` exists on disk: FOUND
- Commit `e8ebfca` (Task 1) exists in git log: FOUND
- Commit `f48764f` (Task 2) exists in git log: FOUND
- Plan-level verification: `yarn build` green; `yarn test` 9 suites / 72 tests / 0 skipped green; `yarn test src/components/formik.test.js -t "does NOT navigate"` passes; all grep criteria pass

---

*Phase: 04-mui-removal-form-reliability*
*Status: complete — 3 of 3 tasks complete*
*Completed: 2026-08-19*
