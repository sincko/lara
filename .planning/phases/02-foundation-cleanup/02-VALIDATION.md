---
phase: 2
slug: foundation-cleanup
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.7.x (Phase 1) + gatsby build |
| **Config file** | `jest.config.js` (exists from Phase 1) |
| **Quick run command** | `source ~/.nvm/nvm.sh && nvm use 20 && yarn test` |
| **Full suite command** | `source ~/.nvm/nvm.sh && nvm use 20 && yarn test && yarn build` |
| **Estimated runtime** | ~60 seconds (test) + ~30s (build) |

---

## Sampling Rate

- **After every task commit:** Run `source ~/.nvm/nvm.sh && nvm use 20 && yarn test`
- **After every plan wave:** Run `source ~/.nvm/nvm.sh && nvm use 20 && yarn test && yarn build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | FNDT-01 | — | N/A | source | `test ! -f package-lock.json && grep -xq 'command = "yarn build"' netlify.toml` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 2 | FNDT-02 | — | N/A | source | `grep -q 'NODE_VERSION' netlify.toml` (must be absent) | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 2 | FNDT-03 | — | N/A | source | `test ! -f src/components/old-form.js && test ! -f src/components/form-pulito.js` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 2 | FNDT-04 | — | N/A | build | `nvm use 20 && yarn install && yarn build && yarn test` | — | ⬜ pending |
| 2-02-03 | 02 | 2 | FNDT-04 | — | N/A | build | `nvm use 20 && yarn install && yarn build && yarn test && yarn why netlify-cms-lib-widgets 2>&1 \| grep -q netlify-cms-app` | — | ⬜ pending |
| 2-03-01 | 03 | 2 | SEOS-04 | — | N/A | source | `grep -q '"ga"' src/util/site.json` (must be absent) | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 2 | SEOS-04 | — | N/A | source | `grep -qE 'Stackrole\|gatsby-starter' README.md` (must be absent) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `nvm use 20` available (Node v20.20.2 installed — node-sass ABI 115 constraint)
- [ ] `yarn test` suite green (Phase 1 deliverable — 4 suites, 8 passed + 1 skipped)

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Netlify post-deploy Node version resolution | FNDT-02 | Requires deploy; possible Netlify UI pin overriding .nvmrc | After first deploy, check build log for resolved Node version (research Open Question 1 — resolved: post-deploy log check is the verification path) |
| Site renders identically after dead-component removal | FNDT-03 | Visual check | `nvm use 20 && yarn build`; spot-check home, blog, contact pages render without errors |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-19 (plans verified Nyquist-compliant by gsd-plan-checker)