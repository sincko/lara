/** @jest-environment node */
const fs = require("fs")
const path = require("path")
const { spawnSync } = require("child_process")

const root = __dirname
const read = rel => fs.readFileSync(path.join(root, rel), "utf8")

const captureSource = read(".planning/baseline/capture-baseline.js")
const baselineMd = read(".planning/baseline/BASELINE.md")

const runMedian = () =>
  spawnSync("node", [path.join(root, ".planning/baseline/median.js")], {
    cwd: root,
    encoding: "utf8",
  })

const rowsOf = (output, source) =>
  output
    .split("\n")
    .filter(line => line.startsWith(`${source}\t`))
    .map(line => line.split("\t"))

describe("FNDT-06: baseline tooling is honest and reproducible", () => {
  it("median.js exits 0 against the committed artifacts", () => {
    const res = runMedian()
    expect(res.status).toBe(0)
  })

  it("median.js prints real lighthouse medians with runs_used=3", () => {
    const res = runMedian()
    const rows = rowsOf(res.stdout, "lighthouse")
    expect(rows).toHaveLength(3)

    const bySlug = Object.fromEntries(rows.map(r => [r[1], r]))
    expect(bySlug.home[2]).toBe("3313.7")
    expect(bySlug.home[6]).toBe("3")
    expect(bySlug.blog[2]).toBe("4750.71")
    expect(bySlug.blog[6]).toBe("3")
    expect(bySlug["post-minnie"][2]).toBe("3964.31")
    expect(bySlug["post-minnie"][6]).toBe("3")
  })

  it("median.js never counts PSI fallback markers as runs (runs_used=0, n/a)", () => {
    const res = runMedian()
    const rows = rowsOf(res.stdout, "psi")
    expect(rows).toHaveLength(3)

    for (const row of rows) {
      expect(row[2]).toBe("n/a")
      expect(row[6]).toBe("0")
    }
  })

  it("psi artifacts are provenance markers, not fake measurements", () => {
    for (const slug of ["home", "blog", "post-minnie"]) {
      for (let run = 1; run <= 3; run++) {
        const marker = JSON.parse(
          read(`.planning/baseline/psi/${slug}-${run}.json`),
        )
        expect(marker).toEqual({
          source: "lighthouse-fallback",
          psi_quota: "429",
        })
      }
    }
  })

  it("capture-baseline.js hardcodes the 3 laryart.it URLs and never reads URLs from argv/stdin", () => {
    expect(captureSource).toContain("https://laryart.it/")
    expect(captureSource).toContain("https://laryart.it/blog/")
    expect(captureSource).toContain("https://laryart.it/minnie/")
    // argv is used only for the bounded slug/source/run filters, never for URLs
    expect(captureSource).toContain("const onlySlug = process.argv[2] || null")
    expect(captureSource).toContain(
      "const onlySource = process.argv[3] || null",
    )
    expect(captureSource).toContain("const onlyRun = process.argv[4]")
  })

  it("capture-baseline.js pins lighthouse 13.4.1 with the mobile form factor", () => {
    expect(captureSource).toContain('const LIGHTHOUSE_VERSION = "13.4.1"')
    expect(captureSource).toContain("lighthouse@${LIGHTHOUSE_VERSION}")
    expect(captureSource).toContain("--form-factor=mobile")
  })

  it("capture-baseline.js implements the PSI 429 retry/backoff branch and honors PSI_API_KEY without printing it", () => {
    expect(captureSource).toContain("process.env.PSI_API_KEY")
    expect(captureSource).toContain("RESOURCE_EXHAUSTED")
    expect(captureSource).toContain("lighthouse-fallback")
    // the key is appended to the API URL only — never logged
    expect(captureSource).not.toMatch(/console\.log\([^)]*PSI_API_KEY/)
  })

  it("BASELINE.md records the version, the site, and the median table", () => {
    expect(baselineMd).toContain("13.4.1")
    expect(baselineMd).toContain("laryart.it")
    expect(baselineMd).toContain("3313.7")
    expect(baselineMd).toContain("4750.71")
    expect(baselineMd).toContain("3964.31")
  })
})
