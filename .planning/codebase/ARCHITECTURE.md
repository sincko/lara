<!-- refreshed: 2026-08-18 -->
# Architecture

**Analysis Date:** 2026-08-18

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        Content Layer (Markdown)                       │
│   `src/content/pages/` (index, laryart, privacy, contatti)            │
│   `src/content/posts/` (19 blog posts, date-prefixed filenames)      │
│   `src/util/site.json` (site metadata)                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ gatsby-source-filesystem
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Gatsby Data Layer (GraphQL)                       │
│   gatsby-transformer-remark → MarkdownRemark nodes                   │
│   gatsby-transformer-sharp / gatsby-plugin-sharp → image nodes       │
│   `gatsby-config.js` (plugin wiring)                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ createPages (build time)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Page Generation Layer                              │
│   `gatsby-node.js` — createPages + onCreateNode                      │
│   `src/templates/` — blog-list, blog-post, index-page,              │
│                        contatti, laryart, privacy                    │
│   `src/pages/` — 404.js, thanks.js (static React pages)              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ React hydration
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Presentation Layer (React)                        │
│   `src/components/` — layout, header, footer, navigation, seo,      │
│                        post-card, blog-list-home, formik, logo,      │
│                        top-contacts, footer-links                    │
│   `src/assets/scss/` — style.scss + partials (CSS custom props)      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ static export
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Output / Deployment                                │
│   `public/` (build output, gitignored) → Netlify (`netlify.toml`)    │
│   Netlify CMS admin at `/admin/` (`static/admin/config.yml`)        │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| gatsby-config.js | Plugin wiring, siteMetadata from `src/util/site.json`, content sources | `gatsby-config.js` |
| gatsby-node.js | Page creation from Markdown frontmatter, blog pagination, slug fields | `gatsby-node.js` |
| gatsby-browser.js | Service worker update prompt | `gatsby-browser.js` |
| Layout | Page shell: header + main + footer, imports global SCSS | `src/components/layout.js` |
| Seo | Helmet-based meta/OG/Twitter tags from siteMetadata | `src/components/seo.js` |
| Navigation | Menu items + mobile toggle (class component with state) | `src/components/navigation.js` |
| FormikContact | Contact form: Formik + yup validation + emailjs + Material UI | `src/components/formik.js` |
| BlogListHome | Homepage latest-6-posts section (StaticQuery) | `src/components/blog-list-home.js` |
| PostCard | Blog post card (image + title + date) | `src/components/post-card.js` |
| Templates | Page renderers keyed by frontmatter `template` field | `src/templates/*.js` |
| Netlify CMS config | Content collections (posts, pages, settings) | `static/admin/config.yml` |

## Pattern Overview

**Overall:** JAMstack content-driven static site. Markdown files with frontmatter are the single source of truth; Gatsby builds all pages at build time; Netlify CMS provides browser-based editing of the same Markdown files via git-gateway.

**Key Characteristics:**
- **Template-driven routing:** every Markdown file declares `template: <name>` in frontmatter; `gatsby-node.js` resolves `src/templates/<name>.js` at build time (`gatsby-node.js:44-48`). Adding a page type = adding a template file.
- **Content/data separation:** all content lives in `src/content/` and `static/assets/`; all code lives in `src/components/`, `src/templates/`, `src/pages/`.
- **Build-time GraphQL:** every template exports a `pageQuery`/`blogListQuery` graphql tag; no client-side data fetching anywhere.
- **CSS custom properties theming:** `src/assets/scss/_theme-variables.scss` defines `:root` variables (`--primary-color`, `--button-alternate-color`, etc.) consumed throughout `src/assets/scss/style.scss`.
- **Static pages only:** `src/pages/` contains just `404.js` and `thanks.js`; every other route is generated from Markdown.

## Layers

**Content Layer:**
- Purpose: All editable site content
- Location: `src/content/pages/`, `src/content/posts/`, `src/util/site.json`, `static/assets/`
- Contains: Markdown with YAML frontmatter (`template`, `slug`, `title`, `date`, `featuredImage`, `description`, `cta`), site metadata JSON, media files
- Depends on: Nothing
- Used by: `gatsby-config.js` (sources), `gatsby-node.js` (page creation), templates (GraphQL queries)

**Data Layer (Gatsby GraphQL):**
- Purpose: Transform Markdown + images into queryable nodes
- Location: `gatsby-config.js` (plugin config)
- Contains: `gatsby-source-filesystem` (two sources: `static/assets/` as `assets`, `src/content/` as `content`), `gatsby-transformer-remark` (with remark plugins: netlify-cms-paths, images, responsive-iframe, prismjs), `gatsby-transformer-sharp`, `gatsby-plugin-sharp`
- Depends on: Content Layer
- Used by: Page Generation Layer

**Page Generation Layer:**
- Purpose: Turn content nodes into static pages
- Location: `gatsby-node.js`, `src/templates/`, `src/pages/`
- Contains: `createPages` (per-Markdown pages + paginated blog list at 9 posts/page), `onCreateNode` (slug field), six templates, two static pages
- Depends on: Data Layer
- Used by: Presentation Layer (rendered output)

**Presentation Layer:**
- Purpose: React components and styling
- Location: `src/components/`, `src/assets/scss/`
- Contains: Layout shell, header/footer/navigation, SEO, post cards, contact form, SCSS partials
- Depends on: Page Generation Layer (receives data via props)
- Used by: Browser (hydrated static HTML)

## Data Flow

### Primary Request Path (page load)

1. Browser requests URL (e.g. `/farfalle`) — served static HTML from `public/` on Netlify CDN
2. Build-time: `gatsby-node.js` `createPages` queries `allMarkdownRemark` sorted by date desc (`gatsby-node.js:10-27`)
3. For each node, `createPage` maps `frontmatter.slug` → path and `frontmatter.template` → `src/templates/<template>.js` component, passing `id`, `previous`, `next` via context (`gatsby-node.js:39-61`)
4. Template's exported `pageQuery` runs at build time, e.g. `BlogPostQuery($id: String!)` fetches `markdownRemark` by id (`src/templates/blog-post.js:118-140`)
5. Template renders `Layout` + `Seo` + content; `dangerouslySetInnerHTML` injects the transformed markdown `html` (`src/templates/blog-post.js:94-97`)
6. Netlify serves the pre-rendered HTML; React hydrates client-side

### Blog List Pagination Flow

1. `gatsby-node.js` counts nodes with `template: 'blog-post'`, computes `numPages = ceil(count / 9)` (`gatsby-node.js:63-65`)
2. Creates `/blog` (page 1) and `/blog/<n>` for subsequent pages with `limit`/`skip`/`numPages`/`currentPage` context (`gatsby-node.js:67-78`)
3. `blog-list.js` `blogListQuery` uses `$skip`/`$limit` for paginated fetch; `Pagination` component renders prev/next + numbered links (`src/templates/blog-list.js:39-74`)

### Contact Form Flow

1. User submits form in `src/components/formik.js` — Formik validates against yup schema (email + nome required) (`src/components/formik.js:25-28`)
2. `onSubmit` calls `emailjs.sendForm("service_q3997uk", "template_m6tzcmm", "#contact_form")` (`src/components/formik.js:40-41`)
3. Form also carries `data-netlify="true"` + honeypot `bot-field` as a Netlify Forms fallback (`src/components/formik.js:57-71`)
4. On success: `actions.resetForm()` then `document.location.assign("/thanks")` (`src/components/formik.js:49-51`)

### Content Editing Flow (Netlify CMS)

1. Editor opens `/admin/` — Netlify CMS loads `static/admin/config.yml`
2. Collections defined: `posts` (folder `src/content/posts`), `pages` (files: home, laryart, privacy, contatti), `settings` (file `src/util/site.json`) (`static/admin/config.yml:17-191`)
3. Save commits Markdown changes to git via git-gateway backend (`static/admin/config.yml:1-9`); Netlify rebuilds and redeploys

**State Management:**
- No global state library. Only local React state: `Navigation` menu toggle (`src/components/navigation.js:30-42`). Formik manages form state internally. `seamless-immutable` and `redux` are installed but unused in `src/`.

## Key Abstractions

**Template (page type):**
- Purpose: One React component per content type, selected by frontmatter `template` field
- Examples: `src/templates/blog-post.js`, `src/templates/index-page.js`, `src/templates/contatti.js`
- Pattern: Each template exports a named `pageQuery` graphql tag + default React component receiving `{ data, pageContext }`

**Layout shell:**
- Purpose: Shared chrome (header, nav, footer) wrapping all pages
- Examples: `src/components/layout.js` (composes `Header`, `Logo`, `TopContacts`, `Navigation`, `Footer`)
- Pattern: Composition of presentational components; imports `../assets/scss/style.scss` once

**Seo component:**
- Purpose: Centralized meta/OG/Twitter tag generation
- Examples: `src/components/seo.js`
- Pattern: `useStaticQuery` for siteMetadata + `useLocation` for canonical URL; props `title`, `description`, `image`, `article` with PropTypes defaults

**PostCard:**
- Purpose: Reusable blog post preview (image, title, date)
- Examples: `src/components/post-card.js`
- Pattern: Presentational component fed a `data` node; used by both `blog-list.js` and `blog-list-home.js`

## Entry Points

**gatsby-config.js:**
- Location: `gatsby-config.js`
- Triggers: Every Gatsby command (`gatsby build`, `gatsby develop`)
- Responsibilities: Loads `src/util/site.json` as `siteMetadata`; registers 15 plugins (sitemap, matomo, source-filesystem ×2, sharp, remark, sass, helmet, netlify-cms, manifest, offline)

**gatsby-node.js:**
- Location: `gatsby-node.js`
- Triggers: Build/develop lifecycle
- Responsibilities: `createPages` (content pages + blog pagination), `onCreateNode` (slug field on MarkdownRemark)

**src/pages/404.js and src/pages/thanks.js:**
- Location: `src/pages/`
- Triggers: Gatsby file-based routing — `/404` and `/thanks`
- Responsibilities: Static React pages (not content-driven); both wrap `Layout` + `Seo`

**Netlify CMS admin:**
- Location: `static/admin/config.yml`
- Triggers: `/admin/` route on the deployed site
- Responsibilities: Content CRUD against git; defines the content schema (frontmatter fields per collection)

## Architectural Constraints

- **Threading:** Single-threaded Node build process; all page generation is synchronous within `createPages` (`gatsby-node.js:4-80`). No workers, no server runtime — the site is fully static after build.
- **Global state:** None beyond module-level constants: `MenuItems` array in `src/components/navigation.js:5-22` and the emailjs init call at module scope in `src/components/formik.js:8` (`emailjs.init("user_06xz85hi92oABMZqCIUu7")` — a hardcoded public key, executed on import).
- **Circular imports:** None detected. Dependency direction is strictly `templates → components → (nothing)`; `layout.js` imports all shell components; no component imports a template.
- **Content schema coupling:** The `template` frontmatter field is a hard contract between content and code — a Markdown file with `template: foo` breaks the build if `src/templates/foo.js` doesn't exist (`gatsby-node.js:46-48`).
- **Image pipeline:** Images use the deprecated `gatsby-image` v3 (`Img` component with `fluid` fragments) throughout — `src/templates/blog-post.js:3`, `src/templates/index-page.js:3`, `src/components/post-card.js:3`. Not migrated to `gatsby-plugin-image`.
- **Node version:** `.nvmrc` pins Node 20; `netlify.toml` declares `NODE_VERSION = "10"` (stale, overridden by `.nvmrc` on Netlify).

## Anti-Patterns

### Dead / broken component files

**What happens:** `src/components/old-form.js` (unused Formik demo) and `src/components/form-pulito.js` (broken: starts with a stray `;`, references `TextField`/`Button` without imports) exist alongside the real `src/components/formik.js`.
**Why it's wrong:** Confusing for maintainers; `form-pulito.js` would fail compilation if ever imported.
**Do this instead:** Delete both files; keep only `src/components/formik.js`.

### Hardcoded third-party credentials in source

**What happens:** `emailjs.init("user_06xz85hi92oABMZqCIUu7")` at module scope in `src/components/formik.js:8`, plus hardcoded service/template IDs in the same file (`src/components/formik.js:41`).
**Why it's wrong:** Public key is exposed in client bundle (by design for emailjs, but the init call runs on every import and IDs are not configurable); no env-var indirection.
**Do this instead:** Read IDs from `process.env.GATSBY_*` variables with fallbacks, or from `src/util/site.json`.

### Mixed component styles

**What happens:** Class components (`src/components/navigation.js:30`, `src/templates/blog-list.js:75`) coexist with function components and arrow-function components (`src/components/header.js:3`, `src/components/footer.js:5`).
**Why it's wrong:** Inconsistent patterns make maintenance harder.
**Do this instead:** Use function components with hooks consistently (the dominant pattern in this codebase).

### Inline styles in pages

**What happens:** `src/pages/404.js:18-20` and `src/pages/thanks.js:18-20` use `style={{ fontSize: "128px", color: "var(--primary-color)" }}` instead of SCSS classes.
**Why it's wrong:** Bypasses the SCSS theming system; inconsistent with the rest of the site.
**Do this instead:** Add classes to `src/assets/scss/style.scss`.

## Error Handling

**Strategy:** Minimal, build-time only. No runtime error boundaries, no client-side error tracking.

**Patterns:**
- Build failures: `reporter.panicOnBuild` in `gatsby-node.js:31` if the GraphQL query errors
- Form submission: `.catch(error => { console.log(error.text); return })` in `src/components/formik.js:45-48` — logs to console, still redirects to `/thanks` regardless of emailjs success
- Image fallback: templates render `""` when `featuredImage` is missing (`src/templates/blog-post.js:55-57`, `src/templates/index-page.js:37-39`)
- 404: dedicated `src/pages/404.js` page

## Cross-Cutting Concerns

**Logging:** `console.log` only — emailjs result/error in `src/components/formik.js:43,46`; no structured logging, no analytics beyond Matomo page tracking (`gatsby-config.js:22-30`).
**Validation:** yup schema for contact form only (`src/components/formik.js:25-28`); no other input surfaces.
**Authentication:** None in app code — Netlify Identity + Git Gateway handle Netlify CMS auth (`static/admin/config.yml:1-9`).
**SEO:** Centralized in `src/components/seo.js` (Helmet, OG, Twitter cards, hreflang alternates); sitemaps via `gatsby-plugin-sitemap` + `gatsby-plugin-advanced-sitemap`; PWA via `gatsby-plugin-manifest` + `gatsby-plugin-offline`.

---

*Architecture analysis: 2026-08-18*
