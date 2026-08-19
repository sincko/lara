# Requirements: LaryArt

**Defined:** 2026-08-18
**Core Value:** Visitors can browse the artisan's work and blog, and contact the artisan through the contact form — the site must always build and deploy reliably.

## v1 Requirements

Requirements for milestone v1.0 (Updates, Debugging and Refinements). Each maps to roadmap phases.

### Foundation

- [x] **FNDT-01**: Repo has a single package manager (yarn) — package-lock.json removed, yarn.lock is the only lockfile
- [x] **FNDT-02**: Node version is unambiguous — netlify.toml NODE_VERSION removed or aligned with .nvmrc (Node 22 LTS)
- [x] **FNDT-03**: Dead components removed (old-form.js, form-pulito.js)
- [x] **FNDT-04**: Unused dependencies removed (codemirror, seamless-immutable, redux, react-refresh, typescript, gatsby-background-image, y18n, prismjs, package-doctor, acorn, yarn-as-dep) — verified with `yarn why` per removal
- [x] **FNDT-05**: Minimal test suite scaffolded (jest + testing-library) covering form validation, pagination math, and page creation
- [x] **FNDT-06**: Performance baseline captured (Lighthouse + PSI on live site) before any changes

### Upgrade

- [x] **UPGR-01**: Gatsby upgraded to 5.16.1 (latest stable) with all gatsby-* plugins in lockstep (one commit, exact version matrix)
- [x] **UPGR-02**: node-sass replaced with dart-sass (sass ^1.30.0) — build passes locally and on Netlify
- [x] **UPGR-03**: netlify-cms-app replaced with decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4 — /admin works
- [x] **UPGR-04**: gatsby-plugin-matomo replaced with vendored _paq snippet in gatsby-browser.js (with disableCookies: true)
- [x] **UPGR-05**: emailjs-com replaced with @emailjs/browser v4
- [x] **UPGR-06**: gatsby-plugin-advanced-sitemap replaced or removed (deprecated)
- [x] **UPGR-07**: First post-upgrade Netlify deploy runs with cleared cache

### Form

- [x] **FORM-01**: MUI v4 removed (core + icons) — contact form uses plain CSS with existing SCSS theme variables
- [x] **FORM-02**: Formik error/helperText UX preserved in the plain-CSS replacement
- [x] **FORM-03**: EmailJS key moved to GATSBY_* environment variable — no hardcoded key in source; .env.example committed
- [x] **FORM-04**: False-success bug fixed — form no longer reports success when email send fails

### Images

- [ ] **IMAG-01**: gatsby-image migrated to gatsby-plugin-image across all templates/components (blog-post, index-page, blog-list, post-card, blog-list-home)
- [ ] **IMAG-02**: tracedSVG config removed; BLURRED/DOMINANT_COLOR placeholders used
- [ ] **IMAG-03**: og:image bug fixed via getSrc() — no more [object Object] in meta tags

### SEO

- [ ] **SEOS-01**: html lang set to "it" (not en-US); redundant hreflang alternates removed
- [ ] **SEOS-02**: Hardcoded English starter meta replaced with real Italian descriptions
- [ ] **SEOS-03**: Privacy page HTML cleaned up — valid markdown, no broken fragments
- [x] **SEOS-04**: Stale site.json ga placeholder removed; README rewritten for laryart.it

### Performance

- [ ] **PERF-01**: Font loading fixed — self-hosted WOFF2 (@fontsource) or preconnect + display=swap; no nested @import url() in :root
- [ ] **PERF-02**: Asset cleanup — dedup .jpg/.jpeg pairs, remove unreferenced files, move .xcf out of static/
- [ ] **PERF-03**: Legacy PWA manifest dedup (delete static/manifest.json + legacy icons)
- [ ] **PERF-04**: Final Core Web Vitals verification — LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at 75th percentile, improved vs baseline

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Modernization

- **MODR-01**: React 19 + decap-cms-app latest (3.15.1) — coupled change, own verification phase
- **MODR-02**: Gatsby Head API migration (replaces react-helmet)
- **MODR-03**: ESLint flat config

## Out of Scope

| Feature | Reason |
|---------|--------|
| New features/content sections | Milestone is maintenance/refactoring only |
| Visual redesign | Keep existing design language |
| Migration away from Netlify | Deployment stays on Netlify |
| Removing Netlify/Decap CMS | Content editing stays |
| TypeScript migration | Not needed for site size |
| Preact / Partial Hydration / Slices | Enterprise-scale, wrong fit |
| web-vitals RUM | Overkill for small site |
| Gatsby Cloud Image CDN | Netlify deployment |
| Rewrite to Next.js/Remix | No reason to change framework |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDT-01 | Phase 2 | Complete |
| FNDT-02 | Phase 2 | Complete |
| FNDT-03 | Phase 2 | Complete |
| FNDT-04 | Phase 2 | Complete |
| FNDT-05 | Phase 1 | Complete |
| FNDT-06 | Phase 1 | Complete |
| UPGR-01 | Phase 3 | Complete |
| UPGR-02 | Phase 3 | Complete |
| UPGR-03 | Phase 3 | Complete |
| UPGR-04 | Phase 3 | Complete |
| UPGR-05 | Phase 4 | Complete |
| UPGR-06 | Phase 3 | Complete |
| UPGR-07 | Phase 3 | Complete |
| FORM-01 | Phase 4 | Complete |
| FORM-02 | Phase 4 | Complete |
| FORM-03 | Phase 4 | Complete |
| FORM-04 | Phase 4 | Complete |
| IMAG-01 | Phase 5 | Pending |
| IMAG-02 | Phase 5 | Pending |
| IMAG-03 | Phase 5 | Pending |
| SEOS-01 | Phase 5 | Pending |
| SEOS-02 | Phase 5 | Pending |
| SEOS-03 | Phase 5 | Pending |
| SEOS-04 | Phase 2 | Complete |
| PERF-01 | Phase 6 | Pending |
| PERF-02 | Phase 6 | Pending |
| PERF-03 | Phase 6 | Pending |
| PERF-04 | Phase 6 | Pending |

**Coverage:**

- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-18*
*Last updated: 2026-08-18 after roadmap creation (traceability mapped)*
