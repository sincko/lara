# LaryArt

## What This Is

LaryArt is the personal website for laryart.it — an Italian artisan who creates handmade decoupage and art objects. The site is a static Gatsby 5 + React 18 site with a blog, informational pages (home, about, privacy, contacts), a contact form, and Netlify CMS for content editing. Content is authored in Markdown with YAML frontmatter and served via Netlify.

## Core Value

Visitors can browse the artisan's work and blog, and contact the artisan through the contact form — the site must always build and deploy reliably.

## Business Context

- **Customer**: Visitors of laryart.it (Italian-speaking audience interested in handmade decoupage/art objects)
- **Revenue model**: None — personal/hobby showcase site
- **Success metric**: Site builds and deploys without errors; contact form delivers messages
- **Strategy notes**: None

## Requirements

### Validated

- ✓ Static site generation with Gatsby 5.15 + React 18 — existing
- ✓ Blog with 19 posts, pagination, post pages — existing
- ✓ Informational pages (index, laryart, privacy, contatti) — existing
- ✓ Contact form (Formik + yup + emailjs + MUI) — existing
- ✓ Netlify CMS content editing — existing
- ✓ SEO meta (helmet, OG/Twitter cards, sitemap) — existing
- ✓ SCSS styling with theme variables — existing
- ✓ Matomo analytics — existing
- ✓ Test suite (jest + @testing-library/react, 4 suites) — Phase 1
- ✓ Performance baseline (Lighthouse median 3, mobile) — Phase 1

### Active

- [ ] Resolve all documented codebase concerns (dead code, stale config, broken privacy page, SEO/lang fixes)
- [ ] Upgrade dependencies to latest versions (Gatsby 5.16.1; drop MUI v4 in favor of plain CSS)
- [ ] Single package manager (yarn) — remove package-lock.json
- [ ] Move hardcoded emailjs key to environment variable
- [ ] Optimize website performance (Core Web Vitals, images, bundle size)

### Out of Scope

- New features/content sections — this milestone is maintenance/refactoring only
- Redesign of visual identity — keep existing design language
- Migration away from Netlify — deployment stays on Netlify
- Removing Netlify CMS — content editing stays

## Context

- Codebase mapped 2026-08-18 (`.planning/codebase/`): Gatsby 5.15.0, React 18, plain JS (no TS in src/), SCSS, Netlify CMS, MUI v4 (legacy), emailjs, Matomo.
- CONCERNS.md documents: dead components (`old-form.js`, `form-pulito.js`), unused dependencies (codemirror, seamless-immutable, redux, react-refresh, typescript, gatsby-background-image, y18n, prismjs, package-doctor), double lockfiles (yarn.lock + package-lock.json), stale starter remnants (site.json `ga` placeholder, README, hardcoded English meta in blog-list.js, `html lang="en-US"` in seo.js), commented-out config, malformed privacy page HTML, hardcoded emailjs key in `src/components/formik.js:8`, index keys in navigation.js.
- Netlify config: `netlify.toml` sets stale `NODE_VERSION = "10"` (incompatible with Gatsby 5/node-sass 9); build relies on `.nvmrc` (Node 20).
- No test framework exists (`yarn test` is the starter placeholder that exits 1).
- Git history shows repeated dependency churn to fix Netlify build errors.

## Constraints

- **Tech stack**: Gatsby (5 → possibly 6), React 18, Netlify CMS — keep Netlify CMS
- **Package manager**: Yarn 1.22.22 — single source of truth; remove package-lock.json
- **Deployment**: Netlify — build must keep working
- **Language**: Italian site content — UI copy and SEO meta must be Italian
- **Compatibility**: Node 20 per `.nvmrc`; `netlify.toml` NODE_VERSION must be fixed
- **Security**: No secrets in source — emailjs key must move to env var

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Attempt Gatsby 6 upgrade | Latest major; user opted in despite breaking changes | — Pending |
| Replace MUI v4 with plain CSS | MUI v4 unmaintained; only TextField/Button used in contact form | — Pending |
| Yarn as single package manager | package.json declares yarn 1.22.22; Netlify prefers yarn.lock | — Pending |
| Keep Netlify CMS | Content editing workflow stays | — Pending |
| emailjs key → env var | Remove hardcoded secret from source | — Pending |
| Include website optimization | User opted in | — Pending |

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
*Last updated: 2026-08-19 after Phase 1 completion*
