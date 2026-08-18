# Technology Stack

**Analysis Date:** 2026-08-18

## Languages

**Primary:**
- JavaScript (ES6+/JSX) - All source code in `src/` is plain JavaScript/JSX. No `.ts`/`.tsx` files exist.

**Secondary:**
- TypeScript 5.9.3 - Declared in `package.json` devDependencies but **not used** (no `tsconfig.json`, no `.ts` files). Effectively dead dependency.
- SCSS - Styling in `src/assets/scss/` (`style.scss`, `_defaults.scss`, `_theme-variables.scss`, `_utility.scss`, `lib/`).
- Markdown - All content (blog posts, pages) in `src/content/` with YAML frontmatter.

## Runtime

**Environment:**
- Node.js 20 - `.nvmrc` contains `20`. **Conflict:** `netlify.toml` sets `NODE_VERSION = "10"` which is stale and incompatible with Gatsby 5 / node-sass 9; the Netlify build currently relies on the `.nvmrc`/default runtime instead.

**Package Manager:**
- Yarn 1.22.22 - `packageManager` field in `package.json`, `yarn.lock` committed (15189 lines).
- npm - `package-lock.json` (26447 lines) also committed; `netlify.toml` build command uses `npm run build`. Both lockfiles are tracked — keep them in sync or remove one.

## Frameworks

**Core:**
- Gatsby 5.15.0 - Static site generator; config in `gatsby-config.js`, page creation in `gatsby-node.js`, browser hooks in `gatsby-browser.js`. No `gatsby-ssr.js`.
- React 18.3.1 (resolved) / `^18.0.2` (declared) - UI library, with `react-dom`.

**Content/Data:**
- `gatsby-transformer-remark` 6.15.0 - Markdown → HTML with plugins: `gatsby-remark-images` (maxWidth 1024, tracedSVG, lazy), `gatsby-remark-responsive-iframe`, `gatsby-remark-prismjs` (code highlighting).
- `gatsby-source-filesystem` 5.15.0 - Sources `static/assets/` (name: `assets`) and `src/content/` (name: `content`).
- `gatsby-image` 3.11.0 (legacy) + `gatsby-transformer-sharp`/`gatsby-plugin-sharp` 5.15.0 - Image processing; `Img` component used in `src/templates/blog-post.js`, `src/templates/index-page.js`, `src/components/post-card.js`.

**UI:**
- Material-UI v4 (`@material-ui/core` 4.12.4, `@material-ui/icons` 4.11.3) - TextField/Button components in contact form (`src/components/formik.js`), icons in `src/components/top-contacts.js`.
- `react-icons` 5.7.0 - Remix icon set used across templates/components.
- `react-helmet` 6.1.0 - SEO meta management in `src/components/seo.js`.

**Forms:**
- Formik 2.4.9 - Form state/validation in `src/components/formik.js`.
- yup 1.7.1 - Validation schema (email + nome required).

**CMS:**
- `netlify-cms-app` 2.15.72 - Admin UI at `/admin/` (config: `static/admin/config.yml`), wired via `gatsby-plugin-netlify-cms` 6.22.0 and `gatsby-plugin-netlify-cms-paths` 1.3.0.

**Testing:**
- None. `package.json` `test` script is a stub: `echo "Write tests! -> https://gatsby.dev/unit-testing" && exit 1`. No test files, no jest/vitest config.

**Build/Dev:**
- `node-sass` 9.0.0 + `gatsby-plugin-sass` 6.15.0 - SCSS compilation.
- Prettier 3.8.0 - Formatting; config `.prettierrc`: `arrowParens: "avoid"`, `semi: false`; ignore list in `.prettierignore`. Script: `yarn format`.
- `react-refresh` 0.18.0 - Dev hot reload (Gatsby internal).
- No ESLint, no Biome, no TypeScript config.

## Key Dependencies

**Critical:**
- `gatsby` 5.15.0 - Core framework; all build/develop/serve scripts depend on it.
- `gatsby-plugin-matomo` 0.17.0 - Analytics; configured in `gatsby-config.js` with `siteId: "4"`, `matomoUrl: "https://matomo.duckdns.org/"`, `siteUrl: "https://laryart.it"`, `disableCookies: false`.
- `emailjs-com` 3.2.0 - Contact form email delivery (see INTEGRATIONS.md).
- `gatsby-plugin-manifest` 5.15.0 + `gatsby-plugin-offline` 6.15.0 - PWA support (name "LaryArt by Lara", theme `#ff1c65`, icon `static/assets/stackrole.png`).
- `gatsby-plugin-sitemap` 6.15.0 + `gatsby-plugin-advanced-sitemap` 2.1.0 - Both sitemap plugins enabled (redundant; advanced-sitemap supersedes the basic one).

**Infrastructure:**
- `gatsby-plugin-netlify-cms` 6.22.0 - Injects Netlify CMS into the Gatsby build.
- `gatsby-plugin-netlify-cms-paths` 1.3.0 - Rewrites `/assets/...` media paths in markdown to CMS-managed paths (configured in `gatsby-config.js` with `cmsConfig: /static/admin/config.yml`).
- `gatsby-plugin-react-helmet` 6.15.0 - SSR support for react-helmet.
- `codemirror` 6.0.2 - Transitive (Netlify CMS markdown editor); not imported directly in `src/`.
- `seamless-immutable`, `redux`, `acorn`, `package-doctor`, `y18n`, `yarn` (as dep) - Present in `package.json` but **not imported anywhere in `src/`**; likely leftover from the starter template.

## Configuration

**Environment:**
- No `.env` files present; no `process.env` usage in `src/` or gatsby config files. All configuration is hardcoded in `gatsby-config.js`, `src/util/site.json`, and `static/admin/config.yml`.
- Site metadata (title, description, siteUrl `https://laryart.it`, image, twitterUsername `@simooooone`) lives in `src/util/site.json` and is loaded via `require` in `gatsby-config.js` (`siteMetadata: settings.meta`).
- `src/util/site.json` also contains `"ga": "UA-XXXXXXXXX-X"` — a placeholder Google Analytics ID that is **not wired to any plugin** (analytics is handled by Matomo instead).

**Build:**
- `gatsby-config.js` - Plugin registry (sitemap, matomo, filesystem sources, sharp, remark, sass, helmet, netlify-cms, manifest, offline).
- `gatsby-node.js` - `createPages` builds blog-post pages from markdown frontmatter `template` field + paginated `/blog` list (9 posts/page); `onCreateNode` adds slug fields.
- `netlify.toml` - Build: `publish = "public"`, `command = "npm run build"`, `NODE_VERSION = "10"` (stale), plugin `netlify-plugin-gatsby-cache`.
- `.nvmrc` - Node 20.
- `.prettierrc` / `.prettierignore` - Prettier settings.
- `.vscode/settings.json` - Editor settings (prettier.useTabs, tabSize 2, cSpell Italian word list).

## Platform Requirements

**Development:**
- Node.js 20 (`.nvmrc`)
- Yarn 1.22.22 (`yarn develop` for dev server, `yarn build` for production build)
- Local CMS editing requires `npx netlify-cms-proxy-server` (per `README.md` and `local_backend: true` in `static/admin/config.yml`)

**Production:**
- Netlify hosting (see INTEGRATIONS.md); site URL `https://laryart.it`
- Static output in `public/` (gitignored, generated at build)

---

*Stack analysis: 2026-08-18*
