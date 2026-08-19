---
phase: 3
slug: core-upgrade
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-19
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (Phase 1 scaffold: jest.config.js, loadershim.js, jest-preprocess.js, __mocks__/) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `nvm use 20 && yarn test` (Node 24 after D-07: `nvm use 24 && yarn test`) |
| **Full suite command** | `nvm use 20 && yarn install && yarn build && yarn test` |
| **Estimated runtime** | ~120 seconds (build dominates; jest suite ~10s) |

---

## Sampling Rate

- **After every task commit:** Run `yarn test` (jest suite — 4 suites, ~10s)
- **After every plan wave:** Run the full loop `yarn install && yarn build && yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | UPGR-01 | T-03-01 / — | Lockstep matrix, no partial bumps | build | `nvm use 20 && yarn install && yarn build && yarn test` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | UPGR-02 | T-03-02 / — | dart-sass swap + font hoist | build | `nvm use 20 && yarn install && yarn build && yarn test` + grep hoisted @import | ✅ | ⬜ pending |
| 03-03-01 | 03 | 2 | UPGR-03 | T-03-03 / — | Decap swap, branch fix | build | `nvm use 20 && yarn install && yarn build && yarn test` | ✅ | ⬜ pending |
| 03-04-01 | 04 | 2 | UPGR-04 | T-03-04 / — | Vendored _paq, disableCookies | build | `nvm use 20 && yarn install && yarn build && yarn test` + grep _paq in gatsby-browser.js | ✅ | ⬜ pending |
| 03-05-01 | 05 | 2 | UPGR-06 | T-03-05 / — | Single sitemap plugin | build | `nvm use 20 && yarn install && yarn build && yarn test` + grep advanced-sitemap absent | ✅ | ⬜ pending |
| 03-06-01 | 06 | 3 | UPGR-02/D-07 | T-03-06 / — | Node 24 bump after green matrix | build | `nvm use 24 && yarn install && yarn build && yarn test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — exists from Phase 1 (✅)
- [ ] `__mocks__/gatsby.js`, `__mocks__/file-mock.js` — exist from Phase 1 (✅)
- [ ] `loadershim.js`, `jest-preprocess.js`, `jest.setup.js` — exist from Phase 1 (✅)

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| First post-upgrade Netlify deploy with cleared cache | UPGR-07 | Netlify UI action — cannot be automated from the repo | Netlify → Deploys → Clear cache and deploy site; verify build log shows Node 24 via .nvmrc and all pages render |
| Decap CMS /admin login + post save | UPGR-03 | Requires Netlify Identity credentials | Open /admin, log in via Netlify Identity, edit and save a post, verify the commit lands on `main` |
| Matomo visits recorded | UPGR-04 | Requires live site + Matomo dashboard access | Visit laryart.it, check Matomo dashboard shows the visit; verify no tracking cookies set (disableCookies) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
