---
phase: 02-foundation-cleanup
plan: 01
subsystem: infra
tags: [yarn, lockfile, netlify, node-sass, node-20, dependency-removal]

# Dependency graph
requires:
  - phase: 01-test-scaffolding-performance-baseline
    provides: green jest regression net (4 suites) proving removals don't break tests; node-sass ABI 115 / Node 20 evidence
provides:
  - Single-lockfile yarn-only baseline (yarn.lock sole lockfile; package-lock.json deleted from git and filesystem)
  - netlify.toml build command switched to `yarn build` (Netlify cannot regenerate package-lock.json)
  - Proven `nvm use 20 && yarn install && yarn build && yarn test` green loop — the contract every Plan 02/03 task builds on
affects: [02-02 (Node config + dead components), 02-03 (dependency sweep), phase 3 (upgrades on proven baseline)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Removal verification loop (D-10): yarn why BEFORE → yarn remove → install+build+test AFTER, one logical group per commit"
    - "Node-version pinning: every build/test command opens with `nvm use 20` (node-sass ABI 115 prebuilt; shell default Node 24 fails)"
    - "yarn remove for manifest edits (never hand-edit package.json — prevents manifest/lockfile drift)"

key-files:
  created: []
  modified:
    - package-lock.json (deleted — git rm)
    - netlify.toml (command = "yarn build")
    - .prettierignore (package-lock.json line removed)
    - package.json (yarn, y18n removed from dependencies)
    - yarn.lock (yarn/y18n resolution entries pruned)

key-decisions:
  - "D-01/D-02/D-03 implemented in one atomic commit (Pitfall 7: command switch co-committed with lockfile deletion so Netlify cannot resurrect package-lock.json)"
  - "D-07 subset (yarn, y18n) removed via `yarn remove` — transitive y18n copies survive via node-sass#sass-graph#yargs and jest#jest-cli#yargs (yarn why evidence)"
  - "prismjs and @testing-library/dom confirmed keepers (yarn-1 peer mechanism — research anti-patterns)"
  - "NODE_VERSION = \"10\" left untouched in netlify.toml (Plan 02 / D-04 scope)"

patterns-established:
  - "Pattern 1: Removal verification loop (yarn why → yarn remove → install+build+test)"
  - "Pattern 2: Node-version pinning (nvm use 20 before every build/test command)"

requirements-completed: [FNDT-01, FNDT-04]

# Coverage metadata (#1602) — one entry per shipped deliverable. Drives DETERMINISTIC UAT routing in verify-work.
coverage:
  - id: D1
    description: "Single-lockfile consolidation: package-lock.json deleted from git and filesystem, yarn.lock the sole lockfile, yarn install resolves clean without regenerating package-lock.json (FNDT-01, D-01)"
    requirement: FNDT-01
    verification:
      - kind: other
        ref: "command `test ! -f package-lock.json && git ls-files package-lock.json` (empty) && `yarn install` exits 0 with no untracked package-lock.json"
        status: pass
    human_judgment: false
  - id: D2
    description: "netlify.toml build command switched to `yarn build` (D-02) and .prettierignore package-lock.json line removed (D-03)"
    requirement: FNDT-01
    verification:
      - kind: other
        ref: "command `grep -qE '^\\s*command = \"yarn build\"$' netlify.toml` && `! grep -q 'npm run build' netlify.toml` && `! grep -qx 'package-lock.json' .prettierignore`"
        status: pass
    human_judgment: false
  - id: D3
    description: "Hack-remnant deps yarn and y18n removed from package.json dependencies via yarn remove; prismjs and @testing-library/dom confirmed still present (D-07 subset, D-08/D-13 keepers)"
    requirement: FNDT-04
    verification:
      - kind: other
        ref: "command `! grep -q '\"yarn\"' package.json && ! grep -q '\"y18n\"' package.json && grep -q '\"prismjs\"' package.json && grep -q '\"@testing-library/dom\"' package.json`"
        status: pass
    human_judgment: false
  - id: D4
    description: "Full build/test loop green under Node 20: yarn install + yarn build (node-sass ABI 115 prebuilt) + yarn test (4 suites, 8 passed 1 skipped) all exit 0"
    requirement: FNDT-01
    verification:
      - kind: integration
        ref: "command `nvm use 20 && yarn install && yarn build && yarn test` exits 0"
        status: pass
    human_judgment: false

# Metrics
duration: 3min
completed: 2026-08-19
status: complete
---

# Phase 2 Plan 1: Single-Lockfile Consolidation + Yarn Build Switch Summary

**package-lock.json deleted from git and filesystem, netlify.toml switched to `yarn build`, stale .prettierignore line removed, and hack-remnant deps `yarn`/`y18n` removed — all in one atomic commit with the full `nvm use 20 && yarn install && yarn build && yarn test` loop verified green**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-19T11:03:53Z
- **Completed:** 2026-08-19T11:06:45Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments

- Single-lockfile baseline proven: `package-lock.json` gone from index and filesystem; `yarn install` resolves clean and does NOT regenerate it (FNDT-01, D-01)
- `netlify.toml` build command is now `command = "yarn build"` — co-committed with the lockfile deletion per Pitfall 7 so Netlify cannot resurrect package-lock.json (D-02)
- `.prettierignore` cleaned: `package-lock.json` line removed, 3 lines remain (D-03)
- `yarn` and `y18n` removed from `dependencies` via `yarn remove` (atomic package.json + yarn.lock rewrite); `yarn why` pre-verification confirmed `yarn` was specified-in-dependencies-only and `y18n` survives transitively via node-sass#sass-graph#yargs and jest#jest-cli#yargs (D-07 subset)
- Keepers confirmed present: `prismjs` (gatsby-remark-prismjs peer under yarn 1) and `@testing-library/dom` (RTL 16 peer) — NOT removed (D-08/D-13)
- `NODE_VERSION = "10"` untouched in netlify.toml — correctly deferred to Plan 02 (D-04)
- Full loop green under Node 20: `yarn install` (0.37s, up-to-date), `yarn build` (33.92s, node-sass ABI 115 prebuilt loaded), `yarn test` (4 suites, 8 passed, 1 skipped — the intentional Phase 4 regression net)

## Task Commits

Each task was committed atomically:

1. **Task 1 (tracer): Single-lockfile consolidation + yarn build switch + hack-dep removal (D-01, D-02, D-03, D-07 subset)** - `260f9fd` (fix)

**Plan metadata:** committed with this SUMMARY (docs)

## Files Created/Modified

- `package-lock.json` - DELETED (git rm — removed from index and working tree; 1,011,885 bytes gone)
- `netlify.toml` - line 3: `command = "npm run build"` → `command = "yarn build"`; `[build.environment]` NODE_VERSION untouched
- `.prettierignore` - `package-lock.json` line removed (`.cache`, `package.json`, `public` remain)
- `package.json` - `yarn` (line 58) and `y18n` (line 57) removed from `dependencies`; `packageManager: "yarn@1.22.22"` intact
- `yarn.lock` - yarn/y18n direct resolution entries pruned by `yarn remove`

## Decisions Made

- All changes committed as ONE atomic commit per the plan's Pitfall 7 requirement (command switch + lockfile deletion co-committed)
- `yarn remove yarn y18n` used instead of hand-editing package.json (research "Don't Hand-Roll" — prevents manifest/lockfile drift)
- Verification commands all opened with `nvm use 20` (Pattern 2) — shell default Node 24 would trigger node-sass source-compile failure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan's `grep -xq 'command = "yarn build"'` acceptance pattern cannot match the real file**
- **Found during:** Task 1 (acceptance criteria verification)
- **Issue:** The plan's exact-line grep pattern ignores TOML's 2-space indentation — the real line is `  command = "yarn build"`, so `grep -xq` (which matches the whole line) can never succeed. Plan-authoring imprecision, not a code defect.
- **Fix:** Verified with whitespace-tolerant pattern `grep -qE '^\s*command = "yarn build"$'` plus a negative check `! grep -q 'npm run build'` — the D-02 intent (command value is `yarn build`, no npm command remains) is fully satisfied.
- **Files modified:** none (verification approach only)
- **Verification:** Both checks PASS; `cat -A netlify.toml` confirms line 3 is `  command = "yarn build"$`
- **Committed in:** 260f9fd (Task 1 commit)

**2. [Rule 1 - Bug] Plan's `git ls-files --error-unmatch ... | grep -q "did not match"` pattern fails on localized git**
- **Found during:** Task 1 (automated `<verify>` run)
- **Issue:** This machine's git emits the error in Italian ("non corrisponde ad alcun file noto a git"), so the English grep for "did not match" fails even though the file IS correctly removed from the index.
- **Fix:** Verified with `git ls-files package-lock.json` returning empty (exit 1, zero lines) — the acceptance criterion "file gone from index" is satisfied.
- **Files modified:** none (verification approach only)
- **Verification:** `git ls-files | grep -c package-lock` → 0; `git status` shows `D  package-lock.json` staged
- **Committed in:** 260f9fd (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 verification-pattern bugs in the plan text)
**Impact on plan:** Both were plan-authoring imprecisions in the verification commands, not implementation defects. The actual state changes match the plan's intent exactly. No scope creep.

## Issues Encountered

- None. The tracer executed cleanly: `yarn why` pre-verification matched research predictions exactly, `yarn remove` completed in 7.94s, and all three post-verification commands exited 0 on the first run.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Ready for plan 02-02:** the single-lockfile yarn-only baseline is proven end-to-end; Plan 02 (NODE_VERSION removal + dead components) and Plan 03 (dependency sweep) can now run on this contract
- **Contract for downstream plans:** every build/test command opens with `nvm use 20`; every removal follows `yarn why` → `yarn remove` → install+build+test; never run `npm install`/`npm run build` in this repo

---

*Phase: 02-foundation-cleanup*
*Completed: 2026-08-19*

## Self-Check: PASSED

- Commit `260f9fd` present in git log with message containing `02-01` and `FNDT-01`
- `package-lock.json` absent from filesystem and git index; `yarn.lock` present
- `netlify.toml` line 3 = `command = "yarn build"`; `NODE_VERSION = "10"` still present
- `.prettierignore` has 3 lines (no package-lock.json)
- `package.json` has no `"yarn"`/`"y18n"` deps; `prismjs` and `@testing-library/dom` present; `packageManager: "yarn@1.22.22"` intact
- `nvm use 20 && yarn install && yarn build && yarn test` all exit 0 (4 suites, 8 passed, 1 skipped)
