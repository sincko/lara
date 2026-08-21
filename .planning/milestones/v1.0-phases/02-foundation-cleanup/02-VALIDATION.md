---
phase: 2
slug: foundation-cleanup
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-19
validated: 2026-08-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.7.x (Phase 1) + gatsby build |
| **Config file** | `jest.config.js` (exists from Phase 1) |
| **Quick run command** | `yarn test` |
| **Full suite command** | `yarn test && yarn build` |
| **Estimated runtime** | ~60 seconds (test) + ~30s (build) |

---

## Sampling Rate

- **After every task commit:** Run `yarn test`
- **After every plan wave:** Run `yarn test && yarn build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | FNDT-01 | T-02-01 / T-02-03 | Single lockfile, yarn-only build path | unit (fs+git) | `yarn test phase2-foundation-cleanup.test.js` | ✅ | ✅ green |
| 2-02-01 | 02 | 2 | FNDT-02 | T-02-06 | No NODE_VERSION; .nvmrc sole Node source | unit (fs) | `yarn test phase2-foundation-cleanup.test.js` | ✅ | ✅ green |
| 2-02-01 | 02 | 2 | FNDT-03 | T-02-08 | Dead components gone, zero references | unit (fs) | `yarn test phase2-foundation-cleanup.test.js` | ✅ | ✅ green |
| 2-02-02 | 02 | 2 | FNDT-04 | T-02-04 | Runtime dep group removed, keepers intact | unit (fs) | `yarn test phase2-foundation-cleanup.test.js` | ✅ | ✅ green |
| 2-02-03 | 02 | 2 | FNDT-04 | T-02-05 | devDep group removed, keepers intact | unit (fs) | `yarn test phase2-foundation-cleanup.test.js` | ✅ | ✅ green |
| 2-03-01 | 03 | 2 | SEOS-04 | T-02-09 | ga placeholder gone, meta intact | unit (fs) | `yarn test phase2-foundation-cleanup.test.js` | ✅ | ✅ green |
| 2-03-02 | 03 | 2 | SEOS-04 | T-02-10 | README starter-free, yarn-only docs | unit (fs) | `yarn test phase2-foundation-cleanup.test.js` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `nvm use 20` available (Node v20.20.2 installed — node-sass ABI 115 constraint)
- [x] `yarn test` suite green (Phase 1 deliverable — 4 suites, 8 passed + 1 skipped)

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Netlify post-deploy Node version resolution | FNDT-02 | Requires deploy; possible Netlify UI pin overriding .nvmrc | After first deploy, check build log for resolved Node version (research Open Question 1 — resolved: post-deploy log check is the verification path) |
| Site renders identically after dead-component removal | FNDT-03 | Visual check | `yarn build`; spot-check home, blog, contact pages render without errors |

*Both manual items remain inherently human. The Netlify deploy-log check was subsequently satisfied during Phase 3's UPGR-07 checkpoint (user-confirmed clear-cache deploy, commit 100c634).*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-19

---

## Validation Audit 2026-08-19

| Metric | Count |
|--------|-------|
| Gaps found | 9 |
| Resolved | 7 |
| Escalated | 0 |
| Manual-only | 2 |

**Audit trail:**

- 7 MISSING persistent-test gaps filled by the nyquist auditor in `phase2-foundation-cleanup.test.js` (node env, 15 tests):
  - FNDT-01: package-lock.json absent from FS and git (yarn.lock sole tracked lockfile, no npm-shrinkwrap), netlify.toml `command = "yarn build"` with zero npm run build, .prettierignore exactly 3 lines, yarn/y18n dep entries gone with packageManager field intact, prismjs + @testing-library/dom keepers present
  - FNDT-02: zero NODE_VERSION / [build.environment] in netlify.toml; .nvmrc single-line valid Node major (20|24 — Phase 3's bump to 24 respected, no literal asserted)
  - FNDT-03: old-form.js/form-pulito.js absent from FS; zero references in src/ + gatsby-config.js/gatsby-node.js/gatsby-browser.js
  - FNDT-04: 4 runtime deps (codemirror, seamless-immutable, gatsby-background-image, package-doctor) and 5 devDeps (redux, react-refresh, typescript, acorn, netlify-cms-lib-widgets) absent from package.json
  - SEOS-04: site.json valid JSON with no `ga` key (recursive check) and meta intact (siteUrl https://laryart.it, LaryArt title); README zero starter tokens (stackrole, gatsby-starter-foundation, Deploy to Netlify, twitter-header, screenshot.png, package-lock.json, UA-, pensive-engelbart — "Google Analytics" NOT asserted absent: Phase 3 legitimately added the GA4 line), yarn commands + laryart.it present, zero npm commands
- 2 manual-only: Netlify post-deploy Node resolution and visual render check — inherently human; the deploy-log item was later satisfied by Phase 3's UPGR-07 checkpoint (user-confirmed)
- Full suite after audit: 9 suites, 72 passed / 0 skipped (the FORM-04 red test was unskipped and fixed by Phase 4 plan 04-04 during this audit window — commit f48764f)
- No implementation bugs found; zero debug iterations needed
