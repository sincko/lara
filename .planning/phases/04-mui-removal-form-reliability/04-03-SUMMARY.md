---
phase: 04-mui-removal-form-reliability
plan: 03
subsystem: ui
tags: [emailjs, @emailjs/browser, gatsby, env-vars, formik, gitignore]

# Dependency graph
requires:
  - phase: 04-mui-removal-form-reliability
    provides: 04-01 plain-CSS form rewrite (formik.js baseline), 04-02 test mock renamed to @emailjs/browser
provides:
  - "@emailjs/browser 4.4.1 as the email SDK (emailjs-com removed from the dependency tree)"
  - "GATSBY_EMAILJS_* env-var credential source with guarded v4 object-form init in formik.js"
  - ".env.example tracked in git with the D-09 placeholders + .gitignore !.env.example negation rule"
affects: [04-mui-removal-form-reliability (04-04 false-success fix builds on this formik.js), Netlify deploy config]

# Tech tracking
tech-stack:
  added: ["@emailjs/browser 4.4.1 (pinned exact)"]
  patterns: ["GATSBY_* build-time-inlined env vars for client-side credentials", "guarded module-scope emailjs.init({ publicKey }) v4 object form", ".gitignore negation rule for .env.example"]

key-files:
  created: [".env.example"]
  modified: ["package.json", "yarn.lock", "src/components/formik.js", ".gitignore", "phase1-test-scaffold.test.js"]

key-decisions:
  - "Kept the default-import style `import emailjs from \"@emailjs/browser\"` (D-07, Pitfall 5) — the 04-02 jest.mock factory already matches it"
  - "Guarded module-scope init `if (process.env.GATSBY_EMAILJS_PUBLIC_KEY)` prevents init with undefined when env vars are absent (Pitfall 3)"
  - "Did NOT restructure the onSubmit promise chain — the false-success fix is 04-04's job (D-11)"
  - "Updated the FNDT-05 meta-test in phase1-test-scaffold.test.js to the post-04-02 contract (Rule 1) — it still asserted jest.mock(\"emailjs-com\") and toHaveClass(\"Mui-error\")"

patterns-established:
  - "Pattern 1: GATSBY_* env vars are the only credential source for client-side EmailJS — no hardcoded creds in src/"
  - "Pattern 2: .env.example is the documented env-var contract; the .gitignore !.env.example negation rule keeps it trackable"

requirements-completed: [FORM-03, UPGR-05]

# Coverage metadata (#1602) — one entry per shipped deliverable.
coverage:
  - id: D1
    description: "emailjs-com replaced by @emailjs/browser 4.4.1 in package.json and yarn.lock (UPGR-05, D-07)"
    requirement: UPGR-05
    verification:
      - kind: other
        ref: "grep '\"@emailjs/browser\": \"4.4.1\"' package.json; ! grep emailjs-com package.json yarn.lock; yarn install exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "formik.js reads EmailJS credentials exclusively from GATSBY_EMAILJS_* env vars with a guarded v4 object-form init (FORM-03, D-08)"
    requirement: FORM-03
    verification:
      - kind: unit
        ref: "yarn test (8 suites, 56 passed, 1 skipped — formik.test.js green with @emailjs/browser mock)"
        status: pass
      - kind: other
        ref: "grep acceptance: @emailjs/browser import; zero user_/service_q3997uk/template_m6tzcmm in src/; guarded init + v4 object form present; yarn build exit 0"
        status: pass
    human_judgment: false
  - id: D3
    description: ".env.example committed with GATSBY_EMAILJS_* placeholders and the .gitignore !.env.example negation rule (FORM-03, Pitfall 1)"
    requirement: FORM-03
    verification:
      - kind: other
        ref: "git check-ignore .env.example exit 1; git ls-files .env.example lists the file; grep D-09 values in .env.example; grep '!.env.example' .gitignore"
        status: pass
    human_judgment: false

# Metrics
duration: 4min
completed: 2026-08-19
status: complete
---

# Phase 4 Plan 3: EmailJS Swap + Env Vars Summary

**@emailjs/browser 4.4.1 replaces the deprecated emailjs-com SDK, and the hardcoded EmailJS credentials move out of src/components/formik.js into build-time-inlined GATSBY_EMAILJS_* env vars, with .env.example committed as the documented contract (FORM-03, UPGR-05)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-19T20:08:54Z
- **Completed:** 2026-08-19T20:12:24Z
- **Tasks:** 3
- **Files modified:** 5 (package.json, yarn.lock, src/components/formik.js, .gitignore, phase1-test-scaffold.test.js) + 1 created (.env.example)

## Accomplishments

- emailjs-com removed from the dependency tree; @emailjs/browser 4.4.1 (pinned exact) is the sole EmailJS SDK — install green under Node 24
- formik.js now imports @emailjs/browser (default-import style kept per D-07/Pitfall 5), initializes with the guarded v4 object form `if (process.env.GATSBY_EMAILJS_PUBLIC_KEY) { emailjs.init({ publicKey: ... }) }` (Pitfall 3), and passes `process.env.GATSBY_EMAILJS_SERVICE_ID` / `process.env.GATSBY_EMAILJS_TEMPLATE_ID` to sendForm — zero hardcoded credentials remain in src/
- .env.example committed with the D-09 placeholder values, made trackable by the `!.env.example` negation rule after the `.env*` line (Pitfall 1 closed)
- Full install → build → test loop green: 8 suites, 56 passed, 1 skipped (the FORM-04 regression net stays skipped — 04-04's job)
- The onSubmit promise chain was left untouched as instructed — the false-success fix is 04-04's job (D-11)

## Task Commits

Each task was committed atomically:

1. **Task 1: Swap emailjs-com → @emailjs/browser 4.4.1** - `b3e0086` (feat)
2. **Task 2: Move formik.js to @emailjs/browser + guarded GATSBY_* env-var init** - `619e70f` (feat)
3. **Task 3: Commit .env.example + .gitignore negation rule** - `a6d583e` (feat)

**Plan metadata:** `docs(04-03): complete emailjs swap + env vars plan` (see git log for hash)

## Files Created/Modified

- `package.json` - @emailjs/browser 4.4.1 in dependencies, emailjs-com removed
- `yarn.lock` - regenerated: emailjs-com tree gone, @emailjs/browser tree in
- `src/components/formik.js` - @emailjs/browser import, guarded GATSBY_EMAILJS_PUBLIC_KEY init (v4 object form), env-var sendForm args
- `.env.example` - NEW: GATSBY_EMAILJS_PUBLIC_KEY / GATSBY_EMAILJS_SERVICE_ID / GATSBY_EMAILJS_TEMPLATE_ID with D-09 placeholders
- `.gitignore` - `!.env.example` negation rule after the `.env*` line
- `phase1-test-scaffold.test.js` - FNDT-05 meta-test updated to the post-04-02 contract (Rule 1 fix)

## Decisions Made

- Kept the default-import style `import emailjs from "@emailjs/browser"` — the 04-02 jest.mock factory already returns the default-export object, so the mock stays valid (Pitfall 5)
- Guarded module-scope init prevents `emailjs.init(undefined)` when env vars are absent (tests, local dev without .env) — graceful degradation, not a crash (Pitfall 3)
- Did NOT restructure the onSubmit promise chain — the unconditional resetForm/setSubmitting/assign stays as-is; the false-success fix is 04-04's job (D-11)
- Updated the FNDT-05 meta-test in phase1-test-scaffold.test.js to the post-04-02 contract (Rule 1) — it still asserted `jest.mock("emailjs-com")` and `toHaveClass("Mui-error")`, which 04-02's formik.test.js update had invalidated

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] FNDT-05 meta-test still asserted the pre-04-02 formik.test.js contract**
- **Found during:** Task 2 (verify step — `yarn test` failed with 2 failures in phase1-test-scaffold.test.js)
- **Issue:** `phase1-test-scaffold.test.js` (Phase 1 Nyquist meta-test) asserted `jest.mock("emailjs-com")` and `toHaveClass("Mui-error")` in formik.test.js. 04-02 changed both (mock renamed to @emailjs/browser, Mui-error assertions replaced with `toHaveClass("error")`), but 04-02's verify only ran `yarn test src/components/formik.test.js` — the full-suite meta-test was never re-run, so the stale assertions went unnoticed until this plan's full-suite verify.
- **Fix:** Updated the two FNDT-05 assertions to the post-04-02 contract: `jest.mock("@emailjs/browser")` and `toHaveClass("error")`.
- **Files modified:** phase1-test-scaffold.test.js
- **Verification:** `yarn test` → 8 suites passed, 56 passed, 1 skipped, exit 0
- **Committed in:** 619e70f (Task 2 commit)

**2. [Rule 3 - Blocking] `yarn format` is a repo-wide prettier script — collateral reformatting of ~123 clean files**
- **Found during:** Task 2 (the plan's action says "Run `yarn format` on the file after editing", but the `format` script is `prettier --write "**/*.{js,jsx,json,md}"` — it reformatted the whole repo, not just formik.js)
- **Issue:** After running `yarn format`, `git status` showed ~123 modified files that were clean at HEAD (planning docs, baseline JSONs, other src files). Committing them would have been massive scope creep.
- **Fix:** Restored every file except `src/components/formik.js` to HEAD via `git checkout --` (the tree was clean at plan start, so this is lossless). formik.js was already prettier-clean after the edit (verified via the diff).
- **Files modified:** none net (restored); formik.js kept
- **Verification:** `git status --short` shows only `src/components/formik.js` modified before the Task 2 commit
- **Committed in:** 619e70f (Task 2 commit)

**3. [Plan adjustment] Task 1's `yarn add @emailjs/browser@4.4.1` was a no-op — already installed by 04-02**
- **Found during:** Task 1
- **Issue:** 04-02 installed @emailjs/browser 4.4.1 early (commit 941a287, Rule 3 blocking fix for its test mock). The plan's `yarn add @emailjs/browser@4.4.1 && yarn remove emailjs-com` was therefore half-done at plan start.
- **Fix:** Verified @emailjs/browser 4.4.1 present in package.json, then ran only `yarn remove emailjs-com` (per the orchestrator's environment notes).
- **Files modified:** package.json, yarn.lock
- **Verification:** All Task 1 acceptance greps pass; `yarn install` exits 0
- **Committed in:** b3e0086 (Task 1 commit)

**4. [Verify-command quirk] `git check-ignore -v .env.example` exits 0, not 1, when the negation rule matches**
- **Found during:** Task 3 (acceptance criterion: `git check-ignore -v .env.example` exits 1)
- **Issue:** With `-v`, git prints the matching pattern (`.gitignore:58:!.env.example`) and exits 0 for a negation match — the exit code reflects "a pattern matched", not "the file is ignored". The plan's criterion was written against the pre-negation behavior (where `-v` prints `.env*` and exits 0 because the file IS ignored).
- **Fix:** Verified the plan's actual intent (Pitfall 1: file trackable) with the correct probes: plain `git check-ignore .env.example` exits 1 (not ignored), `git add .env.example` stages the file, `git ls-files .env.example` lists it after commit.
- **Files modified:** none (verification approach only)
- **Verification:** `git check-ignore .env.example` → exit 1; `git ls-files .env.example` → `.env.example`
- **Committed in:** a6d583e (Task 3 commit)

---

**Total deviations:** 4 (1 Rule 1 bug fix, 1 Rule 3 blocking fix, 1 plan adjustment, 1 verify-command quirk)
**Impact on plan:** All deviations were necessary for correctness and scope discipline. No scope creep — the meta-test fix was required to make the plan's own verify (`yarn test`) green, and the format-collateral restore kept the commits to the plan's file list.

## Issues Encountered

- `yarn format` reformats the entire repo (script is `prettier --write "**/*.{js,jsx,json,md}"`) — restored all collateral changes; future plans should run prettier on the specific file instead (`npx prettier --write src/components/formik.js`).
- The full-suite `yarn test` surfaced the stale FNDT-05 meta-test that 04-02's file-scoped verify had missed — fixed in this plan (deviation 1).

## User Setup Required

None - no external service configuration required by this plan. (The owner's Netlify env-var setup is 04-04's manual checkpoint, per the plan's must_haves.)

## Next Phase Readiness

- Ready for 04-04 (false-success fix, D-11): formik.js now has the @emailjs/browser import and env-var sendForm args that 04-04's onSubmit restructure builds on; the FORM-04 regression test stays skipped until then
- The owner must set GATSBY_EMAILJS_PUBLIC_KEY / GATSBY_EMAILJS_SERVICE_ID / GATSBY_EMAILJS_TEMPLATE_ID in the Netlify UI before the first post-phase deploy (build-time inlining, Pitfall 2) — 04-04's manual checkpoint

---

*Phase: 04-mui-removal-form-reliability*
*Completed: 2026-08-19*

## Self-Check: PASSED

- SUMMARY.md exists on disk: FOUND
- .env.example exists on disk: FOUND
- Task commits present in git log: b3e0086, 619e70f, a6d583e — all FOUND
- Plan metadata commit present: 273e31a — FOUND
- Working tree clean after all commits
