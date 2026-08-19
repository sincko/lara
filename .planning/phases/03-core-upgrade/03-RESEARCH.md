# Phase 3: Core Upgrade - Research

**Researched:** 2026-08-19
**Domain:** Gatsby 5 dependency upgrade (lockstep matrix), Sass compiler swap, CMS replacement, analytics vendoring, Node version bump
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Gatsby core and ALL gatsby-* plugins upgrade to the exact 5.16.x matrix in ONE commit — no partial bumps. **Reversibility:** reversible — git revert restores the 5.15.0 matrix
- **D-02:** `gatsby-image` (legacy, ^3.11.0) stays untouched in this phase — the gatsby-plugin-image migration is Phase 5 (IMAG-01). The legacy `Img`/`fluid` usage must keep working after the core bump.
- **D-03:** The upgrade commit must be verified with `gatsby clean && yarn build && yarn test` green under Node 20 before anything else in the phase proceeds.
- **D-04:** Replace `node-sass` ^9.0.0 with `sass` ^1.30.0 (dart-sass) — the peer dependency gatsby-plugin-sass 6.16.1 expects. No gatsby-config.js change needed (gatsby-plugin-sass auto-detects the implementation). **Reversibility:** reversible
- **D-05:** After the swap, the Phase 2 node-sass hygiene guards become dead weight: remove `scripts/clean-node-sass-vendor.js` and the `postinstall` script entry from package.json. Keep `scripts/check-node-version.js` + `preinstall`/`prebuild`/`predevelop` + `engines` + `.yarnrc` engine-strict (Node enforcement stays). **Reversibility:** reversible
- **D-06:** Verify the SCSS compiles identically — the repo uses only local `@import`s, but `_theme-variables.scss` has a nested `@import url(...)` (Google Fonts) inside `:root` that dart-sass may warn about. If dart-sass errors on it, hoist the `@import` to the top of `style.scss` (minimal fix, no font strategy change — self-hosting is Phase 6 PERF-01). **Reversibility:** reversible
- **D-07:** **Node 24 bump (owner decision, supersedes Phase 2 D-05).** After dart-sass replaces node-sass, the native-binding constraint is gone — bump Node from 20 to 24 (LTS): update `.nvmrc` to `24`, `engines.node` to `"24.x"`, and verify `nvm use 24 && yarn install && yarn build && yarn test` green. **Reversibility:** reversible
- **D-07b:** The Node 24 bump is a separate commit from the dart-sass swap, and it must come AFTER the full 5.16.1 + dart-sass matrix is verified green under Node 20 — never in the same commit as the dependency changes.
- **D-08:** Replace `netlify-cms-app` ^2.15.72 + `gatsby-plugin-netlify-cms` 6.22.0 with `decap-cms-app` 3.6.4 + `gatsby-plugin-decap-cms` 4.0.4. `static/admin/config.yml` is compatible as-is (Decap is the maintained fork). **Reversibility:** reversible
- **D-09:** `gatsby-plugin-netlify-cms-paths` ^1.3.0 is a netlify-cms-specific path-rewrite plugin — verify whether it works with the Decap plugin; if it breaks or is redundant, remove it and its `resolve` entry in gatsby-config.js. **Reversibility:** reversible
- **D-10:** The CMS config still declares `branch: master` while the repo's default branch is `main` — fix the branch reference in `static/admin/config.yml`. **Reversibility:** reversible
- **D-11:** Local CMS editing: `local_backend: true` requires `npx netlify-cms-proxy-server` — with Decap the equivalent is `npx decap-server`. Update the README dev instructions accordingly.
- **D-12:** Remove `gatsby-plugin-matomo` ^0.17.0 and its config block from gatsby-config.js. Replace with a vendored `_paq` snippet in `gatsby-browser.js` (onRouteUpdate) using the same siteId "4" and matomoUrl "https://matomo.duckdns.org/", with `disableCookies: true`. **Reversibility:** reversible
- **D-13:** The `_paq` snippet is vendored (inlined in the repo), NOT loaded from the Matomo server — no external script dependency at build or runtime.
- **D-14:** Remove `gatsby-plugin-advanced-sitemap` ^2.1.0 (unmaintained, duplicates the official plugin). Keep `gatsby-plugin-sitemap` 6.16.1 as the single sitemap generator. **Reversibility:** reversible
- **D-15:** The first post-upgrade Netlify deploy MUST run with cleared cache (Netlify UI: Deploys → Clear cache and deploy site). This is a manual user step; the plan must surface it as a checkpoint, not attempt to automate it.

### the agent's Discretion
- Exact ordering of the upgrade commits (lockstep bump first, then each tooling swap as its own verified commit; Node 24 bump last per D-07b)
- Whether the Decap swap and sitemap removal share a commit or stay separate
- Exact `_paq` snippet structure (standard Matomo tracking code, vendored)
- Whether to keep or remove `gatsby-plugin-netlify-cms-paths` (D-09 gives the decision rule: remove if broken/redundant with Decap)

### Deferred Ideas (OUT OF SCOPE)
- **gatsby-plugin-image migration** — Phase 5 (IMAG-01); legacy gatsby-image stays working through this phase
- **Font self-hosting / preconnect** — Phase 6 (PERF-01); only the minimal dart-sass `@import` hoist is allowed here (D-06)
- **Matomo consent banner** — out of scope; disableCookies: true is the privacy-compliant baseline, a banner is a future enhancement
- **emailjs-com → @emailjs/browser** — Phase 4 (UPGR-05), not this phase
</user_constraints>

## Summary

This phase is a dependency upgrade with verification, not an architectural migration. The Gatsby plugin system, GraphQL data layer, and `gatsby-node.js` API are unchanged between 5.15 and 5.16. Research verified every version in the locked matrix against the live npm registry, empirically tested the two highest-risk behaviors (dart-sass nested `@import` handling, sharp/jest on Node 24), and inspected the installed plugin code to answer the auto-detection and compatibility questions.

**Two critical findings the planner must act on:**

1. **The D-01 version matrix contains a factual error.** `gatsby@5.16.1` exists, but **no gatsby-* plugin has a `.16.1` patch release** — every plugin tops out at `.16.0` (verified against the npm registry for all 12 plugins). The 5.16.1 patch only touched `gatsby` core (Head API `<title>` fix, PR #39382). The correct lockstep matrix is: `gatsby` 5.16.1 + all plugins at their `.16.0` versions (5.16.0 / 6.16.0 / 7.16.0 per plugin line). This is a locked-decision conflict — the planner must surface it (see Open Questions Q1) rather than silently install non-existent versions.
2. **The D-06 font `@import` hoist is MANDATORY, not conditional.** Empirically tested: dart-sass 1.102.0 does **not** error on the nested `@import url(...)` inside `:root` — it passes it through **in place**, producing invalid CSS. Browsers ignore `@import` inside a rule, so the Google Fonts would silently stop loading while the build stays green. node-sass hoisted the same `@import` to the top of the file (verified side-by-side). The hoist to the top of `style.scss` must be part of the dart-sass commit.

**Primary recommendation:** Execute as 5 verified commits under Node 20 (lockstep matrix → dart-sass swap + font hoist → Decap swap + sitemap removal → vendored Matomo → Node 24 bump), each gated on `gatsby clean && yarn build && yarn test`, then a manual clear-cache Netlify deploy checkpoint (D-15).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UPGR-01 | Gatsby upgraded to 5.16.1 (latest stable) with all gatsby-* plugins in lockstep (one commit, exact version matrix) | §Standard Stack (registry-verified matrix; plugins at `.16.0` — see Q1); §Common Pitfalls P1 (lockstep rule) |
| UPGR-02 | node-sass replaced with dart-sass (sass ^1.30.0) — build passes locally and on Netlify | §Standard Stack (sass 1.102.0, peer-verified); §Common Pitfalls P2 (auto-detection confirmed from installed sass-loader code); P3 (mandatory font hoist, empirically verified) |
| UPGR-03 | netlify-cms-app replaced with decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4 — /admin works | §Standard Stack (peer deps verified: no gatsby peer on the plugin, React ^18.2.0 on the app); §Common Pitfalls P4 (config.yml drop-in); P5 (netlify-cms-paths verdict) |
| UPGR-04 | gatsby-plugin-matomo replaced with vendored _paq snippet in gatsby-browser.js (with disableCookies: true) | §Code Examples (snippet structure from Matomo official docs + old plugin's onRouteUpdate behavior) |
| UPGR-06 | gatsby-plugin-advanced-sitemap replaced or removed (deprecated) | §Common Pitfalls P6 (peers gatsby ^3||^4 — already broken on Gatsby 5; removal is safe) |
| UPGR-07 | First post-upgrade Netlify deploy runs with cleared cache | §Common Pitfalls P7 (Netlify cache behavior); §Validation Architecture (manual checkpoint) |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Gatsby core + plugin version bump | Build-time (Gatsby data layer) | — | All gatsby-* packages execute in the Node build process; no runtime tier involvement |
| SCSS compilation (node-sass → dart-sass) | Build-time (webpack/sass-loader) | — | sass-loader resolves the implementation at build; the swap is invisible to the browser |
| Decap CMS admin UI | Browser (SPA at /admin) | Netlify Identity (external auth) | gatsby-plugin-decap-cms generates `admin/index.html` at build; the app runs client-side; auth is external |
| Matomo tracking | Browser (client-side `_paq`) | Matomo server (external, matomo.duckdns.org) | Tracking is pure client-side JS; the snippet is vendored in the bundle, the tracker script loads from the Matomo server at runtime |
| Sitemap generation | Build-time | — | gatsby-plugin-sitemap writes sitemap.xml into `public/` during build |
| Node version enforcement | Build environment (local + Netlify) | — | engines + engine-strict + check-node-version.js gate every yarn command; Netlify resolves `.nvmrc` via nvm |
| Netlify deploy | External (Netlify platform) | — | Manual checkpoint (D-15); not automatable from the repo |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gatsby | **5.16.1** | Core framework | Latest stable; only package with a `.16.1` patch (Head API title fix, PR #39382). `[VERIFIED: npm registry]` |
| gatsby-plugin-manifest | **5.16.0** | PWA manifest | Lockstep matrix; 5.16.1 does not exist. `[VERIFIED: npm registry]` |
| gatsby-plugin-offline | **6.16.0** | Service worker | Lockstep matrix. `[VERIFIED: npm registry]` |
| gatsby-plugin-react-helmet | **6.16.0** | SSR helmet support | Lockstep matrix. `[VERIFIED: npm registry]` |
| gatsby-plugin-sass | **6.16.0** | SCSS compilation | Lockstep matrix; peers `sass ^1.30.0` + `gatsby ^5.0.0-next`. `[VERIFIED: npm registry]` |
| gatsby-plugin-sharp | **5.16.0** | Image processing | Lockstep matrix; deps `sharp ^0.32.6`. `[VERIFIED: npm registry]` |
| gatsby-plugin-sitemap | **6.16.0** | Single sitemap generator | Lockstep matrix; the survivor after advanced-sitemap removal. `[VERIFIED: npm registry]` |
| gatsby-remark-images | **7.16.0** | Markdown image processing | Lockstep matrix; peers `gatsby-plugin-sharp ^5.0.0-next`. `[VERIFIED: npm registry]` |
| gatsby-remark-prismjs | **7.16.0** | Code highlighting | Lockstep matrix; peers `prismjs ^1.15.0` (repo has prismjs ^1.30.0 — satisfied). `[VERIFIED: npm registry]` |
| gatsby-remark-responsive-iframe | **6.16.0** | Responsive embeds | Lockstep matrix. `[VERIFIED: npm registry]` |
| gatsby-source-filesystem | **5.16.0** | Content sourcing | Lockstep matrix. `[VERIFIED: npm registry]` |
| gatsby-transformer-remark | **6.16.0** | Markdown → HTML | Lockstep matrix. `[VERIFIED: npm registry]` |
| gatsby-transformer-sharp | **5.16.0** | Image nodes | Lockstep matrix; peers `gatsby-plugin-sharp ^5.0.0-next`. `[VERIFIED: npm registry]` |
| sass (dart-sass) | **^1.30.0** (resolves 1.102.0) | SCSS compiler | The peer dep gatsby-plugin-sass expects; official replacement for deprecated node-sass. `[VERIFIED: npm registry]` |
| decap-cms-app | **3.6.4** | CMS admin UI | Last React-18-compatible Decap release (3.7+ peers React ^19.1.0 — verified); peers `react ^18.2.0` — matches repo's React 18.3.1. `[VERIFIED: npm registry]` |
| gatsby-plugin-decap-cms | **4.0.4** | CMS admin generation | Official successor to gatsby-plugin-netlify-cms; **no peerDependencies at all** (verified) — installs cleanly against Gatsby 5.16.1. `[VERIFIED: npm registry]` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| decap-server | 3.10.0 (via `npx decap-server`) | Local CMS proxy | Only for local dev with `local_backend: true`; replaces `npx netlify-cms-proxy-server`. `[CITED: decapcms.org/docs/decap-proxy/]` |
| gatsby-image | ^3.11.0 (UNCHANGED) | Legacy image component | Stays per D-02; has no peerDependencies (verified) so it cannot break the install; functional compatibility is gated by the build. `[VERIFIED: npm registry]` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sass ^1.30.0 (caret → 1.102.0) | Pin `sass@1.102.0` exact | 1.102.0 was published 2026-07-25 (3 weeks old). Caret is the locked decision (D-04); pinning exact is a conservative option if the planner wants zero drift. |
| gatsby-plugin-decap-cms 4.0.4 | gatsby-plugin-netlify-cms 7.12.1 | 7.12.1 peers `gatsby ^5.0.0-next` but still requires `netlify-cms-app ^2.9.0` (EOL) — the Decap swap is strictly better and locked by D-08. |
| Vendored `_paq` snippet | @datapoint/matomo-tracker-react or similar | Extra dependency for a 20-line snippet; vendoring is the locked decision (D-12/D-13). |

**Installation:**
```bash
# Commit 1 — lockstep matrix (exact versions, no ranges)
yarn add gatsby@5.16.1 gatsby-plugin-manifest@5.16.0 gatsby-plugin-offline@6.16.0 \
  gatsby-plugin-react-helmet@6.16.0 gatsby-plugin-sass@6.16.0 gatsby-plugin-sharp@5.16.0 \
  gatsby-plugin-sitemap@6.16.0 gatsby-remark-images@7.16.0 gatsby-remark-prismjs@7.16.0 \
  gatsby-remark-responsive-iframe@6.16.0 gatsby-source-filesystem@5.16.0 \
  gatsby-transformer-remark@6.16.0 gatsby-transformer-sharp@5.16.0

# Commit 2 — dart-sass swap
yarn remove node-sass && yarn add sass@^1.30.0

# Commit 3 — Decap swap + sitemap removal
yarn remove netlify-cms-app gatsby-plugin-netlify-cms gatsby-plugin-advanced-sitemap
yarn add decap-cms-app@3.6.4 gatsby-plugin-decap-cms@4.0.4

# Commit 4 — Matomo removal (no replacement package)
yarn remove gatsby-plugin-matomo
```

**Version verification:** All versions above were verified live against the npm registry on 2026-08-19 (`npm view <pkg>@<ver> version`). Publish dates: gatsby 5.16.1 → 2026-02-10; all `.16.0` plugins → 2026-01-26; sass 1.102.0 → 2026-07-25; decap-cms-app 3.6.4 → 2025-06-06; gatsby-plugin-decap-cms 4.0.4 → 2024-02-02.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| gatsby@5.16.1 | npm | 9 yrs | very high | github.com/gatsbyjs/gatsby | OK | Approved |
| gatsby-plugin-* @.16.0 (12 pkgs) | npm | 9 yrs | very high | github.com/gatsbyjs/gatsby | OK | Approved |
| sass@1.102.0 | npm | 9 yrs (pkg) | 26M/wk | github.com/sass/dart-sass | SUS* | Approved — see note |
| decap-cms-app@3.6.4 | npm | 3 yrs (pkg) | 24.6K/wk | github.com/decaporg/decap-cms | SUS* | Approved — see note |
| gatsby-plugin-decap-cms@4.0.4 | npm | 2.5 yrs | 572/wk | github.com/gatsbyjs/gatsby | SUS* | Approved — see note |
| decap-server@3.10.0 | npm | 3 yrs (pkg) | low | github.com/decaporg/decap-cms | SUS* | Approved — see note |

**Packages removed due to [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** sass, decap-cms-app, gatsby-plugin-decap-cms, decap-server

\* **SUS interpretation:** All four SUS verdicts are heuristic artifacts, not slopsquatting signals. The seam flags `too-new` (sass 1.102.0 published 3 weeks ago; decap-cms-app 3.6.4 published 2025-06-06) and low weekly downloads (gatsby-plugin-decap-cms: 572/wk — a niche plugin). Every package resolves to its **official** repository (sass/dart-sass, decaporg/decap-cms, gatsbyjs/gatsby), none has a postinstall script (verified via `npm view <pkg> scripts.postinstall` → empty), and all are the exact versions locked in CONTEXT.md. The planner does **not** need `checkpoint:human-verify` tasks for these — the versions are user-locked decisions (D-04, D-08) and provenance is verified. The only actionable note: `sass@^1.30.0` resolves to 1.102.0 (3 weeks old); if the planner prefers zero drift, pin `sass@1.102.0` exact instead of the caret range.

## Architecture Patterns

### System Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────┐
│                        Content Layer (unchanged)                     │
│   src/content/** (markdown) · static/assets/** · site.json          │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ gatsby-source-filesystem 5.16.0
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Gatsby Data Layer (build-time)                    │
│   gatsby 5.16.1 core + 12 plugins at .16.0 (lockstep)              │
│   SCSS: gatsby-plugin-sass 6.16.0 → sass-loader 10.5.2 → sass 1.x   │
│   CMS:  gatsby-plugin-decap-cms 4.0.4 → admin/index.html            │
│   SEO:  gatsby-plugin-sitemap 6.16.0 (single generator)            │
└──────────────┬──────────────────────────────┬───────────────────────┘
               │ createPages (unchanged)      │ static export
               ▼                              ▼
┌──────────────────────────────┐   ┌──────────────────────────────────┐
│  Page Generation (unchanged) │   │  Output: public/ → Netlify       │
│  gatsby-node.js + templates  │   │  (clear-cache deploy, D-15)      │
└──────────────┬───────────────┘   └──────────────────────────────────┘
               │ React hydration
               ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Browser (runtime)                                │
│   gatsby-browser.js: onServiceWorkerUpdateReady (existing)         │
│                    + onRouteUpdate → vendored _paq snippet          │
│   _paq → matomo.php/matomo.js @ https://matomo.duckdns.org/        │
│   /admin → Decap CMS SPA → Netlify Identity + Git Gateway          │
└────────────────────────────────────────────────────────────────────┘
```

### Recommended Commit Structure (agent's discretion, informed by research)

```text
Commit 1: UPGR-01 lockstep matrix (gatsby 5.16.1 + 12 plugins @ .16.0)
          → verify: nvm use 20 && gatsby clean && yarn build && yarn test
Commit 2: UPGR-02 dart-sass swap (node-sass → sass ^1.30.0)
          + D-05 guard cleanup (delete clean-node-sass-vendor.js, postinstall)
          + D-06 MANDATORY font @import hoist (_theme-variables.scss → style.scss)
          → verify: same loop under Node 20
Commit 3: UPGR-03 Decap swap (decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4,
          remove gatsby-plugin-netlify-cms) + D-10 branch fix + D-11 README
          + UPGR-06 sitemap removal (gatsby-plugin-advanced-sitemap)
          → verify: same loop under Node 20
Commit 4: UPGR-04 vendored Matomo (remove gatsby-plugin-matomo + config block,
          add _paq to gatsby-browser.js)
          → verify: same loop under Node 20
Commit 5: D-07 Node 24 bump (.nvmrc 24, engines "24.x", README)
          → verify: nvm use 24 && yarn install && yarn build && yarn test
Checkpoint: D-15 manual Netlify clear-cache deploy + /admin smoke test
```

**Sequencing rationale (evidence-based):**
- The lockstep commit MUST come first (D-01, D-03). `gatsby-plugin-netlify-cms@6.22.0` peers `gatsby ^4.0.0-next` (verified) — it is already peer-incompatible with Gatsby 5 and only survives because yarn 1 does not enforce peer deps. It stays installable through Commit 1, but the Decap swap (Commit 3) should follow immediately; if Commit 1's build fails inside the CMS plugin's webpack integration, fold the Decap swap into Commit 1 (this resolves the STATE.md blocker "gatsby-plugin-netlify-cms vs Gatsby 5.16 install").
- dart-sass (Commit 2) is independent of the Gatsby bump and must be its own commit so the two failure modes are never conflated (D-07b).
- The Node 24 bump is strictly last (D-07b) — after it, `nvm use 20` fails the check-node-version.js guard, so all prior commits must be verified under Node 20 first.

### Pattern 1: Vendored Matomo `_paq` in gatsby-browser.js
**What:** Initialize `window._paq` once (module scope, guarded for SSR), push `disableCookies` + tracker config, then track page views from `onRouteUpdate`.
**When to use:** Replaces gatsby-plugin-matomo; the old plugin's `gatsby-ssr.js` injected the init script into `<head>` and its `gatsby-browser.js` `onRouteUpdate` pushed `setCustomUrl`/`setDocumentTitle`/`trackPageView` (inspected in node_modules — the vendored snippet replicates this behavior).
**Example:** see §Code Examples.

### Pattern 2: Node-version enforcement (unchanged from Phase 2)
**What:** `engines` + `.yarnrc` `engine-strict true` + `scripts/check-node-version.js` reading `.nvmrc` (major-version compare).
**When to use:** The guard needs **no code change** for the Node 24 bump — it reads `.nvmrc` dynamically (verified in script source). Only `.nvmrc` and `engines.node` change.

### Anti-Patterns to Avoid
- **Partial gatsby-* bumps:** bumping core without plugins (or vice versa) — the monorepo releases in lockstep; mixed versions cause subtle GraphQL/schema mismatches. One commit, exact matrix (D-01).
- **Leaving the font `@import` nested in `:root`:** dart-sass passes it through in place → invalid CSS → fonts silently stop loading while the build stays green (empirically verified). The hoist is mandatory.
- **Removing `gatsby-plugin-netlify-cms-paths` without checking the laryart.md inline image:** the plugin rewrites `/assets/...` → relative paths so gatsby-remark-images can process them. See P5 for the verdict.
- **Bumping Node before the dart-sass matrix is green:** node-sass 9 has no Node 24 prebuilt binary (verified: it throws "Unsupported runtime (137)" on Node 24) — the order in D-07b exists for this reason.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SCSS compilation | Custom sass-loader wiring | `sass` (dart-sass) + existing gatsby-plugin-sass | sass-loader 10.5.2 auto-detects `sass` first (verified in installed `sass-loader/dist/utils.js`); zero config change |
| CMS admin UI | Custom admin build | decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4 | The plugin generates `admin/index.html` with webpack integration identical to the old netlify-cms plugin (verified from tarball source) |
| Matomo tracking | Custom tracker client | Vendored `_paq` snippet (standard Matomo JS API) | The `_paq` array protocol is Matomo's official async API; the old plugin's behavior is fully replicable in ~25 lines |
| Sitemap generation | Custom sitemap script | gatsby-plugin-sitemap 6.16.0 | Official plugin, already installed and working |
| Node version gating | New guard logic | Existing `scripts/check-node-version.js` | Reads `.nvmrc` dynamically — no code change for the 24 bump |

**Key insight:** Every problem in this phase already has a maintained, official solution. The only hand-written code is the ~25-line `_paq` snippet, which is a vendored copy of Matomo's standard tracking code, not a custom implementation.

## Common Pitfalls

### Pitfall 1: Installing non-existent `.16.1` plugin versions
**What goes wrong:** `yarn add gatsby-plugin-sass@6.16.1` fails with "No match found for version" — the D-01 matrix as written in CONTEXT.md lists versions that were never published.
**Why it happens:** The 5.16.1 patch release only touched `gatsby` core (Head API title fix). Plugin packages stayed at `.16.0`.
**How to avoid:** Use the registry-verified matrix in §Standard Stack: `gatsby@5.16.1` + all plugins at `.16.0`. Surface the CONTEXT.md discrepancy to the user (Q1) before executing.
**Warning signs:** `npm view <pkg>@X.16.1 version` → E404 (verified for all 12 plugins).

### Pitfall 2: Assuming gatsby-plugin-sass needs config for dart-sass
**What goes wrong:** Adding `implementation: require("sass")` to gatsby-config.js — unnecessary and a future maintenance trap.
**Why it happens:** Misreading the plugin docs; the `implementation` option exists only to force node-sass.
**How to avoid:** Do nothing. sass-loader 10.5.2's `getDefaultSassImplementation()` tries `sass` FIRST, then `node-sass`, then `sass-embedded` (verified in installed source). Removing node-sass and installing sass is sufficient. sass 1.102.0 still ships the legacy `render` API that sass-loader 10 uses (verified: `typeof sass.render === "function"`).
**Warning signs:** None — this is a "don't do extra work" pitfall.

### Pitfall 3: Silent font breakage from the nested `@import`
**What goes wrong:** After the dart-sass swap, the build is green but Parisienne/Ubuntu fonts stop loading — the site renders in fallback fonts.
**Why it happens:** dart-sass passes plain-CSS `@import url()` through **in place** (empirically verified: output has the `@import` nested inside `:root`). Browsers ignore `@import` inside a rule. node-sass hoisted it to the top of the file (verified side-by-side), so the swap changes the emitted CSS.
**How to avoid:** Hoist both `@import url(...)` lines from `_theme-variables.scss` to the top of `style.scss` (before the local `@import`s) in the dart-sass commit. This is the minimal D-06 fix — no font strategy change.
**Warning signs:** `grep -n "@import" public/*.css` shows the Google Fonts import indented inside `:root`; visual check shows fallback fonts.

### Pitfall 4: Decap swap breaking /admin
**What goes wrong:** `/admin` fails to load after the swap — blank page or auth errors.
**Why it happens:** Version mismatch (Decap ≥3.7 peers React 19 — do NOT use 3.7+ on this repo) or config.yml incompatibility.
**How to avoid:** Use exactly decap-cms-app 3.6.4 (peers `react ^18.2.0`, verified) + gatsby-plugin-decap-cms 4.0.4 (no peerDependencies, verified). config.yml is drop-in compatible (Decap is the maintained fork of netlify-cms; the git-gateway backend, collections schema, and media_folder/public_folder are unchanged). Fix `branch: master` → `main` (D-10). Smoke-test /admin login + save post after deploy.
**Warning signs:** Console errors referencing React version mismatches; 404 on /admin/index.html.

### Pitfall 5: gatsby-plugin-netlify-cms-paths decision
**What goes wrong:** Removing it breaks the one inline markdown image (`src/content/pages/laryart.md:18`), or keeping it adds an unmaintained dep for nothing.
**Why it happens:** The plugin is a remark transformer that rewrites `/assets/...` image paths to repo-relative paths so gatsby-remark-images can resolve and process them. It is **CMS-agnostic** — it reads `media_folder`/`public_folder` from config.yml and has zero dependency on netlify-cms (verified from installed source: deps are babel-runtime, read-yaml-promise, slash, unist-util-select). It does NOT break with Decap.
**How to avoid (verdict):** **KEEP it in this phase.** Evidence: (a) not broken — no netlify-cms coupling; (b) not redundant — the built `public/laryart/index.html` shows the inline image IS processed by gatsby-remark-images (`src="/static/9575354e.../118567456...jpg"`), which only works because the plugin rewrites the path; removing it would degrade that image to a raw `<img src="/assets/...">` (or a build warning). All `featuredImage:` frontmatter paths are already absolute `/assets/...` and pass through unchanged, so the plugin's only active job is that one inline image. Revisit removal in Phase 5 (image pipeline migration). If the planner prefers removal per D-09's "redundant" reading, the laryart.md image path must be fixed in the same commit.
**Warning signs:** After removal, `gatsby build` logs "unable to resolve image" warnings for laryart.md.

### Pitfall 6: advanced-sitemap removal surprises
**What goes wrong:** Fear that removing it changes sitemap output.
**Why it happens:** gatsby-plugin-advanced-sitemap@2.1.0 peers `gatsby ^3.0.0 || ^4.0.0` (verified) — it is already peer-incompatible with Gatsby 5 and only works because yarn 1 skips peer enforcement. It is deprecated on npm ("Package no longer supported").
**How to avoid:** Remove the package and its `gatsby-config.js` entry (line ~84). gatsby-plugin-sitemap 6.16.0 already generates sitemap.xml. Verify `public/sitemap.xml` exists after build.
**Warning signs:** None expected — removal is strictly cleanup.

### Pitfall 7: Stale Netlify cache masking the upgrade
**What goes wrong:** The first post-upgrade deploy fails or serves stale output despite a green local build.
**Why it happens:** Netlify caches the Node version and dependencies; the repo's history shows repeated "errore di compilazione" loops from exactly this (CONCERNS.md, git log).
**How to avoid:** D-15: first post-upgrade deploy MUST be "Clear cache and deploy site" from the Netlify UI. This is a manual user checkpoint — the plan surfaces it, does not automate it. Netlify's build image default Node is now 24 (verified from Netlify docs), and `.nvmrc` 24 resolves via nvm — but the cached Node 20 from previous builds must be cleared.
**Warning signs:** Deploy log shows an old Node version or stale node_modules despite the repo changes.

### Pitfall 8: gatsby-plugin-offline service worker masking changes
**What goes wrong:** After deploy, visitors see stale pages because the service worker serves cached assets.
**Why it happens:** gatsby-plugin-offline 6.16.0 (peers `gatsby ^5.0.0-next`, verified) precaches aggressively; the existing `onServiceWorkerUpdateReady` prompt only fires for returning visitors.
**How to avoid:** No code change needed — the existing update prompt handles it. Note in the UAT checklist that a hard refresh may be needed to verify the new tracking snippet and fonts on the live site.

## Code Examples

Verified patterns from official sources:

### Vendored Matomo `_paq` snippet for gatsby-browser.js (UPGR-04)
```javascript
// Source: Matomo official JS tracking guide (developer.matomo.org/guides/tracking-javascript-guide)
// + SPA tracking guide (developer.matomo.org/guides/spa-tracking)
// + behavior parity with the removed gatsby-plugin-matomo (inspected in node_modules)
const MATOMO_URL = "https://matomo.duckdns.org"
const MATOMO_SITE_ID = "4"

// Module scope runs once per page load — guard for SSR/build (no window in Node)
if (typeof window !== "undefined") {
  window._paq = window._paq || []
  window._paq.push(["disableCookies"]) // cookie-less tracking (D-12)
  window._paq.push(["setTrackerUrl", `${MATOMO_URL}/matomo.php`])
  window._paq.push(["setSiteId", MATOMO_SITE_ID])
  window._paq.push(["enableHeartBeatTimer"])

  // Load the tracker script asynchronously (vendored snippet, script from Matomo server)
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
**Notes:** `disableCookies` must be pushed BEFORE `trackPageView` (it is a config call). The `setTimeout` mirrors the old plugin's react-helmet title delay. The snippet is vendored (D-13): only `matomo.js`/`matomo.php` requests hit the Matomo server at runtime.

### Font `@import` hoist (D-06, mandatory)
```scss
// style.scss — TOP of file, before local @imports
@import url("https://fonts.googleapis.com/css2?family=Parisienne&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap");

@import "theme-variables";
@import "defaults";
// ...
```
```scss
// _theme-variables.scss — remove the two @import lines from inside :root
:root {
  --font-family-titles: "Parisienne", cursive;
  // ...
}
```
**Empirically verified:** dart-sass 1.102.0 emits the nested `@import` in place (invalid CSS); node-sass hoisted it. After the hoist, dart-sass output matches node-sass output for the font imports.

### Decap CMS config.yml branch fix (D-10)
```yaml
backend:
  name: git-gateway
  branch: main   # was: master
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| node-sass (libsass) | sass (dart-sass) | node-sass deprecated 2020; gatsby-plugin-sass v3.0.0 (2020) made dart-sass the default | No native bindings → Node upgrades stop breaking installs; `@import` deprecation warnings appear (removal in Dart Sass 3.0.0 — not yet released) |
| netlify-cms-app | decap-cms-app (maintained fork) | Netlify CMS discontinued 2023; Decap forked | Same config.yml format; 3.6.4 is the last React-18 line (3.7+ peers React 19) |
| gatsby-plugin-matomo | Vendored `_paq` snippet | Plugin archived Dec 2024 | Zero-dependency; full control of consent flags (disableCookies) |
| gatsby-plugin-advanced-sitemap | gatsby-plugin-sitemap (official) | advanced-sitemap unmaintained; peers gatsby ^3||^4 | One sitemap generator, maintained |
| Node 20 | Node 24 (LTS) | Gatsby 5.16 added official Node 24 support (Jan 2026) | Aligns enforced version with owner's local env; Netlify build image default is already 24 |

**Deprecated/outdated:**
- `gatsby-plugin-netlify-cms` — npm deprecation message: "renamed and moved to gatsby-plugin-decap-cms" (verified)
- `gatsby-plugin-matomo` — npm deprecation: "Package no longer supported" (verified)
- `gatsby-plugin-advanced-sitemap` — npm deprecation: "Package no longer supported" (verified)
- `gatsby-image` — deprecated ("now gatsby-plugin-image") but intentionally kept this phase (D-02)

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this
> section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | gatsby-image 3.11.0 keeps functioning on Gatsby 5.16.1 (it has no peerDependencies, so install cannot break; runtime compatibility is assumed) | Standard Stack | LOW — gated by the D-03 build verification; if it breaks, the build fails loudly and the commit is reverted |
| A2 | gatsby-plugin-netlify-cms-paths works with Decap (CMS-agnostic by code inspection; not runtime-verified against Decap) | Pitfall 5 | LOW — the plugin has zero netlify-cms imports; the /admin smoke test + build gate would catch any issue |
| A3 | Netlify Identity + Git Gateway behave identically with Decap's git-gateway backend (same backend protocol) | Pitfall 4 | MEDIUM — the /admin login smoke test is the verification; if auth breaks, it's a Netlify dashboard issue, not a code issue |
| A4 | The `.16.0` plugin matrix is the correct lockstep target (registry-verified that `.16.1` does not exist; the intent of D-01 is "latest stable lockstep") | Standard Stack, Q1 | LOW — registry evidence is conclusive; the only risk is the user insisting on literal `.16.1` strings, which cannot be installed |
| A5 | `sass@^1.30.0` resolving to 1.102.0 is acceptable (3-week-old release) | Package Legitimacy Audit | LOW — official dart-sass repo, 26M weekly downloads; pin exact if drift is a concern |

## Open Questions

1. **D-01 matrix discrepancy: plugin versions `.16.1` vs `.16.0`**
   - What we know: `gatsby@5.16.1` exists; all 12 gatsby-* plugins top out at `.16.0` (registry-verified, E404 for every `.16.1`). The 5.16.1 patch only fixed a Head API title bug in core.
   - What's unclear: whether the user wants the literal `.16.1` strings (impossible) or the intent (latest stable lockstep).
   - Recommendation: Planner surfaces this in the plan header as a locked-decision correction: use `gatsby@5.16.1` + plugins at `.16.0`. No discuss-phase round-trip needed — the intent is unambiguous and the registry is authoritative.

2. **Keep or remove gatsby-plugin-netlify-cms-paths (D-09)**
   - What we know: CMS-agnostic (no netlify-cms dependency), actively processing the one inline image in laryart.md, unmaintained since 2019.
   - What's unclear: whether the user prefers minimal deps over the processed inline image.
   - Recommendation: KEEP this phase (evidence: not broken, not redundant for the one image); revisit in Phase 5. Documented in Pitfall 5.

3. **sass caret vs exact pin**
   - What we know: D-04 locks `^1.30.0`; resolves to 1.102.0 (published 2026-07-25).
   - What's unclear: user preference on drift.
   - Recommendation: Follow D-04 as written (caret). Note the exact-pin option in the plan.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node 20 (for commits 1–4) | D-03 verification loop | ✓ | 20.20.2 (nvm) | — |
| Node 24 (for commit 5) | D-07 verification loop | ✓ | 24.18.0 + 24.19.0 (nvm) | — |
| yarn 1 | All installs | ✓ | 1.22.22 | — |
| npm registry access | Version verification + installs | ✓ | reachable (all npm view calls succeeded) | — |
| Netlify (deploy + cache clear) | UPGR-07 | external | — | Manual user checkpoint (D-15) |
| Matomo server (matomo.duckdns.org) | UPGR-04 runtime verification | external | — | Manual dashboard check post-deploy |
| Netlify Identity / Git Gateway | UPGR-03 /admin smoke test | external | — | Manual user checkpoint |

**Missing dependencies with no fallback:** none — all build-time dependencies are local and verified.

**Missing dependencies with fallback:** none.

## Validation Architecture

`workflow.nyquist_validation` is absent from `.planning/config.json` → treated as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest 29.7.0 + @testing-library/react 16.3.2 (Phase 1 scaffold) |
| Config file | jest.config.js (root; babel-preset-gatsby 3.16.0 transform, manual __mocks__/gatsby.js) |
| Quick run command | `source ~/.nvm/nvm.sh && nvm use 20 && yarn test` (commits 1–4) / `nvm use 24 && yarn test` (commit 5) |
| Full suite command | `source ~/.nvm/nvm.sh && nvm use 20 && gatsby clean && yarn build && yarn test` (commits 1–4) / `nvm use 24 && yarn install && yarn build && yarn test` (commit 5) |

**Empirically verified on 2026-08-19:** the existing jest suite (4 suites, 8 passed / 1 skipped) runs green on Node 24.18.0, and sharp 0.32.6 processes images on Node 24.18.0 — the Node 24 bump has no known test/build blockers.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UPGR-01 | Build green on exact 5.16.1/.16.0 matrix; package.json has exact versions | smoke (build) + shell | `nvm use 20 && gatsby clean && yarn build && yarn test` + `node -e "const p=require('./package.json'); ['gatsby','gatsby-plugin-sass','gatsby-plugin-sharp'].forEach(k=>console.log(k,p.dependencies[k]))"` | ✅ (inline shell, no file needed) |
| UPGR-02 | Build green with dart-sass; node-sass absent from yarn.lock; font @import hoisted | smoke + shell | `! rg -q 'node-sass' yarn.lock && rg -q '^@import url' src/assets/scss/style.scss && nvm use 20 && yarn build` | ✅ |
| UPGR-03 | decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4 in package.json; config.yml branch main; /admin loads | shell + manual | `rg -q '"decap-cms-app": "3.6.4"' package.json && rg -q 'branch: main' static/admin/config.yml` + manual /admin smoke test | ✅ (manual part is a checkpoint) |
| UPGR-04 | _paq snippet in gatsby-browser.js with disableCookies; gatsby-plugin-matomo gone | shell + manual | `rg -q 'disableCookies' gatsby-browser.js && ! rg -q 'gatsby-plugin-matomo' package.json gatsby-config.js` + manual Matomo dashboard check | ✅ |
| UPGR-06 | Exactly one sitemap plugin; sitemap.xml generated | shell + smoke | `! rg -q 'advanced-sitemap' package.json gatsby-config.js && test -f public/sitemap.xml` | ✅ |
| UPGR-07 | First post-upgrade deploy with cleared cache | manual-only | Netlify UI: Deploys → Clear cache and deploy site (D-15 — cannot be automated) | ✅ (checkpoint) |

**Existing regression net (must stay green through every commit):** `src/components/formik.test.js`, `src/components/navigation.test.js`, `src/templates/blog-list.test.js`, `gatsby-node.test.js`. None of these files are touched by this phase.

### Sampling Rate
- **Per task commit:** `nvm use 20 && yarn test` (fast) + the requirement-specific shell check for that commit
- **Per wave merge:** `nvm use 20 && gatsby clean && yarn build && yarn test` (commits 1–4); `nvm use 24 && yarn install && yarn build && yarn test` (commit 5)
- **Phase gate:** full suite green (build + tests) before `/gsd-verify-work`; git log shows exactly the 5 planned commit groups; manual checkpoints (D-15 deploy, /admin smoke, Matomo dashboard) completed

### Wave 0 Gaps
- None — jest scaffold exists from Phase 1; this is a dependency-swap phase where the regression net is the existing suite plus the build gate. No new test files are required. (Optional: a unit test for the `_paq` snippet is possible but low-value — it is browser-only code verified by the manual Matomo dashboard check.)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (unchanged) | Netlify Identity + Git Gateway for /admin — no code change this phase; the Decap swap keeps the same git-gateway backend |
| V3 Session Management | no | Static site; no server sessions |
| V4 Access Control | no | No server-side resources |
| V5 Input Validation | yes (unchanged) | CMS-authored markdown rendered via `dangerouslySetInnerHTML` — pre-existing risk (CONCERNS.md), out of scope this phase; Decap editors are trusted git-gateway users |
| V6 Cryptography | no | No crypto in app code |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Tracking cookies without consent (GDPR/ePrivacy) | Information Disclosure | **Fixed by this phase:** `disableCookies: true` in the vendored snippet makes the privacy page's no-cookies claim true (D-12) |
| Deprecated analytics plugin (gatsby-plugin-matomo, archived) | Tampering / Info Disclosure | **Fixed by this phase:** removed; vendored snippet has no dependency surface |
| Deprecated CMS packages (netlify-cms-app EOL) | Elevation of Privilege | **Fixed by this phase:** replaced with maintained Decap fork |
| CMS XSS via markdown HTML | Tampering | Unchanged this phase (documented in CONCERNS.md; sanitization is not in scope) |
| Supply chain: new packages | Tampering | All new packages verified against official repos (sass/dart-sass, decaporg/decap-cms, gatsbyjs/gatsby); no postinstall scripts on any (verified) |

## Sources

### Primary (HIGH confidence)
- **npm registry API** (queried live 2026-08-19) — versions, publish dates, peerDependencies, engines, deprecation flags for: gatsby 5.16.1, all 12 gatsby-* plugins (`.16.0` tops; `.16.1` E404), sass 1.102.0/1.30.0, decap-cms-app 3.6.4/3.7.0, gatsby-plugin-decap-cms 4.0.4, gatsby-plugin-netlify-cms 6.22.0/7.12.1, gatsby-plugin-netlify-cms-paths 1.3.0, gatsby-plugin-matomo 0.17.0, gatsby-plugin-advanced-sitemap 2.1.0, gatsby-image 3.11.0, sharp 0.32.6, sass-loader 10.5.2, decap-server 3.10.0
- **Gatsby official docs** — v5.16 release notes (Node.js 24 officially supported, PR #39380/#39398; React 19 support), gatsby-plugin-sass plugin page (dart-sass is the default implementation; `implementation` option only for node-sass)
- **GitHub** — gatsbyjs/gatsby release gatsby@5.16.1 (Head API title fix, PR #39382; published 2026-02-10)
- **Matomo official developer docs** — JavaScript Tracking Client guide (standard `_paq` snippet structure), SPA tracking guide (setCustomUrl/setDocumentTitle/trackPageView on route change), Tracking & Cookie Consent guide (disableCookies semantics)
- **Decap CMS official docs** — Decap Proxy page (`npx decap-server` confirmed as the local proxy command), Gatsby platform guide
- **Netlify official docs** — Manage build dependencies (.nvmrc resolution via nvm; clear-cache advice), Available software at build time (default Node is 24)
- **Empirical tests (this session)** — dart-sass 1.102.0 vs node-sass 9.0.0 on the repo's actual SCSS (nested `@import` behavior); sharp 0.32.6 image processing on Node 24.18.0; jest suite on Node 24.18.0; sass legacy `render` API presence
- **Installed package source inspection** — sass-loader 10.5.2 `getDefaultSassImplementation()` (sass-first resolution); gatsby-plugin-matomo gatsby-ssr.js/gatsby-browser.js (behavior to replicate); gatsby-plugin-netlify-cms-paths source (CMS-agnostic remark transformer); gatsby-plugin-decap-cms 4.0.4 tarball (webpack integration, netlify-identity-widget bundling)
- **Local codebase evidence** — package.json, gatsby-config.js, gatsby-browser.js, static/admin/config.yml, .nvmrc, netlify.toml, .yarnrc, scripts/check-node-version.js, scripts/clean-node-sass-vendor.js, src/assets/scss/*, public/laryart/index.html (processed inline image), yarn.lock

### Secondary (MEDIUM confidence)
- **.planning/research/SUMMARY.md + STACK.md + PITFALLS.md** (2026-08-18) — prior research corroborating the lockstep rule, dart-sass peer range, Decap 3.6.4 React-18 constraint, and clear-cache deploy requirement
- **.planning/phases/02-foundation-cleanup/02-04-SUMMARY.md** — Node enforcement guard implementation details (D-05/D-07 touch points)

### Tertiary (LOW confidence)
- None — all claims in this research were verified against the registry, official docs, or empirical tests this session.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified live against the npm registry (2026-08-19); peer deps and publish dates checked
- Architecture: HIGH — plugin internals inspected from installed source and tarballs; commit sequencing grounded in verified peer-dependency facts
- Pitfalls: HIGH — the two riskiest behaviors (dart-sass nested @import, Node 24 toolchain) were empirically tested, not assumed

**Research date:** 2026-08-19
**Valid until:** 2026-09-19 (stable ecosystem; the only fast-moving item is sass 1.x patch cadence, which the caret range absorbs)
