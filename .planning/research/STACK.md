# Stack Research

**Domain:** Gatsby static site modernization — Gatsby 5→6 migration attempt, dependency upgrades, MUI v4 removal, yarn consolidation
**Project:** LaryArt (laryart.it)
**Researched:** 2026-08-18
**Confidence:** HIGH (all versions verified live against npm registry API + official Gatsby docs + GitHub, 2026-08-18)

## Critical Finding: There Is No Gatsby 6

**Gatsby 6 does not exist as of 2026-08-18.** Verified three ways:

1. **npm registry** — `gatsby` `latest` dist-tag = `5.16.1` (published 2026-02-10). No `v6` tag exists in the full dist-tags list (60+ tags, all ≤5.x). The `next` tag is `5.17.0-next.1` (Dec 2025) — still v5.
2. **GitHub releases** — `gatsbyjs/gatsby` latest release: `gatsby@5.16.1` (2026-02-10), `5.16.0` (2026-01-26), `5.15.0` (2025-08-27).
3. **Official docs** — release-notes index stops at v5.16; the [Gatsby Framework Version Support](https://www.gatsbyjs.com/docs/reference/release-notes/gatsby-version-support/) page lists **v5 as "Active Long-term support"** with no end date and no v6 entry.

**Roadmap implication: "Attempt Gatsby 6" must become "Upgrade to Gatsby 5.16.1 (latest)".** A Gatsby 6 does not exist to migrate to. The realistic modernization target is the current 5.x line, which is actively maintained (5.16.0 released Jan 2026, 5.16.1 Feb 2026).

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `gatsby` | **5.16.1** | Static site generator (from 5.15.0) | Latest stable; engines `node >=18 <26`; official React 19 support (v5.16) with React 18 still fully supported. All gatsby-* plugins bumped in lockstep. **Do not wait for "Gatsby 6" — it does not exist and 5.x is in active LTS.** |
| `react` / `react-dom` | **19.2.8** (recommended end state) or **18.3.1** (safe first step) | UI library | Gatsby 5.16 officially supports React 19 ("all existing stable functionality works"; security advisory explicitly cleared). **But see decap-cms-app constraint below** — the CMS forces either React 19 (to use latest CMS) or a pinned CMS version (to stay on 18). Recommended sequencing: stay 18.3.1 for the Gatsby+CMS swap phase, then move to 19 once Decap is in and react-helmet is replaced by the Head API. |
| `sass` (dart-sass) | **1.102.0** | SCSS compilation — replaces `node-sass` 9.0.0 | `node-sass` is officially deprecated ("Node Sass is no longer supported. Please use `sass` or `sass-embedded`"). `gatsby-plugin-sass@6.16.0` peer-requires `sass ^1.30.0`. **Drop-in:** repo uses only local `@import`s (style.scss → theme-variables/defaults/utility/lib) plus two `@import url(...)` Google Fonts — all work under dart-sass 1.x (deprecation warnings for `@import` may appear; do NOT jump to sass 3.x without migrating `@import`→`@use`). |
| Node.js | **22 LTS** (`.nvmrc` + `netlify.toml`) | Runtime | Gatsby 5.16.1 engines `>=18 <26`; Node 20 (current) hit EOL April 2026 — Node 22 is active LTS until April 2027 and Node 24 is officially supported by Gatsby 5.16. Fix the stale `NODE_VERSION = "10"` in `netlify.toml`; set build command to `yarn build`. |

### Content / CMS

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `decap-cms-app` | **3.15.1** (React 19 path) or **3.6.4 pinned** (React 18 path) | CMS admin UI — replaces `netlify-cms-app` 2.15.72 | `netlify-cms-app` is EOL (Netlify CMS discontinued, forked as Decap CMS; repo redirects). Decap is the maintained fork, **actively developed** (3.15.1 published 2026-07-24). **Constraint (verified from registry peerDeps):** decap-cms-app `^19.1.0` peer for react/react-dom from v3.7.0 (2025-06-26) onward; **3.6.4 (2025-06-06) is the last release with React 18 peer (`^18.2.0`)**. If the site stays on React 18, pin `decap-cms-app@3.6.4`. |
| `gatsby-plugin-decap-cms` | **4.0.4** | Injects Decap CMS into the Gatsby build — replaces `gatsby-plugin-netlify-cms` 7.12.1 | `gatsby-plugin-netlify-cms` **7.12.1 is deprecated** (registry deprecation: "renamed and moved to gatsby-plugin-decap-cms"). The Decap plugin README explicitly documents "Gatsby v5 and Decap CMS 3.x require gatsby-plugin-decap-cms@^4.0.0". Note: last published 2024-02 but functional; same webpack build-injection approach as the Netlify one. |
| `gatsby-plugin-netlify-cms-paths` | **1.3.0** (keep, then inline) | Rewrites `/assets/...` media paths in remark markdown | Unmaintained since 2019 but CMS-agnostic — it hooks `gatsby-transformer-remark` node processing, not the CMS app, so it keeps working under Decap. Low risk to keep; because it's tiny, inlining its logic into `gatsby-node.js` during the cleanup phase removes the last 2019-era dependency (MEDIUM confidence — behavior identical, code is ~50 lines). |
| `gatsby-transformer-remark` | **6.16.0** | Markdown → HTML | Official, current; bump in lockstep with Gatsby 5.16. |

### Image Pipeline

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `gatsby-plugin-image` | **3.16.0** | Image component — replaces `gatsby-image` 3.11.0 | `gatsby-image` is **deprecated** ("gatsby-image is now gatsby-plugin-image... will no longer receive updates", last publish 2021). Mechanical migration for this small component set (`post-card.js`, `blog-list-home.js`, `blog-post.js`, `index-page.js`): `Img`/`fluid` → `GatsbyImage` + `getImage`; query `fluid` → `gatsbyImageData`. Works with the existing `gatsby-plugin-sharp`/`gatsby-transformer-sharp` 5.16.0. |
| `gatsby-plugin-sharp` / `gatsby-transformer-sharp` | **5.16.0** | Image processing | Official; required by gatsby-plugin-image and gatsby-remark-images. |
| `gatsby-remark-images` | **7.16.0** | Inline markdown images | **Required config change (verified in source):** the `tracedSVG` option is **removed** in this line — the plugin logs "tracedSVG plugin option ... is no longer supported. Blurred placeholder will be used." Remove `tracedSVG: true` from `gatsby-config.js` during the upgrade (it currently generates a build warning). |

### SEO / Analytics

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Gatsby **Head API** (built-in) | n/a (core since v4.19) | SEO meta — replaces `react-helmet` 6.1.0 + `gatsby-plugin-react-helmet` 6.16.0 | `react-helmet` is unmaintained (last publish 2020) and **does not support React 19** (its only React-19 path is the third-party `@dr.pogodin/react-helmet` fork, peer `react: 19`). Gatsby's own Head API is the maintained replacement, is exactly what the v5.16 release notes reference (React 19 metadata hoisting is deliberately disabled to avoid conflicts with it), and removes 2 dependencies. Migration is localized to `seo.js`: move meta into an `export function Head()` per page/template (5 page templates + seo component). |
| Matomo tracking — **no package**; implement the official Matomo JS snippet in `gatsby-browser.js` | n/a | Analytics — replaces `gatsby-plugin-matomo` 0.17.0 | `gatsby-plugin-matomo` 0.17.0 is **deprecated** ("Package no longer supported") and its repo (`kremalicious/gatsby-plugin-matomo`) is **archived** (Dec 2024). Alternatives checked: `@whitespace/gatsby-plugin-matomo` (peer caps at gatsby ^4, react ≤18 — does not declare Gatsby 5/React 19); `@devsisters/gatsby-plugin-matomo` (stuck at 2.0.0-rc since 2023); `@datapunt/matomo-tracker-react` 0.5.1 (peer `react >=16.8`, maintained by Amsterdam data org — viable wrapper). **Recommendation: vendor the ~15-line official `_paq` snippet into `gatsby-browser.js`** (same config: siteId 4, matomo.duckdns.org). Zero dependencies, works on any React/Gatsby version, no plugin-maintainer risk. Use this phase to also set `disableCookies: true` (GDPR; see CONCERNS.md). |
| `gatsby-plugin-sitemap` | **6.16.0** | Sitemap | Official, maintained. **Remove `gatsby-plugin-advanced-sitemap` 2.1.0** (unmaintained, duplicates output — already flagged in CONCERNS.md). |

### Forms / UI

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@emailjs/browser` | **4.4.1** | Contact form email delivery — replaces `emailjs-com` 3.2.0 | `emailjs-com` 3.2.0 is **deprecated** ("The SDK name changed to @emailjs/browser"). v4 is the maintained package; import change only (`emailjs-com` → `@emailjs/browser`, same `sendForm` API). Move the hardcoded key to `GATSBY_EMAILJS_*` env vars at the same time (CONCERNS.md). Alternative considered: native Netlify form handler (form already carries `data-netlify`); viable but a behavior change — keep EmailJS for this milestone unless the owner wants the switch. |
| `formik` | **2.4.9** | Form state/validation | Active (2.4.9 released 2025-11-10); peer `react >=16.8` — fine on React 18/19. Already latest — no change needed. |
| `yup` | **1.7.1** | Validation schema | Already latest (peer-free). No change. |
| `react-icons` | **5.7.0** | Icons — replaces `@material-ui/icons` | Already latest; peer `react: *`. Use it for the 1-2 icons in `top-contacts.js` currently from `@material-ui/icons`. |
| MUI v4 replacement — **none** | — | Contact form inputs | `@material-ui/core` 4.12.4 is EOL (renamed `@mui/material` in v5, 2021; no security fixes). The form only uses `TextField` + `Button`. **Replace with plain styled inputs** matching the existing SCSS theme (`_theme-variables.scss`) — zero new dependencies, which is the milestone's stated decision. Do NOT add `@mui/material` v7 just for this. |

### PWA / Build / Dev

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `gatsby-plugin-manifest` | **5.16.0** | PWA manifest + icons | Official, maintained; keep (config already correct: name "LaryArt by Lara", theme #ff1c65, icon static/assets/stackrole.png). Delete legacy `static/manifest.json` + static icon set (CONCERNS.md). |
| `gatsby-plugin-offline` | **6.16.0** | Service worker | Official, maintained, no deprecation. Keep; must stay listed **after** gatsby-plugin-manifest (already correct in gatsby-config.js). |
| `gatsby-plugin-sass` | **6.16.0** | SCSS via webpack | Official; bump in lockstep. |
| `gatsby-source-filesystem` | **5.16.0** | File sourcing (assets + content) | Official; bump. |
| `gatsby-plugin-react-helmet` | **remove** (6.16.0 current) | SSR helmet support | Remove together with react-helmet once Head API migration lands. |
| `gatsby-background-image` | **remove** | Legacy bg images | Unused in `src/` (CONCERNS.md) — dead dependency, drop it. |
| `gatsby-image` | **remove** | Legacy images | Replaced by gatsby-plugin-image (above). |
| `prettier` | **3.9.6** | Formatting | Already used; bump minor. |
| `typescript` (devDep) | **remove** | Type checking | Declared but unused (no tsconfig.json, no .ts/.tsx in src/). Removing it is the correct "latest" state for this repo — do NOT enable TS during a maintenance migration milestone. |
| `codemirror`, `seamless-immutable`, `redux`, `react-refresh`, `y18n`, `prismjs`, `package-doctor`, `yarn` (as dep), `acorn` | **remove** | Starter leftovers / audit hacks | None imported in `src/` (CONCERNS.md lines 13-18). Prismjs is only needed transitively via gatsby-remark-prismjs 7.16.0. Remove all; `gatsby build` as verification. |
| `yarn` (package manager) | **1.22.22 classic** | Package manager | Per PROJECT.md decision: yarn is the single source of truth. Delete `package-lock.json`, set `netlify.toml` build command to `yarn build`. Keep Yarn 1 (classic) — it's what `packageManager` declares and what Netlify detects; do NOT migrate to Yarn 3/4 (berry) in a maintenance milestone (PnP/zero-install changes add risk for zero benefit on this project). |

## Installation

```bash
# Core upgrade (after removing dead deps + MUI + netlify-cms stack)
yarn add gatsby@5.16.1 \
  gatsby-source-filesystem@5.16.0 gatsby-transformer-sharp@5.16.0 gatsby-plugin-sharp@5.16.0 \
  gatsby-transformer-remark@6.16.0 gatsby-remark-images@7.16.0 gatsby-remark-prismjs@7.16.0 \
  gatsby-remark-responsive-iframe@6.16.0 \
  gatsby-plugin-sass@6.16.0 gatsby-plugin-sitemap@6.16.0 gatsby-plugin-manifest@5.16.0 \
  gatsby-plugin-offline@6.16.0 gatsby-plugin-image@3.16.0 \
  sass@1.102.0 \
  @emailjs/browser@4.4.1

# CMS swap (React 18 path — pin 3.6.4)
yarn add decap-cms-app@3.6.4 gatsby-plugin-decap-cms@4.0.4
# CMS swap (React 19 path — latest)
yarn add decap-cms-app@3.15.1 gatsby-plugin-decap-cms@4.0.4

# Removal
yarn remove node-sass @material-ui/core @material-ui/icons netlify-cms-app gatsby-plugin-netlify-cms \
  gatsby-plugin-netlify-cms-paths gatsby-plugin-matomo gatsby-plugin-advanced-sitemap \
  gatsby-image gatsby-background-image react-helmet gatsby-plugin-react-helmet emailjs-com \
  codemirror seamless-immutable redux react-refresh typescript y18n prismjs package-doctor yarn acorn

# If moving to React 19 (second phase, after Head API migration):
yarn add react@19.2.8 react-dom@19.2.8

# Dev
yarn add -D prettier@3.9.6
rm package-lock.json   # yarn is the single source of truth
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Gatsby 5.16.1 (stay on Gatsby) | Rewrite on Next.js/Remix | Only if the owner wants a full rewrite — this is a 5-template static site with CMS git-gateway editing; Gatsby 5.x is active LTS, the rewrite cost is not justified for this milestone. Gatsby 6 itself does not exist. |
| Stay React 18 (first phase) | React 19 immediately | Go 19 in the same phase IF and only if react-helmet is already replaced by Head API and decap-cms-app can be latest. React 18 keeps decap-cms-app pinned at 3.6.4. |
| `decap-cms-app@3.6.4` pinned (React 18) | `decap-cms-app@3.15.1` (React 19) | Use 3.15.1 only after React 19 upgrade. Do NOT install 3.7+ on React 18 — peer conflict (Yarn 1 won't enforce it, which is exactly how silent breakage happens). |
| `gatsby-plugin-netlify-cms-paths@1.3.0` kept | Inline path rewriting in `gatsby-node.js` | Inline it during cleanup to drop the 2019-era dep; keep the plugin if you want the migration phase smaller. |
| Official Matomo `_paq` snippet in `gatsby-browser.js` | `@datapunt/matomo-tracker-react` 0.5.1 | Use the tracker wrapper if you want typed tracking calls in components; the snippet suffices for the current single-page-view use case. |
| `@emailjs/browser@4.4.1` | Native Netlify form (drop EmailJS) | Choose native Netlify only if the owner wants to drop the third-party service — the form already has `data-netlify` attrs; requires removing the Formik/EmailJS submit path (bigger change, CONCERNS.md documents the broken failure handling either way). |
| `sass@1.102.0` (dart-sass) | `sass-embedded` | Equivalent performance; `sass` package is the standard drop-in. Revisit only if install times matter. |
| Yarn 1.22.22 classic | Yarn 3/4 berry, pnpm, npm | Keep Yarn 1: `packageManager` field declares it, Netlify auto-detects it, and switching package managers is out of scope for a migration milestone. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `gatsby@6.x` | **Does not exist** — no v6 release, no v6 dist-tag, no v6 release notes as of 2026-08-18 | `gatsby@5.16.1` |
| `node-sass@9` | Officially deprecated; native-binding install failures (the recurring build-breakage commits in git history) | `sass@1.102.0` |
| `netlify-cms-app@2.x` | EOL — Netlify CMS discontinued; no updates; git-gateway auth at risk | `decap-cms-app` (3.6.4 on React 18, 3.15.1 on React 19) |
| `gatsby-plugin-netlify-cms@7.12.1` | Deprecated — "renamed and moved to gatsby-plugin-decap-cms" | `gatsby-plugin-decap-cms@4.0.4` |
| `gatsby-plugin-matomo@0.17.0` | Deprecated on npm; GitHub repo archived Dec 2024 | Vendored `_paq` snippet or `@datapunt/matomo-tracker-react` |
| `@material-ui/core` / `@material-ui/icons` v4 | EOL since 2021, no security fixes; only TextField/Button/2 icons used | Plain SCSS-styled inputs + `react-icons@5.7.0` |
| `@mui/material@7` (for the form) | Adds ~100KB+ dependency to replace 2 components in a hobby site | Plain CSS |
| `gatsby-image` / `gatsby-background-image` | Deprecated (2021); no updates | `gatsby-plugin-image@3.16.0` |
| `react-helmet@6.1.0` | Unmaintained since 2020; incompatible with React 19 | Gatsby Head API (built-in) |
| `gatsby-plugin-advanced-sitemap@2.1.0` | Unmaintained; duplicate sitemap output | `gatsby-plugin-sitemap@6.16.0` only |
| `emailjs-com@3.2.0` | Deprecated — renamed | `@emailjs/browser@4.4.1` |
| `typescript` devDep | Installed but unused (no tsconfig, no .ts files) | Remove; do not enable TS in this milestone |
| Gatsby Partial Hydration | Experimental; **known-incompatible with React 19** (per v5.16 release notes) | Don't use |
| `decap-cms-app@>=3.7` on React 18 | Peer-requires React 19 — silent runtime breakage risk under Yarn 1 | Pin `3.6.4` until React 19 upgrade |
| Yarn 3/4 berry | PnP/zero-install churn for zero benefit on a single-site repo | Yarn 1.22.22 (already declared) |

## Stack Patterns by Variant

**If the team wants the smallest-risk migration (recommended path):**
- Gatsby 5.15.0 → 5.16.1, stay React 18.3.1
- CMS: `decap-cms-app@3.6.4` + `gatsby-plugin-decap-cms@4.0.4` (React-18-compatible Decap line)
- Keep react-helmet temporarily OR do the Head API migration in the same phase (it's small — 1 component + 5 templates)
- All other upgrades as recommended (sass, @emailjs/browser, gatsby-plugin-image, plugin bump to 5.16/6.16/7.16)

**If the team wants "everything latest" (end state, second phase):**
- React 19.2.8 + react-dom 19.2.8 (Gatsby 5.16 officially supports it)
- Head API migration FIRST (react-helmet 6.1.0 breaks on React 19)
- Then `decap-cms-app@3.15.1` (latest, React 19 peer)
- Matomo snippet already vendored — unaffected by React version

**Node version:** 22 LTS in `.nvmrc` AND `netlify.toml` (`NODE_VERSION = "22"`, `command = "yarn build"`). Node 24 also officially supported by Gatsby 5.16 if Netlify's runtime favors it.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `gatsby@5.16.1` | `react ^18 \|\| ^19`, `node >=18 <26` | Verified from registry engines + peerDeps + v5.16 release notes |
| `gatsby-plugin-image@3.16.0` | gatsby 5.x, react 18/19, gatsby-plugin-sharp ^5, gatsby-source-filesystem ^5 | Verified from peerDeps |
| `gatsby-plugin-sass@6.16.0` | `sass ^1.30.0`, gatsby ^5 | Verified from peerDeps; dart-sass 1.102.0 satisfies |
| `gatsby-remark-images@7.16.0` | gatsby ^5, gatsby-plugin-sharp ^5 | **Remove `tracedSVG` config option** — unsupported in this line (verified in plugin source) |
| `decap-cms-app@3.6.4` | react/react-dom ^18.2.0 | Last React-18 line (peerDeps verified across 3.4.0→3.8.0) |
| `decap-cms-app@3.15.1` | react/react-dom ^19.1.0 | Current latest (2026-07-24); requires React 19 |
| `gatsby-plugin-decap-cms@4.0.4` | Gatsby v5 + decap-cms-app 3.x | Documented in plugin README; note repo last pushed 2024-02 (functional, unmaintained-ish) |
| `gatsby-plugin-netlify-cms-paths@1.3.0` | Any remark pipeline (CMS-agnostic) | Keeps working under Decap; consider inlining (MEDIUM confidence) |
| `@emailjs/browser@4.4.1` | React-agnostic | Same `sendForm` API as emailjs-com v3 |
| `formik@2.4.9` | react >=16.8 (18 & 19 OK) | Verified from peerDeps |
| `react-icons@5.7.0` | react `*` | Verified from peerDeps |
| `gatsby-plugin-offline@6.16.0` | react 18/19, gatsby ^5 | Keep after gatsby-plugin-manifest in plugin array (already correct) |
| `gatsby-plugin-matomo@0.17.0` | gatsby ^4 \|\| ^5, react >=17 | **Deprecated + archived — replace regardless** |

## Integration Points with Existing Setup

1. **`gatsby-config.js`** — plugin registry changes: swap netlify-cms → decap-cms pair; drop advanced-sitemap, matomo, react-helmet; add gatsby-plugin-image; remove `tracedSVG: true` from gatsby-remark-images options; keep manifest→offline ordering; keep the two source-filesystem entries.
2. **`gatsby-node.js`** — unchanged by the upgrade (createPages + pagination logic carries over). Optional: inline netlify-cms-paths rewriting here when dropping that plugin.
3. **`src/components/formik.js`** — swap MUI TextField/Button for plain SCSS inputs; `emailjs-com` → `@emailjs/browser` import; move `emailjs.init("user_...")` to `process.env.GATSBY_EMAILJS_USER_ID` (+ service/template IDs); fix the false-success redirect (CONCERNS.md bug) while touching this file.
4. **`src/components/seo.js` + 5 templates** — react-helmet → Gatsby Head API (`export function Head`), fixing `html lang="en-US"` → `lang="it"` and the og:image interpolation bug in the same pass (CONCERNS.md).
5. **Image components** — `src/templates/blog-post.js`, `src/templates/index-page.js`, `src/components/post-card.js`, `src/components/blog-list-home.js`: `Img`/`fluid` → `GatsbyImage`/`gatsbyImageData` (fragment change: `...GatsbyImageSharpFluid` → `...GatsbyImageSharpFixed`/`...GatsbyImageSharp` equivalents). Also fixes the og:image `[object Object]` bug by reading `image.publicURL`.
6. **`static/admin/config.yml`** — unchanged (Decap is config-compatible with Netlify CMS); `local_backend` workflow and `npx netlify-cms-proxy-server` still work under Decap.
7. **`netlify.toml`** — `NODE_VERSION = "22"`, `command = "yarn build"` (was `npm run build`), keep `publish = "public"` and the gatsby cache plugin.
8. **`.nvmrc`** — `22` to match netlify.toml (Node 20 EOL April 2026).
9. **Lockfiles** — delete `package-lock.json`; keep `yarn.lock` regenerated once with the final dependency set.
10. **`src/util/site.json`** — remove the `ga` placeholder while touching siteMetadata (CONCERNS.md).

## Sources

- **npm registry API** (registry.npmjs.org, queried live 2026-08-18) — authoritative current versions, dist-tags, peerDependencies, engines, deprecation flags for all 30+ packages above. HIGH confidence.
- **GitHub API** — gatsbyjs/gatsby releases (latest 5.16.1, 2026-02-10); kremalicious/gatsby-plugin-matomo archived; decaporg repos. HIGH confidence.
- **Gatsby v5.16 Release Notes** (gatsbyjs.com/docs/reference/release-notes/v5.16) — React 19 official support, Node 24 support, Partial Hydration incompatibility warning, Head API/metadata-hoisting note. HIGH confidence.
- **Gatsby Framework Version Support** (gatsbyjs.com/docs/reference/release-notes/gatsby-version-support) — v5 = Active LTS, no v6. HIGH confidence.
- **gatsby-remark-images plugin source** (github.com/gatsbyjs/gatsby, packages/gatsby-remark-images/src/gatsby-node.js) — tracedSVG option removal verified. HIGH confidence.
- **gatsby-plugin-decap-cms README** (github.com/decaporg/gatsby-plugin-decap-cms) — "Gatsby v5 and Decap CMS 3.x require gatsby-plugin-decap-cms@^4.0.0", install/config guidance. HIGH confidence for compat statement, MEDIUM for maintenance status (last push Feb 2024).
- **gatsby-plugin-netlify-cms registry deprecation** — "renamed and moved to gatsby-plugin-decap-cms". HIGH confidence.
- **gatsby-plugin-netlify-cms-paths@1.3.0** — unmaintained since 2019 (publish date verified); CMS-agnostic behavior inferred from its remark-integration design. MEDIUM confidence on "works unchanged under Decap".

**Gaps / follow-up for phase-level research:**
- Decap CMS 3.6.4 vs 3.15.1 functional diff (bugfixes between June 2025 and July 2026) — not needed for stack choice, but check Decap changelog if CMS quirks appear.
- Exact `gatsbyImageData` fragment replacements for the 4 image-consuming components — mechanical but must be verified during the image phase.
- Whether Netlify's `netlify-plugin-gatsby-cache` still targets Gatsby 5.x correctly after the upgrade — verify against Netlify plugin docs in the deploy phase.

---
*Stack research for: LaryArt Gatsby 6 migration / dependency modernization milestone*
*Researched: 2026-08-18*
