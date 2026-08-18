# Architecture Research

**Domain:** Gatsby static-site modernization (Gatsby 5.15 → latest, gatsby-plugin-image adoption, MUI v4 removal, performance optimization)
**Researched:** 2026-08-18
**Confidence:** HIGH (npm registry + official Gatsby docs cross-verified)

## Critical Finding: "Gatsby 6" Does Not Exist

The milestone asks for a "Gatsby 6 migration." **Verified as of 2026-08-18: there is no Gatsby 6.**

| Evidence | Source | Result |
|----------|--------|--------|
| npm `dist-tags.latest` for `gatsby` | npm registry | `5.16.1` |
| Official release notes index | gatsbyjs.com/docs/reference/release-notes/ | Latest entry: **v5.16** (Jan 2026); no v6 page |
| `/docs/reference/release-notes/v6.0/` | gatsbyjs.com | HTTP 404 |
| Gatsby Framework Version Support | gatsbyjs.com/docs/reference/release-notes/gatsby-version-support/ | v5 = "Active Long-term Support"; v6 not listed |
| npm pre-release tags | npm registry | `5.17.0-next.1`, `5.18.0-react19.1` (pre-release only) |

**Consequence for the roadmap:** the "Gatsby 6 migration" becomes a **Gatsby 5.15.0 → 5.16.1 upgrade** (latest stable), with an optional React 19 bump (supported since 5.16.0, Jan 2026). This is a **dependency upgrade with verification, not an architectural migration** — the plugin system, GraphQL data layer, config format, and `gatsby-node.js` API are unchanged between 5.15 and 5.16. The architecture below therefore focuses on the real architectural work in this milestone: **gatsby-plugin-image adoption, MUI v4 removal, and performance restructuring** — all of which are genuine component/data-flow changes.

**Recommendation:** reframe the milestone requirement from "attempt Gatsby 6" to "upgrade to Gatsby 5.16.x (latest stable) + optionally React 19." Do NOT chase the `5.17.0-next` / `5.18.0-react19` pre-release tags — they are canary builds. Stay on React 18 for this milestone (see Risks).

---

## Target Architecture (post-migration)

The five-layer architecture is preserved. What changes is *inside* the Data Layer (image resolver), the Presentation Layer (image components, form, icons), and the plugin wiring.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        Content Layer (Markdown)                       │
│   src/content/pages/ + src/content/posts/ + src/util/site.json      │
│   static/assets/ (61 files — 9.6 MB, ~30 unreferenced, 8 dup pairs) │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ gatsby-source-filesystem (×2)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Gatsby Data Layer (GraphQL)                        │
│   gatsby-transformer-remark 6.16 → MarkdownRemark nodes  [UNCHANGED] │
│   gatsby-transformer-sharp 5.16 → sharp nodes              [UNCHANGED]│
│   gatsby-plugin-sharp 5.16 (defaults for gatsbyImageData)  [UNCHANGED]│
│   gatsby-plugin-image 3.16 → gatsbyImageData resolver      [NEW]      │
│   gatsby-config.js — plugin wiring                         [MODIFIED] │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ createPages (build time) — UNCHANGED
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Page Generation Layer                              │
│   gatsby-node.js — createPages + pagination                [UNCHANGED]│
│   src/templates/ — 6 templates, queries rewritten           [MODIFIED]│
│   src/pages/ — 404.js, thanks.js                            [UNCHANGED]│
└──────────────────────────────┬──────────────────────────────────────┘
                               │ React hydration
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Presentation Layer (React)                          │
│   src/components/ — post-card, blog-list-home, seo          [MODIFIED]│
│   src/components/ — formik (MUI→plain), top-contacts (icons)[MODIFIED]│
│   src/components/ — old-form.js, form-pulito.js               [DELETE] │
│   src/assets/scss/ — form styles, font loading               [MODIFIED]│
└──────────────────────────────┬──────────────────────────────────────┘
                               │ static export
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Output / Deployment                                │
│   public/ → Netlify (netlify.toml NODE_VERSION fix)        [MODIFIED]│
│   Netlify CMS admin — netlify-cms-app → decap-cms           [MODIFIED]│
└─────────────────────────────────────────────────────────────────────┘
```

### What Stays vs What Changes (explicit)

| Area | Status | Detail |
|------|--------|--------|
| `gatsby-node.js` (createPages, pagination, onCreateNode) | **UNCHANGED** | Page creation queries `allMarkdownRemark`; unaffected by image/plugin changes |
| Content frontmatter contract (`template`, `slug`, `featuredImage`, …) | **UNCHANGED** | No content edits needed; `featuredImage` paths stay `/assets/...` |
| `static/admin/config.yml` | **UNCHANGED** | Decap CMS is config-compatible with Netlify CMS |
| Templates' GraphQL queries | **MODIFIED** | `fluid` fragments → `gatsbyImageData` resolver args (4 files) |
| Image rendering | **MODIFIED** | `gatsby-image` `Img` → `gatsby-plugin-image` `GatsbyImage`/`getImage` (4 files) |
| `src/components/seo.js` | **MODIFIED** | og:image fix via `getSrc` (fixes the `[object Object]` bug); `lang="it"` |
| `src/components/formik.js` | **MODIFIED** | MUI TextField/Button → plain inputs + SCSS; `emailjs-com` → `@emailjs/browser`; env-var keys; fix false-success redirect |
| `src/components/top-contacts.js` | **MODIFIED** | MUI icons → react-icons (already a dependency) or inline SVG |
| `src/assets/scss/` | **MODIFIED** | Form styles for replaced MUI components; font `@import` moved out of `:root` |
| `gatsby-config.js` | **MODIFIED** | Add `gatsby-plugin-image`; remove `gatsby-plugin-advanced-sitemap`; swap matomo plugin; swap CMS plugin |
| `netlify.toml` | **MODIFIED** | `NODE_VERSION = "10"` → `"20"` (matches `.nvmrc`) |
| `package.json` / lockfiles | **MODIFIED** | Gatsby 5.16.1, sass (dart-sass), remove dead deps, single lockfile (yarn) |
| `src/components/old-form.js`, `form-pulito.js` | **DELETE** | Dead code (CONCERNS.md) |
| `static/manifest.json` + legacy icons | **DELETE** | Duplicate of `gatsby-plugin-manifest` output |
| `src/pages/404.js`, `thanks.js`, Layout/Header/Footer/Navigation | **UNCHANGED** | No functional change (inline styles cleanup optional) |

---

## Component Responsibilities (post-migration)

| Component | Responsibility | Change Type |
|-----------|----------------|-------------|
| `gatsby-config.js` | Plugin wiring; siteMetadata from `src/util/site.json` | Modified (plugin list) |
| `gatsby-node.js` | Page creation from frontmatter; blog pagination | Unchanged |
| `gatsby-transformer-remark` 6.16 | Markdown → MarkdownRemark nodes (remark plugins: netlify-cms-paths, images, responsive-iframe, prismjs) | Unchanged (version bump) |
| `gatsby-plugin-image` 3.16 | `gatsbyImageData` resolver + `GatsbyImage`/`StaticImage` components | **New** |
| `gatsby-plugin-sharp` 5.16 | Image processing; default `gatsbyImageData` options | Unchanged (version bump) |
| `src/templates/blog-post.js` | Post page; featured image; prev/next | Modified (image query + component) |
| `src/templates/index-page.js` | Homepage; featured image | Modified (image query + component) |
| `src/templates/blog-list.js` | Paginated blog index; post cards | Modified (query fragment shared with blog-list-home) |
| `src/components/post-card.js` | Blog post card image | Modified (image component) |
| `src/components/blog-list-home.js` | Homepage latest-6 posts | Modified (query dedup + image) |
| `src/components/seo.js` | Helmet meta/OG/Twitter; `lang` | Modified (getSrc for og:image, `lang="it"`) |
| `src/components/formik.js` | Contact form (Formik + yup + emailjs) | Modified (MUI removal, env keys, error handling) |
| `src/components/top-contacts.js` | WhatsApp/Facebook links | Modified (icon swap) |
| `src/assets/scss/style.scss` + partials | All styling; CSS custom props theming | Modified (form styles, font import) |
| `static/admin/config.yml` | CMS collections/schema | Unchanged (works with Decap) |
| `netlify.toml` | Build config | Modified (NODE_VERSION) |

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `gatsby-config.js` ↔ plugins | Plugin registration array | The single wiring point for: `gatsby-plugin-image` (add), `gatsby-plugin-sass` (keep, dep swap), sitemap (dedupe), matomo (replace), CMS plugin (swap) |
| `gatsby-transformer-remark` → templates | GraphQL `markdownRemark`/`allMarkdownRemark` | Query shapes change only where `fluid` fragments appear; `html` field untouched |
| `gatsby-transformer-sharp` → templates/components | GraphQL `childImageSharp.gatsbyImageData` | **The main data-flow change**: `fluid(maxWidth, maxHeight, quality)` → `gatsbyImageData(layout:, width:, height:, quality:)` |
| Templates ↔ `PostCard` | Props: `data` node | `PostCard` receives the node; its internal query fragment must be updated once and both consumers (blog-list, blog-list-home) inherit the change |
| Templates ↔ `Seo` | Props: `image` | **Bug fix point**: pass `getSrc(...)` string, not the fluid object; Seo should ignore non-string values |
| `formik.js` ↔ SCSS | CSS classes (`contact_form`, `item`, `textarea`) | MUI components carry their own styles; plain inputs need SCSS classes — the `.item` wrappers already exist, only input/button styling is new |
| `formik.js` ↔ emailjs | `@emailjs/browser` API | `emailjs.init()` at module scope → move to env-var-driven init; `sendForm` signature unchanged in v4 |
| `top-contacts.js` ↔ react-icons | Icon components | `react-icons/ri` already used site-wide; add `react-icons/fa` (FaFacebook, FaWhatsapp) — no new dependency |
| `static/admin/config.yml` ↔ CMS package | Config file read by `gatsby-plugin-decap-cms` | Config-compatible; only the plugin + package swap |
| `netlify.toml` ↔ build | `NODE_VERSION` env | Must match `.nvmrc` (20); stale "10" breaks builds on cache wipe |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Netlify (deploy) | `netlify.toml` + git push | Build must keep working; `netlify-plugin-gatsby-cache` plugin present |
| Netlify Identity + Git Gateway | CMS auth (config.yml) | Unchanged by Decap migration |
| EmailJS | `@emailjs/browser` client SDK | Keys → `GATSBY_EMAILJS_*` env vars; keep `data-netlify` fallback or drop it (decide one channel) |
| Matomo | `gatsby-plugin-matomo` (deprecated) | Needs replacement: `matomo-tracker` (2.2.4, maintained) or manual `gatsby-browser.js` script injection; `disableCookies: false` is a GDPR risk |
| Google Fonts | `@import url(...)` in SCSS | Render-blocking; move to `<link preconnect>` + `font-display: swap` or self-host via `@fontsource` |

---

## Data Flow Changes

### 1. Image data flow (the only real data-layer change)

```
Before (gatsby-image v3):
  frontmatter.featuredImage → childImageSharp.fluid { src, srcSet, ... }
  → <Img fluid={...} />  (class component, no native lazy/AVIF)

After (gatsby-plugin-image):
  frontmatter.featuredImage → childImageSharp.gatsbyImageData(layout: CONSTRAINED, width: 540, quality: 80)
  → const image = getImage(data.frontmatter.featuredImage)
  → <GatsbyImage image={image} alt={...} />
  → seo: getSrc(image) → og:image URL string
```

Mapping rules (official migration guide):
- `fluid(maxWidth: 540, maxHeight: 360)` → `gatsbyImageData(layout: CONSTRAINED, width: 540, height: 360)` (maxWidth < 1000 → constrained)
- `fluid(quality: 80, srcSetBreakpoints: [350, 700, 1050, 1400])` (blog-post hero, no maxWidth) → `gatsbyImageData(layout: FULL_WIDTH, quality: 80)` (no maxWidth → fullWidth; breakpoints default `[750, 1080, 1366, 1920]`)
- `fluid(quality: 80, srcSetBreakpoints: [960, 1440])` (index-page hero) → `gatsbyImageData(layout: FULL_WIDTH, quality: 80)`
- `tracedSVG: true` in `gatsby-remark-images` config → `placeholder: BLURRED` or `DOMINANT_COLOR` (tracedSVG is legacy; default dominantColor is cheaper)
- `formats: [AUTO, WEBP]` is the default; AVIF optional (`[AUTO, WEBP, AVIF]`)

Files touched: `src/templates/blog-post.js`, `src/templates/index-page.js`, `src/templates/blog-list.js`, `src/components/post-card.js`, `src/components/blog-list-home.js`, `src/components/seo.js`.

### 2. Contact form flow (MUI removal + emailjs v4 + env keys)

```
Before:  MUI TextField/Button render → Formik validates → emailjs.sendForm() → always redirects /thanks
After:   plain <input>/<textarea> + SCSS classes → Formik validates (unchanged) →
         @emailjs/browser sendForm (env-var keys) → .then → /thanks; .catch → inline error, keep values
```

The `data-netlify="true"` + honeypot attributes stay (harmless fallback) or are removed if EmailJS is the sole channel — decide in the phase; the form-name conflict is documented in CONCERNS.md.

### 3. Font loading flow (performance)

```
Before:  @import url(googleapis) nested inside :root in _theme-variables.scss (render-blocking, invalid CSS placement)
After:   <link rel="preconnect" href="https://fonts.googleapis.com"> + <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
         + stylesheet link with display=swap in <head> (via gatsby-plugin-react-helmet or gatsby-browser.js)
         — or self-host with @fontsource/parisienne + @fontsource/ubuntu (best: no third-party origin)
```

### 4. Unchanged flows

- Page generation: `gatsby-node.js` → templates (identical)
- Content editing: CMS → git → Netlify rebuild (identical, package swap only)
- Blog pagination: `limit/skip/numPages` context (identical)

---

## Suggested Build Order (dependency-ordered)

Dependency graph: **Foundation → Gatsby upgrade → Image adoption → MUI removal (parallel) → Performance → CMS swap (independent, anywhere after Foundation)**.

| Order | Work | Depends On | Why Here |
|-------|------|-----------|----------|
| 1 | **Foundation cleanup**: single package manager (delete package-lock.json), remove dead deps (codemirror, seamless-immutable, redux, react-refresh, typescript, gatsby-background-image, y18n, prismjs, package-doctor), delete dead components (old-form.js, form-pulito.js), fix `netlify.toml` NODE_VERSION, remove `ga` placeholder | — | Zero code risk; shrinks install surface before any upgrade; fixes the build-config contradiction that has caused repeated Netlify failures |
| 2 | **Gatsby 5.15.0 → 5.16.1 + node-sass → sass (dart-sass)** | 1 | The core upgrade. `gatsby-plugin-sass` 6.16 peers on `sass ^1.30.0` (dart-sass), not node-sass. Verify `gatsby build` + `gatsby develop` clean. **Do not** attempt React 19 here (see Risks) |
| 3 | **gatsby-plugin-image adoption** | 2 | Requires current sharp/transformer versions. Mechanical swap across 5 files + seo fix. Both packages can coexist during the transition (official guidance) |
| 4 | **MUI v4 removal** (parallel with 3) | 2 | Independent of image work. formik.js + top-contacts.js + SCSS form styles. Also: emailjs-com → @emailjs/browser, env-var keys, false-success redirect fix |
| 5 | **Performance optimization** | 3 (images), 4 (form) | Font loading fix, asset dedup (8 jpg/jpeg pairs, ~30 unreferenced files), query dedup (blog-list vs blog-list-home shared fragment), Core Web Vitals pass |
| 6 | **CMS modernization: netlify-cms-app → decap-cms** | 1 (any time after) | `gatsby-plugin-netlify-cms` 7.12.1 is stale (Dec 2023); decap-cms 3.15.1 actively maintained (Jul 2026). Config-compatible. Low risk, do last or in parallel |

**Parallelization note:** steps 3 and 4 touch disjoint file sets (3: templates/post-card/blog-list-home/seo; 4: formik/top-contacts/SCSS) — safe to run as separate phases or parallel plans. Step 6 touches only `gatsby-config.js` + package.json — collides with step 2's config edits, so sequence it after 2.

---

## Migration Risk Areas & Rollback Paths

| Risk | Severity | Mitigation | Rollback |
|------|----------|-----------|----------|
| **"Gatsby 6" doesn't exist** — team/user expectation mismatch | High | Reframe milestone: "upgrade to Gatsby 5.16.1 (latest stable)". Document the npm/docs evidence in the phase plan | n/a — no code change |
| **node-sass → dart-sass `@import` differences** | Medium | Repo uses only local `@import`s (verified: style.scss imports partials) — low risk. BUT the `@import url(...)` Google Fonts inside `:root` is non-standard; dart-sass may emit it in place → invalid CSS. Fix fonts in the same phase | `git revert` of package.json + yarn.lock; node-sass still installable on Node 20 |
| **React 19 peer conflicts with community plugins** | Medium | `gatsby-plugin-netlify-cms` 7.12.1 and `gatsby-plugin-matomo` 0.17.0 peer on `react ^18`; stay on React 18 this milestone. React 19 is optional and only safe after the CMS/matomo plugins are replaced | Stay on 18 — no rollback needed |
| **gatsby-plugin-image query/component mismatch** | Medium | Official codemod (`gatsby-codemods` `gatsby-image-to-gatsby-plugin-image`) exists; both packages can coexist during migration; verify each template's GraphQL query in GraphiQL before build | Keep `gatsby-image` installed until all 5 files migrated; revert per-file |
| **og:image regression** | Medium | The current bug passes a fluid *object* to Seo. After migration, pass `getSrc(image)` string; make Seo ignore non-strings. Add a build-time check or test | Revert seo.js change |
| **MUI removal changes form look** | Low | MUI v4 styles are gone with the package; replicate with SCSS classes using existing `--primary-color`/`--button-color` theme vars. Visual diff against current site | Revert formik.js + SCSS; MUI v4 still installable |
| **gatsby-plugin-matomo deprecated** | Medium | Replace with `matomo-tracker` (maintained) or manual injection in `gatsby-browser.js`; keep same siteId/URL; set `disableCookies: true` (GDPR) | Revert config; old plugin still works |
| **gatsby-plugin-offline + manifest interplay** | Low | Both still maintained (6.16.0, Jan 2026). Delete legacy `static/manifest.json` + icon set to stop duplicate PWA metadata | Revert deletions |
| **Netlify build breakage** | High (recurring) | Fix NODE_VERSION first (step 1); test clean `gatsby build` locally; clear Netlify build cache after deploy; keep `netlify-plugin-gatsby-cache` | Netlify keeps last good deploy; git revert |
| **Decap CMS admin breakage** | Low | Config-compatible; test `/admin` on a preview deploy before production | Revert package swap |

**General rollback strategy:** every step above is a small, independently revertable commit (package.json + yarn.lock + a handful of files). The site is fully static — the last good Netlify deploy remains live until the next successful build, so a broken build never ships.

---

## Anti-Patterns to Avoid

### 1. Chasing pre-release Gatsby tags
**What people do:** installing `5.17.0-next` / `5.18.0-react19` canary builds thinking they're "Gatsby 6."
**Why it's wrong:** canary tags are unstable; `latest` is 5.16.1.
**Do this instead:** pin `gatsby@5.16.1` and all `gatsby-*` packages to their matching 5.16/6.16/7.16 lines.

### 2. Migrating images and upgrading Gatsby in the same commit
**Why it's wrong:** two failure modes at once; hard to bisect.
**Do this instead:** upgrade first (step 2), verify build, then migrate images (step 3).

### 3. Replacing MUI with another UI library
**Why it's wrong:** the form uses 2 components (TextField, Button) and the icons are 2 SVGs. A component library adds bundle weight and a new theming system for zero benefit.
**Do this instead:** plain inputs + existing SCSS theme variables; react-icons for the two social icons (already a dependency).

### 4. Keeping both sitemap plugins or both lockfiles
**Why it's wrong:** duplicate output / drift risk (documented in CONCERNS.md).
**Do this instead:** keep `gatsby-plugin-sitemap` only; keep `yarn.lock` only.

### 5. Leaving the font `@import` inside `:root` after the sass swap
**Why it's wrong:** dart-sass passes plain CSS `@import url()` through in place — nested inside `:root` it produces invalid CSS and stays render-blocking.
**Do this instead:** move to `<link>` tags with `preconnect` + `display=swap`, or self-host with `@fontsource`.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (19 posts, 61 assets) | Monolith static build is correct; no changes needed |
| 100+ posts | Build stays linear (one page per post); pagination already parameterized; nothing to do |
| 1000+ posts / large media | Move `static/assets/` to remote media (Cloudinary) or Git LFS; consider DSG for old posts |

**First bottleneck:** `static/assets/` weight (9.6 MB, ~30 unreferenced files) — dedup is a performance win now, not a scaling concern.

---

## Sources

- npm registry metadata (verified 2026-08-18): `gatsby` dist-tags (`latest` = 5.16.1), engines (`node >=18 <26`, `react ^18 || ^19`), peerDependencies for `gatsby-plugin-image@3.16.0`, `gatsby-plugin-sass@6.16.0` (peers `sass ^1.30.0`), `gatsby-plugin-netlify-cms@7.12.1`, `gatsby-plugin-decap-cms@4.0.4`, `decap-cms@3.15.1`, `netlify-cms-app@2.15.72`, `gatsby-image@3.11.0` (deprecated), `node-sass@9.0.0` (deprecated), `gatsby-plugin-advanced-sitemap@2.1.0` (deprecated), `gatsby-plugin-matomo@0.17.0` (deprecated), `emailjs-com@3.2.0` (deprecated), `@emailjs/browser@4.4.1`, `sass@1.102.0`, `matomo-tracker@2.2.4` — HIGH confidence
- Gatsby official docs: [Release Notes index](https://www.gatsbyjs.com/docs/reference/release-notes/) (latest = v5.16, Jan 2026), [v5.16 Release Notes](https://www.gatsbyjs.com/docs/reference/release-notes/v5.16/) (React 19 + Node 24 support), [Gatsby Framework Version Support](https://www.gatsbyjs.com/docs/reference/release-notes/gatsby-version-support/) (v5 = Active LTS) — HIGH confidence
- Gatsby official docs: [Migrating from gatsby-image to gatsby-plugin-image](https://www.gatsbyjs.com/docs/reference/release-notes/image-migration-guide/) (fluid→fullWidth/constrained mapping, codemod, getImage/getSrc) — HIGH confidence
- Gatsby official docs: [Gatsby Image plugin reference](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/) (GatsbyImage/StaticImage props, layouts, helper functions) — HIGH confidence
- Gatsby official docs: [gatsby-plugin-sass README](https://www.gatsbyjs.com/docs/plugins/gatsby-plugin-sass/) (dart-sass install pattern) — HIGH confidence
- Project codebase maps: `.planning/codebase/ARCHITECTURE.md`, `STRUCTURE.md`, `CONCERNS.md` (2026-08-18) — HIGH confidence (ground truth for integration points)

**Gaps / LOW confidence items:**
- Exact dart-sass behavior with the nested `@import url()` in `_theme-variables.scss` — needs a build test in the phase (flagged in Risks).
- `gatsby-plugin-matomo` replacement choice (`matomo-tracker` vs manual injection) — needs a quick spike; both are viable.
- Whether `gatsby-plugin-netlify-cms` 7.12.1 installs cleanly against Gatsby 5.16 — if it errors, the Decap swap becomes a prerequisite, not a final step.

---
*Architecture research for: LaryArt Gatsby modernization milestone*
*Researched: 2026-08-18*
