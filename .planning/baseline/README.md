# Performance Baseline — Capture Tooling & Methodology

Core Web Vitals baseline for laryart.it, captured **before** any production
changes in this milestone (Phase 1, requirement FNDT-06, decisions D-08/D-09).
Phase 6 compares post-change CWV against these numbers — the exact recipe below
must be reproduced identically.

## Commands

```bash
# Full capture: 3 URLs x 3 runs x 2 sources (Lighthouse CLI + PSI API)
node .planning/baseline/capture-baseline.js

# Per-target capture (bounded slug/source/run filters — URLs are never read
# from the command line; only the hardcoded URLS constant is used)
node .planning/baseline/capture-baseline.js <slug> <lighthouse|psi> [run]

# Median extraction -> TSV table (source, slug, lcp_ms, cls, inp_ms, perf_score, runs_used)
node .planning/baseline/median.js
```

Run with the nvm default **Node 24** (`node --version` → v24.x). Do NOT run
under `.nvmrc`'s Node 20 — Lighthouse 13 requires `>=22.19`.

## Methodology (one line)

**Lighthouse 13.4.1 CLI, mobile, default throttling, median of 3; PSI v5,
strategy=mobile, median of 3.**

## URL Set (hardcoded in capture-baseline.js)

| Slug | URL | Verified |
|------|-----|----------|
| `home` | `https://laryart.it/` | 200 (2026-08-19) |
| `blog` | `https://laryart.it/blog/` | 200 (2026-08-19; canonical trailing slash per 301) |
| `post-minnie` | `https://laryart.it/minnie/` | 200 (2026-08-19; frontmatter `slug: /minnie` + 301 → `/minnie/`) |

## Capture Parameters (Lighthouse)

- `npx -y lighthouse@13.4.1` — exact pin (Phase 6 must rerun with this version)
- `--only-categories=performance`
- `--form-factor=mobile` (mobile profile)
- `--output=json`, one file per run: `.planning/baseline/lighthouse/<slug>-<run>.json`
- Default throttling (devtools simulated), 5s settle between runs
- Chrome flags: `--headless=new --no-sandbox --disable-dev-shm-usage`
  (required in this headless environment; without them Chrome fails NO_FCP)

## Capture Parameters (PSI v5)

- `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<enc>&strategy=mobile&category=performance`
- Raw response stored per run: `.planning/baseline/psi/<slug>-<run>.json`
- Optional `PSI_API_KEY` env var (append `&key=`; never logged or committed)
- **429 quota handling** (research Pitfall 9): retry with backoff 10s/30s/60s;
  if still exhausted, the run falls back to Lighthouse CLI against the live URL
  and the artifact is marked `{ source: "lighthouse-fallback", psi_quota: "429" }`.
  The capture run log records which URLs got which source.

## Median Rule

- **3 valid runs → median of 3** (the target).
- 2 valid runs → median of 2, `WARN runs_used=2`.
- 1 valid run → single value, `WARN runs_used=1` (exit 0; Plan 03's tracer
  artifacts are exactly this). The strict ≥2 gate applies **only** to the full
  Plan 04 capture.
- 0 valid runs for a slug → script exits non-zero naming the slug.
- A run carrying an `error` marker is invalid and skipped.
- Metrics: LCP (ms), CLS, INP (ms), performance score (×100, rounded).

## INP Note (verified on LH 13.4.1)

`interaction-to-next-paint` is a **timespan-only** audit in Lighthouse 13 —
it is excluded from navigation-mode runs, and even in timespan mode it reports
notApplicable when the page receives no user interactions. A static
informational page yields **no INP numericValue** from this recipe; `median.js`
reports INP as `n/a` for such runs. This is expected behavior, not a capture
failure, and matches PSI lab output for the same page type.

## Version Metadata (capture run)

| Property | Value |
|----------|-------|
| Lighthouse version | 13.4.1 (npx pin) |
| PSI API version | v5 |
| Chrome | auto-detected by LH (headless) |
| Node | v24.18.0 (nvm default) |
| Capture date(s) | 2026-08-19 (tracer: home URL, 1 run; full capture in Plan 04) |
| Git commit SHA | see `git log --oneline .planning/baseline/` (baseline artifacts are committed; git history is the integrity record) |

## Phase 6 Reproducibility

Phase 6 MUST rerun with the identical recipe:

- same Lighthouse pin `13.4.1`, same `--form-factor=mobile`, same default
  throttling, same URL set, same median-of-3 rule — otherwise the comparison
  is apples-to-oranges (research Pitfall 10)
- compare median vs median per source (lighthouse vs lighthouse, psi vs psi)
- if PSI 429s again, the fallback source is recorded per artifact and per the
  capture run log

The consolidated `BASELINE.md` (median table + methodology) is written by the
next plan (01-04) from the artifacts this tooling produces.
