/*
 * Performance baseline capture — Lighthouse CLI (local) + PageSpeed Insights (live site)
 *
 * Methodology (D-08 / D-09, see README.md):
 *   - Lighthouse 13.4.1 CLI via npx (exact pin for Phase 6 reproducibility)
 *   - mobile profile, performance category only, JSON output
 *   - 3 URLs × 3 runs × 2 sources; median of 3 (computed by median.js)
 *   - PSI HTTP 429 quota: retry with backoff (10s/30s/60s), then fall back to
 *     a Lighthouse-CLI run against the live URL, marked `source: "lighthouse-fallback"`
 *
 * SECURITY: URLs are hardcoded constants — the script NEVER reads URLs from
 * argv/stdin (threat T-3-01). `process.env.PSI_API_KEY` is honored when present
 * but NEVER printed, logged, or written to artifacts (threat T-3-02).
 *
 * RUN WITH: the nvm default Node 24 (NOT `nvm use` 20 — .nvmrc pins Node 20,
 * but Lighthouse 13 requires >=22.19; local Node 24.18.0 is compatible).
 *
 * INP NOTE (verified on LH 13.4.1): the `interaction-to-next-paint` audit is
 * `supportedModes: ['timespan']` in Lighthouse 13 — it is excluded from
 * navigation-mode runs by the config filter, and even in timespan mode it
 * returns notApplicable when the page has no user interactions. A static
 * informational page therefore yields NO INP numericValue from the pinned
 * recipe (navigation mode, default throttling, mobile). The script keeps the
 * canonical audit key for Phase 6 comparability and emits a WARN when the
 * audit is absent; median.js reports INP as "n/a (no interactions)" for such
 * runs. This matches PSI lab behavior for the same page.
 *
 * Usage: node .planning/baseline/capture-baseline.js
 */

const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Hardcoded canonical URL set (resolved from research Open Question 2).
// Trailing slashes are canonical: /blog/ per the 301, /minnie/ per frontmatter
// slug + 301. All three verified to return 200 at execution time (2026-08-19).
const URLS = [
  "https://laryart.it/",
  "https://laryart.it/blog/",
  "https://laryart.it/minnie/",
]

const RUNS = 3
const SOURCES = ["lighthouse", "psi"]

const LIGHTHOUSE_VERSION = "13.4.1"
const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

const BASELINE_DIR = path.join(__dirname)
const LH_DIR = path.join(BASELINE_DIR, "lighthouse")
const PSI_DIR = path.join(BASELINE_DIR, "psi")

// "home" / "blog" / "post-minnie" — mirrors the research bash slug convention;
// the post slug is `/minnie`, not the filename date prefix.
function slugify(url) {
  const u = url.replace(/^https:\/\/laryart\.it/, "").replace(/\/$/, "")
  if (u === "") return "home"
  if (u === "/blog") return "blog"
  return "post-minnie"
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function urlEncode(str) {
  // Built-in equivalent of encodeURIComponent — no deps.
  return encodeURIComponent(str)
}

function runLighthouse(url, slug, run) {
  const outPath = path.join(LH_DIR, `${slug}-${run}.json`)
  const args = [
    "-y",
    `lighthouse@${LIGHTHOUSE_VERSION}`,
    url,
    "--only-categories=performance",
    "--form-factor=mobile",
    "--output=json",
    `--output-path=${outPath}`,
    "--quiet",
    // Headless-environment fix: without these Chrome fails with NO_FCP
    // ("page did not paint any content") when run via npx in this environment.
    '--chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage"',
  ]
  let res = spawnSync("npx", args, { encoding: "utf8", timeout: 300000 })
  if (res.status !== 0) {
    // Retry once after 10s (CDN settle, transient failures).
    console.log(`    retrying lighthouse ${slug} run ${run} after 10s`)
    sleep(10000)
    res = spawnSync("npx", args, { encoding: "utf8", timeout: 300000 })
  }
  if (res.status !== 0) {
    // Record the failure explicitly so the run count is visible in the artifact set.
    const err = { error: (res.stderr || res.stdout || "lighthouse failed").slice(0, 500) }
    fs.writeFileSync(outPath, JSON.stringify(err, null, 2))
    return { ok: false }
  }
  // INP availability check — LH 13 excludes `interaction-to-next-paint`
  // (timespan-only audit) from navigation runs; inform, don't fail.
  try {
    const lhr = JSON.parse(fs.readFileSync(outPath, "utf8"))
    if (!lhr.audits || !lhr.audits["interaction-to-next-paint"]) {
      console.log("    WARN: interaction-to-next-paint audit absent (timespan-only in LH 13; static page — expected)")
    }
  } catch (_) {
    /* not an LHR — error artifact; nothing to warn about */
  }
  return { ok: true }
}

async function runPSI(url, slug, run) {
  const outPath = path.join(PSI_DIR, `${slug}-${run}.json`)
  const enc = urlEncode(url)
  let apiUrl = `${PSI_API}?url=${enc}&strategy=mobile&category=performance`
  if (process.env.PSI_API_KEY) {
    apiUrl += `&key=${encodeURIComponent(process.env.PSI_API_KEY)}`
  }

  const backoffs = [10000, 30000, 60000] // 429 retry/backoff per research Pitfall 9
  let body = null

  for (let attempt = 0; attempt <= backoffs.length; attempt++) {
    const res = spawnSync("curl", ["-s", "-w", "\n%{http_code}", apiUrl], {
      encoding: "utf8",
      timeout: 120000,
    })
    const raw = res.stdout || ""
    const parts = raw.trim().split(/\n/)
    const httpCode = parts.pop() || "000"
    body = parts.join("\n")

    const isQuota = httpCode === "429" || /RESOURCE_EXHAUSTED/.test(body)
    if (!isQuota) {
      fs.writeFileSync(outPath, body)
      return { ok: httpCode === "200", source: "psi", psi_quota: "no" }
    }
    if (attempt < backoffs.length) {
      const wait = backoffs[attempt]
      console.log(`    psi 429 (attempt ${attempt + 1}/4) — backing off ${wait / 1000}s`)
      await sleep(wait)
    }
  }

  // Quota exhausted after retries — fall back to Lighthouse CLI against the
  // live URL for this run, marking the artifact so the source is auditable.
  console.log("    psi quota exhausted — falling back to lighthouse CLI for this run")
  const lhOk = runLighthouse(url, slug, run)
  fs.writeFileSync(
    outPath,
    JSON.stringify({ source: "lighthouse-fallback", psi_quota: "429" }, null, 2)
  )
  return { ok: lhOk.ok, source: "lighthouse-fallback", psi_quota: "429" }
}

async function main() {
  fs.mkdirSync(LH_DIR, { recursive: true })
  fs.mkdirSync(PSI_DIR, { recursive: true })

  // Optional targeted mode (no URL input — only slug + source, both bounded):
  // node capture-baseline.js <slug> <source> [run]
  const onlySlug = process.argv[2] || null
  const onlySource = process.argv[3] || null
  const onlyRun = process.argv[4] ? parseInt(process.argv[4], 10) : null

  for (const url of URLS) {
    const slug = slugify(url)
    if (onlySlug && slug !== onlySlug) continue

    for (const source of SOURCES) {
      if (onlySource && source !== onlySource) continue

      for (let run = 1; run <= RUNS; run++) {
        if (onlyRun && run !== onlyRun) continue

        process.stdout.write(`capture ${slug} ${source} run ${run}/3 — `)
        if (source === "lighthouse") {
          const r = runLighthouse(url, slug, run)
          console.log(r.ok ? "ok" : "FAILED (recorded error artifact)")
        } else {
          const r = await runPSI(url, slug, run)
          console.log(r.ok ? `ok (source=${r.source}, psi_quota=${r.psi_quota})` : "FAILED")
        }
        await sleep(5000) // CDN settle between runs, per research
      }
    }
  }
}

main().catch(err => {
  console.error("capture failed:", err)
  process.exit(1)
})
