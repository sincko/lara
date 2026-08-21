---
phase: 02-foundation-cleanup
plan: 04
subsystem: infra
tags: [node, nvm, yarn, engine-strict, node-sass, gatsby, build-guard]

# Dependency graph
requires:
  - phase: 02-foundation-cleanup
    provides: "02-02 (lockfile consolidation, netlify.toml yarn build) and 02-03 (README Italian rewrite) — this plan builds the enforcement layer on top"
provides:
  - "engines.node 20.x + .yarnrc engine-strict true — hard block on non-20 Node"
  - "scripts/check-node-version.js — preinstall/prebuild/predevelop guard with NODE_VERSION_MISMATCH token"
  - "scripts/clean-node-sass-vendor.js — postinstall guard deleting non-ELF vendor bindings with NODE_SASS_BINARY_MISSING token"
  - "README.md — documented enforced Node 20 contract and one-command recovery"
affects: [03-core-upgrade, UPGR-02 dart-sass migration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Node-version enforcement: engines + engine-strict + pre* lifecycle guard scripts (dependency-free, no network)"
    - "Vendor hygiene: postinstall ELF-magic validation of native bindings"

key-files:
  created:
    - scripts/check-node-version.js
    - scripts/clean-node-sass-vendor.js
    - .yarnrc
  modified:
    - package.json
    - README.md

key-decisions:
  - "Guard scripts are dependency-free plain Node (no new npm packages — T-02-SC mitigation)"
  - "Guard error messages are in Italian with distinct tokens (NODE_VERSION_MISMATCH, NODE_SASS_BINARY_MISSING) for grep-ability"
  - "clean-node-sass-vendor.js accepts NODE_SASS_VENDOR_DIR override for testability"

patterns-established:
  - "Pre* lifecycle scripts as Node-version gates: preinstall/prebuild/predevelop all run the same guard"
  - "Postinstall as vendor-hygiene gate: ELF magic check (0x7f 0x45 0x4c 0x46) before trusting a native binding"

requirements-completed: [FNDT-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Node 20 enforcement — yarn install under Node 24 fails loudly with NODE_VERSION_MISMATCH; Node 20 install/build/test green"
    requirement: FNDT-02
    verification:
      - kind: integration
        ref: "nvm use 24 && yarn install → exit 1 + NODE_VERSION_MISMATCH; nvm use 20 && yarn install && yarn build && yarn test → exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "node-sass vendor hygiene — poisoned non-ELF binding deleted on install; valid ABI-115 binding survives; NODE_SASS_BINARY_MISSING when no valid binary"
    verification:
      - kind: integration
        ref: "node scripts/clean-node-sass-vendor.js with simulated 9-byte binding + empty-vendor override"
        status: pass
    human_judgment: false
  - id: D3
    description: "README documents enforced Node 20 contract and recovery command (nvm use && yarn install), zero starter tokens"
    verification:
      - kind: other
        ref: "grep recovery command + check-node-version mention; forbidden-token rg exits 1"
        status: pass
    human_judgment: false

# Metrics
duration: 8min
completed: 2026-08-19
status: complete
---

# Phase 02 Plan 04: Node-version enforcement + node-sass vendor hygiene Summary

**Node 20 enforced via engines + engine-strict + pre* guard scripts; postinstall ELF-magic guard deletes poisoned node-sass bindings — G-02-1 and G-02-2 closed**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-19T12:53:55Z
- **Completed:** 2026-08-19T13:02:51Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Node 20 is now an enforced invariant: `engines.node: "20.x"` + `.yarnrc` `engine-strict true` + `scripts/check-node-version.js` wired as preinstall/prebuild/predevelop — `yarn install` under Node 24 exits 1 with an explicit `NODE_VERSION_MISMATCH` error before any package work (G-02-1 root cause closed)
- Poisoned node-sass bindings can no longer survive: `scripts/clean-node-sass-vendor.js` (postinstall) deletes any non-ELF `binding.node` from `node_modules/node-sass/vendor/` and exits 1 with `NODE_SASS_BINARY_MISSING` if no valid binary remains (G-02-2 root cause closed)
- The phase's real gate is green again: `nvm use 20 && yarn install && yarn build && yarn test` exits 0 (4 test suites pass, build 18s)
- README documents the enforced contract and the one-command recovery (`nvm use && yarn install`) in Italian, zero starter tokens

## Task Commits

Each task was committed atomically:

1. **Task 1 (tracer): Node-version enforcement: engines + engine-strict + pre* guard** - `405fa48` (fix)
2. **Task 2: node-sass vendor hygiene: postinstall cleanup of poisoned bindings** - `553ced3` (fix)
3. **Task 3: README: document enforced Node 20 + recovery command** - `e6b62dc` (docs)

**Plan metadata:** committed with SUMMARY (see below)

## Files Created/Modified

- `scripts/check-node-version.js` - Node-major guard vs `.nvmrc`; exits 1 with `NODE_VERSION_MISMATCH` on mismatch, 0 silently on match, 0 if no `.nvmrc`
- `scripts/clean-node-sass-vendor.js` - postinstall vendor hygiene; ELF-magic check, unlinks non-ELF bindings, exits 1 with `NODE_SASS_BINARY_MISSING` if no valid binary
- `.yarnrc` - `engine-strict true` (single line)
- `package.json` - `engines.node: "20.x"`; preinstall/prebuild/predevelop/postinstall script wiring
- `README.md` - Italian note on enforced Node 20 + recovery command

## Decisions Made

- Guard scripts are dependency-free plain Node — no new npm packages installed (T-02-SC mitigation honored)
- Error messages in Italian with distinct grep-able tokens (`NODE_VERSION_MISMATCH`, `NODE_SASS_BINARY_MISSING`) for fail-loud diagnosis
- `NODE_SASS_VENDOR_DIR` env override in the cleanup script for testability (empty-vendor simulation)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] /tmp quota exhaustion broke yarn's error-log write during first Node-24 verify run**
- **Found during:** Task 1 (Node-version enforcement verify)
- **Issue:** First `yarn install` under Node 24 exited 1 but the log was empty — yarn reported `Unknown system error -122 (EDQUOT), write`. Root cause: the user's /tmp tmpfs quota (10330M) was exhausted by ~853 leaked 13MB `.so` files (10.2GB) created by an external process (not this repo's work).
- **Fix:** No repo change needed — the leak was transient and self-cleaned (churn dropped to 430MB within minutes). Re-ran the verify; the guard's `NODE_VERSION_MISMATCH` message then appeared correctly in yarn's output.
- **Files modified:** none
- **Verification:** Re-run of `nvm use 24 && yarn install` → exit 1 with `NODE_VERSION_MISMATCH` in output (PASS)
- **Committed in:** 405fa48 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking, environment-side)
**Impact on plan:** No plan change — the deviation was an environment condition (external /tmp leak), not a defect in the plan's artifacts. All acceptance criteria verified green after the transient cleared.

## Issues Encountered

- None beyond the /tmp quota transient documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 02 truth restored: one Node version (20), enforced — `.nvmrc` is now backed by engines + engine-strict + guard scripts
- G-02-1 and G-02-2 closed; the durable node-sass→dart-sass replacement remains Phase 3 (UPGR-02) scope, untouched
- Ready for Phase 03-core-upgrade

---

*Phase: 02-foundation-cleanup*
*Completed: 2026-08-19*

## Self-Check: PASSED

- All 4 key files exist on disk (scripts/check-node-version.js, scripts/clean-node-sass-vendor.js, .yarnrc, 02-04-SUMMARY.md)
- All 4 commits present in git history (405fa48, 553ced3, e6b62dc, e412242)
- Plan-level verification re-run green: `nvm use 20 && yarn install && yarn build && yarn test` exit 0; Node 24 install fails with NODE_VERSION_MISMATCH; poisoned 137 binding absent, ABI-115 binding intact
