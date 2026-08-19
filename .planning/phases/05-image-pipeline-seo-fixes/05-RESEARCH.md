# Phase 5: Image Pipeline + SEO Fixes - Research

**Researched:** 2026-08-19
**Domain:** gatsby-plugin-image migration, sharp image processing, react-helmet SEO output, markdown cleanup
**Confidence:** HIGH (stack/API mechanics), MEDIUM (visual parity details)

## Summary

This phase migrates three featured-image surfaces from legacy `gatsby-image` v3 (`Img` + `fluid`) to `gatsby-plugin-image` (`GatsbyImage` + `gatsbyImageData`), removes `tracedSVG` from the `gatsby-remark-images` config, fixes the og:image `[object Object]` bug via `getSrc()`, delivers Italian SEO (lang, hreflang removal, meta copy, pagination labels, 404/thanks titles), and rebuilds the malformed privacy page as clean markdown.

**Headline finding — version correction:** `gatsby-plugin-image` **5.16.0 does not exist**. The npm registry has no 5.x line for this package; the latest stable is **3.16.0** (published 2026-06-30, current `latest` dist-tag). The plugin is versioned on its own track (2.x for Gatsby 4, 3.x for Gatsby 5) independently of the main Gatsby package version. Its internal dependency set (gatsby-core-utils 4.16.0, gatsby-plugin-utils 4.16.0, babel-plugin-remove-graphql-queries 5.16.0) IS the `.16` lockstep family, so `3.16.0` is the correct "lockstep-era" release, and its peerDependencies (`gatsby: ^5.0.0-next`, `react: ^18.0.0`, `gatsby-plugin-sharp: ^5.0.0-next`, `gatsby-source-filesystem: ^5.0.0-next`) all match the installed Gatsby 5.16.1 / sharp 5.16.0 / React 18 stack. The claim in 05-CONTEXT D-01 and 05-UI-SPEC ("5.16.0 per the Phase 3 registry-verified matrix") is factually wrong — the Phase 3 matrix (03-CONTEXT D-01) listed 13 packages and did **not** include gatsby-plugin-image. **The plan MUST install `gatsby-plugin-image@3.16.0` exactly; `5.16.0` will fail to resolve.**

All UI-SPEC API claims otherwise verified against the installed gatsby-plugin-sharp 5.16.0 source and Gatsby docs: `maxWidth`/`maxHeight` deprecated → `width`/`height`; `breakpoints` is honored for `constrained` layout (passes through `responsiveImageSizes`); `placeholder` enum `BLURRED`/`DOMINANT_COLOR`; `transformOptions` defaults are `fit: "cover"`, `cropFocus: "attention"` — so the card crop parity **requires** the explicit `cropFocus: CENTER`; `GatsbyImage` `className` lands on the wrapper, `imgClassName` on the inner `<img>`.

The one genuine visual-parity risk is the **blog-post 50vh banner**: legacy `Img` with `objectFit="cover"` absolutely fills the `min-height: 50vh` wrapper (center crop), while `constrained` GatsbyImage flows the image at its natural ratio inside the sizer box — for landscape images the rendered image will be shorter than 50vh, and for portrait images the bottom will be clipped. A documented absolute-fill CSS pattern restores exact legacy rendering; the plan must include a held-out visual check (per the UI-SPEC's own 🧪 backstops) and the conditional fix.

**Primary recommendation:** Install `gatsby-plugin-image@3.16.0` (NOT 5.16.0), register it in `gatsby-config.js` plugins, migrate the three surfaces with `gatsbyImageData(layout: "constrained", width/height, breakpoints, placeholder, transformOptions)`, resolve og:image with `getSrc()`, harden `seo.js` with a string-only guard, translate the SEO copy, and verify via built-HTML inspection (`public/` grep commands documented below) plus the blog-list.test.js co-change.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Install `gatsby-plugin-image` at the lockstep version **5.16.0** ... **RESEARCH CORRECTION: no 5.x exists; install `3.16.0`** (see Summary and Standard Stack).
- **D-02:** Migrate the three `Img`/`fluid` consumers — `src/templates/blog-post.js:82`, `src/templates/index-page.js:60`, `src/components/post-card.js:9` — to `GatsbyImage` + `getImage()` with `gatsbyImageData` fragments. `post-card.js` covers BOTH blog-list.js and blog-list-home.js. No `gatsby-image` imports may remain.
- **D-03:** Keep per-surface sizing: blog-post featured image `srcSetBreakpoints: [350, 700, 1050, 1400]` / quality 80; index-page hero `[960, 1440]` / quality 80; card images `maxWidth: 540, maxHeight: 360` / quality 80. Use `layout: "constrained"` for all three surfaces.
- **D-04:** Alt text and `objectFit: "cover"` / `objectPosition: "50% 50%"` carry over unchanged (post: `<title> - Featured image`). The `featured-image` className carries over.
- **D-05:** After migration, remove `gatsby-image` from package.json.
- **D-06:** Remove `tracedSVG: true` from `gatsby-remark-images` options in `gatsby-config.js:50`.
- **D-07:** Component surfaces use `placeholder: BLURRED` default; **DOMINANT_COLOR reserved for index-page hero**.
- **D-08:** `gatsby-remark-images` body-image path left functional, NOT migrated; only tracedSVG removal.
- **D-09:** `Seo` component's `image` prop accepts a **URL string only**; fix `${siteUrl}${image}` interpolating a fluid object → `[object Object]` (seo.js:23).
- **D-10:** In `blog-post.js:72`, resolve og:image URL with `getSrc()` from `gatsby-plugin-image`; pass only the string into `<Seo image={...}>`.
- **D-11:** Harden `seo.js`: non-string `image` values ignored → omit or fall back to `defaultImage` from site.json.
- **D-12:** `404.js` and `thanks.js` keep current usage (no `image` prop) — untouched except titles (D-17).
- **D-13:** `html lang="en-US"` → `lang="it"` in `seo.js:29`.
- **D-14:** Remove all three redundant hreflang alternates (`it-it`, `it`, `x-default`) from `seo.js:30-32`.
- **D-15:** `blog-list.js:102-105` — replace English starter title/description with real Italian copy; pagination-aware title; natural Italian, no English.
- **D-16:** "Previous"/"Next" pagination labels in `blog-list.js:48,65` → "Precedente"/"Successivo".
- **D-17:** `404.js` title "Page not found" → "Pagina non trovata"; `thanks.js` title "Thank you" → "Grazie".
- **D-18:** `titleTemplate: "%s"` in site.json stays as-is.
- **D-19:** Rebuild `src/content/pages/privacy.md` lines ~35-82 (and trailing raw `<a>` blocks): raw HTML → clean markdown, all links preserved, ` ####` heading fixed, `[chiocciola]` email deobfuscated.

### the agent's Discretion
- Exact Italian wording for the blog-list meta description and page title (D-15)
- Exact SCSS/className handling if `GatsbyImage` needs a wrapper to preserve the current `featured-image` layout behavior (fixed height vs intrinsic ratio)
- Whether the `gatsby-remark-images` `quality` option adjusts alongside the tracedSVG removal (keep 80 unless evidence suggests otherwise)
- Exact `gatsbyImageData` arg naming (e.g., `breakpoints` vs `srcSetBreakpoints` — verify against gatsby-plugin-image docs) — **resolved: `breakpoints`, works for constrained**

### Deferred Ideas (OUT OF SCOPE)
- Body-image migration (gatsby-remark-images → gatsby-plugin-image remark plugin) — future
- `gatsby-plugin-netlify-cms-paths` revisit (Phase 3 D-09) — stays unless featured-image path rewriting is affected (it is not: paths are resolved by sharp, not the CMS plugin)
- Image CDN (Gatsby Cloud) / media pipeline — out of scope (Netlify deployment)
- robots.txt — future phase

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IMAG-01 | gatsby-image migrated to gatsby-plugin-image across blog-post, index-page, blog-list, post-card, blog-list-home | Fragment swap + component swap per surface documented in Code Examples; `breakpoints`/`width`/`height`/`transformOptions` args verified against installed sharp 5.16.0; SSR registration in gatsby-config required |
| IMAG-02 | tracedSVG removed; BLURRED/DOMINANT_COLOR placeholders | Verified: sharp 5.16.0 already falls back to blurred with a console warning; removal is behaviorally neutral; `placeholder` enum values confirmed |
| IMAG-03 | og:image bug fixed via getSrc() — no [object Object] | `getSrc()` returns `images.fallback.src` string (verified in hooks.ts); current bug confirmed in built HTML (`https://laryart.it[object Object]`); Seo string guard design documented |
| SEOS-01 | html lang="it"; hreflang alternates removed | Current built HTML shows `lang="en-US"` + 3 hreflang links (confirmed); single Helmet block change in seo.js |
| SEOS-02 | Hardcoded English starter meta replaced with real Italian | blog-list.js:102-105, pagination labels :48,:65, 404/thanks titles; UI-SPEC Copywriting Contract provides exact strings; blog-list.test.js co-change mapped (lines 53,55,68,73,85,90) |
| SEOS-03 | Privacy page HTML cleaned up — valid markdown | privacy.md:34-137 raw-HTML structure documented; frontmatter title change (Privacy Policy → Privacy e Cookie) also required for SEOS-02 (leaks into title/h1/meta) |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Image processing (gatsbyImageData generation) | API/Backend (Gatsby GraphQL data layer, sharp) | — | Resolver runs at build time; no client involvement |
| Image rendering (GatsbyImage) | Browser / Client | — | React component renders the responsive `<img>` DOM |
| SEO meta / lang / hreflang SSR output | Frontend Server (SSR via react-helmet) | — | Static HTML generation produces the meta tags |
| og:image URL resolution | API/Backend (getSrc on gatsbyImageData) | Frontend Server (Seo interpolation) | getSrc extracts the URL string at render; Seo prefixes siteUrl |
| Italian UI copy (pagination, titles) | Frontend Server (templates) | — | Static component strings |
| Privacy page content | Content layer (markdown source) | — | Markdown → HTML via gatsby-transformer-remark |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gatsby-plugin-image | **3.16.0** (NOT 5.16.0 — does not exist) | GatsbyImage component, gatsbyImageData resolver support, getImage/getSrc helpers, SSR styles/script | Official Gatsby image plugin; only maintained successor to gatsby-image; peer deps match Gatsby 5.16.1 + React 18 + sharp 5.16.0 exactly; internal deps (gatsby-core-utils 4.16.0, gatsby-plugin-utils 4.16.0, babel-plugin-remove-graphql-queries 5.16.0) are the `.16` lockstep family |
| gatsby-plugin-sharp | 5.16.0 (already installed) | gatsbyImageData processing | Already in lockstep; no change |
| gatsby-transformer-sharp | 5.16.0 (already installed) | childImageSharp GraphQL node | Already in lockstep; no change |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gatsby-remark-images | 7.16.0 (already installed) | Body images inside markdown | Keep; only remove `tracedSVG: true` option (D-06/D-08) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gatsby-plugin-image@3.16.0 | gatsby-plugin-image@3.18.0-react19.* | react19-tagged line targets React 19 (MODR-01, deferred); incompatible intent for React 18 |
| gatsby-plugin-image@3.16.0 | gatsby-image (keep) | Deprecated, unmaintained (npm `deprecated` flag set), blocks sharp 5.x lockstep; IMAG-01 requires removal |

**Installation:**
```bash
yarn add gatsby-plugin-image@3.16.0
# after migration:
yarn remove gatsby-image
```

**Version verification:**
```bash
npm view gatsby-plugin-image version            # → 3.16.0 (no 5.x line exists — verified 2026-08-19)
npm view gatsby-plugin-image@3.16.0 peerDependencies
# → react ^18.0.0 || ^19.0.0, gatsby ^5.0.0-next, gatsby-plugin-sharp ^5.0.0-next, gatsby-source-filesystem ^5.0.0-next
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| gatsby-plugin-image@3.16.0 | npm | ~5.8 yrs (1.x from 2020; 3.16.0 published 2026-06-30) | 85,793/wk | github.com/gatsbyjs/gatsby | OK | Approved — install exact 3.16.0 |
| gatsby-image@^3.11.0 | npm | ~5 yrs (3.11.0 published 2021-08-04) | 32,568/wk | github.com/gatsbyjs/gatsby | SUS (deprecated flag) | Approved for REMOVAL (D-05) — deprecation is the removal reason, not a blocker |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** gatsby-image — deprecated upstream; planned removal in this phase, so no checkpoint needed beyond the removal itself.

**Postinstall check:** neither package has a `scripts.postinstall` — clean. `[VERIFIED: npm registry]`

## Architecture Patterns

### System Architecture Diagram

```
                        ┌─────────────────────────────────────────────┐
                        │                Gatsby build                  │
                        │                                             │
  src/content/posts/*.md │  gatsby-transformer-remark (body images)   │
  featuredImage path ───▶│  gatsby-plugin-netlify-cms-paths (rewrite) │
                        │  gatsby-transformer-sharp                   │
                        │      └─ childImageSharp.gatsbyImageData     │
                        │           (gatsby-plugin-sharp 5.16.0)      │
                        │               │ width/height/breakpoints/   │
                        │               │ placeholder/transformOptions│
                        │               ▼                             │
                        │  GraphQL query (templates + components)     │
                        │      └─ gatsbyImageData object ─────────────┐│
                        │                                             ││
                        └─────────────────────────────────────────────┘│
                                                                      │
   Browser / Client                              Frontend Server (SSR)│
   ┌──────────────────────┐                    ┌──────────────────────▼─┐
   │ GatsbyImage          │   getSrc(image) ──▶│ Seo (react-helmet)    │
   │  .featured-image     │     string URL     │  lang="it" (D-13)     │
   │  placeholder: BLURRED│                    │  no hreflang (D-14)   │
   │  / DOMINANT_COLOR    │                    │  og:image/twitter:image│
   │  loading eager (hero)│                    │  ← getSrc string (D-10)│
   └──────────────────────┘                    │  string guard (D-11)  │
                                               └───────────────────────┘
```

Data flow: markdown frontmatter → sharp resolver generates gatsbyImageData → GraphQL query in each surface → GatsbyImage renders (client) while getSrc() feeds the Seo string for SSR meta output. Body images flow through gatsby-remark-images directly to HTML and are untouched except the tracedSVG option removal.

### Recommended Project Structure

No new directories. Files touched (existing structure preserved):

```
gatsby-config.js          # + "gatsby-plugin-image" in plugins; - tracedSVG: true (gatsby-remark-images)
package.json              # + gatsby-plugin-image@3.16.0; - gatsby-image
src/templates/blog-post.js    # query + component + Seo image swap
src/templates/index-page.js   # query + component swap (hero, DOMINANT_COLOR, eager)
src/components/post-card.js   # query + component swap (covers blog-list + blog-list-home)
src/components/seo.js         # lang, hreflang removal, string guard
src/templates/blog-list.js    # Italian meta + pagination labels
src/pages/404.js, src/pages/thanks.js  # Italian titles
src/content/pages/privacy.md  # markdown rebuild
src/templates/blog-list.test.js  # Precedente/Successivo assertions
```

### Pattern 1: fluid → gatsbyImageData query swap

**What:** Replace `fluid(...) { ...GatsbyImageSharpFluid ...LimitPresentationSize }` with a single `gatsbyImageData(...)` resolver call. Fragments are gone; args are inline.
**When to use:** Every surface in this phase.
**Example:**

```graphql
featuredImage {
  childImageSharp {
    gatsbyImageData(
      layout: "constrained"
      quality: 80
      breakpoints: [350, 700, 1050, 1400]
      placeholder: BLURRED
    )
  }
}
```

**Source:** [CITED: gatsbyjs/gatsby docs — image-migration-guide + built-in-components/gatsby-plugin-image]

### Pattern 2: GatsbyImage component swap with guard

**What:** `Img fluid={X}` → `GatsbyImage image={getImage(X)}`. `getImage()` duck-types and returns `undefined` for missing data, so the existing `Image ? <GatsbyImage …> : ""` guard stays. `className` goes to the wrapper (same element role as legacy `Img`'s wrapper); `objectFit`/`objectPosition` become `imgStyle`-level props on the inner img.
**When to use:** All three surfaces.
**Example:**

```jsx
import { GatsbyImage, getImage, getSrc } from "gatsby-plugin-image"

const Image = getImage(frontmatter.featuredImage?.childImageSharp)
const imageSrc = getSrc(frontmatter.featuredImage?.childImageSharp)

<Seo … image={imageSrc} /> {/* string only — D-10 */}
{Image ? (
  <GatsbyImage
    image={Image}
    objectFit="cover"
    objectPosition="50% 50%"
    alt={frontmatter.title + " - Featured image"}
    className="featured-image"
  />
) : (
  ""
)}
```

**Source:** [CITED: gatsbyjs/gatsby docs — built-in-components/gatsby-plugin-image (getImage/getSrc); verified against installed source]

### Pattern 3: Absolute-fill conversion (conditional, blog-post banner only)

**What:** Restores legacy `Img` behavior where the image absolutely fills the `min-height: 50vh` wrapper with center crop. With `constrained` layout the sizer div reserves the natural-ratio box instead; making the imgs absolute removes the reservation so the wrapper height governs.
**When to use:** ONLY if the held-out visual check on a blog post shows a gap (landscape images) or bottom-clipping (portrait images) in the 50vh banner. This is additive CSS — it does not rewrite existing selectors.

```scss
.blog-post .featured-image {
  position: relative; /* already provided by plugin CSS; shown for clarity */
}
.blog-post .featured-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
}
```

**Source:** [ASSUMED] — community pattern derived from the verified plugin DOM structure (sizer div + placeholder + main img inside the wrapper; placeholder already absolute-filled via `getPlaceholderProps`).

### Anti-Patterns to Avoid

- **Installing `gatsby-plugin-image@5.16.0`:** does not exist on npm; yarn install fails. Use `3.16.0`.
- **Passing `maxWidth`/`maxHeight` to `gatsbyImageData`:** deprecated per the migration guide; use `width`/`height`. (They may still resolve with a warning, but the docs deprecate them.)
- **Omitting `transformOptions: { cropFocus: CENTER }` on the card:** default `cropFocus` is `sharp.strategy.attention` (saliency-based); legacy fluid cropped from center. Without the explicit override, card crops shift focus on images with strong subjects.
- **Forgetting `gatsby-plugin-image` in the gatsby-config `plugins` array:** without the plugin registered, `gatsbyImageIsInstalled()` is false and GatsbyImage falls back to inline absolute-positioning styles — works, but not the intended SSR path, and the shared CSS (`.gatsby-image-wrapper` overflow/position) is missing.
- **Using `loading="eager"` on non-hero surfaces:** the contract reserves eager for the index hero only.
- **Leaving `jest.mock("gatsby-image")` in blog-list.test.js:** becomes dead after migration (module uninstalled). Remove it in the same change; do NOT add a gatsby-plugin-image mock — post-card is fully mocked in this file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive image generation (srcset, formats, placeholders) | Custom `<picture>`/srcset code | gatsbyImageData resolver + GatsbyImage | Sharp pipeline, AVIF/WEBP generation, placeholder base64, caching — thousands of edge cases |
| og:image URL extraction | Manual parsing of image objects | getSrc() | Duck-typed, null-safe extraction of `images.fallback.src` |
| SEO meta rendering | Hand-written meta JSX per page | Seo component (react-helmet) | Already centralized; single fix point for lang/hreflang/image |
| Body-image processing in markdown | Custom remark image plugin | gatsby-remark-images | Already configured; only the tracedSVG option changes |

**Key insight:** image processing pipelines are notoriously deep (format negotiation, density math, placeholder generation, cache-digest paths). The existing sharp/transformer stack already does this — the phase only swaps the *component + query shape*, never the processing engine.

## Runtime State Inventory

> This is a code-level migration (gatsby-image → gatsby-plugin-image). Build artifacts regenerate.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no databases or datastores reference gatsby-image | none |
| Live service config | None — no external service config references gatsby-image (Netlify build is `yarn build` → `public/`, agnostic) | none |
| OS-registered state | None — no OS-level registrations | none |
| Secrets/env vars | None — no env vars reference gatsby-image | none |
| Build artifacts | `public/` contains legacy gatsby-image HTML output (`.gatsby-image-*` classes, current build). `node_modules/gatsby-image` installed (3.11.0). `yarn.lock` has no gatsby-plugin-image entry yet | Rebuild regenerates `public/` (no manual cleanup); `yarn remove gatsby-image` updates lockfile + node_modules |

**Nothing found in category:** stored data, live service config, OS-registered state, secrets — verified by inspection (no DBs, no services, no daemons, no env files in repo).

## Common Pitfalls

### Pitfall 1: gatsby-plugin-image version hallucination
**What goes wrong:** Installing `gatsby-plugin-image@5.16.0` fails (version does not exist); yarn errors out.
**Why it happens:** The plugin is versioned on its own track (3.x for Gatsby 5), not synced to the `5.16.x` Gatsby core line; the CONTEXT's "lockstep matrix" claim propagated from Phase 3's matrix, which never included this package.
**How to avoid:** Pin `gatsby-plugin-image@3.16.0` exactly (registry-verified). Peer deps confirm compatibility.
**Warning signs:** `yarn add gatsby-plugin-image@5.16.0` → "Couldn't find any versions that matches 5.16.0".

### Pitfall 2: Card crop drift (attention vs center)
**What goes wrong:** Cards crop at a saliency-detected focus instead of the legacy center crop; subject appears shifted.
**Why it happens:** `transformOptions` defaults to `cropFocus: attention`; legacy fluid used center gravity.
**How to avoid:** Pass `transformOptions: { fit: COVER, cropFocus: CENTER }` on the card query (verified enum values).
**Warning signs:** /blog cards show off-center crops after build.

### Pitfall 3: Blog-post banner fill parity (gap or clipped bottom)
**What goes wrong:** With constrained layout the image renders at natural ratio: landscape images leave white space under a 50vh banner; portrait images clip at the bottom.
**Why it happens:** Legacy `Img` absolutely filled the wrapper with object-fit cover; constrained GatsbyImage flows in the sizer box.
**How to avoid:** Held-out visual check per post orientation after build (UI-SPEC 🧪 backstops E1/E3); if delta confirmed, apply the absolute-fill pattern (Architecture Pattern 3) — additive CSS, no selector rewrites.
**Warning signs:** Empty space below the image in `.featured-banner`; portrait post tops look cut.

### Pitfall 4: og:image still [object Object]
**What goes wrong:** Passing the gatsbyImageData object (or `getImage()` result) into Seo's `image` prop re-triggers the string interpolation bug.
**Why it happens:** `${siteUrl}${image}` stringifies an object.
**How to avoid:** Always `getSrc(...)` → string → prop; Seo guard (D-11) drops non-strings to defaultImage.
**Warning signs:** `grep -c "object Object" public/*.html` > 0.

### Pitfall 5: Test breakage from label translation
**What goes wrong:** blog-list.test.js fails at `queryByText("Previous")` / `getByText("Next")` (lines 53,55,68,73,85,90).
**Why it happens:** D-16 changes the rendered strings.
**How to avoid:** Co-change the six assertions to "Precedente"/"Successivo" in the same commit (Phase 4 test-update discipline).
**Warning signs:** `yarn test src/templates/blog-list.test.js` red after the label change.

### Pitfall 6: Missing SSR registration
**What goes wrong:** Images render with inline fallback styles instead of the plugin's shared CSS; layout differs subtly (e.g., missing overflow/position handling).
**Why it happens:** gatsby-plugin-image must appear in `gatsby-config.js` `plugins` for the `GATSBY___IMAGE` build-time global.
**How to avoid:** Add `"gatsby-plugin-image"` to the plugins array in the same change as the install.
**Warning signs:** Rendered HTML has inline `position: absolute` styles on `.gatsby-image-wrapper` instead of class-based layout.

## Code Examples

### 1. blog-post.js — query, component, and Seo (D-02, D-03, D-04, D-10)

```graphql
# query fragment (replaces fluid(...) {...GatsbyImageSharpFluid ...LimitPresentationSize})
featuredImage {
  childImageSharp {
    gatsbyImageData(
      layout: "constrained"
      quality: 80
      breakpoints: [350, 700, 1050, 1400]
      placeholder: BLURRED
    )
  }
}
```

```jsx
import { GatsbyImage, getImage, getSrc } from "gatsby-plugin-image"

const Image = getImage(frontmatter.featuredImage?.childImageSharp)
const imageSrc = getSrc(frontmatter.featuredImage?.childImageSharp)

<Seo
  title={frontmatter.title}
  description={frontmatter.description ? frontmatter.description : excerpt}
  image={imageSrc}   {/* D-10: string only */}
  article={true}
/>
{Image ? (
  <GatsbyImage
    image={Image}
    objectFit="cover"
    objectPosition="50% 50%"
    alt={frontmatter.title + " - Featured image"}
    className="featured-image"
    loading="lazy"
  />
) : (
  ""
)}
```

**Source:** [CITED: gatsbyjs/gatsby docs — using-gatsby-plugin-image; getImage/getSrc reference]

### 2. index-page.js hero — DOMINANT_COLOR + eager (D-03, D-07)

```graphql
featuredImage {
  childImageSharp {
    gatsbyImageData(
      layout: "constrained"
      quality: 80
      breakpoints: [960, 1440]
      placeholder: DOMINANT_COLOR
    )
  }
}
```

```jsx
{Image ? (
  <GatsbyImage
    image={Image}
    alt={frontmatter.title + " - Featured image"}
    className="featured-image"
    loading="eager"
  />
) : (
  ""
)}
```

**Source:** [CITED: gatsbyjs/gatsby docs — gatsby-plugin-image reference (placeholder enum, loading prop)]

### 3. post-card.js — fixed box with center crop (D-03, D-04)

```graphql
featuredImage {
  childImageSharp {
    gatsbyImageData(
      layout: "constrained"
      width: 540
      height: 360
      quality: 80
      transformOptions: { fit: COVER, cropFocus: CENTER }
      placeholder: BLURRED
    )
  }
}
```

```jsx
<GatsbyImage
  image={getImage(data.frontmatter.featuredImage.childImageSharp)}
  objectFit="cover"
  objectPosition="50% 50%"
  alt={data.frontmatter.title + " - Featured image"}
  className="featured-image"
/>
```

**Source:** [CITED: gatsbyjs/gatsby docs + verified against installed gatsby-plugin-sharp image-data.ts (fit/cropFocus defaults)]

### 4. seo.js — string guard + lang + hreflang removal (D-09, D-11, D-13, D-14)

```jsx
// inside the component:
const imageUrl = typeof image === "string" && image.length > 0 ? image : null

const seo = {
  title: title || defaultTitle,
  description: description || defaultDescription,
  image: `${siteUrl}${imageUrl || defaultImage}`,
  url: `${siteUrl}${pathname}`,
}

return (
  <Helmet title={seo.title} titleTemplate={titleTemplate}>
    <html lang="it" />
    {/* hreflang alternates removed — D-14 */}
    <meta name="description" content={seo.description} />
    <meta name="image" content={seo.image} />
    ...
  </Helmet>
)
```

**Source:** [CITED: current seo.js structure; guard design per D-11]

### 5. blog-list.js — Italian meta + pagination labels (D-15, D-16)

```jsx
<Seo
  title={
    currentPage === 1
      ? "Blog"
      : `Blog — Pagina ${currentPage}`
  }
  description={
    `I post del blog di LaryArt: decoupage, oggetti d'arte e creazioni fatti a mano.` +
    (currentPage > 1 ? ` Pagina ${currentPage}` : "")
  }
/>
```

```jsx
{/* prev link */} Precedente
{/* next link */} Successivo
```

**Source:** [CITED: 05-UI-SPEC Copywriting Contract]

### 6. privacy.md — target structure (D-19)

```markdown
---
template: privacy
slug: /privacy
title: Privacy e Cookie
---

# Privacy, Cookie e GDPR

[existing intro prose lines 7-25 unchanged]

### Opt out
Gli utenti possono impedire l'utilizzo di cookie in vari modi:

#### Blocca i cookie di terze parti

I cookie di terze parti non sono generalmente indispensabili per navigare, quindi puoi rifiutarli per default, attraverso apposite funzioni del tuo browser.

Ulteriori informazioni sulla disabilitazione dei cookie su [Firefox, in inglese.](https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences)
Ulteriori informazioni sulla disabilitazione dei cookie su [Chrome, in inglese](https://support.google.com/chrome/answer/95647?hl=en)
[Internet Explorer, Opera, Safari, Google links preserved — same treatment]

#### Attiva l'opzione Do Not Track
[prose unchanged]

#### Attiva la modalità di "navigazione anonima"
[prose unchanged]

Maggiori informazioni sulla privacy che garantisce Google all'indirizzo [https://policies.google.com/privacy](https://policies.google.com/privacy)
Altre informazioni sui cookie [https://www.cookiechoices.org/](https://www.cookiechoices.org/)
Pagina informativa sui cookie del Garante della Privacy [http://www.garanteprivacy.it/cookie](http://www.garanteprivacy.it/cookie)

Per maggiori informazioni riguardanti la politica della privacy questo blog potete contattarmi per email al seguente indirizzo: s.foschi@protonmail.com
```

**Source:** [CITED: 05-UI-SPEC §Privacy page target (D-19); current file at privacy.md:34-137]

### 7. Built-HTML verification commands (success-criteria checks)

```bash
yarn build

# Success criterion 1 — no gatsby-image, gatsbyImage present
grep -rl "gatsby-image-wrapper" public/ | head -3        # gatsby-plugin-image wrappers present
grep -rl "gatsby-image-outer-wrapper" public/ | wc -l    # legacy class → 0

# Success criterion 2 — real og:image, no [object Object]
grep -o 'property="og:image" content="[^"]*"' public/*/index.html | grep -c "object Object"  # → 0
grep -o 'property="og:image" content="[^"]*"' public/*/index.html | head -3                   # → https://laryart.it/static/...

# Success criterion 3 — lang="it", no hreflang
grep -o '<html lang="[^"]*"' public/index.html          # → <html lang="it">
grep -rl 'rel="alternate"' public/ | wc -l              # → 0

# Success criterion 4 — no English starter meta
grep -rl "Stackrole base blog page" public/ | wc -l      # → 0
grep -o '<title[^>]*>[^<]*</title>' public/blog/index.html   # → Blog

# Success criterion 5 — privacy page valid
grep -c '</p>' public/privacy/index.html                # balanced tags
grep -c "chiocciola" public/privacy/index.html          # → 0
```

**Source:** [ASSUMED] — derived from current built-output inspection (public/index.html, public/farfalla-blu/index.html confirmed today: `lang="en-US"`, 3 hreflang, `og:image content="https://laryart.it[object Object]"`)

### 8. Jest mock reference for gatsby-plugin-image (only if a future test renders GatsbyImage unmocked)

```js
jest.mock("gatsby-plugin-image", () => ({
  __esModule: true,
  GatsbyImage: () => React.createElement("img", { alt: "" }),
  getImage: node => node?.childImageSharp?.gatsbyImageData,
  getSrc: node => node?.childImageSharp?.gatsbyImageData?.images?.fallback?.src,
}))
```

**Note:** NOT needed for this phase — blog-list.test.js mocks `post-card` entirely (line 13-15), so no gatsby-plugin-image module reaches Jest. If a future test imports it directly, `transformIgnorePatterns` in jest.config.js (`node_modules/(?!(gatsby|gatsby-script|gatsby-link)/)`) may need `gatsby-plugin-image` added (it ships untranspiled code).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| gatsby-image `Img` + `fluid` | gatsby-plugin-image `GatsbyImage` + `gatsbyImageData` | 2021 (v3 line for Gatsby 5; current 3.16.0) | Fragments removed, inline resolver args, AVIF/WEBP default formats, better LCP control |
| `srcSetBreakpoints` arg | `breakpoints` arg | 2021 | Works for constrained too (verified in sharp 5.16.0 `responsiveImageSizes`); legacy arg only exists on `fluid` |
| `maxWidth`/`maxHeight` args | `width`/`height` args | 2021 (deprecated) | Use width/height for constrained/fixed |
| `tracedSVG: true` placeholder | BLURRED / DOMINANT_COLOR | sharp ≥5.x (removal announced 2021; sharp 5.16.0 warns + falls back to blurred) | **Removal is behaviorally neutral today** — sharp already substitutes blurred output with a console warning |
| `cropFocus` default | attention (saliency) | 2021 | Must pass `cropFocus: CENTER` for legacy center-crop parity |
| react-helmet SSR meta | (future) Gatsby Head API | MODR-02 (v2, deferred) | This phase stays on react-helmet |

**Deprecated/outdated:**
- `gatsby-image` (npm `deprecated` flag): unmaintained; removal required by IMAG-01.
- `tracedSVG` placeholder arg: removed in sharp; passing it warns and falls back to DOMINANT_COLOR (verified in installed image-data.ts: "TRACED_SVG placeholder argument value is no longer supported").

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `gatsby-plugin-image@3.16.0` is the intended "lockstep" release and the CONTEXT's "5.16.0" is a version hallucination | Summary / Standard Stack | LOW — npm registry definitively has no 5.x; 3.16.0 is `latest` with matching .16 internal deps. If the owner insists on a 5.x tag for policy reasons, no such version exists to install |
| A2 | Blog-post 50vh banner may show a gap/clip with constrained layout; absolute-fill CSS restores parity | Pitfall 3 / Pattern 3 | MEDIUM — depends on actual image aspect ratios and viewport; the held-out visual check decides. If the CSS approach misbehaves, alternative is giving the banner an explicit height + `imgClassName` fill, or keeping natural ratio (accepted minor delta) |
| A3 | `transformOptions: { fit: COVER, cropFocus: CENTER }` reproduces legacy card crop | Code Examples 3 | MEDIUM — legacy fluid fit default resolution is internal; the UI-SPEC and docs both recommend this mapping. Visual check on /blog cards covers it |
| A4 | Removing the dead `jest.mock("gatsby-image")` from blog-list.test.js is safe | Anti-Patterns | LOW — the factory doesn't require the module to exist; keeping it is also harmless. Either way tests pass |
| A5 | Privacy page will render two H1s after title change ("Privacy e Cookie" from template + "Privacy, Cookie e GDPR" from markdown) | Open Questions | LOW — pre-existing template behavior (privacy.js:35 renders frontmatter.title as H1, markdown has its own H1); not a phase-5 regression. Changing template H1 is out of contract scope |
| A6 | Default `formats: [AUTO, WEBP, AVIF]` (per-query default is AUTO+WEBP; AVIF when requested) is acceptable — no format restriction in contract | Code Examples | LOW — more formats = more build time, better client perf; no visual delta |

## Open Questions

1. **Blog-post banner visual parity — confirm or fix?**
   - What we know: legacy filled 50vh via absolute positioning; constrained flows at natural ratio; absolute-fill CSS pattern exists.
   - What's unclear: whether actual featured images (mix of phone photos, ~4:3 landscape and portrait) produce an observable gap/clip on typical viewports.
   - Recommendation: plan includes the held-out visual check (per UI-SPEC E1/E3 backstops) as a gate; the absolute-fill pattern is the conditional fix. This is within the agent's discretion (CONTEXT: "Exact SCSS/className handling if GatsbyImage needs a wrapper").

2. **Privacy page double-H1 (template + markdown)**
   - What we know: privacy.js:35 renders `<h1>{frontmatter.title}</h1>` and the markdown body also begins with `# Privacy, Cookie e GDPR`; changing the title to "Privacy e Cookie" (required for SEOS-02) makes the two H1s diverge.
   - What's unclear: whether to also drop the template H1 or the markdown H1 — both are beyond the D-19 contract (which only rebuilds the raw-HTML block).
   - Recommendation: leave as-is (parity with today's structure); note in plan as an observed non-issue for the checker.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build/test (check-node-version.js gate) | ✓ | 24.19.0 (matches .nvmrc 24) | — |
| yarn | install/build/test | ✓ | 1.22.22 | — |
| gatsby-plugin-sharp | gatsbyImageData processing | ✓ | 5.16.0 (installed) | — |
| gatsby-transformer-sharp | childImageSharp nodes | ✓ | 5.16.0 (installed) | — |
| gatsby-plugin-image | target of this phase | ✗ (to install) | — | Install `3.16.0` |
| gatsby-image | to be removed | ✓ | 3.11.0 (installed) | — |
| public/ build output | verification greps | ✓ | current build (pre-migration) | rebuild via `yarn build` |

**Missing dependencies with no fallback:** none — the phase's only new dependency is gatsby-plugin-image@3.16.0 from the official Gatsby monorepo.
**Missing dependencies with fallback:** none.

## Validation Architecture

> `workflow.nyquist_validation` absent from `.planning/config.json` → treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest 29.7.0 + @testing-library/react 16.3.2 (existing Phase 1 scaffold) |
| Config file | jest.config.js (babel-preset-gatsby transform, __mocks__/ root) |
| Quick run command | `yarn test src/templates/blog-list.test.js` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEOS-02 (D-16) | Pagination renders "Precedente"/"Successivo" | unit (jsdom) | `yarn test src/templates/blog-list.test.js` | ✅ (update assertions: lines 53,55,68,73,85,90) |
| IMAG-01 | No gatsby-image imports remain; gatsbyImageData renders | build-output inspection | `grep -rl "gatsby-image-outer-wrapper" public/ \| wc -l` → 0 | ✅ (public/ regenerated by `yarn build`) |
| IMAG-02 | Placeholders in rendered output | build-output inspection | grep for `data-placeholder-image` in public/ | ✅ |
| IMAG-03 | og:image real URL, no [object Object] | build-output inspection | `grep -c "object Object" public/*/index.html` → 0 | ✅ |
| SEOS-01 | lang="it", no hreflang | build-output inspection | greps documented in Code Example 7 | ✅ |
| SEOS-02 | No English starter meta | build-output inspection | `grep -rl "Stackrole base blog page" public/` → 0 | ✅ |
| SEOS-03 | Privacy page valid HTML | build-output inspection + visual | grep tag balance + held-out /privacy check | ✅ |

### Sampling Rate
- **Per task commit:** `yarn test src/templates/blog-list.test.js` (fast, targeted)
- **Per wave merge:** `yarn build && yarn test` (full build gates the greps)
- **Phase gate:** `yarn build && yarn test` green + all 5 success-criteria greps pass + held-out visual checks (post page landscape/portrait, /blog cards, /privacy)

### Wave 0 Gaps
- [ ] `src/templates/blog-list.test.js` — assertion updates for Precedente/Successivo + remove dead `jest.mock("gatsby-image")` (co-change with D-16)
- No new test files required — phase verification is build-output inspection (success criteria are rendered-source checks), which the grep commands cover.

## Security Domain

> `security_enforcement` absent from config → treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (static site, no auth) |
| V3 Session Management | no | — (no sessions) |
| V4 Access Control | no | — (no protected resources) |
| V5 Input Validation | yes (component-prop level) | Runtime type guard in Seo (D-11): non-string `image` ignored → defaultImage; react-helmet escapes all string content |
| V6 Cryptography | no | — (no crypto) |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed meta content ([object Object] leaking into og:image) | Tampering / Info disclosure | D-10 (getSrc → string) + D-11 (string-only guard) — belt and suspenders |
| XSS via markdown body | Tampering | gatsby-transformer-remark escapes raw HTML; privacy rebuild converts raw `<a>` blocks to markdown (D-19) — fewer raw-HTML surfaces, not more |
| Email harvesting from deobfuscated address | Info disclosure | D-19 explicitly deobfuscates `s.foschi@protonmail.com` — accepted tradeoff (contactability is the site's core value); LOW severity |
| Image URL injection via frontmatter | Spoofing | `featuredImage` paths are repo-controlled content files; getSrc output is a build-generated /static/ path — no user-controlled URLs enter og:image |

## Sources

### Primary (HIGH confidence)
- npm registry (verified 2026-08-19): `gatsby-plugin-image` versions/dist-tags/peerDependencies/dependencies — **no 5.x line; latest 3.16.0**
- Installed `node_modules/gatsby-plugin-sharp@5.16.0` source: `image-data.ts` (placeholder enum, tracedSVG fallback, fit/cropFocus defaults), `utils.js` (responsiveImageSizes breakpoints handling for constrained, getSizes), `index.js` (tracedSVG/fluid fallback warnings), `plugin-options.ts` (defaults) — [VERIFIED: local package source]
- Context7 `/gatsbyjs/gatsby` docs: image-migration-guide (maxWidth/maxHeight deprecation, fluid→constrained/fullWidth, breakpoints for fullWidth), built-in-components/gatsby-plugin-image (GatsbyImage props: className wrapper / imgClassName img, loading default lazy, objectFit/objectPosition defaults, getImage/getSrc), using-gatsby-plugin-image (install + gatsby-config registration) — [CITED: gatsbyjs/gatsby docs]
- GitHub raw source: `gatsby-plugin-image/src/components/gatsby-image.server.tsx`, `layout-wrapper.tsx` (sizer structure for constrained), `hooks.ts` (getImage/getSrc duck-typing) — [VERIFIED: gatsbyjs/gatsby@master]
- Built output inspection: `public/index.html` (lang="en-US", 3 hreflang, og:image → heart.png), `public/farfalla-blu/index.html` (`og:image content="https://laryart.it[object Object]"`) — [VERIFIED: local build output]
- Codebase reads: all touched files (blog-post.js, index-page.js, post-card.js, seo.js, blog-list.js + test, 404.js, thanks.js, privacy.md, gatsby-config.js, package.json, jest.config.js, __mocks__/gatsby.js, site.json) — [VERIFIED: local codebase]

### Secondary (MEDIUM confidence)
- gsd-tools package-legitimacy seam: gatsby-plugin-image OK, gatsby-image SUS(deprecated) — [VERIFIED: gsd-tools query]
- Context7 classify-confidence seam: context7 → MEDIUM (verified: MEDIUM) — used for [CITED] tags above

### Tertiary (LOW confidence)
- Community absolute-fill CSS pattern for constrained GatsbyImage in fixed-height containers — [ASSUMED] (A2)
- Exact legacy `fluid` fit semantics for maxWidth+maxHeight crops — [ASSUMED] (A3); mitigated by explicit fit/cropFocus in the target query

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry + installed package sources + Gatsby docs all agree; only the version correction deviates from CONTEXT (and it is registry-verified fact)
- Architecture: HIGH — component/query/SSR mechanics verified against plugin source; MEDIUM only on the 50vh banner visual delta (image-ratio dependent)
- Pitfalls: HIGH — every pitfall except the banner-fill one is directly evidenced (version list, source defaults, test assertions, built HTML); banner-fill is MEDIUM

**Research date:** 2026-08-19
**Valid until:** 2026-09-18 (30 days; Gatsby plugin ecosystem is stable, but re-verify the npm `latest` tag if more than 30 days pass)
