---
phase: 06-performance-asset-cleanup-final-verification
verified: 2026-08-21T00:45:00Z
status: passed
score: 13/13 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:

  - test: "Visual pass over the three canonical pages (/, /blog/, /minnie/) — look for broken images or missing content after the asset deletion (UI-SPEC E4 backstop)"
    expected: "Every image renders; zero broken-image icons; pages look identical to the pre-cleanup site (the kept twins are byte-identical files)"
    why_human: "Automated stem-grep of all 23 keepers in public/ passes, but rendering parity and layout integrity are visual properties only a human can confirm"

  - test: "Load the live site with a throttled connection and watch the first paint — text should render in the fallback stack immediately (no FOIT) while the @fontsource faces load with font-display: swap"
    expected: "No invisible-text flash; swap behavior identical to the old Google Fonts &display=swap behavior (UI-SPEC E1 loading covered)"
    why_human: "font-display: swap is verified present in all 14 emitted @font-face blocks, but the actual loading UX is a runtime rendering behavior"

  - test: "Check the browser tab icon on the live site (desktop and mobile)"
    expected: "Tab shows the 32x32 stackrole-derived PNG (linked via rel=icon); home-screen icon looks identical to pre-phase (both derive from static/assets/stackrole.png)"
    why_human: "Icon-link continuity is grep-verified, but visual identity requires human confirmation"

  - test: "Optionally re-check the accepted delta: direct request to https://laryart.it/favicon.ico"
    expected: "Documented as 404; NOTE: the live site currently returns HTTP 200 with a stale Netlify edge-cached object (cache-status: Netlify Edge; ttl=31535997). Browsers ignore it either way; the tab icon comes from the linked PNG. The 404 is only observable after the edge cache expires"
    why_human: "Netlify edge-cache behavior is outside the repo; the documented 404 delta is currently masked by a cached artifact with a ~1y TTL"
---

# Phase 6: Performance + Asset Cleanup + Final Verification Report

**Phase Goal:** The site is measurably faster — fonts, assets, and PWA config cleaned up, Core Web Vitals verified against the Phase 1 baseline
**Verified:** 2026-08-21T00:45:00Z
**Status:** human_needed (all automated must-haves verified; 3 visual-check items remain for the human)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | @fontsource/ubuntu + @fontsource/parisienne pinned EXACTLY ("5.3.0", no caret) in package.json, resolved in yarn.lock | ✓ VERIFIED | package.json:28-29 exact pins; caret-grep exit 1 (no caret); yarn.lock resolution entries `@fontsource/ubuntu@5.3.0` / `@fontsource/parisienne@5.3.0` |
| 2 | Three @fontsource CSS imports live in src/components/layout.js adjacent to style.scss, each with a `// PERF-01:` comment | ✓ VERIFIED | layout.js lines 10-15: `@fontsource/ubuntu/400.css`, `@fontsource/ubuntu/700.css`, `@fontsource/parisienne/400.css` + comment lines |
| 3 | Zero `@import url()` remains in src/assets/scss/ (Google-Fonts lines removed; @use block intact) | ✓ VERIFIED | `grep -rn '@import url(' src/assets/scss/` → 0 hits; style.scss @use block (lines 1-6) present |
| 4 | `--font-family` / `--font-family-titles` in _theme-variables.scss byte-identical (D-02) | ✓ VERIFIED | `git diff --exit-code HEAD -- src/assets/scss/_theme-variables.scss` → empty |
| 5 | Built output carries self-hosted @font-face with swap + hashed woff2; zero Google Fonts references in public/ | ✓ VERIFIED | public/ CSS: 14 @font-face, 14× `font-display:swap`, 14 woff2 files, `fonts.googleapis.com` → 0 files; face breakdown parsed: Ubuntu 400 ×6, Ubuntu 700 ×6, Parisienne 400 ×2 (exactly the researched set) |
| 6 | UPGR-02 test block rewritten to the new contract; full jest suite green | ✓ VERIFIED | phase3-upgrade-matrix.test.js:80-97 asserts zero `@import url(`, the three layout.js imports, exact 5.3.0 pins; `yarn test` → 10 suites, 85/85 passed |
| 7 | Deletion list computed by the committed reference-grep script (5 roots), read-only by default, idempotent | ✓ VERIFIED | scripts/asset-cleanup/check-unreferenced.js contains the 5 roots; re-run prints `referenced: 23 / deletable: 0`, exit 0; deleted-set re-check across all roots → zero references |
| 8 | Dedup keeps content-referenced twins; unreferenced set deleted; static/assets/ = 23 files | ✓ VERIFIED | static/assets/ = 23 files; farfalle.jpg/minnie.jpg/paperino.jpg/pluto-1.jpeg/pluto-2.jpeg/topolino.jpg/trilli.jpeg/trilly.jpg present; zero deleted twins (`farfalle.jpeg`, `pluto-1.jpg`, `trilli.jpg`, etc.) |
| 9 | trilli-2.jpg + trilli-2.jpeg deleted; trilly.jpg kept and resolvable | ✓ VERIFIED | `git ls-files static/assets` → zero trilli-2; `grep -rl 'trilly.jpg' src/content/` → 2021-10-05-trilly.md |
| 10 | heart.png / stackrole.png / home-1.jpg kept; .xcf moved to design/ (not deleted, not served) | ✓ VERIFIED | heart.png in src/util/site.json; design/logo-bianco.xcf + design/logo-rosa.xcf exist; zero .xcf in static/assets/; logo.js references `../assets/img/logo-rosa.png` (different file, false positive only) |
| 11 | Build passes; every kept asset path present in rendered public/ HTML (D-10) | ✓ VERIFIED | stem-grep of all 23 keepers in public/ → ≥1 file each; zero deleted-basename references in built output (`pluto-1.jpg`/`trilli.jpg`/`farfalle.jpeg`/`home-2`/`20200907`/`IMG_20200906`/`stackrole-spin` → 0) |
| 12 | Legacy PWA set (27 files) deleted from static/; gatsby-config.js manifest/offline block UNTOUCHED | ✓ VERIFIED | commit 18e26a0 shows exactly 27 static/ deletions; static/ holds only admin/ + assets/; `git diff --quiet HEAD -- gatsby-config.js` → exit 0 |
| 13 | Exactly one manifest served: public/manifest.webmanifest (name "LaryArt by Lara", theme #ff1c65, display standalone, 8 icons); head links resolve; zero legacy names in public/ | ✓ VERIFIED | public/manifest.webmanifest JSON: name/start_url/theme_color/display/8 icon-* entries; `rel="manifest"` + `rel="icon"` (favicon-32x32.png present) in index.html; 8 apple-touch-icon; 8 files in public/icons/; 0 browserconfig.xml; 0 legacy icon globs in public/ |
| 14 | Final CWV capture ran against the LIVE site with the identical Phase-1 recipe (tooling untouched) | ✓ VERIFIED | `git diff` on capture-baseline.js/median.js in the phase window → 0 lines; live site: HTTP 200, `fonts.googleapis.com` → 0 (fetch of https://laryart.it/), manifest.webmanifest 200; artifacts re-captured (blog-1.json fetchTime 2026-08-20T21:52:59Z, LH 13.4.1) |
| 15 | New medians recorded and compared vs Phase-1 baseline: LCP ≤ 2.5s, CLS ≤ 0.1, all improved | ✓ VERIFIED | `node .planning/baseline/median.js` (live re-run): home 1601.09/0.01/100, blog 1446.33/0.01/100, post-minnie 1157.87/0/100, runs_used=3; BASELINE.md "Final capture (Phase 6)" comparison table with met verdicts; baseline-tooling.test.js asserts 1601.09/1446.33/1157.87 and suite green |

**Score:** 13/13 truths verified (0 present-but-behavior-unverified)

### Deferred Items

None — Phase 6 is the final phase in the roadmap; no later phase addresses any gap.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------- | ------- |
| `package.json` | @fontsource/ubuntu + parisienne "5.3.0" exact pins | ✓ VERIFIED | lines 28-29, no caret |
| `yarn.lock` | resolution entries for both @fontsource packages | ✓ VERIFIED | both `@5.3.0` entries with registry URLs |
| `src/components/layout.js` | three @fontsource CSS imports + PERF-01 comments | ✓ VERIFIED | lines 10-18, adjacent to style.scss import |
| `src/assets/scss/style.scss` | two Google-Fonts lines removed; @use block byte-identical | ✓ VERIFIED | zero `@import url()` in dir |
| `phase3-upgrade-matrix.test.js` | UPGR-02 rewritten to new contract | ✓ VERIFIED | lines 80-97 assert new contract; suite green |
| `scripts/asset-cleanup/check-unreferenced.js` | committed reference-grep script (5 roots, read-only default, --delete) | VERIFIED | exists, runnable, idempotent |
| `static/assets/` | 23 referenced keepers; dedup twins + unreferenced deleted | VERIFIED | 23 files; keep list confirmed |
| `design/logo-bianco.xcf` + `logo-rosa.xcf` | moved (not deleted) | VERIFIED | both present |
| `static/` root | 27 legacy PWA files gone; only admin/ + assets/ | VERIFIED | commit 18e26a0 |
| `public/manifest.webmanifest` + `public/favicon-32x32.png` + `public/icons/icon-*` | plugin-generated continuity | VERIFIED | 8 icons, valid JSON |
| `.planning/baseline/lighthouse/*.json` | re-captured LHRs (median-of-3, live final) | VERIFIED | 9 files; LH 13.4.1; fetchTimes in window |
| `.planning/baseline/psi/*.json` | 429 fallback markers | VERIFIED | 9 files `{"source":"lighthouse-fallback","psi_quota":"429"}` |
| `.planning/baseline/BASELINE.md` | "Final capture (Phase 6)" section + comparison | VERIFIED | lines 89-152; Phase-1 rows preserved |
| `baseline-tooling.test.js` | hardcoded medians co-changed | VERIFIED | 1601.09/1446.33/1157.87 at lines 36-40, 98-100 |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| package.json exact pins → layout.js imports → webpack css-loader → emitted @font-face | public/*.css | `@font-face` count 14, swap 14, woff2 14 | WIRED | full chain proven end-to-end |
| style.scss removal → built CSS/HTML | public/ | zero fonts.googleapis.com | WIRED | 0 hits in public/, 0 in live site |
| check-unreferenced.js → static/assets → build → rendered HTML | public/ | stem-grep of 23 keepers ≥1 each | WIRED | script→deletion→build→render chain proven |
| gatsby-plugin-manifest (unchanged) → build → manifest + icons + head tags | public/manifest.webmanifest + head | rel=manifest/rel=icon/8 apple-touch | WIRED | all continuity gates pass |
| owner deploy → live site → capture-baseline.js → median.js → BASELINE.md | live laryart.it | HTTP 200, 0 fonts.googleapis, LH 13.4.1 LHRs | WIRED | medians printed from live artifacts |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| layout.js imports | @fontsource CSS files | node_modules (webpack) | Real CSS @font-face blocks in bundle | FLOWING |
| check-unreferenced.js summary | static/assets listing | actual filesystem | Real counts (23/0) | FLOWING |
| manifest.webmanifest icons | plugin-generated icons | public/icons/*.png real files | Real | FLOWING |
| BASELINE.md final table | median.js stdout | real LHR artifacts (13.4.1, fetchTime 2026-08-20T21:52Z) | Real (not static) | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| jest suite (incl. rewritten UPGR-02, co-changed baseline-tooling) | `yarn test` | 10 suites, 85/85 pass | ✓ PASS |
| deletion script idempotency (probe PERF-02) | `node scripts/asset-cleanup/check-unreferenced.js` | `referenced: 23 / deletable: 0`, exit 0 | ✓ PASS |
| live deploy state (probe PERF-04 D-16) | `curl -s https://laryart.it/` + grep | HTTP 200, fonts.googleapis.com count 0 | ✓ PASS |
| median.js final medians | `node .planning/baseline/median.js` | prints the 3 lighthouse rows with runs_used=3 | ✓ PASS |
| LHR sanity vs median claim | `require(lh/home-1.json)` | lighthouseVersion 13.4.1, LCP 1.601s ≈ 1601.09 ms median | ✓ PASS |
| /favicon.ico delta | `curl -sI https://laryart.it/favicon.ico` | HTTP 200 (stale Netlify edge cache; documented 404 masked) | ⚠️ see Human Verification #4 |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| PERF-02 idempotency (unclassified assumption → classified) | `node scripts/asset-cleanup/check-unreferenced.js` (2nd run) | `deletable: 0`, exit 0 | PASS |
| PERF-02 dry-run read-only contract | script run without --delete; filesystem untouched | 23 files unchanged | PASS |
| PERF-04 deploy-state gate (Pitfall 4) | live site fetch: HTTP 200 + 0 fonts.googleapis + manifest 200 | live final state | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| PERF-01 | 06-01 | Font loading fixed — self-hosted WOFF2, no nested @import url() | ✓ SATISFIED | truth rows 1-6; built output + suite green |
| PERF-02 | 06-02 | Asset cleanup — dedup .jpg/.jpeg pairs, remove unreferenced files, move .xcf out of static/ | ✓ SATISFIED | truths 7-11; script + 23 keepers + build grep |
| PERF-03 | 06-03 | Legacy PWA manifest dedup (delete static/manifest.json + legacy icons) | ✓ SATISFIED | truths 12-13; 27 deletions, one manifest, config untouched |
| PERF-04 | 06-04 | Final CWV — LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at 75th pct, improved vs baseline | ✓ SATISFIED | truths 14-15; live capture + comparison table; INP documented n/a (timespan-only audit, same as Phase-1 baseline) |

**Orphaned requirements:** none. All four IDs claimed by the plans map to REQUIREMENTS.md and are satisfied. Note: REQUIREMENTS.md traceability rows for PERF-02/PERF-03 still read "Pending" (stale — last updated 2026-08-18); the work is committed and verified.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | none (no TBD/FIXME/XXX/placeholder markers in modified files) | — | — |
| scripts/asset-cleanup/check-unreferenced.js | 88 | `process.exit(main())` can truncate gate summary under heavy output (06-REVIEW WR-01) | ⚠️ Warning (latent) | Contract-critical path is a race; the real run flushed fine. No current damage |
| scripts/asset-cleanup/check-unreferenced.js | 18-24 | GREP_ROOTS omits gatsby-browser.js/gatsby-ssr.js/gatsby-node.js/netlify.toml root test files (06-REVIEW WR-02) | ⚠️ Warning (latent) | Independent re-verification found zero deleted-basename references in those unscanned roots — no current damage |
| .planning/baseline/BASELINE.md | 152-154 | Capture "start 21:26Z" vs first artifact fetchTime 21:52Z and pre-capture HEAD fc653f5 authored 21:45Z (06-REVIEW IN-03) | ℹ️ Info | Documentation imprecision only; artifacts/medians integrity verified |

### Human Verification Required

1. **Visual pass over /, /blog/, /minnie/** — look for broken images or missing content after the asset deletion (UI-SPEC E4 backstop).
   - Expected: every image renders; the kept twins are byte-identical to what the site rendered before.
   - Why human: automated stem-grep passes, but rendering parity needs human eyes.
2. **Font loading visual check** (UI-SPEC E1 loading covered) — text should render in the fallback stack during load with no FOIT.
   - Expected: swap behavior identical to the old `&display=swap` behavior.
   - Why human: `font-display: swap` is proven in the emitted CSS, but the loading UX is a runtime visual.
3. **Tab icon check** (UI-SPEC E2 populated covered) — the browser tab shows the stack icon (favicon-32x32.png).
   - Expected: same 32x32 PNG from stackrole.png as before.
   - Why human: visual identity requires human confirmation.
4. **/favicon.ico direct-request behavior** — documented as 404; currently masked by a stale Netlify edge-cached object (HTTP 200, `content-type: image/vnd.microsoft.icon`, 1150 bytes, `cache-status: Netlify Edge; ttl=31535997`).
   - Expected: 404 after edge TTL expiry; browsers ignore it regardless (tab icon comes from the linked PNG).
   - Why human: Netlify edge-cache behavior is outside the codebase.

### Gaps Summary

**No blocking gaps.** All four requirements (PERF-01…PERF-04) are satisfied in the codebase with live-site confirmation:

- Fonts: exact-pinned @fontsource via the layout entry, zero Google-Fonts requests in source, built output (14 faces + swap), or the live site.
- Assets: 61 → 23 files, dedup by content-referenced twin, .xcf moved to design/, zero broken references in source or rendered HTML, script-computed and idempotent deletion.
- PWA: 27 legacy files deleted, exactly one manifest served with full icon continuity, zero config changes.
- CWV: live-site capture with the untouched Phase-1 toolchain; medians 1601/1446/1158 ms vs baseline 3314/4751/3964 ms (LCP −52%/−70%/−71%, all ≤ 2.5s), CLS 0.01/0.01/0 (≤ 0.1), perf score 100/100/100, INP n/a (tooling limitation, documented in baseline).

Three visual items and the /favicon.ico edge-cache observation are routed to human verification; the codebase evidence is fully green.

---

_Verified: 2026-08-21T00:45:00Z_
_Verifier: the agent (gsd-verifier)_
