# Phase 3: Core Upgrade - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 3-core-upgrade
**Areas discussed:** Gatsby lockstep matrix, dart-sass swap + guard cleanup, Decap CMS swap, vendored Matomo, single sitemap, Netlify deploy

---

## Gatsby Lockstep Matrix (UPGR-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Lockstep 5.16.1 matrix in one commit | All gatsby-* plugins to exact 5.16.x versions together | ✓ |
| Incremental per-plugin bumps | Bump plugins one at a time across commits | |

**User's choice:** [auto] Lockstep 5.16.1 matrix in one commit (recommended default)
**Notes:** [auto] ROADMAP success criterion 1 mandates the exact 5.16.1 matrix in one commit. Legacy gatsby-image stays untouched (Phase 5 scope).

## dart-sass Swap + Guard Cleanup (UPGR-02)

| Option | Description | Selected |
|--------|-------------|----------|
| sass ^1.30.0 + remove node-sass hygiene guards | Swap to dart-sass, delete clean-node-sass-vendor.js + postinstall, keep Node 20 enforcement | ✓ |
| sass ^1.30.0, keep guards | Swap but leave the now-dead node-sass cleanup script in place | |

**User's choice:** [auto] sass ^1.30.0 + remove node-sass hygiene guards (recommended default)
**Notes:** [auto] The vendor-cleanup script is dead weight once node-sass is gone; Node 20 enforcement (engines, engine-strict, check-node-version.js) stays. Nested `@import url()` in _theme-variables.scss may need a minimal hoist if dart-sass errors.

## Decap CMS Swap (UPGR-03)

| Option | Description | Selected |
|--------|-------------|----------|
| decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4 | Maintained fork, config.yml compatible, fix branch master→main | ✓ |
| Keep netlify-cms-app | Stay on the EOL package | |

**User's choice:** [auto] decap-cms-app 3.6.4 + gatsby-plugin-decap-cms 4.0.4 (recommended default)
**Notes:** [auto] ROADMAP locks the exact versions. gatsby-plugin-netlify-cms-paths: remove if broken/redundant with Decap. Local dev proxy becomes npx decap-server.

## Vendored Matomo (UPGR-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Vendored _paq snippet in gatsby-browser.js, disableCookies: true | Remove gatsby-plugin-matomo, inline the tracking snippet | ✓ |
| Keep gatsby-plugin-matomo | Stay on the plugin | |

**User's choice:** [auto] Vendored _paq snippet in gatsby-browser.js, disableCookies: true (recommended default)
**Notes:** [auto] ROADMAP success criterion 4 mandates the vendored snippet with disableCookies. Same siteId 4 / matomo.duckdns.org. Makes the privacy page's no-cookies claim true.

## Single Sitemap (UPGR-06)

| Option | Description | Selected |
|--------|-------------|----------|
| Remove gatsby-plugin-advanced-sitemap, keep official sitemap plugin | One sitemap generator | ✓ |
| Keep both plugins | Dual sitemaps | |

**User's choice:** [auto] Remove gatsby-plugin-advanced-sitemap, keep official sitemap plugin (recommended default)
**Notes:** [auto] ROADMAP success criterion 5: exactly one plugin generates sitemap.xml.

## Netlify Deploy (UPGR-07)

| Option | Description | Selected |
|--------|-------------|----------|
| Manual checkpoint: clear-cache deploy | Plan surfaces a user checkpoint for the first post-upgrade deploy | ✓ |
| Attempt automation | Try to script the cache clear | |

**User's choice:** [auto] Manual checkpoint: clear-cache deploy (recommended default)
**Notes:** [auto] Netlify cache clearing is a UI action; the plan must surface it as a checkpoint, not automate it.

## the agent's Discretion

- Exact ordering of upgrade commits (lockstep bump first, then each tooling swap verified separately)
- Whether Decap swap and sitemap removal share a commit
- Exact _paq snippet structure
- Keep-or-remove decision for gatsby-plugin-netlify-cms-paths (rule: remove if broken/redundant with Decap)

## Deferred Ideas

- Node 22 bump — beyond this milestone
- gatsby-plugin-image migration — Phase 5
- Font self-hosting — Phase 6
- Matomo consent banner — future enhancement
- emailjs-com → @emailjs/browser — Phase 4
