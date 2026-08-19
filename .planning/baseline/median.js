/*
 * Median extraction for the performance baseline (D-08 / D-09).
 *
 * Reads the raw JSON artifacts written by capture-baseline.js
 * (.planning/baseline/lighthouse/*.json and .planning/baseline/psi/*.json),
 * computes per-slug medians for LCP, CLS, INP and the performance score.
 *
 * Runs rule:
 *   - 3 valid runs -> median of 3 (the target)
 *   - 2 valid runs -> median of 2, prints WARN runs_used=2
 *   - 1 valid run  -> single value, prints WARN runs_used=1 (exit 0 — Plan 03's
 *     own tracer artifacts are exactly this; the strict >=2 gate applies ONLY
 *     to Plan 04's full capture)
 *   - no JSON files for a slug -> "not captured yet", skipped with a note
 *     (exit 0 — Plan 03's partial artifact set is expected)
 *   - files exist but ALL carry an error marker -> exit non-zero naming the slug
 *
 * A run is "valid" when its JSON carries no `error` marker. A metric column is
 * "n/a" when no valid run has a numeric value for it — this happens for INP on
 * static pages under Lighthouse 13 (timespan-only audit, see capture script).
 *
 * Usage: node .planning/baseline/median.js
 */

const fs = require("fs")
const path = require("path")

const BASELINE_DIR = __dirname
const SOURCES = ["lighthouse", "psi"]
const SLUGS = ["home", "blog", "post-minnie"]
const METRICS = [
  { name: "lcp_ms", audit: "largest-contentful-paint", scale: 1 },
  { name: "cls", audit: "cumulative-layout-shift", scale: 1 },
  { name: "inp_ms", audit: "interaction-to-next-paint", scale: 1 },
]

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid]
  return (sorted[mid - 1] + sorted[mid]) / 2
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function readRuns(sourceDir, slug) {
  const runs = []
  let fallbackMarkers = 0
  let errorMarkers = 0
  for (let i = 1; i <= 3; i++) {
    const file = path.join(sourceDir, `${slug}-${i}.json`)
    if (!fs.existsSync(file)) continue
    let data
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"))
    } catch (_) {
      continue
    }
    if (data && data.error) {
      errorMarkers++
      continue
    }
    // A PSI artifact marked "lighthouse-fallback" (PSI quota 429 exhausted after
    // retries) carries NO measurement — it only records provenance. It must not
    // count toward runs_used or the medians (the underlying Lighthouse run is
    // already counted in the lighthouse/ set; double-counting it here would
    // inflate the psi rows with numbers that were never PSI's).
    if (data && data.source === "lighthouse-fallback") {
      fallbackMarkers++
      continue
    }
    runs.push(data)
  }
  return { runs, fallbackMarkers, errorMarkers }
}

function metricValue(lhr, metric) {
  const audit = lhr.audits && lhr.audits[metric.audit]
  if (!audit || typeof audit.numericValue !== "number") return null
  return audit.numericValue * metric.scale
}

function perfScore(lhr) {
  const score = lhr.categories && lhr.categories.performance && lhr.categories.performance.score
  return typeof score === "number" ? Math.round(score * 100) : null
}

function computeMedians(sourceDir, slug) {
  const runFiles = [1, 2, 3].map(i => path.join(sourceDir, `${slug}-${i}.json`))
  const hasFiles = runFiles.some(f => fs.existsSync(f))
  if (!hasFiles) {
    return { used: 0, captured: false, warns: [], metrics: {}, perfScore: null }
  }

  const { runs, fallbackMarkers, errorMarkers } = readRuns(sourceDir, slug)
  const used = runs.length

  if (used < 1) {
    // No real measurement from this source. Error markers are a hard failure
    // (README contract); PSI quota fallback markers are an expected outcome
    // (documented fallback) reported as n/a with a provenance note.
    if (fallbackMarkers > 0 && errorMarkers === 0) {
      return {
        used: 0,
        captured: false,
        fallbackOnly: true,
        warns: [],
        metrics: {},
        perfScore: null,
      }
    }
    throw new Error(`all runs failed for slug "${slug}" in ${path.basename(sourceDir)}/`)
  }

  const result = { used, captured: true, warns: [] }
  if (used < 3) result.warns.push(`WARN runs_used=${used}`)

  result.metrics = {}
  for (const metric of METRICS) {
    const values = runs.map(r => metricValue(r, metric)).filter(v => v !== null)
    result.metrics[metric.name] = values.length ? round2(median(values)) : null
  }

  const scores = runs.map(perfScore).filter(v => v !== null)
  result.perfScore = scores.length ? Math.round(median(scores)) : null

  return result
}

function main() {
  console.log("source\tslug\tlcp_ms\tcls\tinp_ms\tperf_score\truns_used")
  let failed = false

  for (const source of SOURCES) {
    const sourceDir = path.join(BASELINE_DIR, source)
    if (!fs.existsSync(sourceDir)) continue

    for (const slug of SLUGS) {
      let res
      try {
        res = computeMedians(sourceDir, slug)
      } catch (err) {
        console.error(err.message)
        failed = true
        continue
      }
      if (!res.captured) {
        if (res.fallbackOnly) {
          console.log(`${source}\t${slug}\tn/a\tn/a\tn/a\tn/a\t0`)
          console.log(`  WARN: all ${source} runs for slug "${slug}" fell back to lighthouse (quota 429) — no ${source} measurement; see .planning/baseline/psi/ markers`)
        } else {
          console.log(`# ${source}\t${slug}\t(not captured yet — Plan 04 full capture)`)
        }
        continue
      }
      const inp = res.metrics.inp_ms === null ? "n/a" : res.metrics.inp_ms
      const score = res.perfScore === null ? "n/a" : res.perfScore
      console.log(
        [source, slug, res.metrics.lcp_ms, res.metrics.cls, inp, score, res.used].join("\t")
      )
      res.warns.forEach(w => console.log(`  ${w} — slug "${slug}" (${source})`))
    }
  }

  if (failed) process.exit(1)
}

main()
