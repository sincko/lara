---
phase: 04-mui-removal-form-reliability
plan: 01
subsystem: ui
tags: [mui-removal, formik, react-icons, scss, gatsby, emailjs]

# Dependency graph
requires:
  - phase: 03-core-upgrade
    provides: Gatsby 5.16.1 + Node 24 environment, sass (dart-sass) replacing node-sass
provides:
  - MUI-free contact form (plain input/textarea/button styled with theme variables)
  - react-icons ri swap in top-contacts (RiWhatsappLine/RiFacebookBoxLine)
  - @material-ui/core + @material-ui/icons removed from package.json/yarn.lock
  - .contact_form SCSS extended per UI-SPEC Visual Delta Register TARGET column
affects:
  - 04-02 (formik.test.js Mui-error → error assertion update builds on the new class names)
  - 04-03 (emailjs-com → @emailjs/browser swap touches the same formik.js)
  - 04-04 (false-success fix touches the same onSubmit body)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Plain-element Formik field: useField + <input> + helper <p>, error class on BOTH elements (Pitfall 7)"
    - "react-icons sizing via style={{ fontSize: \"24px\" }} — width/height attributes are ignored"
    - "SCSS form styling exclusively via _theme-variables.scss custom properties (D-02, no new colors)"

key-files:
  created: []
  modified:
    - src/components/formik.js
    - src/components/top-contacts.js
    - package.json
    - yarn.lock
    - src/assets/scss/style.scss

key-decisions:
  - "TextFieldConError renders static helperText always-visible and flips to the error class — preserves the current observable behavior where {...props} spread after helperText overrode the yup message"
  - "emailjs-com import and hardcoded init kept verbatim in formik.js — the @emailjs/browser swap and env-var move belong to 04-03, keeping this plan's diff purely MUI removal"
  - "onSubmit body (unconditional resetForm/setSubmitting/assign) kept verbatim — the false-success fix is 04-04's job, not this plan's"

patterns-established:
  - "Plain-element Formik field: useField + <input> + helper <p>, error class on BOTH elements (Pitfall 7)"
  - "react-icons sizing via style={{ fontSize: \"24px\" }} — width/height attributes are ignored"
  - "SCSS form styling exclusively via _theme-variables.scss custom properties (D-02, no new colors)"

requirements-completed: [FORM-01]

# Coverage metadata (#1602) — one entry per shipped deliverable. Drives DETERMINISTIC UAT routing in verify-work.
coverage:
  - id: D1
    description: "Contact form rewritten with plain input/textarea/button elements — Formik + yup wiring untouched, locked copy and attributes preserved"
    requirement: "FORM-01"
    verification:
      - kind: unit
        ref: "yarn test --testPathIgnorePatterns=formik.test.js (7 suites, 55 tests pass)"
        status: pass
      - kind: integration
        ref: "yarn build (Gatsby 5.16.1 SSG build succeeds)"
        status: pass
      - kind: other
        ref: "grep acceptance: zero @material-ui in src/components/formik.js; input/helper error classes; submit button; as=\"textarea\"; data-netlify; bot-field honeypot"
        status: pass
    human_judgment: false
  - id: D2
    description: "Top contacts icons swapped to react-icons ri set (RiWhatsappLine/RiFacebookBoxLine at 24px, inherited color)"
    requirement: "FORM-01"
    verification:
      - kind: unit
        ref: "yarn test --testPathIgnorePatterns=formik.test.js (7 suites, 55 tests pass)"
        status: pass
      - kind: integration
        ref: "yarn build (Gatsby 5.16.1 SSG build succeeds)"
        status: pass
      - kind: other
        ref: "grep acceptance: ri import, 2x style fontSize 24px, both hrefs preserved"
        status: pass
    human_judgment: false
  - id: D3
    description: "@material-ui/core and @material-ui/icons removed from package.json and yarn.lock with zero dangling imports"
    requirement: "FORM-01"
    verification:
      - kind: integration
        ref: "yarn install && yarn build && yarn test --testPathIgnorePatterns=formik.test.js (all green)"
        status: pass
      - kind: other
        ref: "grep -rn \"@material-ui\" src/ returns zero matches; package.json and yarn.lock clean"
        status: pass
    human_judgment: false
  - id: D4
    description: ".contact_form SCSS extended with .input/.helper/.submit/.send-error per UI-SPEC Visual Delta Register TARGET column"
    requirement: "FORM-01"
    verification:
      - kind: integration
        ref: "yarn build — compiled public/styles.*.css contains .contact_form .input/.submit/.helper/.send-error rules with theme variables"
        status: pass
      - kind: other
        ref: "grep acceptance: nested .textarea textarea selector flattened (Pitfall 6); commented MuiInput rule deleted; only theme variables used"
        status: pass
    human_judgment: true
    rationale: "Visual appearance of the plain-SCSS form (button color, borders, focus states) is a preservation contract (D-04) — no automated test asserts pixel-level fidelity against the MUI baseline; a human should confirm the form looks as before minus MUI"
  - id: D5
    description: "formik.test.js remains RED by design (asserts Mui-error) — excluded from this plan's gates, owned by 04-02"
    verification: []
    human_judgment: true
    rationale: "Intentional deferred state: the plan's gates exclude formik.test.js via --testPathIgnorePatterns; 04-02 updates the Mui-error assertion and turns it green. Not a defect of this plan."

# Metrics
duration: 5min
completed: 2026-08-19
status: complete
---

# Phase 4 Plan 1: MUI Removal Tracer Summary

**MUI v4 removed from the contact form and top contacts — plain input/textarea/button styled with existing theme variables, react-icons ri swap, and the .contact_form SCSS extended per the UI-SPEC TARGET column**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-19T19:55:25Z
- **Completed:** 2026-08-19T19:59:55Z
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments

- formik.js rewritten with plain elements: TextFieldConError → useField + `<input>` + helper `<p>` with the locked `error` class on BOTH elements; `Field as="textarea"` for messaggio; `<button className="submit">Invia</button>`
- top-contacts.js swapped to react-icons ri set (RiWhatsappLine/RiFacebookBoxLine at 24px, no inline color — `.icons-top a` owns color/hover)
- @material-ui/core ^4.12.4 and @material-ui/icons ^4.11.3 removed via `yarn remove`; yarn.lock regenerated; zero @material-ui imports remain in src/
- .contact_form SCSS extended with .input/.helper/.submit/.send-error implementing the UI-SPEC Visual Delta Register TARGET column using only theme variables; nested `.textarea textarea` selector flattened (Pitfall 6); commented MUI label rule deleted
- Full install → build → non-formik test loop green under Node 24 (7 suites, 55 tests) — the MUI-free pipeline is proven for waves 2

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite formik.js with plain input/textarea/button per UI-SPEC** - `8f053c0` (feat)
2. **Task 2: Swap top-contacts.js MUI icons for react-icons ri set** - `d0c56bc` (feat)
3. **Task 3: Remove @material-ui/core + @material-ui/icons from package.json** - `fa4cfcb` (feat)
4. **Task 4: Extend .contact_form SCSS with input/textarea/button/error styles** - `cc8cf9b` (feat)

**Plan metadata:** committed with the SUMMARY (docs)

## Files Created/Modified

- `src/components/formik.js` - Plain-element rewrite: useField + input + helper p, textarea field, submit button; Form attributes, honeypot, validationSchema, onSubmit body preserved verbatim
- `src/components/top-contacts.js` - react-icons ri swap (RiWhatsappLine/RiFacebookBoxLine, 24px, inherited color)
- `package.json` - @material-ui/core and @material-ui/icons removed from dependencies
- `yarn.lock` - Regenerated (MUI tree gone)
- `src/assets/scss/style.scss` - .contact_form extended with .input/.helper/.submit/.send-error per UI-SPEC TARGET

## Decisions Made

- TextFieldConError renders the static helperText always-visible and flips it to the `error` class — preserves the current observable behavior where `{...props}` spread after `helperText` overrode the yup message
- emailjs-com import and hardcoded init kept verbatim in formik.js — the @emailjs/browser swap and env-var move belong to 04-03, keeping this plan's diff purely MUI removal
- onSubmit body (unconditional resetForm/setSubmitting/assign) kept verbatim — the false-success fix is 04-04's job, not this plan's

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `yarn format` (the package script) globs the whole repo and reformatted ~100 unrelated files; restored everything except the task file with `git restore -- . ':!src/components/formik.js'` before committing. No lasting impact.
- `public/` contains a stale CSS artifact from a previous build alongside the fresh one; `public/` is gitignored build output, so no action needed — the fresh build's compiled CSS was verified to contain the new rules.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for 04-02 (formik.test.js update): the new `error` class lands on both the input and the helper `<p>`, which is exactly what 04-02's updated assertion targets
- Ready for 04-03 (emailjs swap): formik.js still imports emailjs-com with the hardcoded init, untouched by this plan
- Ready for 04-04 (false-success fix): the onSubmit body is preserved verbatim, ready for the promise-chain rewrite
- formik.test.js is EXPECTED RED (asserts Mui-error) — do not treat as a regression; 04-02 owns it

---

*Phase: 04-mui-removal-form-reliability*
*Completed: 2026-08-19*

## Self-Check: PASSED

- All 4 task commits verified in git log (8f053c0, d0c56bc, fa4cfcb, cc8cf9b)
- All key files exist on disk (formik.js, top-contacts.js, style.scss, package.json, yarn.lock)
- Plan-level verification re-run: yarn install + build + test (7 suites, 55 tests) green; zero @material-ui in src/, package.json, yarn.lock
