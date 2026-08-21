# Phase 6: Performance + Asset Cleanup + Final Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-20
**Phase:** 6-Performance + Asset Cleanup + Final Verification
**Areas discussed:** Font loading, Asset cleanup, PWA manifest dedup, Final CWV verification
**Mode:** `--auto` (autonomous — recommended options auto-selected)

---

## Font Loading (PERF-01)

| Option | Description | Selected |
|--------|-------------|----------|
| @fontsource self-hosting (recommended) | @fontsource/ubuntu (400+700) + @fontsource/parisienne; imports replace the Google Fonts @import url() lines | ✓ |
| Preconnect + display=swap | Keep Google Fonts, add preconnect hints | |

**User's choice:** @fontsource self-hosting (auto-selected)
**Notes:** Phase 3's font hoist (D-06) is superseded — the @import url() lines are removed entirely. CSS variables unchanged. font-display: swap is inherent to @fontsource. Test co-change: phase3-upgrade-matrix.test.js UPGR-02 asserts the hoisted imports.

## Asset Cleanup (PERF-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Script-computed deletion (recommended) | Executor computes the unreferenced list by grepping each file against content/src/config — never hand-maintained | ✓ |
| Hand-maintained list | Use the scout's 40-file list directly | |

**User's choice:** Script-computed deletion (auto-selected)
**Notes:** 8 .jpg/.jpeg pairs deduped keeping the content-referenced extension; ~40 unreferenced files deleted; .xcf moved to design/; stackrole.png + heart.png kept (manifest icon + defaultImage).

## PWA Manifest Dedup (PERF-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Delete legacy set (recommended) | static/manifest.json + browserconfig.xml + ~25 legacy icons deleted; manifest plugin generates the single canonical set | ✓ |
| Keep both | Leave the duplication | |

**User's choice:** Delete legacy set (auto-selected)
**Notes:** gatsby-plugin-manifest config unchanged; verify public/manifest.webmanifest is the only manifest.

## Final CWV Verification (PERF-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Identical baseline re-run (recommended) | capture-baseline.js + median.js, Lighthouse 13.4.1, 3 URLs, median of 3, after deploy | ✓ |
| Fresh tooling | New capture approach | |

**User's choice:** Identical baseline re-run (auto-selected)
**Notes:** Comparison targets LCP ≤ 2.5s / CLS ≤ 0.1 / INP ≤ 200ms vs baseline (LCP 3.3-4.75s). INP n/a in navigation-mode LH 13.4.1 (Phase 1 note applies). Manual checkpoint: owner deploys before capture.

---

## the agent's Discretion

- Exact @fontsource package versions (verify at research time)
- Where the @fontsource CSS imports land (style.scss vs layout)
- The executor-computed deletion list (script is the source of truth)
- .xcf move vs delete (default: move to design/)
- Capture timing (must be after the full Phase 6 deploy)

## Deferred Ideas

- Duplicate content queries refactor (blog-list + blog-list-home) — future
- Image CDN (Gatsby Cloud) — out of scope per REQUIREMENTS.md
- robots.txt — future phase
- Gatsby 6 / React 19 modernization — v2 (MODR-01/02/03)
