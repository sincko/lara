---
phase: 5
slug: image-pipeline-seo-fixes
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.7.0 + @testing-library/react 16.3.2 (existing Phase 1 scaffold) |
| **Config file** | `jest.config.js` (babel-preset-gatsby transform, `__mocks__/` root) |
| **Quick run command** | `yarn test src/templates/blog-list.test.js` |
| **Full suite command** | `yarn install && yarn build && yarn test` |
| **Estimated runtime** | ~60 seconds (build dominates; jest suite ~2s) |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/templates/blog-list.test.js` (fast, targeted)
- **After every plan wave:** Run the full loop `yarn install && yarn build && yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | IMAG-01 | T-05-01 / — | gatsby-plugin-image 3.16.0 installed, no gatsby-image imports | unit (fs) | `grep -rl "gatsby-image" src/ \| wc -l` → 0 | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | IMAG-01 | T-05-02 / — | All 3 surfaces render via GatsbyImage | build-output | `grep -rl "gatsby-image-outer-wrapper" public/ \| wc -l` → 0 | ✅ | ⬜ pending |
| 05-01-03 | 01 | 1 | IMAG-02 | T-05-03 / — | tracedSVG removed; placeholders in output | build-output | `grep -c "data-placeholder-image" public/` > 0 | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | IMAG-03 | T-05-04 / — | og:image real URL, no [object Object] | build-output | `grep -c "object Object" public/*/index.html` → 0 | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | SEOS-01 | T-05-05 / — | lang="it", no hreflang | build-output | greps per RESEARCH Code Example 7 | ✅ | ⬜ pending |
| 05-02-03 | 02 | 2 | SEOS-02 | T-05-06 / — | Italian meta, no English starter text | build-output | `grep -rl "Stackrole base blog page" public/` → 0 | ✅ | ⬜ pending |
| 05-02-04 | 02 | 2 | SEOS-02 (D-16) | T-05-07 / — | Pagination renders "Precedente"/"Successivo" | unit (jsdom) | `yarn test src/templates/blog-list.test.js` | ✅ (update assertions) | ⬜ pending |
| 05-03-01 | 03 | 2 | SEOS-03 | T-05-08 / — | Privacy page valid HTML | build-output + visual | grep tag balance + held-out /privacy check | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/templates/blog-list.test.js` — assertion updates for Precedente/Successivo + remove dead `jest.mock("gatsby-image")` (co-change with D-16)
- [ ] No new test files required — phase verification is build-output inspection (success criteria are rendered-source checks), which the grep commands cover.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blog-post 50vh banner visual parity (landscape/portrait) | IMAG-01 | Visual layout check — constrained GatsbyImage flows at natural ratio vs legacy absolute-fill | Open a post with landscape image and one with portrait image after build; banner must look as before (research §4 conditional absolute-fill CSS if gap/clip appears) |
| Privacy page renders clean | SEOS-03 | Rendered HTML validity | Open /privacy after build; no stray `</p>`, no `####` as text, all links work |
| Blog cards render as before | IMAG-01 | Visual parity of 540×360 center-crop | Open /blog and home; card images must match legacy crop |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
