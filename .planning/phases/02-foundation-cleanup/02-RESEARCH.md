# Phase 2: Foundation Cleanup - Research

**Researched:** 2026-08-19
**Domain:** Lockfile consolidation, Node version configuration, dead-code/dependency removal, starter-remnant cleanup (Gatsby 5.15 + yarn 1.22 + Netlify)
**Confidence:** HIGH

## Summary

Phase 2 makes the repo state unambiguous without touching production behavior. Every decision (D-01..D-12) was verified against the actual repo: `package-lock.json` and `yarn.lock` are both tracked (`git ls-files` confirms), `netlify.toml` pins `NODE_VERSION = "10"` while `.nvmrc` says `20`, the two dead components (`old-form.js`, `form-pulito.js`) have **zero references** anywhere under `src/` (grep-verified), and the `ga` placeholder in `site.json` is referenced nowhere (only defined at `site.json:10`; `gatsby-config.js` reads only `settings.meta`).

The critical correction to prior analysis: **`prismjs` must NOT be removed.** `gatsby-remark-prismjs@7.15.0` declares `prismjs ^1.15.0` as a **peerDependency** and `require('prismjs')` at runtime (`highlight-code.js:3`, `load-prism-language.js:3`, `load-prism-language-extension.js:3`). yarn 1 does NOT auto-install peer dependencies — this was empirically confirmed in this session (a frozen-lockfile install with `prismjs` removed from `dependencies` left `node_modules/prismjs` absent). Removing it breaks the build on the first code block. CONCERNS.md's "only used transitively" characterization is wrong for yarn 1; the direct dependency entry is what satisfies the peer at runtime. This is the one deviation from the D-07 removal list that research must flag to the planner.

A second correction: `netlify-cms-lib-widgets` (D-09) is a direct dependency of `netlify-cms-app@2.15.72` (`^1.8.1`, verified via installed package.json), so removing the direct devDep entry is safe — the transitive copy survives — but it is NOT in the FNDT-04 requirement list and is optional. `@testing-library/dom` (D-13) must STAY: `@testing-library/react@16.3.2` peers `^10.0.0` and yarn 1 does not auto-install peers — Phase 1 hit this exact failure ("Cannot find module '@testing-library/dom'"). Removing it breaks `yarn test`.

Node version: deleting `NODE_VERSION = "10"` from `netlify.toml` is correct and sufficient — official Netlify docs confirm `.nvmrc`/`.node-version` files are honored and override the UI setting. Local verification must run under Node 20 (`nvm use 20 && yarn build`): the shell defaults to Node 24.18.0, and `node-sass@9.0.0` only ships a prebuilt binary for ABI 115 (Node 20) — verified on disk at `node_modules/node-sass/vendor/linux-x64-115`. Building under Node 24 forces a source compile that fails (Python distutils removed — Phase 1 evidence).

**Primary recommendation:** Execute the phase as four logical commits — (1) lockfile consolidation + netlify.toml + `.prettierignore` + `yarn`/`y18n` dep removal (Pitfall 7 discipline), (2) Node config + dead components, (3) dependency sweep in verified groups, (4) starter remnants (site.json + README). Every removal pre-verified with `yarn why`, post-verified with `nvm use 20 && yarn install && yarn build && yarn test`. Do NOT remove `prismjs`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Package manager resolution | Build pipeline (Netlify) | Local dev (yarn CLI) | Netlify auto-detects yarn from `yarn.lock` presence (official docs); local must match with yarn 1.22.22 |
| Node version selection | Build pipeline (Netlify) | Local dev (nvm) | `.nvmrc` is honored by Netlify's build image; local `nvm use` must match to keep node-sass ABI aligned |
| Dependency manifest truth | Repo root `package.json` | `yarn.lock` | Single manifest + single lockfile; `yarn remove` keeps both in sync atomically |
| Dead component removal | Source tree `src/components/` | — | Pure file deletion; no tier involvement beyond git history as rollback |
| Dependency usage verification | Repo-wide grep + `yarn why` | npm registry metadata | Verification step, not a runtime tier |
| Site metadata | `src/util/site.json` | gatsby-config.js consumer | `ga` field has no consumer anywhere (grep-verified) — removal is metadata-only |
| Documentation truth | `README.md` | — | Repo root doc; no runtime role |

## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Lockfile Consolidation (FNDT-01)
- **D-01:** Yarn is the single package manager — delete `package-lock.json`, keep `yarn.lock` as the only lockfile. **Reversibility:** reversible
- **D-02:** `netlify.toml` build command changes from `npm run build` to `yarn build` (currently `npm run build` would re-create package-lock.json on Netlify). **Reversibility:** reversible
- **D-03:** `.prettierignore` no longer needs the `package-lock.json` entry (file being deleted) — clean it up.

#### Node Version (FNDT-02)
- **D-04:** `.nvmrc` (Node 20) is the single source of truth — delete `NODE_VERSION = "10"` from `netlify.toml` `[build.environment]`. **Reversibility:** reversible
- **D-05:** **Keep `.nvmrc` at Node 20 for this milestone** — do NOT bump to 22 yet. Grounded in Phase 1 execution evidence: node-sass v9.0.0 ships prebuilt binaries only for ABI 108/111/115 (Node 16–20); no ABI 137/127 (Node 22/24) binary exists and node-sass cannot compile from source on modern Node (Python distutils removed). Node 22 bump is only safe after dart-sass replaces node-sass in Phase 3 (UPGR-02). Research's Node 22 recommendation (STACK.md) is deferred and re-evaluated in Phase 3.

#### Dead Components (FNDT-03)
- **D-06:** Delete `src/components/old-form.js` and `src/components/form-pulito.js` — verify zero imports exist first (grep for `old-form` and `form-pulito` across src/). **Reversibility:** reversible — git history preserves them

#### Unused Dependency Sweep (FNDT-04)
- **D-07:** Remove per CONCERNS.md list: `codemirror`, `seamless-immutable`, `redux` (devDep), `react-refresh` (devDep), `typescript` (devDep), `gatsby-background-image`, `y18n`, `package-doctor`, `yarn` (the npm package — not the package manager), `acorn` (devDep). **Reversibility:** reversible
- **D-08:** `prismjs` is a peer of `gatsby-remark-prismjs` (used transitively) — verify with `yarn why prismjs` before removal; remove only if the remark plugin works without it.
- **D-09:** `netlify-cms-lib-widgets` (devDep) — verify with `yarn why` whether netlify-cms-app needs it before removal.
- **D-10:** Every removal verified via `yarn why <pkg>` BEFORE removal and `yarn install` + `yarn build` AFTER each logical group; one logical group per commit (Pitfall 10 discipline).

#### Starter Remnants (SEOS-04)
- **D-11:** Remove the `"ga": "UA-XXXXXXXXX-X"` placeholder field from `src/util/site.json` (no GA plugin wired in gatsby-config.js). **Reversibility:** reversible
- **D-12:** Rewrite README.md for laryart.it **in Italian** — remove starter boilerplate (Stackrole features list, deploy button, Twitter header references, Netlify badge for a different site), describe the actual site: Gatsby + Netlify CMS, content structure, local dev commands (yarn install/develop/build), Node 20 requirement, deployment on Netlify. **Reversibility:** reversible

### the agent's Discretion
- Exact README structure and wording (must be accurate, Italian, no starter remnants)
- Ordering of the removal commits (logical groups)
- Whether `@testing-library/dom` stays in devDependencies (added by Phase 1 as an auto-fix for a peer gap — verify need first)

### Deferred Ideas (OUT OF SCOPE)
- **Node 22 bump** — deferred to Phase 3 (after dart-sass replaces node-sass, removing the ABI constraint)
- **gatsby-plugin-netlify-cms-paths removal** — belongs to Phase 3 (Decap CMS swap, UPGR-03) not Phase 2
- **ESLint flat config** — v2 (MODR-03)

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FNDT-01 | Repo has a single package manager (yarn) — package-lock.json removed, yarn.lock is the only lockfile | Both lockfiles tracked (git ls-files). Netlify docs [CITED: docs.netlify.com] confirm yarn auto-detection from yarn.lock. `netlify.toml` command must become `yarn build` in the same commit (D-02). `.prettierignore:3` entry removed (D-03). README folder-structure section also references package-lock.json (lines 114, 134) — consumed by D-12 rewrite. |
| FNDT-02 | Node version is unambiguous — netlify.toml NODE_VERSION removed or aligned with .nvmrc | `NODE_VERSION = "10"` at netlify.toml:6 is stale (Gatsby 5.15 engines `>=18`). Official Netlify docs confirm `.nvmrc` is honored and overrides the UI setting [CITED: docs.netlify.com/configure-builds/manage-dependencies]. Deleting the env var makes `.nvmrc` (20) deterministic (Pitfall 4). node-sass ABI 115 prebuilt verified on disk (Node 20). Node 20.20.2 available via nvm. |
| FNDT-03 | Dead components removed (old-form.js, form-pulito.js) | grep for `old-form|form-pulito` across `src/`: zero matches [VERIFIED: grep]. `gatsby-config.js` read in full — no reference. Files exist at `src/components/old-form.js`, `src/components/form-pulito.js`; the live form is `src/components/formik.js`. |
| FNDT-04 | Unused dependencies removed — verified with `yarn why` per removal | `yarn why` run for all 12 candidates + @testing-library/dom. 11 confirmed removable (direct-dep-only). **prismjs confirmed REQUIRED (peer of gatsby-remark-prismjs, yarn 1 doesn't auto-install peers — empirically proven).** netlify-cms-lib-widgets removable (netlify-cms-app keeps it transitively). |
| SEOS-04 | Stale site.json ga placeholder removed; README rewritten for laryart.it | `"ga"` only exists at site.json:10; grep across src/, gatsby-config.js, gatsby-node.js, gatsby-browser.js, static/: no consumer [VERIFIED: grep]. CMS settings collection (config.yml:155-191) does not expose `ga` — safe to remove. README is 160 lines of starter boilerplate referencing missing assets (screenshot.png, twitter-header.jpg — both confirmed absent). |

</phase_requirements>

## Standard Stack

This phase installs nothing — it removes and aligns. The post-phase state of the repo is the "standard":

### Post-Phase State
| Item | Value | Verification |
|------|-------|--------------|
| Package manager | yarn 1.22.22 (`packageManager: yarn@1.22.22`) | package.json:77 |
| Lockfile | `yarn.lock` only | `git rm package-lock.json`; guard against reappearance |
| Node (dev) | 20 via `.nvmrc` (`nvm use`) | `.nvmrc` = `20`; Node 20.20.2 installed in nvm |
| Node (Netlify) | 20 via `.nvmrc` (NODE_VERSION env var deleted) | Official docs: `.nvmrc` honored [CITED] |
| Build command | `yarn build` in netlify.toml | D-02 |
| SCSS pipeline | node-sass 9.0.0 (prebuilt ABI 115 = Node 20) | `node_modules/node-sass/vendor/linux-x64-115` on disk |
| Test pipeline | jest 29.7.0 + @testing-library/react 16.3.2 + @testing-library/dom 10.4.1 (devDeps — DO NOT TOUCH) | Phase 1 summary |

### Packages to REMOVE (verified by `yarn why`)

| Package | Section | `yarn why` result | Removable? |
|---------|---------|-------------------|------------|
| `codemirror` ^6.0.2 | dependencies | Direct dep only; netlify-cms-app has its OWN nested codemirror@5.65.20 | **YES** |
| `seamless-immutable` ^7.1.4 | dependencies | Direct dep only | **YES** |
| `redux` ^5.0.1 | devDependencies | Direct devDep; gatsby keeps nested redux@4.2.1 | **YES** |
| `react-refresh` 0.18.0 | devDependencies | Direct devDep; gatsby keeps nested 0.14.2 | **YES** |
| `typescript` ^5.9.3 | devDependencies | Direct devDep only (no tsconfig.json, no .ts files) | **YES** |
| `gatsby-background-image` ^1.6.0 | dependencies | Direct dep only | **YES** |
| `y18n` ^5.0.8 | dependencies | Hoisted from node-sass#sass-graph#yargs and jest#jest-cli#yargs; transitive copies remain | **YES** |
| `package-doctor` ^0.0.0 | dependencies | Direct dep only (npm-audit hack remnant, git a66d212) | **YES** |
| `yarn` ^1.22.22 | dependencies | Direct dep only (Netlify-build hack remnant) | **YES** |
| `acorn` ^8.8.0 | devDependencies | Hoisted from gatsby#webpack#acorn etc.; transitive copies remain | **YES** |
| `prismjs` ^1.30.0 | dependencies | Direct dep satisfies peer of gatsby-remark-prismjs; **yarn 1 does NOT auto-install peers** | **NO — KEEP** |
| `netlify-cms-lib-widgets` ^1.8.1 | devDependencies | Direct devDep; netlify-cms-app@2.15.72 depends on it `^1.8.1` → stays transitive | **YES (optional, D-09)** |
| `@testing-library/dom` ^10.0.0 | devDependencies | Direct devDep; peer `^10.0.0` of @testing-library/react@16.3.2; yarn 1 won't re-install | **NO — KEEP (D-13)** |

**Version verification** (npm registry, all current as of 2026-08-19): codemirror 6.0.2, seamless-immutable 7.1.4, redux 5.0.1, react-refresh 0.18.0, typescript 7.0.2 (latest; 5.9.3 in repo), gatsby-background-image 1.6.0, y18n 5.0.8, package-doctor 0.0.0, yarn 1.22.22, acorn 8.18.0, prismjs 1.30.0, netlify-cms-lib-widgets 1.8.1, @testing-library/dom 10.4.1.

**Installation (this phase):** none. Removals use `yarn remove <pkg>...` (not manual package.json edits) so `yarn.lock` stays consistent.

## Package Legitimacy Audit

All packages involved in this phase were verified against the npm registry (`npm view`). None are hallucinated; none are slopsquatted; none are new or low-download. This phase only REMOVES packages, so supply-chain risk is limited to what remains (unchanged).

| Package | Registry | Age | Source Repo | Verdict | Disposition |
|---------|----------|-----|-------------|---------|-------------|
| codemirror | npm | 14 yrs (2012) | codemirror/dev | OK | Approved for removal (direct-only) |
| seamless-immutable | npm | 12 yrs (2014) | facebookarchive/seamless-immutable | OK | Approved for removal |
| redux | npm | 15 yrs (2011) | reduxjs/redux | OK | Approved for removal (direct devDep) |
| react-refresh | npm | 7 yrs (2019) | facebook/react | OK | Approved for removal (direct devDep) |
| typescript | npm | 14 yrs (2012) | microsoft/TypeScript | OK | Approved for removal (direct devDep) |
| gatsby-background-image | npm | 8 yrs (2018) | timhagn/gatsby-background-image | OK | Approved for removal |
| y18n | npm | 11 yrs (2015) | yargs/y18n | OK | Approved for removal (direct entry; transitive stays) |
| package-doctor | npm | 7 yrs (2019) | puneetlath/package-doctor | OK | Approved for removal |
| yarn (npm pkg) | npm | 14 yrs (2012) | yarnpkg/yarn | OK | Approved for removal (runtime dep hack) |
| acorn | npm | 14 yrs (2012) | acornjs/acorn | OK | Approved for removal (direct devDep; transitive stays) |
| prismjs | npm | 11 yrs (2015) | PrismJS/prism | OK | **KEPT** — peer of gatsby-remark-prismjs |
| netlify-cms-lib-widgets | npm | 6 yrs (2020) | netlify/netlify-cms | OK | Approved for removal (D-09; transitive via netlify-cms-app) |
| @testing-library/dom | npm | 7 yrs (2019) | testing-library/dom-testing-library | OK | **KEPT** — peer of @testing-library/react |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
**Postinstall script check:** no package in the removal set has a network-calling postinstall; node-sass (kept) postinstall is a prebuilt-binary download, safe under Node 20.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │                 REPO STATE                  │
                    │  (single source of truth after this phase)  │
                    └─────────────────────────────────────────────┘
   ┌─────────────────────┐   ┌──────────────────┐   ┌─────────────────────────┐
   │ package.json        │   │ .nvmrc (Node 20) │   │ src/util/site.json     │
   │ + yarn.lock (ONLY)  │──▶│  netlify.toml    │   │ (ga removed)           │
   └─────────────────────┘   │  yarn build,     │   └─────────────────────────┘
            │                │  no NODE_VERSION │
            │                └────────┬─────────┘
            ▼                         ▼
   ┌─────────────────┐      ┌──────────────────┐
   │ yarn install    │      │ Netlify build:   │
   │ (local, Node 20)│      │ nvm reads .nvmrc │
   └─────────────────┘      │ → Node 20 →      │
            │               │ yarn install (via│
            ▼               │ yarn.lock detect)│
   ┌─────────────────┐      │ → yarn build     │
   │ gatsby build    │      └──────────────────┘
   └─────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────────────────────┐
   │ Source tree (clean):                                          │
   │  • no old-form.js / form-pulito.js                            │
   │  • no imports of removed packages (grep-verified)             │
   │  • gatsby-config.js untouched (still lists prismjs plugin)    │
   └──────────────────────────────────────────────────────────────┘
```

Data flow: the ONLY inputs the build consumes are `package.json`/`yarn.lock` (resolver), `.nvmrc` (runtime version), and `src/**` (no references to removed packages). Verification path: `nvm use 20` → `yarn install` → `yarn build` → `yarn test` — green at each commit boundary.

### Recommended Commit Structure (D-10: one logical group per commit)

```
Commit 1 (FNDT-01, D-01..D-03, Pitfall 7): lockfile consolidation
  - git rm package-lock.json
  - netlify.toml: command = "yarn build"
  - .prettierignore: remove package-lock.json line
  - yarn remove yarn y18n          (the runtime-dep hacks live in this group — same logical change)
  - nvm use 20 && yarn install && yarn build && yarn test

Commit 2 (FNDT-02 + FNDT-03, D-04..D-06): Node config + dead components
  - netlify.toml: delete [build.environment] NODE_VERSION = "10"
  - git rm src/components/old-form.js src/components/form-pulito.js
  - grep evidence logged in commit message; nvm use 20 && yarn build && yarn test

Commit 3 (FNDT-04, D-07/D-09/D-10): dependency sweep — sub-groups, each its own commit
  3a. yarn remove codemirror seamless-immutable gatsby-background-image
  3b. yarn remove --dev redux react-refresh typescript acorn netlify-cms-lib-widgets
  3c. yarn remove package-doctor
  (each: yarn why BEFORE, yarn install + yarn build + yarn test AFTER)
  NOTE: prismjs NOT in any group (D-08 resolution: keep)

Commit 4 (SEOS-04, D-11..D-12): starter remnants
  - site.json: remove "ga" line (valid JSON after edit — check with node -e require)
  - README.md: full Italian rewrite
```

### Pattern 1: Removal verification loop (D-10)
**What:** For every removal group — pre-verify with `yarn why`, remove via `yarn remove`, post-verify with install+build+test.
**When to use:** Every dependency removal in this phase.
**Example:**
```bash
nvm use 20
yarn why codemirror        # expect: "specified in dependencies" only → safe
yarn remove codemirror     # updates package.json + yarn.lock atomically
yarn install               # resolves clean
yarn build                 # green
yarn test                  # green (Phase 1 suites untouched)
```

### Pattern 2: Node-version pinning for verification
**What:** All build/test verification commands run under Node 20 via nvm, never the shell default (Node 24).
**When to use:** Every `yarn install`/`yarn build` in this phase.
**Example:**
```bash
nvm use 20 && node --version   # v20.20.2 — node-sass ABI 115 prebuilt exists
yarn build                     # node-sass downloads/uses linux-x64-115 binary
```

### Anti-Patterns to Avoid
- **Removing `prismjs`:** yarn 1 does not auto-install peer dependencies. `gatsby-remark-prismjs` requires it at load time. Build breaks with `Cannot find module 'prismjs'` on the first code-block highlight. CONCERNS.md's "transitive-only" claim is wrong under yarn 1.
- **Removing `@testing-library/dom`:** same yarn-1 peer mechanism; RTL 16.3.2 needs it, Phase 1 already hit the missing-module failure. `yarn test` breaks.
- **Editing package.json by hand and running `yarn install`:** drift between manifest and lockfile. Use `yarn remove` which rewrites both.
- **Running `yarn build` under the default shell Node 24:** node-sass attempts a source compile (distutils failure on modern Python — Phase 1 evidence). Always `nvm use 20` first.
- **Running `npm install`/`npm run build` anywhere in this repo:** regenerates package-lock.json (Pitfall 7). The rewritten README must document yarn-only.
- **Deleting netlify.toml's `[build.environment]` section entirely:** fine to delete the whole section if it contains only NODE_VERSION; keep the file valid TOML (verify with a parser or a Netlify dry-run).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dependency removal | Manual package.json edit + lockfile surgery | `yarn remove <pkg>` | Rewrites package.json AND yarn.lock atomically; no drift |
| Peer-dep satisfaction | Manually copying prismjs into node_modules | Keep the direct `prismjs` dependency | yarn 1 has no peer auto-install; the direct entry IS the mechanism |
| Node version management | Hardcoding paths | `nvm use` (reads .nvmrc) | nvm is installed (v20.20.2 + v24.18.0 present); `.nvmrc` is the contract |
| Lockfile guard | None | Optional one-liner in `test` script or CI | Pitfall 7 recommends a guard that `package-lock.json` does not exist; keep it minimal — a `[ ! -f package-lock.json ]` check appended to the test script is enough, but is a discretion call (not in D-01..D-12) |

**Key insight:** this phase's entire risk profile is "delete something still needed." The only two packages in that category (prismjs, @testing-library/dom) are hidden by yarn 1's peer-dep laxity — the exact failure mode Pitfall 7 documents. Verification is cheap (grep + yarn why + build), so the discipline is: verify before, build after, one group per commit.

## Runtime State Inventory

> Applies because this phase deletes files, removes dependencies, and rewrites configuration — the planner needs explicit confirmation that no runtime system holds the removed state.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no databases, no key-value stores, no datastore keys reference the removed items (site.json `ga` field is a plain JSON file in git, not a datastore) | None |
| Live service config | `netlify.toml` build command (`npm run build`) and `NODE_VERSION = "10"` — in git, changes deploy on next push. Netlify UI may hold a Node pin (see Open Question 1) | Code edit (netlify.toml) + post-deploy log check |
| OS-registered state | None — no pm2/launchd/systemd registrations reference laryart files | None |
| Secrets/env vars | None — no `.env` files exist; no env var names change (D-11 removes a JSON field, not an env var) | None |
| Build artifacts | `node_modules/` will be refreshed by `yarn install` after removals (stale entries pruned by yarn). `public/` is gitignored and rebuilt. `package-lock.json` is deleted via `git rm` — no npm cache holds it as a lockfile; npm's cache may hold packages but that is inert | `yarn install` (prunes), `yarn build` (regenerates public/) |

**Nothing found in categories:** stored data, OS-registered state, secrets/env vars — verified by inspection above. The only live-state risk is the Netlify-side Node pin (Open Question 1).

## Common Pitfalls

### Pitfall 1: Removing prismjs and breaking the build at the first code block
**What goes wrong:** `yarn build` fails with `Cannot find module 'prismjs'` — or worse, builds green until a post with a fenced code block renders, then fails.
**Why it happens:** `gatsby-remark-prismjs@7.15.0` has `prismjs ^1.15.0` as a peerDependency and does `require('prismjs')` at runtime. yarn 1 (unlike npm 7+/pnpm) does NOT install peer dependencies automatically. Empirically verified this session: frozen-lockfile install without the direct entry → `node_modules/prismjs` absent.
**How to avoid:** Do not remove `prismjs` from `dependencies`. D-08's conditional ("remove only if the remark plugin works without it") resolves to: it does NOT work without it.
**Warning signs:** `yarn why prismjs` returning "specified in dependencies" as the only reason — that IS the required reason; `ls node_modules/prismjs` after a test removal.

### Pitfall 2: Building under Node 24 (shell default) and hitting node-sass compile failures
**What goes wrong:** `yarn build` fails in node-sass's install/gyp step — `ModuleNotFoundError: distutils` or long source-compile attempts.
**Why it happens:** shell default is Node 24.18.0; node-sass 9 ships prebuilt binaries only for ABI 108/111/115 (Node 16–20). ABI 137 (Node 24) has no binary, and source builds need Python distutils (removed in Python 3.12). Phase 1 hit exactly this.
**How to avoid:** Every command in this phase runs under `nvm use 20`. Add it to the plan's task preambles.
**Warning signs:** node-sass "building from source" output in install logs; `node_modules/node-sass/vendor/` missing `linux-x64-115`.

### Pitfall 3: package-lock.json resurrecting itself
**What goes wrong:** Any `npm install`/`npm run build` on Netlify or locally recreates package-lock.json, silently reintroducing the dual-lockfile drift.
**Why it happens:** `npm run build` with npm present; the CONTEXT.md itself notes the D-02 rationale.
**How to avoid:** Commit 1 changes netlify.toml to `yarn build` in the SAME commit as the lockfile deletion (D-02 discipline); README documents yarn-only; optionally add the lockfile guard.
**Warning signs:** `git status` showing a new package-lock.json after any install step.

### Pitfall 4: netlify.toml left in invalid TOML state
**What goes wrong:** Deploy fails at config parse instead of build.
**Why it happens:** Deleting `NODE_VERSION = "10"` from `[build.environment]` can leave an empty section or dangling key.
**How to avoid:** Either delete the whole `[build.environment]` section (it contains only NODE_VERSION) or keep it empty-valid. Validate with `npx netlify deploy --dry-run` if available; at minimum confirm the file parses.
**Warning signs:** Netlify deploy log "Error parsing netlify.toml".

### Pitfall 5: README rewrite that still claims starter features
**What goes wrong:** SEOS-04 accepted criteria miss — reviewer finds "Add Google Analytics" or the Stackrole deploy button still present.
**Why it happens:** Copy-paste of the starter README with light edits.
**How to avoid:** Grep the final README for forbidden tokens: `stackrole`, `stackrole.com`, `Deploy to Netlify`, `twitter-header`, `screenshot.png`, `gatsby-starter-foundation`, `package-lock.json`, `Google Analytics`, `UA-`. All must return zero matches. (README:1 Netlify badge points to `pensive-engelbart-b7e7bb` — a different site; must go.)
**Warning signs:** any of the tokens above in the rewritten file.

## Code Examples

### Example 1: netlify.toml before → after (D-02 + D-04)
```toml
# BEFORE
[build]
  publish = "public"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "10"

[[plugins]]
  package = "netlify-plugin-gatsby-cache"

# AFTER
[build]
  publish = "public"
  command = "yarn build"

[[plugins]]
  package = "netlify-plugin-gatsby-cache"
```
Source: current repo state (netlify.toml, 9 lines) + official Netlify docs on yarn detection and `.nvmrc` honoring [CITED: https://docs.netlify.com/configure-builds/manage-dependencies/].

### Example 2: `yarn why` verification pattern (D-10)
```bash
# Removable: direct-only
$ yarn why seamless-immutable
=> Found "seamless-immutable@7.1.4"
This module exists because it's specified in "dependencies".   # ← safe to remove

# NOT removable: satisfies a peer at runtime
$ yarn why prismjs
=> Found "prismjs@1.30.0"
This module exists because it's specified in "dependencies".   # ← same line, but the
# consumer gatsby-remark-prismjs requires('prismjs') and peers ^1.15.0 — KEEP
```
Source: executed in this session on this repo.

### Example 3: Dead-component grep evidence (D-06)
```bash
rg -n 'old-form|form-pulito' src/          # → zero matches (verified 2026-08-19)
rg -n 'old-form|form-pulito' gatsby-config.js gatsby-node.js gatsby-browser.js  # → zero
git rm src/components/old-form.js src/components/form-pulito.js
```
Source: executed in this session.

### Example 4: ga placeholder verification (D-11)
```bash
rg -n '"ga"|\.ga\b' src/ gatsby-config.js gatsby-node.js gatsby-browser.js static/
# → only src/util/site.json:10 defines it; no consumer anywhere
node -e "const s=require('./src/util/site.json'); console.log(s.meta.siteUrl)"  # valid JSON after edit
```
Source: executed in this session.

## Validation Architecture

`workflow.nyquist_validation` is absent from `.planning/config.json` → treated as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest 29.7.0 + @testing-library/react 16.3.2 (Phase 1 scaffold) |
| Config file | jest.config.js (root; babel-preset-gatsby transform, manual __mocks__/gatsby.js) |
| Quick run command | `nvm use 20 && yarn test` |
| Full suite command | `nvm use 20 && yarn test && yarn build` (build is the phase's real gate) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FNDT-01 | yarn.lock only; build green after deletion | smoke (build) + shell | `[ ! -f package-lock.json ] && nvm use 20 && yarn install && yarn build` | ✅ (guard is inline shell, no file needed) |
| FNDT-02 | netlify.toml has no NODE_VERSION; Node 20 build green | smoke (build) | `! rg -q 'NODE_VERSION' netlify.toml && nvm use 20 && yarn build` | ✅ |
| FNDT-03 | old-form.js/form-pulito.js deleted; zero references | shell (grep) | `rg -n 'old-form\|form-pulito' src/ gatsby-*.js` → exit 1 | ✅ |
| FNDT-04 | each removed pkg absent from package.json; build+test green | shell + smoke | `rg -q '"prismjs"\|"@testing-library/dom"' package.json` (must match) + `yarn why <pkg>` per group + `yarn install && yarn build && yarn test` | ✅ |
| SEOS-04 | ga gone from site.json; README clean | shell (grep) + review | `rg -n '"ga"' src/util/site.json` → exit 1; README forbidden-token grep | ✅ |

**Existing regression net (must stay green):** `src/components/formik.test.js` (validation + skipped failure-path), `src/components/navigation.test.js`, `gatsby-node.test.js` (requires `gatsby-node.js` untouched — the plan must NOT modify gatsby-node.js; its commented-out code cleanup is listed in CONCERNS.md but is NOT part of Phase 2 scope per CONTEXT.md).

### Sampling Rate
- **Per task commit:** `nvm use 20 && yarn test` (fast) + the requirement-specific shell check for that task
- **Per wave merge:** `nvm use 20 && yarn install && yarn build && yarn test`
- **Phase gate:** full suite green (build + tests) before `/gsd-verify-work`; git log shows exactly the planned commit groups

### Wave 0 Gaps
- [x] `jest.config.js` / scaffold — exists from Phase 1 (no gaps)
- [x] Existing suites cover the regression net — no new test files required for a removal-only phase (validation is grep + build + existing tests)
- If the planner adds the optional lockfile guard: it lives as a one-line append to the `test` script or a CI step — decision at plan time (discretion, not in D-01..D-12)

*(No Wave 0 gaps — Phase 1 infrastructure covers all phase requirements)*

## Security Domain

`security_enforcement` absent from `.planning/config.json` → enabled. This phase is removal/config-only; the applicable surface is supply-chain hygiene and config integrity.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (no auth surface touched) |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | — (no input paths touched) |
| V6 Cryptography | no | — |
| V8 Malicious Code / Supply Chain | yes | `yarn why` verification before removal; `yarn.lock` integrity via yarn 1's lockfile checksums; no new packages installed |

### Known Threat Patterns for this phase
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Removing a still-needed package (build breakage / supply-chain confusion) | DoS | `yarn why` pre-check + build after each group (D-10); prismjs/@testing-library/dom identified as keepers |
| Lockfile forgery / reintroduction (package-lock.json resurrection) | Tampering | D-02 same-commit command switch; optional `[ ! -f package-lock.json ]` guard |
| Deploy config misconfiguration (invalid TOML / stale Node pin) | DoS | Delete whole `[build.environment]` section; `.nvmrc` as single source of truth (official Netlify precedence) |
| README misleading instructions (npm commands re-documented) | — | Forbidden-token grep on final README; yarn-only documentation |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node 20 (nvm) | All build/test verification (node-sass ABI 115) | ✓ | v20.20.2 (`~/.nvm/versions/node/v20.20.2`) | — |
| Node 24 (shell default) | NOT for this phase's builds | ✓ (avoid) | v24.18.0 | Must `nvm use 20` first — Node 24 breaks node-sass |
| yarn 1 | Package removal + install + build | ✓ | 1.22.22 | — |
| nvm | Node version switching | ✓ | NVM_DIR=/home/simos/.nvm | `nvm use 20` reads `.nvmrc` |
| node-sass prebuilt | `yarn build` SCSS pipeline | ✓ | vendor/linux-x64-115 (ABI 115 = Node 20) | None — ABI mismatch is the blocker (Phase 1 evidence) |
| jest 29.7.0 pipeline | Regression net | ✓ | Phase 1 scaffold | — |
| Netlify CLI | Optional netlify.toml validation | not checked | — | Skip; file is 6 lines, parse risk trivial |

**Missing dependencies with no fallback:** none — all required tools are installed and verified.
**Missing dependencies with fallback:** none.

**Environment note for the planner:** every task in this phase MUST open with `nvm use 20` (or `source ~/.nvm/nvm.sh && nvm use 20` in non-interactive shells). The shell default Node 24.18.0 will silently break `yarn build` via node-sass.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Netlify's build image will honor `.nvmrc` (Node 20) after `NODE_VERSION` deletion | Code Examples / FNDT-02 | Low — official docs state `.nvmrc` is honored and overrides the UI setting [CITED]. If the site has a UI-level Node pin set, it could still win; the fix is a UI check, and the plan should include a post-deploy verification step. |
| A2 | yarn 1 peer behavior observed in this session (no auto-install) matches Netlify's yarn install | Pitfall 1 | Low — verified empirically with yarn 1.22.22 locally; Netlify uses the same yarn 1 (preinstalled on build image) per docs. |
| A3 | The `netlify-cms-app` transitive dependency on `netlify-cms-lib-widgets` survives removal of the direct devDep entry | Package table | Very low — verified via installed netlify-cms-app package.json (`dependencies["netlify-cms-lib-widgets"] = "^1.8.1"`); yarn 1 keeps nested copies. Post-removal `yarn why netlify-cms-lib-widgets` check covers it. |
| A4 | Removing `acorn`'s direct devDep entry leaves the gatsby-required transitive acorn hoisted/available | Package table | Very low — `yarn why acorn` shows gatsby#webpack etc. depend on it; nested copy persists. Build verification covers any surprise. |
| A5 | The README rewrite scope (Italian, accurate) has no user-provided content list beyond CONTEXT.md D-12 | Common Pitfalls | Medium — exact structure/wording is the agent's discretion; the site.json meta fields and content folders (verified: src/content/pages/{index,laryart,privacy,contatti}.md, 19 posts) give the factual basis. |

## Open Questions (RESOLVED)

1. **Is there a Node-version pin set in the Netlify UI for this site?** — RESOLVED: post-deploy log check is the verification path; VALIDATION.md Manual-Only Verifications table includes "Netlify post-deploy Node version resolution" (after first deploy, check the build log line "Using Node.js version: v20.x"; if it diverges, set the UI pin to 20).
   - What we know: official docs give precedence "UI setting < env var < .nvmrc" — actually the docs state a `NODE_VERSION` env var, `.node-version`, or `.nvmrc` file overrides the UI setting; with the env var deleted, `.nvmrc` is the only remaining source.
   - What's unclear: whether the site's Netlify UI has a Node version selected that could diverge from 20 after the env var deletion.

2. **Should the optional `package-lock.json` guard be added to the test script?** — RESOLVED: test script left untouched per discretion (Phase 1 contract — `jest --watch=false`); guard not added as a task; if desired later, add as a separate `check:lockfile` script or CI step.
   - What we know: Pitfall 7 recommends a guard; D-01..D-12 don't mandate one.
   - What's unclear: whether the user wants the test script extended (it's currently exactly `jest --watch=false`).

3. **netlify-cms-lib-widgets: remove or keep the direct devDep entry?** — RESOLVED: removed in Plan 02-02 task 3 (devDep group); transitive survival verified via post-removal `yarn why netlify-cms-lib-widgets 2>&1 | grep -q netlify-cms-app`.
   - What we know: removable per D-09 verification (netlify-cms-app keeps it transitive); NOT in the FNDT-04 requirement list.
   - What's unclear: whether removing it adds value beyond manifest cleanliness (it does — one fewer direct entry, no resolution change).

## Sources

### Primary (HIGH confidence)
- **Local repo verification (executed 2026-08-19):** `git ls-files` (both lockfiles tracked), `yarn why` for all 13 packages, grep sweeps (old-form/form-pulito/ga/removal candidates), node_modules inspection (gatsby-remark-prismjs peers + runtime requires; netlify-cms-app deps; RTL 16.3.2 peers; node-sass vendor/linux-x64-115), nvm availability (v20.20.2, v24.18.0)
- **Empirical yarn-1 peer test:** frozen-lockfile install with prismjs removed from dependencies → `node_modules/prismjs` absent (tmp dir, yarn 1.22.22)
- **npm registry:** `npm view` version/created/modified for all 13 packages (2026-08-19)
- **Netlify official docs:** https://docs.netlify.com/configure-builds/manage-dependencies/ — yarn detection from yarn.lock; `.nvmrc` honored for Node version [CITED]
- **Phase 1 evidence:** `.planning/phases/01-test-scaffolding-performance-baseline/01-01-SUMMARY.md` — @testing-library/dom peer fix, node-sass distutils failure on Node 24, jest devDeps
- **Prior research:** `.planning/research/PITFALLS.md` (Pitfalls 4, 7), `.planning/research/SUMMARY.md`, `.planning/research/STACK.md` (Node 22 rec — deferred by D-05)

### Secondary (MEDIUM confidence)
- `.planning/codebase/CONCERNS.md` — dead component list, double lockfiles, starter remnants (file:line references all spot-checked and confirmed)
- `.planning/codebase/STACK.md` — dependency inventory (prismjs characterization corrected by this session's verification)

### Tertiary (LOW confidence)
- None — no claims in this research rest on unverified web sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every package state verified via `yarn why` + npm registry this session; no training-data versions used
- Architecture: HIGH — commit structure maps 1:1 to locked decisions D-01..D-12 and Pitfall 7/10 discipline
- Pitfalls: HIGH — prismjs/@testing-library/dom peer behavior empirically demonstrated; node-sass ABI constraint confirmed on disk + Phase 1 evidence

**Research date:** 2026-08-19
**Valid until:** 2026-09-18 (30 days — stable domain; Netlify docs and yarn 1 behavior are slow-moving)

---

*Phase: 2-Foundation Cleanup*
*Researched: 2026-08-19*
