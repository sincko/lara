# Feature Research

**Domain:** Static-site (Gatsby) modernization & performance optimization for a small artisan showcase site
**Researched:** 2026-08-18
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

For a small artisan showcase site, "users" are visitors who browse the portfolio/blog and contact the artisan. These features are non-negotiable for a modernization milestone — missing them makes the site feel broken or invisible in search.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Core Web Vitals pass (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at 75th percentile) | Google ranking signal; slow sites lose visitors; CWV are stable metrics (INP replaced FID in 2024) | MEDIUM | Measured via PageSpeed Insights (CrUX field data) + Lighthouse (lab). For a static site on Netlify CDN, green CWV is achievable and expected. |
| Modern image pipeline (`gatsby-plugin-image` with AVIF/WebP, srcset, lazy loading, aspect-ratio placeholders) | Legacy `gatsby-image` v3 is unmaintained; images without reserved dimensions are the #1 CLS cause; modern formats cut transfer size ~30-50% | MEDIUM | Mechanical migration for 4 files (`post-card.js`, `blog-list-home.js`, `blog-post.js`, `index-page.js`). Codemod exists (`gatsby-codemods`). Requires installing `gatsby-plugin-image`; sharp plugins already present. |
| Font loading that doesn't block render (self-hosted WOFF2, `font-display: swap`, preconnect) | Current `@import url(...)` inside `:root` in `_theme-variables.scss` is render-blocking and non-standard; fonts delay FCP/LCP and cause CLS on swap | LOW | Two families (Parisienne + Ubuntu). Self-host via `@fontsource` or `gatsby-plugin-webfonts`; or minimal fix: move import to top of stylesheet + preconnect. WOFF2-only is now the recommendation. |
| Bundle size reduction (drop MUI v4, remove unused deps) | MUI v4 is EOL and a known bundle bloat culprit (Gatsby docs explicitly cite Material UI as a >50-100kb commons offender); unused deps (codemirror, redux, seamless-immutable, typescript, prismjs, y18n, gatsby-background-image, package-doctor) inflate install/build | LOW | MUI only used by contact form (`formik.js`, `top-contacts.js`) — replace with plain styled inputs. Dep removal is `yarn remove` + build verification. |
| Dead code & asset cleanup (9.6 MB `static/assets/` with duplicate `.jpg`/`.jpeg` pairs, ~30 unused Facebook-export photos, GIMP `.xcf` sources) | Unreferenced binaries are published to the CDN and committed to git; every byte served costs load time; duplicates confuse CMS editing | LOW | ~20 files actually referenced in frontmatter. Dedup pairs, delete unreferenced, move `.xcf` out of `static/`. |
| Build reliability (Node 20 in `netlify.toml`, single lockfile, `node-sass` → `sass` dart-sass) | Core Value is "site must always build and deploy"; `NODE_VERSION = "10"` contradicts `.nvmrc`; node-sass is deprecated with known native-binding failures (the recurring build-break commits) | LOW | dart-sass is a drop-in for `gatsby-plugin-sass`; repo uses only local `@import`s so no resolution differences. |
| Performance baseline before/after (Lighthouse + PSI) | You cannot claim optimization without measurement; Gatsby's own guide mandates a testing tool + quantified per-change impact | LOW | Run Lighthouse on deploy preview vs live; take median of 3+ runs. Netlify deploy previews make this easy. |

### Differentiators (Competitive Advantage)

For a personal artisan showcase, differentiation is about *feeling* fast and polished, not feature breadth. These align with the Core Value (reliable build/deploy + contact form working).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Near-perfect Lighthouse score (95+) with sub-1s LCP | Most artisan sites (Wix/WordPress themes) score 40-70; a fast, image-rich portfolio is memorable and wins mobile visitors | MEDIUM | Achievable precisely because the site is small and static. The image migration + font fix + bundle cut are the three levers. |
| Self-hosted brand fonts (Parisienne script + Ubuntu) | Brand consistency without third-party dependency; eliminates Google Fonts as a failure point and privacy consideration (GDPR) | LOW | `@fontsource/parisienne` + `@fontsource/ubuntu`; subset to latin (Italian site — no latin-ext needed beyond standard accents; verify `ì/è/à` coverage in latin subset). |
| Privacy-respecting analytics (Matomo `disableCookies: true`) | GDPR/ePrivacy compliance without a consent banner; privacy is a selling point for EU artisan customers; privacy page already promises a banner — fix the mismatch | LOW | CONCERNS.md flags `disableCookies: false` today. Session-less tracking + opt-out is the lightweight fix; a consent banner is the heavier alternative (see Anti-Features). |
| Working PWA offline (fix duplicate manifest) | `gatsby-plugin-offline` already installed; deleting legacy `static/manifest.json` + icons removes duplicate/stale PWA metadata | LOW | Keep the generated manifest; delete the static legacy set. Small but real polish signal. |
| Correct SEO meta (fix `og:image` `[object Object]` bug, `lang="it"`, real Italian descriptions) | Social shares currently render broken og:image; `html lang="en-US"` on an Italian site hurts search; the image migration's `getSrc` helper directly fixes the og:image bug | LOW | Fixes are 1-2 lines each; they compound with the image migration (use `getSrc` for the og:image URL). |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Preact swap (`gatsby-plugin-preact`) | Shaves ~35-40kb of framework JS | Gatsby docs: "not recommended for sites with complex UI" — and even for simple sites it risks odd interactions and breaks React DevTools; the real win here is dropping MUI, not React | Remove MUI + unused deps; measure; only revisit if framework.js dominates the bundle |
| Partial Hydration / Slices | Gatsby's headline perf features | Enterprise-scale build-time features; this site has 6 templates and 19 posts — build is already linear and fast; adds config complexity for zero user-visible gain | Skip entirely; document as future consideration if the site grows 10x |
| Gatsby Cloud Image CDN | "Up to 300ms faster LCP" | Requires Gatsby Cloud hosting; deployment stays on Netlify (PROJECT.md constraint); Netlify CDN already serves same-origin assets | Local `gatsby-plugin-image` processing (already the plan) |
| Full TypeScript migration | Type safety | `typescript` is installed with no `tsconfig.json`; converting all of `src/` is churn with zero user-visible value for a 6-template site; the milestone is maintenance, not rewrite | Remove the unused `typescript` dep; optionally add ESLint later |
| Rewrite to Next.js/Remix | Gatsby 5 is in maintenance mode | Massive undertaking; PROJECT.md explicitly keeps Gatsby (5 → possibly 6) and Netlify; the site is small and static — Gatsby 5 keeps working | Attempt Gatsby 6 upgrade; if it fails, stay on 5 (maintenance mode is acceptable for a small static site) |
| Consent-banner framework (cookie-consent lib) | GDPR compliance for Matomo cookies | Adds JS, CLS risk (banner insertion), and UX friction; the lightweight fix exists | `disableCookies: true` in `gatsby-plugin-matomo` config — session-less tracking, no banner needed |
| `loadable-components` lazy loading | Defer below-the-fold code | Gatsby's recommended lazy-loading, but this site's pages are small; bundle reduction via dep removal achieves the same goal with less machinery | Remove MUI/unused deps first; re-evaluate only if a page bundle stays >150kb |
| `web-vitals` RUM instrumentation | Field-level CWV monitoring | Overkill for a hobby site with low traffic; CrUX + occasional PSI checks suffice; adds a script to every page | Use PageSpeed Insights (CrUX field data) + Lighthouse on deploy previews |
| Image CDN / Cloudinary migration | Offload media from git | CONCERNS.md flags it only as a *scaling* path at "very large media" — 9.6MB is not that; adds a third-party dependency and CMS workflow change | Asset cleanup (dedup + delete) now; revisit only if media grows significantly |

## Feature Dependencies

```
[Performance baseline (Lighthouse/PSI)]
    └──requires──> [nothing — do first]

[Image migration (gatsby-plugin-image)]
    └──requires──> [Install gatsby-plugin-image] (sharp plugins already present)
    └──enables──> [og:image fix via getSrc]
    └──enables──> [CLS improvement (aspect-ratio placeholders)]

[Font loading fix]
    └──requires──> [Remove @import from _theme-variables.scss]
    └──enables──> [LCP/FCP improvement]

[MUI removal]
    └──requires──> [Plain-CSS form rewrite (formik.js + top-contacts.js)]
    └──enables──> [Bundle size reduction]

[Bundle size reduction]
    └──requires──> [MUI removal] + [Unused dep removal]
    └──enables──> [INP improvement (less JS to parse/execute)]

[Asset cleanup]
    └──requires──> [Verify frontmatter featuredImage references]
    └──enables──> [Smaller repo, faster builds, less published weight]

[Build reliability]
    └──requires──> [node-sass → sass] + [netlify.toml Node 20] + [single lockfile]
    └──enables──> [All other work (safe to build/test)]

[CWV verification]
    └──requires──> [Image migration] + [Font fix] + [Bundle reduction]
    └──confirms──> [Milestone acceptance]
```

### Dependency Notes

- **Performance baseline requires nothing:** run Lighthouse/PSI on the live site *before* any change — it is the acceptance metric for the whole milestone.
- **Build reliability enables everything else:** every other feature must be verified with a `gatsby build`; fixing the Node/lockfile/sass mess first makes those builds trustworthy.
- **Image migration enables the og:image fix:** the migration guide explicitly notes `getSrc` replaces the old `src` access pattern — the broken `og:image` interpolation (`[object Object]`) is fixed by passing a real URL from the new API.
- **MUI removal enables bundle reduction:** MUI v4 (core + icons) is the single largest third-party JS in the commons bundle; removing it is the highest-leverage bundle cut.
- **Font fix and image migration both feed CWV:** fonts affect LCP/FCP/CLS; images affect LCP/CLS. They are independent but both must land before the final CWV verification.
- **Asset cleanup conflicts with nothing but must be careful:** deleting images requires checking `featuredImage:` paths in `src/content/posts/*.md` first (CONCERNS.md lists the ~20 referenced files).

## MVP Definition

### Launch With (this milestone)

The milestone is maintenance/refactoring only (PROJECT.md Out of Scope: no new features). "Launch" = the site builds, deploys, and measurably improves.

- [ ] Performance baseline captured (Lighthouse + PSI on live site) — the acceptance metric
- [ ] Build reliability fixed (dart-sass, Node 20 in netlify.toml, single yarn lockfile, unused deps removed) — everything else depends on trustworthy builds
- [ ] MUI v4 removed, contact form rewritten in plain CSS (with the success/failure redirect bug fixed) — biggest bundle cut + known-bug fix
- [ ] `gatsby-image` → `gatsby-plugin-image` migration (4 files) — CLS + LCP + og:image fix
- [ ] Font loading fixed (self-host WOFF2 or preconnect + top-level import) — LCP/FCP
- [ ] Asset cleanup (dedup `.jpg`/`.jpeg`, delete unreferenced, move `.xcf` out of `static/`) — published weight
- [ ] Final CWV verification (Lighthouse on deploy preview vs baseline) — proves the milestone

### Add After Validation (v1.x)

- [ ] Gatsby 6 upgrade attempt — only after the above lands and builds are green; if it fails, stay on Gatsby 5 (maintenance mode is acceptable for this site)
- [ ] Matomo `disableCookies: true` + privacy page cleanup — GDPR fix, independent of perf work
- [ ] ESLint flat config + minimal jest setup — makes future refactors safe (CONCERNS.md: zero tests today)
- [ ] `robots.txt` + single sitemap plugin (drop `gatsby-plugin-advanced-sitemap`) — SEO hygiene

### Future Consideration (v2+)

- [ ] Decap CMS migration (`netlify-cms-app` is EOL) — only when the admin UI needs attention
- [ ] Media library (Cloudinary/LFS) — only if media grows significantly past 9.6MB
- [ ] Partial Hydration / Slices — only if the site grows 10x in pages
- [ ] `web-vitals` RUM — only if traffic grows enough that CrUX lacks data

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Performance baseline (Lighthouse/PSI) | HIGH (enables all measurement) | LOW | P1 |
| Build reliability (dart-sass, Node 20, single lockfile) | HIGH (Core Value: must build/deploy) | LOW | P1 |
| MUI removal + plain-CSS form (with bug fix) | HIGH (bundle + known bug) | LOW | P1 |
| gatsby-image → gatsby-plugin-image | HIGH (CLS/LCP + og:image bug) | MEDIUM | P1 |
| Font loading fix | HIGH (LCP/FCP/CLS) | LOW | P1 |
| Asset cleanup (dedup/delete) | MEDIUM (weight, repo hygiene) | LOW | P2 |
| Unused dependency removal | MEDIUM (install/build surface) | LOW | P1 (bundled with build reliability) |
| Matomo disableCookies + privacy page | MEDIUM (GDPR) | LOW | P2 |
| PWA manifest dedup | LOW (polish) | LOW | P2 |
| SEO meta fixes (lang="it", Italian descriptions) | MEDIUM (search) | LOW | P2 |
| Gatsby 6 upgrade | LOW (maintenance mode OK) | HIGH | P3 |
| ESLint + jest | LOW (dev-only) | MEDIUM | P3 |

**Priority key:**
- P1: Must have for this milestone (perf + reliability core)
- P2: Should have, add when possible (hygiene + compliance)
- P3: Nice to have, future consideration (riskier/larger)

## Competitor Feature Analysis

Competitors for laryart.it are other artisan showcase sites — typically Wix/WordPress themes, Etsy shops, or unoptimized static sites. The comparison is about performance posture, not feature sets.

| Feature | Typical Artisan Site (Wix/WordPress) | Optimized Static Site (this project) | Our Approach |
|---------|--------------|--------------|--------------|
| Page weight | 2-5MB+ (theme bloat, unoptimized images, page builders) | 100-500KB (optimized images, no UI framework) | gatsby-plugin-image + asset cleanup + MUI removal |
| LCP | 4-8s (render-blocking themes, third-party fonts) | 1-2s (static HTML, self-hosted fonts, preload) | Font fix + image migration + Netlify CDN |
| CLS | 0.2-0.5 (no image dimensions, ad/banner injection) | <0.05 (aspect-ratio placeholders, no dynamic injection) | gatsby-plugin-image placeholders; no consent banner |
| Mobile experience | Often poor (desktop-first themes) | Fast (responsive SCSS, lazy images) | Keep existing SCSS; verify via Lighthouse mobile |
| GDPR posture | Cookie banners everywhere, third-party trackers | No cookies (Matomo disableCookies) | disableCookies: true |
| Build/deploy reliability | Hosted (no build) | Must build — currently fragile | dart-sass + Node 20 + single lockfile |
| Social sharing | Generic og tags | Broken og:image today → fixed via getSrc | getSrc from gatsby-plugin-image |

## Sources

- web.dev "Web Vitals" (official thresholds: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at 75th percentile; INP stable since 2024) — https://web.dev/articles/vitals — HIGH confidence
- web.dev "Optimize LCP" (LCP subparts, resource discovery, fetchpriority, never lazy-load LCP image, render-blocking CSS/JS) — https://web.dev/articles/optimize-lcp — HIGH confidence
- web.dev "Optimize CLS" (images without dimensions = #1 cause; width/height + aspect-ratio; font swap shifts; bfcache) — https://web.dev/articles/optimize-cls — HIGH confidence
- web.dev "Best practices for fonts" (WOFF2-only, self-hosting, font-display strategies, preconnect, subsetting) — https://web.dev/articles/font-best-practices — HIGH confidence
- Gatsby docs "Using the Gatsby Image plugin" (StaticImage vs GatsbyImage, getImage/getSrc, sharp plugin requirements) — https://www.gatsbyjs.com/docs/how-to/images-and-media/using-gatsby-plugin-image/ — HIGH confidence
- Gatsby docs "Migrating from gatsby-image to gatsby-plugin-image" (codemod, fluid → fullWidth/constrained, formats AVIF/WebP, getSrc for SEO) — https://www.gatsbyjs.com/docs/reference/release-notes/image-migration-guide/ — HIGH confidence
- Gatsby docs "Improving Site Performance" (process: baseline → monitor → quantify; bundle audit: >50-100kb third-party imports, Material UI cited as common culprit; fonts: WOFF2, self-host, latin subsets; Preact caveats; loadable-components) — https://www.gatsbyjs.com/docs/how-to/performance/improving-site-performance/ — HIGH confidence
- Local codebase evidence (CONCERNS.md, ARCHITECTURE.md, package.json, `_theme-variables.scss`, GraphQL fragments) — HIGH confidence

---
*Feature research for: LaryArt modernization & optimization milestone*
*Researched: 2026-08-18*
