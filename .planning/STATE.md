---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Updates, Debugging and Refinements
current_phase: 02
current_phase_name: foundation-cleanup
status: executing
stopped_at: Phase 3 context gathered
last_updated: "2026-08-19T13:19:25.146Z"
last_activity: 2026-08-19
last_activity_desc: "Completed quick task 260819-l2v: Fix deprecated GraphQL sort syntax warnings in Gatsby build logs (sort: {order, fields: [frontmatter___date]} -> sort: {frontmatter: {date: DESC}}) in blog-list-home.js, blog-list.js, and the createPages query"
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 8
  completed_plans: 8
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-18)

**Core value:** Visitors can browse the artisan's work and blog, and contact the artisan through the contact form — the site must always build and deploy reliably.
**Current focus:** Phase 02 — foundation-cleanup

## Current Position

Phase: 02 (foundation-cleanup) — EXECUTING
Plan: 1 of 4
Status: Executing Phase 02
Last activity: 2026-08-19 — Completed quick task 260819-l2v: Fix deprecated GraphQL sort syntax warnings in Gatsby build logs (sort: {order, fields: [frontmatter___date]} -> sort: {frontmatter: {date: DESC}}) in blog-list-home.js, blog-list.js, and the createPages query

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 4
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| — | — | — | — |
| 01 | 4 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01-test-scaffolding-performance-baseline P01 | 24min | 2 tasks | 9 files |
| Phase 01-test-scaffolding-performance-baseline P03 | 42min | 2 tasks | 4 files |
| Phase 01-test-scaffolding-performance-baseline P01-02 | 9min | 3 tasks | 4 files |
| Phase 01-test-scaffolding-performance-baseline P04 | 39 | 2 tasks | 21 files |
| Phase 02-foundation-cleanup P01 | 3min | 1 tasks | 5 files |
| Phase 02 P02 | 5min | 3 tasks | 5 files |
| Phase 02 P03 | 4min | 2 tasks | 2 files |

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 3]: `gatsby-plugin-netlify-cms` vs Gatsby 5.16 install — if it errors, Decap swap becomes a prerequisite (research flag)
- [Phase 2]: dart-sass behavior with nested `@import url()` in `_theme-variables.scss` — needs build test (research flag; may pull font fix forward)
- [Phase 3]: first post-upgrade Netlify deploy MUST be clear-cache
- [Phase 4]: EmailJS vs native Netlify form dual-channel conflict — owner decision (CONCERNS.md)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260819-l2v | Fix deprecated GraphQL sort syntax warnings in Gatsby build logs (sort: {order, fields: [frontmatter___date]} -> sort: {frontmatter: {date: DESC}}) in blog-list-home.js, blog-list.js, and the createPages query | 2026-08-19 | 600f66c | [260819-l2v-fix-deprecated-graphql-sort-syntax-warni](./quick/260819-l2v-fix-deprecated-graphql-sort-syntax-warni/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-19T13:19:25.140Z
Stopped at: Phase 3 context gathered
Resume file: .planning/phases/03-core-upgrade/03-CONTEXT.md
