# Phase 5: Image Pipeline + SEO Fixes - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase migrates every featured-image surface from the deprecated `gatsby-image` v3 (`Img` + `fluid` fragments) to `gatsby-plugin-image` (`GatsbyImage` + `gatsbyImageData`), removes the `tracedSVG` config in favor of BLURRED/DOMINANT_COLOR placeholders, fixes the og:image `[object Object]` bug, and delivers correct Italian SEO: `html lang="it"`, real Italian meta descriptions (no starter English text), and a clean privacy page. The body-image path (inline images inside post markdown via `gatsby-remark-images`) is NOT in scope for the component migration. No visual redesign — images must render as before.

</domain>

<decisions>
## Implementation Decisions

### gatsby-plugin-image Migration (IMAG-01)
- **D-01:** Install `gatsby-plugin-image` at the lockstep version **5.16.0** (per the Phase 3 registry-verified matrix — no gatsby-* plugin ships a `.16.1` patch; same rule as D-01 of 03-CONTEXT). **Reversibility:** reversible
- **D-02:** Migrate the three `Img`/`fluid` consumers — `src/templates/blog-post.js:82`, `src/templates/index-page.js:60`, `src/components/post-card.js:9` — to `GatsbyImage` + `getImage()` with `gatsbyImageData` fragments. `post-card.js` covers BOTH blog-list.js and blog-list-home.js (both feed PostCard — blog-list-home via StaticQuery). No `gatsby-image` imports may remain (success criterion 1). **Reversibility:** reversible
- **D-03:** Keep the existing per-surface sizing: blog-post featured image `srcSetBreakpoints: [350, 700, 1050, 1400]` / quality 80; index-page hero `[960, 1440]` / quality 80; card images `maxWidth: 540, maxHeight: 360` / quality 80. Use `layout: "constrained"` for all three surfaces (the legacy `fluid` equivalent; the images are not full-bleed). **Reversibility:** reversible
- **D-04:** Alt text and `objectFit: "cover"` / `objectPosition: "50% 50%"` carry over unchanged (post: `<title> - Featured image`). The `featured-image` className carries over (SCSS targets it). No visual redesign.
- **D-05:** After the migration, `gatsby-image` is no longer imported anywhere in `src/` — remove it from package.json. **Reversibility:** reversible

### Placeholders (IMAG-02)
- **D-06:** Remove `tracedSVG: true` from the `gatsby-remark-images` options in `gatsby-config.js:50` (IMAG-02). **Reversibility:** reversible
- **D-07:** The component surfaces use `placeholder: BLURRED` as the default; **DOMINANT_COLOR is reserved for the index-page hero** (the largest, above-the-fold image) to keep the hero's LCP contribution lean. **Reversibility:** reversible — change the enum value in one place
- **D-08:** `gatsby-remark-images` (body images inside post markdown) is left functional but NOT migrated to gatsby-plugin-image in this phase — its own options (maxWidth 1024, lazy) stay except for the tracedSVG removal. **Reversibility:** reversible

### og:image Fix (IMAG-03)
- **D-09:** The `Seo` component's `image` prop must accept a **URL string only**, never a processed-image object. Fix the bug in `src/components/seo.js:23` (`${siteUrl}${image}` interpolating a fluid object → `[object Object]`).
- **D-10:** In `src/templates/blog-post.js:72`, resolve the og:image URL with `getSrc()` from `gatsby-plugin-image` on the `gatsbyImageData` object; pass only that string into `<Seo image={...}>`. **Reversibility:** reversible
- **D-11:** Harden `seo.js`: non-string `image` values are ignored (rendered og:image/twitter:image/meta image are omitted or fall back to `defaultImage` from site.json) — belt-and-suspenders against future misuse. `site.json` `meta.image: /assets/heart.png` remains the defaultImage fallback.
- **D-12:** `src/pages/404.js` and `src/pages/thanks.js` keep their current usage (no `image` prop) — untouched.

### Italian SEO (SEOS-01, SEOS-02)
- **D-13:** `html lang="en-US"` → `lang="it"` in `src/components/seo.js:29`. **Reversibility:** reversible
- **D-14:** Remove all three redundant `link rel="alternate"` hreflang entries (`it-it`, `it`, `x-default` — all pointing at the same canonical URL) from `seo.js:30-32`. No hreflang alternates remain. **Reversibility:** reversible
- **D-15:** `src/templates/blog-list.js:102-105` — replace the English starter title/description ("Blog — Page X of Y" / "Stackrole base blog page X of Y") with real Italian copy. Pagination-aware: title includes the page number (e.g. "Blog — Pagina 2"), description is a genuine Italian sentence describing the blog (e.g. "I post del blog di LaryArt: ..."). Exact wording is the agent's discretion; must be natural Italian, no English.
- **D-16:** The "Previous"/"Next" pagination link labels in `blog-list.js:48,65` are starter English UI copy on an Italian site — translate to Italian ("Precedente"/"Successivo"). This is UI copy, in scope of SEOS-02's "no hardcoded English" intent and the same file. **Reversibility:** reversible
- **D-17:** `404.js` title "Page not found" and `thanks.js` title "Thank you" are English UI copy — translate to Italian ("Pagina non trovata" / "Grazie"). **Reversibility:** reversible
- **D-18:** `seo.js` uses `titleTemplate: "%s"` (from site.json meta) — the template resolves to just the page title; the hardcoded `titleTemplate` in site.json (`"%s"`) stays as-is, no change.

### Privacy Page (SEOS-03)
- **D-19:** Rebuild `src/content/pages/privacy.md` lines ~35-82: the raw embedded `<a>`/`<p>` HTML block and broken markdown (` ####` heading at line 83, stray `</p>` fragments, `[chiocciola]` email obfuscation at line 137) are converted to clean markdown. All links (Firefox, Chrome, Internet Explorer, Safari, Opera, Google, cookiechoices, Garante) preserved. Renders as valid content — no malformed HTML. **Reversibility:** reversible

### the agent's Discretion
- Exact Italian wording for the blog-list meta description and page title (D-15)
- Exact SCSS/className handling if `GatsbyImage` needs a wrapper to preserve the current `featured-image` layout behavior (fixed height vs intrinsic ratio)
- Whether the `gatsby-remark-images` `quality` option adjusts alongside the tracedSVG removal (keep 80 unless evidence suggests otherwise)
- Exact `gatsbyImageData` arg naming (e.g., `breakpoints` vs `srcSetBreakpoints` — verify against gatsby-plugin-image docs)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase & Requirements
- `.planning/ROADMAP.md` §Phase 5 — Goal, 5 success criteria, requirements IMAG-01..03 + SEOS-01..03
- `.planning/REQUIREMENTS.md` §IMAG-01, §IMAG-02, §IMAG-03, §SEOS-01, §SEOS-02, §SEOS-03 — Requirement definitions
- `.planning/phases/03-core-upgrade/03-CONTEXT.md` — D-01 (lockstep version matrix rule: plugins top out at .16.0), D-09 (gatsby-plugin-netlify-cms-paths KEEP + "revisit in Phase 5")
- `.planning/phases/04-mui-removal-form-reliability/04-CONTEXT.md` — D-06/D-08 precedent: `getSrc()`-style URL handling for SEO props; test-update discipline (update tests asserting removed behavior)
- `.planning/phases/01-test-scaffolding-performance-baseline/01-SUMMARY.md` — jest setup, `__mocks__/gatsby.js` manual mock (must be extended or updated for `gatsby-plugin-image` exports used in tests)

### Codebase Maps
- `.planning/codebase/CONCERNS.md` §Known Bugs — broken og:image (blog-post.js:72 → seo.js:23), §Tech Debt — hardcoded English meta (blog-list.js:104), lang="en-US" + redundant hreflang (seo.js:29-32), §Tech Debt — malformed privacy page HTML (privacy.md:55-101), §Dependencies at Risk — gatsby-image legacy (usage surface)
- `.planning/codebase/ARCHITECTURE.md` — Seo component pattern (helmet, useStaticQuery, og/twitter generation), PostCard shared by blog-list + blog-list-home, image pipeline constraint (gatsby-image v3 in 3 files)
- `.planning/codebase/CONVENTIONS.md` — Code style (Prettier, no semicolons, double quotes, arrowParens avoid)
- `.planning/codebase/STACK.md` — Current image stack (gatsby-image 3.11.0 + sharp 5.16.0), gatsby-remark-images config (maxWidth 1024, tracedSVG, lazy)

### Tests
- `src/templates/blog-list.test.js` — mocks `../components/seo` (jest.mock) — unaffected by seo.js changes, but the blog-list title/description changes (D-15/D-16) may need assertion updates
- `src/__mocks__/gatsby.js` — the manual Gatsby mock; must cover `gatsby-plugin-image` exports if any new test imports them (check whether components under test import the new image component — post-card is covered by blog-list.test.js)
- `.planning/phases/01-test-scaffolding-performance-baseline/01-SUMMARY.md` — mock patterns from Phase 1

### Content
- `src/content/pages/privacy.md` — the page to clean (D-19)
- `src/util/site.json` — `meta.image: /assets/heart.png` defaultImage fallback for Seo

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `gatsby-transformer-sharp` + `gatsby-plugin-sharp` 5.16.0 — already in lockstep; `gatsbyImageData` works with the existing sharp pipeline (no new processing deps)
- `src/components/post-card.js` — single card component feeding BOTH blog-list.js and blog-list-home.js (StaticQuery); migrate once, both lists covered
- `Seo` component — centralized meta/OG/Twitter generation; single place to fix lang, hreflang, and image-string hardening
- `src/util/site.json` `meta.image` — defaultImage fallback already wired into Seo

### Established Patterns
- Plain JavaScript (no TS), Prettier formatting, Italian UI copy and content
- Template-driven routing; StaticQuery in blog-list-home; pageQuery in templates
- Lockstep version discipline (Phase 3 D-01): gatsby-* plugins at .16.0
- Test-update discipline (Phase 4): when behavior changes, update the asserting test in the same change

### Integration Points
- `package.json` — add `gatsby-plugin-image` 5.16.0; remove `gatsby-image` ^3.11.0 after migration (D-05)
- `gatsby-config.js` — add `gatsby-plugin-image` to plugins array (required for SSR support); remove `tracedSVG: true` from gatsby-remark-images options (D-06)
- `src/templates/blog-post.js` — query swap `fluid` → `gatsbyImageData` (D-03 breakpoints); `<Img fluid>` → `<GatsbyImage image={getImage()}>`; `<Seo image={getSrc(...)}>` string (D-10)
- `src/templates/index-page.js` — hero query swap `fluid` → `gatsbyImageData` + DOMINANT_COLOR (D-07); `<Img>` → `<GatsbyImage>`
- `src/components/post-card.js` — card query/component swap (used by both list surfaces)
- `src/components/seo.js` — lang="it" (D-13), hreflang removal (D-14), image-string guard (D-11)
- `src/templates/blog-list.js` — Italian meta (D-15), Italian pagination labels (D-16)
- `src/pages/404.js`, `src/pages/thanks.js` — Italian titles (D-17)
- `src/content/pages/privacy.md` — markdown cleanup (D-19)
- `src/__mocks__/gatsby.js` — extend mock exports if tests need gatsby-plugin-image (check blog-list.test.js which renders PostCard)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard approaches per CONCERNS.md evidence and the locked requirement versions (gatsby-plugin-image 5.16.0 lockstep, BLURRED/DOMINANT_COLOR placeholders, getSrc() for og:image).

</specifics>

<deferred>
## Deferred Ideas

- **Body-image migration** — inline images inside post markdown (gatsby-remark-images → gatsby-plugin-image with remark plugin) — not this phase; only tracedSVG removal touches that path. Future candidate.
- **`gatsby-plugin-netlify-cms-paths` revisit** (Phase 3 D-09) — re-evaluate whether it still earns its place after the image migration; if the featured-image path rewriting is unaffected by gatsby-plugin-image, it stays.
- **Image CDN (Gatsby Cloud) / media pipeline** — explicitly Out of Scope in REQUIREMENTS.md (Netlify deployment).
- **robots.txt** — no robots.txt exists (CONCERNS.md §Missing Critical Features); not in this phase's requirements (sitemap plugin handles the XML side). Future phase.

</deferred>

---

*Phase: 5-Image Pipeline + SEO Fixes*
*Context gathered: 2026-08-19*
