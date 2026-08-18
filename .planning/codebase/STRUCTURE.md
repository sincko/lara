# Codebase Structure

**Analysis Date:** 2026-08-18

## Directory Layout

```
lara/
├── gatsby-config.js       # Plugin wiring + siteMetadata (from src/util/site.json)
├── gatsby-node.js         # createPages (content pages + blog pagination) + onCreateNode
├── gatsby-browser.js      # Service worker update prompt
├── netlify.toml           # Netlify build config (publish: public, npm run build)
├── package.json           # Scripts + dependencies (Gatsby 5, React 18)
├── .nvmrc                 # Node 20
├── .prettierrc            # Prettier: no semi, avoid arrow parens
├── .vscode/settings.json  # Editor settings (tabs, word wrap, cSpell Italian words)
├── src/                   # All source code + content
│   ├── assets/            # SCSS + static images used by components
│   │   ├── scss/          # style.scss + partials (theme variables, defaults, utility, lib/)
│   │   └── img/           # Logo images (logo-rosa.png, logo-bianco2.png, ...)
│   ├── components/        # React components (layout shell, cards, form, seo)
│   ├── content/           # Markdown content (pages + posts) — CMS-editable
│   │   ├── pages/         # index.md, laryart.md, privacy.md, contatti.md
│   │   └── posts/         # 19 blog posts, YYYY-MM-DD-slug.md naming
│   ├── pages/             # Gatsby file-based routes: 404.js, thanks.js
│   ├── templates/         # Page templates keyed by frontmatter `template` field
│   └── util/              # site.json (site metadata, CMS-editable)
├── static/                # Public static assets (copied verbatim to public/)
│   ├── admin/config.yml   # Netlify CMS configuration (collections/schema)
│   └── assets/            # 61 media files (images referenced by content)
├── public/                # Build output (gitignored, generated)
├── .cache/                # Gatsby cache (gitignored, generated)
└── .planning/             # GSD planning artifacts (codebase maps, plans)
```

## Directory Purposes

**`src/assets/scss/`:**
- Purpose: All styling — single entry `style.scss` imported by `src/components/layout.js:8`
- Contains: `_theme-variables.scss` (CSS custom properties + breakpoints), `_defaults.scss` (reset/base), `_utility.scss` (icon/text helpers), `lib/` (css-grid-utility, prism themes)
- Key files: `src/assets/scss/style.scss` (586 lines, all component styles), `src/assets/scss/_theme-variables.scss` (theming — edit colors here)

**`src/components/`:**
- Purpose: Reusable React components; the presentation layer
- Contains: Layout shell (`layout.js`), chrome (`header.js`, `footer.js`, `navigation.js`, `logo.js`, `top-contacts.js`, `footer-links.js`), content (`post-card.js`, `blog-list-home.js`), SEO (`seo.js`), contact form (`formik.js`), dead code (`old-form.js`, `form-pulito.js` — unused, see ARCHITECTURE.md anti-patterns)
- Key files: `src/components/layout.js` (page shell), `src/components/seo.js` (meta tags), `src/components/formik.js` (contact form)

**`src/content/`:**
- Purpose: All editable site content (Markdown + YAML frontmatter); the CMS content source
- Contains: `pages/` (4 fixed pages: home, chi sono, privacy, contatti) and `posts/` (19 blog posts)
- Key files: `src/content/pages/index.md` (homepage with `cta` object), `src/content/posts/2024-08-15-farfalline.md` (post example)
- Frontmatter contract: `template` (required, selects template file), `slug`, `title`, `date`, `description`, `featuredImage`, optional `tagline`/`cta` (home only)

**`src/pages/`:**
- Purpose: Gatsby file-based routing for static React pages (non-content pages)
- Contains: `404.js` (not-found), `thanks.js` (post-form-submission confirmation)
- Key files: `src/pages/404.js`, `src/pages/thanks.js`

**`src/templates/`:**
- Purpose: Page renderers, one per content type; selected at build time by frontmatter `template` value
- Contains: `blog-post.js`, `blog-list.js`, `index-page.js`, `contatti.js`, `laryart.js`, `privacy.js`
- Key files: `src/templates/blog-post.js` (post page + prev/next pagination), `src/templates/blog-list.js` (paginated blog index)

**`src/util/`:**
- Purpose: Site-wide configuration data
- Contains: `site.json` — `meta` object (title, titleTemplate, description, siteUrl, image, twitterUsername) loaded as `siteMetadata` in `gatsby-config.js:13-16`; also CMS-editable via the `settings` collection in `static/admin/config.yml:155-191`

**`static/`:**
- Purpose: Files copied verbatim to `public/` at build; media + CMS admin
- Contains: `admin/config.yml` (Netlify CMS config), `assets/` (61 images referenced by content frontmatter and markdown), favicon/apple-icon sets
- Key files: `static/admin/config.yml` (content schema — the contract for what frontmatter fields exist)

**`public/`:**
- Purpose: Gatsby build output (generated)
- Contains: Compiled HTML, JS bundles, workbox service worker, sitemaps, manifest
- Generated: Yes — Committed: No (gitignored)

## Key File Locations

**Entry Points:**
- `gatsby-config.js`: Plugin registration + siteMetadata
- `gatsby-node.js`: Page creation logic
- `gatsby-browser.js`: Browser API hooks (SW update)
- `src/pages/404.js`, `src/pages/thanks.js`: File-based routes
- `static/admin/config.yml`: CMS admin entry

**Configuration:**
- `gatsby-config.js`: All Gatsby plugins
- `netlify.toml`: Netlify build settings
- `.nvmrc`: Node version (20)
- `.prettierrc`: Formatting (semi: false, arrowParens: avoid)
- `.vscode/settings.json`: Editor config
- `src/util/site.json`: Site metadata (title, URL, social)

**Core Logic:**
- `gatsby-node.js`: Page generation + pagination
- `src/templates/*.js`: Page rendering + GraphQL queries
- `src/components/layout.js`: Page shell composition
- `src/components/formik.js`: Contact form logic (emailjs + yup)

**Testing:**
- None. `package.json:21` has a placeholder `test` script (`echo "Write tests!..." && exit 1`). No test files, no test framework installed.

## Naming Conventions

**Files:**
- Components/templates/pages: kebab-case `.js` — `post-card.js`, `blog-list-home.js`, `index-page.js`
- SCSS partials: leading underscore `_theme-variables.scss`, `_defaults.scss`, `_utility.scss`; entry file without underscore `style.scss`
- Content posts: `YYYY-MM-DD-slug.md` — `2024-08-15-farfalline.md` (enforced by CMS slug pattern in `static/admin/config.yml:24`)
- Content pages: `slug.md` — `index.md`, `laryart.md`, `privacy.md`, `contatti.md`

**Directories:**
- All lowercase, singular nouns: `components`, `templates`, `pages`, `content`, `assets`, `util`
- `src/` subdirectories follow Gatsby conventions (components/templates/pages are framework-recognized)

**Components:**
- Default export per file; PascalCase component names (`FormikContact`, `BlogListHome`, `PostCard`, `FooterCredits`)
- Named export for GraphQL query tags: `pageQuery`, `blogListQuery`, `HomeQuery`, `ContactQuery`, `AboutQuery`, `PrivacyQuery`

**Functions:**
- camelCase for handlers (`handleToggleClick`, `onSubmit`); PascalCase for components; arrow functions for presentational components

## Where to Add New Code

**New Feature:**
- Primary code: `src/components/` (new component) + `src/templates/` (new page type) or `src/pages/` (static route)
- Content: `src/content/pages/` or `src/content/posts/` (or via Netlify CMS at `/admin/`)
- Styles: `src/assets/scss/style.scss` (or a new partial imported there)
- Tests: no test infrastructure exists — see CONCERNS.md

**New Component/Module:**
- Implementation: `src/components/<kebab-case-name>.js` with default export
- If it's a new page type: also create `src/templates/<name>.js` and register the template value in `static/admin/config.yml` (posts collection default is `blog-post`; pages collection has per-file `template` hidden fields)

**New Blog Post:**
- Content: `src/content/posts/YYYY-MM-DD-slug.md` with frontmatter `template: blog-post`, `title`, `slug`, `date`, `description`, `featuredImage`
- Image: `static/assets/<file>.jpg` referenced as `/assets/<file>.jpg`

**Utilities:**
- Shared helpers: `src/util/` (currently only `site.json`; no JS helpers exist yet)

**New Gatsby Plugin:**
- Register in `gatsby-config.js` plugins array; if it needs content, add a `gatsby-source-filesystem` entry

## Special Directories

**`public/`:**
- Purpose: Build output (HTML, JS, workbox SW, sitemaps)
- Generated: Yes — Committed: No (in `.gitignore`)

**`.cache/`:**
- Purpose: Gatsby dev/build cache
- Generated: Yes — Committed: No (in `.gitignore`)

**`static/assets/`:**
- Purpose: Media library shared by content and CMS (`media_folder: "static/assets"` in `static/admin/config.yml:14`)
- Generated: No — Committed: Yes
- Note: Referenced in markdown/frontmatter as `/assets/<file>`

**`.planning/`:**
- Purpose: GSD planning artifacts (codebase maps, phase plans, roadmaps)
- Generated: Yes (by GSD tooling) — Committed: Yes

---

*Structure analysis: 2026-08-18*
