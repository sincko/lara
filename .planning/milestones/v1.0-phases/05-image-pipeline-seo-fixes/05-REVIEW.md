---
phase: 05-image-pipeline-seo-fixes
reviewed: 2026-08-20T00:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - src/assets/scss/style.scss
  - src/components/blog-list-home.js
  - src/components/post-card.js
  - src/components/seo.js
  - src/content/pages/privacy.md
  - src/pages/404.js
  - src/pages/thanks.js
  - src/templates/blog-list.js
  - src/templates/blog-list.test.js
  - src/templates/blog-post.js
  - src/templates/index-page.js
  - src/templates/privacy.js
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-08-20T00:00:00Z
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

Reviewed the full phase-5 change set: gatsby-image → gatsby-plugin-image migration (blog-post, index-page, post-card, blog-list, blog-list-home), tracedSVG removal, og:image `[object Object]` fix via `getSrc` + string-only Seo guard, `lang="it"`, hreflang removal, Italian SEO copy, privacy page markdown rebuild, and the 4 visual-delta fixes.

Verification performed against the built output (`public/`) and the installed plugin source:

- **og:image fix confirmed working** — blog post pages emit `og:image content="https://laryart.it/static/...jpg"` (real processed URL, not `[object Object]`); pages without a featured image fall back to `defaultImage` (`/assets/heart.png`) thanks to the string-only guard in `seo.js:20`.
- **`lang="it"` confirmed** in built HTML (`<html lang="it">`).
- **Italian pagination labels** (`Precedente` / `Successivo`) render correctly; the SEOS-02 visibility fix (white background pills on pink) is present in shipped CSS.
- **Migration is complete**: no `gatsby-image` imports, `fluid` fragments, or `tracedSVG` remain in `src/`; `gatsby-plugin-image@3.16.0` is installed and registered in `gatsby-config.js`; all 10 suites / 85 tests pass (`yarn test`).

No critical (blocker) issues were found. Three warnings — two are pre-existing SCSS defects in a file this phase touched (verified to produce broken rules in the shipped CSS bundle), one is an SEO-consistency gap in this phase's own Italianization work.

## Warnings

### WR-01: Stray `©` character silently breaks the `.grids` rule inside `.home-posts`

**File:** `src/assets/scss/style.scss:220`
**Issue:** `.home-posts` contains `padding-bottom: 100px;©` — a stray UTF-8 copyright character (U+00A9) after the semicolon, likely a copy/paste artifact. The build does **not** fail (verified: `sass` compiles it, exit 0), but the next nested rule is mangled into a dead selector:

```css
/* shipped in public/ stylesheet */
.home-posts { color: #fff; padding-bottom: 100px; }
.home-posts © .grids { padding-bottom: 30px; }   /* matches nothing */
```

The intended `padding-bottom: 30px` on the home grid (spacing between the 6 latest posts and the "Vedi tutti i miei post" button) never applies. Pre-existing (introduced in c67d505), but the file was re-touched by this phase and the defect ships in production CSS.
**Fix:**
```scss
.home-posts {
  color: #fff;
  padding-bottom: 100px;
  .grids {
    padding-bottom: 30px;
  }
}
```

### WR-02: Broken mobile pagination media query — `padding: 50px 0 ul { … }`

**File:** `src/assets/scss/style.scss:640-644`
**Issue:** Pre-existing malformed nesting in the `@media (max-width: 991px)` block:

```scss
@media (max-width: 991px) {
  padding: 50px 0 ul {
    display: flex;
    justify-content: space-between;
  }
```

`ul` is parsed as part of the shorthand `padding` value, producing garbage declarations in shipped CSS (verified): `padding-display: flex; padding-justify-content: space-between; padding: 50px 0 ul`. The intent — spreading the page-number list with space-between on mobile — is silently dropped; the pagination `<ul>` keeps `display: inline-block` from the base rule. The page number items (`li`) remain inline-block with `margin: 0 5px` and centered text, so multi-page mobile pagination renders as a cramped centered row that can overflow on narrow screens. This interacts directly with the phase's SEOS-02 pagination visibility work — the mobile layout remains broken despite the desktop color fix.
**Fix:**
```scss
@media (max-width: 991px) {
  padding: 50px 0;
  ul {
    display: flex;
    justify-content: space-between;
  }
  /* … */
}
```

### Warning 03: English month names on an `lang="it"` site

**File:** `src/templates/blog-list.js:22`, `src/components/blog-list-home.js:41`, `src/templates/blog-post.js:125`
**Issue:** All three date queries use `date(formatString: "MMMM DD, YYYY")`, which renders English month names ("September 25, 2020" — confirmed in built HTML) and US day-first order. Phase SEOS-01 set `lang="it"` and SEOS-02 Italianized titles/meta/pagination labels, but post dates remain English. This is a visible i18n inconsistency on every post, list, and the homepage ("Settembre 25, 2020" should be "25 Settembre 2020"). The lines sit inside this phase's rewritten query blocks.
**Fix:** Localize via the site-wide `locale` on `gatsby-source-filesystem` or a localized format, e.g.:
```graphql
date(formatString: "DD MMMM YYYY", locale: "it")
```

## Info

### IN-01: English alt-text suffix on Italian site

**File:** `src/templates/blog-post.js:86`, `src/components/post-card.js:13`
**Issue:** `alt={title + " - Featured image"}` — "Featured image" is English, inconsistent with the Italianized UI from SEOS-02. Suggest "Immagine in evidenza" or the post title alone.

### IN-02: Unused query fields — `excerpt` and full `html` fetched on list pages

**File:** `src/templates/blog-list.js:20`, `src/components/blog-list-home.js:38-39`
**Issue:** `excerpt(pruneLength: 250)` is queried in both list queries and `html` in the home query (fetching full rendered markup for all 6 latest posts), but `PostCard` only renders `title`, `date`, and the image. Dead data at query time — worth removing (particularly `html`).

### IN-03: Redundant absolute-positioning rule for blog-post featured image

**File:** `src/assets/scss/style.scss:331-342`
**Issue:** `.blog-post .featured-image img { position: absolute; inset: 0; … }` duplicates the plugin's injected rule `.gatsby-image-wrapper img { position: absolute; bottom/left/right/top: 0; height/width: 100%; object-fit: cover; }` (verified in the SSR-injected `<style>` of every built page). The rule is harmless (the inline-positioned sizer `<img>` keeps `position: static` via inline styles, so no layout break) but redundant — safe to delete; keep only the `display: block; min-height: 50vh; border-radius: 12px; margin: 0 auto;` wrapper rules. Note: the banner-centering intent is preserved because the wrapper div gets `display: block; margin: 0 auto`, while the plugin's own `.gatsby-image-wrapper-constrained { display: inline-block }` is overridden — that part works and is needed.

---

_Reviewed: 2026-08-20T00:00:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
