---
phase: 06-performance-asset-cleanup-final-verification
plan: 03
subsystem: performance
tags: [pwa, manifest, favicon, gatsby-plugin-manifest, static, cleanup, icon]

# Dependency graph
requires:
  - phase: 06-performance-asset-cleanup-final-verification
    provides: 06-02 asset dedup + reference-grep deletion flow (PERF-02) — the deletion-gate discipline and build gates this plan reuses
provides:
  - static/ root cleaned: exactly ONE manifest served (public/manifest.webmanifest, plugin-generated); zero legacy PWA artifacts (manifest.json, browserconfig.xml, favicon.ico, 24 legacy icons) anywhere in static/ or public/
  - D-13 continuity proof: fresh build emits the single canonical manifest, 8 icon-* entries listed, 8 apple-touch-icon head links, rel=icon → favicon-32x32.png, zero browserconfig.xml references — the plugin generates everything the head links (zero icon gap)
  - Documented accepted delta: root /favicon.ico → 404 (browsers silently ignore; tab icon comes from the linked PNG) — no redirect, no .ico replacement
affects: [06-04-lighthouse-final-verification, deploy (Netlify publishes public/ — build unchanged), phase3-upgrade-matrix.test.js (untouched)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PWA continuity gate (D-13): after deleting the legacy static/ set, prove the plugin output — exactly one public/manifest.webmanifest, zero legacy names in public/, rel=manifest/rel=icon/apple-touch-icon head links, ≥ 8 icons/ entries, zero browserconfig.xml references — with grep gates on the built HTML
    - Delete-set inventory gate: git rm with exact globs → pre-commit count gate (git diff --cached --diff-filter=D | wc -l → 27) → post-delete listing shows only admin/ + assets/

key-files:
  created: []
  modified:
    - static/ (27 legacy PWA files deleted: manifest.json, browserconfig.xml, favicon.ico, android-icon-{36,48,72,96,144,192}x*.png, apple-icon-{57,60,72,76,114,120,144,152,180}x*.png, apple-icon.png, apple-icon-precomposed.png, favicon-{16,32,96}x*.png, ms-icon-{70,144,150,310}x*.png)

key-decisions:
  - "No redirect and no .ico replacement for the /favicon.ico 404 — the documented accepted delta (a fix would defeat the payload cleanup); browsers silently ignore the 404 and the tab icon comes from the linked favicon-32x32.png"
  - "gatsby-plugin-manifest config left byte-identical (D-12) — the plugin generates everything the head links, verified zero icon gap from a fresh build"

patterns-established:
  - "PWA payload cleanup: exact-file git rm → pre-commit staged-deletion count gate → fresh clean+build → continuity greps on public/ (exactly one manifest, zero legacy names, all head icon links resolve to plugin output) → document the single accepted /favicon.ico 404 delta"
  - "Count-gate accounting: the 27-deletion count runs on the STAGED set before the commit; post-commit git status correctly shows zero deletions"

requirements-completed: [PERF-03]

# Coverage metadata (#1602) — one entry per shipped deliverable
coverage:
  - id: D1
    description: "Legacy PWA manifest + icon set deleted from static/ root — exactly 27 tracked files (manifest.json, browserconfig.xml, favicon.ico, 6 android-icon-*, 11 apple-icon-* incl. base + precomposed, 3 favicon-*.png, 4 ms-icon-*); gatsby-config.js byte-identical (D-12); static/ holds only admin/ + assets/"
    requirement: PERF-03
    verification:
      - kind: integration
        ref: "git diff --cached --name-only --diff-filter=D -- static/ | wc -l → 27 (pre-commit); git status --short static/ | grep -cE '^ ?D' → 27; ls static/ → admin assets"
        status: pass
      - kind: integration
        ref: "test ! -f static/manifest.json && test ! -f static/favicon.ico && test ! -f static/browserconfig.xml → all succeed; git diff --quiet HEAD -- gatsby-config.js → exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Manifest/icon continuity on the fresh build (D-13): exactly one manifest (public/manifest.webmanifest, name 'LaryArt by Lara', theme #ff1c65, display standalone, 8 icon-* entries), zero legacy manifest/icon artifacts in public/, head links rel=manifest + rel=icon (favicon-32x32.png) + 8 apple-touch-icon, zero browserconfig.xml references; documented accepted delta: direct /favicon.ico → 404 (owner-accepted in planning, UI-SPEC Documented delta)"
    requirement: PERF-03
    verification:
      - kind: integration
        ref: "TMPDIR=/home/simos/tmp yarn clean && yarn build → exit 0 (36.18s); test -f public/manifest.webmanifest; test ! -f public/manifest.json; grep -rl 'rel=\"manifest\"' public/index.html; grep -rl 'rel=\"icon\"' public/index.html; grep -o 'apple-touch-icon' public/index.html | wc -l → 8; ls public/icons/ | grep -c 'icon-' → 8; grep -rc 'browserconfig.xml' public/ | grep -v ':0' | wc -l → 0"
        status: pass
      - kind: integration
        ref: "grep -o '\"src\":\"icons/icon-' public/manifest.webmanifest | wc -l → 8; git diff --quiet HEAD -- gatsby-config.js → exit 0 (D-12)"
        status: pass
    human_judgment: false

# Metrics
duration: 5min
completed: 2026-08-20
status: complete
---

# Phase 6 Plan 3: Legacy PWA Manifest + Icon Cleanup (PERF-03) Summary

**Deleted the 27-file legacy PWA set from static/ root (manifest.json, browserconfig.xml, favicon.ico, 6 android-icon-*, 11 apple-icon-*, 3 favicon-*.png, 4 ms-icon-*) so exactly ONE manifest is served — the gatsby-plugin-manifest-generated public/manifest.webmanifest — and proved manifest/icon continuity on a fresh build: zero legacy artifacts in public/, all head icon links (rel=manifest, rel=icon, 8 apple-touch-icon) resolve to plugin-generated files, with the single documented accepted delta: direct /favicon.ico → 404.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-20T19:16:35Z
- **Completed:** 2026-08-20T19:21:00Z
- **Tasks:** 2
- **Files modified:** 27 (all deletions, static/ root only)

## Accomplishments

- **Exactly 27 legacy files deleted from static/ root** (`18e26a0`): `manifest.json`, `browserconfig.xml`, `favicon.ico`, `android-icon-{36,48,72,96,144,192}x*.png`, `apple-icon-{57,60,72,76,114,120,144,152,180}x*.png`, `apple-icon.png`, `apple-icon-precomposed.png`, `favicon-{16,32,96}x*.png`, `ms-icon-{70,144,150,310}x*.png` — matching the researched D-11 inventory exactly (count gate: 27 staged deletions pre-commit)
- **gatsby-config.js untouched (D-12)**: manifest/offline plugin block byte-identical (zero diff gate passes) — name "LaryArt by Lara", theme #ff1c65, icon `static/assets/stackrole.png` all unchanged
- **Exactly one manifest served (D-13)**: fresh `yarn clean && yarn build` (36.18s, exit 0) emits `public/manifest.webmanifest` with `{"name":"LaryArt by Lara","start_url":"/","theme_color":"#ff1c65","display":"standalone"}` and **8 icon-* entries**; zero `manifest.json` anywhere in `public/`
- **Zero icon gap proven by grep**: head links `rel="manifest"` (href → /manifest.webmanifest) and `rel="icon"` (href → /favicon-32x32.png, present in public/); **8** `apple-touch-icon` links; `public/icons/` holds **8** `icon-*` files; **zero** `browserconfig.xml` references in `public/`; zero legacy-named files (android-icon*, ms-icon*, apple-icon*, favicon.ico) anywhere in the build output
- **Only delta documented and accepted**: direct `/favicon.ico` → 404 (no redirect, no .ico — a fix would defeat the payload cleanup); browsers silently ignore it and the tab icon comes from the linked `favicon-32x32.png`; Netlify logs a 404 only for direct requests
- **Zero config/other edits**: gatsby-config.js, static/admin/, static/assets/, src/ all untouched — `git status` clean after both tasks; no package installs (threat T-06-SC)

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete the legacy PWA manifest + icon set from static/ root (D-11)** - `18e26a0` (feat)
2. **Task 2: Build + manifest-continuity gate (D-13)** - verification-only task, no commit (all gates green, per plan)

**Plan metadata:** `docs(06-03): complete plan` (committed after this summary)

## Files Created/Modified

- `static/manifest.json` - DELETED (legacy hand-rolled manifest, unreferenced — plugin generates the canonical one)
- `static/browserconfig.xml` - DELETED (legacy, zero references in built output — verified)
- `static/favicon.ico` - DELETED (accepted delta: direct requests → 404; tab icon comes from plugin PNG)
- `static/android-icon-{36,48,72,96,144,192}x*.png` (6) - DELETED
- `static/apple-icon-{57,60,72,76,114,120,144,152,180}x*.png` (9) + `apple-icon.png` + `apple-icon-precomposed.png` (11 total) - DELETED
- `static/favicon-{16,32,96}x*.png` (3) - DELETED
- `static/ms-icon-{70,144,150,310}x*.png` (4) - DELETED

## Decisions Made

- **No redirect, no .ico replacement for the /favicon.ico 404** — the documented accepted delta (UI-SPEC §Documented delta). The plugin emits no .ico; pages link only `favicon-32x32.png`. A fix would defeat the payload cleanup.
- **gatsby-plugin-manifest config byte-identical (D-12)** — the plugin is proven to generate everything the head links (manifest + icons + all icon link tags), so the legacy static set was pure duplication. Zero config diff verified post-commit.

## Deviations from Plan

None - plan executed exactly as written. The staged deletion count (27) matched the researched inventory exactly; all 8 continuity greps passed on the first build; gatsby-config.js stayed byte-identical.

## Issues Encountered

- **None.** All gates passed first-run. The `/favicon.ico` 404 is the documented accepted delta, not an issue (the Netlify log line for direct requests is expected and pre-approved).

## Known Stubs

None.

## Threat Surface

No new security-relevant surface introduced. Verified against the plan's threat register:
- T-06-09 (config tampered): zero-diff gate on gatsby-config.js passed (D-12); continuity gate verifies plugin output
- T-06-10 (icon gap): head-link greps (rel=manifest / rel=icon / 8 apple-touch-icon) + icons/ listing (8) prove the plugin generates everything — zero gap from a fresh build
- T-06-11 (wrong glob deletes outside the set): exact git rm globs; acceptance asserted exactly 27 deletions and static/ showing only admin/ + assets/ — all PASS
- T-06-SC (package installs): zero install commands run

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PERF-03 (PWA manifest dedup) complete: exactly one manifest served, 27 legacy files gone, continuity proven on the fresh build
- The build is ready for the owner's Netlify deploy; the documented /favicon.ico 404 will appear as an expected log line only for direct requests
- 06-04 (Lighthouse final verification) remains: owner deploys, then the D-16 capture runs against the live site — the /favicon.ico 404 and tab-icon visual check are part of the held-out visual pass

## Self-Check: PASSED

- `static/manifest.json`, `static/favicon.ico`, `static/browserconfig.xml` absent on disk (27 files deleted, verified)
- `public/manifest.webmanifest` + `public/favicon-32x32.png` + `public/icons/icon-*` present after build
- `06-03-SUMMARY.md` exists on disk
- Commit `18e26a0` present in git log (`feat(06-03): delete legacy PWA manifest and icon set from static`)
- gatsby-config.js byte-identical (`git diff --quiet HEAD -- gatsby-config.js` → exit 0)

---
*Phase: 06-performance-asset-cleanup-final-verification*
*Completed: 2026-08-20*
