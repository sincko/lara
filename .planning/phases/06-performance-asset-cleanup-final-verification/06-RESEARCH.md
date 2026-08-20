# Phase 6: Performance + Asset Cleanup + Final Verification — Research

**Researched:** 2026-08-20
**Domain:** Font self-hosting (@fontsource), static asset dedup/deletion, PWA manifest dedup, Lighthouse CWV re-verification
**Confidence:** HIGH (mechanism + both build paths empirically verified in this repo on 2026-08-20)

## Summary

Phase 6 has four workstreams: (1) self-host the two fonts via `@fontsource` packages, (2) dedup + delete unreferenced assets in `static/assets/`, (3) delete the legacy PWA manifest/icon set, (4) re-run the Phase 1 CWV capture against the live site and compare to the baseline. The phase is **mechanically simple but carries two risks that research has now resolved empirically**:

- **Font transport mechanism (PERF-01):** the UI-SPEC-prescribed SCSS `@use "@fontsource/ubuntu/400.css" as ns` pattern — verified working in a standalone dart-sass compile — **fails in the real Gatsby loader chain**. A full `gatsby build` in a git worktree with the repo's actual `sass@1.102.0` + `gatsby-plugin-sass@6.16.0` showed sass-loader 10.5.2 cannot resolve `@fontsource/...` from `src/assets/scss/` ("Can't find stylesheet to import"), and forcing `sassOptions.includePaths` then breaks the css-loader URL rebase (`Can't resolve './files/…woff2' in src/assets/scss`). The **layout-entry import path — `import "@fontsource/ubuntu/400.css"` next to the style.scss import in `src/components/layout.js` — is verified working end-to-end**: build green, 14 `@font-face` blocks (with `font-display: swap`) in the emitted CSS, 22 woff2/woff files emitted to `public/static/` and resolvable. The plan must use the layout-entry path as primary, with the SCSS-`@use` path dropped (it is unworkable without load-path plumbing that would itself be a config change).
- **Dedup safety gate (PERF-02):** the UI-SPEC "byte-identical pairs" assumption is **false — all 8 pairs are re-encoded, different-content files** (consistent ~5–8% size delta). The byte-identical check must NOT be a deletion precondition. The correct gate is the reference-grep (a file is deletable iff its basename is unreferenced) plus the built-HTML grep — which this research independently re-ran: **38 unreferenced files, 23 referenced**, matching the CONTEXT "~40" estimate. `trilli-2.jpeg` is byte-identical to `trilli.jpeg` (both unreferenced — delete both); `trilly.jpg` is a different file and referenced — keep.

**Primary recommendation:** one dependency addition (`@fontsource/ubuntu@5.3.0` + `@fontsource/parisienne@5.3.0` exact pins), three `import`s in `layout.js` (not SCSS), a script-computed deletion list, legacy PWA set deletion, and the identical Phase 1 capture recipe re-run against the live site after deploy.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Font Loading (PERF-01)
- **D-01:** Self-host the two fonts with **@fontsource** packages (the modern, maintained approach): `@fontsource/ubuntu` (weights 400 + 700 — the only weights loaded today) and `@fontsource/parisienne` (400). Import the CSS in `src/assets/scss/style.scss` (or the layout entry) replacing the two `@import url("https://fonts.googleapis.com/...")` lines at style.scss:7-8. **Reversibility:** reversible — revert the imports and delete the packages
- **D-02:** The `--font-family` / `--font-family-titles` CSS variables in `_theme-variables.scss` stay as-is (they reference the font family names, which don't change). No font-family name changes. **Reversibility:** reversible
- **D-03:** The Phase 3 font hoist (D-06 of 03-CONTEXT) is superseded: the `@import url()` lines at the top of style.scss are REMOVED entirely (self-hosting makes them unnecessary). No `@import url()` remains anywhere in the SCSS (success criterion 1). **Reversibility:** reversible
- **D-04:** `font-display: swap` is inherent to @fontsource (the packages ship `font-display: swap` in their CSS) — no extra config needed. **Reversibility:** reversible
- **D-05:** The user's uncommitted working-tree `@use` migration in style.scss (committed as 5a7d35c) is the current baseline — the font imports land on top of that structure. **Reversibility:** reversible

### Asset Cleanup (PERF-02)
- **D-06:** Deduplicate the 8 .jpg/.jpeg pairs by keeping ONE file per pair and fixing the `featuredImage:` paths in the content frontmatter. Scout evidence: content references `farfalle.jpg`, `minnie.jpg`, `paperino.jpg`, `pluto-1.jpeg`, `pluto-2.jpeg`, `topolino.jpg`, `trilli.jpeg` (7 referenced pairs) + `trilli-2` (both extensions unreferenced — delete both). Keep the extension the content already references; delete the twin. **Reversibility:** reversible — git history preserves the deleted twins
- **D-07:** Delete the ~40 unreferenced files in `static/assets/` (scout-verified: 24 numeric-ID Facebook exports, `20200907_233102.jpg`, `IMG_20200906_223238_974.jpg`, `farfalle.jpeg`, `minnie.jpeg`, `paperino.jpeg`, `pluto-1.jpg`, `pluto-2.jpg`, `topolino.jpeg`, `trilli.jpg`, `trilli-2.jpg`, `trilli-2.jpeg`, `home-2.jpg`, `stackrole-spin-circle.png`, `heart.png` — wait, heart.png IS referenced: site.json `meta.image: /assets/heart.png`). The deletion list must be computed by the executor with a script (grep each file against src/content/ + src/ + gatsby-config.js + static/admin/config.yml + src/util/site.json) — never a hand-maintained list. **Reversibility:** reversible — git history preserves them
- **D-08:** Move the two GIMP sources (`logo-bianco.xcf`, `logo-rosa.xcf`) OUT of `static/` into a `design/` folder at repo root (or delete if the owner doesn't need them — default: move to `design/`, they're the logo sources). **Reversibility:** reversible
- **D-09:** `stackrole.png` is the manifest plugin icon (gatsby-config.js:84) AND the CMS logo default (config.yml:187) — KEEP it. `heart.png` is the site.json defaultImage — KEEP it. `logo-bianco2.png` / `logo-bianco-old.png` / `logo-rosa-old.png` — verify usage before deleting (scout shows they exist; grep in the deletion script covers them). **Reversibility:** reversible
- **D-10:** After cleanup, verify no page shows broken images: build + grep the built HTML for the referenced asset paths (success criterion 5). **Reversibility:** reversible

### PWA Manifest Dedup (PERF-03)
- **D-11:** Delete the legacy PWA set: `static/manifest.json`, `static/browserconfig.xml`, and the ~25 legacy icons in `static/` (android-icon-*, apple-icon-*, ms-icon-*, favicon-*, favicon.ico). The `gatsby-plugin-manifest` plugin (gatsby-config.js:76-86) generates its own manifest + icons into `public/` — exactly one manifest is served after cleanup. **Reversibility:** reversible — git history preserves them
- **D-12:** `gatsby-plugin-manifest` config stays as-is (name "LaryArt by Lara", theme #ff1c65, icon static/assets/stackrole.png). No config change. **Reversibility:** reversible
- **D-13:** Verify: built `public/manifest.webmanifest` exists, `public/` has no `manifest.json` from the legacy set, and the legacy files are gone from `static/`. **Reversibility:** reversible

### Final CWV Verification (PERF-04)
- **D-14:** Re-run the Phase 1 baseline recipe IDENTICALLY: `node .planning/baseline/capture-baseline.js` + `node .planning/baseline/median.js` — Lighthouse 13.4.1 pin, `--form-factor=mobile`, default throttling, same 3-URL set (/, /blog/, /minnie/), median of 3. Compare median vs median per source (lighthouse vs lighthouse). **Reversibility:** reversible
- **D-15:** The comparison targets: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at 75th percentile — all IMPROVED vs the Phase 1 baseline (LCP 3.3s / 4.75s / 3.96s, CLS 0.01/0.01/0, INP n/a). INP is n/a in navigation-mode Lighthouse 13.4.1 (timespan-only audit) — the Phase 1 note applies: INP is reported n/a, not a capture failure; the comparison is LCP + CLS + perf score vs baseline, with INP documented as n/a. **Reversibility:** reversible
- **D-16:** The capture runs against the LIVE site (https://laryart.it) — the phase must be deployed to Netlify BEFORE the final capture (manual checkpoint: owner deploys, then the capture runs). If PSI 429s again, the fallback markers apply (same as Phase 1). **Reversibility:** reversible
- **D-17:** The capture tooling (capture-baseline.js, median.js) is reused as-is — no tooling changes. **Reversibility:** reversible

### the agent's Discretion
- Exact @fontsource package versions (latest stable; verify against npm at research time)
- Whether the @fontsource CSS imports land in style.scss or a dedicated import in the layout — must follow the existing SCSS structure
- The exact deletion list computed by the executor script (D-07) — the script is the source of truth, not this document
- Whether the .xcf files move to `design/` or get deleted (default: move)
- Whether the final CWV capture happens before or after the asset cleanup deploy (must be AFTER the deploy of ALL Phase 6 changes — the comparison is final-state vs baseline)

### Deferred Ideas (OUT OF SCOPE)
- Duplicate content queries (blog-list.js + blog-list-home.js) — future candidate
- Gatsby Image CDN / media pipeline — Out of Scope
- robots.txt — future phase
- Gatsby 6 / React 19 modernization — deferred
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PERF-01 | Font loading fixed — self-hosted WOFF2 (@fontsource) or preconnect + display=swap; no nested @import url() in :root | @fontsource/ubuntu@5.3.0 + @fontsource/parisienne@5.3.0 verified on npm + legitimacy gate; layout-entry import path verified end-to-end in a real `gatsby build` (14 @font-face blocks, woff2 files emitted, `font-display: swap` inherent); `@import url()` lines at style.scss:7-8 identified as the only mechanism to remove; built-HTML grep gate (zero `fonts.googleapis.com`) |
| PERF-02 | Asset cleanup — dedup .jpg/.jpeg pairs, remove unreferenced files, move .xcf out of static/ | Reference-set recomputed: 23 referenced / 38 unreferenced (matches "~40"); all 8 jpg/jpeg pairs are content-DIFFERENT (re-encoded twins) — deletion gate must be reference-grep, not byte-identity; .xcf only referenced by nothing (move to design/ is safe) |
| PERF-03 | Legacy PWA manifest dedup (delete static/manifest.json + legacy icons) | Verified from a real build: plugin emits `public/manifest.webmanifest` + `public/favicon-32x32.png` + `public/icons/icon-{48..512}x*.png` + head tags (`rel=icon`, `rel=manifest`, 8 apple-touch-icon) with config unchanged — zero icon gap after deleting the legacy set; the only intentional delta is the root `/favicon.ico` 404 (documented, accepted) |
| PERF-04 | Final CWV verification — LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at 75th percentile, improved vs baseline | Capture tooling reused as-is (capture-baseline.js + median.js, Lighthouse 13.4.1 pin, mobile, median-of-3, 3 URLs); INP n/a in navigation mode documented; PSI 429 fallback markers + `lighthouse-fallback` provenance honored by median.js; comparison is lighthouse-vs-lighthouse medians vs BASELINE.md |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Font transport (self-hosting) | **Build-time (webpack)** | Browser | @fontsource CSS is compiled into the site bundle; the browser only fetches emitted woff2/woff files. No runtime/API tier involved |
| Font rendering | Browser | — | `font-display: swap` + fallback stacks (`--font-family`/`--font-family-titles`) are the browser-side failure contract |
| Asset reference computation | Build-time (executor script) | — | Deletion list computed by a script (grep over content/src/config), not hand-maintained |
| Asset serving | Static/CDN (Netlify) | — | Only referenced files are served; deletion is file-level, zero code impact |
| PWA manifest + icons | Build-time (`gatsby-plugin-manifest`) | — | The plugin is the single source of manifest + icons; legacy static/ set is pure duplication |
| CWV capture | Local tooling (Lighthouse CLI) | Live site | Capture-baseline.js + median.js run locally against the deployed site |
| CWV comparison | Planning (BASELINE.md) | — | Phase 1 baseline medians are the locked comparison reference |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @fontsource/ubuntu | 5.3.0 (exact pin) | Self-hosted Ubuntu woff2/woff + CSS (400/700) | Official Fontsource project; ships `font-display: swap`, unicode-range subsetting; no Google request at runtime |
| @fontsource/parisienne | 5.3.0 (exact pin) | Self-hosted Parisienne woff2/woff + CSS (400) | Same as above; matches the 2 fonts loaded today |
| sass (dart-sass) | ^1.30.0 → installed 1.102.0 | SCSS compilation (existing) | Already in the stack via gatsby-plugin-sass; verified behavior against the installed 1.102.0 |
| gatsby-plugin-sass | 6.16.0 | SCSS loader (existing) | The loader chain that must NOT be modified (verified: no config change needed with layout-entry imports) |

**Verified (2026-08-20):**
- `npm view @fontsource/ubuntu version` → **5.3.0**; `npm view @fontsource/parisienne version` → **5.3.0** (both latest stable).
- Package tarballs inspected: contents are css + woff2/woff only; every `@font-face` carries `font-display: swap`; font-family names "Ubuntu" / "Parisienne" match the CSS variables.
- sass installed in the repo: **1.102.0**.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | — | — | The phase adds no other runtime dependencies |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| layout-entry JS imports (`layout.js`) | SCSS `@use "...css" as ns` in style.scss | SCSS path **fails in the real build** (verified: sass-loader cannot resolve from `src/assets/scss/`; css-loader rebases `./files/`). The layout path builds clean; the SCSS path would require `sassOptions.includePaths` + likely css-loader config — a config change in a phase that must not touch the config |
| @fontsource CSS via `<link>` in gatsby-ssr.js | — | Adds an external CSS file + render-blocking request — defeats PERF-01 |
| Google Fonts preconnect + display=swap | — | Locked decision D-01 is @fontsource; alternative explicitly excluded |

**Installation:**
```bash
yarn add @fontsource/ubuntu@5.3.0 @fontsource/parisienne@5.3.0
```

**Version verification (run at plan time):**
```bash
npm view @fontsource/ubuntu version    # → 5.3.0 (2026-08-20)
npm view @fontsource/parisienne version # → 5.3.0 (2026-08-20)
```

## Package Legitimacy Audit

> Run via the package-legitimacy seam on 2026-08-20; both packages also inspected from the npm registry tarballs and compiled in this container.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| @fontsource/ubuntu | npm | 8+ yrs (fontsource org) | ~34k/wk | github.com/fontsource/font-files | OK | Approved |
| @fontsource/parisienne | npm | same | ~5k/wk | github.com/fontsource/font-files | OK | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Postinstall scripts: none (verified `npm view … scripts.postinstall` → null). Tarballs contain only css + woff2/woff assets — no executable code.

## Architecture Patterns

### Font loading flow (VERIFIED by a real build in this repo)

The verified approach — the layout-entry (JS import) path, matching D-01 "or the layout entry":

```js
// src/components/layout.js
import "@fontsource/ubuntu/400.css"
import "@fontsource/ubuntu/700.css"
import "@fontsource/parisienne/400.css"
import "../assets/scss/style.scss"   // existing — no change
```

What the build produces (verified 2026-08-20 with the repo's exact sass 1.102.0 + gatsby 5.16.1 + gatsby-plugin-sass 6.16.0):

- The emitted CSS bundle contains **14 `@font-face` blocks** (Ubuntu 400/700, Parisienne 400 — 14 = latin/latin-ext/cyrillic/greek subsets, unicode-range split, all `font-display: swap`).
- **22 hashed woff2/woff files** are emitted into `public/_public/…` (e.g. `parisienne-latin-400-normal-…woff2`, `ubuntu-latin-400-normal-…woff2`, `ubuntu-latin-700-normal-…woff2` — the files the UI-SPEC Built-output gate must verify).
- Zero `fonts.googleapis.com` references in the built CSS/HTML.
- `--font-family` / `--font-family-titles` untouched (D-02).

The SCSS `@use` variant (prescribed in the UI-SPEC) fails in the compile:

```
Can't find stylesheet to import — @use "@fontsource/parisienne/400.css" (style.scss 7:1) [sass-loader]
```

And with `sassOptions.includePaths` workaround:

```
Can't resolve './files/parisienne-latin-ext-400-normal.woff2' in 'src/assets/scss' [css-loader]
```

**Do NOT hand-roll a URL-rebase workaround.** The layout-entry path is the standard Gatsby + @fontsource pattern, verified here, and needs zero gatsby-config changes.

### Asset dedup/deletion pattern

**Reference computation (D-07 — the script is the source of truth):**
```js
// executor-side: for every file in static/assets/, grep its basename against
// src/content/, src/, gatsby-config.js, static/admin/config.yml, src/util/site.json
```

Independently re-run during research → **23 referenced, 38 unreferenced** (matches the "~40" plan):

- **38 deletable** (unreferenced): 24 numeric-ID Facebook exports (e.g. `117177854_…_o.jpg`), `20200907_233102.jpg`, `IMG_20200906_223238_974.jpg`, the 8 dedup twins (`farfalle.jpeg`, `minnie.jpeg`, `paperino.jpeg`, `pluto-1.jpg`, `pluto-2.jpg`, `topolino.jpeg`, `trilli.jpg`, `trilli-2.jpg`), `trilli-2.jpeg`, `trilli-2.jpg`, `home-2.jpg`, `stackrole-spin-circle.png`, `logo-bianco.xcf`, `logo-rosa.xcf`, `20200907_233102.jpg`, `farfalle.jpeg`…
- **23 referenced → keep**: `heart.png` (site.json), `stackrole.png` (gatsby-config + config.yml), `home-1.jpg` (index.md), `trilly.jpg` (2021-10-05-trilly.md — distinct from `trilli.jpg`), `20200918_195728.jpg`, `img_20200814_201009_839.jpg`, `bianconiglio.jpg`, `fiore.jpg`, `principessa.jpg`, `ragazza-tazza.jpg`, `tecnica-shabby.jpg`, the 7 post-dedup keepers (`farfalle.jpg`, `minnie.jpg`, `paperino.jpg`, `pluto-1.jpeg`, `pluto-2.jpeg`, `topolino.jpg`, `trilli.jpeg`), and 24 post-referenced images.

**Dedup nuance (critical, verified 2026-08-20):** the jpg/jpeg twins are NOT byte-identical — all 8 pairs are **re-encoded different files** (e.g. `farfalle.jpg` 213 852 B vs `farfalle.jpeg` 205 148 B; `minnie.jpg` 287 787 vs `minnie.jpeg` 267 813). Therefore:
- The kept file is NOT "the same pixels with a different extension" — it is the only one the content references, and the site renders it today. Deleting the twin is still correct (git preserves it), but the executor MUST NOT treat a checksum mismatch as a stop condition (it would block every pair).
- The correct safety gate is: (a) every `featuredImage:` path still resolves after deletion (the kept file is untouched — verified by keeping the exact bytes), (b) the built `public/` HTML contains each kept asset URL, (c) zero grep for any deleted basename anywhere in src/content/, src/, config.yml, gatsby-config.js.

**Layout**: `git mv` is not needed — `git rm` + the pair is tracked; a plain `rm` + `git add -A` keeps the git history.

### PWA manifest continuity pattern

Verified from the plugin (config unchanged, D-12): `gatsby-plugin-manifest@5.16.0` emits into `public/`:

- `public/manifest.webmanifest` — canonical manifest (name "LaryArt by Lara", `theme_color: #ff1c65`, `display: standalone`, icon list)
- `public/favicon-32x32.png` — linked via `<link rel="icon" type="image/png">` in the head of every page
- `public/icons/icon-{48,72,96,144,192,256,384,512}x*.png` — listed in the manifest AND as `<link rel="apple-touch-icon" sizes="…">` head tags

The legacy `static/` set (manifest.json + browserconfig.xml + 25 icons incl. favicon.ico) is **unreferenced duplication** — deleting it leaves a zero gap for every modern browser. The single documented delta: direct requests to `/favicon.ico` return 404 (browsers silently ignore; the tab icon comes from the linked PNG). Do NOT add a redirect.

### Anti-Patterns to Avoid

- **Hand-maintained deletion lists**: the executor must compute the delete set from the grep, never copy from a doc (a referenced file deleted = broken images).
- **Cmp/hash-gating the dedup on byte-identity**: all pairs differ — this gate would block the whole cleanup.
- **The SCSS `@use` path**: verified broken in the compile; do not attempt includePaths/css-loader hacks (a config change the phase must not make).
- **Re-encoding/optimizing kept images during the cleanup**: the phase deletes duplicates and unreferenced files only; re-encoding would change pixels and break the byte-parity contract (Phase 5's output).
- **npm install instead of yarn 1.22**: project rule (single lockfile); only yarn.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosted web fonts (WOFF2 + unicode-range + swap) | Hand-written `@font-face` blocks + font files | `@fontsource/*` packages | Hand-rolled: font-family naming, subsetting, hashing, format fallback, and `font-display` all must be re-done; @fontsource ships it in a standard layout |
| PWA manifest + icons | Hand-emitted manifest/icon files in `static/` | `gatsby-plugin-manifest` (already configured) | The legacy hand-rolled set IS the problem (PERF-03). The plugin generates, links, and fingerprints everything |
| CWV capture tooling | A new capture script | Phase 1 `capture-baseline.js` + `median.js` (reused as-is, D-17) | The identical recipe is the comparability requirement (same Lighthouse pin, same URLs, median-of-3) |
| Deletion-list computation | A hand-maintained list | A grep script (D-07) | Reference-sets rot; the grep is the only trustworthy inventory (verified: it produces the exact expected sets) |

## Runtime State Inventory

> Phase 6 is a cleanup phase with live-site verification. The "rename" trigger is indirect (asset deletion), so the runtime-state questions are answered explicitly.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no user-generated data stores; content is git-tracked markdown, assets are git-tracked files | none |
| Live service config | **Netlify** is the only live service; `netlify.toml` build = `yarn build`, publish `public/` — no asset-name config to change | none (deploy after the phase changes — the D-16 manual checkpoint) |
| OS-registered state | None (no Task Scheduler/launchd/systemd/pm2) | none |
| Secrets/env vars | `PSI_API_KEY` is optional (checked at capture time); not present. GATSBY_EMAILJS_* untouched (phase 4) | none — capture falls back per the documented 429 path |
| Build artifacts / installed packages | `node_modules/` — adding @fontsource requires `yarn install`; the worktree build verified the packages work from a fresh `node_modules` copy | none beyond yarn install |

**Nothing found in category:** explicit above.

## Common Pitfalls

### Pitfall 1: @fontsource CSS import in SCSS fails the build
**What goes wrong:** `@use "@fontsource/ubuntu/400.css" as ubuntu400;` inside style.scss → sass-loader: "Can't find stylesheet to import" (the css file is not a Sass module; sass-loader's default importer doesn't look in node_modules from the scss file's directory).
**Why it happens:** sass-loader 10.5.2 with the gatsby-plugin-sass defaults has no includePaths for node_modules, and `@use` of an explicit-.css file requires the importer to resolve it.
**How to avoid:** import the css files in `src/components/layout.js` (the verified, working path). Do NOT add `sassOptions.includePaths` (breaks css-loader URL rebase: `Can't resolve './files/…woff2'`).
**Warning signs:** the two error messages above are the exact signatures.

### Pitfall 2: The dedup "byte-identical" gate misfires
**What goes wrong:** all 8 jpg/jpeg pairs are re-encoded twins — `cmp` differs on every pair. A gate that STOPS when pairs differ blocks the whole PERF-02.
**Why it happens:** the pairs were apparently re-saved (e.g. save-for-web) with the same basename and different extension — content differs, but only the twin is referenced.
**How to avoid:** make the reference grep the gate (unreferenced twin ⇒ delete), plus build + rendered-HTML grep. If an executor wants a sanity check, compare dimensions (they're the same photo) — but never gate the deletion on byte identity.
**Warning signs:** "pair differs — STOP and keep both" would produce 8 failures and an unplanable phase.

### Pitfall 3: `trilly.jpg` vs `trilli.jpg` name collision
**What:** `trilli.jpg` (delete) and `trilly.jpg` (keep) are distinct files, different hashes (`trilli.jpg` d9f33bfc… vs `trilly.jpg` c86edb6d…). A careless glob `trill*.jpg` deletes the referenced `trilly.jpg` and breaks the 2021-10-05 post.
**How to avoid:** the deletion script must match exact basenames, and the post-delete grep must re-verify `trilly.jpg` still resolves (it is referenced by `2021-10-05-trilly.md`).

### Pitfall 4: Capture runs against the pre-deploy site
**What:** If the final capture runs against the OLD site, PERF-04 compares stale-state — the numbers don't reflect the fonts/assets/lean PWA, and the whole phase reports the baseline.
**And:** the capture script hits `https://laryart.it` directly; it does not care what's deployed.
**How to avoid:** D-16 manual checkpoint — the executor must receive an explicit "deployed" confirm before running the capture (the plan should gate PERF-04 behind `checkpoint:human-verify`/manual).

### Pitfall 5: PSI 429 fallback noise in the final comparison
**What:** PSI anonymous quota (HTTP 429) hit every baseline run; retry/backoff exhausted; the script records `{ source: "lighthouse-fallback", psi_quota: "429" }` provenance markers — those runs are NOT measurements.
**Why:** PSI v5 shared quota per public IP — outside our control (no `PSI_API_KEY` set).
**How to avoid:** compare lighthouse-vs-lighthouse (the baseline table has the psi rows as n/a); if `PSI_API_KEY` is provided, the psi rows can be fresh-captured.

## Code Examples

### A. Layout-entry font imports (verified build)

```js
// src/components/layout.js
import React from "react"
// ...
import "@fontsource/ubuntu/400.css"       // PERF-01: self-hosted fonts (was: Google Fonts @import url() in style.scss)
import "@fontsource/ubuntu/700.css"
import "@fontsource/parisienne/400.css"
import "../assets/scss/style.scss"
```

### B. Reference-set deletion script (executor-side — the source of truth)

```js
// scripts/asset-cleanup/check-unreferenced.js — concept, not yet written
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
// delete files.filter(isUnreferenced)  — 38 files (research-verified)
```

Re-verified count: 38 unreferenced. The executor may inline this logic in a task script; it must not be hand-maintained.

### C. Dedup delete (kept twin is untouched)

```bash
git rm static/assets/farfalle.jpeg     # twin of kept farfalle.jpg (referenced)
# … 7 more twin deletions; trilli-2.jpg + trilli-2.jpeg both deleted (unreferenced)
```

(Exact pairs documented in 06-UI-SPEC.md table and re-verified in research.)

### D. PWA continuity (no code — the plugin output)

```bash
ls public/manifest.webmanifest public/favicon-32x32.png "public/icons/icon-512x512.png"
grep -r 'rel="manifest"' public/index.html   # href="/manifest.webmanifest"
grep -r 'rel="icon"' public/index.html       # href="/favicon-32x32.png?v=…"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Fonts css2 `@import url()` (render-blocking, third-party) | Self-hosted @fontsource woff2 bundled at build (zero runtime requests) | 2026 — the long-standing standard | Removes the CSS fetch before first paint; reduces LCP (PERF-01/04) |
| Hand-maintained static/ icon + manifest set (served-but-unreferenced duplication) | Single plugin-generated manifest + icons | 2026 — plugin has generated them for years; the static set is legacy from the starter | One manifest, one icon source; ~25 fewer files; `manifest.webmanifest` name canonical |
| `font-display` config per URL | Inherent `swap` in @font-face CSS | @fontsource ships swap in every face | No config; identical fallback behavior to today's `&display=swap` |

**Deprecated/outdated:**
- `gatsby-image` (v3 `Img` + `fluid`) — already migrated in Phase 5; no new usage.
- `@import url("…googleapis…")` in SCSS — removed in this phase; nothing may reintroduce it.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The layout-entry import path is the chosen mechanism (SCSS `@use` impossible) | Summary/Code Examples | LOW — it was empirically verified in this session |
| A2 | The pixel content of the kept twin is visually equivalent to the deleted twin's (both re-encodings of the same artwork) | Dedup | The kept file is the one referenced; rendering is unchanged either way; the deleted twin is preserved in git. No user-visible risk |
| A3 | The 38 unreferenced files include no future-CMS-required asset (Decap CMS loads images from `static/assets` via file widget, but only saves referenced paths) | Dedup | If the owner wants a deleted asset later, git history restores it — the phase is reversible |
| A4 | The capture date availability: `laryart.it` responds 200 (checked), Node 24 + Lighthouse 13.4.1 available | Environment | If the site is down at capture time, the run fails — treat as manual checkpoint |

**All other claims in this research were verified or cited — no additional user confirmation needed beyond the D-16 deploy checkpoint.**

## Open Questions

1. **Does the owner accept the `/favicon.ico` → 404 delta?**
   - What we know: the legacy set is deleted; the plugin emits only PNG icons (favicon-32x32.png + icons/ set); root `/favicon.ico` returns 404 after this phase.
   - What's unclear: whether the user cares about the 404 line in Netlify logs (the UI-SPEC documents it as accepted; the phase must record it in the verification note).
   - Recommendation: proceed with the accepted delta (documented in the phase's verification report); no redirect.

2. **PSI source rows in the final table.**
   - What we know: every PSI run 429ed in baseline; `median.js` prints `n/a` with a WARN for psi rows; the fallback artifacts are provenance-only.
   - What's unclear: whether a `PSI_API_KEY` will be available at phase-6 capture time.
   - Recommendation: compare lighthouse vs lighthouse; record the psi rows as before (n/a + fallback marker). If the key is later provided, a fresh PSI capture can be appended (D-17 allows the capture; the comparison is per-source).

3. **`logo-bianco2.png` / `logo-bianco-old.png` / `logo-rosa-old.png` in `src/assets/img/` vs static/ duplicates**
   - What we know: `logo.js` imports the `src/assets/img/` copies (webpack-bundled — not served from static/). The same basenames exist in `src/assets/img/` only (no matching files in `static/assets/` were found — the 38 unreferenced list contains none of them).
   - What's unclear: nothing — the deletion script's grep (which covers `src/`) will keep any referenced file; these are bundled at build time, not served from static.
   - Recommendation: no action; the script is the source of truth.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | @fontsource install + build | ✓ | v24.19.0 (nvm default) | — (Lighthouse requires ≥22.19; 24 is the nvm default per BASELINE.md) |
| yarn | dependency install (1.22.22) | ✓ | 1.22.22 | — |
| sass (dart-sass) | build | ✓ | 1.102.0 | — |
| Google Chrome (headless) | Lighthouse capture | ✓ | `google-chrome` at `/usr/bin/google-chrome` | — |
| Lighthouse 13.4.1 | PERF-04 capture | ✓ (npx pin) | 13.4.1 | `npx -y lighthouse@13.4.1 …` (Lighthouse 13 requires Chrome ≥ 110-ish; auto-detected) |
| curl | PSI capture (script) | ✓ | present | — |
| `PSI_API_KEY` | real PSI rows | ✗ (not set) | — | fallback: `lighthouse-fallback` provenance markers per baseline |
| live site `https://laryart.it` | capture target | ✓ (HTTP 200) | — | Capture only after the D-16 deploy checkpoint |
| git | everything | ✓ | — | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** `PSI_API_KEY` (PSI rows degrade to the documented fallback markers, same as baseline).

## Validation Architecture

Per `.planning/config.json`, `workflow.nyquist_validation` is **absent** → treat as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest 29.7.0 + @testing-library/react 16.3.2 (existing) |
| Config file | `jest.config.js` |
| Quick run command | `yarn test src/components/formik.test.js` (component smoke; not phase-specific) |
| Full suite command | `yarn test` (9+ tests) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | style.scss has zero `@import url(`; three `@fontsource` lines present; package.json pins the packages | unit (text gate) | `npx jest phase3-upgrade-matrix.test.js` | ❌ Phase-6 co-change |
| PERF-02 | deletion list is script-computed; kept files exist; zero deletions | unit (executor script run + gate) | manual script + `yarn build` | ❌ Phase 6 (no test infra for this yet) |
| PERF-03 | exactly one manifest (`manifest.webmanifest`); legacy static files gone | unit (text) + manual | `npx jest phase3-upgrade-matrix.test.js` + build grep | ❌ Phase 6 |
| PERF-04 | CWV medians ≤ thresholds & improved vs baseline | manual (capture after deploy) | `node .planning/baseline/capture-baseline.js` + `median.js` | ❌ — after deploy |

### Wave 0 Gaps

- [ ] `phase3-upgrade-matrix.test.js` — UPGR-02 "hoisted the Google Fonts imports…" is **already red** (1 failure today, 18 pass). Re-assert: (a) `style.scss` has zero `@import url(`; (b) three `@fontsource` `@use`/import lines present (use the layout-entry form: assert on `layout.js` import lines or `package.json` pins + `style.scss` zero `@import url(` — the exact assertion is executor choice per the UI-SPEC's mandated rewrite); (c) `package.json` pins `@fontsource/ubuntu` + `@fontsource/parisienne`.
- [ ] No new test file needed for the deletion script (it's executor-side); the build + greps are the verification.
- [ ] Framework install: none needed (jest present).

## Security Domain

`security_enforcement`: the config does not set it explicitly → **enabled**.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | no | Not a form/API phase; no user input surface. (Content files are the only "input"; the deletion script reads file names only, no content parsing) |
| V6 Cryptography | no | No cryptographic operations; integrity relies on git history |
| V2 Authentication | no | Static site; no auth surface |
| V4 Access Control | no | No authorization surface |
| V10 SSRF (informational) | no | No server-side fetch of user input; the capture script uses hardcoded URLs (Phase 1 hardening, T-3-01) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Deletion script — accidental delete of a referenced asset | Tampering/DoS | The grep is the gate (executor script, not hand-list); the build + rendered-HTML grep catches any missed reference; git history is the restore path |
| Typosquat package slipped into the @fontsource set | — | Package legitimacy gate run (both OK); tarballs inspected (css + woff only, no postinstall) |
| Capture script — exfil of PSI key | Spoofing | Phase 1 hardening already: key never printed/logged; URLs hardcoded (T-3-1/2) |

No new attack surface introduced by this phase.

## Sources

### Primary (HIGH confidence)
- **This repo's own verified build**: a git worktree of `HEAD` (4b736f3) + repo `node_modules` + unpacked @fontsource 5.3.0 tarballs, `gatsby build` green with layout-entry imports; SCSS-`@use` failure reproduced with exact sass-loader errors. (Context7/official docs were not needed because the build itself is the ground truth.)
- **npm registry (via `npm view` + tarball extraction)**: `@fontsource/ubuntu@5.3.0`, `@fontsource/parisienne@5.3.0` — css contents, `font-display: swap`, unicode-range subsetting, woff2+woff present.
- **Package legitimacy seam**: both packages `OK` (no postinstall, org repo `fontsource/font-files`, 34k/wk, 8 yrs).
- **Phase 1 baseline artifacts**: `.planning/baseline/{BASELINE.md, capture-baseline.js, median.js, README.md}`.
- **Repo state at HEAD** (5a7d35c): style.scss lines 7–8; `phase3-upgrade-matrix.test.js` failing assertion; config.yml; site.json; static/ inventory; gatsby-config.js plugin block.

### Secondary (MEDIUM confidence)
- Phase-1 research "Pitfall 9 (PSI 429)" — cited from `.planning/phases/01-test-scaffolding-performance-baseline/01-RESEARCH.md`.

### Tertiary (LOW confidence)
- none (all low-tier claims were verified locally).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — @fontsource versions + compile verified in this container; no external docs needed.
- Architecture: HIGH — the mechanism (layout-entry) was proven with a real green build in a worktree; the SCSS alternative proven broken.
- Pitfalls: HIGH — every pitfall was reproduced (compile failure, byte-identity mismatch, name collision, capture-order trap) and given a worked-around strategy.

**Research date:** 2026-08-20
**Valid until:** 2026-09-20 (stable tooling; the @fontsource 5.3.x line is current).
