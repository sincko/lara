# Phase 6: Performance + Asset Cleanup + Final Verification - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the site measurably faster and leaner: fonts stop blocking rendering (self-hosted WOFF2 via @fontsource, or preconnect + display=swap — no nested `@import url()` remains), the published asset set is deduplicated (no .jpg/.jpeg pairs, no unreferenced files, .xcf moved out of static/), exactly one PWA manifest is served (legacy static/manifest.json + old icons deleted), and the final Core Web Vitals are verified against the Phase 1 baseline (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at 75th percentile, median of 3, mobile — all improved vs baseline). No visual redesign, no new features, no content changes — the site must keep building and deploying reliably.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase & Requirements
- `.planning/ROADMAP.md` §Phase 6 — Goal, 5 success criteria, requirements PERF-01..04
- `.planning/REQUIREMENTS.md` §PERF-01, §PERF-02, §PERF-03, §PERF-04 — Requirement definitions
- `.planning/phases/03-core-upgrade/03-CONTEXT.md` — D-06 (font hoist to top of style.scss — SUPERSEDED by D-03 here), D-01 (lockstep version matrix rule)
- `.planning/phases/01-test-scaffolding-performance-baseline/01-CONTEXT.md` — D-08/D-09 (baseline capture recipe, storage in .planning/baseline/)
- `.planning/phases/05-image-pipeline-seo-fixes/05-CONTEXT.md` — D-07 (DOMINANT_COLOR hero placeholder — the LCP-relevant image decision this phase builds on)

### Baseline & Tooling
- `.planning/baseline/BASELINE.md` — THE comparison reference: median LCP/CLS/INP per URL per source + the "Re-run (Phase 6 identical recipe)" section + INP n/a note + PSI 429 fallback note
- `.planning/baseline/capture-baseline.js` — the capture script (reused as-is, D-17)
- `.planning/baseline/median.js` — the median table generator (reused as-is, D-17)
- `.planning/baseline/README.md` — capture methodology

### Codebase Maps
- `.planning/codebase/CONCERNS.md` §Performance Bottlenecks — image duplication (8 pairs, ~30 unused Facebook exports, .xcf files), Google Fonts @import url() render-blocking, duplicate content queries
- `.planning/codebase/STACK.md` — gatsby-plugin-manifest + gatsby-plugin-offline config, static/ icon set
- `.planning/codebase/CONVENTIONS.md` — Code style (Prettier, no semicolons, double quotes, arrowParens avoid)
- `.planning/codebase/ARCHITECTURE.md` — static/ assets sourcing (gatsby-source-filesystem name: assets), manifest plugin

### Tests
- `phase3-upgrade-matrix.test.js` — UPGR-02 asserts the font imports are hoisted to the top of style.scss (the Phase 3 test) — MUST be updated when the @import url() lines are removed (D-03) — test co-change discipline
- `.planning/phases/01-test-scaffolding-performance-baseline/01-SUMMARY.md` — jest setup, baseline capture evidence

### Content
- `src/content/posts/*.md` — the `featuredImage:` frontmatter paths that must be fixed during dedup (D-06)
- `src/util/site.json` — `meta.image: /assets/heart.png` (KEEP heart.png, D-09)
- `static/admin/config.yml` — CMS logo default `/assets/stackrole.png` (KEEP stackrole.png, D-09)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.planning/baseline/capture-baseline.js` + `median.js` — the exact Phase 1 capture recipe, reusable as-is for PERF-04
- `.planning/baseline/BASELINE.md` — the comparison reference with the re-run recipe documented
- `gatsby-plugin-manifest` (gatsby-config.js:76-86) — already generates the canonical manifest + icons; the legacy static/ set is pure duplication
- `src/assets/scss/style.scss` — the two `@import url()` font lines at the top (lines 7-8) are the only font-loading mechanism to replace

### Established Patterns
- Plain JavaScript (no TS), Prettier formatting, Italian content
- yarn 1.22.22, Node 24 enforced, lockstep version discipline (Phase 3 D-01)
- Test co-change discipline (Phase 4/5): when behavior changes, update the asserting test in the same change
- Additive SCSS discipline (Phase 5): add properties to existing rules, never rewrite selectors

### Integration Points
- `src/assets/scss/style.scss` — replace the two @import url() lines with @fontsource imports (D-01/D-03)
- `package.json` + `yarn.lock` — add @fontsource/ubuntu + @fontsource/parisienne (yarn 1.22 only)
- `static/assets/` — dedup pairs (D-06), delete unreferenced (D-07), move .xcf to design/ (D-08)
- `src/content/posts/*.md` — featuredImage path fixes for the kept extensions (D-06)
- `static/` — delete legacy manifest.json + browserconfig.xml + ~25 legacy icons (D-11)
- `phase3-upgrade-matrix.test.js` — UPGR-02 font-hoist assertion must be updated (test co-change)
- `design/` — NEW folder at repo root for the .xcf sources (D-08)
- Netlify — manual checkpoint: owner deploys the phase before the final CWV capture (D-16)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard approaches per CONCERNS.md evidence, the locked requirement versions (@fontsource for self-hosting), and the Phase 1 baseline recipe (identical re-run).

</specifics>

<deferred>
## Deferred Ideas

- **Duplicate content queries** (CONCERNS.md §Performance Bottlenecks — blog-list.js + blog-list-home.js share the same query) — refactor opportunity, not in this phase's requirements; future candidate
- **Gatsby Image CDN / media pipeline** — explicitly Out of Scope in REQUIREMENTS.md (Netlify deployment)
- **robots.txt** — no robots.txt exists (CONCERNS.md §Missing Critical Features); not in this phase's requirements; future phase
- **Gatsby 6 / React 19 modernization** — v2 requirements (MODR-01/02/03), deferred to future release

</deferred>

---

*Phase: 6-Performance + Asset Cleanup + Final Verification*
*Context gathered: 2026-08-20*
