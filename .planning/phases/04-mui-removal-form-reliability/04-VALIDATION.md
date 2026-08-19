---
phase: 4
slug: mui-removal-form-reliability
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-19
validated: 2026-08-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (Phase 1 scaffold: jest.config.js, loadershim.js, jest-preprocess.js, __mocks__/) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `yarn test` |
| **Full suite command** | `yarn install && yarn build && yarn test` |
| **Estimated runtime** | ~60 seconds (build dominates; jest suite ~2s) |

---

## Sampling Rate

- **After every task commit:** Run `yarn test` (jest suite — 10 suites, ~2s)
- **After every plan wave:** Run the full loop `yarn install && yarn build && yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | FORM-01 | T-04-01 / T-04-02 / T-04-03 / T-04-04 | MUI removed, plain SCSS form, theme vars only | unit (fs) | `yarn test phase4-mui-form-reliability.test.js` | ✅ | ✅ green |
| 04-02-01 | 02 | 2 | FORM-02 | T-04-05 / T-04-06 / T-04-07 | Error UX preserved via `error` class | unit (jsdom) | `yarn test src/components/formik.test.js` | ✅ | ✅ green |
| 04-03-01 | 03 | 2 | FORM-03, UPGR-05 | T-04-08 / T-04-10 | No hardcoded creds; env vars | unit (fs) | `yarn test phase4-mui-form-reliability.test.js` | ✅ | ✅ green |
| 04-04-01 | 04 | 2 | FORM-04 | T-04-12 / T-04-13 | No false success, inline alert | unit (jsdom) | `yarn test src/components/formik.test.js` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `jest.config.js` — exists from Phase 1 (✅)
- [x] `__mocks__/gatsby.js`, `__mocks__/file-mock.js` — exist from Phase 1 (✅)
- [x] `loadershim.js`, `jest-preprocess.js`, `jest.setup.js` — exist from Phase 1 (✅)

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Netlify env vars set (GATSBY_EMAILJS_*) | FORM-03 | Netlify UI action — cannot be automated from the repo | Netlify → Site settings → Environment variables: add GATSBY_EMAILJS_PUBLIC_KEY, GATSBY_EMAILJS_SERVICE_ID, GATSBY_EMAILJS_TEMPLATE_ID with the D-09 values; redeploy with cleared cache |
| Live form send works end-to-end | FORM-04 | Requires live site + real email delivery | Submit the contact form on laryart.it with valid data → /thanks; submit with EmailJS broken (or check the failure path) → inline error, no redirect |

*Both manual items are part of the 04-04 owner checkpoint (handed off in 04-04-SUMMARY, not yet confirmed by the owner).*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-19

---

## Validation Audit 2026-08-19

| Metric | Count |
|--------|-------|
| Gaps found | 4 |
| Resolved | 2 |
| Escalated | 0 |
| Manual-only | 2 |

**Audit trail:**

- 2 MISSING persistent-test gaps filled by the nyquist auditor in `phase4-mui-form-reliability.test.js` (node env, 13 tests):
  - FORM-01 (7 tests): @material-ui/core + icons absent from all 4 package.json fields and yarn.lock; zero @material-ui in the whole src/ tree (recursive walk); plain-element form contract (input/helper error classes, submit button tolerant of Prettier line-wrapping, textarea, data-netlify, honeypot, disabled={isSubmitting} double-send guard); top-contacts react-icons ri swap (24px × 2, locked hrefs); SCSS theme-variable contract (input/helper/submit/send-error selectors, 3 theme vars, flattened textarea selector, zero MuiInput)
  - FORM-03/UPGR-05 (6 tests): @emailjs/browser 4.4.1 exact pin, emailjs-com zero-rate in package.json + yarn.lock; GATSBY_* env-var credential source with guarded v4 object-form init; zero hardcoded credential strings in src/; .env.example committed with the 3 placeholder values; .gitignore `!.env.example` negation rule ordered after `.env*`; git tracking + non-ignored check
- 2 COVERED by existing tests: FORM-02 (formik.test.js `toHaveClass("error")` assertions, green) and FORM-04 (unskipped regression test, no redirect on failure + inline alert, green)
- 2 manual-only: Netlify env vars + cache-cleared redeploy, live form send end-to-end — owner checkpoint from 04-04, not yet confirmed
- Full suite after audit: 10 suites, 85 passed / 0 skipped (baseline 9 suites, 72 passed)
- 1 test-expectation fix: Prettier multiline button tag → tolerant regex (implementation correct)
