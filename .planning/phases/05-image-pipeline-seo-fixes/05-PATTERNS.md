# Phase 5: Image Pipeline + SEO Fixes - Pattern Map

**Mapped:** 2026-08-19
**Files analyzed:** 13 (12 named in CONTEXT integration points + 1 implied: `blog-list-home.js`)
**Analogs found:** 13 / 13

> **VERSION CORRECTION (research-verified, plan MUST honor):** `gatsby-plugin-image@5.16.0` **does not exist** on npm. The 05-CONTEXT D-01 / 05-UI-SPEC claim is wrong. Install **`gatsby-plugin-image@3.16.0` exactly** (latest stable, `.16` lockstep family internally). `yarn add gatsby-plugin-image@5.16.0` fails resolution.

## File Classification

All files are **modifications of existing files** — the closest analog is the file's own current state plus sibling surfaces demonstrating the same role. No new files are created.

| New/Modified File                           | Role                       | Data Flow                                         | Closest Analog                                                                         | Match Quality |
| ------------------------------------------- | -------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------- |
| `package.json`                              | config (deps)              | n/a (install-time)                                | `package.json` itself + Phase 3 lockstep matrix (03-CONTEXT D-01)                      | exact         |
| `gatsby-config.js`                          | config (plugins)           | n/a (build-time)                                  | `gatsby-config.js` itself (plugins array + gatsby-remark-images block)                 | exact         |
| `src/templates/blog-post.js`                | template (page)            | request-response (pageQuery → SSR)                | `src/templates/index-page.js` (same Layout+Seo+Img-guard skeleton)                     | exact         |
| `src/templates/index-page.js`               | template (page)            | request-response (pageQuery → SSR)                | `src/templates/blog-post.js` (inverse; same skeleton + eager-hero delta)               | exact         |
| `src/components/post-card.js`               | component                  | request-response (render)                         | `src/components/blog-list-home.js` (same fluid query shape it consumes)                | role-match    |
| `src/templates/blog-list.js`                | template (list)            | request-response (pageQuery + pagination context) | `src/templates/blog-post.js` `Pagination` subcomponent (blog-post.js:9-50)             | role-match    |
| `src/templates/blog-list-home.js` (implied) | component (StaticQuery)    | request-response (StaticQuery → render)           | `src/components/blog-list-home.js` itself (query at :44-51 must swap with post-card)   | exact         |
| `src/components/seo.js`                     | component (helmet meta)    | request-response (SSR meta)                       | `src/components/seo.js` itself (self-contained; only helmet component in repo)         | exact         |
| `src/pages/404.js`                          | page                       | request-response (static)                         | `src/pages/thanks.js` (identical Layout+Seo+wrapper skeleton)                          | exact         |
| `src/pages/thanks.js`                       | page                       | request-response (static)                         | `src/pages/404.js` (inverse)                                                           | exact         |
| `src/content/pages/privacy.md`              | content (markdown)         | transform (markdown → HTML)                       | `src/content/pages/laryart.md` (clean markdown content page)                           | role-match    |
| `src/templates/blog-list.test.js`           | test                       | n/a (jest/jsdom)                                  | `src/templates/blog-list.test.js` itself (assertions at :53-90; mock block :7-15)      | exact         |
| `src/__mocks__/gatsby.js`                   | utility (jest manual mock) | n/a (test support)                                | `__mocks__/gatsby.js` itself (12 lines; Phase 1 pattern) — **likely NO change needed** | exact         |

## Pattern Assignments

### `package.json` (config)

**Analog:** current file (lines 26-53) + Phase 3 lockstep rule (03-CONTEXT D-01: no gatsby-\* plugin ships a `.16.1` patch; plugins pinned exact, no `^`).

**Dependency-entry pattern** (package.json:30-45 — gatsby-\* deps are exact-pinned, alphabetized):

```json
"gatsby": "5.16.1",
"gatsby-image": "^3.11.0",          // ← line 31: REMOVE (D-05)
...
"gatsby-plugin-decap-cms": "4.0.4",
```

**Add** (alphabetical position after `gatsby-image` slot is vacated, before `gatsby-plugin-decap-cms`):

```json
"gatsby-plugin-image": "3.16.0"     // exact pin — NOT 5.16.0 (does not exist)
```

**Removal:** `gatsby-image` line 31 goes away only AFTER all `src/` imports are migrated (D-05). Do not remove preemptively — build breaks mid-wave.

---

### `gatsby-config.js` (config)

**Analog:** current file (lines 20-53).

**Plugins array entry pattern** (gatsby-config.js:36-37 — string entries, lockstep order):

```js
`gatsby-transformer-sharp`,
`gatsby-plugin-sharp`,
```

**Add** `"gatsby-plugin-image"` to the array (required for SSR registration — RESEARCH Pitfall 6; without it `GatsbyImage` falls back to inline absolute-positioning styles and the shared `.gatsby-image-wrapper` CSS is missing). Place with the other sharp-pipeline strings.

**gatsby-remark-images options block** (gatsby-config.js:45-52) — remove exactly one line:

```js
options: {
  maxWidth: 1024,
  showCaptions: true,
  linkImagesToOriginal: false,
  tracedSVG: true,      // ← line 50: REMOVE (D-06); sharp 5.16.0 already warns + falls back to blurred
  loading: "lazy",
},
```

Keep `quality` default (agent discretion: 80 stays — no evidence for change). Do NOT touch `gatsby-remark-responsive-iframe` / `gatsby-remark-prismjs` blocks.

---

### `src/templates/blog-post.js` (template, request-response)

**Analog:** `src/templates/index-page.js` (same skeleton: pageQuery + `Layout` + `<Seo>` + `Image ? <Img> : ""` guard).

**Import swap** (blog-post.js:1-7 — replace line 3):

```js
import React from "react"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image" // ← line 3: REPLACE
// → import { GatsbyImage, getImage, getSrc } from "gatsby-plugin-image"
```

**Data extraction + Seo image swap** (blog-post.js:55-57, 67-74 — the og:image bug site):

```js
const Image = frontmatter.featuredImage
  ? frontmatter.featuredImage.childImageSharp.fluid      // ← line 56: REPLACE
  : ""
// → const Image = getImage(frontmatter.featuredImage?.childImageSharp)
// → const imageSrc = getSrc(frontmatter.featuredImage?.childImageSharp)  // D-10

<Seo
  title={frontmatter.title}
  description={frontmatter.description ? frontmatter.description : excerpt}
  image={Image}                        // ← line 72: REPLACE with image={imageSrc} — STRING only
  article={true}
/>
```

**Component swap with preserved guard** (blog-post.js:81-91 — `Img` → `GatsbyImage`, all props carry over per D-04):

```jsx
{
  Image ? (
    <GatsbyImage
      image={Image}
      objectFit="cover"
      objectPosition="50% 50%"
      alt={frontmatter.title + " - Featured image"}
      className="featured-image" // lands on wrapper — SCSS .blog-post .featured-image keeps matching
    />
  ) : (
    ""
  )
}
```

(Existing code has no `loading` prop; GatsbyImage defaults to `lazy` — parity holds, no need to add it.)

**Query swap** (blog-post.js:129-136 — `fluid` fragment → inline resolver args):

```graphql
featuredImage {
  childImageSharp {
    gatsbyImageData(
      layout: "constrained"
      quality: 80
      breakpoints: [350, 700, 1050, 1400]   # ← srcSetBreakpoints is the LEGACY arg; resolver arg is breakpoints
      placeholder: BLURRED
    )
  }
}
```

Drop `...GatsbyImageSharpFluid` + `...GatsbyImageSharpFluidLimitPresentationSize` (fragments gone; `constrained` inherently limits upscale — UI-SPEC parity rule 6).

**Error/empty handling:** the existing `Image ? ... : ""` guard IS the error-handling pattern (posts without `featuredImage` render nothing — UI-SPEC E1 empty state). `getImage()` returns null for missing data, so the guard is unchanged. No try/catch exists in this codebase (build-time sharp failures surface as build errors, not runtime).

---

### `src/templates/index-page.js` (template, request-response)

**Analog:** `src/templates/blog-post.js` (inverse skeleton). Also `src/components/blog-list-home.js` for the StaticQuery alternative — NOT needed here (this file uses pageQuery).

**Import swap** (index-page.js:1-8 — line 3):

```js
import Img from "gatsby-image" // ← line 3: REPLACE
// → import { GatsbyImage, getImage } from "gatsby-plugin-image"
//    (NO getSrc — this surface passes no image prop to Seo; <Seo /> at line 42 is bare)
```

**Data extraction** (index-page.js:37-39):

```js
const Image = frontmatter.featuredImage
  ? frontmatter.featuredImage.childImageSharp.fluid // ← line 38: REPLACE
  : ""
// → const Image = getImage(frontmatter.featuredImage?.childImageSharp)
```

**Hero component swap** (index-page.js:59-67 — hero surface: DOMINANT_COLOR placeholder + `loading="eager"` are the D-07 deltas):

```jsx
{
  Image ? (
    <GatsbyImage
      image={Image}
      alt={frontmatter.title + " - Featured image"}
      className="featured-image"
      loading="eager" // ← hero only — the sole surface that overrides the lazy default (UI-SPEC parity rule 8)
    />
  ) : (
    ""
  )
}
```

No `objectFit`/`objectPosition` props today on this surface — defaults (`cover` / `50% 50%`) match, do not add them (UI-SPEC surface table).

**Query swap** (index-page.js:18-24 — note: hero uses `placeholder: DOMINANT_COLOR`, unique to this surface):

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

---

### `src/components/post-card.js` (component, request-response)

**Analog:** the query it consumes lives in TWO parents — `src/templates/blog-list.js:25-32` and `src/components/blog-list-home.js:44-51`. Both must be swapped in the same change as the component (D-02: "post-card.js covers BOTH blog-list.js and blog-list-home.js").

**Import swap** (post-card.js:1-3 — line 3):

```js
import Img from "gatsby-image" // ← line 3: REPLACE
// → import { GatsbyImage, getImage } from "gatsby-plugin-image"
```

**Component swap** (post-card.js:7-19 — the `Link` wrapper stays; `Img` → `GatsbyImage`):

```jsx
{
  data.frontmatter.featuredImage ? (
    <Link to={data.frontmatter.slug}>
      <GatsbyImage
        image={getImage(data.frontmatter.featuredImage.childImageSharp)}
        objectFit="cover"
        objectPosition="50% 50%"
        alt={data.frontmatter.title + " - Featured image"}
        className="featured-image"
      />
    </Link>
  ) : (
    ""
  )
}
```

**Query swap — card surface (D-03: fixed 540×360 box + center-crop parity).** Apply to BOTH `blog-list.js:25-32` AND `blog-list-home.js:44-51` — they are byte-identical today:

```graphql
featuredImage {
  childImageSharp {
    gatsbyImageData(
      layout: "constrained"
      width: 540                # ← maxWidth/maxHeight are DEPRECATED — use width/height
      height: 360
      quality: 80
      transformOptions: { fit: COVER, cropFocus: CENTER }   # ← REQUIRED: default cropFocus is attention (saliency); legacy fluid cropped center
      placeholder: BLURRED
    )
  }
}
```

**SCSS hooks that must keep matching** (style.scss:232-238, 266-268, 292-294 — read-only, NOT modified):

```scss
.post-card .featured-image {
  border-radius: 12px;
  img {
    display: block;
    margin: 0;
  }
}
@media (max-width: 991px) {
  .post-card .featured-image {
    border-radius: 12px 12px 0 0;
  }
}
```

`className="featured-image"` lands on the GatsbyImage wrapper; if `.featured-image img` selectors stop matching (GatsbyImage renders a sizer div + inner img), restore via `imgClassName="featured-image"` on the img element — do NOT rewrite SCSS (UI-SPEC parity rule 4).

---

### `src/templates/blog-list.js` (template, request-response + pagination)

**Analog:** `src/templates/blog-post.js:9-50` (same `Pagination` link structure with react-icons `RiArrowLeftLine`/`RiArrowRightLine`).

**Query swap** (blog-list.js:25-32) — identical to post-card surface above (card query). See Pattern Assignment for post-card.

**Italian meta swap** (blog-list.js:101-106 — replace English starter copy, D-15):

```jsx
<Seo
  title={currentPage === 1 ? "Blog" : `Blog — Pagina ${currentPage}`}
  description={
    `I post del blog di LaryArt: decoupage, oggetti d'arte e creazioni fatti a mano.` +
    (currentPage > 1 ? ` Pagina ${currentPage}` : "")
  }
/>
```

(Exact wording is agent discretion per D-15; strings above are the UI-SPEC Copywriting Contract defaults. `currentPage`/`numPages` already destructured at line 78.)

**Pagination label swap** (blog-list.js:48 and :65 — D-16):

```jsx
{/* line 48 */} Previous   →   Precedente
{/* line 65 */} Next       →   Successivo
```

The surrounding `Link rel="prev"` / `Link rel="next"` markup and icon spans stay byte-identical.

---

### `src/templates/blog-list-home.js` (component/StaticQuery, request-response) — IMPLIED FILE

**Analog:** itself (query at lines 44-51). Not named in CONTEXT integration points, but REQUIRED: PostCard consumes `childImageSharp.fluid`; after the post-card component swap this StaticQuery must request `gatsbyImageData` or the home page breaks (UI-SPEC surface table row 3 explicitly lists `query (blog-list:27, blog-list-home:46)`).

**Query swap** (blog-list-home.js:44-51) — byte-identical to the post-card query in blog-list.js (width 540 / height 360 / fit COVER / cropFocus CENTER / BLURRED). The `StaticQuery` wrapper (lines 27-57), `render` prop, and PostCard mapping (lines 58-63) are untouched.

---

### `src/components/seo.js` (component, request-response SSR meta)

**Analog:** self-contained (only react-helmet component in repo; no other meta generator to copy from). The target pattern is the current file with three surgical edits.

**String-guard + interpolation fix** (seo.js:20-25 — D-09/D-11):

```js
const seo = {
  title: title || defaultTitle,
  description: description || defaultDescription,
  image: `${siteUrl}${image || defaultImage}`, // ← line 23: `${image}` stringifies an object → "[object Object]"
  url: `${siteUrl}${pathname}`,
}
```

Guard (belt-and-suspenders, D-11): compute before the object — non-string/empty `image` falls back to `defaultImage` (`/assets/heart.png` from site.json:7):

```js
const imageUrl = typeof image === "string" && image.length > 0 ? image : null
// ...
image: `${siteUrl}${imageUrl || defaultImage}`,
```

**lang + hreflang edits** (seo.js:28-32 — D-13/D-14):

```jsx
<Helmet title={seo.title} titleTemplate={titleTemplate}>
  <html lang="it" />                    {/* ← line 29: "en-US" → "it" */}
  {/* lines 30-32: DELETE all three <link rel="alternate"> hreflang tags — no alternates remain */}
```

**PropTypes stay as-is** (seo.js:71-83): `image: PropTypes.string` is already declared — the string-only contract was already documented, only enforcement is new. `titleTemplate` from site.json (`"%s"`) untouched (D-18).

**Consumer contract:** `twitter:image` (:60), `og:image` (:46), and `meta name="image"` (:34) all consume `seo.image` — one fix covers three outputs (UI-SPEC §Seo hardening).

---

### `src/pages/404.js` and `src/pages/thanks.js` (pages, request-response)

**Mutual analogs** (identical skeleton: `Layout` + `<Seo title="...">` + `.wrapper` + icon + h1).

**Title swap** (404.js:10 / thanks.js:10 — D-17; the ONLY change to either file):

```jsx
// 404.js:10
<Seo title="Page not found" />   →   <Seo title="Pagina non trovata" />
// thanks.js:10
<Seo title="Thank you" />        →   <Seo title="Grazie" />
```

No `image` prop today and none added (D-12). Visible h1s stay as-is ("Oops non mi aspettavo...", "Ho ricevuto il tuo messaggio").

---

### `src/content/pages/privacy.md` (content, transform)

**Analog:** `src/content/pages/laryart.md` (clean markdown content page: frontmatter + prose + one image line) — the target shape for the rebuild.

**Frontmatter** (privacy.md:1-5 — D-19 + SEOS-02 title leak):

```markdown
---
template: privacy
slug: /privacy
title: Privacy Policy # ← line 4: → "Privacy e Cookie" (leaks into <title>, h1, meta via privacy.js:30-32)
---
```

**Keep:** lines 7-32 (`# Privacy, Cookie e GDPR` H1 + intro prose + `### Opt out` + `#### Blocca i cookie di terze parti` + its paragraph).

**Rebuild raw-HTML block** (privacy.md:34-82) — convert each `<p>`/`<a>` pair to a markdown paragraph, preserving link text + hrefs (Firefox, Chrome, Internet Explorer, Safari, Opera):

```markdown
Ulteriori informazioni sulla disabilitazione dei cookie su [Firefox, in inglese.](https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences)
Ulteriori informazioni sulla disabilitazione dei cookie su [Chrome, in inglese](https://support.google.com/chrome/answer/95647?hl=en)
```

**Fix broken heading** (privacy.md:83 — leading space makes `####` render as literal text):

```markdown
#### Attiva l'opzione Do Not Track → #### Attiva l'opzione Do Not Track
```

Keep prose lines 84-108 verbatim.

**Trailing raw `<a>` blocks** (privacy.md:110-135) → markdown links (Google / cookiechoices / Garante), e.g.:

```markdown
Maggiori informazioni sulla privacy che garantisce Google all'indirizzo [https://policies.google.com/privacy](https://policies.google.com/privacy)
Altre informazioni sui cookie [https://www.cookiechoices.org/](https://www.cookiechoices.org/)
Pagina informativa sui cookie del Garante della Privacy [http://www.garanteprivacy.it/cookie](http://www.garanteprivacy.it/cookie)
```

**Deobfuscate email** (privacy.md:137):

```markdown
s.foschi [chiocciola] protonmail.com → s.foschi@protonmail.com
```

---

### `src/templates/blog-list.test.js` (test)

**Analog:** current file + Phase 1 mock conventions (01-SUMMARY: jest.mock hoisting, `__esModule: true` requirement, mock-before-import ordering).

**Dead mock removal** (blog-list.test.js:7-10 — `gatsby-image` uninstalled after D-05):

```js
jest.mock("gatsby-image", () => ({
  __esModule: true,
  Img: () => <img alt="" />,
}))
```

Remove this block. Do NOT add a `gatsby-plugin-image` mock — `post-card` is mocked entirely at lines 13-15, so no gatsby-plugin-image module reaches Jest (RESEARCH Code Example 8 is explicitly "not needed for this phase"; `transformIgnorePatterns` in jest.config.js:12 also stays unchanged).

**Assertion swaps** (D-16 co-change, Phase 4 test-update discipline — six occurrences):
| Line | Today | After |
|------|-------|-------|
| 53 | `pagination.queryByText("Previous")` → toBeNull | `queryByText("Precedente")` |
| 55 | `pagination.getByText("Next")` | `getByText("Successivo")` |
| 68 | `pagination.getByText("Previous")` | `getByText("Precedente")` |
| 73 | `pagination.getByText("Next")` | `getByText("Successivo")` |
| 85 | `pagination.getByText("Previous")` | `getByText("Precedente")` |
| 90 | `pagination.queryByText("Next")` → toBeNull | `queryByText("Successivo")` |

The href assertions (`/blog/2`, `/blog/`, `/blog/3`), `is-active` class assertions, `paginationOf` scoping helper (line 45), and all other mocks (lines 19-32: @reach/router, layout, seo) stay untouched. Comment text mentioning "Previous"/"Next" (lines 48, 63, 80) updates with the assertions.

---

### `src/__mocks__/gatsby.js` (utility — likely NO CHANGE)

**Analog:** itself + Phase 1 pattern (01-01-PLAN.md:100 — `jest.requireActual` re-export with Link/graphql/useStaticQuery overrides; "do not add Slice" — same discipline applies: do not add exports nothing uses).

**Current content (12 lines, whole file):**

```js
const React = require("react")
const gatsby = jest.requireActual("gatsby")

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest
    .fn()
    .mockImplementation(({ to, ...rest }) =>
      React.createElement("a", { ...rest, href: to }),
    ),
  useStaticQuery: jest.fn(),
}
```

**Decision:** extend ONLY if a test renders a component importing `gatsby-plugin-image` unmocked. In this phase, `blog-list.test.js` mocks post-card entirely and no other test imports the plugin — **no change expected** (RESEARCH Code Example 8 documents the mock shape if ever needed: `GatsbyImage: () => React.createElement("img", { alt: "" })`, `getImage`, `getSrc` duck-typed).

---

## Shared Patterns

### 1. `fluid` → `gatsbyImageData` query swap (all four query sites)

**Sources:** `blog-post.js:131`, `index-page.js:20`, `blog-list.js:27`, `blog-list-home.js:46` (current `fluid` usage).
**Apply to:** all four GraphQL query sites (one per surface; blog-list + blog-list-home are byte-identical card queries).
**Shape:** `fluid(...) { ...GatsbyImageSharpFluid ...GatsbyImageSharpFluidLimitPresentationSize }` → single `gatsbyImageData(layout: "constrained", quality: 80, breakpoints | width/height, placeholder, transformOptions?)` call. Fragments gone; args inline. `srcSetBreakpoints` → `breakpoints`; `maxWidth`/`maxHeight` → `width`/`height` (deprecated). Placeholder enum uppercase-unquoted in GraphQL (`BLURRED`/`DOMINANT_COLOR`).
**Per-surface args matrix (D-03/D-07):**

| Surface               | Query site           | gatsbyImageData args                                                                                     | placeholder        |
| --------------------- | -------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| Blog-post banner      | blog-post.js:131     | `constrained, quality: 80, breakpoints: [350, 700, 1050, 1400]`                                          | BLURRED            |
| Index hero            | index-page.js:20     | `constrained, quality: 80, breakpoints: [960, 1440]`                                                     | **DOMINANT_COLOR** |
| Card (blog-list)      | blog-list.js:27      | `constrained, width: 540, height: 360, quality: 80, transformOptions: { fit: COVER, cropFocus: CENTER }` | BLURRED            |
| Card (blog-list-home) | blog-list-home.js:46 | same as blog-list                                                                                        | BLURRED            |

### 2. `Img` → `GatsbyImage` component swap with guard

**Sources:** blog-post.js:82, index-page.js:60, post-card.js:9 (current `Img` usage).
**Apply to:** all three component sites.
**Shape:** `Image ? <GatsbyImage image={getImage(...)} alt={...} className="featured-image" .../> : ""` — guard preserved verbatim; `getImage()` null-safe; `className` on wrapper; `objectFit="cover"`/`objectPosition="50% 50%"` carried only where today's code has them (post + card; hero relies on defaults); `loading="eager"` hero-only.
**Import line for all three:** `import { GatsbyImage, getImage, getSrc } from "gatsby-plugin-image"` (getSrc only where the file renders `<Seo image={...}>` — blog-post only).

### 3. Seo image-string contract (D-09/D-10/D-11)

**Sources:** seo.js:23 (bug), blog-post.js:72 (caller).
**Apply to:** blog-post.js (getSrc at the call site) + seo.js (guard).
**Chain:** `getSrc(frontmatter.featuredImage?.childImageSharp)` → string URL → `<Seo image={imageSrc}>` → seo.js guard (`typeof image === "string"`) → `${siteUrl}${imageUrl || defaultImage}` → og:image / twitter:image / meta name="image".

### 4. Italian copy conventions

**Sources:** blog-list.js (D-15/D-16), 404.js/thanks.js (D-17), privacy.md (D-19), UI-SPEC Copywriting Contract.
**Apply to:** blog-list meta + pagination labels, page titles, privacy frontmatter/email.
**Rules:** natural Italian, zero English in rendered output; preserve all existing Italian prose; only the named strings change. Verification greps: `"Stackrole base blog page"` → 0, `"Previous"`/`"Next"` gone, `<title>Blog — Pagina 2</title>` on /blog/2.

### 5. Test co-change discipline (Phase 4 precedent)

**Source:** 04-CONTEXT D-06/D-08 + blog-list.test.js current state.
**Apply to:** blog-list.test.js only — when D-16 changes rendered strings, the six asserting lines change in the same commit. Remove the now-dead `jest.mock("gatsby-image")`. No new test files (phase verification is build-output inspection via the RESEARCH grep suite).

### 6. Lockstep version discipline (Phase 3 precedent)

**Source:** 03-CONTEXT D-01.
**Apply to:** package.json — exact pin, no `^`; `.16` family. **Corrected version: 3.16.0** (plugin's own track, not Gatsby-core 5.x).

## No Analog Found

| File   | Role | Data Flow | Reason                                                                                                                                                                                                                                                                                            |
| ------ | ---- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (none) | —    | —         | Every modification maps to the file's own current state or a sibling surface. `GatsbyImage`/`gatsbyImageData` usage is new to the repo — its "analog" is the legacy `Img`/`fluid` usage being replaced (documented above with per-line swap instructions), not an existing plugin-image consumer. |

## Verification Anchors (planner's success-criteria wiring)

| Criterion                    | Grep/Command (from RESEARCH Code Example 7)                                     | Current state (verified today)                                        |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| IMAG-01 no gatsby-image      | `grep -rl "gatsby-image-outer-wrapper" public/ \| wc -l` → 0                    | legacy classes present                                                |
| IMAG-03 og:image fixed       | `grep -c "object Object" public/*/index.html` → 0                               | `https://laryart.it[object Object]` in public/farfalla-blu/index.html |
| SEOS-01 lang it, no hreflang | `<html lang="it">`; `grep -rl 'rel="alternate"' public/` → 0                    | `lang="en-US"` + 3 hreflang today                                     |
| SEOS-02 no English meta      | `grep -rl "Stackrole base blog page" public/` → 0                               | present today                                                         |
| SEOS-03 privacy valid        | `grep -c '</p>' public/privacy/index.html` balanced; `grep -c "chiocciola"` → 0 | malformed today                                                       |

**Conditional fix (held-out visual check):** blog-post 50vh banner parity — if landscape images leave a gap or portrait images clip under `constrained` layout, apply the additive absolute-fill CSS (RESEARCH Pattern 3: `.blog-post .featured-image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }`). Do NOT apply preemptively; do NOT rewrite existing selectors.

## Metadata

**Analog search scope:** `src/templates/`, `src/components/`, `src/pages/`, `src/content/pages/`, `src/assets/scss/`, `src/util/`, `src/__mocks__/` (root `__mocks__/`), `gatsby-config.js`, `package.json`, `jest.config.js`, `.planning/phases/01-*/` (mock conventions), `.planning/phases/03-*/` (lockstep rule)
**Files scanned:** 13 target files + 5 analogs (laryart.md, privacy.js, layout.js, blog-list-home.js, style.scss ranges) + Phase 1 planning docs
**Pattern extraction date:** 2026-08-19
