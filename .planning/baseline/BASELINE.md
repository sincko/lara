# Performance Baseline — laryart.it Core Web Vitals

Capture of the live production site, **before** any dependency or code change
in this milestone (Phase 1, requirement FNDT-06, decisions D-08/D-09). Phase 6
(PERF-04) compares post-change CWV against the medians below — reproduce the
identical recipe (see [Re-run](#re-run)).

## Baseline

Median of 3 runs per URL per source, mobile profile, performance category.
Table generated from `node .planning/baseline/median.js` (paste of stdout).

| Source | URL | LCP (ms) | CLS | INP (ms) | Perf score | Runs used |
|--------|-----|---------:|----:|---------:|-----------:|----------:|
| lighthouse | `https://laryart.it/` | 3313.7 | 0.01 | n/a | 91 | 3 |
| lighthouse | `https://laryart.it/blog/` | 4750.71 | 0.01 | n/a | 82 | 3 |
| lighthouse | `https://laryart.it/minnie/` | 3964.31 | 0 | n/a | 87 | 3 |
| psi | `https://laryart.it/` | n/a | n/a | n/a | n/a | 0 |
| psi | `https://laryart.it/blog/` | n/a | n/a | n/a | n/a | 0 |
| psi | `https://laryart.it/minnie/` | n/a | n/a | n/a | n/a | 0 |

**INP note:** `interaction-to-next-paint` is a timespan-only audit in Lighthouse
13.4.1 — excluded from navigation-mode runs; static pages with no user
interactions yield no INP numericValue (matches PSI lab behavior for the same
page type). INP is reported `n/a`, not a capture failure.

**PSI fallback note (all 9 psi runs):** the PSI v5 anonymous shared quota
returned HTTP 429 on every run (2026-08-19, same as 2026-08-18). After
retry/backoff (10s/30s/60s), each run fell back to the Lighthouse CLI against
the live URL per the documented fallback (research Pitfall 9; capture script's
branch). Every `psi/<slug>-<run>.json` artifact is therefore a
`{ "source": "lighthouse-fallback", "psi_quota": "429" }` provenance marker —
**no PSI numbers exist in this baseline**. The psi rows above are `n/a` and are
NOT duplicated from the lighthouse rows. Phase 6 must compare lighthouse vs
lighthouse; if a `PSI_API_KEY` is provided then, the psi source can be captured
fresh and compared like-for-like per source.

## Method

- **Lighthouse:** `npx -y lighthouse@13.4.1 <url> --only-categories=performance
  --form-factor=mobile --output=json --output-path=<file> --quiet
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage"`
  — default (devtools simulated) throttling, mobile profile, median of 3 runs,
  5s CDN settle between runs.
- **PSI:** PSI API v5 `runPagespeed?url=<enc>&strategy=mobile&category=performance`
  (median of 3 intended) — quota 429 on all runs this capture; see fallback note.
- Median rule: 3 valid runs → median of 3 (achieved for all lighthouse rows).
  A run with an `error` marker or a `lighthouse-fallback` marker is invalid and
  never counted.

## Capture metadata

| Property | Value |
|----------|-------|
| Capture date | 2026-08-19 (start 07:09Z, end 07:42Z) |
| Git commit SHA (at capture time) | `6d17f83` (baseline artifacts committed in `feat(phase-1): capture performance baseline …`) |
| Node | v24.18.0 (nvm default — NOT `.nvmrc` Node 20; Lighthouse 13 requires >=22.19) |
| Lighthouse | 13.4.1 (npx pin) |
| Chrome | HeadlessChrome 151.0.0.0 (auto-detected by Lighthouse) |
| PSI API | v5 (strategy=mobile, category=performance) |

## URL set

Canonical URLs (hardcoded in `capture-baseline.js`; all re-verified 200 at
capture time):

| Slug | URL | Redirect note |
|------|-----|---------------|
| `home` | `https://laryart.it/` | canonical root |
| `blog` | `https://laryart.it/blog/` | `/blog` → 301 → `/blog/` (canonical trailing slash) |
| `post-minnie` | `https://laryart.it/minnie/` | frontmatter `slug: /minnie`, `/minnie` → 301 → `/minnie/` |

## Re-run (Phase 6 identical recipe)

```bash
node .planning/baseline/capture-baseline.js     # re-capture raw JSONs
node .planning/baseline/median.js               # re-print the median table
```

Reproduce identically: Lighthouse `13.4.1` pin, `--form-factor=mobile`, default
throttling, the same 3-URL set, median-of-3 rule. Compare **median vs median
per source** (lighthouse vs lighthouse, psi vs psi). If PSI 429s again, the
fallback source is recorded per artifact; if `PSI_API_KEY` is set, real PSI
responses are stored. Full methodology: [README.md](./README.md).

*Baseline storage: `.planning/baseline/` (raw JSONs committed alongside this
file — git history is the integrity record; threat T-4-02).*
