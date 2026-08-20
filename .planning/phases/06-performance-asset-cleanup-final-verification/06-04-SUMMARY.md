---
phase: 06-performance-asset-cleanup-final-verification
plan: 04
subsystem: performance
tags: [lighthouse, core-web-vitals, lcp, cls, perf-score, baseline, netlify, gatsby]

# Dependency graph
requires:
  - phase: 06-performance-asset-cleanup-final-verification
    provides: 06-01 fonts self-hosting, 06-02 asset dedup/deletion, 06-03 PWA manifest/icon cleanup (the deployed state the capture measures)
  - phase: 01-test-scaffolding-performance-baseline
    provides: capture-baseline.js + median.js tooling and the Phase-1 median reference (D-14/D-17 reuse rule)
provides:
  - Final live-site CWV capture (Phase 6) with the identical Phase-1 recipe
  - Per-URL comparison table (final vs Phase-1 baseline) recorded in BASELINE.md
  - baseline-tooling.test.js co-changed to assert the new committed medians
  - PERF-04 verdict: met (LCP ≤ 2.5s, CLS ≤ 0.1, all improved vs baseline)
affects: [phase verification, UAT gate, gsd-verify-work, future performance work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Identical-recipe re-capture: same script, same LH 13.4.1 pin, same 3-URL set, median-of-3 — comparability over freshness (D-14)"
    - "Test co-change rides the same commit as the re-captured artifacts — suite green at the commit (T-06-14)"

key-files:
  created: []
  modified:
    - .planning/baseline/lighthouse/{home,blog,post-minnie}-{1,2,3}.json
    - .planning/baseline/BASELINE.md
    - baseline-tooling.test.js

key-decisions:
  - "PSI source: accepted the documented 429 fallback (no PSI_API_KEY exported) — all 9 psi runs 429'd after retry/backoff, lighthouse-fallback provenance markers recorded; comparison is lighthouse vs lighthouse"
  - "INP reported n/a for all rows — timespan-only audit in LH 13.4.1 navigation runs on static pages; documented, not a capture failure"
  - "Pre-existing user WIP in src/components/footer.js (Studio Simos footer edit) left untouched and unstaged — out of scope for this plan"

patterns-established:
  - "Pattern 1: post-deploy CWV verification = identical-recipe re-capture + median-vs-median comparison + test co-change in one atomic commit"

requirements-completed: [PERF-04]

coverage:
  - id: D1
    description: "Final live-site CWV capture (Phase 6) with the identical Phase-1 recipe — lighthouse medians per URL, runs_used=3"
    requirement: PERF-04
    verification:
      - kind: unit
        ref: "baseline-tooling.test.js#median.js prints real lighthouse medians with runs_used=3"
        status: pass
      - kind: other
        ref: "node .planning/baseline/median.js (stdout: lighthouse rows 1601.09/1446.33/1157.87, runs_used=3)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Comparison table (final vs Phase-1 baseline, per URL per metric) with explicit met/not-met verdicts recorded in BASELINE.md"
    requirement: PERF-04
    verification:
      - kind: other
        ref: "grep -q 'Final capture' .planning/baseline/BASELINE.md (comparison section present)"
        status: pass
    human_judgment: false
  - id: D3
    description: "baseline-tooling.test.js co-changed to assert the new committed medians; full jest suite green"
    requirement: PERF-04
    verification:
      - kind: unit
        ref: "TMPDIR=/home/simos/tmp yarn test (10 suites, 85 tests passed)"
        status: pass
    human_judgment: false

# Metrics
duration: 55min
completed: 2026-08-21
status: complete
---

# Phase 6 Plan 4: Final CWV Capture and Comparison Summary

**Final live-site Core Web Vitals re-capture with the identical Phase-1 recipe: LCP down 52–71% per URL (1601.09 / 1446.33 / 1157.87 ms vs 3313.7 / 4750.71 / 3964.31), perf score 100/100/100, PERF-04 met**

## Performance

- **Duration:** 55 min
- **Started:** 2026-08-20T21:26:00Z (capture start)
- **Completed:** 2026-08-20T22:19:05Z
- **Tasks:** 1 (Task 1 was the blocking-human deploy checkpoint, approved by the owner)
- **Files modified:** 13 (9 lighthouse JSONs + BASELINE.md + baseline-tooling.test.js + 1 docs fix commit)

## Accomplishments

- Re-verified the live deploy state BEFORE the capture: `grep -c 'fonts.googleapis.com'` on https://laryart.it/ returned 0 (Phase-1 Google Fonts import gone) and all 3 canonical URLs returned 200 — the capture ran against the final Phase 6 build, not a stale state (Pitfall 4, D-16)
- Ran the identical Phase-1 capture recipe (capture-baseline.js + median.js reused as-is, Lighthouse 13.4.1 pin, mobile, default throttling, 3-URL set, median of 3) against the live site — 18 artifacts re-captured in place
- New lighthouse medians: home LCP 1601.09 ms / blog 1446.33 ms / post-minnie 1157.87 ms, CLS 0.01/0.01/0, perf score 100/100/100 — **all improved vs the Phase-1 baseline** (3313.7 / 4750.71 / 3964.31 ms; 91/82/87)
- Recorded the "Final capture (Phase 6)" section in BASELINE.md: median table, per-URL comparison table with deltas, and explicit met/not-met verdicts — the Phase-1 rows stay as the comparison reference
- Co-changed baseline-tooling.test.js to assert the new committed medians in the SAME commit as the re-captured artifacts (T-06-14); full jest suite green (10 suites, 85 tests)
- PSI outcome recorded: anonymous quota 429 on all 9 runs, documented lighthouse-fallback markers (no key used); INP n/a documented (timespan-only audit in LH 13.4.1)

## Task Commits

Each task was committed atomically:

1. **Task 1: Checkpoint — owner deploys the full phase to Netlify** - approved by the owner (no commit; gate)
2. **Task 2: Run the identical capture + median, record the comparison table, co-change baseline-tooling.test.js** - `b120004` (feat)

**Plan metadata:** `2a8119d` (docs: correct Phase-6 capture timestamps to UTC in BASELINE.md)

## Files Created/Modified

- `.planning/baseline/lighthouse/{home,blog,post-minnie}-{1,2,3}.json` - Re-captured Lighthouse LHRs (median-of-3, live final site)
- `.planning/baseline/BASELINE.md` - Appended "Final capture (Phase 6)" section: median table, comparison table, verdicts, metadata (Phase-1 rows preserved)
- `baseline-tooling.test.js` - Hardcoded-median assertions updated to the new values (1601.09/1446.33/1157.87) in the lighthouse and BASELINE.md tests; PSI-fallback assertions unchanged

## Decisions Made

- **PSI source: accepted the documented 429 fallback** — no PSI_API_KEY exported; all 9 psi runs returned 429 after retry/backoff (10s/30s/60s), lighthouse-fallback provenance markers recorded per artifact; the comparison is lighthouse vs lighthouse (same as the Phase-1 baseline)
- **INP reported n/a** — `interaction-to-next-paint` is a timespan-only audit in LH 13.4.1, excluded from navigation-mode runs on static pages; documented, not a capture failure
- **Pre-existing user WIP left untouched** — `src/components/footer.js` (Studio Simos footer edit) was already modified in the working tree before this plan; left unstaged and uncommitted (out of scope)

## Deviations from Plan

None - plan executed exactly as written. The capture ran against the live deployed site with the identical recipe, the comparison is recorded per URL, the co-changed test passes with the new medians, and the verdict is met.

## Issues Encountered

- **Capture process killed by tool timeout on first launch** — the initial `nohup` launch was terminated when the shell tool's 120s timeout killed the process group mid-capture (during the PSI backoff sleep, after home lighthouse runs 1-3). Resolved by re-launching with `setsid` (new session, fully detached) — the re-run completed all 18 runs cleanly. No data loss: the first run's partial artifacts were overwritten by the complete re-run.
- **PSI 429 on all 9 runs** — expected and documented (same as Phase-1 baseline); fallback markers recorded, no key used.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 6 complete: PERF-04 met with all metrics improved vs baseline (LCP −52% to −71%, perf score 100 on all URLs)
- The comparison table and verdicts are recorded in BASELINE.md for the UAT gate and phase verification
- Pre-existing user WIP in `src/components/footer.js` remains uncommitted in the working tree — the owner should commit or revert it before the next phase
- Ready for phase verification and `/gsd-verify-work`

---
*Phase: 06-performance-asset-cleanup-final-verification*
*Completed: 2026-08-21*

## Self-Check: PASSED

- FOUND: `.planning/phases/06-performance-asset-cleanup-final-verification/06-04-SUMMARY.md`
- FOUND: commit `b120004` (feat(06-04): capture final CWV and compare vs Phase-1 baseline)
- FOUND: commit `2a8119d` (docs(06-04): correct Phase-6 capture timestamps to UTC in BASELINE.md)
