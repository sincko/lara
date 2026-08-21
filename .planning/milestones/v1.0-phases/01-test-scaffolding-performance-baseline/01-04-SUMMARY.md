---
phase: 01-test-scaffolding-performance-baseline
plan: 04
subsystem: testing
tags: [lighthouse, pagespeed-insights, core-web-vitals, lcp, cls, inp, performance-baseline, node]

# Dependency graph
requires:
  - phase: 01-test-scaffolding-performance-baseline
    provides: Capture + median scripts and methodology README (Plan 03) executed end-to-end here
provides:
  - Full pre-change CWV baseline: 9 Lighthouse 13.4.1 LHR JSONs + 9 PSI artifacts (all lighthouse-fallback markers)
  - BASELINE.md: median LCP/CLS/INP/perf per URL per source, capture metadata, Phase 6 identical re-run recipe
  - median.js fix: PSI fallback markers excluded from runs_used (honest n/a rows)
affects: [phase-6-performance-verification, PERF-04 comparison]

# Tech tracking
tech-stack:
  added: []
  patterns: [median-of-3 CWV extraction (realized), PSI 429 fallback markers as provenance-only artifacts (never counted as runs)]

key-files:
  created: [.planning/baseline/BASELINE.md, .planning/baseline/lighthouse/{blog,home,post-minnie}-{1,2,3}.json, .planning/baseline/psi/{blog,home,post-minnie}-{1,2,3}.json]
  modified: [.planning/baseline/median.js, .planning/baseline/README.md, .planning/baseline/lighthouse/home-1.json (re-captured)]

key-decisions:
  - "PSI source: psi-fallback accepted (pre-resolved by orchestrator; PSI_API_KEY absent) — PSI v5 quota 429 on all 9 runs, retry/backoff exhausted, lighthouse-fallback markers recorded per run; baseline completeness unaffected"
  - "median.js: lighthouse-fallback markers are provenance-only and never count toward runs_used — psi rows print n/a with a WARN instead of empty cells implying PSI data"

patterns-established:
  - "Baseline artifact integrity: raw JSONs committed with BASELINE.md so the median table is auditable against the numbers (threat T-4-02)"
  - "Fallback honesty: a fallback-marked artifact set renders as n/a + provenance WARN (exit 0), never as a zero-measurement row or a fake run"

requirements-completed: [FNDT-06]

coverage:
  - id: D1
    description: "Full pre-change CWV baseline captured on the live site — 3 canonical URLs x 3 runs x 2 sources (Lighthouse CLI + PSI-with-fallback), median-of-3, mobile"
    requirement: FNDT-06
    verification:
      - kind: other
        ref: "node .planning/baseline/median.js (exit 0, full 3-URL table; lighthouse rows runs_used=3)"
        status: pass
    human_judgment: false
  - id: D2
    description: "BASELINE.md consolidated artifact — median table, method (Lighthouse 13.4.1 mobile default throttling), URL set with slugs + redirect notes, capture metadata (date, commit SHA, Node/Chrome versions), Phase 6 identical re-run recipe, PSI fallback recorded per URL/run"
    requirement: FNDT-06
    verification:
      - kind: other
        ref: "test -f .planning/baseline/BASELINE.md && grep -q laryart.it && grep -q 13.4.1"
        status: pass
    human_judgment: false
  - id: D3
    description: "Baseline artifacts committed to git (9 lighthouse JSONs + 9 psi fallback markers + scripts + README + BASELINE.md) — FNDT-06 storage, D-09"
    requirement: FNDT-06
    verification:
      - kind: other
        ref: "git log --oneline 4c05f45 (feat(phase-1): capture performance baseline)"
        status: pass
    human_judgment: false

# Metrics
duration: 39min
completed: 2026-08-19
status: complete
---

# Phase 1 Plan 4: Full Performance Baseline Capture Summary

**Full pre-change Core Web Vitals baseline on the live laryart.it site: 9 Lighthouse 13.4.1 runs (home LCP 3313.7ms / CLS 0.01 / perf 91; blog LCP 4750.71ms / perf 82; post-minnie LCP 3964.31ms / perf 87, medians of 3, mobile) with all 9 PSI runs falling back to documented lighthouse-fallback markers (quota 429), consolidated in BASELINE.md with the Phase 6 identical re-run recipe**

## Performance

- **Duration:** 39 min
- **Started:** 2026-08-19T07:08:59Z
- **Completed:** 2026-08-19T07:48:00Z
- **Tasks:** 2 (checkpoint pre-resolved + 1 execution task)
- **Files modified:** 21

## Accomplishments

- Full capture executed: 3 URLs × 3 runs × 2 sources; all 9 Lighthouse runs produced complete LHR JSONs (runs_used=3 for every URL — the strict ≥2 gate passed for the full set)
- PSI half: quota 429 persisted on all 9 runs despite 10s/30s/60s backoff — every `psi/*.json` artifact is the documented `{ source: "lighthouse-fallback", psi_quota: "429" }` provenance marker; **no fake PSI numbers** — baseline completeness per the pre-resolved psi-fallback decision
- `BASELINE.md` written as the Phase 6 comparison contract: median table (paste of median.js stdout), method (Lighthouse 13.4.1, mobile, default throttling, median-of-3), URL set with redirect notes (`/blog` → `/blog/`, `/minnie/` → `/minnie/`), capture metadata (date, commit SHA `6d17f83` at capture, Node v24.18.0, HeadlessChrome 151), and exact re-run commands
- Rule 1 fix in `median.js`: PSI fallback markers were being counted as valid runs (psi rows printed empty cells with runs_used=3 — implying PSI data that does not exist); they are now provenance-only and excluded, rendering honest `n/a` rows with a WARN while preserving the all-error-marker exit-1 contract; README median-rule updated to match
- All 21 baseline files committed atomically in one commit; git status clean after

## Task Commits

Each task was committed atomically:

1. **Task 1: Checkpoint 1 (PSI source decision)** - pre-resolved by orchestrator (psi-fallback; `PSI_API_KEY` absent) — no commit
2. **Task 2: Run the full 3-URL × 3-run × 2-source capture and write BASELINE.md** - `4c05f45` (feat)

**Plan metadata:** pending (docs: complete plan — this commit)

## Files Created/Modified

- `.planning/baseline/BASELINE.md` - Canonical baseline artifact: median table + method + URL set + capture metadata + Phase 6 re-run recipe
- `.planning/baseline/lighthouse/home-{1,2,3}.json` - Home URL LHR runs (home-1 re-captured over Plan 03's tracer artifact)
- `.planning/baseline/lighthouse/blog-{1,2,3}.json` - Blog index LHR runs
- `.planning/baseline/lighthouse/post-minnie-{1,2,3}.json` - Post page LHR runs
- `.planning/baseline/psi/{home,blog,post-minnie}-{1,2,3}.json` - PSI fallback markers (quota 429, all runs)
- `.planning/baseline/median.js` - Fix: fallback markers excluded from runs_used; fallback-only sets print n/a + WARN (exit 0)
- `.planning/baseline/README.md` - Capture-date row updated; median rule documents the fallback-only exception

## Decisions Made

- **PSI source = psi-fallback** (pre-resolved): `PSI_API_KEY` not set in the environment; the documented Lighthouse-CLI fallback per run accepted. All psi artifacts carry provenance markers; D-08's dual-source pairing is single-source with a documented fallback for this capture. Phase 6 can still capture real PSI data with a key and compare like-for-like per source.
- **median.js fallback semantics:** a `lighthouse-fallback` marker records provenance, not a measurement — never counts toward `runs_used`, renders `n/a` with a WARN (exit 0), preserving the README's all-error exit-1 contract. Prevents the psi table from implying PSI measurements that were never made (would have corrupted the Phase 6 comparison).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PSI fallback markers counted as valid runs in median.js**
- **Found during:** Task 2 (verification — median.js printed psi rows with empty metric cells but runs_used=3)
- **Issue:** `readRuns` accepted any JSON without an `error` key as a valid run; the 9 PSI fallback markers (no measurements, provenance only) were counted as valid runs, printing `lcp_ms`/`cls` empty columns with `runs_used=3` — implying PSI data exists where it does not. The Phase 6 psi-vs-psi comparison would have consumed phantom numbers.
- **Fix:** `readRuns` now classifies markers (error vs fallback); fallback-only sets return a `fallbackOnly` result printed as `n/a` rows with a provenance WARN (exit 0); all-error sets keep the README's exit-1 contract (verified with an error-marker fixture: `all runs failed for slug "home" in psi/`, exit 1). README median-rule updated.
- **Files modified:** .planning/baseline/median.js, .planning/baseline/README.md
- **Verification:** `node .planning/baseline/median.js` exit 0 — lighthouse rows runs_used=3 with real medians, psi rows n/a + WARN; error-marker fixture exits 1
- **Committed in:** 4c05f45 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for output correctness — the baseline table must never imply measurements the artifacts don't contain. No scope creep; scripts + README only, no production code touched.

## Issues Encountered

- **PSI quota 429 persisted:** exhausted on all 9 runs (2026-08-19), same as observed 2026-08-18. Retry/backoff exercised fully; fallback path worked as designed. Not a failure — the pre-resolved decision anticipated it. Recorded in BASELINE.md for Phase 6.

## User Setup Required

None - no external service configuration required. Optional: `PSI_API_KEY` env var if Phase 6 wants real PSI data (raises quota; env var only, never committed).

## Next Phase Readiness

- Phase 1 success criteria 3 and 4 met: baseline captured on the live site before any change (criterion 3) and stored in `.planning/baseline/` (criterion 4) — see ROADMAP
- Phase 6 (PERF-04) has a like-for-like comparison target: same recipe (`npx -y lighthouse@13.4.1`, mobile, default throttling, same 3-URL set, median-of-3), median-vs-median per source, INP `n/a` caveat and PSI fallback provenance documented in BASELINE.md
- All 4 plans of Phase 01 complete; phase ready for the next step (planning Phase 2 / foundation)

---
*Phase: 01-test-scaffolding-performance-baseline*
*Completed: 2026-08-19*
## Self-Check: PASSED
