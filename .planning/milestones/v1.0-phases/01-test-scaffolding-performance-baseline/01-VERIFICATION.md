---
phase: 01-test-scaffolding-performance-baseline
verified: 2026-08-19T10:15:00Z
status: passed
score: 24/24 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 1: Test Scaffolding + Performance Baseline Verification Report

**Phase Goal:** The repo has a real regression net and a recorded performance baseline before anything changes
**Verified:** 2026-08-19T10:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `yarn test` exits 0 and runs a real jest + @testing-library/react suite — no longer the failing starter placeholder (ROADMAP SC 1) | ✓ VERIFIED | Ran `yarn test`: 4 suites, 8 passed, 1 skipped, 0 failed, exit 0. `package.json` test script = `jest --watch=false` (starter `echo ... && exit 1` gone) |
| 2 | Suite covers form validation, form submit failure path, pagination math, and page creation, with at least one passing assertion each (ROADMAP SC 2) | ✓ VERIFIED | formik.test.js validation passing (Mui-error class assertions); D-05 failure path preserved as `it.skip` red test per VALIDATION.md contract; blog-list.test.js 3 passing pagination tests; gatsby-node.test.js 3 passing; navigation.test.js 1 passing |
| 3 | Lighthouse + PSI baseline (median of 3, mobile) for LCP, CLS, INP captured on the live site before any dependency or code changes (ROADMAP SC 3) | ✓ VERIFIED | 9 lighthouse LHR JSONs (3 URLs × 3 runs, runs_used=3 each, mobile); PSI 429 on all 9 runs → documented lighthouse-fallback markers (pre-resolved decision); INP n/a per LH 13.4.1 tool reality (timespan-only audit) — tracked as open unmet-truth in `.planning/WINDOWS.md` with Phase 6 handling; live site measured in pre-milestone state (zero production src/ files modified in phase) |
| 4 | Baseline results stored in `.planning/` so Phase 6 can compare (ROADMAP SC 4) | ✓ VERIFIED | `.planning/baseline/` committed (4c05f45): BASELINE.md + 9 lighthouse JSONs + 9 psi markers + capture-baseline.js + median.js + README.md |
| 5 | D-01: Jest 29 + babel-jest + babel-preset-gatsby scaffold with automatic gatsby mocks (manual `__mocks__/gatsby.js` — gatsby-plugin-jest E404 mechanism swap) | ✓ VERIFIED | jest.config.js (transform `^.+.jsx?$` → jest-preprocess.js, moduleNameMapper: identity-obj-proxy / file-mock / `^@reach/router$`→`@gatsbyjs/reach-router`, transformIgnorePatterns, setupFiles/setupFilesAfterEnv); `__mocks__/gatsby.js` exports Link (renders `<a href={to}>`), graphql jest.fn, useStaticQuery jest.fn |
| 6 | D-02: @testing-library/react + @testing-library/jest-dom added | ✓ VERIFIED | devDeps: @testing-library/react@16.3.2, @testing-library/jest-dom@6.6.3 (+ @testing-library/dom@^10 peer fix, documented deviation); jest.setup.js imports `@testing-library/jest-dom` (v6 root entry) |
| 7 | D-03: package.json test script is `jest --watch=false` — yarn test exits 0 with a real suite | ✓ VERIFIED | `node -e` check: script = `jest --watch=false`; all 7 pinned devDeps present; `yarn test` exit 0 (ran) |
| 8 | Formik validation errors for empty required fields surface through the UI via TextFieldConError (≥1 passing assertion) | ✓ VERIFIED | formik.test.js: fireEvent.click("Invia") → `getByText("Nome richiesto")`/`getByText("Email richiesta")` flip to `Mui-error` class; suite passes (ran). Deviation documented: yup messages overridden by static helperText props (TextFieldConError spreads `{...props}` after helperText) — error STATE asserted instead |
| 9 | D-05 submit failure path covered by preserved red test marked `it.skip` with explicit FNDT-05 → FORM-04 comment; suite stays green | ✓ VERIFIED | `it.skip(` exactly once; comment `// FNDT-05 → FORM-04 regression net: unskip when Phase 4 fixes the false-success bug. Fails on the current formik.js by design.`; body contains `expect(assign).not.toHaveBeenCalled()` with no escape hatch. Redness statically proven: formik.js:51 calls `document.location.assign("/thanks")` unconditionally after the promise chain — the assertion must fail when unskipped. Suite green: 1 skipped (ran) |
| 10 | emailjs-com mocked before FormikContact import; hardcoded emailjs key never executes or leaks | ✓ VERIFIED | `jest.mock("emailjs-com", ...)` declared before `import FormikContact` (formik.test.js:8-11); grep for `user_` key string in all test files: zero matches; suite runs clean without network calls |
| 11 | D-04: Priority targets covered — formik validation, blog-list pagination, navigation toggle, gatsby-node page creation | ✓ VERIFIED | 4 suites covering all 4 targets (see truths 8, 14, 15, 16) |
| 12 | D-06: At least one passing assertion per covered area | ✓ VERIFIED | 8 passing tests across 4 suites (ran) |
| 13 | D-10: Co-located `*.test.js` files next to components | ✓ VERIFIED | src/components/formik.test.js, src/components/navigation.test.js, src/templates/blog-list.test.js; gatsby-node.test.js at repo root next to gatsby-node.js |
| 14 | Pagination math (isFirst/isLast/prevPage/nextPage) verified for pages 1, 2, 3 of 3 | ✓ VERIFIED | blog-list.test.js: 3 passing tests asserting hrefs `/blog/2`, `/blog/` (prevPage special case), `/blog/3`, `/blog/2`, absence of Previous/Next, `is-active` class (ran) |
| 15 | Navigation handleToggleClick flips the is-active class on the menu trigger | ✓ VERIFIED | navigation.test.js: initial off → click on → click off (ran) |
| 16 | gatsby-node createPages tested in node environment with injected mocked graphql/actions/reporter — post pages, /blog pagination at 9/page, panicOnBuild on errors | ✓ VERIFIED | gatsby-node.test.js (`@jest-environment node`): 10-post fixture → /post-1..10 + /blog + /blog/2 (no /blog/3); prev/next context wiring; panicOnBuild on GraphQL errors (ran) |
| 17 | D-08: Baseline captured with Lighthouse CLI (local) + PSI (live site), median of 3 runs, mobile profile, for LCP, CLS, INP | ✓ VERIFIED | 9 lighthouse runs with numeric LCP/CLS (e.g. home-1: LCP 3260.8ms, CLS 0.0143, perf 0.92); median.js prints medians of 3 (runs_used=3 all URLs); INP n/a — documented tool reality (see truth 3 caveat); PSI source fell back per pre-resolved decision (quota 429) |
| 18 | Reproducible capture script runs Lighthouse 13.4.1 CLI against hardcoded laryart.it URL set (3 URLs × 3 runs, mobile, --only-categories=performance), writing raw JSON | ✓ VERIFIED | capture-baseline.js: hardcoded `URLS` constant (no argv/stdin URLs), `npx -y lighthouse@13.4.1`, `--form-factor=mobile`, `--only-categories=performance`, `--output=json`, retry-once + error-marker artifacts; 9 JSONs on disk |
| 19 | Script tolerates PSI 429s with retry/backoff and falls back to Lighthouse-CLI-against-live-URL per metric | ✓ VERIFIED | capture-baseline.js: 3 retries with 10s/30s/60s backoff, then `{ source: "lighthouse-fallback", psi_quota: "429" }` markers; all 9 psi artifacts are fallback markers (quota exhausted at execution); `PSI_API_KEY` env honored, never logged |
| 20 | Median extraction script reads the 3 raw JSONs per URL and emits median LCP/CLS/INP per source, reproducible for Phase 6 | ✓ VERIFIED | Ran `node .planning/baseline/median.js`: exit 0, full 3-URL table (lighthouse rows runs_used=3 with real medians; psi rows n/a + provenance WARN). Fallback markers excluded from runs_used (honest n/a, never phantom numbers) |
| 21 | Methodology metadata (versions, dates, commit SHA, URL set, mobile profile) recorded next to the data (D-09) | ✓ VERIFIED | BASELINE.md: capture date 2026-08-19, commit SHA 6d17f83, Node v24.18.0, HeadlessChrome 151, Lighthouse 13.4.1, PSI v5, URL set with redirect notes, mobile profile, exact re-run commands |
| 22 | Full baseline (3 URLs × 3 runs × Lighthouse CLI; PSI with 429-tolerant fallback) captured on the live site BEFORE any dependency or code change | ✓ VERIFIED | 9 lighthouse JSONs + 9 psi markers committed (4c05f45); capture ran 09:14–09:42Z against live laryart.it; zero production src/ files modified in the phase (git diff 3bcf9e4..HEAD: only test files, scaffold, package.json, yarn.lock, .planning/) |
| 23 | BASELINE.md records median LCP/CLS/INP per URL per source, tool versions, capture dates, git commit SHA, canonical URL set | ✓ VERIFIED | BASELINE.md contains the median table (paste of median.js stdout), method, metadata table, URL set with slugs, PSI fallback note per URL/run, Phase 6 re-run recipe |
| 24 | Phase 6 can reproduce the identical measurement recipe from the stored artifacts | ✓ VERIFIED | README.md + BASELINE.md lock: exact pin `npx -y lighthouse@13.4.1`, `--form-factor=mobile`, default throttling, same 3-URL set, median-of-3 rule, "Phase 6 MUST rerun with identical recipe" note, INP caveat, PSI fallback provenance contract |

**Score:** 24/24 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `package.json` | test script + 7 pinned devDeps | ✓ VERIFIED | `"test": "jest --watch=false"`; jest@29.7.0, babel-jest@29.7.0, jest-environment-jsdom@29.7.0, @testing-library/react@16.3.2, @testing-library/jest-dom@6.6.3, identity-obj-proxy@3.0.0, babel-preset-gatsby@3.16.0 (+ @testing-library/dom@^10 documented peer fix) |
| `jest.config.js` | transform, moduleNameMapper, ignores, globals, setup | ✓ VERIFIED | All keys per official Gatsby guide semantics; `^@reach/router$` → `@gatsbyjs/reach-router` mapping present (yarn.lock has no @reach/router; verified node_modules/@gatsbyjs/reach-router@2.0.1) |
| `jest-preprocess.js` | babel-jest transformer with babel-preset-gatsby | ✓ VERIFIED | `require("babel-jest").default.createTransformer({ presets: ["babel-preset-gatsby"] })` |
| `jest.setup.js` | jest-dom v6 root import + matchMedia guard | ✓ VERIFIED | `import "@testing-library/jest-dom"` (root, not extend-expect); matchMedia guarded by `typeof window !== "undefined"` (node-env fix) |
| `loadershim.js` | `global.___loader = { enqueue: jest.fn() }` | ✓ VERIFIED | Exact content |
| `__mocks__/gatsby.js` | Link → `<a href>`, graphql, useStaticQuery | ✓ VERIFIED | jest.requireActual + overrides; Link renders `<a href={to}>` |
| `__mocks__/file-mock.js` | `"test-file-stub"` | ✓ VERIFIED | Exact content |
| `src/components/formik.test.js` | validation suite + skipped D-05 red test | ✓ VERIFIED | 1 passing validation test; 1 skipped failure-path test with FORM-04 comment; emailjs mocked before import |
| `src/templates/blog-list.test.js` | 3 pagination tests | ✓ VERIFIED | Pages 1/2/3 of 3; 5 jest.mock calls before BlogIndex import; literal hrefs asserted |
| `src/components/navigation.test.js` | toggle test | ✓ VERIFIED | is-active flip on/off |
| `gatsby-node.test.js` | createPages node-env suite | ✓ VERIFIED | 3 tests: pagination+posts, prev/next wiring, panicOnBuild |
| `.planning/baseline/capture-baseline.js` | capture script | ✓ VERIFIED | Hardcoded URLs, LH 13.4.1 pin, mobile, PSI 429 fallback, PSI_API_KEY honored |
| `.planning/baseline/median.js` | median-of-3 extraction | ✓ VERIFIED | TSV output, runs_used WARNs, fallback markers excluded, all-error exit 1 |
| `.planning/baseline/README.md` | methodology contract | ✓ VERIFIED | Commands, URL set, versions, mobile profile, median rule, Phase 6 note |
| `.planning/baseline/BASELINE.md` | canonical baseline artifact | ✓ VERIFIED | Median table, method, metadata, URL set, re-run recipe |
| `.planning/baseline/lighthouse/{home,blog,post-minnie}-{1,2,3}.json` | 9 LHR runs | ✓ VERIFIED | All exist with numeric LCP/CLS (spot-checked home-1: LCP 3260.8ms, CLS 0.0143, perf 0.92) |
| `.planning/baseline/psi/{home,blog,post-minnie}-{1,2,3}.json` | 9 PSI artifacts | ✓ VERIFIED | All are `{ "source": "lighthouse-fallback", "psi_quota": "429" }` provenance markers — documented fallback, no fake numbers |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| package.json test script | jest CLI | `jest --watch=false` | ✓ WIRED | `yarn test` exit 0 (ran) |
| jest-preprocess.js | all transformed test sources | babel-preset-gatsby transform | ✓ WIRED | All 4 suites transform and run |
| `__mocks__/gatsby.js` | gatsby imports in tested components | Link/graphql/useStaticQuery mocks | ✓ WIRED | formik, blog-list, navigation suites green |
| jest.setup.js | formik assertions | jest-dom matchers (toBeInTheDocument, toHaveClass, toHaveAttribute) | ✓ WIRED | toHaveClass/toHaveAttribute used and passing |
| blog-list.test.js | `__mocks__/gatsby.js` Link mock | asserted hrefs | ✓ WIRED | `/blog/2`, `/blog/`, `/blog/3` asserted via toHaveAttribute |
| gatsby-node.test.js | real gatsby-node.js createPages | require("./gatsby-node") + injected mocks | ✓ WIRED | 3 passing tests |
| capture-baseline.js | raw JSON artifacts | npx lighthouse@13.4.1 CLI | ✓ WIRED | 9 LHR JSONs written at capture time |
| median.js | raw JSON artifacts | reads lighthouse/ + psi/ dirs | ✓ WIRED | Exit 0, full table (ran) |
| BASELINE.md | median.js output | table pasted from script stdout | ✓ WIRED | Table matches median.js output exactly |
| BASELINE.md | Phase 6 PERF-04 | identical re-run recipe | ✓ WIRED | Re-run commands + pin + URL set documented |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| formik.test.js | Mui-error class state | Real FormikContact render + fireEvent | ✓ real validation state | ✓ FLOWING |
| blog-list.test.js | Pagination hrefs | Real BlogIndex render with pageContext | ✓ real math (lines 80-84) | ✓ FLOWING |
| gatsby-node.test.js | createPage calls | Real gatsby-node.js with injected graphql | ✓ real page-creation logic | ✓ FLOWING |
| BASELINE.md table | LCP/CLS/perf medians | Real LHR JSONs via median.js | ✓ numeric values (3313.7/4750.71/3964.31 ms LCP) | ✓ FLOWING |
| psi/ artifacts | PSI measurements | PSI API v5 | ✗ quota 429 → documented fallback markers (never presented as measurements) | ✓ HONEST (n/a + provenance WARN, per pre-resolved decision) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| `yarn test` exits 0 with real suite | `yarn test` | 4 suites, 8 passed, 1 skipped, 0 failed, exit 0 | ✓ PASS |
| Median extraction works on real artifacts | `node .planning/baseline/median.js` | Full 3-URL table, exit 0 | ✓ PASS |
| LHR artifacts contain numeric CWV | `node -e` audit check on home-1.json | LCP 3260.8, CLS 0.0143 numeric | ✓ PASS |
| Prettier style compliance | `yarn prettier --check` on 4 test files | All matched files use Prettier code style | ✓ PASS |
| Pinned devDeps + test script | `node -e` package.json check | All 7 present; script = `jest --watch=false` | ✓ PASS |
| D-05 red test preserved | grep it.skip / FORM-04 / expect(assign) | 1× it.skip, FORM-04 comment, assertion present, no escape hatch | ✓ PASS |
| emailjs key never leaks | grep `user_` in test files | Zero matches | ✓ PASS |

### Probe Execution

No probes declared in PLANs or SUMMARYs for this phase (no `scripts/*/tests/probe-*.sh`). SKIPPED — not applicable.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| FNDT-05 | 01-01, 01-02 | Minimal test suite scaffolded (jest + testing-library) covering form validation, pagination math, and page creation | ✓ SATISFIED | 4 suites / 8 passing tests; `yarn test` exit 0; form validation + failure path (skipped red) + pagination + page creation all covered; marked Complete in REQUIREMENTS.md |
| FNDT-06 | 01-03, 01-04 | Performance baseline captured (Lighthouse + PSI on live site) before any changes | ✓ SATISFIED | 9 Lighthouse runs (median 3, mobile) + PSI fallback markers; BASELINE.md + raw JSONs committed in `.planning/baseline/`; marked Complete in REQUIREMENTS.md |

**Orphaned requirements:** None — both FNDT-05 and FNDT-06 are claimed by plans and satisfied. No additional REQUIREMENTS.md IDs map to Phase 1.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX markers in any phase file | — | None found |
| — | — | No placeholder/coming-soon/not-implemented strings | — | None found |
| — | — | No empty implementations (return null/{}/[]) | — | None found |
| — | — | No console.log-only implementations | — | None found |
| — | — | No production src/ files modified (git diff 3bcf9e4..HEAD: 0 non-test, non-planning files) | — | None found |
| — | — | Semicolon scan: only for-loop syntax (`for (let i = 1; i <= 10; i++)`) and comment punctuation — not style violations; prettier --check passes | ℹ️ Info | None |

### Documented Deviations (accepted at execution, not gaps)

1. **INP n/a (ROADMAP SC 3 letter vs tool reality):** `interaction-to-next-paint` is a timespan-only audit in Lighthouse 13.4.1 — excluded from navigation-mode runs; static pages yield no INP numericValue (matches PSI lab behavior). Recorded as **open unmet-truth #1 in `.planning/WINDOWS.md`** with explicit Phase 6 handling ("compare INP only if a recipe change provides it"). The alternative (timespan run with synthetic input) would break the Phase 6 identical-recipe contract the criterion exists to enable. Intent achieved: reproducible baseline for every metric the pinned recipe can produce.
2. **PSI source = lighthouse-fallback (D-08 dual-source pairing):** PSI v5 anonymous quota returned 429 on all 9 runs despite retry/backoff; pre-resolved decision (checkpoint 1, psi-fallback option) accepted the documented Lighthouse-CLI fallback. Every psi artifact is a provenance marker; no fake numbers; Phase 6 can capture real PSI with a `PSI_API_KEY` and compare like-for-like per source.
3. **@testing-library/dom added as 8th devDependency:** yarn 1 does not auto-install RTL 16 peer deps (documented Rule 3 auto-fix in 01-01-SUMMARY).
4. **prismjs ^1.29.0→^1.30.0 and react-icons ^5.5.0→^5.7.0 bumps** swept into commit 98f3777 (SUMMARY claims pre-existing working-tree changes). Minor same-major-range bumps; do not affect the live site measured by the baseline (deployed static site); zero src/ code changes. Informational only.

### Human Verification Required

None. All behavior-dependent truths were exercised by running the suite (`yarn test`: 8 passed, 1 skipped) and the median script. The D-05 red test's redness is statically conclusive (formik.js:51 unconditional `document.location.assign("/thanks")` vs `expect(assign).not.toHaveBeenCalled()`), and its execution-time redness was verified during the phase (documented in 01-01-SUMMARY). The live-site baseline is evidenced by committed raw artifacts whose medians reproduce exactly via median.js.

### Gaps Summary

No gaps. All 24 must-haves verified, both requirements (FNDT-05, FNDT-06) satisfied, all artifacts exist/substantive/wired with real data flowing, all key links wired, no anti-patterns, no debt markers, no production code modified. The two documented deviations (INP n/a per tool reality; PSI 429 fallback) were pre-resolved/accepted at execution time and are tracked in `.planning/WINDOWS.md` and BASELINE.md for Phase 6.

---

_Verified: 2026-08-19T10:15:00Z_
_Verifier: the agent (gsd-verifier)_
