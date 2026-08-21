# Phase 2: Foundation Cleanup - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the repo state unambiguous: one lockfile (yarn), one Node version (20 per `.nvmrc` — `netlify.toml` NODE_VERSION removed), no dead components (`old-form.js`, `form-pulito.js`), no unused dependencies, and no starter remnants (site.json `ga` placeholder, README boilerplate). No production behavior changes — the site must build and render exactly as before.

</domain>

<decisions>
## Implementation Decisions

### Lockfile Consolidation (FNDT-01)
- **D-01:** Yarn is the single package manager — delete `package-lock.json`, keep `yarn.lock` as the only lockfile. **Reversibility:** reversible
- **D-02:** `netlify.toml` build command changes from `npm run build` to `yarn build` (currently `npm run build` would re-create package-lock.json on Netlify). **Reversibility:** reversible
- **D-03:** `.prettierignore` no longer needs the `package-lock.json` entry (file being deleted) — clean it up.

### Node Version (FNDT-02)
- **D-04:** `.nvmrc` (Node 20) is the single source of truth — delete `NODE_VERSION = "10"` from `netlify.toml` `[build.environment]`. **Reversibility:** reversible
- **D-05:** **Keep `.nvmrc` at Node 20 for this milestone** — do NOT bump to 22 yet. Grounded in Phase 1 execution evidence: node-sass v9.0.0 ships prebuilt binaries only for ABI 108/111/115 (Node 16–20); no ABI 137/127 (Node 22/24) binary exists and node-sass cannot compile from source on modern Node (Python distutils removed). Node 22 bump is only safe after dart-sass replaces node-sass in Phase 3 (UPGR-02). Research's Node 22 recommendation (STACK.md) is deferred and re-evaluated in Phase 3.

### Dead Components (FNDT-03)
- **D-06:** Delete `src/components/old-form.js` and `src/components/form-pulito.js` — verify zero imports exist first (grep for `old-form` and `form-pulito` across src/). **Reversibility:** reversible — git history preserves them

### Unused Dependency Sweep (FNDT-04)
- **D-07:** Remove per CONCERNS.md list: `codemirror`, `seamless-immutable`, `redux` (devDep), `react-refresh` (devDep), `typescript` (devDep), `gatsby-background-image`, `y18n`, `package-doctor`, `yarn` (the npm package — not the package manager), `acorn` (devDep). **Reversibility:** reversible
- **D-08:** `prismjs` is a peer of `gatsby-remark-prismjs` (used transitively) — verify with `yarn why prismjs` before removal; remove only if the remark plugin works without it.
- **D-09:** `netlify-cms-lib-widgets` (devDep) — verify with `yarn why` whether netlify-cms-app needs it before removal.
- **D-10:** Every removal verified via `yarn why <pkg>` BEFORE removal and `yarn install` + `yarn build` AFTER each logical group; one logical group per commit (Pitfall 10 discipline).

### Starter Remnants (SEOS-04)
- **D-11:** Remove the `"ga": "UA-XXXXXXXXX-X"` placeholder field from `src/util/site.json` (no GA plugin wired in gatsby-config.js). **Reversibility:** reversible
- **D-12:** Rewrite README.md for laryart.it **in Italian** — remove starter boilerplate (Stackrole features list, deploy button, Twitter header references, Netlify badge for a different site), describe the actual site: Gatsby + Netlify CMS, content structure, local dev commands (yarn install/develop/build), Node 20 requirement, deployment on Netlify. **Reversibility:** reversible

### the agent's Discretion
- Exact README structure and wording (must be accurate, Italian, no starter remnants)
- Ordering of the removal commits (logical groups)
- Whether `@testing-library/dom` stays in devDependencies (added by Phase 1 as an auto-fix for a peer gap — verify need first)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase & Requirements
- `.planning/ROADMAP.md` §Phase 2 — Goal, 5 success criteria, requirements FNDT-01..04 + SEOS-04
- `.planning/REQUIREMENTS.md` §FNDT-01, §FNDT-02, §FNDT-03, §FNDT-04, §SEOS-04 — Requirement definitions
- `.planning/phases/01-test-scaffolding-performance-baseline/01-SUMMARY.md` — Phase 1 evidence: node-sass ABI constraint, jest devDeps added (including auto-fixed @testing-library/dom)

### Codebase Maps
- `.planning/codebase/CONCERNS.md` — The authoritative list of dead components, unused dependencies, starter remnants (with file:line references)
- `.planning/codebase/STACK.md` — Current dependency inventory
- `.planning/codebase/ARCHITECTURE.md` — Component inventory (confirms old-form.js/form-pulito.js unused)
- `.planning/codebase/CONVENTIONS.md` — Code style for any files touched

### Research
- `.planning/research/SUMMARY.md` — Pitfall 10 (naive dead-dependency sweep — use yarn why, one logical group per commit); Node version ambiguity pitfall
- `.planning/research/STACK.md` — Node 22 LTS recommendation (DEFERRED to Phase 3 per D-05 — node-sass ABI evidence wins)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/content/pages/` + `src/content/posts/` — real content to describe in the README rewrite
- `src/util/site.json` — site metadata (title, description, siteUrl — all real, Italian)

### Established Patterns
- Italian content throughout — README should follow (D-12)
- Prettier formatting (no semicolons, double quotes, arrowParens avoid) for any touched files
- yarn 1.22.22 as package manager

### Integration Points
- `netlify.toml` — build command `npm run build` → `yarn build`; NODE_VERSION removed (FNDT-01/FNDT-02)
- `package.json` — dependency removals must keep `yarn install` green (Phase 1 added jest devDeps — don't remove those)
- `gatsby-config.js` — check it doesn't reference any package being removed (e.g., gatsby-background-image, gatsby-plugin-netlify-cms-paths usage)
- `.prettierignore` — remove stale package-lock.json entry

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard approaches per CONCERNS.md evidence and research pitfalls.

</specifics>

<deferred>
## Deferred Ideas

- **Node 22 bump** — deferred to Phase 3 (after dart-sass replaces node-sass, removing the ABI constraint)
- **gatsby-plugin-netlify-cms-paths removal** — belongs to Phase 3 (Decap CMS swap, UPGR-03) not Phase 2
- **ESLint flat config** — v2 (MODR-03)

</deferred>

---

*Phase: 2-Foundation Cleanup*
*Context gathered: 2026-08-19*
