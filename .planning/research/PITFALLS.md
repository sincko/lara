# Pitfalls Research

**Domain:** Gatsby static-site modernization — dependency upgrades (Gatsby 5.15 → 5.16.x), MUI v4 removal, package manager consolidation, Netlify deployment reliability, performance optimization
**Researched:** 2026-08-18
**Confidence:** HIGH (npm registry + official Gatsby/Sass/Netlify docs verified directly; repo state from codebase map)

## Critical Pitfalls

### Pitfall 1: Chasing a "Gatsby 6" that doesn't exist (or installing pre-release canary tags)

**What goes wrong:**
The milestone asks to "attempt Gatsby 6." There is no Gatsby 6 — verified 2026-08-18 against the npm registry and gatsbyjs.com: latest stable is `gatsby@5.16.1`, and the release-notes index has no v6 page. The `next` dist-tag points to `5.17.0-next.1` (canary) and there is a `5.18.0-react19.1` experimental tag. A team "upgrading to Gatsby 6" either stalls waiting for it, or installs a `-next`/`-react19` tag and ships a canary build to production.

**Why it happens:**
Gatsby's own marketing direction ("Gatsby Cloud evolution", Framework direction) made "a new major is coming" feel imminent. The version-support page lists v5 as "Active Long-term support" with no v6 row — the schedule ("1 major per year") has simply not produced one.

**How to avoid:**
Reframe the requirement as "upgrade to Gatsby 5.16.x (latest stable)". Pin `gatsby` to `5.16.1` exactly (repo already pins `5.15.0` exactly). Do NOT install `5.17.0-next.1` or `5.18.0-react19.1` — they are canaries. Only use `5.18.0-react19.1` if a deliberate React 19 spike is planned (it is not recommended this milestone — see Pitfall 6).

**Warning signs:**
- `package.json` containing `gatsby@5.17.0-next` or `5.18.0-react19` versions
- Planning documents referencing "v6 migration guide" that 404s on gatsbyjs.com
- "Waiting for Gatsby 6" appearing in milestone status

**Phase to address:**
Phase 2 (Dependency upgrade). Requirement wording in PROJECT.md ("attempt Gatsby 6") must be corrected in the discuss phase.

---

### Pitfall 2: Upgrading `gatsby` core alone while `gatsby-*` plugins stay on 5.15

**What goes wrong:**
`gatsby@5.15.0` is pinned exactly while every `gatsby-*` plugin has a caret range (`gatsby-plugin-sharp: 5.15.0`, `gatsby-plugin-sass: 6.15.0`, etc.). If only `gatsby` is bumped, plugins resolve to mixed versions; the sharp pipeline (`gatsby-plugin-sharp`/`gatsby-transformer-sharp`/`gatsby-plugin-image`/`gatsby-source-filesystem` are peer-locked to each other) produces runtime errors like `gatsbyImageData` missing, image processing jobs failing, or GraphQL schema mismatches mid-build.

**Why it happens:**
The Gatsby upgrade guide says exactly this — when upgrading Gatsby you must also update all packages whose names start with `gatsby-` (for the gatsbyjs/gatsby monorepo they are released in lockstep). Version-hopping one package at a time in a monorepo-released ecosystem breaks the peer contracts.

**How to avoid:**
Upgrade **all** `gatsby-*` packages in ONE commit: `gatsby` 5.16.1, `gatsby-plugin-sharp`/`gatsby-transformer-sharp`/`gatsby-source-filesystem`/`gatsby-plugin-manifest` 5.16.0, and the 6.x-line plugins (`gatsby-plugin-sass` 6.16.0, `gatsby-plugin-offline` 6.16.0, `gatsby-plugin-sitemap` 6.16.0, `gatsby-plugin-react-helmet` 6.16.0, `gatsby-transformer-remark` 6.16.0, `gatsby-remark-images` 7.16.0, `gatsby-remark-prismjs` 7.16.0, `gatsby-remark-responsive-iframe` 6.16.0, `gatsby-plugin-image` 3.16.0 — all verified on npm). Then run `gatsby clean && gatsby build` before committing (see Pitfall 3).

**Warning signs:**
- `yarn outdated` showing only `gatsby` in the list (means other plugins were already drifted)
- `gatsby build` errors mentioning "peer dependency" or "unmet peer"
- GraphQL errors on `gatsbyImageData` or sharp query fields

**Phase to address:**
Phase 2 (Dependency upgrade). The upgrade plan should list the exact target version matrix above.

---

### Pitfall 3: "Works locally, fails on Netlify" — stale `.cache`/build cache after upgrade

**What goes wrong:**
The #1 classic: `gatsby build` passes locally after an upgrade, but the Netlify deploy fails with bizarre errors (webpack chunk errors, "Schema cannot be regenerated", sharp module not found). Root cause is almost always the cached `.cache/`/`public/` directories from the previous Gatsby version being reused.

**Why it happens:**
This repo already uses `netlify-plugin-gatsby-cache`, which persists `.cache` and `public` across deploys. Gatsby's own docs for minor upgrades say a cache reset is needed after version changes; Netlify's dependency-cache docs explicitly say "If a build fails, it's worth retrying with a cleared build cache." Local dev rarely hits it because `gatsby develop` clears/revalidates, and the cache plugin isn't active locally.

**How to avoid:**
- After ANY dependency change affecting the build, run `yarn clean` (script exists: `gatsby clean`) and a full `yarn build` locally before pushing.
- For the first Netlify deploy after the upgrade commit, trigger "Retry deploy with clear cache" in the Netlify UI (or `netlify deploy --build` after clearing via the dashboard). Do not just retry the same cache.
- Keep `netlify-plugin-gatsby-cache` — it is correct for steady-state builds; the mistake is not invalidating it at version boundaries.

**Warning signs:**
- Deploy fails with webpack/sharp errors while the same commit builds cleanly locally
- Deploy log shows `gatsby build` completing in suspiciously short time (cache reuse)
- Errors mention files inside `.cache/` or `public/`

**Phase to address:**
Phase 2 (Dependency upgrade). Include "clear Netlify cache" as an explicit step in the deploy checklist after the upgrade commit.

---

### Pitfall 4: Node-version ambiguity — `netlify.toml` NODE_VERSION=10 vs `.nvmrc` 20 vs local Node 24

**What goes wrong:**
`netlify.toml` pins `NODE_VERSION = "10"` (incompatible with Gatsby 5 — engines are `>=18 <26`), `.nvmrc` says `20`, and the local dev machine runs Node 24.18.0. Depending on which source Netlify's build image honors, builds either fail with a Node-version error or — worse — succeed locally and fail on Netlify because node-sass 9 has no prebuilt binaries for the Node version in use. Git history (`4c35cb0` "Cambiata versione di nodejs", `198d68f`, `a66d212`) shows this exact trial-and-error loop already happened repeatedly.

**Why it happens:**
Netlify resolves the Node version from a precedence chain: UI setting, then `NODE_VERSION` env var, `.node-version`, `.nvmrc` (a `NODE_VERSION` env var in `netlify.toml` counts as an env var). Having BOTH `NODE_VERSION=10` in netlify.toml and `.nvmrc`=20 makes the outcome depend on undocumented precedence, and nobody locally uses the same Node as the build.

**How to avoid:**
- Delete `NODE_VERSION = "10"` from `netlify.toml` entirely. Single source of truth: `.nvmrc` (`20`). This is deterministic regardless of precedence rules.
- Change the build command to `yarn build` (see Pitfall 7) while there.
- Locally, use `nvm use` (reads `.nvmrc`) before `yarn install`/`yarn build`. Node 24 locally + Node 20 on Netlify is a guaranteed divergence source; align them.
- Verify with the Netlify CLI: `netlify build` runs the exact dependency-install + build steps of the production image.

**Warning signs:**
- Any commit touching `netlify.toml` or Node versions (the "Fixed build" commit pattern in git log)
- Deploy log line `Using Node.js version: 10.x` or an `nvm install` line with the wrong version
- node-sass install step compiling from source (takes minutes, needs compilers) instead of downloading prebuilt binary

**Phase to address:**
Phase 1 (Cleanup/config reconciliation) or Phase 2 — do it in the FIRST deploy-touching phase, before the upgrade, so the upgrade itself isn't blamed for a config error.

---

### Pitfall 5: Keeping `node-sass` through the upgrade — the recurring Netlify build breaker

**What goes wrong:**
`node-sass` (libsass) is deprecated; v9 ships prebuilt binaries for a narrow Node range. On any Node version without a prebuilt, install falls back to compiling from source, which fails on Netlify build images (no compiler, or binding mismatch) — producing the "errore di compilazione" pattern in git history. It also drags in native binding churn every time Netlify's default Node moves.

**Why it happens:**
The repo uses `gatsby-plugin-sass` (peer: `sass ^1.30.0` — it accepts dart-sass today!) but the starter installed `node-sass`. The swap to dart-sass is a one-line dependency change, so keeping node-sass is pure inertia — until a Node bump breaks the build again.

**How to avoid:**
- `yarn remove node-sass && yarn add -D sass` (dart-sass 1.102.x, engines `node >=20.19.0` — fine on Node 20 LTS latest; note: `.nvmrc` bare `20` resolves to latest 20.x, which satisfies it).
- Do this in a SEPARATE commit before the Gatsby upgrade, and rebuild, so the two failure modes are never conflated.
- Know the dart-sass differences: `@import` is deprecated (still works with warnings in 1.102; removal deferred to 2.0 which is not yet released); mixed declarations and `/` division that libsass tolerated now error or warn. This repo's SCSS is simple local `@import`s — but the Google-Fonts `@import url(...)` nested inside `:root` in `_theme-variables.scss` is non-standard and must move to the top of `style.scss` (or be replaced with `<link>`/`@fontsource`) as part of the swap (already flagged in CONCERNS.md).

**Warning signs:**
- `yarn.lock` contains `node-sass@^9.0.0` and `gyp`/`node-gyp` errors in install logs
- Deploy log shows "node-gyp rebuild" or "gyp ERR!" during install
- `yarn add` of a new package suddenly triggers a node-sass recompile

**Phase to address:**
Phase 2 (Dependency upgrade) — first commit of that phase, before any Gatsby version bump.

---

### Pitfall 6: Bumping React to 19 and silently breaking the CMS admin (`/admin`)

**What goes wrong:**
Gatsby 5.16 supports React 19, but this repo's CMS stack is pinned to it:
- `netlify-cms-app@2.15.72` declares peer deps `react ^16.8.4 || ^17.0.0` (React 18 is NOT in range — works today only because yarn 1 ignores peer conflicts; see Pitfall 7).
- `decap-cms-app` latest (3.15.1) requires `react ^19.1.0` — so Decap migration only exists on React 19.
- `gatsby-plugin-netlify-cms@7.12.1` peers `react ^18.0.0 || ^0.0.0`.

Upgrading React to 19 while keeping `netlify-cms-app` leaves the admin UI on an unsupported React version — a broken/blank `/admin` at worst, undefined behavior at best. The v5.16 release notes explicitly warn: community plugins may not support React 19 yet.

**How to avoid:**
- Stay on React 18 (`^18.0.2`, resolved 18.3.1) for this milestone. The Gatsby upgrade to 5.16 works fine on React 18.
- Treat "React 19 + Decap CMS" as a separate future milestone with its own verification (admin login, git-gateway auth, media picker) — the two changes are coupled and must land together, never React 19 alone.
- If the CMS admin ever breaks and a Decap migration is needed, budget for the React 19 pairing.

**Warning signs:**
- Any plan item saying "upgrade react to latest" without a CMS admin test step
- `/admin` blank page or console errors after a dependency bump
- `npm install` (npm 7+) failing with ERESOLVE on `netlify-cms-app` peer deps

**Phase to address:**
Phase 2 (Dependency upgrade). Explicitly out of scope for React; add a post-upgrade checklist item "open /admin, log in via git-gateway, edit and save a post".

---

### Pitfall 7: Half-done package-manager consolidation — the double-lockfile disease

**What goes wrong:**
Repo has BOTH `yarn.lock` (617 KB) and `package-lock.json` (1 MB) committed; `netlify.toml` build command is `npm run build`; `"yarn": "^1.22.22"` and `"y18n": "^5.0.8"` sit in **dependencies** as remnants of the npm-audit/Netlify-fix hacks (git `a66d212`). Consequences:
1. **Drift**: anyone running `npm install` regenerates `package-lock.json` from a different resolver than `yarn.lock`; Netlify installs with yarn (yarn.lock present) — local/CI/prod resolve different trees.
2. **Peer-dep laxity trap**: yarn 1 does NOT enforce peer dependencies; npm 7+ DOES (hard ERESOLVE failures). This repo has a live example: `netlify-cms-app` peers React ^16/17 while React 18 is installed. Yarn 1 installs it silently; `npm install` fails. After consolidation to yarn, nobody will hit this — but if anyone reintroduces npm locally, installs hard-fail with confusing ERESOLVE errors.
3. `yarn` as a runtime dependency: the deprecated `yarn` npm package installs a second yarn into `node_modules` — it's a hack, not a mechanism. Netlify installs yarn itself when `yarn.lock` is present.

**How to avoid:**
- One commit: delete `package-lock.json`, update `.prettierignore` (remove the now-pointless ignore or keep — harmless), change `netlify.toml` build command to `yarn build`, remove `yarn` and `y18n` from `dependencies`, run `yarn install` to refresh `yarn.lock`, commit.
- Add a guard: CI or a pre-push check that `package-lock.json` does not exist (e.g., a one-line script or the existing `test` script once it becomes real — see Pitfall 11).
- Never run `npm install <anything>` in this repo again; use `yarn add`/`yarn remove`. Document it in README (which is being rewritten anyway).

**Warning signs:**
- `package-lock.json` reappears in `git status` after any install
- `yarn.lock` and `package-lock.json` both modified in the same commit
- A contributor's `npm install` fails with ERESOLVE while yarn works fine

**Phase to address:**
Phase 2 (Dependency upgrade), same first commit as Pitfall 5 — the two are one logical "build hygiene" change.

---

### Pitfall 8: Removing MUI v4 and regressing the contact form (or leaving a landmine behind)

**What goes wrong:**
MUI v4 surface is small (`@material-ui/core` TextField/Button in `formik.js`; `@material-ui/icons` Facebook/WhatsApp in `top-contacts.js`) but two failure modes are common:
1. **Visual/logic regression**: MUI `TextField` is uncontrolled-ish with built-in label, error display via `error`/`helperText` props wired to Formik's `errors`/`touched`. Replacing with plain `<input>` and forgetting the `error={touched.nome && errors.nome}` pattern loses the validation UX — the form validates but the user sees nothing.
2. **Leftover landmine**: `src/components/form-pulito.js` references `TextField`/`Button` WITHOUT imports (it is already a compile error if ever imported). If the removal commit touches it or a bundler change starts parsing it, the build breaks with "TextField is not defined". The file must be deleted in the same commit.

**Why it happens:**
MUI v4's JSS machinery (`@material-ui/styles`, injected styles at runtime) means the "plain CSS" replacement must reproduce the styling contract, not just the component API. And dead files get forgotten because they're never imported — until an upgrade changes how the bundler treats them.

**How to avoid:**
- Delete `old-form.js` AND `form-pulito.js` in the MUI-removal commit (they're dead — CONCERNS.md confirms).
- Replace `TextField` with a small styled input component in the existing SCSS system (theme variables already exist), preserving: label, `aria-invalid`, error text rendering from Formik `errors`/`touched`, and the `data-netlify` attributes (see Integration Gotchas).
- Replace MUI icons with `react-icons` (already installed, v5.7.0 — `FaFacebook`, `FaWhatsapp` equivalents).
- Add a jest test for the form's validation + failure path before/with this change (Pitfall 11).

**Warning signs:**
- `grep -rn "material-ui" src/` returning hits after the removal commit
- Form submits but error messages never appear
- `yarn build` error mentioning `form-pulito.js` or `old-form.js`

**Phase to address:**
Phase 2 (Dependency upgrade) — but ONLY after Phase 1 cleanup deleted the dead files, or in the same commit. Sequence: dead-code deletion → MUI removal → build.

---

### Pitfall 9: gatsby-image → gatsby-plugin-image migration that breaks the og:image fix and layout semantics

**What goes wrong:**
Three classic migration mistakes on this codebase:
1. **tracedSVG**: `gatsby-config.js` configures `gatsby-remark-images` with `tracedSVG`, and queries use `fluid` fragments. `gatsby-plugin-image`'s `gatsbyImageData` does not accept `tracedSVG` — schema/build errors or silently-dropped placeholders unless switched to `BLURRED`/`DOMINANT_COLOR`.
2. **`fluid` semantics change**: `fluid` maps to `fullWidth` (if no maxWidth or maxWidth ≥ 1000) or `constrained` — `fullWidth` images EXPAND beyond source width and ignore `maxWidth`; `constrained` never upscales. The repo's blog cards rely on `maxWidth: 1024` fluid behavior; wrong choice changes CLS and image sharpness.
3. **The og:image bug stays**: `blog-post.js` passes the old `Img` data object into `<Seo image={...}>`, producing `og:image = https://laryart.it[object Object]`. The migration guide explicitly says: when previously using `src` for an SEO component, use the `getSrc` helper — the internal object structure changed. If the migration mechanically replaces `<Img>` but keeps passing the query object to Seo, the bug silently persists (or the shape change makes it worse).

**Why it happens:**
The codemod (`gatsby-codemods` v4.16.0) is a good starting point but is "not a pure 1:1 mapping" per the official guide — fluid→fullWidth/constrained decisions and placeholder changes need manual review per file, and SEO data plumbing is outside the codemod's scope.

**How to avoid:**
- Run the codemod, then manually review each of the 4 affected files (`post-card.js`, `blog-list-home.js`, `blog-post.js`, `index-page.js`).
- Explicitly switch placeholders to `BLURRED` and confirm `gatsby-remark-images` config no longer passes `tracedSVG`.
- In `blog-post.js`, change the Seo call to use `getSrc(image)` and make `seo.js` ignore non-string `image` values (defense in depth — fixes the known og:image bug).
- Use `gatsby-plugin-image`'s `StaticImage` for the home/index images only where images are static-query eligible; keep `GatsbyImage` + `getImage` for GraphQL-driven ones.
- Re-run Lighthouse and eyeball the blog grid: `constrained` vs `fullWidth` changes are visible.

**Warning signs:**
- Build warnings about `tracedSVG` or placeholder options
- Blog card images blurry/oversized after migration (fullWidth applied where constrained was intended)
- `og:image` in the built HTML still showing `[object Object]`
- `gatsby-image` still present in `package.json` after the migration commit

**Phase to address:**
Phase 4 (Performance/image migration) — but it intersects the upgrade phase (sharp plugins move together, Pitfall 2). Plan it as its own commit within Phase 2 or as the first commit of Phase 4; never inside the same commit as the MUI removal.

---

### Pitfall 10: Moving the emailjs key to an env var and shipping a silently-broken form

**What goes wrong:**
`emailjs.init("user_06xz85hi92oABMZqCIUu7")` is hardcoded in `formik.js:8`. Moving it to an env var fails silently in two common ways:
1. **Wrong prefix**: Gatsby only exposes `process.env.GATSBY_*` variables to client-side code at build time. Using `EMAILJS_USER_ID` yields `undefined` in the browser bundle — the form renders, `emailjs.sendForm` fails at submit, and because the current `.catch` only `console.log`s (known bug: user gets redirected to /thanks even on failure), the site owner simply never receives messages.
2. **Netlify UI miss**: the variable must be set in Netlify's dashboard (Site settings → Environment variables) AND committed locally via `.env.example` (with a real `.env` gitignored). If only one environment gets it, "works locally, broken in prod" or vice versa.

**Why it happens:**
Gatsby's `GATSBY_` prefix rule is the single most-forgotten Gatsby convention, and the repo has no `.env` infrastructure at all today (STACK.md: "No .env files present; no process.env usage").

**How to avoid:**
- Use `process.env.GATSBY_EMAILJS_USER_ID` (and `GATSBY_EMAILJS_SERVICE_ID`/`GATSBY_EMAILJS_TEMPLATE_ID` while at it).
- Commit `.env.example` with placeholder values; add `.env` to `.gitignore` (verify it isn't already ignored).
- Set the same vars in Netlify dashboard.
- In the SAME commit, fix the failure-path bug: only redirect to `/thanks` on `.then`; on `.catch` show inline error and `setSubmitting(false)` — this is what makes the env-var failure visible instead of silent.
- Verify: `grep -rn "user_06xz85" src/` returns nothing after the commit; submit the form on a Netlify deploy preview and check the email actually arrives.

**Warning signs:**
- Any `process.env` access in `src/` without the `GATSBY_` prefix
- Built bundle containing the literal key (`grep` the `public/` JS for `user_06xz85`)
- Form "succeeds" but no email arrives (the existing bug masking it)

**Phase to address:**
Phase 3 (Secrets/env + form reliability). It must include the failure-path fix, or the env-var change is untestable end-to-end.

---

### Pitfall 11: Big-bang upgrade with zero tests and no regression net

**What goes wrong:**
This repo has NO tests (`test` script prints a stub and exits 1), no ESLint, and TypeScript installed but unused. The known bugs (form false-success, og:image, nav menu) shipped and survived for months. A milestone that simultaneously upgrades the framework, swaps the CSS compiler, deletes the UI library, rewrites the image pipeline, and changes the form delivery mechanism has a high probability of silently regressing exactly those paths — and the only gate is "does it build?"

**Why it happens:**
Small hobby sites skip tests because the app is small; but the upgrade surface here is unusually wide, and the build alone cannot catch: form validation behavior, image rendering, SEO meta output, or mobile nav behavior. `npm test` exiting 1 also means any CI wiring fails immediately.

**How to avoid:**
- Before the upgrade phase, add a minimal jest + @testing-library/react suite: formik.js (validation + submit failure path), blog pagination math, and a `gatsby-node.js` page-creation test (template whitelist). Make `test` exit 0.
- Wire `yarn test` into the Netlify build (append `&& yarn test` to the build command — if the suite is green this is cheap insurance) or at least run it as a local gate before every upgrade commit.
- Add ESLint (flat config) with `eslint-plugin-react` in the same cleanup phase so unused imports/dead files surface in CI, not in a later confusing build error.
- Keep each change (deps, sass, MUI, images, emailjs) in its own commit, per Pitfall 5/8/9, so a regression bisects to one commit.

**Warning signs:**
- Upgrade phase plan has no "test" step
- Any commit touching `formik.js` without a form test run
- `yarn test` still exits 1 at the end of the milestone

**Phase to address:**
Phase 0/prerequisite (test scaffolding) or the first phase of the milestone — before Phase 2 dependency work. This is the single highest-leverage prevention in the whole milestone.

---

### Pitfall 12: Removing "unused" dependencies and breaking the build (or the audit)

**What goes wrong:**
CONCERNS.md lists unused deps (codemirror, seamless-immutable, redux, react-refresh, typescript, gatsby-background-image, y18n, prismjs, package-doctor). Some are truly dead; others are load-bearing illusions:
- `prismjs` is a direct dep "only used transitively via gatsby-remark-prismjs" — safe to remove, but only because the plugin declares it as peer (`gatsby-remark-prismjs@7.16.0` peers `prismjs ^1.15.0`). If yarn 1 ignores the peer (it does!), the plugin silently breaks at runtime when syntax highlighting is used — build passes, blog code blocks render plain text.
- `y18n` and `yarn` were added as *fixes* for npm-audit/Netlify issues. Removing them re-exposes whatever incident prompted the hack. Verify the underlying issue is moot (y18n advisory fixed in 5.0.5; yarn package is not needed by Netlify).

**Why it happens:**
"Unused by grep" ≠ "not needed by the build". Transitive/peer needs and history-driven hacks are invisible to a naive dead-dependency sweep.

**How to avoid:**
- Remove deps one logical group per commit, `yarn build` after each, and for prismjs specifically: after removal, build a page with code blocks and inspect the output (or keep prismjs — it's small).
- Before removing `yarn`/`y18n`, confirm the Netlify build runs (it installs its own yarn; the npm `yarn` package is unnecessary).
- Use `yarn why <pkg>` to see who actually requires a package before deleting it.

**Warning signs:**
- Removal of a package followed by a build that passes but a feature that visibly degrades (code blocks unstyled)
- `yarn why` output showing a peer dependency on the package you're removing

**Phase to address:**
Phase 1 (Cleanup) — before the upgrade, so dependency churn never mixes with dep-removal risk.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Adding a package to `dependencies` to silence an npm audit finding (the `y18n` hack) | Build passes, audit is quiet | Mystery dependency nobody understands; removal risk later | Never — fix the root cause (bump the real dep) or record the accepted risk |
| Installing `yarn` as an npm dependency to force a yarn version on Netlify (`a66d212`) | Netlify uses the wanted yarn | Second yarn in node_modules; deprecation noise; confusion | Never — Netlify reads `packageManager`/`yarn.lock` natively |
| Trial-and-error Node version changes in `netlify.toml` ("Fixed build" commits) | One broken build fixed | Precedence ambiguity (`NODE_VERSION` vs `.nvmrc` vs local); next cache wipe re-breaks it | Never — pick one source of truth (`.nvmrc`) |
| Leaving dead components (`old-form.js`, `form-pulito.js`) during a refactor "to keep the diff small" | Smaller-looking diff | The file is a compile-error landmine for the next bundler/upgrade change; confuses greps | Never — delete in the same commit |
| Keeping `package-lock.json` "just in case" | Either tool works for the next person | Lockfile drift, divergent resolutions, Netlify picks yarn anyway | Never — pick yarn, delete the other, guard against reintroduction |
| Keeping MUI v4 "because it's only two components" | No migration work | EOL, no security fixes, >100 KB bundle, React 19 incompatibility | Never for this milestone — removal is already scoped |
| `npm run build` in `netlify.toml` while using yarn | It works | Implies npm is the tool; masks the lockfile story | Only until Phase 2 commit changes it to `yarn build` |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Netlify (build) | Relying on `netlify.toml` NODE_VERSION while `.nvmrc` says otherwise | Delete `NODE_VERSION`; `.nvmrc` = 20 as single source; test with `netlify build` |
| Netlify (deps) | `npm run build` + double lockfiles | `yarn build` + only `yarn.lock` committed; Netlify auto-detects yarn |
| Netlify (cache) | Retrying failed builds without clearing cache after upgrades | `yarn clean` locally before push; "clear cache" on the first post-upgrade deploy |
| Netlify (env vars) | Setting emailjs vars only in `.env` locally | Set in Netlify dashboard too; commit `.env.example`; use `GATSBY_` prefix |
| Netlify (forms) | Dual EmailJS + `data-netlify` attributes claiming the same form | Pick ONE channel (recommend: native Netlify form, drop emailjs-com) or make attributes consistent; fix the false-success redirect |
| EmailJS | Hardcoded key; non-`GATSBY_` env names | `GATSBY_EMAILJS_*` vars; verify in deploy preview; fix `.catch` to show error |
| Netlify CMS (git-gateway) | React 19 bump without testing `/admin` | Stay on React 18; if ever migrating to Decap, pair with React 19 (decap 3.x requires ^19.1.0) |
| Matomo | `disableCookies: false` with no consent banner (GDPR) | Set `disableCookies: true` or add consent banner during the perf/analytics cleanup (CONCERNS.md flags this) |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `static/assets/` duplication (9.6 MB, `.jpg`/`.jpeg` pairs, ~30 unused FB exports) | Every byte published to CDN; git history bloat | Dedup pairs, delete unreferenced, move `.xcf` out of `static/` | Already happening — 9.6 MB served on a 19-post site |
| Render-blocking Google Fonts `@import url(...)` inside `:root` | Slow FCP/LCP; third-party origin dependency | Self-host via `@fontsource` or move import to top + `preconnect` + `font-display: swap` | Already happening |
| MUI v4 in bundle | 50–100 KB+ commons chunk (Gatsby docs cite Material UI as a known offender) | Plain CSS inputs (Pitfall 8) | Already happening |
| `fluid`/legacy images without aspect-ratio reservation | CLS on every image load | `gatsby-plugin-image` with `constrained` + `BLURRED` placeholder | Already happening |
| Measuring perf only locally / on repeat visits | Optimizations that don't reflect production or first-load (service worker masks regressions) | Lighthouse on Netlify deploy preview URL, median of 3, mobile profile; test with SW disabled once | With `gatsby-plugin-offline` serving cached bundles, regressions hide for returning visitors |
| `gatsby-plugin-offline` after big upgrades | Users stuck on stale JS/CSS | Keep default SW strategy; after release, hard-refresh test and check SW scope in DevTools; clear-cache deploy if assets mismatch | After any major dependency upgrade |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| EmailJS key + service/template IDs hardcoded in `src/components/formik.js` | Anyone can spam the owner's EmailJS account (quota exhaustion, spoofed messages) | `GATSBY_*` env vars; restrict EmailJS service to laryart.it origin; honeypot/rate-limit; prefer native Netlify form |
| `dangerouslySetInnerHTML` on CMS-authored markdown with no sanitizer | Compromised CMS account or malicious commit injects scripts into built pages | `rehype-sanitize`-style filtering or restrict CMS write access (CONCERNS.md) |
| Matomo tracking cookies set without consent banner | GDPR/ePrivacy violation (privacy.md itself describes the required banner) | `disableCookies: true` or consent banner |
| `google-site-verification` token hardcoded in seo.js | Site-control token; must rotate on domain transfer | Move to `site.json` metadata (low urgency, CONCERNS.md) |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Contact form redirects to /thanks even when email delivery fails | Owner silently loses messages; visitor believes message was sent | Only redirect on success; inline error + keep form values on failure (fix in the env-var phase) |
| Mobile nav menu toggling a class only on the button, not the `<ul>` | Hamburger appears to do nothing on collapsed viewports | Apply `showMenu` class to the `<ul>` + `aria-expanded`/`aria-label` (CONCERNS.md known bug) |
| `html lang="en-US"` + duplicate hreflang on an Italian site | Wrong language declaration for SEO; pointless alternates | `lang="it"`, drop redundant hreflang, real meta description (Phase 1) |
| Malformed privacy page HTML (stray `</p>`, broken `####` heading) | Broken-looking GDPR-relevant page | Convert embedded HTML to clean markdown (Phase 1) |
| Removing MUI and not reproducing error/helperText styling | Validation errors invisible; users submit invalid forms repeatedly | Preserve Formik error rendering in the plain-CSS replacement (Pitfall 8) |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Gatsby upgrade:** `gatsby` bumped but some `gatsby-*` plugin left at 5.15 — run `yarn outdated` and diff the full plugin list (Pitfall 2).
- [ ] **Dependency upgrade:** local build green, Netlify deploy NOT re-run with cleared cache — the first post-upgrade deploy must be clear-cache (Pitfall 3).
- [ ] **node-sass removal:** `node-sass` gone from `yarn.lock` AND `gatsby-plugin-sass` still working — check `yarn.lock` directly, not just package.json (Pitfall 5).
- [ ] **MUI removal:** `grep -rn "material-ui" src/` clean AND form error display visually verified on mobile AND `/admin` still loads (Pitfalls 6, 8).
- [ ] **Image migration:** code uses `GatsbyImage`/`getImage` AND built HTML has no `[object Object]` og:image AND blog grid aspect ratios look right (Pitfall 9).
- [ ] **emailjs env var:** no key literal in `public/` JS, `.env.example` committed, Netlify dashboard vars set, and a real test submission delivered (Pitfall 10).
- [ ] **Package manager consolidation:** `package-lock.json` deleted, `netlify.toml` says `yarn build`, and a fresh `yarn install` from scratch passes (Pitfall 7).
- [ ] **Testing:** `yarn test` exits 0 and covers the form failure path — the existing stub exits 1 by design (Pitfall 11).

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Netlify build fails after upgrade while local passes | LOW | Retry deploy with "clear cache"; if still failing, run `gatsby clean && yarn build` locally and diff the error |
| Build broken by node-sass binding mismatch | MEDIUM | Remove node-sass → dart-sass in one commit (Pitfall 5); do NOT add a different Node version to netlify.toml as a workaround |
| `/admin` blank after React/CMS change | HIGH | Revert the React bump commit (CMS + React 19 are coupled); verify git-gateway auth flow before re-attempting |
| Contact form silently failing after env change | MEDIUM | Check `GATSBY_` prefix and Netlify dashboard vars; the failure-path fix (Pitfall 10) makes this visible in-app instead of silent |
| Dependency removal broke code highlighting / build | LOW | `git revert` the single removal commit (each dep group is one commit) — re-add with `yarn why` verification |
| Double lockfile reintroduced mid-milestone | LOW | Delete `package-lock.json` again; add the CI guard; enforce `yarn add` discipline |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Chasing non-existent Gatsby 6 (P1) | Phase 2 (Dependency upgrade) — scope rewritten to 5.16.x | `yarn list gatsby` shows 5.16.x; no `-next`/`-react19` tags in package.json |
| Gatsby core without plugins in lockstep (P2) | Phase 2 | `yarn outdated` shows zero gatsby-* entries after upgrade; clean build passes |
| Stale cache on Netlify (P3) | Phase 2 — first deploy step | First post-upgrade deploy is "clear cache" and passes |
| Node version ambiguity (P4) | Phase 1 (config reconciliation) | Deploy log shows Node 20.x; `netlify.toml` has no NODE_VERSION; local `nvm use` matches |
| node-sass kept through upgrade (P5) | Phase 2 — first commit | `node-sass` absent from yarn.lock; dart-sass warnings reviewed; build green |
| React 19 + CMS breakage (P6) | Phase 2 — explicit non-goal | `/admin` login + save-post smoke test after upgrade |
| Double lockfile / npm drift (P7) | Phase 2 — first commit | Only yarn.lock tracked; `netlify.toml` runs `yarn build`; CI guard exists |
| MUI removal regressions (P8) | Phase 2 (after Phase 1 dead-code deletion) | Form error display verified; `grep material-ui` empty; build green |
| Image migration semantics + og:image (P9) | Phase 4 (Performance/images) | Built HTML og:image is a URL; blog grid renders correctly; no tracedSVG warnings |
| EmailJS env var silent breakage (P10) | Phase 3 (Secrets/form) | Key literal absent from bundle; deploy-preview submission delivers |
| Big-bang upgrade with no tests (P11) | Phase 0/prerequisite (test scaffolding, before Phase 2) | `yarn test` exits 0 and covers form + pagination + page-creation |
| Naive dead-dependency sweep (P12) | Phase 1 (Cleanup) | `yarn why` reviewed per removal; code-highlighting page visually checked |

## Sources

- **npm registry (direct, 2026-08-18):** `gatsby` dist-tags (`latest: 5.16.1`, `next: 5.17.0-next.1`, `react19: 5.18.0-react19.1`), engines `>=18 <26`; all `gatsby-*` plugin latest versions and peerDependencies (`gatsby-plugin-sass` 6.16.0 peers `sass ^1.30.0`; `gatsby-plugin-image` 3.16.0; `gatsby-plugin-netlify-cms` 7.12.1; `netlify-cms-app` 2.15.72 peers react ^16/17; `decap-cms-app` 3.15.1 peers react ^19.1.0; `sass` 1.102.0 engines node >=20.19.0; `gatsby-codemods` 4.16.0). Confidence: HIGH
- **Gatsby official docs (fetched):** release-notes index (no v6 page), v5.16 release notes (React 19 support, Node 24, community-plugin warning), version-support page (v5 = Active LTS), upgrade-for-minor/patch guide (upgrade all `gatsby-*` together), gatsby-image migration guide (fluid→fullWidth/constrained rules, tracedSVG removal, `getSrc` for SEO, codemod caveats). Confidence: HIGH
- **Netlify official docs (fetched):** Manage build dependencies (Node resolution via NODE_VERSION/.nvmrc; yarn auto-detection via yarn.lock/packageManager; `NETLIFY_USE_YARN`; dependency cache behavior and clear-cache advice). Confidence: HIGH
- **Sass official docs (fetched):** breaking-changes index (`@import` deprecation since 1.80.0; JS API deprecation; adjacent-compound-selectors 1.100.0; 2.0 not yet released). Confidence: HIGH
- **Repo evidence (codebase map + git log):** `netlify.toml` NODE_VERSION=10 + `.nvmrc` 20 + local Node 24; `yarn`/`y18n` in dependencies; double lockfiles; repeated "Fixed build"/"Cambiata versione di nodejs"/"Aggiornate le dipendenze" commits; `form-pulito.js`/`old-form.js` dead files; `emailjs.init("user_06xz85…")` at formik.js:8; `data-netlify` + EmailJS dual path. Confidence: HIGH
- **Training knowledge (flagged):** node-sass 9 prebuilt-binary Node range and gyp fallback behavior; yarn 1 peer-dependency laxity vs npm 7+ ERESOLVE; Gatsby `GATSBY_` env-var prefix rule; gatsby-plugin-offline stale-SW behavior; MUI v4 bundle weight. Confidence: MEDIUM (consistent with official docs and repo history, but not re-verified against live sources today)

---
*Pitfalls research for: LaryArt Gatsby modernization milestone (Gatsby 5.16 upgrade, MUI v4 removal, yarn consolidation, Netlify reliability)*
*Researched: 2026-08-18*
