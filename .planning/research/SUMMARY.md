# Project Research Summary

**Project:** LaryArt (laryart.it) — Gatsby modernization milestone
**Domain:** Static-site (Gatsby) modernization & performance optimization for a small artisan showcase site
**Researched:** 2026-08-18
**Confidence:** HIGH

## Executive Summary

LaryArt is a small static artisan showcase site (6 templates, 19 posts, 61 assets, 9.6 MB) built on Gatsby 5.15 with a legacy dependency stack: node-sass, MUI v4, netlify-cms-app, gatsby-image, react-helmet, gatsby-plugin-matomo, emailjs-com, and a double-lockfile/Node-version mess that has caused repeated Netlify build failures. The milestone was framed as a "Gatsby 6 migration," but all four research files independently verified that **Gatsby 6 does not exist** — the latest stable is `gatsby@5.16.1` (active LTS, Feb 2026), verified against the npm registry, GitHub releases, and official docs. The realistic modernization target is a lockstep upgrade of the entire `gatsby-*` plugin family to the 5.16/6.16/7.16 lines, staying on React 18, plus removal of every EOL/deprecated dependency. This is a dependency upgrade with verification, not an architectural migration — the plugin system, GraphQL data layer, and `gatsby-node.js` API are unchanged between 5.15 and 5.16.

The recommended approach is a dependency-ordered sequence: **(0)** test scaffolding + performance baseline, **(1)** foundation cleanup (lockfile consolidation, Node config, dead code/deps), **(2)** core upgrade (Gatsby 5.16.1 + dart-sass + Decap CMS swap + Matomo snippet), **(3)** MUI removal + form reliability, **(4)** image pipeline migration + SEO fixes, **(5)** performance optimization + asset cleanup + final CWV verification. Phases 3 and 4 touch disjoint file sets and can run in parallel. A React 19 + latest-Decap end state is possible but explicitly deferred — it is coupled to the CMS admin and must land as its own verified phase.

Key risks: the "Gatsby 6" expectation mismatch (reframe in requirements), React 19 silently breaking the CMS admin (stay on 18), stale Netlify build caches after the upgrade (clear-cache deploy), the contact form's silent-failure bug masking env-var mistakes (fix the failure path in the same commit), and a big-bang upgrade with zero tests (scaffold jest first). Every change is small and independently revertable; the static site means the last good Netlify deploy stays live until the next successful build.

## Key Findings

### Recommended Stack

The stack is a modernization of the existing Gatsby setup, not a rewrite. All versions verified live against the npm registry on 2026-08-18. The single most important finding: **there is no Gatsby 6** — do not chase `5.17.0-next` / `5.18.0-react19` canary tags; pin `gatsby@5.16.1` exactly.

**Core technologies:**
- `gatsby@5.16.1` — latest stable; v5 is active LTS with no v6 on the horizon (npm dist-tags, GitHub releases, and release-notes index all verified)
- `react`/`react-dom` **18.3.1 (stay)** → 19.2.8 (deferred end state) — Gatsby 5.16 supports React 19, but the CMS stack forces a coupled migration (see Pitfall 6)
- `sass@1.102.0` (dart-sass) — replaces deprecated `node-sass`; drop-in for this repo (local `@import`s only); `gatsby-plugin-sass@6.16.0` peers `sass ^1.30.0`
- `decap-cms-app@3.6.4` + `gatsby-plugin-decap-cms@4.0.4` — replaces EOL `netlify-cms-app`; **3.6.4 is the last React-18-compatible Decap release** (3.7+ peers React 19)
- `gatsby-plugin-image@3.16.0` — replaces deprecated `gatsby-image`; works with existing sharp plugins
- Gatsby **Head API** (built-in) — replaces unmaintained `react-helmet` (which breaks on React 19)
- `@emailjs/browser@4.4.1` — replaces deprecated `emailjs-com` (same `sendForm` API, import change only)
- Matomo: **vendored `_paq` snippet in `gatsby-browser.js`** — `gatsby-plugin-matomo` is deprecated + archived; zero-dependency replacement
- Node **22 LTS** (`.nvmrc` + `netlify.toml`), Yarn **1.22.22 classic**, single `yarn.lock` (delete `package-lock.json`)

**Removals:** node-sass, MUI v4 (core + icons), netlify-cms-app, gatsby-plugin-netlify-cms, gatsby-plugin-netlify-cms-paths (or inline), gatsby-plugin-matomo, gatsby-plugin-advanced-sitemap, gatsby-image, gatsby-background-image, react-helmet, gatsby-plugin-react-helmet, emailjs-com, typescript (unused), and starter leftovers (codemirror, seamless-immutable, redux, react-refresh, y18n, prismjs, package-doctor, yarn-as-dep, acorn).

### Expected Features

The milestone is maintenance/refactoring only (PROJECT.md: no new features). "Launch" = the site builds, deploys, and measurably improves. The acceptance metric is a Core Web Vitals improvement (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms) measured against a pre-change baseline.

**Must have (table stakes, P1):**
- Performance baseline (Lighthouse + PSI on live site) — the acceptance metric; do first
- Build reliability (dart-sass, Node fix, single lockfile) — Core Value: "site must always build and deploy"
- MUI v4 removal + plain-CSS form (with the false-success redirect bug fixed) — biggest bundle cut + known-bug fix
- `gatsby-image` → `gatsby-plugin-image` migration (4-5 files) — CLS/LCP + enables the og:image fix
- Font loading fix (self-host WOFF2 or preconnect + `display=swap`) — LCP/FCP/CLS
- Unused dependency removal — install/build surface

**Should have (differentiators, P2):**
- Asset cleanup (dedup 8 `.jpg`/`.jpeg` pairs, delete ~30 unreferenced files, move `.xcf` out of `static/`) — published weight
- Matomo `disableCookies: true` + privacy page cleanup — GDPR without a consent banner
- PWA manifest dedup (delete legacy `static/manifest.json` + icons)
- SEO meta fixes (`lang="it"`, real Italian descriptions, og:image via `getSrc`)

**Defer (v2+):**
- React 19 + Decap CMS latest (3.15.1) — coupled change, needs its own verification phase
- ESLint flat config — dev-only; note: a *minimal jest suite* is NOT deferred — it is Phase 0 (see Pitfall 11)
- `robots.txt` + sitemap hygiene, media library (Cloudinary/LFS), Partial Hydration/Slices, `web-vitals` RUM, Preact, Gatsby Cloud Image CDN, TypeScript migration, rewrite to Next.js/Remix — all explicitly anti-features for this site size

### Architecture Approach

The five-layer architecture (Content → Gatsby Data Layer → Page Generation → Presentation → Output/Deployment) is preserved. The only real data-flow change is the image resolver: `childImageSharp.fluid` → `childImageSharp.gatsbyImageData` with mapping rules from the official migration guide (`fluid(maxWidth < 1000)` → `CONSTRAINED`; no maxWidth → `FULL_WIDTH`; `tracedSVG` → `BLURRED`/`DOMINANT_COLOR`). `gatsby-node.js`, the content frontmatter contract, and `static/admin/config.yml` are UNCHANGED.

**Major components:**
1. Content Layer (markdown + `static/assets/`) — unchanged; asset cleanup only
2. Gatsby Data Layer (GraphQL; remark/sharp transformers) — `gatsby-plugin-image` resolver added; plugin wiring modified
3. Page Generation Layer (`gatsby-node.js` + 6 templates) — `gatsby-node.js` unchanged; template queries rewritten (4-5 files)
4. Presentation Layer (React components + SCSS) — image components, formik.js, top-contacts.js, seo.js modified; old-form.js/form-pulito.js deleted
5. Output/Deployment (Netlify) — `netlify.toml` NODE_VERSION fix, `yarn build`, CMS plugin swap

### Critical Pitfalls

1. **Chasing a "Gatsby 6" that doesn't exist / installing canary tags** — reframe the requirement to "upgrade to Gatsby 5.16.1 (latest stable)"; pin exactly; never install `5.17.0-next` or `5.18.0-react19` canaries
2. **Upgrading `gatsby` core alone while `gatsby-*` plugins stay on 5.15** — the monorepo releases in lockstep; upgrade ALL gatsby-* packages in ONE commit (exact version matrix verified in STACK.md)
3. **"Works locally, fails on Netlify" — stale `.cache`/build cache** — run `gatsby clean && yarn build` locally before push; first post-upgrade Netlify deploy must be "clear cache"
4. **Node-version ambiguity** — `netlify.toml` says `NODE_VERSION = "10"`, `.nvmrc` says 20, local is 24; delete `NODE_VERSION` entirely, make `.nvmrc` the single source of truth
5. **React 19 silently breaking the CMS admin (`/admin`)** — `netlify-cms-app` peers React ^16/17; Decap ≥3.7 peers React 19; stay on React 18 this milestone; React 19 + Decap are a coupled change
6. **Big-bang upgrade with zero tests** — the repo has no tests (`test` exits 1); scaffold a minimal jest + testing-library suite (form validation + failure path, pagination math, page creation) BEFORE the upgrade — the single highest-leverage prevention
7. **MUI removal regressing the form** — preserve Formik error/helperText UX in the plain-CSS replacement; delete `form-pulito.js`/`old-form.js` landmines in the same commit
8. **Image migration breaking the og:image fix and layout semantics** — use `getSrc()` for SEO (fixes the `[object Object]` bug); choose `constrained` vs `fullWidth` per file; remove `tracedSVG` config
9. **EmailJS env-var silent breakage** — `GATSBY_` prefix is mandatory; commit `.env.example`; set Netlify dashboard vars; fix the false-success redirect in the same commit or the change is untestable
10. **Naive dead-dependency sweep** — `prismjs` is a peer of gatsby-remark-prismjs; `y18n`/`yarn` were audit/build hacks; use `yarn why` per removal, one logical group per commit

## Implications for Roadmap

Based on combined research (dependency graph from ARCHITECTURE.md + pitfall-to-phase mapping from PITFALLS.md), suggested phase structure:

### Phase 0: Test Scaffolding + Performance Baseline
**Rationale:** No regression net exists (`test` script exits 1 by design), and the milestone's acceptance metric (CWV improvement) is unmeasurable without a baseline. Pitfall 11 calls this the single highest-leverage prevention in the whole milestone.
**Delivers:** Minimal jest + @testing-library/react suite (formik validation + submit failure path, blog pagination math, `gatsby-node.js` page-creation test); Lighthouse + PSI baseline on the live site (median of 3, mobile profile).
**Addresses:** FEATURES.md "Performance baseline" (P1).
**Avoids:** Pitfall 11 (big-bang upgrade with zero tests).

### Phase 1: Foundation Cleanup (config reconciliation + dead code/deps)
**Rationale:** Zero code risk; shrinks the install surface before any upgrade; fixes the build-config contradiction (`NODE_VERSION=10` vs `.nvmrc` 20) that has caused repeated Netlify failures. Every other feature must be verified with a trustworthy `gatsby build`.
**Delivers:** Single `yarn.lock` (delete `package-lock.json`), `netlify.toml` → `yarn build` + no NODE_VERSION, dead deps removed with `yarn why` verification (one logical group per commit), dead components deleted (`old-form.js`, `form-pulito.js`), `ga` placeholder removed from site.json.
**Addresses:** FEATURES.md "Build reliability" + "Unused dependency removal" (P1).
**Avoids:** Pitfall 4 (Node ambiguity), Pitfall 7 (double-lockfile disease), Pitfall 12 (naive dep sweep).

### Phase 2: Core Dependency Upgrade (Gatsby 5.16.1 + dart-sass + CMS/analytics swap)
**Rationale:** The core upgrade. First commit: `node-sass` → `sass` (dart-sass) — separate from the Gatsby bump so the two failure modes are never conflated. Second commit: ALL `gatsby-*` packages in lockstep to the 5.16/6.16/7.16 lines (exact matrix in STACK.md). Same phase: CMS swap (`netlify-cms-app` → `decap-cms-app@3.6.4` + `gatsby-plugin-decap-cms@4.0.4`), Matomo plugin → vendored `_paq` snippet, sitemap dedupe. **Stay on React 18 — explicit non-goal.** First Netlify deploy must be clear-cache; `/admin` login + save-post smoke test after.
**Delivers:** Gatsby 5.16.1 + all plugins lockstep, dart-sass, working Decap CMS admin, Matomo snippet with `disableCookies: true`, single sitemap plugin.
**Uses:** STACK.md version matrix (fully verified — no research needed on versions).
**Avoids:** Pitfalls 1 (no Gatsby 6), 2 (lockstep), 3 (stale cache), 5 (node-sass), 6 (React 19 + CMS), 7 (lockfiles).

### Phase 3: MUI Removal + Form Reliability (parallel with Phase 4)
**Rationale:** Independent of image work — disjoint file sets (formik.js/top-contacts.js/SCSS vs templates/seo.js). MUI v4 is the single largest bundle offender; the form's false-success redirect bug must be fixed in the same commit as the env-var move, or the env change is untestable end-to-end.
**Delivers:** Plain-SCSS form preserving Formik error/helperText UX, `@emailjs/browser` + `GATSBY_EMAILJS_*` env vars + committed `.env.example` + Netlify dashboard vars, false-success redirect fix (redirect only on `.then`; inline error + `setSubmitting(false)` on `.catch`), `react-icons` for the two social icons.
**Addresses:** FEATURES.md "Bundle size reduction" (P1).
**Avoids:** Pitfall 8 (MUI regression + dead-file landmines), Pitfall 10 (env-var silent breakage).

### Phase 4: Image Pipeline Migration + SEO Fixes (parallel with Phase 3)
**Rationale:** Requires Phase 2's sharp/transformer versions. Mechanical swap across 5 files (`post-card.js`, `blog-list-home.js`, `blog-post.js`, `index-page.js`, `blog-list.js`) + `seo.js`. The `getSrc` helper directly fixes the `og:image [object Object]` bug. Never mix with the MUI removal in one commit.
**Delivers:** `gatsby-plugin-image` adoption (`fluid` → `gatsbyImageData` with per-file `CONSTRAINED`/`FULL_WIDTH` mapping), `tracedSVG` removed from `gatsby-remark-images` config, og:image fix via `getSrc` + non-string guard in seo.js, `lang="it"`, optional Head API migration (seo.js is being touched anyway — removes react-helmet + plugin).
**Addresses:** FEATURES.md "Modern image pipeline" + "Correct SEO meta" (P1/P2).
**Avoids:** Pitfall 9 (image semantics + og:image regression).

### Phase 5: Performance Optimization + Asset Cleanup + Final Verification
**Rationale:** Depends on Phases 3+4 (fonts affect LCP/FCP/CLS; images affect LCP/CLS — both must land before final CWV verification). Asset cleanup conflicts with nothing but requires checking `featuredImage:` frontmatter references first.
**Delivers:** Font loading fix (self-host via `@fontsource/parisienne` + `@fontsource/ubuntu` recommended; preconnect + `display=swap` is the minimal fix), asset dedup (8 `.jpg`/`.jpeg` pairs, ~30 unreferenced FB exports, `.xcf` out of `static/`), query dedup (shared fragment between blog-list and blog-list-home), PWA manifest dedup (delete legacy `static/manifest.json` + icons), Matomo `disableCookies: true` + privacy page cleanup, final Lighthouse/PSI verification vs Phase 0 baseline.
**Addresses:** FEATURES.md P1/P2 items (CWV pass, asset cleanup, GDPR, PWA polish).
**Avoids:** Performance traps (render-blocking fonts, 9.6 MB published assets, CLS from un-reserved image dimensions, SW-masked regressions).

### Phase 6 (defer to v2): React 19 + Decap Latest + Head API
**Rationale:** Coupled change — `decap-cms-app` ≥3.7 peers React 19; `react-helmet` breaks on React 19. Only safe after the Head API migration. Requires its own verification: `/admin` login, git-gateway auth, media picker.
**Delivers:** `react@19.2.8`/`react-dom@19.2.8`, `decap-cms-app@3.15.1` (latest), Head API fully landed.
**Avoids:** Pitfall 6 (React 19 + CMS breakage).

### Phase Ordering Rationale

- **Dependency order** (ARCHITECTURE.md): Foundation → Gatsby upgrade → Image adoption (MUI removal parallel) → Performance → CMS swap. The CMS swap collides with Phase 2's config edits, so it is sequenced inside Phase 2 (after the Gatsby bump) rather than as a separate later phase.
- **Pitfall-to-phase mapping** (PITFALLS.md) aligns cleanly: P4/P12 → Phase 1; P1/P2/P3/P5/P6/P7 → Phase 2; P10 → Phase 3; P9 → Phase 4; P11 → Phase 0.
- **Parallelization:** Phases 3 and 4 touch disjoint file sets — safe to run as separate phases or parallel plans.
- **Commit discipline:** each change (deps, sass, MUI, images, emailjs) in its own commit so a regression bisects to one commit; every step is independently revertable, and the static site keeps the last good Netlify deploy live.
- **Synthesis decision:** FEATURES.md lists jest/ESLint as P3, but PITFALLS.md's Phase-0 test scaffolding is adopted — the minimal jest suite is a prerequisite, ESLint stays deferred.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** whether `gatsby-plugin-netlify-cms@7.12.1` installs cleanly against Gatsby 5.16 (if it errors, the Decap swap becomes a prerequisite, not a same-phase step); Decap 3.6.4 vs 3.15.1 functional diff if CMS quirks appear; `netlify-plugin-gatsby-cache` targeting Gatsby 5.x after the upgrade.
- **Phase 3:** EmailJS vs native Netlify form decision (owner preference; the form already carries `data-netlify` attrs — dual-channel conflict documented in CONCERNS.md).
- **Phase 4:** exact `gatsbyImageData` fragment replacements per file (mechanical but must be verified in GraphiQL before build); dart-sass behavior with the nested `@import url(...)` in `_theme-variables.scss` (needs a build test).
- **Phase 5:** font strategy decision (`@fontsource` self-host vs preconnect + stylesheet link).

Phases with standard patterns (skip research-phase):
- **Phase 0:** standard jest + @testing-library/react setup; well-documented.
- **Phase 1:** cleanup patterns are fully documented; repo evidence (CONCERNS.md, git log) is ground truth.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified live against npm registry API + official Gatsby docs + GitHub (2026-08-18); peerDeps/engines/deprecation flags checked for 30+ packages |
| Features | HIGH | web.dev (official CWV thresholds) + official Gatsby docs + local codebase evidence (CONCERNS.md, package.json, SCSS, GraphQL fragments) |
| Architecture | HIGH | npm registry + official Gatsby docs + codebase maps cross-verified; integration points grounded in repo state |
| Pitfalls | HIGH | Official Gatsby/Netlify/Sass docs + repo git history; a few items from training knowledge (node-sass bindings, yarn 1 peer laxity, GATSBY_ prefix) flagged MEDIUM but consistent with docs and repo evidence |

**Overall confidence:** HIGH

### Gaps to Address

- **"Gatsby 6" expectation:** the requirement wording in PROJECT.md ("attempt Gatsby 6") must be corrected in the discuss phase — no v6 exists; target is 5.16.1. This is a requirements change, not a code change.
- **Exact `gatsbyImageData` fragment replacements:** mechanical but must be verified per-file in GraphiQL during Phase 4 planning.
- **dart-sass + nested `@import url()` behavior:** needs a build test in Phase 2; the font fix may need to land in the same phase as the sass swap.
- **`gatsby-plugin-netlify-cms` vs Gatsby 5.16 install:** if it errors, the Decap swap moves earlier (becomes a prerequisite).
- **Matomo replacement:** vendored `_paq` snippet is recommended (zero deps); `@datapunt/matomo-tracker-react` is the alternative if typed tracking calls are wanted — quick spike if needed.
- **EmailJS vs native Netlify form:** owner decision; the dual-channel form-name conflict is documented in CONCERNS.md.
- **Font strategy:** `@fontsource` self-host is recommended (no third-party origin, GDPR-friendly); preconnect + `display=swap` is the minimal fix.
- **`netlify-plugin-gatsby-cache`:** verify it targets Gatsby 5.x correctly in the deploy phase.

## Sources

### Primary (HIGH confidence)
- **npm registry API** (queried live 2026-08-18) — authoritative versions, dist-tags, peerDependencies, engines, deprecation flags for all 30+ packages (gatsby 5.16.1 latest; decap-cms-app 3.6.4/3.15.1 peers; sass 1.102.0; @emailjs/browser 4.4.1; etc.)
- **Gatsby official docs** — release-notes index (no v6 page), v5.16 release notes (React 19 + Node 24 support), version-support page (v5 = Active LTS), image migration guide (fluid→fullWidth/constrained, tracedSVG removal, getSrc for SEO), gatsby-plugin-image reference, gatsby-plugin-sass, upgrade guide (lockstep gatsby-* rule)
- **GitHub API** — gatsbyjs/gatsby releases (latest 5.16.1, 2026-02-10); kremalicious/gatsby-plugin-matomo archived (Dec 2024); decaporg repos
- **Netlify official docs** — Node version resolution (NODE_VERSION/.nvmrc precedence), yarn auto-detection, dependency-cache behavior and clear-cache advice
- **Sass official docs** — `@import` deprecation (1.80.0+), breaking-changes index, 2.0 not yet released
- **web.dev** — Web Vitals thresholds (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1), LCP/CLS optimization, font best practices (WOFF2, self-hosting, subsetting)
- **Local codebase evidence** — CONCERNS.md, codebase maps (ARCHITECTURE.md, STRUCTURE.md), package.json, git log (recurring "Fixed build" commits), `_theme-variables.scss`, GraphQL fragments

### Secondary (MEDIUM confidence)
- **gatsby-plugin-decap-cms README** — "Gatsby v5 and Decap CMS 3.x require gatsby-plugin-decap-cms@^4.0.0" (HIGH for compat); maintenance status MEDIUM (last push Feb 2024)
- **gatsby-plugin-netlify-cms-paths@1.3.0** — CMS-agnostic behavior inferred from its remark-integration design; unmaintained since 2019
- **Training knowledge** (flagged) — node-sass 9 prebuilt-binary range and gyp fallback; yarn 1 peer laxity vs npm 7+ ERESOLVE; Gatsby `GATSBY_` env-var prefix rule; gatsby-plugin-offline stale-SW behavior; MUI v4 bundle weight — consistent with official docs and repo history

### Tertiary (LOW confidence)
- **Exact dart-sass behavior with nested `@import url()` in `_theme-variables.scss`** — needs a build test in Phase 2
- **`netlify-plugin-gatsby-cache` behavior after the Gatsby 5.16 upgrade** — verify against Netlify plugin docs in the deploy phase
- **Inlining `gatsby-plugin-netlify-cms-paths` logic into `gatsby-node.js`** — behavior identical per code inspection (~50 lines), but unverified in production

---
*Research completed: 2026-08-18*
*Ready for roadmap: yes*
