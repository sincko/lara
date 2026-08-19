---
phase: 03-core-upgrade
plan: 02
subsystem: infra
tags: [dart-sass, sass, node-sass, gatsby-plugin-sass, scss, fonts, yarn]

# Dependency graph
requires:
  - phase: 03-core-upgrade
    provides: "03-01 lockstep Gatsby 5.16.1 matrix (gatsby-plugin-sass 6.16.0 pinned)"
  - phase: 02-foundation-cleanup
    provides: "Node enforcement guards (check-node-version.js, engines, engine-strict) and the node-sass vendor-cleanup guard now removed"
provides:
  - "dart-sass (sass ^1.30.0, resolved 1.102.0) as the SCSS compiler — native-binding constraint removed"
  - "Google Fonts @imports hoisted to top-level CSS (D-06 silent-regression trap closed)"
  - "Dead node-sass hygiene guards removed (clean-node-sass-vendor.js + postinstall)"
affects: [03-06 (Node 24 bump — this plan is its prerequisite per D-07b), 05-image-seo (gatsby-plugin-image migration), 06-performance]

# Tech tracking
tech-stack:
  added: ["sass ^1.30.0 (dart-sass, resolved 1.102.0)"]
  removed: ["node-sass ^9.0.0", "scripts/clean-node-sass-vendor.js", "postinstall script entry"]
  patterns: ["yarn-only dependency operations", "one logical change per commit, each verified with nvm use 20 && yarn install && yarn clean && yarn build && yarn test"]

key-files:
  created: []
  modified:
    - package.json
    - yarn.lock
    - src/assets/scss/_theme-variables.scss
    - src/assets/scss/style.scss
    - README.md
  deleted:
    - scripts/clean-node-sass-vendor.js

key-decisions:
  - "sass pinned with caret ^1.30.0 per D-04; yarn resolved 1.102.0 (latest 1.x) and yarn.lock freezes it"
  - "No gatsby-config.js change — gatsby-plugin-sass auto-detects dart-sass (Pitfall 2: adding an implementation option is a maintenance trap)"
  - "Font hoist shipped in the same plan as the swap (D-06 mandatory) — verified in built CSS at top level, column 1"

patterns-established:
  - "Dart-sass swap pattern: yarn remove node-sass && yarn add sass@^1.30.0, delete postinstall entry, git rm the vendor guard, verify full Node 20 loop"
  - "D-06 hoist pattern: Google Fonts @import url(...) lines live at the top of style.scss, never nested in :root"

requirements-completed: [UPGR-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "dart-sass compiles the SCSS pipeline with zero gatsby-config.js changes; node-sass and its vendor-cleanup guard fully removed; Node enforcement guards intact"
    requirement: UPGR-02
    verification:
      - kind: integration
        ref: "source ~/.nvm/nvm.sh && nvm use 20 && yarn install && yarn clean && yarn build && yarn test (exit 0; 4 suites, 8 passed / 1 skipped)"
        status: pass
      - kind: unit
        ref: "grep -q '\"sass\": \"^1.30.0\"' package.json && ! grep -q node-sass package.json yarn.lock && test ! -f scripts/clean-node-sass-vendor.js && ! grep -q '\"postinstall\"' package.json && grep -q 'engine-strict true' .yarnrc"
        status: pass
    human_judgment: false
  - id: D2
    description: "Google Fonts @imports hoisted from _theme-variables.scss :root to the top of style.scss — built CSS shows them at top level, not nested (D-06 silent-regression trap closed)"
    requirement: UPGR-02
    verification:
      - kind: integration
        ref: "grep -n \"@import\" public/*.css | grep -i fonts.googleapis.com → line 1, column 1, before :root{...}"
        status: pass
      - kind: unit
        ref: "! grep -n '@import' src/assets/scss/_theme-variables.scss && head -3 src/assets/scss/style.scss shows both font imports"
        status: pass
    human_judgment: false
  - id: D3
    description: "README stack list updated: node-sass → Sass (dart-sass)"
    requirement: UPGR-02
    verification:
      - kind: unit
        ref: "grep -q dart-sass README.md && ! grep -q node-sass README.md"
        status: pass
    human_judgment: false

# Metrics
duration: 4min
completed: 2026-08-19
status: complete
---

# Phase 3 Plan 2: dart-sass Swap Summary

**node-sass ^9.0.0 replaced by dart-sass (sass ^1.30.0 → 1.102.0) with zero gatsby-config.js changes, dead node-sass hygiene guards removed, and the two Google Fonts @imports hoisted to top-level CSS — closing the D-06 silent-regression trap; full Node 20 loop green**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-19T15:33:49Z
- **Completed:** 2026-08-19T15:37:59Z
- **Tasks:** 3
- **Files modified:** 6 (package.json, yarn.lock, 2 SCSS files, README.md, 1 deletion)

## Accomplishments
- dart-sass (`sass` ^1.30.0, resolved 1.102.0) is now the SCSS compiler — gatsby-plugin-sass 6.16.0 auto-detects it with no gatsby-config.js change (D-04)
- The native-binding constraint (node-sass) that pinned the project to Node 20 is gone — prerequisite for the Node 24 bump in plan 03-06 (D-07b)
- D-06 silent-regression trap closed: both Google Fonts `@import url(...)` lines hoisted from the `:root` block of `_theme-variables.scss` to the top of `style.scss`; built CSS proves the imports at top level, column 1
- Phase 2 node-sass hygiene guards removed (D-05): `scripts/clean-node-sass-vendor.js` deleted, `postinstall` script entry removed — while `check-node-version.js`, `preinstall`/`prebuild`/`predevelop`, `engines`, and `.yarnrc` `engine-strict` all remain intact
- README stack list updated: node-sass → Sass (dart-sass)

## Task Commits

Each task was committed atomically:

1. **Task 1: dart-sass swap: node-sass → sass ^1.30.0 + remove dead node-sass guards (UPGR-02, D-04/D-05)** - `e70c7f2` (feat)
2. **Task 2: Font hoist: move the two Google Fonts @imports from _theme-variables.scss :root to the top of style.scss (UPGR-02, D-06 MANDATORY)** - `2297390` (fix)
3. **Task 3: README stack list: node-sass → dart-sass (UPGR-02, W-2 fix)** - `011e365` (docs)

**Plan metadata:** committed with SUMMARY.md (docs commit)

## Files Created/Modified
- `package.json` - sass ^1.30.0 in dependencies, node-sass removed, postinstall script entry removed
- `yarn.lock` - regenerated by yarn (node-sass tree gone, sass tree in)
- `scripts/clean-node-sass-vendor.js` - DELETED (dead node-sass hygiene guard, D-05)
- `src/assets/scss/_theme-variables.scss` - the two @import lines removed from :root; everything else byte-identical
- `src/assets/scss/style.scss` - the two Google Fonts @imports at the top of the file, before local imports
- `README.md` - stack list line updated to `[Sass](https://sass-lang.com/) (dart-sass) — compilazione SCSS`

## Decisions Made
- sass pinned with caret `^1.30.0` per D-04 as written; yarn resolved 1.102.0 (latest 1.x) and yarn.lock freezes the resolved version
- No gatsby-config.js change — gatsby-plugin-sass auto-detects dart-sass; adding an `implementation` option would be a maintenance trap (Pitfall 2)
- Font hoist shipped in the same plan as the swap (D-06 mandatory) — verified in built CSS at top level, column 1

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The yarn swap, build, and test loop all passed on the first attempt under Node 20 (TMPDIR=/home/simos/tmp used to avoid the /tmp tmpfs quota issue noted in the environment).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- The native-binding constraint is gone — plan 03-06 (Node 24 bump, D-07b) can proceed after the remaining wave-2 plans (03-03 Decap swap, 03-04 Matomo vendoring, 03-05 sitemap removal) land
- The D-06 font regression is closed and proven in built CSS — no visual font breakage expected on the next deploy
- First post-upgrade Netlify deploy must still run with cleared cache (D-15, surfaced by plan 03-07)

---

*Phase: 03-core-upgrade*
*Completed: 2026-08-19*
