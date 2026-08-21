---
phase: 01-test-scaffolding-performance-baseline
plan: 01
subsystem: testing
tags: [jest, testing-library, gatsby, formik, yup, emailjs, regression-net]

# Dependency graph
requires:
  - phase: 00-planning
    provides: research on the official Gatsby Jest scaffold (manual __mocks__/gatsby.js, babel-preset-gatsby)
provides:
  - Working `yarn test` pipeline (jest 29.7.0) exiting 0 on a real suite
  - Official Gatsby scaffold: jest.config.js, jest-preprocess.js, jest.setup.js, loadershim.js
  - Manual gatsby mocks: __mocks__/gatsby.js (Link/graphql/useStaticQuery), __mocks__/file-mock.js
  - src/components/formik.test.js: green yup validation suite + skipped D-05 failure-path regression net (FORM-04)
affects: [01-02 (blog-list/navigation/gatsby-node suites reuse the scaffold), phase 4 (FORM-04 un-skip target)]

# Tech tracking
tech-stack:
  added:
    - jest@29.7.0, babel-jest@29.7.0, jest-environment-jsdom@29.7.0
    - @testing-library/react@16.3.2, @testing-library/dom@^10 (peer, added at execution)
    - @testing-library/jest-dom@6.6.3, identity-obj-proxy@3.0.0, babel-preset-gatsby@3.16.0
  patterns:
    - Official Gatsby manual-mock jest scaffold (babel-preset-gatsby transform + root __mocks__/)
    - Behavioral form testing via RTL fireEvent + jest-dom matchers (module-local logic reached through UI)
    - emailjs-com mocked before FormikContact import (module-load init side effect, D-07)
    - Red test preserved via it.skip + cross-plan comment (FNDT-05 → FORM-04)

key-files:
  created:
    - jest.config.js
    - jest-preprocess.js
    - jest.setup.js
    - loadershim.js
    - __mocks__/gatsby.js
    - __mocks__/file-mock.js
    - src/components/formik.test.js
  modified:
    - package.json (test script → "jest --watch=false"; 8 new devDependencies)
    - yarn.lock

key-decisions:
  - "Test script replaced: 'jest --watch=false' (D-03) — yarn test now exits 0"
  - "gatsby-plugin-jest skipped (E404 unpublished, D-01 mechanism swap) — official manual __mocks__/gatsby.js adopted"
  - "@testing-library/dom added as explicit devDependency (yarn 1 does not auto-install RTL 16 peer deps — discovered at first run)"
  - "yup error strings NOT asserted verbatim: TextFieldConError spreads {...props} after helperText, so the static 'Nome richiesto'/'Email richiesta' props override yup messages; validation state asserted via Mui-error class flip"
  - "location stub uses delete window.location + defineProperty per research A7 fallback"

requirements-completed: [FNDT-05]

coverage:
  - id: D1
    description: "Jest 29 + babel-preset-gatsby scaffold with manual gatsby mocks; yarn test exits 0 (FNDT-05 success criterion 1)"
    requirement: FNDT-05
    verification:
      - kind: unit
        ref: "command `yarn test` exits 0 with the formik suite running"
        status: pass
    human_judgment: false
  - id: D2
    description: "FormikContact yup validation errors surface through the UI (at least one passing assertion)"
    requirement: FNDT-05
    verification:
      - kind: unit
        ref: "src/components/formik.test.js#surfaces yup validation errors for empty required fields through the UI"
        status: pass
    human_judgment: false
  - id: D3
    description: "D-05 submit failure path covered by a preserved red test (it.skip, FORM-04 comment, suite stays green)"
    requirement: FNDT-05
    verification:
      - kind: unit
        ref: "src/components/formik.test.js#does NOT navigate to /thanks when emailjs.sendForm rejects — regression net for FORM-04 (skipped; verified red when unskipped)"
        status: pass
    human_judgment: false

# Metrics
duration: 24min
completed: 2026-08-19
status: complete
---

# Phase 1 Plan 1: Jest Test Scaffolding + Formik Validation Suite Summary

**Jest 29 + @testing-library/react pipeline wired end-to-end with the official Gatsby manual-mock scaffold (babel-preset-gatsby, __mocks__/gatsby.js), `yarn test` exits 0 on a green formik validation suite, plus a preserved skipped red test documenting the form false-success bug for Phase 4**

## Performance

- **Duration:** 24 min
- **Started:** 2026-08-19T07:02:00Z
- **Completed:** 2026-08-19T07:26:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- 8 pinned devDependencies installed (7 planned + @testing-library/dom peer fix) with exact versions, `test` script replaced with `jest --watch=false` (D-03) — `yarn test` exits 0 with a real suite
- Official Gatsby Jest scaffold created: jest.config.js (transform/moduleNameMapper/ignores/globals/setup), jest-preprocess.js (babel-preset-gatsby transformer), jest.setup.js (jest-dom v6 root import + matchMedia guard), loadershim.js, __mocks__/gatsby.js (Link → `<a href>`, graphql, useStaticQuery), __mocks__/file-mock.js
- `src/components/formik.test.js` — behavioral validation suite (RTL render + fireEvent on "Invia", jest-dom assertions) passing with 1 real assertion; emailjs-com mocked before import so the hardcoded key never executes (D-07, threat T-1-02)
- D-05 failure-path regression test preserved as `it.skip` with explicit FNDT-05 → FORM-04 comment; verified genuinely red (fails by design when unskipped — the exact Phase 4 un-skip target)
- Tracer feedback gate passed: after Task 1 commit, re-ran `yarn test` — green end-to-end before expanding to Task 2

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire the jest pipeline end-to-end — pinned devDeps, official scaffold, green formik validation test** - `98f3777` (feat)
2. **Task 2: Preserve the D-05 failure-path regression test as a skipped red test for Phase 4 (FORM-04)** - `3b07eba` (test)

**Plan metadata:** `…` (docs: complete plan — committed with this SUMMARY)

## Files Created/Modified

- `package.json` - test script replaced with `jest --watch=false`; 8 devDependencies added (jest, babel-jest, jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/dom, identity-obj-proxy, babel-preset-gatsby)
- `yarn.lock` - New devDep resolution entries (2718-line diff includes existing prismjs/react-icons bumps from the working tree)
- `jest.config.js` - Official Gatsby config: babel transform, SCSS→identity-obj-proxy, images→file-mock, @reach/router→@gatsbyjs/reach-router, transformIgnorePatterns for gatsby ESM, __PATH_PREFIX__ globals, setupFiles/setupFilesAfterEnv
- `jest-preprocess.js` - babel-jest transformer with `presets: ["babel-preset-gatsby"]`
- `jest.setup.js` - `import "@testing-library/jest-dom"` (v6 root entry, not v5 extend-expect) + window.matchMedia mock
- `loadershim.js` - `global.___loader = { enqueue: jest.fn() }`
- `__mocks__/gatsby.js` - jest.requireActual("gatsby") + graphql/Link (renders `<a href={to}>`)/useStaticQuery overrides
- `__mocks__/file-mock.js` - `module.exports = "test-file-stub"`
- `src/components/formik.test.js` - validation suite (passing) + submit-failure regression (it.skip)

## Decisions Made

- **Test script**: `jest --watchAll=false` (matching D-03 semantics; `--watchAll` used in local runs)
- **Scaffold source**: official Gatsby docs manual-mock pattern (research Pattern 1) — verbatim config keys; `@reach/router` mapping added because Gatsby aliases it only inside webpack (research Pitfall 3)
- **@testing-library/dom**: added explicitly — yarn 1 does not auto-install RTL's peer; discovered via "Cannot find module" at first run (research assumed it would be transitive)
- **yup message assertions**: NOT asserted verbatim. TextFieldConError spreads `{...props}` AFTER `helperText={errorText}` (formik.js:20) so the raw DOM always shows the static helperText strings ("Nome richiesto"/"Email richiesta") — the validation signal is the error STATE: helper text flips to the Mui-error class. Asserted the error-state flip instead (plan instructs asserting the ACTUAL strings observed, acceptance criterion 6).
- **location stub**: used `delete window.location` + `Object.defineProperty` (research A7 fallback) since jsdom location may be non-configurable

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @testing-library/dom as explicit devDependency**
- **Found during:** Task 1 (first test run)
- **Issue:** `Cannot find module '@testing-library/dom'` — @testing-library/react@16 lists it as a peer; yarn 1 does not install peers automatically (research assumed it would be transitive)
- **Fix:** `yarn add --dev --ignore-scripts '@testing-library/dom@^10.0.0'` (the peer range declared by RTL 16.3.2)
- **Files modified:** package.json, yarn.lock
- **Verification:** `yarn test src/components/formik.test.js` passes
- **Committed in:** 98f3777 (Task 1 commit)

2. [Rule 3 - Blocking] **node-sass postinstall rebuild failure bypassed with --ignore-scripts**
- **Found during:** Task 1 (first `yarn add --dev` attempt)
- **Issue:** `yarn add` runs all postinstall scripts including node-sass's node-gyp rebuild, which fails on Node 24 + Python 3.12 (`ModuleNotFoundError: distutils`) — pre-existing environmental issue, not related to the 7 new devDeps (none have postinstall scripts)
- **Fix:** Re-ran with `--ignore-scripts`; the jest pipeline never needs node-sass (SCSS handled via identity-obj-proxy mapping)
- **Files modified:** none extra (install flags only)
- **Verification:** Install completed, all 7 pinned versions exact; suite green
- **Committed in:** 98f3777

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both necessary to reach a working pipeline; no scope creep, no production code changes.

## Known Stubs

None. The single `it.skip` is an intentional preserved red test (documented above), not a stub — it is tracked via the FNDT-05 → FORM-04 comment for Phase 4.

## Issues Encountered

- `@testing-library/dom` peer missing at first run — installed explicitly (see deviation 1)
- Yup error messages did not surface verbatim due to prop-order in TextFieldConError — assertion switched to the observed `Mui-error` class state (documented in test comment)
- `yarn test` fails if a stray `.test.js` gets a semicolon — scan verified none in committed files

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Ready for plan 01-02:** the scaffold is proven end-to-end; remaining FNDT-05 suites (blog-list pagination, navigation toggle, gatsby-node createPages) can be written on the same pipeline
- **Phase 4 (FORM-04):** one-commit un-skip target: `src/components/formik.test.js` "submit failure path" — unskip `it.skip` after fixing formik.js line 51
- **Concern:** `yarn add` without `--ignore-scripts` fails on this machine due to node-sass/node-gyp vs Node 24 — any future `yarn add` should use the flag (or plan 03+ may remove node-sass)

---

*Phase: 01-test-scaffolding-performance-baseline*
*Completed: 2026-08-19*

## Self-Check: PASSED

- All 7 scaffold/test files exist on disk (jest.config.js, jest-preprocess.js, jest.setup.js, loadershim.js, __mocks__/gatsby.js, __mocks__/file-mock.js, src/components/formik.test.js)
- Commit `98f3777` (Task 1 feat), `3b07eba` (Task 2 test), `2888073` (docs metadata) all present in git log
- `yarn test` exits 0: 1 passed, 1 skipped, 0 failed

