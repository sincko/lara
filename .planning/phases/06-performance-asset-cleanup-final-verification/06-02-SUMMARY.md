---
phase: 06-performance-asset-cleanup-final-verification
plan: 02
subsystem: performance
tags: [assets, dedup, reference-grep, gatsby, static, cleanup]

# Dependency graph
requires:
  - phase: 06-performance-asset-cleanup-final-verification
    provides: 06-01 self-hosted fonts (PERF-01) — the build gates and layout-entry pattern this plan's build verification reuses
  - phase: 05-image-pipeline-seo-fixes
    provides: the sharp image pipeline whose public/static/ renames (pluto-1.jpeg → pluto-1.jpg/.webp) drive the D-10 stem-matching grep
provides:
  - Committed reference-grep deletion script (scripts/asset-cleanup/check-unreferenced.js) — the auditable source of truth for the static/assets/ deletion list (D-07)
  - static/assets/ lean set: 61 → 23 files; all 8 jpg/jpeg dedup pairs resolved by keeping the content-referenced twin (D-06)
  - design/ folder at repo root holding the two .xcf logo sources, no longer served (D-08)
  - Proven idempotent deletion flow: re-run reports "deletable: 0"; build green with every kept asset path present in rendered output (D-10)
affects: [06-03-pwa-icon-cleanup, 06-04-lighthouse-final-verification, phase-3-upgrade-matrix.test.js]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Reference-grep deletion gate: a committed Node script (no deps) computes the deletable set by exact-basename substring grep over 5 roots; read-only by default, --delete flag for the destructive path; summary line is the LAST stdout line in the exact format "referenced: <N> / deletable: <M>"
    - D-10 rendered-source grep: stem matching (basename without extension) on built public/ — full-filename greps false-negative on the 3 sharp-renamed keepers (pluto-1.jpeg/pluto-2.jpeg/trilli.jpeg → .jpg/.webp in public/static/)

key-files:
  created:
    - scripts/asset-cleanup/check-unreferenced.js
    - design/logo-bianco.xcf (moved)
    - design/logo-rosa.xcf (moved)
  modified:
    - static/assets/ (36 files deleted, 23 keepers intact)

key-decisions:
  - "The reference-grep script is the sole deletion gate — no byte-identity/cmp gate (all 8 pairs are re-encoded different-content twins, research Pitfall 2), no hand-maintained list (D-07)"
  - "Exact-basename substring matching only — a trill* glob would match the referenced trilly.jpg and break the 2021-10-05 post (Pitfall 3)"
  - ".xcf sources moved to design/ with git mv BEFORE the --delete run (D-08 default: move, not delete) — the deletable set dropped 38 → 36"

patterns-established:
  - "Asset cleanup: script-computed deletion list → git mv keepers out of static/ → --delete run → git add -A → idempotency re-run (deletable: 0) → build + stem-grep of every kept basename in public/"
  - "Deletion script contract: read-only default, summary line as last stdout line in machine-greppable format, exit 1 on unlink failure or post-delete scan finding deletable files"

requirements-completed: [PERF-02]

# Coverage metadata (#1602) — one entry per shipped deliverable
coverage:
  - id: D1
    description: "Reference-grep deletion script committed (scripts/asset-cleanup/check-unreferenced.js) — computes the deletable set from 5 grep roots, read-only by default, --delete flag, exact-basename matching"
    requirement: PERF-02
    verification:
      - kind: unit
        ref: "node scripts/asset-cleanup/check-unreferenced.js → exit 0, 'referenced: 23 / deletable: 38', zero filesystem changes (61 files before/after)"
        status: pass
      - kind: unit
        ref: "keepers heart.png/stackrole.png/home-1.jpg/trilly.jpg absent from deletable set; grep roots present in script source"
        status: pass
    human_judgment: false
  - id: D2
    description: "static/assets/ deduplicated and lean: 36 unreferenced files deleted (24 numeric-ID Facebook exports, 2 date-named JPEGs, 7 dedup twins, trilli-2 pair, home-2.jpg, stackrole-spin-circle.png, trilli.jpg); 23 referenced keepers intact; re-run reports deletable: 0"
    requirement: PERF-02
    verification:
      - kind: integration
        ref: "ls static/assets | wc -l → 23; node scripts/asset-cleanup/check-unreferenced.js | tail -1 → 'referenced: 23 / deletable: 0'; ! git ls-files static/assets | grep trilli-2"
        status: pass
    human_judgment: false
  - id: D3
    description: ".xcf logo sources moved to design/ (not deleted, not served); zero content/frontmatter edits"
    requirement: PERF-02
    verification:
      - kind: integration
        ref: "test -f design/logo-bianco.xcf && test -f design/logo-rosa.xcf; git status --short src/content | wc -l → 0; grep -rl 'trilly.jpg' src/content/ matches 2021-10-05-trilly.md"
        status: pass
    human_judgment: false
  - id: D4
    description: "Build passes and rendered public/ contains every kept asset path — zero broken images (D-10 held-out grep)"
    requirement: PERF-02
    verification:
      - kind: integration
        ref: "TMPDIR=/home/simos/tmp yarn build → exit 0; stem grep of all 23 kept basenames in public/ → ≥1 file each; heart.png (11), stackrole.png (3), home-1.jpg (2), trilly.jpg (4); zero deleted-source URLs in built output"
        status: pass
    human_judgment: false

# Metrics
duration: 12min
completed: 2026-08-20
status: complete
---

# Phase 6 Plan 2: Asset Dedup + Unreferenced Deletion + .xcf Move (PERF-02) Summary

**Committed reference-grep deletion script (scripts/asset-cleanup/check-unreferenced.js) as the auditable source of truth, applied the 36-file deletion + 7 dedup-twin removals to shrink static/assets/ from 61 to 23 files, moved the two .xcf logo sources to design/, and proved zero broken images with a green build plus a stem-grep of every kept asset path in the rendered output.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-20T19:20:00Z
- **Completed:** 2026-08-20T19:32:00Z
- **Tasks:** 2
- **Files modified:** 40 (36 deleted, 2 moved, 1 script created, 1 dir created)

## Accomplishments

- **Reference-grep script committed** (`scripts/asset-cleanup/check-unreferenced.js`): zero-dependency Node 24 script that greps every `static/assets/` basename against the 5 roots (`src/content`, `src`, `static/admin/config.yml`, `gatsby-config.js`, `src/util/site.json`), read-only by default, `--delete` flag for the destructive path, summary line as the LAST stdout line in the exact machine-greppable format `referenced: 23 / deletable: 38` (verified live)
- **Deletion applied**: 36 files removed by the script — 24 numeric-ID Facebook exports, `20200907_233102.jpg`, `IMG_20200906_223238_974.jpg`, `home-2.jpg`, `stackrole-spin-circle.png`, the 7 dedup twins (`farfalle.jpeg`, `minnie.jpeg`, `paperino.jpeg`, `pluto-1.jpg`, `pluto-2.jpg`, `topolino.jpeg`, `trilli.jpg`), and the unreferenced `trilli-2.jpg` + `trilli-2.jpeg` pair — all 8 jpg/jpeg pairs resolved by keeping the content-referenced twin (D-06)
- **.xcf sources moved** to `design/` at repo root via `git mv` BEFORE the `--delete` run (D-08 default: move, not delete) — the deletable set dropped 38 → 36 as designed; the files are no longer served
- **Idempotency proven**: re-running the script on the cleaned tree reports `referenced: 23 / deletable: 0` (the probe's second-run assumption, now classified)
- **Zero broken images proven**: `yarn build` green (10.29s); all 23 kept basenames grep ≥ 1 file in `public/` (stem matching — the sharp pipeline renames `pluto-1.jpeg`/`pluto-2.jpeg`/`trilli.jpeg` to `.jpg`/`.webp` in `public/static/`, so full-filename greps would false-negative on those 3 keepers); specific keepers confirmed: heart.png (11 files), stackrole.png (3), home-1.jpg (2), trilly.jpg (4); zero deleted-source URLs (`/assets/pluto-1.jpg`, `/assets/trilli.jpg`, `/assets/farfalle.jpeg`) anywhere in the built output
- **Zero content edits**: `git status --short src/content` empty; `trilly.jpg` still referenced by `2021-10-05-trilly.md` (exact-basename rule held — the name-collision trap avoided)

## Task Commits

Each task was committed atomically:

1. **Task 1: Write the reference-grep deletion script** - `5e94946` (feat)
2. **Task 2: Apply deletions + move .xcf to design/ + build verification** - `1464264` (feat)

**Plan metadata:** `docs(06-02): complete plan` (pending after this summary)

## Files Created/Modified

- `scripts/asset-cleanup/check-unreferenced.js` - NEW: the reference-grep deletion script (D-07 source of truth); zero deps, read-only default, `--delete` flag, exact-basename matching, summary line as last stdout line
- `design/logo-bianco.xcf` - MOVED from `static/assets/` (D-08)
- `design/logo-rosa.xcf` - MOVED from `static/assets/` (D-08)
- `static/assets/` - 36 files deleted (24 numeric-ID Facebook exports, `20200907_233102.jpg`, `IMG_20200906_223238_974.jpg`, `home-2.jpg`, `stackrole-spin-circle.png`, 7 dedup twins, `trilli-2.jpg` + `trilli-2.jpeg`, `trilli.jpg`); 23 referenced keepers intact

## Decisions Made

- **The reference-grep script is the sole deletion gate** (D-07): no byte-identity/cmp gate (all 8 pairs are re-encoded different-content twins — research Pitfall 2; a cmp gate would have blocked the entire dedup), no hand-maintained list. The script is committed so the deletion list is auditable and reproducible.
- **Exact-basename substring matching only** (Pitfall 3): a `trill*` glob would match the referenced `trilly.jpg` and break the 2021-10-05 post. The script's `content.includes(basename)` is exact by construction; verified post-delete that `trilly.jpg` still resolves.
- **.xcf move before --delete** (D-08): the two `.xcf` files were `git mv`'d to `design/` first, so the script's deletable set dropped 38 → 36 and the destructive run never touched them. Move (not delete) is the D-08 default.
- **Stem matching for the D-10 grep**: the sharp pipeline renames the 3 jpeg keepers to `.jpg`/`.webp` in `public/static/`, so the rendered-source grep uses basename-without-extension — full-filename greps would false-negative on exactly those keepers (live-verified: `pluto-1`/`pluto-2`/`trilli` stems each match ≥ 1 built file).

## Deviations from Plan

None - plan executed exactly as written. The script's live counts (23 referenced / 38 deletable, dropping to 36 after the .xcf moves) matched the research-verified numbers exactly; no delta required investigation.

## Issues Encountered

- **None.** The only notable observation: the post-delete "LEAK" scan for deleted basenames in `public/` initially matched `pluto-1.jpg`/`pluto-2.jpg`/`trilli.jpg` — these are the sharp-pipeline RENAMED keepers (kept `pluto-1.jpeg` source → `public/static/<hash>/pluto-1.jpg`), not the deleted twins. Confirmed by inspecting the built JSON: the URLs point at `/static/<hash>/pluto-1.jpg` processed files, and zero `/assets/<deleted-basename>` source URLs exist in the built output. This is exactly the documented D-10 rename behavior, not a leak.

## Known Stubs

None.

## Threat Surface

No new security-relevant surface introduced. Verified against the plan's threat register:
- T-06-05 (false negative deletes a referenced file): script-computed list from the 5 grep roots; exact-basename rule; build + rendered-source stem grep for all 23 keepers (all ≥ 1 hit); git history is the restore path; UI-SPEC E4 backstop covers residual risk with the 06-04 human visual pass
- T-06-06 (byte-identity gate misfires): no cmp/hash gate — the reference grep is the sole gate; kept files untouched (no re-encode, no rename)
- T-06-07 (.xcf deleted instead of moved): `git mv` before `--delete`; acceptance asserts `design/` files exist (both pass)
- T-06-08 (dry-run touches files): read-only default verified — dry run left 61 files unchanged
- T-06-SC (package installs): zero install commands run

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PERF-02 (asset cleanup) complete: the script-computed deletion flow is proven end-to-end (compute → move → delete → idempotency → build → rendered-source grep), and the script remains committed for any future asset audit
- The D-10 stem-grep methodology (basename-without-extension against built output) carries into 06-03 (PWA icon cleanup) verification and the 06-04 held-out visual pass over `/`, `/blog`, `/minnie/`
- Ready for 06-03 (legacy PWA manifest/icon deletion) — runs in the same wave; the build gates are proven
- 06-04 (Lighthouse final verification) remains the manual post-deploy gate (D-16)

## Self-Check: PASSED

- `scripts/asset-cleanup/check-unreferenced.js` exists on disk
- `design/logo-bianco.xcf` + `design/logo-rosa.xcf` exist on disk
- `06-02-SUMMARY.md` exists on disk
- Commit `5e94946` (Task 1) present in git log
- Commit `1464264` (Task 2) present in git log

---
*Phase: 06-performance-asset-cleanup-final-verification*
*Completed: 2026-08-20*
