---
phase: 06-performance-asset-cleanup-final-verification
plan: 01
subsystem: performance
tags: [fonts, @fontsource, gatsby, webpack, font-display, self-hosting]

# Dependency graph
requires:
  - phase: 03-core-upgrade
    provides: Gatsby 5.16.1 build pipeline; the phase3-upgrade-matrix.test.js UPGR-02 regression suite; dart-sass 1.102.0 + gatsby-plugin-sass 6.16.0 stack
provides:
  - Self-hosted fonts via @fontsource (Ubuntu 400/700, Parisienne 400) loaded through the layout entry — no Google Fonts third-party request remains in the built site
  - Built-output parity gate methodology (font-face count / swap / zero-origin / woff2 emission) reusable by 06-02/06-03/06-04
affects: [06-02-image-dedup, 06-03-pwa-icon-cleanup, 06-04-lighthouse-final-verification, phase-3-upgrade-matrix.test.js]

# Tech tracking
tech-stack:
  added:
    - "@fontsource/ubuntu@5.3.0 (exact pin)"
    - "@fontsource/parisienne@5.3.0 (exact pin)"
  patterns:
    - Font delivery via layout-entry CSS imports (import "@fontsource/<family>/<weight>.css" next to style.scss in layout.js) — the ONLY mechanism that builds in this repo; the SCSS @use variant is verified broken (sass-loader/cs-loader resolution)
    - Exact-pin lockstep discipline for dependencies ("5.3.0", never "^5.3.0")

key-files:
  created: []
  modified:
    - package.json (two exact-pinned @fontsource deps)
    - yarn.lock (resolution entries)
    - src/components/layout.js (three CSS imports + PERF-01 comments)
    - src/assets/scss/style.scss (two Google-Fonts CSS import lines removed)
    - phase3-upgrade-matrix.test.js (UPGR-02 block rewritten)

key-decisions:
  - "Layout-entry import path over SCSS @use: research proved the SCSS variant fails the real Gatsby build (sass-loader Can't find stylesheet / css-loader rebases ./files/ urls) — the layout entry is the verified-working transport (research Pitfall 1 correction of UI-SPEC)"
  - "Exact pins 5.3.0 (no caret) for both @fontsource packages — registry-verified versions, lockstep discipline from 03-CONTEXT D-01"

patterns-established:
  - "Self-hosted fonts: layout-entry @fontsource imports + hashed woff2/woff emission via webpack; font-display: swap inherent to @fontsource faces"
  - "Built-output parity gate: assert on the emitted CSS (font-face count >= 14, swap on every face, zero origin references, hashed font files present) rather than on source only"

requirements-completed: [PERF-01]

# Coverage metadata (#1602) — one entry per shipped deliverable
coverage:
  - id: D1
    description: "Fonts self-hosted via @fontsource exact pins (5.3.0) through the layout-entry imports, style.scss Google-Fonts CSS imports removed"
    requirement: PERF-01
    verification:
      - kind: unit
        ref: "phase3-upgrade-matrix.test.js#UPGR-02 (rewritten contract: zero @import url( in style.scss, three @fontsource import strings in layout.js, exact 5.3.0 pins)"
        status: pass
      - kind: integration
        ref: "grep gates: pins in package.json, imports in layout.js, no @import url( in style.scss"
        status: pass
    human_judgment: false
  - id: D2
    description: "Built output carries self-hosted @font-face blocks with font-display: swap and hashed woff2 files; zero Google Fonts references in the built site"
    requirement: PERF-01
    verification:
      - kind: integration
        ref: "gatsby build + grep gates on public/: 14 @font-face, 14 font-display:swap, 0 fonts.googleapis.com refs, 14 hashed woff2 files"
        status: pass
    human_judgment: false
  - id: D3
    description: "Font contract preserved — font-family CSS variables in _theme-variables.scss byte-identical; exactly Ubuntu 400/700 + Parisienne 400 faces (no extra weights)"
    requirement: PERF-01
    verification:
      - kind: integration
        ref: "git diff --exit-code HEAD -- src/assets/scss/_theme-variables.scss (empty); @font-face family/weight breakdown parsed from emitted CSS"
        status: pass
    human_judgment: false

# Metrics
duration: 8min
completed: 2026-08-20
status: complete
---

# Phase 6 Plan 1: Self-Hosted Fonts via @fontsource (PERF-01) Summary

**Self-hosted Ubuntu 400/700 + Parisienne 400 via exact-pinned @fontsource packages loaded through the layout entry, with style.scss Google-Fonts imports removed and a built-output parity gate proving 14 swap-display @font-face blocks, 14 hashed woff2 files, and zero Google Fonts references in the built site.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-20T18:20:00Z (tracer Task 1 + checkpoint) / resumed 2026-08-20T18:57:00Z (Task 2)
- **Completed:** 2026-08-20T19:09:34Z
- **Tasks:** 2 (1 tracer + 1 auto; Task 1 approved at human checkpoint)
- **Files modified:** 5

## Accomplishments

- Installed `@fontsource/ubuntu@5.3.0` and `@fontsource/parisienne@5.3.0` as **exact pins** (no caret) via yarn 1.22, with yarn.lock resolution entries — no npm, single lockfile preserved
- Landed three font CSS imports (`@fontsource/ubuntu/400.css`, `@fontsource/ubuntu/700.css`, `@fontsource/parisienne/400.css`) in `src/components/layout.js` adjacent to the style.scss import, each tied with a `// PERF-01:` comment — the layout-entry transport, the only mechanism that builds in this repo
- Removed the two render-blocking Google-Fonts CSS import lines from `src/assets/scss/style.scss` (lines 7-8); the `@use` block byte-identical
- Rewrote the RED `UPGR-02` test block in `phase3-upgrade-matrix.test.js` to assert the new contract; full jest suite green — **85/85** (was RED before this plan)
- Built the site clean and proved the parity gates: **14 @font-face blocks** (Ubuntu 400 ×6 subsets, Ubuntu 700 ×6, Parisienne 400 ×2 — unicode-range subsetting), **14× `font-display: swap`**, **14 hashed woff2 files** emitted, **zero `fonts.googleapis.com` references** across `public/`, `_theme-variables.scss` byte-identical (D-02), suite still green after rebuild

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @fontsource exact pins, land the three layout.js imports, remove the style.scss Google-Fonts lines, rewrite UPGR-02** - `25d75a4` (feat)
2. **Task 2: Build + built-output parity gates: @font-face set, swap, zero Google Fonts in the built site** - verification-only task, all gates green, **no commit** (per plan instruction on green run)

**Plan metadata:** `docs(06-01): complete plan` (pending after this summary)

## Files Created/Modified

- `package.json` - added `"@fontsource/ubuntu": "5.3.0"`, `"@fontsource/parisienne": "5.3.0"` (exact pins, no caret)
- `yarn.lock` - resolution entries for both @fontsource packages
- `src/components/layout.js` - three `@fontsource/*.css` imports + `// PERF-01:` comment lines above the existing style.scss import; component body untouched
- `src/assets/scss/style.scss` - two Google-Fonts CSS import URL lines (7-8) removed; `@use` block (lines 1-6) byte-identical
- `phase3-upgrade-matrix.test.js` - UPGR-02 block rewritten (old lines 80-95 replaced) to assert zero CSS-import lines in style.scss, the three layout.js import strings, and exact 5.3.0 pins; `expect(themeVars).not.toMatch(/@import/)` kept

## Decisions Made

- **Layout-entry transport over SCSS `@use`:** research Pitfall 1 proved the SCSS variant fails the real build in two ways (sass-loader "Can't find stylesheet to import"; css-loader "Can't resolve './files/…'" URL rebase). The layout-entry path is the standard Gatsby + @fontsource pattern, needs zero gatsby-config changes — shipped as the implementation with the built-output gate as empirical proof (unclassified probe PERF-01, surfaced not dropped, now classified by the green build).
- **Exact pins only:** `5.3.0` without caret for both packages — registry-verified versions, lockstep discipline (03-CONTEXT D-01); grep gates enforce the pin shape.
- **No gatsby-config changes for fonts:** layout-entry path needs zero config (research-verified).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Task 2 Gate 5 literal grep mismatch (not a defect):** the plan's gate-5 command `grep -c "font-family: \"Ubuntu\""` returned 0 for both families — the CSS minifier strips quotes, so the emitted syntax is `font-family:Ubuntu` (12×) / `font-family:Parisienne` (2×), and the quote-bearing `"Ubuntu",sans-serif` fallback appears only once (in a `.page-template` rule, not an @font-face). The gate's intent — exactly two families in the face set, no extra weights — was verified by parsing the 14 @font-face blocks: Ubuntu 400 ×6, Ubuntu 700 ×6, Parisienne 400 ×2, all `font-display: swap`. Parity holds; the literal pattern was a quoting artifact of the minifier. Documented for the verifier; the intent-bearing gate (family+weight breakdown of the face set) passes.

## Known Stubs

None.

## Threat Surface

No new security-relevant surface introduced. Verified against the plan's threat register:
- T-06-01 (tampered pins): exact-pin greps pass; yarn.lock is the resolution record
- T-06-02 (SCSS import path re-attempted): layout-entry path only; `yarn build` green
- T-06-03 (Google-Fonts origin reintroduced): zero CSS-import lines in style.scss (source) + zero `fonts.googleapis.com` in public/ (built output)
- T-06-04 (missing swap → FOIT): 14× `font-display: swap` in emitted CSS

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PERF-01 (self-host fonts) complete: the tracer proved install → import → build → built-output chain; the layout-entry mechanism is now the proven pattern for any future font work
- The built-output parity gate methodology (count faces / assert swap / zero-origin grep / count emitted woff2) carries directly into 06-02 (image dedup) and 06-03 (PWA icon cleanup) verification
- Ready for 06-02 (asset dedup/deletion) and 06-03 (icon cleanup) — they run in parallel waves with this plan's proven build gates
- 06-04 (Lighthouse final verification) remains the manual post-deploy gate

---
*Phase: 06-performance-asset-cleanup-final-verification*
*Completed: 2026-08-20*
