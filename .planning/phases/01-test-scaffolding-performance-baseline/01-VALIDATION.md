---
phase: 1
slug: test-scaffolding-performance-baseline
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-18
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
| 1-01-01 | 01 | 1 | FNDT-05 | — | N/A | infra | `yarn test` exits 0 | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | FNDT-05 | — | N/A | unit | `yarn test src/components/formik.test.js` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | FNDT-05 | — | N/A | unit | `yarn test src/templates/blog-list.test.js` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | FNDT-05 | — | N/A | unit | `yarn test src/components/navigation.test.js` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 1 | FNDT-05 | — | N/A | unit | `yarn test gatsby-node.test.js` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | FNDT-06 | — | N/A | manual | `node scripts/capture-baseline.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — jest config with transform, moduleNameMapper (gatsby, SCSS, images)
- [ ] `__mocks__/gatsby.js` — manual gatsby module mocks (Link, graphql, useStaticQuery)
- [ ] `jest.setup.js` — @testing-library/jest-dom matchers
- [ ] devDependencies install — jest, babel-jest, babel-preset-gatsby, jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom, identity-obj-proxy

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lighthouse + PSI baseline capture (median 3, mobile, LCP/CLS/INP) | FNDT-06 | Requires live site + Chrome; not unit-testable | Run `node scripts/capture-baseline.js`; verify `.planning/baseline/` contains results JSON |
| Form submit failure path (red test) | FNDT-05 | Fails against current buggy code by design — regression net for Phase 4 | `it.skip` with FNDT-05→FORM-04 comment; un-skip in Phase 4 |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
