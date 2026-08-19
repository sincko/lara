---
phase: 4
slug: mui-removal-form-reliability
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (Phase 1 scaffold: jest.config.js, loadershim.js, jest-preprocess.js, __mocks__/) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `nvm use 24 && yarn test` |
| **Full suite command** | `nvm use 24 && yarn install && yarn build && yarn test` |
| **Estimated runtime** | ~60 seconds (build dominates; jest suite ~2s) |

---

## Sampling Rate

- **After every task commit:** Run `yarn test` (jest suite — 4 suites, ~2s)
- **After every plan wave:** Run the full loop `yarn install && yarn build && yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | FORM-01 | T-04-01 / — | MUI removed, plain SCSS form | build | `nvm use 24 && yarn install && yarn build && yarn test` + grep no @material-ui | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | FORM-02 | T-04-02 / — | Error UX preserved | unit | `nvm use 24 && yarn test` (updated formik.test.js) | ✅ | ⬜ pending |
| 04-03-01 | 03 | 2 | FORM-03, UPGR-05 | T-04-03 / — | No hardcoded creds; env vars | build | `nvm use 24 && yarn install && yarn build && yarn test` + grep no user_ key | ✅ | ⬜ pending |
| 04-04-01 | 04 | 2 | FORM-04 | T-04-04 / — | No false success | unit | `nvm use 24 && yarn test` (unskipped regression test) | ✅ | ⬜ pending |

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
| Netlify env vars set (GATSBY_EMAILJS_*) | FORM-03 | Netlify UI action — cannot be automated from the repo | Netlify → Site settings → Environment variables: add GATSBY_EMAILJS_PUBLIC_KEY, GATSBY_EMAILJS_SERVICE_ID, GATSBY_EMAILJS_TEMPLATE_ID with the D-09 values; redeploy with cleared cache |
| Live form send works end-to-end | FORM-04 | Requires live site + real email delivery | Submit the contact form on laryart.it with valid data → /thanks; submit with EmailJS broken (or check the failure path) → inline error, no redirect |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
