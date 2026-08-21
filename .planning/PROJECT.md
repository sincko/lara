# LaryArt

## What This Is

LaryArt is the personal website for laryart.it — an Italian artisan who creates handmade decoupage and art objects. The site is a static Gatsby 5 + React 18 site with a blog, informational pages (home, about, privacy, contacts), a contact form, and Decap CMS for content editing. Content is authored in Markdown with YAML frontmatter and served via Netlify.

## Core Value

Visitors can browse the artisan's work and blog, and contact the artisan through the contact form — the site must always build and deploy reliably.

## Business Context

- **Customer**: Visitors of laryart.it (Italian-speaking audience interested in handmade decoupage/art objects)
- **Revenue model**: None — personal/hobby showcase site
- **Success metric**: Site builds and deploys without errors; contact form delivers messages
- **Strategy notes**: None

## Requirements

### Validated

- ✓ Static site generation with Gatsby 5.16.1 + React 18 — v1.0
- ✓ Blog with 19 posts, pagination, post pages — v1.0
- ✓ Informational pages (index, laryart, privacy, contatti) — v1.0 (privacy page rebuilt as clean markdown)
- ✓ Contact form (Formik + yup + @emailjs/browser + plain SCSS) — v1.0 (MUI removed, false-success fixed, env-var creds)
- ✓ Decap CMS content editing — v1.0 (fork mantenuto di Netlify CMS)
- ✓ SEO meta (helmet, OG/Twitter cards, sitemap; lang="it", no hreflang, real Italian descriptions) — v1.0
- ✓ SCSS styling with theme variables — v1.0
- ✓ GA4 analytics (vendored gtag, anonymize_ip) — v1.0 (owner decision, replaces Matomo)
- ✓ Test suite (jest + @testing-library/react, 10 suites / 85 tests) — v1.0
- ✓ Performance baseline (Lighthouse median 3, mobile) — v1.0
- ✓ Performance optimized (LCP −52%/−70%/−71%, perf 100/100/100) — v1.0
- ✓ gatsby-plugin-image migration (all surfaces, BLURRED/DOMINANT_COLOR) — v1.0
- ✓ Core Web Vitals targets met (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at 75th pct) — v1.0 (Phase 6)

### Active

- (none — all v1.0 requirements shipped)

### Out of Scope

- New features/content sections — maintenance/refactoring only
- Redesign of visual identity — keep existing design language
- Migration away from Netlify — deployment stays on Netlify
- Removing Decap CMS — content editing stays
- TypeScript migration — not needed for site size

## Context

- v1.0 shipped 2026-08-21: 6 phases, 27 plans, 59 tasks, 345 files changed.
- Tech stack: Gatsby 5.16.1, React 18, plain JS (no TS in src/), SCSS (dart-sass), Decap CMS, gatsby-plugin-image 3.16.0, @fontsource (self-hosted), GA4.
- Remaining known tech debt: SCSS bugs CR-01 (stray © in .home-posts) and CR-02 (mobile pagination media query), English month names in post dates (`MMMM DD, YYYY`), privacy-page links that don't open target=_blank (G-05-1a — user declined fix), `process.exit` stdout race in check-unreferenced.js, GREP_ROOTS blind spot in the deletion script.
- Deferred (v2): React 19 + decap-cms-app latest, Gatsby Head API, ESLint flat config, Preact/Partial Hydration/Slices, web-vitals RUM, Gatsby Cloud Image CDN, Next.js/Remix rewrite.

## Constraints

- **Tech stack**: Gatsby 5.16.1 (latest stable), React 18, Decap CMS
- **Package manager**: Yarn 1.22.22 — single lockfile (yarn.lock)
- **Deployment**: Netlify — build must keep working
- **Language**: Italian site content — UI copy and SEO meta must be Italian
- **Compatibility**: Node 24 per `.nvmrc` (enforced via engines + engine-strict + check-node-version.js)
- **Security**: No secrets in source — emailjs creds in GATSBY_* env vars; .env.example documents the contract

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gatsby 5.16.1 lockstep matrix | Latest stable; all gatsby-* plugins at .16.0 | ✓ Done (Phase 3) |
| dart-sass replaces node-sass | node-sass EOL, no Node 24 binary | ✓ Done (Phase 3) |
| Decap CMS replaces Netlify CMS | netlify-cms-app EOL | ✓ Done (Phase 3) |
| GA4 replaces Matomo | matomo.duckdns.org unreachable | ✓ Done (Phase 3, owner) |
| Single sitemap plugin | advanced-sitemap unmaintained | ✓ Done (Phase 3) |
| Node 24 bump | Owner choice; safe after dart-sass | ✓ Done (Phase 3) |
| MUI v4 → plain CSS | MUI v4 unmaintained | ✓ Done (Phase 4) |
| emailjs key → env var | Remove hardcoded secret | ✓ Done (Phase 4) |
| gatsby-plugin-image 3.16.0 | Registry-verified (no 5.x exists) | ✓ Done (Phase 5) |
| @fontsource self-hosting | Removes Google Fonts third-party + render-blocking | ✓ Done (Phase 6) |
| Asset cleanup via reference-grep script | Auditable deletion source of truth | ✓ Done (Phase 6) |
| G-05-1a privacy links | User declined the dependency install; links left as-is | ⚠️ Revisit (deferred) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 2026-08-21 after v1.0 milestone*
