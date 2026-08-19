# Phase 3: Core Upgrade - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase upgrades the core stack in lockstep: Gatsby 5.15.0 → 5.16.1 (latest stable) with every gatsby-* plugin bumped to the matching 5.16.x version in one commit, node-sass → dart-sass (`sass` ^1.30.0, the peer dep of gatsby-plugin-sass), netlify-cms-app → decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4, gatsby-plugin-matomo → vendored `_paq` snippet in gatsby-browser.js with `disableCookies: true`, and the redundant gatsby-plugin-advanced-sitemap removed so exactly one sitemap plugin remains. The site must keep building and deploying reliably throughout — no visual redesign, no new features, no content changes.

</domain>

<decisions>
## Implementation Decisions

### Gatsby Lockstep Upgrade (UPGR-01)
- **D-01:** Gatsby core and ALL gatsby-* plugins upgrade to the exact 5.16.x matrix in ONE commit — no partial bumps. The 5.16.1 matrix is: gatsby 5.16.1, gatsby-plugin-manifest 5.16.1, gatsby-plugin-offline 6.16.1, gatsby-plugin-react-helmet 6.16.1, gatsby-plugin-sass 6.16.1, gatsby-plugin-sharp 5.16.1, gatsby-plugin-sitemap 6.16.1, gatsby-remark-images 7.16.1, gatsby-remark-prismjs 7.16.1, gatsby-remark-responsive-iframe 6.16.1, gatsby-source-filesystem 5.16.1, gatsby-transformer-remark 6.16.1, gatsby-transformer-sharp 5.16.1. **Reversibility:** reversible — git revert restores the 5.15.0 matrix
- **D-02:** `gatsby-image` (legacy, ^3.11.0) stays untouched in this phase — the gatsby-plugin-image migration is Phase 5 (IMAG-01). The legacy `Img`/`fluid` usage must keep working after the core bump.
- **D-03:** The upgrade commit must be verified with `gatsby clean && yarn build && yarn test` green under Node 20 before anything else in the phase proceeds.

### dart-sass Replacement (UPGR-02)
- **D-04:** Replace `node-sass` ^9.0.0 with `sass` ^1.30.0 (dart-sass) — the peer dependency gatsby-plugin-sass 6.16.1 expects. No gatsby-config.js change needed (gatsby-plugin-sass auto-detects the implementation). **Reversibility:** reversible
- **D-05:** After the swap, the Phase 2 node-sass hygiene guards become dead weight: remove `scripts/clean-node-sass-vendor.js` and the `postinstall` script entry from package.json. Keep `scripts/check-node-version.js` + `preinstall`/`prebuild`/`predevelop` + `engines` + `.yarnrc` engine-strict (Node 20 enforcement stays). **Reversibility:** reversible
- **D-06:** Verify the SCSS compiles identically — the repo uses only local `@import`s, but `_theme-variables.scss` has a nested `@import url(...)` (Google Fonts) inside `:root` that dart-sass may warn about. If dart-sass errors on it, hoist the `@import` to the top of `style.scss` (minimal fix, no font strategy change — self-hosting is Phase 6 PERF-01). **Reversibility:** reversible
- **D-07:** With node-sass gone, the Node 22 bump becomes possible — but it stays OUT of scope for this milestone (D-05 from Phase 2 stands; re-evaluate in a future milestone).

### Decap CMS Swap (UPGR-03)
- **D-08:** Replace `netlify-cms-app` ^2.15.72 + `gatsby-plugin-netlify-cms` 6.22.0 with `decap-cms-app` 3.6.4 + `gatsby-plugin-decap-cms` 4.0.4. `static/admin/config.yml` is compatible as-is (Decap is the maintained fork). **Reversibility:** reversible
- **D-09:** `gatsby-plugin-netlify-cms-paths` ^1.3.0 is a netlify-cms-specific path-rewrite plugin — verify whether it works with the Decap plugin; if it breaks or is redundant, remove it and its `resolve` entry in gatsby-config.js (the media_folder/public_folder mapping in config.yml already handles asset paths). **Reversibility:** reversible
- **D-10:** The CMS config still declares `branch: master` while the repo's default branch is `main` — fix the branch reference in `static/admin/config.yml` so CMS saves land on the right branch. **Reversibility:** reversible
- **D-11:** Local CMS editing: `local_backend: true` requires `npx netlify-cms-proxy-server` — with Decap the equivalent is `npx decap-server`. Update the README dev instructions accordingly.

### Vendored Matomo (UPGR-04)
- **D-12:** Remove `gatsby-plugin-matomo` ^0.17.0 and its config block from gatsby-config.js. Replace with a vendored `_paq` snippet in `gatsby-browser.js` (onRouteUpdate) using the same siteId "4" and matomoUrl "https://matomo.duckdns.org/", with `disableCookies: true` (cookie-less tracking — the privacy page already claims no tracking cookies; this makes it true). **Reversibility:** reversible
- **D-13:** The `_paq` snippet is vendored (inlined in the repo), NOT loaded from the Matomo server — no external script dependency at build or runtime.

### Single Sitemap (UPGR-06)
- **D-14:** Remove `gatsby-plugin-advanced-sitemap` ^2.1.0 (unmaintained, duplicates the official plugin). Keep `gatsby-plugin-sitemap` 6.16.1 as the single sitemap generator. **Reversibility:** reversible

### Netlify Deploy (UPGR-07)
- **D-15:** The first post-upgrade Netlify deploy MUST run with cleared cache (Netlify UI: Deploys → Clear cache and deploy site) — the stale NODE_VERSION/cache history has broken builds before. This is a manual user step; the plan must surface it as a checkpoint, not attempt to automate it.

### the agent's Discretion
- Exact ordering of the upgrade commits (lockstep bump first, then each tooling swap as its own verified commit)
- Whether the Decap swap and sitemap removal share a commit or stay separate
- Exact `_paq` snippet structure (standard Matomo tracking code, vendored)
- Whether to keep or remove `gatsby-plugin-netlify-cms-paths` (D-09 gives the decision rule: remove if broken/redundant with Decap)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase & Requirements
- `.planning/ROADMAP.md` §Phase 3 — Goal, 5 success criteria, requirements UPGR-01..04, UPGR-06, UPGR-07
- `.planning/REQUIREMENTS.md` §UPGR-01..07 — Requirement definitions (UPGR-05 belongs to Phase 4)
- `.planning/phases/02-foundation-cleanup/02-CONTEXT.md` — D-05 (Node 20 pinned until dart-sass lands), D-04/D-05 (Node enforcement guards added in 02-04)
- `.planning/phases/02-foundation-cleanup/02-04-SUMMARY.md` — Node enforcement implementation (engines, engine-strict, check-node-version.js, clean-node-sass-vendor.js) — D-05 removes the node-sass-specific parts
- `.planning/phases/01-test-scaffolding-performance-baseline/01-SUMMARY.md` — jest suite exists; `yarn test` must stay green through the upgrade

### Codebase Maps
- `.planning/codebase/STACK.md` — Current dependency inventory (Gatsby 5.15.0, node-sass 9.0.0, netlify-cms-app, gatsby-plugin-matomo, dual sitemap plugins)
- `.planning/codebase/CONCERNS.md` §Dependencies at Risk — node-sass deprecation, netlify-cms EOL → Decap, gatsby-plugin-advanced-sitemap unmaintained, Matomo consent gap (disableCookies: false)
- `.planning/codebase/ARCHITECTURE.md` — gatsby-config.js plugin registry, gatsby-browser.js (service worker only), template-driven routing
- `.planning/codebase/INTEGRATIONS.md` — Matomo config (siteId 4, matomo.duckdns.org), Netlify Identity + Git Gateway for CMS auth, `branch: master` in config.yml
- `.planning/codebase/CONVENTIONS.md` — Code style for any files touched

### Research
- `.planning/research/SUMMARY.md` — Pitfall 11 (big-bang upgrade with zero tests — jest net now exists), upgrade sequencing guidance
- `.planning/research/STACK.md` — Node 22 recommendation (still deferred per D-07)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/check-node-version.js` — Node 20 guard (KEEP; the node-sass cleanup script is removed per D-05)
- `gatsby-browser.js` — currently only the service-worker update prompt; the `_paq` snippet lands here (onRouteUpdate)
- `static/admin/config.yml` — Decap-compatible as-is; only the `branch: master` → `main` fix needed
- Phase 1 jest suite — the regression net that must stay green through every upgrade commit

### Established Patterns
- Plain JavaScript (no TS), Prettier formatting (no semicolons, double quotes, arrowParens avoid)
- yarn 1.22.22, Node 20 enforced (engines + engine-strict + pre* guard)
- One logical change per commit, each verified with `nvm use 20 && yarn install && yarn build && yarn test`
- Italian content and docs throughout

### Integration Points
- `gatsby-config.js` — plugin registry: remove gatsby-plugin-matomo (lines ~22-30), gatsby-plugin-advanced-sitemap (~84), gatsby-plugin-netlify-cms (~83), possibly gatsby-plugin-netlify-cms-paths (~7-9)
- `gatsby-browser.js` — add vendored `_paq` tracking with disableCookies
- `package.json` — dependency swaps: node-sass → sass, netlify-cms-app → decap-cms-app, gatsby-plugin-netlify-cms → gatsby-plugin-decap-cms; remove gatsby-plugin-matomo, gatsby-plugin-advanced-sitemap; remove postinstall script (D-05)
- `static/admin/config.yml` — branch fix (D-10)
- `README.md` — update CMS local-dev command (npx decap-server) and any Node/dependency notes
- `netlify.toml` — no change needed (yarn build + .nvmrc already correct from Phase 2); first deploy needs cache clear (D-15)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard approaches per CONCERNS.md evidence and the locked requirement versions (decap-cms-app 3.6.4, gatsby-plugin-decap-cms 4.0.4, sass ^1.30.0, Gatsby 5.16.1).

</specifics>

<deferred>
## Deferred Ideas

- **Node 22 bump** — deferred beyond this milestone (D-07; Phase 2 D-05 stands)
- **gatsby-plugin-image migration** — Phase 5 (IMAG-01); legacy gatsby-image stays working through this phase
- **Font self-hosting / preconnect** — Phase 6 (PERF-01); only the minimal dart-sass `@import` hoist is allowed here (D-06)
- **Matomo consent banner** — out of scope; disableCookies: true is the privacy-compliant baseline, a banner is a future enhancement
- **emailjs-com → @emailjs/browser** — Phase 4 (UPGR-05), not this phase

</deferred>

---

*Phase: 3-Core Upgrade*
*Context gathered: 2026-08-19*
