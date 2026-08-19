# Phase 3: Core Upgrade - Pattern Map

**Mapped:** 2026-08-19
**Files analyzed:** 9 modified + 1 deleted + 1 implicit (yarn.lock)
**Analogs found:** 11 / 11 (modification-only phase — every file's analog is its own current state)

## Phase Shape

This is a **dependency-swap phase with zero new source files**. Every file in scope already exists and is edited in place; the only new code is the ~25-line vendored `_paq` snippet added to `gatsby-browser.js` (pattern source: RESEARCH.md §Code Examples, verified against Matomo official docs + the removed plugin's source). No new components, services, or tests are created (RESEARCH.md §Validation Architecture: "No new test files are required").

## File Classification

| File | Action | Role | Data Flow | Closest Analog | Match Quality |
|------|--------|------|-----------|----------------|---------------|
| `package.json` | modify | config (manifest) | n/a (dependency registry) | itself — current dep-pinning style | exact |
| `.nvmrc` | modify | config | n/a (version pin) | itself — single-line pin | exact |
| `gatsby-config.js` | modify | config (plugin registry) | build-time | itself — plugin block structure | exact |
| `gatsby-browser.js` | modify | browser API hook | event-driven (route change) | itself (`onServiceWorkerUpdateReady`) + RESEARCH.md `_paq` example | exact |
| `static/admin/config.yml` | modify | config (CMS schema) | n/a (YAML) | itself — backend block | exact |
| `README.md` | modify | docs | n/a | itself — Italian doc style | exact |
| `scripts/clean-node-sass-vendor.js` | DELETE | utility (file-I/O guard) | n/a | itself — deletion pattern from Phase 2 | exact |
| `src/assets/scss/_theme-variables.scss` | modify | style partial | transform (SCSS compile) | itself — `:root` block | exact |
| `src/assets/scss/style.scss` | modify | style entry | transform (SCSS compile) | itself — `@import` header | exact |
| `yarn.lock` | implicit (yarn-managed) | lockfile | n/a | never hand-edited | exact |
| `scripts/check-node-version.js` | NO CHANGE | utility (guard) | n/a | itself — reads `.nvmrc` dynamically | exact |

---

## Pattern Assignments

### `package.json` (config — dependency swaps, D-01/D-04/D-05/D-08/D-12/D-14/D-07)

**Analog:** itself — current file at `/home/simos/progs/lara/package.json`

**Version-pinning style** (lines 27-58) — the repo's established convention, which the lockstep matrix must follow:
```json
"dependencies": {
  "gatsby": "5.15.0",                          // gatsby-* deps: EXACT pins, no caret
  "gatsby-plugin-manifest": "5.15.0",
  "gatsby-plugin-sass": "6.15.0",
  "node-sass": "^9.0.0",                       // third-party deps: caret ranges
  "netlify-cms-app": "^2.15.72",
  "gatsby-plugin-matomo": "^0.17.0",
  "gatsby-plugin-advanced-sitemap": "^2.1.0",
  "gatsby-plugin-netlify-cms": "6.22.0",
  "gatsby-plugin-netlify-cms-paths": "^1.3.0", // KEEP (D-09 verdict)
  "gatsby-image": "^3.11.0"                    // KEEP untouched (D-02)
}
```

**Scripts block** (lines 14-26) — the guard wiring; `postinstall` (line 18) is removed per D-05, everything else stays:
```json
"scripts": {
  "preinstall": "node scripts/check-node-version.js",
  "prebuild": "node scripts/check-node-version.js",
  "predevelop": "node scripts/check-node-version.js",
  "postinstall": "node scripts/clean-node-sass-vendor.js",  // ← DELETE this line (D-05)
  "build": "gatsby build",
  "test": "jest --watch=false"
}
```

**Engines block** (lines 71-73) — the D-07 target:
```json
"engines": {
  "node": "20.x"    // → "24.x" (D-07, LAST commit only)
}
```

**Edit pattern (per commit):**
- Commit 1 (UPGR-01): exact-pin all 13 gatsby-* entries to the registry-verified matrix — `gatsby@5.16.1` + plugins at `.16.0` (RESEARCH.md §Standard Stack; `.16.1` plugin versions DO NOT EXIST — Pitfall 1). Use `yarn add <pkg>@<exact>` so yarn.lock updates atomically.
- Commit 2 (UPGR-02): `yarn remove node-sass && yarn add sass@^1.30.0` (caret per D-04) + delete `postinstall` line.
- Commit 3 (UPGR-03/06): `yarn remove netlify-cms-app gatsby-plugin-netlify-cms gatsby-plugin-advanced-sitemap` + `yarn add decap-cms-app@3.6.4 gatsby-plugin-decap-cms@4.0.4`.
- Commit 4 (UPGR-04): `yarn remove gatsby-plugin-matomo`.
- Commit 5 (D-07): `engines.node` → `"24.x"` (hand edit, no yarn command).

**Do NOT touch:** `gatsby-image` (D-02), `gatsby-plugin-netlify-cms-paths` (D-09 KEEP), `packageManager: "yarn@1.22.22"` (line 70), all devDependencies.

---

### `.nvmrc` (config — Node 24 bump, D-07)

**Analog:** itself — current content is a single line:
```
20
```
**Edit pattern:** replace with `24` in Commit 5 ONLY (D-07b: after the full matrix is green under Node 20). No trailing newline concerns — keep the single-line format. `scripts/check-node-version.js` reads this file dynamically (lines 10-14 of that script) — **no code change needed there**.

---

### `gatsby-config.js` (config — remove 3 plugin blocks, D-12/D-14/D-08)

**Analog:** itself — current file at `/home/simos/progs/lara/gatsby-config.js`

**Plugin registry structure** — two forms coexist; removals must respect them:
```javascript
// Form A: string shorthand for option-less plugins (lines 21, 45-46, 81-84, 97)
"gatsby-plugin-sitemap",
`gatsby-plugin-netlify-cms`,        // line 83 — REMOVE (D-08)
`gatsby-plugin-advanced-sitemap`,   // line 84 — REMOVE (D-14)
"gatsby-plugin-offline",

// Form B: object with resolve/options (lines 22-30 — the matomo block)
{
  resolve: "gatsby-plugin-matomo",  // lines 22-30 — REMOVE ENTIRE BLOCK (D-12)
  options: {
    siteId: "4",
    matomoUrl: "https://matomo.duckdns.org/",
    siteUrl: "https://laryart.it",
    disableCookies: false,
  },
},
```

**KEEP untouched:**
- `netlifyCmsPaths` const (lines 6-11) — `gatsby-plugin-netlify-cms-paths` stays (D-09 verdict: CMS-agnostic, actively processes the laryart.md inline image)
- `gatsby-plugin-sitemap` (line 21) — the single surviving sitemap generator (D-14)
- `gatsby-plugin-sass` (line 81) — **no `implementation` option added** (Pitfall 2: sass-loader auto-detects dart-sass first; adding config is a maintenance trap)
- `siteMetadata` from `./src/util/site.json` (lines 13-16)

**Edit pattern:** delete the matomo object block (lines 22-30) and the two string entries (lines 83-84). No reordering of remaining plugins. The matomo `siteId: "4"` / `matomoUrl` values migrate into the `_paq` snippet in `gatsby-browser.js` (D-12).

---

### `gatsby-browser.js` (browser API hook — add vendored `_paq`, D-12/D-13)

**Analog:** itself (export convention) + RESEARCH.md §Code Examples lines 293-334 (verified snippet)

**Existing export pattern** (current file, lines 1-10) — the new hook follows the same named-export arrow-function style:
```javascript
export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
      `Reload to display the latest version?`
  )

  if (answer === true) {
    window.location.reload()
  }
}
```

**New code to add** — vendored `_paq` snippet (copy from RESEARCH.md lines 293-334; behavior parity with the removed gatsby-plugin-matomo's gatsby-ssr.js init + gatsby-browser.js onRouteUpdate):
```javascript
const MATOMO_URL = "https://matomo.duckdns.org"
const MATOMO_SITE_ID = "4"

// Module scope runs once per page load — guard for SSR/build (no window in Node)
if (typeof window !== "undefined") {
  window._paq = window._paq || []
  window._paq.push(["disableCookies"]) // cookie-less tracking (D-12)
  window._paq.push(["setTrackerUrl", `${MATOMO_URL}/matomo.php`])
  window._paq.push(["setSiteId", MATOMO_SITE_ID])
  window._paq.push(["enableHeartBeatTimer"])

  const d = document
  const g = d.createElement("script")
  const s = d.getElementsByTagName("script")[0]
  g.type = "text/javascript"
  g.async = true
  g.defer = true
  g.src = `${MATOMO_URL}/matomo.js`
  s.parentNode.insertBefore(g, s)
}

export const onRouteUpdate = ({ location, prevLocation }) => {
  if (typeof window === "undefined" || !window._paq) return
  const url = location.pathname + location.search + location.hash
  const prevUrl = prevLocation
    ? prevLocation.pathname + prevLocation.search + prevLocation.hash
    : null
  // document.title workaround (react-helmet updates title after route change)
  setTimeout(() => {
    if (prevUrl) window._paq.push(["setReferrerUrl", prevUrl])
    window._paq.push(["setCustomUrl", url])
    window._paq.push(["setDocumentTitle", document.title])
    window._paq.push(["trackPageView"])
    window._paq.push(["enableLinkTracking"])
  }, 32)
}
```

**Ordering constraint:** `disableCookies` MUST be pushed before `trackPageView` (config call). The `setTimeout(…, 32)` mirrors the old plugin's react-helmet title delay. Snippet is vendored (D-13) — only `matomo.js`/`matomo.php` requests hit the Matomo server at runtime.

**Style constraints (CONVENTIONS.md):** no semicolons, double quotes, `arrowParens: "avoid"` (single params without parens — note `({ location, prevLocation })` keeps parens because it's a destructured object param). Run `yarn format` after editing.

---

### `static/admin/config.yml` (config — branch fix, D-10)

**Analog:** itself — current file at `/home/simos/progs/lara/static/admin/config.yml`

**Backend block** (lines 1-9) — the single-line fix:
```yaml
backend:
  name: git-gateway
  branch: master   # line 3 — → main (D-10)
  commit_messages:
    create: "Create {{collection}} “{{slug}}”"
    update: "Update {{collection}} “{{slug}}”"
    delete: "Delete {{collection}} “{{slug}}”"
    uploadMedia: "[skip ci] Upload “{{path}}”"
    deleteMedia: "[skip ci] Delete “{{path}}”"
```

**Consistency touch (same commit, D-11):** line 12's comment references the old proxy command:
```yaml
local_backend: true # run npx netlify-cms-proxy-server for local testing
```
→ update comment to `# run npx decap-server for local testing` (RESEARCH.md: `npx decap-server` is the Decap equivalent).

**Do NOT touch:** collections schema, `media_folder`/`public_folder` (lines 14-15) — `gatsby-plugin-netlify-cms-paths` reads these (D-09). Everything else is Decap drop-in compatible (Pitfall 4).

---

### `README.md` (docs — decap-server + Node 24, D-11/D-07)

**Analog:** itself — current file at `/home/simos/progs/lara/README.md`; Italian prose throughout (CONVENTIONS.md: "UI copy is Italian; code identifiers are English")

**Lines to edit:**
| Line | Current | New |
|------|---------|-----|
| 16 | `- node-sass — compilazione SCSS` | `- sass (dart-sass) — compilazione SCSS` |
| 19 | `- Node.js 20 (`.nvmrc`) e yarn 1.22.22…` | `- Node.js 24 (`.nvmrc`) e yarn 1.22.22…` |
| 25 | `- Node.js 20 (con [nvm]…` | `- Node.js 24 (con [nvm]…` |
| 28 | `> Il progetto impone automaticamente Node 20: …` + `nvm alias default 20` | `Node 24` + `nvm alias default 24` |
| 48 | `npx netlify-cms-proxy-server` | `npx decap-server` |
| 58 | `- Versione Node: 20 (letta da `.nvmrc`)` | `- Versione Node: 24 (letta da `.nvmrc`)` |

**Timing:** the Node-24 README edits (lines 19, 25, 28, 58) belong to Commit 5 (D-07b — never in the dependency commits). The decap-server edit (line 48) and node-sass→sass edit (line 16) belong to their respective commits (3 and 2). Also update the "Netlify CMS" section heading/body (lines 43-50) to mention Decap CMS where natural.

---

### `scripts/clean-node-sass-vendor.js` (DELETE — D-05)

**Analog:** itself — current file at `/home/simos/progs/lara/scripts/clean-node-sass-vendor.js` (45 lines, ELF-magic vendor hygiene guard)

**Deletion pattern:** `git rm scripts/clean-node-sass-vendor.js` in Commit 2, together with the `postinstall` script entry removal in `package.json` (D-05: both are dead weight once node-sass is gone). **Do NOT delete** `scripts/check-node-version.js` — it stays (D-05: Node enforcement remains).

**Stale-message note (optional, agent's discretion):** `scripts/check-node-version.js` lines 19-24 hardcode the error text `'node-sass 9.0.0 non ha un binario precompilato per questo Node (vincolo ABI).'` — after the dart-sass swap this rationale is obsolete. The script's *logic* needs no change (reads `.nvmrc` dynamically), but the message text may be updated to a generic Node-mismatch explanation in Commit 2 or 5. Not required by any decision.

---

### `src/assets/scss/_theme-variables.scss` (style partial — remove nested @imports, D-06 MANDATORY)

**Analog:** itself — current file at `/home/simos/progs/lara/src/assets/scss/_theme-variables.scss`

**Current `:root` block** (lines 7-13) — the two `@import url(...)` lines are nested inside `:root`, which dart-sass passes through in place → invalid CSS → fonts silently stop loading (Pitfall 3, empirically verified):
```scss
:root {
  @import url("https://fonts.googleapis.com/css2?family=Parisienne&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap");
  --font-family-titles: "Parisienne", cursive;
  --font-family: "Ubuntu", sans-serif;
  --font-size-small: 12px;
  // ... rest of custom properties (lines 14-32) UNCHANGED
}
```

**Edit pattern:** delete ONLY the two `@import` lines (8-9). Everything else in the file (breakpoint vars lines 2-5, all `--*` custom properties) stays byte-identical.

---

### `src/assets/scss/style.scss` (style entry — hoist font @imports, D-06 MANDATORY)

**Analog:** itself — current file at `/home/simos/progs/lara/src/assets/scss/style.scss`

**Current import header** (lines 1-8):
```scss
@import "theme-variables";
@import "defaults";
@import "lib/css-grid-utility";

@import "utility";

// Libraries
@import "lib/prism-default";
```

**Edit pattern** — insert the two Google Fonts imports at the TOP of the file, BEFORE the local `@import`s (RESEARCH.md §Code Examples lines 337-353; this reproduces node-sass's hoisting behavior exactly):
```scss
@import url("https://fonts.googleapis.com/css2?family=Parisienne&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap");

@import "theme-variables";
@import "defaults";
@import "lib/css-grid-utility";
// ... rest of file UNCHANGED (586 lines total)
```

**Verification (Pitfall 3 warning sign):** after build, `grep -n "@import" public/*.css` must show the Google Fonts import at the top level, NOT indented inside `:root`. This hoist ships in Commit 2 (the dart-sass commit) — never separately.

---

## Shared Patterns

### Verification loop (every commit, D-03/D-07b)
**Source:** CONTEXT.md §Established Patterns + RESEARCH.md §Validation Architecture
**Apply to:** Commits 1-4 (Node 20) and Commit 5 (Node 24)
```bash
# Commits 1-4 — Node 20 gate
source ~/.nvm/nvm.sh && nvm use 20 && gatsby clean && yarn build && yarn test

# Commit 5 — Node 24 gate (after .nvmrc/engines bump)
source ~/.nvm/nvm.sh && nvm use 24 && yarn install && yarn build && yarn test
```
Node 20.20.2 and 24.18.0/24.19.0 are both available via nvm (RESEARCH.md §Environment Availability). The existing jest suite (4 suites, 8 passed / 1 skipped) is the regression net — it must stay green through every commit; none of its files are touched.

### Commit discipline
**Source:** CONTEXT.md §Established Patterns ("One logical change per commit")
**Apply to:** all 5 commits
- Exact version pins for gatsby-* (no ranges — matches existing package.json style)
- Caret for `sass` (`^1.30.0` per D-04 as written)
- Commit order is locked by D-07b: lockstep matrix → dart-sass+hoist → Decap+sitemap → Matomo → Node 24 LAST
- Never mix the Node 24 bump with dependency changes (D-07b)

### Code style (CONVENTIONS.md)
**Apply to:** `gatsby-browser.js` (the only JS edited)
- No semicolons, double quotes, `arrowParens: "avoid"` (`.prettierrc`)
- Named exports for Gatsby browser API hooks: `export const onRouteUpdate = …`
- Run `yarn format` after editing; no ESLint exists

### Node enforcement guard (unchanged)
**Source:** `scripts/check-node-version.js` + `.yarnrc` (`engine-strict true`) + `engines`
**Apply to:** nothing to change — the guard reads `.nvmrc` dynamically (script lines 10-14), so the Node 24 bump is purely `.nvmrc` + `engines.node`. `netlify.toml` needs no change (Phase 2 already set `yarn build`; `.nvmrc` resolves via nvm on Netlify).

### Yarn-only rule
**Source:** README.md line 41 ("Usa solo i comandi yarn: un altro package manager reintrodurrebbe il doppio lockfile")
**Apply to:** all dependency operations — `yarn add`/`yarn remove` only, never npm. `yarn.lock` is updated by yarn, never hand-edited.

---

## No Analog Found

None. Every file is a modification of an existing file whose current state is the authoritative pattern. The single new code block (the `_paq` snippet) has a verified analog in RESEARCH.md §Code Examples (sourced from Matomo official docs + the removed plugin's inspected source) and follows the existing `gatsby-browser.js` export convention.

## Metadata

**Analog search scope:** repo root config files (`package.json`, `gatsby-config.js`, `gatsby-browser.js`, `.nvmrc`, `netlify.toml`, `.yarnrc`, `.prettierrc`), `scripts/`, `static/admin/`, `src/assets/scss/`, `README.md`, `.planning/codebase/`, `.planning/phases/02-foundation-cleanup/`
**Files scanned:** 11 (all in-scope files read in full; no large-file targeted reads needed — largest is style.scss at 586 lines)
**Pattern extraction date:** 2026-08-19
