---
phase: 1
slug: test-scaffolding-performance-baseline
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-18
validated: 2026-08-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.7.x + @testing-library/react 16.3.x |
| **Config file** | `jest.config.js` (Wave 0 installs) |
| **Quick run command** | `yarn test --watch=false` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test --watch=false`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | FNDT-05 | T-1-SC / T-1-03 | Scaffold intact, pinned devDeps, config wired | unit (fs) | `yarn test phase1-test-scaffold.test.js` | ✅ | ✅ green |
| 1-01-02 | 01 | 1 | FNDT-05 | T-1-02 | emailjs mocked before import, key never leaks | unit (fs) | `yarn test phase1-test-scaffold.test.js` | ✅ | ✅ green |
| 1-01-03 | 01 | 1 | FNDT-05 | — | Pagination math locked via rendered hrefs | unit (fs) | `yarn test phase1-test-scaffold.test.js` | ✅ | ✅ green |
| 1-01-04 | 01 | 1 | FNDT-05 | — | Navigation toggle covered | unit (fs) | `yarn test phase1-test-scaffold.test.js` | ✅ | ✅ green |
| 1-01-05 | 01 | 1 | FNDT-05 | T-2-01 | createPages covered under node env | unit (fs) | `yarn test phase1-test-scaffold.test.js` | ✅ | ✅ green |
| 1-02-01 | 02 | 1 | FNDT-06 | T-3-01 / T-3-02 / T-4-02 | Baseline tooling honest + reproducible | smoke (spawn) | `yarn test baseline-tooling.test.js` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `jest.config.js` — jest config with transform, moduleNameMapper (gatsby, SCSS, images)
- [x] `__mocks__/gatsby.js` — manual gatsby module mocks (Link, graphql, useStaticQuery)
- [x] `jest.setup.js` — @testing-library/jest-dom matchers
- [x] devDependencies install — jest, babel-jest, babel-preset-gatsby, jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom, identity-obj-proxy

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lighthouse + PSI baseline capture (median 3, mobile, LCP/CLS/INP) | FNDT-06 | Requires live site + Chrome; not unit-testable | Run `node scripts/capture-baseline.js`; verify `.planning/baseline/` contains results JSON |
| Form submit failure path (red test) | FNDT-05 | Fails against current buggy code by design — regression net for Phase 4 | `it.skip` with FNDT-05→FORM-04 comment; un-skip in Phase 4 |

*Both manual items were executed during the phase: the live capture is committed (4c05f45, 9 LHR JSONs + 9 PSI fallback markers), and the FORM-04 red test is preserved as `it.skip` in formik.test.js (Phase 4 un-skip target).*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-19

---

## Validation Audit 2026-08-19

| Metric | Count |
|--------|-------|
| Gaps found | 8 |
| Resolved | 6 |
| Escalated | 0 |
| Manual-only | 2 |

**Audit trail:**

- 6 MISSING persistent-test gaps filled by the nyquist auditor:
  - `phase1-test-scaffold.test.js` (node env, 14 tests) — FNDT-05 scaffold integrity: test script, 8 pinned devDeps, jest.config.js wiring, preprocess/setup/loadershim/mocks, plus the regression suites' own contracts (emailjs mock-before-import + no key leak, 5 blog-list mocks before import + literal hrefs, navigation is-active flip, gatsby-node node-env pragma + panicOnBuild + /blog paths)
  - `baseline-tooling.test.js` (node env, 8 tests) — FNDT-06 baseline honesty: median.js exits 0 against committed artifacts with real medians (3313.7/4750.71/3964.31, runs_used=3) and psi runs_used=0 (fallback markers never counted), all 9 psi artifacts are provenance markers, capture script hardcodes URLs + 13.4.1 pin + mobile + 429 branch + PSI_API_KEY never printed, BASELINE.md content
- 2 manual-only: live-site capture (already executed, commit 4c05f45) and the FORM-04 `it.skip` red test (Phase 4 un-skip target) — both by design, not automatable
- Full suite after audit: 8 suites, 56 passed / 1 skipped (baseline was 6 suites, 34 passed / 1 skipped; the skip is the intentional FORM-04 red test)
- No implementation bugs found; 2 test-expectation fixes (raw-text escaping, template-literal pin assertion)
