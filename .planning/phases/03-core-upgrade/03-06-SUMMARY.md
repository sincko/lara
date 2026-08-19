---
phase: 03-core-upgrade
plan: 06
subsystem: infra
tags: [node, nvm, engines, netlify, deploy, gatsby]

# Dependency graph
requires:
  - phase: 03-core-upgrade
    provides: "Gatsby 5.16.1 + dart-sass matrix (03-02), Decap CMS swap (03-03), vendored Matomo (03-04), single sitemap (03-05) — all verified green under Node 20, the D-07b precondition for this plan"
provides:
  - "Node 24 enforced: .nvmrc `24`, engines.node \"24.x\", README Node 24 notes"
  - "D-07 gate green: nvm use 24 && yarn install && yarn build && yarn test exits 0"
  - "First post-upgrade Netlify deploy checkpoint (D-15) surfaced for the user"
affects: [04-form-emailjs, 05-images-seo, 06-performance, netlify-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Node version bump as its own commit AFTER the dependency matrix is green under the old Node (D-07b ordering)"
    - "Node enforcement guard (check-node-version.js) reads .nvmrc dynamically — version bumps are pure config edits"

key-files:
  created: []
  modified:
    - .nvmrc
    - package.json
    - README.md

key-decisions:
  - "Node 24 bump committed separately from all dependency changes per D-07b, only after the full 5.16.1 + dart-sass matrix was verified green under Node 20"
  - "scripts/check-node-version.js left untouched — it reads .nvmrc dynamically, so the bump is purely .nvmrc + engines.node + README"

patterns-established:
  - "D-07b commit ordering: dependency matrix green under old Node → then Node bump as its own commit → then full loop under new Node"

requirements-completed: []  # UPGR-02/UPGR-07 remain open until the manual Netlify deploy checkpoint (Task 2) is verified by the user

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Node 24 enforced locally: .nvmrc `24`, engines.node \"24.x\", README Node 24 notes, zero stale Node 20 references"
    requirement: UPGR-02
    verification:
      - kind: unit
        ref: "grep -qx '24' .nvmrc && grep -q '\"node\": \"24.x\"' package.json && ! grep -q 'Node.js 20' README.md && grep -q 'nvm alias default 24' README.md"
        status: pass
      - kind: integration
        ref: "source ~/.nvm/nvm.sh && nvm use 24 && yarn install && yarn build && yarn test (D-07 gate)"
        status: pass
    human_judgment: false
  - id: D2
    description: "First post-upgrade Netlify deploy with cleared cache succeeds on Node 24; live site passes CMS, analytics, and sitemap checks"
    requirement: UPGR-07
    verification: []
    human_judgment: true
    rationale: "Manual user action in the Netlify UI (Deploys → Clear cache and deploy site) plus live-site checks (/admin login + post save, Matomo visits, sitemap.xml) — not automatable from this environment; requires the user's Netlify access and live-site verification"

# Metrics
duration: 2min
completed: 2026-08-19
status: in-progress
---

# Phase 3 Plan 6: Node 24 Bump + Netlify Deploy Checkpoint Summary

**Node 24 enforced (.nvmrc + engines.node + README) with the full install/build/test loop green under Node 24, committed separately after the Node 20 matrix was verified (D-07/D-07b); manual Netlify clear-cache deploy checkpoint (D-15) pending user action**

## Performance

- **Duration:** 2 min
- **Started:** 2026-08-19T16:09:34Z
- **Completed:** 2026-08-19T16:11:53Z
- **Tasks:** 1 of 2 complete (Task 2 is a manual user checkpoint — not executable by the agent)
- **Files modified:** 3

## Accomplishments

- Node 24 is the enforced version: `.nvmrc` `24`, `engines.node` `"24.x"`, README Node 24 notes (prerequisites, enforcement note, `nvm alias default 24`, Netlify Node version line) — zero stale Node 20 references
- D-07b ordering honored: the full 5.16.1 + dart-sass matrix was verified green under Node 20 (install ✓, build ✓ 10.97s, test ✓ 8 passed/1 skipped) BEFORE the bump commit
- D-07 gate green under Node 24.19.0: `nvm use 24 && yarn install && yarn build && yarn test` exits 0 (build 18.36s, test 8 passed/1 skipped)
- The bump is its own atomic commit (`293a776`), separate from all dependency commits per D-07b

## Task Commits

Each task was committed atomically:

1. **Task 1: Node 24 bump: .nvmrc + engines.node + README Node notes (UPGR-02, D-07/D-07b)** - `293a776` (feat)
2. **Task 2: First post-upgrade Netlify deploy with cleared cache + live-site verification (UPGR-07, D-15)** - NOT EXECUTED (manual user checkpoint — returned to orchestrator)

**Plan metadata:** pending — SUMMARY committed at checkpoint return (plan not complete)

## Files Created/Modified

- `.nvmrc` - `20` → `24` (single line, format preserved)
- `package.json` - `engines.node` `"20.x"` → `"24.x"` (no other field touched)
- `README.md` - Node 24 notes: line 19 (stack), line 25 (prerequisites), line 28 (enforcement note + `nvm alias default 24`), line 58 (Netlify Node version)

## Decisions Made

- Node 24 bump committed separately from all dependency changes per D-07b, only after the full 5.16.1 + dart-sass matrix was verified green under Node 20
- `scripts/check-node-version.js` left untouched — it reads `.nvmrc` dynamically, so the bump is purely `.nvmrc` + `engines.node` + README
- `netlify.toml` left untouched — Phase 2 already set `yarn build`; `.nvmrc` resolves via nvm on Netlify

## Deviations from Plan

None - plan executed exactly as written for Task 1. Task 2 is a manual user checkpoint and was correctly not executed by the agent.

## Issues Encountered

None. The Node 24 loop was green on the first run (no dependency incompatibilities surfaced — T-03-15 mitigated).

## User Setup Required

None - no external service configuration required from the agent side. The remaining work is the manual Netlify deploy checkpoint (Task 2).

## Next Phase Readiness

- Local stack fully upgraded and green under Node 24 — ready for the manual Netlify deploy checkpoint
- **Blocking:** Task 2 (D-15) requires the user to push the branch, run the first post-upgrade Netlify deploy with cleared cache, and verify the live site (pages render, /admin login + post save, Matomo visits, sitemap.xml)
- After the checkpoint passes: UPGR-02 and UPGR-07 can be marked complete, and Phase 3's ROADMAP success criteria 2-5 are satisfied

---

*Phase: 03-core-upgrade*
*Status: in-progress — 1 of 2 tasks complete, manual checkpoint pending*
