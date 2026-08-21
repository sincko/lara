---
phase: 6
slug: performance-asset-cleanup-final-verification
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-20
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.7.0 + @testing-library/react 16.3.2 (existing) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `yarn test` |
| **Full suite command** | `yarn install && yarn build && yarn test` |
| **Estimated runtime** | ~60 seconds (build dominates; jest suite ~2s) |

---

## Sampling Rate

- **After every task commit:** Run `yarn test` (fast, targeted)
- **After every plan wave:** Run the full loop `yarn install && yarn build && yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | PERF-01 | T-06-01 / — | @fontsource layout-entry imports; zero @import url( in style.scss | unit (text) | `yarn test phase3-upgrade-matrix.test.js` (rewritten UPGR-02) | ❌ W0 co-change | ⬜ pending |
| 06-01-02 | 01 | 1 | PERF-01 | T-06-02 / — | @font-face blocks + woff2 emitted in built CSS | build-output | `grep -c "@font-face" public/styles.*.css` > 0; `grep -rl "@import url" public/styles.*.css` → 0 | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | PERF-02 | T-06-03 / — | Deletion list script-computed; kept files exist | build-output | script + `yarn build` green; grep referenced paths in public/ | ✅ | ⬜ pending |
| 06-03-01 | 03 | 2 | PERF-03 | T-06-04 / — | Exactly one manifest; legacy set gone | build-output | `ls public/manifest.webmanifest`; `test ! -f public/manifest.json`; legacy files absent from static/ | ✅ | ⬜ pending |
| 06-04-01 | 04 | 3 | PERF-04 | T-06-05 / — | CWV medians ≤ thresholds, improved vs baseline | manual (post-deploy) | `node .planning/baseline/capture-baseline.js` + `median.js` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `phase3-upgrade-matrix.test.js` — UPGR-02 rewrite (already red in the working tree from the 5a7d35c @use migration): re-assert (a) style.scss has zero `@import url(`; (b) @fontsource imports present (layout-entry form — assert layout.js import lines or package.json pins); (c) package.json pins `@fontsource/ubuntu` + `@fontsource/parisienne`
- [ ] No new test file needed for the deletion script (executor-side; build + greps are the verification)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Final CWV capture | PERF-04 | Requires live deployment (D-16 manual checkpoint) + Lighthouse against https://laryart.it | Owner deploys the phase to Netlify, then runs `node .planning/baseline/capture-baseline.js` + `median.js`; compare LCP/CLS/INP vs BASELINE.md medians |
| No broken images after dedup | PERF-02 | Visual check | Browse /, /blog, a few posts after cleanup; all featured images render (build grep is the automated backstop) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
