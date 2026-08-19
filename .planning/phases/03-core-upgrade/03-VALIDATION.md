---
phase: 3
slug: core-upgrade
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-19
validated: 2026-08-19
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.7.0 (Phase 1 scaffold: jest.config.js, loadershim.js, jest-preprocess.js, __mocks__/) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `yarn test` (jest suite — 6 suites, ~10s) |
| **Full suite command** | `yarn install && yarn build && yarn test` |
| **Estimated runtime** | ~120 seconds (build dominates; jest suite ~10s) |

---

## Sampling Rate

- **After every task commit:** Run `yarn test` (jest suite — 6 suites, ~10s)
- **After every plan wave:** Run the full loop `yarn install && yarn build && yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | UPGR-01 | T-03-01 / T-03-02 | Lockstep matrix, no partial bumps | unit (fs) | `yarn test phase3-upgrade-matrix.test.js` | ✅ | ✅ green |
| 03-02-01 | 02 | 2 | UPGR-02 | T-03-04 / T-03-06 | dart-sass swap + dead guards removed | unit (fs) | `yarn test phase3-upgrade-matrix.test.js` | ✅ | ✅ green |
| 03-02-02 | 02 | 2 | UPGR-02 | T-03-05 | Font hoist (D-06 silent regression) | unit (fs) | `yarn test phase3-upgrade-matrix.test.js` | ✅ | ✅ green |
| 03-02-03 | 02 | 2 | UPGR-02 | — | README stack truth | unit (fs) | `yarn test phase3-upgrade-matrix.test.js` | ✅ | ✅ green |
| 03-03-01 | 03 | 2 | UPGR-03 | T-03-07 / T-03-08 / T-03-09 | Decap swap, branch fix, paths kept | unit (fs) | `yarn test phase3-upgrade-matrix.test.js` | ✅ | ✅ green |
| 03-04-01 | 04 | 2 | UPGR-04 | T-03-10 / T-03-11 | GA4 gtag snippet (owner override), anonymize_ip, window guards | unit (jsdom) | `yarn test gatsby-browser.test.js` | ✅ | ✅ green |
| 03-05-01 | 05 | 2 | UPGR-06 | T-03-13 / T-03-14 | Single sitemap plugin | unit (fs) | `yarn test phase3-upgrade-matrix.test.js` | ✅ | ✅ green |
| 03-06-01 | 06 | 3 | UPGR-02/D-07 | T-03-15 | Node 24 bump after green matrix | unit (fs) | `yarn test phase3-upgrade-matrix.test.js` | ✅ | ✅ green |
| 03-06-02 | 06 | 3 | UPGR-07 | T-03-16 / T-03-17 | Netlify clear-cache deploy + live checks | manual | — (user checkpoint) | n/a | ✅ manual |

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
| First post-upgrade Netlify deploy with cleared cache | UPGR-07 | Netlify UI action — cannot be automated from the repo | Netlify → Deploys → Clear cache and deploy site; verify build log shows Node 24 via .nvmrc and all pages render |
| Decap CMS /admin login + post save | UPGR-03 | Requires Netlify Identity credentials | Open /admin, log in via Netlify Identity, edit and save a post, verify the commit lands on `main` |
| GA4 visits recorded | UPGR-04 | Requires live site + GA4 dashboard access | Visit laryart.it, check GA4 dashboard shows the visit; verify anonymize_ip config (no full IP stored) |

*All three manual items were user-confirmed during the UPGR-07 checkpoint (commit 100c634, 2026-08-19).*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-19

---

## Validation Audit 2026-08-19

| Metric | Count |
|--------|-------|
| Gaps found | 7 |
| Resolved | 6 |
| Escalated | 0 |
| Manual-only | 1 |

**Audit trail:**

- 6 MISSING persistent-test gaps filled by the nyquist auditor:
  - `phase3-upgrade-matrix.test.js` (node env, 19 tests) — UPGR-01 lockstep matrix, UPGR-02 dart-sass swap + font hoist + guards, UPGR-03 Decap swap, UPGR-04 matomo removal, UPGR-06 single sitemap, D-07 Node 24 enforcement
  - `gatsby-browser.test.js` (jsdom, 7 tests) — behavioral GA4 gtag snippet: module-scope init config (anonymize_ip, send_page_view: false), onRouteUpdate page_path/page_referrer (absolute prev URL), null-prevLocation and missing-gtag guards, onServiceWorkerUpdateReady confirm/decline
- 1 manual-only (UPGR-07 Netlify clear-cache deploy + live checks) — already user-confirmed in commit 100c634; not automatable
- Full suite after audit: 6 suites, 34 passed / 1 skipped (baseline was 4 suites, 8 passed / 1 skipped; the skip is the pre-existing intentional `it.skip` in formik.test.js)
- No implementation bugs found; one test-fixture fix (jsdom read-only `window.location.reload` — replaced the location object, same pattern as formik.test.js)
