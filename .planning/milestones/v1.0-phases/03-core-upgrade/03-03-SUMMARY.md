---
phase: 03-core-upgrade
plan: 03
subsystem: infra
tags: [decap-cms, netlify-cms, gatsby, yarn, cms]

# Dependency graph
requires:
  - phase: 03-01
    provides: Gatsby 5.16.1 lockstep matrix (the base this swap builds on)
  - phase: 03-02
    provides: dart-sass swap (Node 20 loop green before this plan ran)
provides:
  - Decap CMS wired end-to-end: decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4
  - CMS config branch fix (master -> main) so saves land on the default branch
  - README local-dev docs for npx decap-server
affects: [03-06 (post-deploy /admin verification), Phase 5 (image pipeline revisit of netlify-cms-paths)]

# Tech tracking
tech-stack:
  added: [decap-cms-app 3.6.4, gatsby-plugin-decap-cms 4.0.4]
  patterns:
    - "yarn resolutions pin for transitive engine incompatibility (@mapbox/jsonlint-lines-primitives 2.0.2 under Node 20)"
    - "CMS-agnostic gatsby-plugin-netlify-cms-paths kept alongside the Decap plugin (D-09)"

key-files:
  created: []
  modified:
    - package.json
    - yarn.lock
    - gatsby-config.js
    - static/admin/config.yml
    - README.md

key-decisions:
  - "Added a yarn resolutions pin for @mapbox/jsonlint-lines-primitives@2.0.2: the Decap map widget's transitive dep (ol -> ol-mapbox-style -> @mapbox/mapbox-gl-style-spec) resolves to 2.0.3 which declares engines.node >= 22, breaking yarn install under the project's enforced Node 20 (engine-strict). 2.0.2 is API-identical and declares >= 0.6."
  - "Updated the remaining README 'Netlify CMS' mentions (intro, stack list, project structure) to Decap CMS in the same commit — the plan scoped only the CMS section, but leaving stale Netlify CMS claims would make the docs internally inconsistent after the swap."

patterns-established:
  - "Pattern 1: yarn resolutions as the escape hatch for transitive engine-strict conflicts without touching the dependency tree"
  - "Pattern 2: one atomic commit per dependency swap, verified with the full Node 20 loop (install + clean + build + test)"

requirements-completed: [UPGR-03]

# Coverage metadata (#1602) — one entry per shipped deliverable. Drives DETERMINISTIC UAT routing in verify-work.
coverage:
  - id: D1
    description: "Decap CMS replaces Netlify CMS across deps, plugin registry, CMS config, and docs; netlify-cms-paths survives; Node 20 loop green in one commit"
    requirement: UPGR-03
    verification:
      - kind: integration
        ref: "source ~/.nvm/nvm.sh && nvm use 20 && yarn install && yarn clean && yarn build && yarn test (exit 0; 4 suites, 8 passed / 1 skipped)"
        status: pass
      - kind: other
        ref: "grep acceptance criteria: decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4 present; netlify-cms-app + gatsby-plugin-netlify-cms absent; netlify-cms-paths ^1.3.0 kept; gatsby-config.js entry renamed with netlifyCmsPaths const intact; config.yml branch: main + npx decap-server comment; README npx decap-server"
        status: pass
    human_judgment: false
  - id: D2
    description: "Full /admin editor login/save verification against the live Decap deployment"
    verification: []
    human_judgment: true
    rationale: "Post-deploy CMS editor verification is explicitly deferred to plan 03-06's checkpoint (success criterion 1 of this plan); it requires the Netlify deployment and git-gateway auth, which do not exist at build time."

# Metrics
duration: 4min
completed: 2026-08-19
status: complete
---

# Phase 3 Plan 3: Decap CMS Swap Summary

**Netlify CMS stack replaced with Decap CMS (decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4), plugin entry renamed, CMS branch fixed to main, README updated to npx decap-server — Node 20 loop green in one commit**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-19T15:40:50Z
- **Completed:** 2026-08-19T15:44:58Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments

- `netlify-cms-app` ^2.15.72 and `gatsby-plugin-netlify-cms` 6.22.0 fully replaced by `decap-cms-app` 3.6.4 and `gatsby-plugin-decap-cms` 4.0.4 (D-08); yarn.lock regenerated (netlify-cms tree out, decap tree in)
- `gatsby-config.js` plugin entry renamed to `gatsby-plugin-decap-cms`; the `netlifyCmsPaths` const (gatsby-plugin-netlify-cms-paths) untouched (D-09 KEEP)
- `static/admin/config.yml`: `branch: master` → `branch: main` (D-10) and the local_backend comment updated to `npx decap-server` (D-11)
- README: CMS section retitled to Decap CMS with the `npx decap-server` local-dev command; remaining stale "Netlify CMS" mentions (intro, stack list, project structure) updated for consistency
- Full verification loop green under Node 20: `yarn install && yarn clean && yarn build && yarn test` (4 suites, 8 passed / 1 skipped)

## Task Commits

Each task was committed atomically:

1. **Task 1: Decap swap: deps + gatsby-config plugin rename + config.yml branch fix + README decap-server (UPGR-03, D-08/D-09/D-10/D-11)** - `d302e2b` (feat)

**Plan metadata:** committed with SUMMARY.md (docs)

## Files Created/Modified

- `package.json` - decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4 in; netlify-cms-app + gatsby-plugin-netlify-cms out; netlify-cms-paths ^1.3.0 kept; `resolutions` pin added for @mapbox/jsonlint-lines-primitives 2.0.2
- `yarn.lock` - regenerated by yarn (netlify-cms tree gone, decap tree in; jsonlint-lines-primitives pinned to 2.0.2)
- `gatsby-config.js` - line 83 plugin entry renamed to `gatsby-plugin-decap-cms`; netlifyCmsPaths const (lines 6-11) untouched
- `static/admin/config.yml` - `branch: main` (D-10); line 12 comment → `# run npx decap-server for local testing` (D-11); collections schema and media_folder/public_folder untouched
- `README.md` - Decap CMS section + `npx decap-server` command; intro/stack/structure mentions updated to Decap CMS

## Decisions Made

- **yarn resolutions pin for @mapbox/jsonlint-lines-primitives@2.0.2** — the Decap map widget's transitive chain (decap-cms-widget-map → ol → ol-mapbox-style → @mapbox/mapbox-gl-style-spec → @mapbox/jsonlint-lines-primitives) resolves to 2.0.3, which declares `engines.node >= 22` and breaks `yarn install` under the project's enforced Node 20 (engine-strict). Pinned to 2.0.2 (API-identical, declares `>= 0.6`). The pin is temporary: plan 03-06 bumps Node to 24, after which it can be dropped.
- **README consistency edits beyond the plan's scoped section** — the intro, stack list, and project-structure lines still claimed "Netlify CMS"; updated to Decap CMS in the same commit so the docs don't contradict the swap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] yarn add failed: transitive dep @mapbox/jsonlint-lines-primitives@2.0.3 requires Node >= 22**

- **Found during:** Task 1 (yarn add decap-cms-app gatsby-plugin-decap-cms)
- **Issue:** `yarn add decap-cms-app@3.6.4 gatsby-plugin-decap-cms@4.0.4` failed with `error @mapbox/jsonlint-lines-primitives@2.0.3: The engine "node" is incompatible with this module. Expected version ">= 22". Got "20.20.2"` — the project enforces Node 20 via engines + engine-strict, and the Decap map widget's transitive chain resolves to a version that requires Node 22.
- **Fix:** Added a yarn `resolutions` entry pinning `@mapbox/jsonlint-lines-primitives` to 2.0.2 (API-identical, declares `node >= 0.6`). Retried the add — succeeded. The pin is temporary and can be dropped after the Node 24 bump in plan 03-06.
- **Files modified:** package.json (resolutions block), yarn.lock (regenerated with the pin)
- **Verification:** `yarn install` exits 0; yarn.lock shows `"@mapbox/jsonlint-lines-primitives@2.0.2"`; full Node 20 loop green
- **Committed in:** d302e2b (Task 1 commit)

**2. [Rule 2 - Missing Critical] README still claimed Netlify CMS outside the plan's scoped section**

- **Found during:** Task 1 (README edit)
- **Issue:** The plan scoped README edits to the CMS section (lines 43-50), but the intro (line 3), stack list (line 15), and project structure (line 66) still claimed "Netlify CMS" — factually wrong after the swap and misleading for contributors.
- **Fix:** Updated those three mentions to Decap CMS (with the "fork mantenuto di Netlify CMS" clarification), keeping Italian prose.
- **Files modified:** README.md
- **Verification:** `grep -i 'netlify cms' README.md` returns only the "fork mantenuto di Netlify CMS" clarification; `grep -q 'npx decap-server' README.md` passes
- **Committed in:** d302e2b (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both auto-fixes were necessary for the swap to work at all (the engine conflict blocked the install) and for the docs to stay truthful. No scope creep — no files outside the plan's `files_modified` were touched.

## Issues Encountered

- The `@mapbox/jsonlint-lines-primitives@2.0.3` engine conflict (see deviation 1) was the only problem; resolved via the resolutions pin. All other steps ran clean on the first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Decap CMS is wired end-to-end at build level; the full /admin editor login/save verification happens post-deploy in plan 03-06's checkpoint (per this plan's success criterion 1)
- The `resolutions` pin for @mapbox/jsonlint-lines-primitives should be revisited in plan 03-06 (Node 24 bump) — it may become removable
- Ready for 03-04 (vendored Matomo) and 03-05 (single sitemap) — no overlap with this plan's files beyond package.json/yarn.lock, which are serialized by the orchestrator

---

*Phase: 03-core-upgrade*
*Completed: 2026-08-19*

## Self-Check: PASSED

- SUMMARY.md exists on disk: FOUND
- Task commit d302e2b exists: FOUND
- Docs commit 385ba72 exists: FOUND
- All 11 acceptance criteria PASS (verified before task commit)
- Node 20 loop (install + clean + build + test) green: PASS
