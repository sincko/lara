---
status: complete
files_reviewed:
  - gatsby-browser.js
  - gatsby-config.js
  - package.json
  - .nvmrc
  - README.md
  - static/admin/config.yml
  - src/assets/scss/style.scss
  - src/assets/scss/_theme-variables.scss
  - src/content/pages/privacy.md
critical: 4
warning: 5
info: 10
total: 19
---

# Phase 3 (core-upgrade) — Code Review

Read-only review of the Phase 3 core-upgrade deliverables. Verification performed: compiled `style.scss` with the installed dart-sass (1.102.0) and inspected the output CSS; inspected `node_modules/gatsby/cache-dir/navigation.js` (5.16.1) for `onRouteUpdate` semantics; checked `yarn.lock` for the `@mapbox/jsonlint-lines-primitives` resolution; grepped the repo (excluding node_modules/.git/.planning/graphify-out) for leftover matomo/node-sass/advanced-sitemap references; confirmed git branch is `main`.

## CRITICAL

### CR-01 — Stray `©` character produces invalid CSS in `style.scss:220`

`src/assets/scss/style.scss:220` contains `padding-bottom: 100px;©` — a stray copyright character inside the `.home-posts` rule. Compiled output (verified with dart-sass) contains the invalid selector:

```css
.home-posts © .grids {
  padding-bottom: 30px;
}
```

Browsers silently drop this rule, so the `.grids` bottom padding on the home page is lost. Pre-existing (not introduced by Phase 3), but it lives in a reviewed file and the dart-sass migration was the right moment to catch it. Fix: delete the `©` character.

### CR-02 — Broken mobile pagination layout in `style.scss:555-559`

```scss
@media (max-width: 991px) {
  padding: 50px 0 ul {
    display: flex;
    justify-content: space-between;
  }
```

`padding: 50px 0 ul` is not a valid padding value; the nested `ul` block is parsed as part of the declaration. Compiled output (verified):

```css
.pagination {
  padding: 50px 0 ul;
  padding-display: flex;
  padding-justify-content: space-between;
}
```

The intended mobile `ul { display: flex; justify-content: space-between; }` rule never exists, so pagination layout on mobile falls back to the desktop `inline-block` list. Pre-existing, but a real functional bug in a reviewed file. Fix: `padding: 50px 0;` followed by a proper `ul { ... }` block.

### CR-03 — GA4 double-counts the first pageview (`gatsby-browser.js`)

The module-scope snippet fires `window.gtag("config", GA_MEASUREMENT_ID, ...)` at load (line 10), which sends a pageview once gtag.js processes the dataLayer queue. Then Gatsby 5.16's `RouteUpdates.componentDidMount()` calls `onRouteUpdate(location, null)` on the initial mount (verified in `node_modules/gatsby/cache-dir/navigation.js:226`), and the handler at `gatsby-browser.js:21-37` sends a second `config` with `page_path`/`page_title`. Result: every first page load is counted twice in GA4.

Fix options: drop the module-scope `config` and rely on `onRouteUpdate` (it fires on initial mount with `prevLocation === null`), or keep the module-scope `config` with `send_page_view: false` and let `onRouteUpdate` own all pageviews.

### CR-04 — `privacy.md` disclosure does not match the actual GA4 setup

- Line 17: "non utilizza cookie di terze parti" — misleading. GA4 sets first-party cookies (`_ga`, `_ga_<ID>`) on laryart.it and the script is served from googletagmanager.com; the page never mentions first-party cookies at all, and the site has no consent banner while the page claims GDPR compliance (provv. 229/2014). Under the Garante's 2021 cookie guidelines, analytics cookies require prior consent.
- Line 21: "un indirizzo ip nella forma 192.xxx.xxx.xxx con gli ultimi tre blocchi dell'indirizzo ip anonimizzati" — factually wrong. GA4's `anonymize_ip` truncates only the last octet of IPv4 (e.g. `192.168.1.xxx`), not the last three blocks.
- Lines 23-45: the data list (Page speed, Outlink, Download, etc.) is Universal-Analytics/Matomo-era; GA4 does not collect these by default. The disclosure should describe GA4's actual event/parameter model.

## WARNING

### WR-01 — Stale node-sass error message in `scripts/check-node-version.js:21`

The version-mismatch error still says "node-sass 9.0.0 non ha un binario precompilato per questo Node (vincolo ABI)". After the dart-sass migration this rationale is false and the recovery hint is misleading. Update the message to reference the project's Node 24 pin instead.

### WR-02 — `AGENTS.md:14` documents a postinstall script that no longer exists

`AGENTS.md` still describes `scripts/clean-node-sass-vendor.js` (deletes non-ELF node-sass bindings). `scripts/` now contains only `check-node-version.js`. Stale node-sass references will mislead future agents.

### WR-03 — `gatsby-browser.js:28-36` — 32ms `setTimeout` race and path-only `page_referrer`

- If the user navigates again within 32ms, the pending pageview fires with the new page's `document.title` (stale title for the previous page).
- `page_referrer: prevUrl` passes a path (`/blog/2`), but GA4 expects an absolute URL for `page_referrer`; referrer attribution may be wrong or dropped.

### WR-04 — `static/admin/config.yml:12` — `local_backend: true` committed in production config

The production CMS config has `local_backend: true` enabled. Decap falls back to git-gateway when the local proxy is unreachable, but this is fragile: if the fallback misbehaves (or a future Decap version changes the behavior), production CMS auth breaks. Best practice: keep `local_backend` commented and enable it only during local development.

### WR-05 — GA4 loads unconditionally with no consent mechanism

`gatsby-browser.js` injects gtag.js on every page with no consent banner, no consent mode (`gcs`), and no opt-out. Combined with the GDPR claims in `privacy.md` (CR-04), this is a compliance risk under Italian cookie guidelines. At minimum, document the decision; ideally add a consent gate or `gtag('consent', 'default', ...)`.

## INFO

### IN-01 — Dead commented-out `siteMetadata` block in `gatsby-config.js:17-19`

The commented `siteMetadata: { siteUrl: ... }` block is dead code; `siteUrl` actually comes from `src/util/site.json` via `settings.meta` (verified: `site.json` has `siteUrl: https://laryart.it`, which `gatsby-plugin-sitemap` picks up). Remove the comment to avoid confusion.

### IN-02 — English service-worker update prompt on an Italian site

`gatsby-browser.js:39-48` uses `window.confirm` with English text ("This application has been updated..."). All UI copy elsewhere is Italian.

### IN-03 — `gatsby-plugin-netlify-cms-paths` uses a caret range

`package.json:36` has `^1.3.0` while every other dependency is pinned exactly. Minor consistency issue; consider pinning.

### IN-04 — dart-sass `@import` deprecation warnings

Compiling `style.scss` with the installed sass 1.102.0 emits deprecation warnings for all `@import` rules (removal in Dart Sass 3.0). Not urgent, but plan the `@use`/`@forward` migration.

### IN-05 — Unguarded `getElementsByTagName("script")[0]` in `gatsby-browser.js:14`

If no `<script>` element exists when the module runs, `s.parentNode` throws. Harmless in practice (Gatsby injects scripts in `<head>`), but a null guard would be more robust.

### IN-06 — Deprecated `gatsby-image` still present

`package.json:33` keeps `gatsby-image ^3.11.0`. Consistent with AGENTS.md (image migration is planned work, out of this phase's scope) — noted for tracking only.

### IN-07 — Malformed HTML in `privacy.md:55-101`

The opt-out section has `</p>` closing tags without opening `<p>` tags (raw HTML inside Markdown). Browsers tolerate it, but the markup is invalid.

### IN-08 — Formatting glitches in `privacy.md`

Line 126: "Elimina direttamente i cookie" is missing its `####` heading marker. The page also cites provv. 229/2014, superseded by the Garante's 2021 cookie guidelines.

### IN-09 — GA4 also tracks `/admin/` (Decap CMS) sessions

The snippet runs on every route, including the CMS admin. Consider excluding `/admin/` from tracking.

### IN-10 — Duplicate `margin-top` in `.home-banner .tagline`

`style.scss:192` and `style.scss:200` both declare `margin-top`; the second wins. Harmless but redundant.

## Verified-clean items

- `package.json` engines `"24.x"` ↔ `.nvmrc` `24` ↔ `engine-strict true` in `.yarnrc` ↔ `scripts/check-node-version.js` — consistent.
- `resolutions` `@mapbox/jsonlint-lines-primitives: 2.0.2` — confirmed pinned in `yarn.lock` (single resolved version).
- No leftover matomo/node-sass/advanced-sitemap references in source/config files (only the two stale doc/message spots flagged as WR-01/WR-02).
- `gatsby-config.js` plugin registry: no dangling references; `gatsby-plugin-decap-cms` 4.0.4 correctly resolves `decap-cms-app` 3.6.4 (verified in the plugin's `gatsby-node.js`); `netlifyCmsPaths` still wired inside `gatsby-transformer-remark` with `cmsConfig: /static/admin/config.yml`.
- Google Fonts `@import url(...)` hoisted to the top of `style.scss` (lines 1-2) — correct for dart-sass; no duplicate imports; `_theme-variables.scss` `:root` block clean and matches the loaded font families.
- `config.yml`: `branch: main` matches the actual git branch; `backend: git-gateway` consistent with README; `media_folder`/`public_folder` consistent with `gatsby-source-filesystem` assets path.
- GA4 snippet: window guard present, `dataLayer`/`gtag` stub pattern correct, `anonymize_ip: true` matches the privacy-page claim, `onRouteUpdate` guards `!window.gtag`, SPA navigation handled via `page_path` + `page_referrer`.
