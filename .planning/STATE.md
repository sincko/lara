---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Updates, Debugging and Refinements
current_phase: 6
current_phase_name: Performance + Asset Cleanup + Final Verification
status: executing
stopped_at: Completed 06-04-PLAN.md
last_updated: "2026-08-20T22:21:19.996Z"
last_activity: 2026-08-20
last_activity_desc: Phase 6 execution started
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 27
  completed_plans: 27
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-18)

**Core value:** Visitors can browse the artisan's work and blog, and contact the artisan through the contact form — the site must always build and deploy reliably.
**Current focus:** Phase 6 — Performance + Asset Cleanup + Final Verification

## Current Position

Phase: 6 (Performance + Asset Cleanup + Final Verification) — EXECUTING
Plan: 3 of 4
Status: Ready to execute
Last activity: 2026-08-20 — Phase 6 execution started

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 14
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
| ----- | ----- | ----- | -------- |
| —     | —     | —     | —        |
| 01    | 4     | -     | -        |
| 3     | 6     | -     | -        |
| 4     | 4     | -     | -        |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

_Updated after each plan completion_
**Per-Plan Metrics:**

| Plan                                                  | Duration | Tasks   | Files    |
| ----------------------------------------------------- | -------- | ------- | -------- |
| Phase 01-test-scaffolding-performance-baseline P01    | 24min    | 2 tasks | 9 files  |
| Phase 01-test-scaffolding-performance-baseline P03    | 42min    | 2 tasks | 4 files  |
| Phase 01-test-scaffolding-performance-baseline P01-02 | 9min     | 3 tasks | 4 files  |
| Phase 01-test-scaffolding-performance-baseline P04    | 39       | 2 tasks | 21 files |
| Phase 02-foundation-cleanup P01                       | 3min     | 1 tasks | 5 files  |
| Phase 02 P02                                          | 5min     | 3 tasks | 5 files  |
| Phase 02 P03                                          | 4min     | 2 tasks | 2 files  |
| Phase 05-image-pipeline-seo-fixes P04 | 65 min | 3 tasks | 3 files |
| Phase 05-image-pipeline-seo-fixes P05 | 9 | 2 tasks | 3 files |
| Phase 06 P01 | 8min | 2 tasks | 5 files |
| Phase 06-performance-asset-cleanup-final-verification P04 | 55min | 1 tasks | 13 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Upgrade target is Gatsby 5.16.1 (latest stable) — Gatsby 6 does not exist; stay on React 18
- [Roadmap]: Phase order follows research: test+baseline → foundation → core upgrade → (MUI/form ∥ images/SEO) → performance verification
- [Roadmap]: emailjs-com swap (UPGR-05) placed in Phase 4 with the form work — same file (formik.js), same commit discipline
- [Roadmap]: SEOS-04 (ga placeholder + README) placed in Phase 2 — starter-remnant cleanup belongs with foundation work
- [Phase ?]: Test scaffold: jest 29.7.0 + babel-preset-gatsby manual-mock setup replaces unpublished gatsby-plugin-jest; @testing-library/dom added as explicit devDep (yarn 1 lacks peer auto-install)
- [Phase ?]: yup error messages do not render verbatim (TextFieldConError props order) — validation asserted via Mui-error class flip
- [Phase 01-test-scaffolding-performance-baseline]: Chrome headless flags (--headless=new --no-sandbox --disable-dev-shm-usage) required in this environment — Lighthouse fails NO_FCP without them — Chrome headless flags (--headless=new --no-sandbox --disable-dev-shm-usage) required in this environment — Lighthouse fails NO_FCP without them
- [Phase 01-test-scaffolding-performance-baseline]: LH 13.4.1 navigation runs exclude interaction-to-next-paint (timespan-only audit) — INP n/a for static pages; Phase 6 comparison must account for it — LH 13.4.1 navigation runs exclude interaction-to-next-paint (timespan-only audit) — INP n/a for static pages; Phase 6 comparison must account for it
- [Phase 01-test-scaffolding-performance-baseline]: PSI source: psi-fallback accepted (pre-resolved by orchestrator; PSI_API_KEY absent) — PSI v5 quota 429 on all 9 runs, retry/backoff exhausted, lighthouse-fallback markers recorded per run; baseline completeness unaffected — median.js: lighthouse-fallback markers are provenance-only and never count toward runs_used — psi rows print n/a with a WARN instead of empty cells implying PSI data
- [Phase 05-image-pipeline-seo-fixes]: G-05-1a (privacy external links target=_blank) accepted as unresolved by explicit user decision at the blocking-human package checkpoint: plugin gatsby-remark-external-links declined, privacy links left as-is, UAT gap marked rejected — User: don't insert the plugin and leave that links as they are now
- [Phase 05-image-pipeline-seo-fixes]: Task 4 verify gate ! grep -q display:grid is blind-green-impossible site-wide (pre-existing .grids utility always emits display:grid); gate intent verified scoped to .pagination rules (0 matches) — gate correction only removes a false negative
- [Phase ?]: Self-host fonts via @fontsource exact pins loaded through the layout entry (layout.js imports) — the SCSS @use variant is verified broken in the real Gatsby build (research Pitfall 1); built-output gate proves the chain
- [Phase 06-performance-asset-cleanup-final-verification]: PSI source: accepted the documented 429 fallback (no PSI_API_KEY exported) — all 9 psi runs 429'd after retry/backoff, lighthouse-fallback provenance markers recorded; comparison is lighthouse vs lighthouse — Same as Phase-1 baseline; PSI rows n/a, never duplicated from lighthouse rows
- [Phase 06-performance-asset-cleanup-final-verification]: INP reported n/a for all rows — timespan-only audit in LH 13.4.1 navigation runs on static pages; documented, not a capture failure — Matches PSI lab behavior for the same page type; comparison is LCP + CLS + perf score

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 3]: `gatsby-plugin-netlify-cms` vs Gatsby 5.16 install — if it errors, Decap swap becomes a prerequisite (research flag)
- [Phase 2]: dart-sass behavior with nested `@import url()` in `_theme-variables.scss` — needs build test (research flag; may pull font fix forward)
- [Phase 3]: first post-upgrade Netlify deploy MUST be clear-cache
- [Phase 4]: EmailJS vs native Netlify form dual-channel conflict — owner decision (CONCERNS.md)

### Quick Tasks Completed

| #          | Description                                                                                                                                                                                                       | Date       | Commit  | Directory                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| 260819-l2v | Fix deprecated GraphQL sort syntax warnings in Gatsby build logs (sort: {order, fields: [frontmatter___date]} -> sort: {frontmatter: {date: DESC}}) in blog-list-home.js, blog-list.js, and the createPages query | 2026-08-19 | 600f66c | [260819-l2v-fix-deprecated-graphql-sort-syntax-warni](./quick/260819-l2v-fix-deprecated-graphql-sort-syntax-warni/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
| -------- | ---- | ------ | ----------- |
| _(none)_ |      |        |             |

## Session Continuity

Last session: 2026-08-20T22:20:41.836Z
Stopped at: Completed 06-04-PLAN.md
Resume file: None
