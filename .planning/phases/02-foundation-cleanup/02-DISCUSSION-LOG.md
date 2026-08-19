# Phase 2: Foundation Cleanup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 2-Foundation Cleanup
**Areas discussed:** Lockfile consolidation, Node version strategy, Dead component removal, Unused dependency sweep, site.json ga placeholder, README rewrite

---

## Lockfile Consolidation

| Option | Description | Selected |
|--------|-------------|----------|
| Yarn as single source of truth | Delete package-lock.json, netlify.toml build → yarn build | ✓ |
| npm | Remove yarn.lock, keep package-lock.json | |

**User's choice:** Yarn (decided at milestone initialization; auto-selected in --auto mode)
**Notes:** netlify.toml `npm run build` would re-create package-lock.json on Netlify — must switch to `yarn build` in the same change.

## Node Version Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Node 20, delete NODE_VERSION from netlify.toml | .nvmrc = single source of truth; node-sass ABI evidence | ✓ |
| Bump .nvmrc to 22 now | Research recommendation, but node-sass has no Node 22 binary | |

**User's choice:** Keep Node 20 (auto-selected in --auto mode, evidence-grounded)
**Notes:** Phase 1 execution proved node-sass v9.0.0 has no ABI 137/127 prebuilt binary and can't compile from source on modern Node. Node 22 deferred to Phase 3 after dart-sass replaces node-sass.

## Dead Component Removal

| Option | Description | Selected |
|--------|-------------|----------|
| Delete old-form.js + form-pulito.js | After verifying zero imports | ✓ |
| Keep as-is | | |

**User's choice:** Delete (auto-selected, CONCERNS.md recommendation)

## Unused Dependency Sweep

| Option | Description | Selected |
|--------|-------------|----------|
| CONCERNS.md list, yarn why per removal | codemirror, seamless-immutable, redux, react-refresh, typescript, gatsby-background-image, y18n, package-doctor, yarn, acorn | ✓ |
| Verify prismjs + netlify-cms-lib-widgets first | Peer/transitive usage check | ✓ |

**User's choice:** CONCERNS.md list (auto-selected, Pitfall 10 discipline)

## site.json ga Placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| Remove ga field | Dead config, no GA plugin wired | ✓ |
| Keep | | |

**User's choice:** Remove (auto-selected, SEOS-04)

## README Rewrite

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite in Italian for laryart.it | Accurate description, no starter boilerplate | ✓ |
| Keep English starter README | | |

**User's choice:** Italian rewrite (auto-selected — site is Italian)

---

## the agent's Discretion

- README structure/wording
- Removal commit ordering
- @testing-library/dom retention (Phase 1 auto-fix)

## Deferred Ideas

- Node 22 bump — Phase 3 (after dart-sass)
- gatsby-plugin-netlify-cms-paths removal — Phase 3 (Decap swap)
- ESLint flat config — v2 (MODR-03)
