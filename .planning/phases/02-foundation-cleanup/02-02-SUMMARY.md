---
phase: 02-foundation-cleanup
plan: 02
subsystem: infra
tags: [netlify, node-version, dead-code, dependency-removal, yarn, node-20]

# Dependency graph
requires:
  - phase: 02-foundation-cleanup
    plan: 01
    provides: single-lockfile yarn-only baseline; proven `nvm use 20 && yarn install && yarn build && yarn test` green loop
provides:
  - netlify.toml with no NODE_VERSION — .nvmrc (20) is the sole Node version source (FNDT-02)
  - dead form components old-form.js / form-pulito.js deleted with zero remaining references (FNDT-03)
  - 9 unused deps removed (4 runtime + 5 devDep) with prismjs and @testing-library/dom confirmed kept (FNDT-04 remainder)
affects: [02-03 (starter remnants), phase 3 (upgrades on clean manifest), Netlify deploy config]

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
    - netlify.toml ([build.environment] section deleted — NODE_VERSION = "10" gone)
    - src/components/old-form.js (deleted — git rm)
    - src/components/form-pulito.js (deleted — git rm)
    - package.json (9 deps removed: codemirror, seamless-immutable, gatsby-background-image, package-doctor, redux, react-refresh, typescript, acorn, netlify-cms-lib-widgets)
    - yarn.lock (resolution entries pruned by yarn remove)

key-decisions:
  - "D-04 implemented: whole [build.environment] section deleted (Pitfall 4) — .nvmrc (20) is now the sole Node source; .nvmrc untouched per D-05"
  - "D-06 implemented: dead components deleted via git rm after re-grep confirmed zero references (drift check passed)"
  - "D-07 remainder implemented: 4 runtime + 5 devDep removed via yarn remove in two logical groups, one commit each (D-10)"
  - "D-09 verified: netlify-cms-lib-widgets transitive copy survives via netlify-cms-app (yarn why post-removal shows netlify-cms-app as reason)"
  - "Keepers confirmed: prismjs (gatsby-remark-prismjs peer) and @testing-library/dom (RTL 16 peer) remain in package.json"

patterns-established:
  - "Pattern 1: Removal verification loop (yarn why → yarn remove → install+build+test)"
  - "Pattern 2: Node-version pinning (nvm use 20 before every build/test command)"

requirements-completed: [FNDT-02, FNDT-03, FNDT-04]

# Coverage metadata (#1602) — one entry per shipped deliverable. Drives DETERMINISTIC UAT routing in verify-work.
coverage:
  - id: D1
    description: "Node version unambiguous: netlify.toml [build.environment] section (NODE_VERSION = \"10\") deleted, .nvmrc (20) untouched as single source of truth (FNDT-02, D-04, D-05)"
    requirement: FNDT-02
    verification:
      - kind: other
        ref: "command `! grep -q 'NODE_VERSION' netlify.toml && grep -xq '20' .nvmrc && nvm use 20 && yarn build` exits 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Dead components deleted: src/components/old-form.js and src/components/form-pulito.js removed via git rm with zero remaining references (FNDT-03, D-06)"
    requirement: FNDT-03
    verification:
      - kind: other
        ref: "command `test ! -f src/components/old-form.js && test ! -f src/components/form-pulito.js && ! rg -q 'old-form|form-pulito' src/ gatsby-*.js` exits 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "Runtime dep group removed: codemirror, seamless-immutable, gatsby-background-image, package-doctor gone from package.json; prismjs kept (D-07 runtime subset, D-08, D-10)"
    requirement: FNDT-04
    verification:
      - kind: other
        ref: "command `! grep -q '\"codemirror\"' package.json && ! grep -q '\"seamless-immutable\"' package.json && ! grep -q '\"gatsby-background-image\"' package.json && ! grep -q '\"package-doctor\"' package.json && grep -q '\"prismjs\"' package.json` exits 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "devDep group removed: redux, react-refresh, typescript, acorn, netlify-cms-lib-widgets gone from package.json; @testing-library/dom kept; netlify-cms-lib-widgets transitive copy survives via netlify-cms-app (D-07 devDep subset, D-09, D-13)"
    requirement: FNDT-04
    verification:
      - kind: other
        ref: "command `! grep -q '\"redux\"' package.json && ! grep -q '\"react-refresh\"' package.json && ! grep -q '\"typescript\"' package.json && ! grep -q '\"acorn\"' package.json && ! grep -q '\"netlify-cms-lib-widgets\"' package.json && grep -q '\"@testing-library/dom\"' package.json && yarn why netlify-cms-lib-widgets | grep -q netlify-cms-app` exits 0"
        status: pass
    human_judgment: false
  - id: D5
    description: "Full build/test loop green under Node 20 after all three commits: yarn install + yarn build (node-sass ABI 115 prebuilt) + yarn test (4 suites, 8 passed 1 skipped) all exit 0"
    requirement: FNDT-02
    verification:
      - kind: integration
        ref: "command `nvm use 20 && yarn install && yarn build && yarn test` exits 0"
        status: pass
    human_judgment: false

# Metrics
duration: 5min
completed: 2026-08-19
status: complete
---

# Phase 2 Plan 2: Node Config + Dead Components + Dependency Sweep Summary

**netlify.toml NODE_VERSION pin deleted (`.nvmrc` sole Node source), dead form components old-form.js/form-pulito.js removed, and 9 unused deps swept in two verified groups (4 runtime + 5 devDep) with prismjs/@testing-library/dom confirmed kept — three atomic commits, each with the full `nvm use 20 && yarn install && yarn build && yarn test` loop green**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-19T11:08:24Z
- **Completed:** 2026-08-19T11:13:11Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- FNDT-02 satisfied: `netlify.toml` `[build.environment]` section (containing `NODE_VERSION = "10"`) deleted entirely per Pitfall 4 — `.nvmrc` (content `20`, untouched per D-05) is now the single source of truth for Node version (D-04)
- FNDT-03 satisfied: `src/components/old-form.js` and `src/components/form-pulito.js` deleted via `git rm`; drift re-grep (`rg -n 'old-form|form-pulito' src/ gatsby-*.js`) confirmed zero references before deletion (D-06)
- FNDT-04 remainder satisfied: 4 runtime deps removed (`codemirror`, `seamless-immutable`, `gatsby-background-image`, `package-doctor`) and 5 devDeps removed (`redux`, `react-refresh`, `typescript`, `acorn`, `netlify-cms-lib-widgets`) — each group pre-verified with `yarn why` (all direct-only), removed via `yarn remove` (atomic package.json + yarn.lock rewrite), post-verified with install+build+test (D-07, D-10)
- D-09 verified: post-removal `yarn why netlify-cms-lib-widgets` shows `netlify-cms-app` as the reason it exists — the transitive copy survives
- Keepers confirmed present after every group: `prismjs` (peer of gatsby-remark-prismjs, D-08) and `@testing-library/dom` (peer of @testing-library/react@16.3.2, D-13)
- Full loop green under Node 20 at every commit boundary: `yarn install` (0.34s), `yarn build` (9.7–34.6s, node-sass ABI 115 prebuilt), `yarn test` (4 suites, 8 passed, 1 skipped)

## Task Commits

Each task was committed atomically:

1. **Task 1: Node config unambiguous + dead components deleted (D-04, D-05, D-06)** - `7c635bd` (chore)
2. **Task 2: Remove unused runtime dependencies — verified group (D-07 runtime subset, D-10)** - `94bbc68` (chore)
3. **Task 3: Remove unused devDependencies — verified group (D-07 devDep subset, D-09, D-10)** - `077947e` (chore)

**Plan metadata:** committed with this SUMMARY (docs)

## Files Created/Modified

- `netlify.toml` - `[build.environment]` section (lines 5-6: header + `NODE_VERSION = "10"`) deleted; file is now `[build]` → `[[plugins]]` with no dangling section
- `src/components/old-form.js` - DELETED (git rm — starter demo SignupForm, zero imports)
- `src/components/form-pulito.js` - DELETED (git rm — syntactically invalid JSX module, zero imports)
- `package.json` - 9 deps removed: `codemirror`, `seamless-immutable`, `gatsby-background-image`, `package-doctor` (dependencies); `redux`, `react-refresh`, `typescript`, `acorn`, `netlify-cms-lib-widgets` (devDependencies); `prismjs` and `@testing-library/dom` intact; `packageManager: "yarn@1.22.22"` intact
- `yarn.lock` - resolution entries for the 9 removed packages pruned by `yarn remove`

## Decisions Made

- Whole `[build.environment]` section deleted rather than just the NODE_VERSION line (Pitfall 4 — avoids invalid/empty TOML)
- `.nvmrc` left at `20` untouched (D-05 — Node 22 bump deferred to Phase 3 after dart-sass replaces node-sass)
- Removals executed via `yarn remove` (never hand-edited package.json) — atomic manifest+lockfile rewrite
- Two logical removal groups, one commit each, per D-10/Pitfall 10 discipline
- All verification commands opened with `nvm use 20` (Pattern 2 — shell default Node 24 breaks node-sass)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `yarn remove --dev redux react-refresh typescript acorn netlify-cms-lib-widgets` left `redux` in package.json**
- **Found during:** Task 3 (devDep group removal)
- **Issue:** The batch `yarn remove --dev` command removed 4 of the 5 packages but silently left `redux` in `dependencies`/`devDependencies` (yarn 1 batch-removal quirk — the acceptance-criteria grep caught it: `"redux"` still present at package.json:65)
- **Fix:** Ran `yarn remove redux` as a follow-up (note: `yarn remove --dev redux` errored with "Not enough arguments" — yarn 1 does not accept `--dev` with a single package in this invocation form; plain `yarn remove redux` succeeded and removed it from devDependencies)
- **Files modified:** package.json, yarn.lock
- **Verification:** `grep -q '"redux"' package.json` exits 1; full `nvm use 20 && yarn install && yarn build && yarn test` loop re-run green after the follow-up removal
- **Committed in:** 077947e (Task 3 commit — the follow-up removal is part of the same logical group, so it stays in the one atomic devDep-group commit per D-10)

---

**Total deviations:** 1 auto-fixed (1 yarn batch-removal quirk)
**Impact on plan:** The deviation was a tooling quirk in the removal command, not a plan defect. The final state matches the plan exactly: all 5 devDeps gone, one atomic commit per logical group, build+test green. No scope creep.

## Issues Encountered

- None beyond the deviation above. All `yarn why` pre-verifications matched research predictions exactly (direct-only for all 9 removal targets; nested gatsby copies of redux@4.2.1/react-refresh@0.14.2 confirmed; acorn transitive copies via gatsby#webpack and jsdom confirmed).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Ready for plan 02-03:** starter remnants (site.json `ga` placeholder removal + Italian README rewrite, SEOS-04) can now run on the clean manifest
- **Contract for downstream plans:** every build/test command opens with `nvm use 20`; every removal follows `yarn why` → `yarn remove` → install+build+test; never run `npm install`/`npm run build` in this repo
- **Post-deploy check (Phase 2 gate):** after the next Netlify deploy, verify the build log shows Node 20 resolution via `.nvmrc` (research Open Question 1 — if it diverges, set the Netlify UI pin to 20)

---

*Phase: 02-foundation-cleanup*
*Completed: 2026-08-19*

## Self-Check: PASSED

- Commits `7c635bd`, `94bbc68`, `077947e` present in git log, all with `02-02` in the message
- `netlify.toml` has no `NODE_VERSION` and no `[build.environment]` section; `.nvmrc` = `20`
- `src/components/old-form.js` and `src/components/form-pulito.js` absent from filesystem and git index
- `rg 'old-form|form-pulito' src/ gatsby-*.js` exits 1 (zero references)
- `package.json` has none of the 9 removed packages; `prismjs` and `@testing-library/dom` present; `packageManager: "yarn@1.22.22"` intact
- `yarn why netlify-cms-lib-widgets` shows netlify-cms-app as the reason (D-09 transitive survival)
- `nvm use 20 && yarn install && yarn build && yarn test` all exit 0 (4 suites, 8 passed, 1 skipped)
