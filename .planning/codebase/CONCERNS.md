# Codebase Concerns

**Analysis Date:** 2026-08-18

## Tech Debt

**Dead components (unused source files):**
- Issue: `src/components/old-form.js` (starter demo SignupForm from Formik docs) and `src/components/form-pulito.js` (a raw JSX `<form>` with `TextField`/`Button` but no imports — it would not even compile if imported) are never imported anywhere.
- Files: `src/components/old-form.js`, `src/components/form-pulito.js`
- Impact: Confusing for future edits; `form-pulito.js` is syntactically invalid as a module (leading `;` expression statement with unbound JSX identifiers).
- Fix approach: Delete both files. The live form is `src/components/formik.js`.

**Unused runtime dependencies:**
- Issue: Dependencies installed but never referenced in `src/`:
  - `codemirror` (needed by netlify-cms-app internally, listed separately)
  - `seamless-immutable`, `redux` (devDep), `react-refresh` (devDep), `typescript` (devDep, no `tsconfig.json` anywhere), `gatsby-background-image`, `y18n`, `prismjs` (direct — only used transitively via `gatsby-remark-prismjs`), `package-doctor`
- Files: `package.json` (lines 26, 30, 50, 56, 57, 62, 65, 66, 67)
- Impact: Larger install surface, slower builds, more audit noise; `y18n` and `yarn` (line 58) are remnants of npm-audit/Netlify-build hacks (see git log `a66d212`, "inseritpo yarn 1.22.22").
- Fix approach: Remove unused entries with `npm uninstall` / `yarn remove`; verify `gatsby build` still passes.

**Double lockfiles:**
- Issue: Both `yarn.lock` (617 KB) and `package-lock.json` (1 MB) are committed; `.prettierignore` ignores only `package-lock.json`. Git history shows repeated regeneration churn of both (`a66d212`, `198d68f`, `c2cdc79`).
- Files: `yarn.lock`, `package-lock.json`, `.prettierignore`
- Impact: Drift risk — Netlify will prefer `yarn.lock` (yarn v1 detected) while local `npm install` uses the other; dependency resolution can differ between environments.
- Fix approach: Pick one package manager (yarn, per `packageManager` field in `package.json`), delete the other lockfile, commit once.

**Stale starter/config remnants:**
- Issue: `src/util/site.json` still carries `"ga": "UA-XXXXXXXXX-X"` placeholder — no Google Analytics plugin is wired in `gatsby-config.js`; README still claims the starter's "Add Google Analytics" feature and references missing assets (`static/assets/screenshot.png`, `twitter-header.jpg`), plus a Netlify badge for a different site.
- Files: `src/util/site.json:10`, `README.md`, `gatsby-config.js`
- Impact: Misleading documentation; dead config field.
- Fix approach: Remove the `ga` field, rewrite README for laryart.it.

**Hardcoded English/starter copy in UI:**
- Issue: `src/templates/blog-list.js:104` emits meta description "Stackrole base blog page X of Y" — stale starter text on a live Italian site. `src/components/seo.js:29` hardcodes `html lang="en-US"` and `hrefLang="it-it"/"it"/"x-default"` alternates all pointing to the same URL.
- Files: `src/templates/blog-list.js`, `src/components/seo.js`
- Impact: Wrong page language declaration for SEO; meaningless duplicate hreflang entries.
- Fix approach: Set `lang="it"`, drop the redundant alternates, write a real description.

**Commented-out config and dead code paths:**
- Issue: `gatsby-config.js:17-19` has commented-out `siteMetadata.siteUrl`; `gatsby-node.js:7` has commented-out `blogPost` resolve; `gatsby-node.js:82-91` `onCreateNode` slug-field creation is dead (page creation uses `frontmatter.slug` from `src/content/**`, not the generated field).
- Files: `gatsby-config.js`, `gatsby-node.js`
- Impact: Confusion about the source of truth for slugs/siteUrl.
- Fix approach: Delete commented blocks; remove `onCreateNode` or use it as slug fallback.

**Malformed privacy page HTML:**
- Issue: `src/content/pages/privacy.md` embeds raw HTML with stray `</p>`/`<p>` fragments (lines 55-101) and broken markdown (` ####` heading at line 103), causing broken rendering; it also obfuscates the contact email as "s.foschi [chiocciola] protonmail.com".
- Files: `src/content/pages/privacy.md`
- Impact: Rendered privacy policy looks broken to visitors; GDPR-relevant page should be clean.
- Fix approach: Convert the embedded HTML to clean markdown.

**Legacy static PWA assets:**
- Issue: `static/manifest.json` ("App", android-only icons) and the `static/` icon set are legacy; `gatsby-plugin-manifest` generates its own manifest/icons into `public/` — both get published.
- Files: `static/manifest.json`, `static/*.png`, `static/browserconfig.xml`, `public/manifest.json`
- Impact: Duplicate/stale PWA metadata served alongside the generated one.
- Fix approach: Delete the static legacy set; rely on `gatsby-plugin-manifest` config in `gatsby-config.js:85-96`.

**Dual sitemap plugins:**
- Issue: Both `gatsby-plugin-sitemap` and `gatsby-plugin-advanced-sitemap` are enabled in `gatsby-config.js:21,84`.
- Files: `gatsby-config.js`
- Impact: Two sitemaps generated, duplicated crawling instructions; the advanced plugin is unmaintained.
- Fix approach: Keep one (the official `gatsby-plugin-sitemap`), remove the other.

## Known Bugs

**Contact form reports success even when email delivery fails:**
- Symptoms: `src/components/formik.js` onSubmit calls `emailjs.sendForm(...)`; the `.catch` only `console.log`s the error, then execution always continues to `document.location.assign("/thanks")` — the user sees "Ho ricevuto il tuo messaggio" (thanks page) even when the email was never sent.
- Files: `src/components/formik.js:39-52`, `src/pages/thanks.js`
- Trigger: Any EmailJS failure (quota exceeded, service outage, invalid template).
- Workaround: None for visitors; the site owner simply never receives the message.
- Fix: Only redirect on `.then`; on `.catch` show an inline error and keep the form values (`setSubmitting(false)` without reset).

**Broken og:image on blog posts:**
- Symptoms: `src/templates/blog-post.js:72` passes `image={Image}` where `Image` is a `gatsby-image` fluid *object* (or `""`); `src/components/seo.js:23` interpolates `${siteUrl}${image}` — producing `https://laryart.it[object Object]` in the `og:image` meta tag whenever a post has a featured image.
- Files: `src/templates/blog-post.js:55-72`, `src/components/seo.js:20-25`
- Trigger: Any blog post with `featuredImage` frontmatter shared to social platforms.
- Workaround: None.
- Fix: Pass a resolvable URL (e.g., `frontmatter.featuredImage.childImageSharp.fluid.src` or the absolute `/assets/...` path) into `<Seo image={...}>`; make Seo ignore non-string values.

**Navigation menu not visible (likely regression):**
- Symptoms: In `src/components/navigation.js`, `this.state.showMenu` toggles CSS classes on the trigger button, but the `<ul>` menu list never receives any class based on `showMenu` — the `<ul>` is rendered unconditionally with no open/close styling hook (the class `is-active` is only on the button).
- Files: `src/components/navigation.js:44-67`
- Trigger: On viewports where the menu is collapsed by CSS (see `.menu-trigger` styles in `src/assets/scss/style.scss`), tapping the hamburger cannot reveal the menu if the stylesheet relies on a state class on the list.
- Workaround: If the starter's CSS opens the list on `:hover`/focus, it may partially work; verify on mobile.
- Fix: Apply `showMenu ? "is-open" : ""` (or similar) to the `<ul>` and add matching SCSS; add `aria-expanded`/`aria-label` to the button.

## Security Considerations

**EmailJS credentials committed in client source:**
- Risk: `src/components/formik.js:8` hardcodes `emailjs.init("user_06xz85hi92oABMZqCIUu7")` plus service/template IDs in the submit handler. These are public-client keys by design, but they enable anyone to spam the owner's EmailJS account (quota exhaustion, spoofed messages from the contact form).
- Files: `src/components/formik.js:7-8,40-41`
- Current mitigation: None beyond EmailJS rate limits.
- Recommendations: Restrict the EmailJS service to the laryart.it origin (EmailJS dashboard setting), add rate limiting / honeypot verification server-side if possible, and consider moving form delivery to the native Netlify form handler (the form already carries `data-netlify="true"` attributes).

**`dangerouslySetInnerHTML` on CMS-authored markdown:**
- Risk: Four templates render raw markdown HTML: `src/templates/index-page.js:49`, `src/templates/blog-post.js:96`, `src/templates/laryart.js:28`, `src/templates/privacy.js:38`. Netlify CMS git-gateway editors are trusted, but a compromised CMS account or malicious commit can inject arbitrary HTML/scripts into the built pages.
- Files: `src/templates/index-page.js`, `src/templates/blog-post.js`, `src/templates/laryart.js`, `src/templates/privacy.js`
- Current mitigation: `gatsby-transformer-remark` does not sanitize HTML by default.
- Recommendations: Add `rehype-sanitize`-style filtering (e.g., `gatsby-remark-html-attribute`-type hardening or sanitize output at build), and restrict CMS write access.

**Tracking without consent banner:**
- Risk: `gatsby-plugin-matomo` is configured with `disableCookies: false` (`gatsby-config.js:28`) — cookies are set before any consent. The site is subject to EU GDPR/ePrivacy; `src/content/pages/privacy.md` itself describes the required banner ("mostrare ai visitatori un banner... subordinare la sua accettazione") but no consent banner or opt-out widget exists anywhere in `src/`.
- Files: `gatsby-config.js:22-30`, `src/content/pages/privacy.md:15`
- Current mitigation: Matomo claims IP anonymization in the privacy text, but tracking cookies are enabled.
- Recommendations: Set `disableCookies: true` (Matomo then uses session-less tracking with an opt-out), or add a consent banner (e.g., `@matomo-org/matomo-react`/cookie-consent pattern) before enabling cookies.

**Hardcoded Google site verification token:**
- Risk: `src/components/seo.js:61-64` hardcodes `google-site-verification` content — not sensitive, but it is a site-control token; if the domain is ever transferred, the token should rotate.
- Files: `src/components/seo.js`
- Recommendations: Move to `site.json` metadata; no urgent action.

## Performance Bottlenecks

**Image duplication and unused binary weight:**
- Problem: `static/assets/` (9.6 MB, 61 files) contains 8+ exact duplicate pairs of the same photo in both `.jpg` and `.jpeg` (e.g., `trilli.jpg`/`trilli.jpeg`, `topolino.jpg`/`topolino.jpeg`, `pluto-2.jpg`/`pluto-2.jpeg`), ~30 unused Facebook-export photos named by numeric ID (e.g., `117107155_184877189923606_..._o.jpg`), unused logos (`logo-bianco2.png`, `logo-bianco-old.png`, `logo-rosa-old.png`), GIMP sources (`logo-bianco.xcf`, `logo-rosa.xcf`), and unused images (`home-2.jpg`, `trilly.jpg`, `fiore.jpg`, `stackrole-spin-circle.png`).
- Files: `static/assets/` (see `src/content/posts/*.md` frontmatter for the ~20 actually-referenced files)
- Cause: Media uploaded through Netlify CMS without cleanup, and repeated saves producing dual extensions.
- Improvement path: De-duplicate the `.jpg`/`.jpeg` pairs (keep one, fix `featuredImage:` paths in `src/content/posts/2024-08-15-*.md`), delete unreferenced binaries, keep `.xcf` sources out of the repo (or move to a `design/` folder outside `static/`).

**Google Fonts loaded via SCSS `@import url(...)` inside `:root`:**
- Problem: `src/assets/scss/_theme-variables.scss:8-9` imports Google Fonts CSS via `@import url(...)` nested inside the `:root` rule — non-standard CSS (Sass hoists it, but it blocks CSS parsing and render). Fonts are render-blocking and fetched from a third-party origin.
- Files: `src/assets/scss/_theme-variables.scss`
- Cause: Starter template pattern.
- Improvement path: Move `@import` to the top of `style.scss` or use `<link rel="preconnect">` + `font-display: swap`; better, self-host with `gatsby-plugin-webfonts`/`@fontsource`.

**Duplicate content queries:**
- Problem: The same blog-list GraphQL query (same sorting, same `fluid` image fragments) is duplicated between `src/templates/blog-list.js:9-38` and `src/components/blog-list-home.js:28-57` (home variant also selects `html` unnecessarily at line 39).
- Files: `src/templates/blog-list.js`, `src/components/blog-list-home.js`
- Improvement path: Extract a shared fragment or hook.

## Fragile Areas

**Build configuration contradictions (Netlify):**
- Files: `netlify.toml`, `.nvmrc`
- Why fragile: `netlify.toml:6` pins `NODE_VERSION = "10"` while `.nvmrc` declares `20`; Gatsby 5.15 requires Node ≥ 18. Recent commits (`4c35cb0` "Cambiata versione di nodejs", `198d68f` "Aggiornate le dipendenze per la riattivazione del sito su netlify", `a66d212`) show the build was already broken and fixed by trial-and-error. The mismatch means the next Netlify cache wipe or dependency bump can break the build again with confusing Node-version errors.
- Safe modification: Set `NODE_VERSION = "20"` in `netlify.toml` to match `.nvmrc`, test a clean `gatsby build` locally, then clear the Netlify build cache.
- Test coverage: None (see below).

**Unvalidated page template resolution:**
- Files: `gatsby-node.js:44-48`
- Why fragile: `createPage` resolves `src/templates/${frontmatter.template}.js` from raw frontmatter. Any page/post edited in Netlify CMS to remove or mistype `template` crashes the whole build with `path.resolve` of `undefined`.
- Safe modification: Add a whitelist check (`['blog-post','index-page','laryart','privacy','contatti'].includes(template)`) and `reporter.panicOnBuild` with the offending file name; consider defaulting missing `template` to `blog-post` for posts.

**Contact form (mixed EmailJS + Netlify attributes):**
- Files: `src/components/formik.js`
- Why fragile: The form declares `data-netlify="true"` (server-side fallback) but Formik intercepts submission and sends via EmailJS; the honeypot field (`bot-field`) is only honored by the Netlify path, not EmailJS. Both delivery mechanisms claim the same form-name, and failure handling is broken (see Known Bugs).
- Safe modification: Pick one channel: either remove the JS handler and use the pure Netlify form (delete `emailjs-com`), or keep EmailJS and drop the misleading `data-netlify` attributes, add a `name`/`action`-agnostic submission flow with error UI.
- Test coverage: None.

## Scaling Limits

**Blog pagination:**
- Current capacity: 19 posts, 9 per page → 3 pages (`gatsby-node.js:64-78`).
- Limit: None hard-coded; pagination logic is simple and fine. Watch that `gatsby-node.js` builds one page per post — with hundreds of posts the build stays linear (fine for this site).
- Scaling path: None required; keep `postsPerPage = 9`.

**Netlify CMS + git-gateway media:**
- Current capacity: 61 files / 9.6 MB in `static/assets/`.
- Limit: Netlify git-Gateway repos degrade with very large media; every image is committed to git history (87 image files tracked).
- Scaling path: Move media to a Git LFS / Netlify Large Media setup or a remote media library (e.g., Cloudinary) if the asset count grows significantly.

## Dependencies at Risk

**Gatsby 5.15.0 (core):**
- Risk: Gatsby 5.x is the final Gatsby major line; upstream moved to maintenance mode in favor of Gatsby 6 and the Framework (Next.js-style) direction. `gatsby@5.15.0` is pinned exactly.
- Impact: No feature updates; security fixes only through the maintenance window; eventual Node EOL mismatch.
- Migration plan: Evaluate a jump to Gatsby 6 when Netlify builds allow, or plan a rewrite onto Next.js/Remix — a large undertaking given this is a 5-file-template site; alternatively accept maintenance mode (site is small and static).

**`@material-ui/core` ^4.12.4 / `@material-ui/icons` ^4.11.3 (EOL):**
- Risk: MUI v4 is end-of-life (renamed `@mui/material` in v5, 2021). No security fixes.
- Impact: Only used by the contact form (`src/components/formik.js`, `src/components/top-contacts.js`).
- Migration plan: Small surface — replace with plain styled inputs (the form is simple) or migrate to `@mui/material` v7.

**`node-sass` ^9.0.0 (deprecated):**
- Risk: `node-sass` is deprecated (libsass); v9 has known install failures on new Node versions (native bindings). It is a build-time hard requirement via `gatsby-plugin-sass`.
- Impact: The recurring "errore di compilazione" commits in git history are consistent with node-sass breakage.
- Migration plan: Replace with `sass` (dart-sass) — drop-in for `gatsby-plugin-sass`; verify no `@import` resolution differences (this repo uses only local `@import`s).

**`netlify-cms-app` ^2.15.72 (EOL):**
- Risk: Netlify CMS was discontinued and forked as Decap CMS; v2.15 no longer receives updates.
- Impact: Admin UI at `/admin` stops getting fixes; future Netlify/Identity changes may break git-gateway auth.
- Migration plan: Switch to `decap-cms` + `gatsby-plugin-decap-cms` (near drop-in; config.yml compatible) when the admin UI needs attention.

**`emailjs-com` ^3.2.0 (deprecated):**
- Risk: Package renamed to `@emailjs/browser` in v4; v3 still works but is unmaintained.
- Impact: Contact form delivery (see Known Bugs).
- Migration plan: `npm uninstall emailjs-com && npm install @emailjs/browser`, adjust import; or drop EmailJS entirely for the native Netlify form.

**`gatsby-image` / `gatsby-background-image` (legacy):**
- Risk: `gatsby-image` is the pre-Gatsby-4 image component; superseded by `gatsby-plugin-image`. Both are unmaintained.
- Impact: Used in `src/components/post-card.js`, `src/components/blog-list-home.js` (indirectly), `src/templates/blog-post.js`, `src/templates/index-page.js`. Keeps working on Gatsby 5 but no fixes.
- Migration plan: Migrate to `gatsby-plugin-image`'s `GatsbyImage` + `getImage` — mechanical for this small component set; pair with the Gatsby 6 evaluation.

**`gatsby-plugin-netlify-cms` 6.22.0 / `gatsby-plugin-advanced-sitemap` ^2.1.0:**
- Risk: Both unmaintained; advanced-sitemap duplicates the official sitemap plugin (see Tech Debt).
- Impact: Admin integration and sitemap generation.
- Migration plan: Part of the Decap CMS and single-sitemap cleanup above.

## Missing Critical Features

**No tests whatsoever:**
- Problem: `npm test` is a stub that prints "Write tests! -> https://gatsby.dev/unit-testing" and **exits 1** (`package.json:21`). Zero test files exist in the repo.
- Blocks: Safe refactors (form logic, pagination, template resolution), CI with a test gate, regression detection for the known bugs above.
- Fix: Add a minimal `jest` + `@testing-library/react` setup covering `src/components/formik.js` (validation + submit-failure path) and the `gatsby-node.js` page-creation logic; make `npm test` green so Netlify CI can run it.

**No linting/type-checking:**
- Problem: No ESLint config; `typescript` installed with no `tsconfig.json`. Prettier is the only guard, and it cannot catch the broken `form-pulito.js` or unused variables.
- Files: (repo root), `package.json`
- Fix: Add ESLint 9 flat config with `eslint-plugin-react`, wire a `lint` script; or add a minimal `tsconfig.json` + `tsc --noEmit`.

**No robots.txt:**
- Problem: `static/robots.txt` does not exist and no plugin generates one; crawlers get no explicit directives.
- Files: (repo root)
- Fix: Add `static/robots.txt` (allow all, reference the sitemap) or use the sitemap plugin's robots option.

## Test Coverage Gaps

**Untested area:** All — the site has zero automated tests.
- What's not tested: Contact form validation + EmailJS failure handling (`src/components/formik.js`); blog pagination math (`src/templates/blog-list.js`); page creation from frontmatter (`gatsby-node.js`); SEO meta generation (`src/components/seo.js`, where the og:image bug lives).
- Files: `src/components/formik.js`, `src/templates/blog-list.js`, `gatsby-node.js`, `src/components/seo.js`
- Risk: The known bugs above shipped and survived months of live use — any refactor has a high chance of silently regressing the same paths.
- Priority: High

---

*Concerns audit: 2026-08-18*
