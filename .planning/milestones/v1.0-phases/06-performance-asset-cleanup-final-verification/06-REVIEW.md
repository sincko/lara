---
phase: 06-performance-asset-cleanup-final-verification
reviewed: 2026-08-21T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - scripts/asset-cleanup/check-unreferenced.js
  - src/assets/scss/style.scss
  - src/components/layout.js
  - .planning/baseline/BASELINE.md
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-08-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed the Phase 6 changes: self-hosted fonts (PERF-01), the reference-grep asset cleanup script (PERF-02), and the final CWV capture (PERF-04).

**Verified correct (no findings):**

- **Font self-hosting (layout.js:9-13):** `@fontsource/ubuntu/400.css`, `ubuntu/700.css`, `parisienne/400.css` all exist in `node_modules`, match the `@font-face` family names (`Ubuntu`/`Parisienne`) and weights used in `_theme-variables.scss` and `style.scss` (`font-weight: bold/600/900` — bold maps to the loaded 700). CSS uses `font-display: swap`, and jest `moduleNameMapper` maps `.css` imports, so the new imports break neither the build nor `blog-list.test.js`. No residual Google Fonts references remain in `src/`, `static/`, or the gatsby config files.
- **Deletion set (PERF-02):** cross-verified every one of the 23 surviving `static/assets/` files against `src/content/`, `src/util/site.json` (heart.png), `static/admin/config.yml` + `gatsby-config.js` (stackrole.png). All 23 are referenced; the 38 deleted files (incl. 8 dedup pairs) are referenced nowhere, and the kept twin is always the exact basename referenced in the markdown frontmatter. `node scripts/asset-cleanup/check-unreferenced.js` reports `referenced: 23 / deletable: 0`, exit 0, idempotent, read-only by default.
- **Baseline math (PERF-04):** all LCP deltas, percentages, and perf-score deltas in the comparison table recompute correctly; median-of-3 per URL confirmed from the 9 `lighthouse/*.json` files; PSI fallback markers match the documented 429 story.

## Warnings

### WR-01: `process.exit()` can truncate the gate-critical summary line

**File:** `scripts/asset-cleanup/check-unreferenced.js:88`
**Issue:** `process.exit(main())` terminates the process without flushing pending async stdout writes. The script's own contract (lines 10-12) is that the summary line `referenced: <N> / deletable: <M>` is ALWAYS the last line of stdout, because automated gates grep it off `tail -1`. With `--delete`, the summary is written after the per-file `console.log` lines — precisely the highest-output path — so a gate piping stdout (e.g. `… | tail -1`) can race the exit and observe a truncated or missing summary. Demonstrated with a pipe test: 200k console.log lines (~20 MB) piped to `wc -c` yields **654 KB (3%)** with `process.exit(0)` vs the full 20.2 MB with `process.exitCode = 0`. The real Phase-6 run (36 deletions, ~1 KB) happened to flush fully, so no damage occurred, but the contract-critical path is a race.
**Fix:**
```js
process.exitCode = main()
```
(set `process.exitCode` and let the process exit naturally; drop the `process.exit()` call entirely)

### WR-02: GREP_ROOTS omits repo-root files that can reference assets

**File:** `scripts/asset-cleanup/check-unreferenced.js:18-24`
**Issue:** The script's reference set is `src/content`, `src`, `static/admin/config.yml`, `gatsby-config.js`, `src/util/site.json`. It never scans `gatsby-browser.js`, `gatsby-ssr.js`, `gatsby-node.js`, `netlify.toml`, or the root-level `*.test.js` files. Because this script is the designated "source of truth for the static/assets/ deletion list" and `--delete` unlinks without a secondary confirmation, any future asset referenced only from those roots is silently flagged deletable and destroyed. No current damage (verified: the 38 deleted basenames appear in none of the unscanned roots, and the 23 keepers are all referenced), but the blind spot is latent data-loss risk for the tool's intended reuse.
**Fix:** add the missing roots to the list (or derive the set dynamically):
```js
const GREP_ROOTS = [
  "src/content",
  "src",
  "static/admin/config.yml",
  "gatsby-config.js",
  "gatsby-browser.js",
  "gatsby-ssr.js",
  "gatsby-node.js",
  "netlify.toml",
  "src/util/site.json",
]
```

## Info

### IN-01: Stray `©` in `style.scss` compiles to a dead selector (pre-existing)

**File:** `src/assets/scss/style.scss:216`
**Issue:** `padding-bottom: 100px;©` — the U+00A9 character after the declaration is parsed by Sass 1.102 as part of the next selector: the compiled CSS contains `.home-posts © .grids { padding-bottom: 30px; }` instead of `.home-posts .grids { padding-bottom: 30px; }`. The selector matches nothing, so the intended 30px bottom padding of the homepage post grid silently ships dead. Introduced in 2024 (`c67d505`), not by this phase, but this phase touched the exact file (removed the `@import` lines above it) and the regression ships in the production CSS that this phase's CWV capture measures.
**Fix:** delete the `©` character on line 216 (the only substantive change; the diff was re-verified to contain nothing else on that line).

### IN-02: `--font-family-subtitles` is undefined (pre-existing, adjacent to this phase's font work)

**File:** `src/assets/scss/style.scss:171, 191`
**Issue:** `time` and `.tagline` use `var(--font-family-subtitles)`, but `_theme-variables.scss` defines only `--font-family-titles`, `--font-family`, and `--font-size-small`. The variable resolves to nothing, so those elements fall back to the inherited Ubuntu — the intended subtitle/tagline font is silently never applied. Pre-existing (present at `6f13621^`), but this phase replaced the site's entire font stack and should have reconciled the variable.
**Fix:** define the variable in `_theme-variables.scss` (e.g. `--font-family-subtitles: "Parisienne", cursive;`), or repoint the two usages to `--font-family-titles`.

### IN-03: BASELINE.md capture window inconsistent with the recorded commits

**File:** `.planning/baseline/BASELINE.md:147-148`
**Issue:** The Phase-6 capture is documented as "start 21:26Z", but the claimed pre-capture HEAD `fc653f5` was authored at 21:45:12Z (+0200 commit date, 2026-08-20 23:45 local) and the first lighthouse artifact (`home-1.json`) has `fetchTime 2026-08-20T21:52:59Z`. At the documented capture start, `fc653f5` did not exist yet. The "end 22:10Z" matches the last artifacts, so either the start timestamp is wrong (~26 min early) or the "pre-capture HEAD" claim is wrong. In a file whose stated purpose is reproducibility and commit-anchored integrity (T-4-02), the anchor facts should reconcile.
**Fix:** either set the start time to the actual first lighthouse `fetchTime` (21:52Z) or document that 21:26Z was script start incl. PSI retry/backoff and pre-flight.

### IN-04: No test coverage for the gate contract

**File:** `scripts/asset-cleanup/check-unreferenced.js` (whole file)
**Issue:** The script's summary format is consumed by automated gates and the repo already has a jest suite with baseline-tooling tests, but `scripts/asset-cleanup/` ships no test. The contract (exact `referenced: <N> / deletable: <M>` line, read-only default, `--delete` idempotence) is exactly what regression tests are for; WR-01 shows the contract can silently drift.
**Fix:** add a small jest test that runs the script (or extracts `computeDeletable`/`printSummary` into a testable module) and asserts the summary regex, read-only default, and post-delete idempotence.

---

_Reviewed: 2026-08-21T00:00:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
