# Phase 6: Performance + Asset Cleanup + Final Verification — Pattern Map

**Mapped:** 2026-08-20
**Files analyzed:** 9 new/modified files
**Analogs found:** 7 / 9 (2 are pure file-I/O operations with no code analog — script patterns provided)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/layout.js` | component (layout entry) | request-response (SSR) | itself (import block, lines 1-10) | exact (self-modify) |
| `package.json` + `yarn.lock` | config | n/a (build-time) | itself (lockstep exact-pin matrix, lines 26-53) | exact (self-modify) |
| `src/assets/scss/style.scss` | config (style) | transform (SCSS compile) | itself (top `@use` block, lines 1-8) | exact (self-modify) |
| `phase3-upgrade-matrix.test.js` | test | n/a (text gate) | itself (UPGR-02 block, lines 56-101) + `baseline-tooling.test.js` | exact (self-modify) |
| `static/assets/` deletions (38 files) | asset | file-I/O | `phase2-foundation-cleanup.test.js` walkFiles (lines 16-24) + RESEARCH Code Example B | role-match |
| `static/` legacy PWA deletion (27 files) | asset | file-I/O | RESEARCH Code Example D (grep built HTML) | role-match |
| `design/` (new folder, 2 .xcf) | asset store | file-I/O | none (plain `git mv` — no code) | no analog |
| `.planning/baseline/capture-baseline.js` + `median.js` | utility (script) | batch (capture) | themselves — REUSED AS-IS (D-17), asserted by `baseline-tooling.test.js` | exact (no change) |
| `src/content/posts/*.md` | content | n/a | themselves — VERIFY ONLY, no frontmatter changes (research-resolved) | exact (no change) |

---

## Pattern Assignments

### `src/components/layout.js` (component, request-response)

**Analog:** itself — the existing import block. The three @fontsource imports land next to the existing style.scss import at line 8 (RESEARCH-verified build path; the SCSS `@use` path FAILS in the real build — do NOT use it).

**Imports pattern** (lines 1-10, current state — the insertion point):
```javascript
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Header from "./header"
import Logo from "./logo"
import Navigation from "./navigation"

import "../assets/scss/style.scss"
import Footer from "./footer"
import TopContacts from "./top-contacts"
```

**Target state** (RESEARCH.md Code Example A — verified green build, 14 @font-face blocks, 22 woff2/woff emitted, zero `fonts.googleapis.com`):
```javascript
import "@fontsource/ubuntu/400.css"       // PERF-01: self-hosted fonts (was: Google Fonts @import url() in style.scss)
import "@fontsource/ubuntu/700.css"
import "@fontsource/parisienne/400.css"
import "../assets/scss/style.scss"
```

**Rules:**
- Import order: @fontsource lines BEFORE the style.scss import (they are independent CSS; order vs other imports is cosmetic, but keep them adjacent to style.scss per UI-SPEC checklist item 6).
- Add a `// PERF-01:` comment tying the imports to the requirement (UI-SPEC checklist item 6 mandates the comment if the layout-entry path is used).
- No other change to this file — the component body (lines 12-41) is untouched.

---

### `package.json` + `yarn.lock` (config, build-time)

**Analog:** itself — the lockstep exact-pin matrix (lines 26-53). Phase 3 D-01 discipline: **exact pins, no caret**.

**Dependency pattern** (package.json lines 26-53, current state — add two entries alphabetically in `dependencies`):
```json
"dependencies": {
  "@emailjs/browser": "4.4.1",
  "@fontsource/parisienne": "5.3.0",
  "@fontsource/ubuntu": "5.3.0",
  "decap-cms-app": "3.6.4",
  ...
```

**Install command (yarn 1.22 ONLY — project rule, single lockfile):**
```bash
yarn add @fontsource/ubuntu@5.3.0 @fontsource/parisienne@5.3.0
```
- Never `npm install` (phase2-foundation-cleanup.test.js FNDT-01 asserts yarn.lock is the only tracked lockfile and package-lock.json is absent).
- `packageManager: "yarn@1.22.22"` (line 65) stays untouched.
- `engines.node: "24.x"` (line 70) stays untouched — `yarn add` runs `preinstall` → `scripts/check-node-version.js` which fails on non-24 Node; run under `nvm use` (Node 24 default).

**Version verification (run at plan time):**
```bash
npm view @fontsource/ubuntu version    # → 5.3.0 (2026-08-20)
npm view @fontsource/parisienne version # → 5.3.0 (2026-08-20)
```

---

### `src/assets/scss/style.scss` (config/style, transform)

**Analog:** itself — the top `@use` block (lines 1-8, current state after the 5a7d35c migration). The two `@import url()` lines at 7-8 are REMOVED entirely (D-03). **Do NOT add @fontsource `@use` lines here** — the SCSS path is verified broken in the real build (sass-loader "Can't find stylesheet to import"; includePaths workaround breaks css-loader URL rebase).

**Current state** (lines 1-8 — the only lines this phase touches):
```scss
@use "theme-variables";
@use "defaults";
@use "lib/css-grid-utility";
@use "utility";
@use "lib/prism-default";

@import url("https://fonts.googleapis.com/css2?family=Parisienne&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap");
```

**Target state** (lines 1-6 unchanged; lines 7-8 deleted):
```scss
@use "theme-variables";
@use "defaults";
@use "lib/css-grid-utility";
@use "utility";
@use "lib/prism-default";
```

**Rules:**
- Zero `@import url(` anywhere in the file (success criterion 1; grep gate).
- `_theme-variables.scss` is UNTOUCHED (D-02) — `--font-family: "Ubuntu", sans-serif` / `--font-family-titles: "Parisienne", cursive` (lines 8-9) stay byte-identical.
- No other SCSS edits — additive/parity discipline from Phase 5 applies; this phase is file-level only.

---

### `phase3-upgrade-matrix.test.js` (test, text gate)

**Analog:** itself — the UPGR-02 describe block (lines 56-101) plus the file's own read-helper header (lines 1-16). Currently RED: 1 failed / 18 passed (verified 2026-08-20 — the 5a7d35c `@use` migration moved the font lines off indices 0-1, breaking the `lines[0]`/`lines[1]` assertions at lines 80-95).

**Test header pattern** (lines 1-16 — reuse as-is; `styleScss` and `pkg` are already read):
```javascript
/** @jest-environment node */
const fs = require("fs")
const path = require("path")

const root = __dirname
const read = rel => fs.readFileSync(path.join(root, rel), "utf8")

const pkg = JSON.parse(read("package.json"))
const styleScss = read("src/assets/scss/style.scss")
```

**UPGR-02 rewrite target** (replaces lines 80-95 — the red assertion; UI-SPEC mandates: (a) zero `@import url(` in style.scss, (b) three @fontsource import lines in layout.js, (c) package.json pins):
```javascript
it("self-hosts the fonts via @fontsource with zero @import url() in style.scss", () => {
  // (a) PERF-01: no Google Fonts @import url() remains anywhere in the SCSS
  expect(styleScss).not.toMatch(/@import url\(/)
  // (b) the three @fontsource CSS imports land in the layout entry (verified build path)
  const layout = read("src/components/layout.js")
  expect(layout).toMatch(/@fontsource\/ubuntu\/400\.css/)
  expect(layout).toMatch(/@fontsource\/ubuntu\/700\.css/)
  expect(layout).toMatch(/@fontsource\/parisienne\/400\.css/)
  // (c) exact pins, no caret (lockstep discipline, 03-CONTEXT D-01)
  expect(pkg.dependencies["@fontsource/ubuntu"]).toBe("5.3.0")
  expect(pkg.dependencies["@fontsource/parisienne"]).toBe("5.3.0")
})
```

**Rules:**
- The old assertion (lines 80-95) is deleted in the same change as the style.scss edit (test co-change discipline, Phase 4/5).
- Keep the `themeVars` zero-`@import` assertion (line 94) — it still holds.
- The `/** @jest-environment node */` pragma is mandatory (no window; file reads only).

---

### `static/assets/` deletions (asset, file-I/O) — 38 files

**Analog:** no deletion analog exists in the codebase; the pattern is the reference-grep script (RESEARCH.md Code Example B) + the directory-walk pattern from `phase2-foundation-cleanup.test.js` lines 16-24.

**Reference-grep pattern** (RESEARCH.md Code Example B — the script is the source of truth, D-07; NEVER a hand-maintained list):
```javascript
// executor-side: for every file in static/assets/, grep its basename against
// src/content/, src/, gatsby-config.js, static/admin/config.yml, src/util/site.json
const fs = require("fs"), path = require("path")
const roots = ["src/content", "src", "static/admin/config.yml", "gatsby-config.js", "src/util/site.json"]
const files = fs.readdirSync("static/assets")
const isReferenced = f =>
  roots.some(r => {
    if (fs.statSync(r).isFile()) return fs.readFileSync(r, "utf8").includes(f)
    const stack = [r]
    while (stack.length) {
      const d = stack.pop()
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name)
        if (e.isDirectory()) stack.push(full)
        else if (/\.(md|js|jsx|yml|json)$/.test(e.name) && fs.readFileSync(full, "utf8").includes(f)) return true
      }
    }
    return false
  })
// delete files.filter(f => !isReferenced(f))  — 38 files (re-verified 2026-08-20)
```

**Directory-walk analog** (`phase2-foundation-cleanup.test.js` lines 16-24 — the codebase's existing walk pattern, useful if the executor writes the script as a test):
```javascript
const walkFiles = dir => {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(full))
    else out.push(full)
  }
  return out
}
```

**Dedup pairs (D-06) — keep the content-referenced extension, delete the twin (verified 2026-08-20):**

| Delete | Keep (referenced by) |
|--------|---------------------|
| `farfalle.jpeg` | `farfalle.jpg` (2024-08-15-farfalline.md) |
| `minnie.jpeg` | `minnie.jpg` (2024-08-15-minnie.md) |
| `paperino.jpeg` | `paperino.jpg` (2024-08-15-paperino.md) |
| `pluto-1.jpg` | `pluto-1.jpeg` (2024-08-15-pluto-1.md) |
| `pluto-2.jpg` | `pluto-2.jpeg` (2024-08-15-pluto-2.md) |
| `topolino.jpeg` | `topolino.jpg` (2024-08-15-topolino.md) |
| `trilli.jpg` | `trilli.jpeg` (2024-08-15-trilli-fatina-peter-pan.md) |
| `trilli-2.jpg` + `trilli-2.jpeg` | **both deleted** (unreferenced) |

**Critical traps (verified):**
- **`trilly.jpg` ≠ `trilli.jpg`** — `trilly.jpg` is referenced by `2021-10-05-trilly.md` (featuredImage line 7) and is a different file (different hash). The script must match exact basenames; a `trill*.jpg` glob would break the post.
- **`heart.png` IS referenced** — `src/util/site.json` line 7 `"image": "/assets/heart.png"` (D-09 KEEP).
- **`stackrole.png` IS referenced** — `gatsby-config.js:84` (manifest icon) + `static/admin/config.yml:187` (CMS logo default) (D-09 KEEP).
- **`home-1.jpg` IS referenced** — `src/content/pages/index.md` line 6 `featuredImage: /assets/home-1.jpg` (KEEP; `home-2.jpg` is unreferenced → delete).
- **The 8 pairs are NOT byte-identical** (re-encoded twins, ~5-8% size delta) — do NOT gate deletion on `cmp`/hash; the reference-grep is the gate.
- **`logo-bianco2.png` / `logo-bianco-old.png` / `logo-rosa-old.png`** live in `src/assets/img/` (bundled by `logo.js` line 3, not served from static/) — the grep covers `src/` so they're safe; no static/ copies exist.
- **`.xcf` files** (`logo-bianco.xcf`, `logo-rosa.xcf`) are unreferenced → they move to `design/` (D-08), not delete.

**Deletion mechanics:** plain `rm` + `git add -A` (RESEARCH: `git mv` not needed; git history preserves deleted files — reversibility contract).

**Post-delete verification (D-10):** `yarn build` + grep the built `public/` HTML for every kept asset path — zero 404s on asset URLs.

---

### `static/` legacy PWA deletion (asset, file-I/O) — 27 files

**Analog:** no code analog (pure deletion); the verification pattern is RESEARCH.md Code Example D — grep the plugin's generated output.

**Delete set (D-11):** `static/manifest.json`, `static/browserconfig.xml`, `android-icon-{36,48,72,96,144,192}x*.png`, `apple-icon-{57,60,72,76,114,120,144,152,180}x*.png`, `apple-icon.png`, `apple-icon-precomposed.png`, `favicon-{16,32,96}x*.png`, `favicon.ico`, `ms-icon-{70,144,150,310}x*.png` (verified present in `static/` 2026-08-20).

**Continuity verification (D-13) — the plugin output is the proof:**
```bash
ls public/manifest.webmanifest public/favicon-32x32.png "public/icons/icon-512x512.png"
grep -r 'rel="manifest"' public/index.html   # href="/manifest.webmanifest"
grep -r 'rel="icon"' public/index.html       # href="/favicon-32x32.png?v=…"
```

**Rules:**
- `gatsby-config.js` manifest plugin block (lines 75-86) is UNTOUCHED (D-12) — name "LaryArt by Lara", theme #ff1c65, icon `static/assets/stackrole.png`.
- Documented accepted delta: root `/favicon.ico` → 404 (browsers silently ignore; tab icon comes from the linked PNG). No redirect, no .ico.
- `static/admin/` is NOT touched (the CMS config lives there; only the legacy icon/manifest files at `static/` root are deleted).

---

### `design/` (new folder, asset store, file-I/O)

**No analog** — a plain folder move, no code.

**Pattern:**
```bash
mkdir design
git mv static/assets/logo-bianco.xcf design/logo-bianco.xcf
git mv static/assets/logo-rosa.xcf design/logo-rosa.xcf
```
- Default is MOVE (D-08); deletion only if the owner declines (not the default).
- `.xcf` files are never served by Gatsby (not web formats) — moving them out of `static/` removes them from the published payload.
- Zero visual delta — no page references `.xcf` (only the `.png` copies in `src/assets/img/` are imported by `logo.js`).

---

### `.planning/baseline/capture-baseline.js` + `median.js` (utility, batch)

**Analog:** themselves — REUSED AS-IS (D-17). No changes, no new tooling.

**Invocation (D-14 — identical Phase 1 recipe):**
```bash
node .planning/baseline/capture-baseline.js
node .planning/baseline/median.js
```

**Key invariants (asserted by `baseline-tooling.test.js` — do not break):**
- Lighthouse 13.4.1 pin (`const LIGHTHOUSE_VERSION = "13.4.1"`, capture-baseline.js line 47)
- `--form-factor=mobile`, `--only-categories=performance` (lines 78-79)
- 3 hardcoded URLs: `https://laryart.it/`, `/blog/`, `/minnie/` (lines 38-42) — never read from argv
- Median of 3, per-slug: home / blog / post-minnie (median.js lines 30, 140)
- INP is n/a in navigation mode (timespan-only audit) — WARN, not failure (capture-baseline.js lines 100-109)
- PSI 429 → retry/backoff (10s/30s/60s) → `lighthouse-fallback` provenance marker (lines 121-155); median.js never counts fallback markers as runs (lines 70-73)
- Comparison is lighthouse-vs-lighthouse medians vs `.planning/baseline/BASELINE.md` (baseline: LCP 3313.7 / 4750.71 / 3964.31, CLS 0.01/0.01/0, perf 91/82/87)

**Gate (D-16):** the capture runs against the LIVE site — the phase must be deployed to Netlify BEFORE the capture (manual checkpoint: owner deploys, then capture runs).

---

### `src/content/posts/*.md` (content, n/a)

**Analog:** themselves — VERIFY ONLY. Research resolved (2026-08-20): the kept files already match the referenced extensions — **no frontmatter changes needed**.

**Verified state (all 7 dedup-relevant posts reference the KEPT extension):**
- `2024-08-15-farfalline.md:7` → `/assets/farfalle.jpg` (keep .jpg)
- `2024-08-15-minnie.md:7` → `/assets/minnie.jpg` (keep .jpg)
- `2024-08-15-paperino.md:7` → `/assets/paperino.jpg` (keep .jpg)
- `2024-08-15-pluto-1.md:7` → `/assets/pluto-1.jpeg` (keep .jpeg)
- `2024-08-15-pluto-2.md:7` → `/assets/pluto-2.jpeg` (keep .jpeg)
- `2024-08-15-topolino.md:7` → `/assets/topolino.jpg` (keep .jpg)
- `2024-08-15-trilli-fatina-peter-pan.md:7` → `/assets/trilli.jpeg` (keep .jpeg)
- `2021-10-05-trilly.md:7` → `/assets/trilly.jpg` (KEEP — distinct from trilli.jpg)

**Rule:** zero content edits in this phase (CONTEXT domain: "no content changes"). The executor only verifies these paths still resolve after deletion (build + grep gate, D-10).

---

## Shared Patterns

### Exact-pin dependency discipline (no caret)
**Source:** `package.json` lines 26-53 (lockstep matrix) + `phase3-upgrade-matrix.test.js` lines 35-39
**Apply to:** package.json @fontsource additions
```javascript
// phase3-upgrade-matrix.test.js:35-39 — the asserting pattern for exact pins
it("pins gatsby 5.16.1 and all 12 plugins at .16.0 with exact pins (no caret)", () => {
  for (const [name, version] of Object.entries(matrix)) {
    expect(pkg.dependencies[name]).toBe(version)
  }
})
```
The new UPGR-02 assertion must use `.toBe("5.3.0")` — same exact-pin style.

### Text-gate test pattern (read file → assert on string content)
**Source:** `phase3-upgrade-matrix.test.js` lines 1-16 (header) + `baseline-tooling.test.js` lines 1-16
**Apply to:** the UPGR-02 rewrite (PERF-01/PERF-03 gates)
```javascript
/** @jest-environment node */
const fs = require("fs")
const path = require("path")
const root = __dirname
const read = rel => fs.readFileSync(path.join(root, rel), "utf8")
```
- `/** @jest-environment node */` is mandatory (no window).
- Assertions are `expect(text).toMatch(/regex/)` / `.not.toMatch(/regex/)` — no DOM, no rendering.

### Reference-grep deletion gate (script-computed, never hand-maintained)
**Source:** RESEARCH.md Code Example B + `phase2-foundation-cleanup.test.js` walkFiles (lines 16-24)
**Apply to:** static/assets/ deletions (PERF-02)
- The grep roots: `src/content/`, `src/`, `gatsby-config.js`, `static/admin/config.yml`, `src/util/site.json`.
- Re-verified 2026-08-20: 23 referenced / 38 unreferenced — matches the CONTEXT "~40" estimate.
- Post-delete held-out check: `yarn build` + grep built `public/` HTML for every kept asset path.

### yarn 1.22-only install
**Source:** `package.json` line 65 (`packageManager: "yarn@1.22.22"`) + `phase2-foundation-cleanup.test.js` FNDT-01 (lines 40-52)
**Apply to:** the @fontsource install
- `yarn add @fontsource/ubuntu@5.3.0 @fontsource/parisienne@5.3.0` — never npm.
- `preinstall` runs `scripts/check-node-version.js` — must run under Node 24 (`nvm use`).

### Prettier style (project-wide)
**Source:** `.prettierrc` conventions (AGENTS.md: no semicolons, double quotes, `arrowParens: "avoid"`, kebab-case filenames)
**Apply to:** layout.js imports, the test rewrite, any executor script
- No semicolons, double quotes, no TypeScript in `src/`.

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `design/` (new folder) | asset store | file-I/O | Pure `git mv` folder move — no code pattern exists; RESEARCH.md D-08 + UI-SPEC §.xcf move govern |
| `static/assets/` + `static/` deletions | asset | file-I/O | No deletion precedent in the codebase; the reference-grep script (RESEARCH Code Example B) + built-HTML grep (Code Example D) are the patterns |

---

## Metadata

**Analog search scope:** `src/components/`, `src/assets/scss/`, `src/content/`, `static/`, `static/assets/`, `static/admin/`, `scripts/`, `.planning/baseline/`, repo-root test files (`*.test.js`), `gatsby-config.js`, `package.json`, `src/util/site.json`
**Files scanned:** 25 (9 source/config, 8 test files, 61 static assets inventoried, 2 baseline scripts, 19 content files)
**Pattern extraction date:** 2026-08-20
**Verified live:** UPGR-02 test red (1 failed/18 passed); reference-grep re-run → 23 referenced / 38 unreferenced; all 7 dedup posts reference the kept extension; `trilly.jpg` vs `trilli.jpg` distinct; `heart.png`/`stackrole.png`/`home-1.jpg` referenced
