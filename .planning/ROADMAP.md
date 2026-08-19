# Roadmap: LaryArt

## Overview

Milestone v1.0 (Updates, Debugging and Refinements) modernizes the laryart.it Gatsby 5.15 site without new features or visual redesign: scaffold a regression net and capture a performance baseline first, clean up the foundation (lockfile, Node config, dead code/deps), upgrade the core stack to Gatsby 5.16.1 — the latest stable; Gatsby 6 does not exist — with modern build tooling (dart-sass, Decap CMS, vendored Matomo), replace MUI v4 with a plain-SCSS contact form that reports errors honestly, migrate images to gatsby-plugin-image with correct Italian SEO meta, and finish with font/asset/PWA cleanup verified against the baseline Core Web Vitals. The site must keep building and deploying reliably throughout.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Test Scaffolding + Performance Baseline** - Regression net (jest + testing-library) and pre-change Lighthouse/PSI baseline
- [ ] **Phase 2: Foundation Cleanup** - Single lockfile, unambiguous Node version, dead code and dependencies removed
- [ ] **Phase 3: Core Upgrade** - Gatsby 5.16.1 lockstep, dart-sass, Decap CMS, vendored Matomo, single sitemap
- [ ] **Phase 4: MUI Removal + Form Reliability** - Plain-SCSS contact form, @emailjs/browser + env vars, false-success bug fixed
- [ ] **Phase 5: Image Pipeline + SEO Fixes** - gatsby-plugin-image migration, og:image fix, Italian SEO meta and valid pages
- [ ] **Phase 6: Performance + Asset Cleanup + Final Verification** - Fonts, assets, PWA manifest cleaned; CWV verified vs baseline

## Phase Details

### Phase 1: Test Scaffolding + Performance Baseline

**Goal**: The repo has a real regression net and a recorded performance baseline before anything changes
**Depends on**: Nothing (first phase)
**Requirements**: FNDT-05, FNDT-06
**Success Criteria** (what must be TRUE):

  1. `yarn test` exits 0 and runs a real jest + @testing-library/react suite — no longer the failing starter placeholder
  2. The suite covers form validation, the form submit failure path, pagination math, and page creation, with at least one passing assertion each
  3. Lighthouse + PSI baseline (median of 3, mobile) for LCP, CLS, and INP is captured on the live site before any dependency or code changes
  4. Baseline results are stored in `.planning/` so Phase 6 can compare against them

**Plans**: 4 plans

```
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Jest pipeline tracer: install pinned devDeps, official Gatsby scaffold (manual __mocks__/gatsby.js — D-01 mechanism swap), formik validation suite + D-05 failure-path regression (it.skip)
- [ ] 01-03-PLAN.md — Baseline tooling: capture-baseline.js (Lighthouse 13.4.1 + PSI 429 fallback), median.js, methodology README

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Remaining FNDT-05 suites: blog-list pagination math, navigation toggle, gatsby-node createPages (node env)
- [ ] 01-04-PLAN.md — Full baseline capture (3 URLs × 3 runs × 2 sources, mobile) + BASELINE.md medians, checkpoint-gated

```

### Phase 2: Foundation Cleanup

**Goal**: The repo state is unambiguous — one lockfile, one Node version, no dead code or unused dependencies
**Depends on**: Phase 1
**Requirements**: FNDT-01, FNDT-02, FNDT-03, FNDT-04, SEOS-04
**Success Criteria** (what must be TRUE):

  1. `package-lock.json` is deleted; `yarn install` resolves from yarn.lock as the only lockfile and `yarn build` still passes
  2. `netlify.toml` no longer pins the stale `NODE_VERSION = "10"`; `.nvmrc` is the single source of truth and Netlify builds with it
  3. `old-form.js` and `form-pulito.js` are deleted with no remaining imports; the site builds and renders as before
  4. Every listed unused dependency is removed, each removal verified via `yarn why`; `yarn install` succeeds with no dangling references
  5. The site.json `ga` placeholder is gone and the README describes laryart.it accurately — no starter boilerplate remains

**Plans**: TBD

### Phase 3: Core Upgrade

**Goal**: The site runs on Gatsby 5.16.1 (latest stable) with modern build tooling — dart-sass, Decap CMS, vendored Matomo, single sitemap
**Depends on**: Phase 2
**Requirements**: UPGR-01, UPGR-02, UPGR-03, UPGR-04, UPGR-06, UPGR-07
**Success Criteria** (what must be TRUE):

  1. `gatsby clean && yarn build` passes locally on the exact 5.16.1 matrix — Gatsby core and all gatsby-* plugins upgraded in lockstep in one commit
  2. The first post-upgrade Netlify deploy (cache cleared) succeeds; all pages on laryart.it render without build errors
  3. Content editor can open /admin, log in, and save a post through Decap CMS (netlify-cms-app fully replaced)
  4. Site analytics keep recording visits via the vendored Matomo `_paq` snippet with disableCookies enabled (gatsby-plugin-matomo removed)
  5. sitemap.xml is generated by exactly one plugin (advanced-sitemap removed/replaced) and lists the site's pages

**Plans**: TBD

### Phase 4: MUI Removal + Form Reliability

**Goal**: The contact form is lightweight plain-SCSS, keeps its validation UX, and only reports success when the email actually sends
**Depends on**: Phase 3 (parallelizable with Phase 5)
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, UPGR-05
**Success Criteria** (what must be TRUE):

  1. Contact form renders without MUI — styled with existing SCSS theme variables; MUI core + icons removed from package.json and the build passes
  2. Formik validation UX is preserved: field errors and helper texts appear exactly as before the removal
  3. No hardcoded emailjs key remains in source; the form works via GATSBY_* env vars, and `.env.example` is committed
  4. Failed email send shows an inline error and the form stays on the page — no false success; the success message and redirect only happen on `.then`
  5. Successful email send still shows the success state and redirects as before — the emailjs-com → @emailjs/browser v4 swap works end-to-end

**Plans**: TBD
**UI hint**: yes

### Phase 5: Image Pipeline + SEO Fixes

**Goal**: Images render through gatsby-plugin-image with proper placeholders, and the site exposes correct Italian SEO meta and valid pages
**Depends on**: Phase 3 (parallelizable with Phase 4)
**Requirements**: IMAG-01, IMAG-02, IMAG-03, SEOS-01, SEOS-02, SEOS-03
**Success Criteria** (what must be TRUE):

  1. All image usage across templates/components (blog-post, index-page, blog-list, post-card, blog-list-home) renders via gatsby-plugin-image with BLURRED/DOMINANT_COLOR placeholders — no gatsby-image imports remain
  2. Sharing any page shows a real og:image URL in the social meta — no [object Object] in the rendered HTML
  3. Page source shows `<html lang="it">` and no redundant hreflang alternates
  4. Every page exposes a real Italian meta description — no hardcoded English starter text in the rendered source
  5. The privacy page renders as valid, clean content — no malformed HTML or broken fragments

**Plans**: TBD
**UI hint**: yes

### Phase 6: Performance + Asset Cleanup + Final Verification

**Goal**: The site is measurably faster — fonts, assets, and PWA config cleaned up, Core Web Vitals verified against the Phase 1 baseline
**Depends on**: Phases 4 and 5 (and thus 1–3)
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):

  1. Fonts no longer block rendering — self-hosted WOFF2 or preconnect + display=swap; no nested `@import url()` remains in the SCSS
  2. The published asset set is deduplicated and lean: no .jpg/.jpeg duplicate pairs, no unreferenced files, `.xcf` files moved out of static/
  3. Exactly one PWA manifest is served — legacy static/manifest.json and old icons deleted
  4. Final CWV verification on the live site: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at 75th percentile (median of 3, mobile), all improved vs the Phase 1 baseline
  5. All pages load correctly after asset cleanup — build passes and no page shows broken images or missing content

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order; Phases 4 and 5 touch disjoint file sets and may run in parallel: 1 → 2 → 3 → (4 ∥ 5) → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Test Scaffolding + Performance Baseline | 0/4 | Not started | - |
| 2. Foundation Cleanup | TBD | Not started | - |
| 3. Core Upgrade | TBD | Not started | - |
| 4. MUI Removal + Form Reliability | TBD | Not started | - |
| 5. Image Pipeline + SEO Fixes | TBD | Not started | - |
| 6. Performance + Asset Cleanup + Final Verification | TBD | Not started | - |
