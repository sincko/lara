---
phase: 02-foundation-cleanup
verified: 2026-08-19T11:25:00Z
status: passed
score: 5/5 roadmap success criteria verified (19/19 plan must-have truths verified)
behavior_unverified: 0
overrides_applied: 0
human_verification:

  - test: "Trigger a Netlify deploy and check the build log for the resolved Node version"
    expected: "Build log shows Node 20 resolved via .nvmrc (no NODE_VERSION env var, no Netlify UI pin overriding it)"
    why_human: "Requires an actual Netlify deploy — external service integration no local check can exercise. VALIDATION.md manual-only table item (FNDT-02)."

  - test: "After `nvm use 20 && yarn build`, spot-check home, blog, and contact pages render without errors"
    expected: "Site renders identically to pre-phase state — no missing components, no broken styles, no console errors"
    why_human: "Visual appearance — grep proves zero imports of deleted components and build green, but 'renders as before' is a visual claim. VALIDATION.md manual-only table item (FNDT-03)."
---

# Phase 2: Foundation Cleanup Verification Report

**Phase Goal:** The repo state is unambiguous — one lockfile, one Node version, no dead code or unused dependencies
**Verified:** 2026-08-19T11:25:00Z
**Status:** human_needed (all automated checks pass; 2 inherently-human items remain)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

Roadmap Success Criteria (the phase contract):

| #   | Truth                                                                                                                                | Status                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SC1 | `package-lock.json` is deleted; `yarn install` resolves from yarn.lock as the only lockfile and `yarn build` still passes            | ✓ VERIFIED             | `test ! -f package-lock.json` ✓; `git ls-files package-lock.json` → 0; `git ls-files                                                                                                                                                                                                                                                                                                                                                                                                                                                         | grep -i lock`→ only`yarn.lock`; no npm-shrinkwrap/pnpm-lock; verifier ran `yarn install`(0.32s, up-to-date) — no package-lock.json regenerated;`yarn build` green (8.57s) |
| SC2 | `netlify.toml` no longer pins the stale `NODE_VERSION = "10"`; `.nvmrc` is the single source of truth and Netlify builds with it     | ✓ VERIFIED (repo-side) | `rg NODE_VERSION` across repo (excl. node_modules/.git/.planning/graphify-out) → exit 1 (zero matches); `[build.environment]` section deleted entirely; `.nvmrc` = `20`; no `.node-version`/`.tool-versions`/`engines` field. _"Netlify builds with it" requires a deploy — see Human Verification #1_                                                                                                                                                                                                                                       |
| SC3 | `old-form.js` and `form-pulito.js` are deleted with no remaining imports; the site builds and renders as before                      | ✓ VERIFIED (code-side) | Both files absent from FS and git index; `rg 'old-form\|form-pulito' src/ gatsby-*.js` → 0 matches; build green. _"Renders as before" is visual — see Human Verification #2_                                                                                                                                                                                                                                                                                                                                                                 |
| SC4 | Every listed unused dependency is removed, each removal verified via `yarn why`; `yarn install` succeeds with no dangling references | ✓ VERIFIED             | All 11 removed from package.json (yarn, y18n, codemirror, seamless-immutable, gatsby-background-image, package-doctor, redux, react-refresh, typescript, acorn, netlify-cms-lib-widgets); yarn.lock has zero direct resolution entries for any of them; transitive survivors confirmed: `yarn why netlify-cms-lib-widgets` → "netlify-cms-app depends on it" (verifier ran it), acorn@^6/^7/^8 via webpack, redux nested in gatsby; `yarn install` green                                                                                     |
| SC5 | The site.json `ga` placeholder is gone and the README describes laryart.it accurately — no starter boilerplate remains               | ✓ VERIFIED             | `rg '"ga"' src/util/site.json` → 0; `node -e "require('./src/util/site.json')"` valid, `ga === undefined`, `meta.siteUrl === 'https://laryart.it'`, title contains LaryArt; README forbidden-token grep (`stackrole\|gatsby-starter-foundation\|Deploy to Netlify\|twitter-header\|screenshot.png\|package-lock.json\|Google Analytics\|UA-\|pensive-engelbart`) → zero matches; verifier read README: Italian, factually accurate (19 posts ✓, 4 pages index/laryart/privacy/contatti ✓, yarn-only commands ✓, Node 20 ✓, Netlify deploy ✓) |

Plan must-have truths (all 19 verified):

| #   | Truth                                                                                                                                               | Status     | Evidence                                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | D-01: package-lock.json absent from repo; not surfaced after `yarn install`                                                                         | ✓ VERIFIED | FS + index clean; verifier ran `yarn install` — `git status` shows no untracked package-lock.json                                                                                                                                                 |
| 2   | D-02: netlify.toml build command is `command = "yarn build"`                                                                                        | ✓ VERIFIED | Line 3: `  command = "yarn build"` (2-space TOML indent); `! grep 'npm run build'` ✓                                                                                                                                                              |
| 3   | D-03: `.prettierignore` has no `package-lock.json` line                                                                                             | ✓ VERIFIED | 3 lines: `.cache`, `package.json`, `public`                                                                                                                                                                                                       |
| 4   | netlify.toml has no `NODE_VERSION` key                                                                                                              | ✓ VERIFIED | Whole `[build.environment]` section deleted; file is `[build]` → `[[plugins]]`, valid TOML                                                                                                                                                        |
| 5   | D-07 subset: package.json no longer lists `yarn` or `y18n`                                                                                          | ✓ VERIFIED | Both absent; `packageManager: "yarn@1.22.22"` intact (line 66)                                                                                                                                                                                    |
| 6   | `nvm use 20 && yarn install && yarn build && yarn test` exits 0                                                                                     | ✓ VERIFIED | Verifier ran the full loop: install 0.32s, build 8.57s, test 4 suites / 8 passed / 1 skipped — all exit 0                                                                                                                                         |
| 7   | D-08/D-13: `prismjs` and `@testing-library/dom` remain                                                                                              | ✓ VERIFIED | Both in package.json; `node_modules/prismjs` and `node_modules/@testing-library/dom` on disk                                                                                                                                                      |
| 8   | D-04: netlify.toml has no `NODE_VERSION`; `[build.environment]` deleted or empty-valid                                                              | ✓ VERIFIED | Section deleted entirely (Pitfall 4 discipline)                                                                                                                                                                                                   |
| 9   | D-05: `.nvmrc` content is `20` (unchanged)                                                                                                          | ✓ VERIFIED | `cat .nvmrc` → `20`; tracked in git                                                                                                                                                                                                               |
| 10  | D-06: old-form.js and form-pulito.js do not exist; zero references                                                                                  | ✓ VERIFIED | Files gone; `rg 'old-form\|form-pulito' src/ gatsby-*.js` → 0 matches                                                                                                                                                                             |
| 11  | D-07: package.json no longer lists codemirror, seamless-immutable, gatsby-background-image, package-doctor, redux, react-refresh, typescript, acorn | ✓ VERIFIED | All 8 absent (grep loop)                                                                                                                                                                                                                          |
| 12  | D-09: netlify-cms-lib-widgets removed from devDependencies; transitive survival via netlify-cms-app verified                                        | ✓ VERIFIED | Absent from package.json; verifier ran `yarn why netlify-cms-lib-widgets` → "netlify-cms-app depends on it"; yarn.lock:11127 shows `netlify-cms-lib-widgets "^1.8.1"` inside the `netlify-cms-app@^2.15.72` block                                 |
| 13  | D-10: full loop green after each removal group commit                                                                                               | ✓ VERIFIED | Final state green (verifier ran); per-commit green documented in 02-02-SUMMARY with commit hashes 7c635bd/94bbc68/077947e                                                                                                                         |
| 14  | D-11: site.json has no `ga` key; valid JSON                                                                                                         | ✓ VERIFIED | `rg '"ga"'` → 0; `node require` succeeds; `s.ga === undefined`                                                                                                                                                                                    |
| 15  | site.json `meta` object intact (title, titleTemplate, description, siteUrl, image, twitterUsername)                                                 | ✓ VERIFIED | All 6 fields present; siteUrl `https://laryart.it`; title contains LaryArt                                                                                                                                                                        |
| 16  | D-12: README zero forbidden starter tokens                                                                                                          | ✓ VERIFIED | `rg -iq` forbidden-token grep → exit 1 (zero matches)                                                                                                                                                                                             |
| 17  | D-12: README in Italian, describes laryart.it accurately                                                                                            | ✓ VERIFIED | Verifier read README (65 lines): Italian prose; title `LaryArt — decoupage ed oggetti d'arte fatti a mano`; factual cross-checks pass (19 posts, 4 pages, Gatsby 5.15/React 18/node-sass/Formik/Matomo all match package.json + gatsby-config.js) |
| 18  | README documents yarn-only workflow (no npm commands)                                                                                               | ✓ VERIFIED | `yarn install/develop/build/test/format/clean` present; `rg -iq 'npm install\|npm run build'` → exit 1; yarn-only warning phrased without the forbidden `package-lock.json` literal                                                               |
| 19  | `nvm use 20 && yarn build && yarn test` exits 0 (site.json edit did not break gatsby-config.js)                                                     | ✓ VERIFIED | Verifier ran: build 8.57s green; gatsby-config.js:13-16 reads `settings.meta` only; zero `.ga` consumers anywhere                                                                                                                                 |

**Score:** 5/5 roadmap success criteria verified; 19/19 plan must-have truths verified; 0 behavior-unverified; 0 overrides.

### Required Artifacts

| Artifact                        | Expected                                  | Status     | Details                                                                             |
| ------------------------------- | ----------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `package-lock.json`             | Deleted from git + filesystem             | ✓ VERIFIED | Gone from FS and index; not regenerated by `yarn install`                           |
| `yarn.lock`                     | Sole lockfile, consistent                 | ✓ VERIFIED | Tracked; zero direct entries for the 11 removed packages; transitive entries intact |
| `netlify.toml`                  | `command = "yarn build"`, no NODE_VERSION | ✓ VERIFIED | 5 lines: `[build]` (publish, command) + `[[plugins]]`; valid TOML                   |
| `.prettierignore`               | No package-lock.json line                 | ✓ VERIFIED | 3 lines remain                                                                      |
| `.nvmrc`                        | Content `20`                              | ✓ VERIFIED | Unchanged, tracked                                                                  |
| `src/components/old-form.js`    | Deleted                                   | ✓ VERIFIED | Gone (commit 7c635bd)                                                               |
| `src/components/form-pulito.js` | Deleted                                   | ✓ VERIFIED | Gone (commit 7c635bd)                                                               |
| `package.json`                  | 11 deps removed, keepers intact           | ✓ VERIFIED | 30 deps + 9 devDeps; prismjs/@testing-library/dom present; packageManager intact    |
| `src/util/site.json`            | No `ga` field, valid JSON, meta intact    | ✓ VERIFIED | 10 lines; node require passes                                                       |
| `README.md`                     | Italian rewrite, zero boilerplate         | ✓ VERIFIED | 65 lines; forbidden-token grep clean                                                |

### Key Link Verification

| From                 | To                      | Via                          | Status              | Details                                                                                                          |
| -------------------- | ----------------------- | ---------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `yarn install`       | yarn.lock               | sole lockfile resolution     | ✓ WIRED             | Only lockfile tracked; install green, no package-lock.json regen                                                 |
| netlify.toml command | yarn build              | `command = "yarn build"`     | ✓ WIRED             | Netlify cannot regenerate package-lock.json (Pitfall 7 co-commit honored — commit 260f9fd contains both changes) |
| `.nvmrc`             | Netlify build image     | official .nvmrc honoring     | ✓ WIRED (repo-side) | Sole Node source; deploy confirmation is Human Verification #1                                                   |
| gatsby-config.js     | site.json               | `settings.meta` (line 13-16) | ✓ WIRED             | Reads `meta` only; `ga` had zero consumers (rg exit 1)                                                           |
| README               | contributor workflow    | yarn-only commands           | ✓ WIRED             | No npm commands documented (Pitfall 3 guard)                                                                     |
| netlify-cms-app      | netlify-cms-lib-widgets | transitive dep `^1.8.1`      | ✓ WIRED             | `yarn why` confirms netlify-cms-app as reason (D-09)                                                             |

### Data-Flow Trace (Level 4)

N/A — this phase produces no dynamic-data artifacts. It is a removal/config/documentation phase; the only data consumer touched is `gatsby-config.js` → `settings.meta`, which was verified intact (site.json valid, meta fields present, build green).

### Behavioral Spot-Checks

| Behavior                        | Command                                              | Result                                                                                    | Status |
| ------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| Single-lockfile install loop    | `source ~/.nvm/nvm.sh && nvm use 20 && yarn install` | exit 0, 0.32s, "Already up-to-date"; no package-lock.json created                         | ✓ PASS |
| Build under Node 20             | `nvm use 20 && yarn build`                           | exit 0, 8.57s, all pages generated (node-sass ABI 115 prebuilt)                           | ✓ PASS |
| Test suite                      | `nvm use 20 && yarn test`                            | exit 0, 4 suites / 8 passed / 1 skipped (the intentional Phase 1 failure-path regression) | ✓ PASS |
| D-09 transitive survival        | `yarn why netlify-cms-lib-widgets`                   | "netlify-cms-app depends on it"                                                           | ✓ PASS |
| site.json validity + ga absence | `node -e "require('./src/util/site.json')"`          | valid; `ga === undefined`; `meta.siteUrl === 'https://laryart.it'`                        | ✓ PASS |
| Forbidden-token grep            | `rg -iq 'stackrole\|...' README.md`                  | exit 1 (zero matches)                                                                     | ✓ PASS |

### Probe Execution

No probes declared for this phase (no `probe-*.sh` in PLAN/SUMMARY; no `scripts/*/tests/probe-*.sh` in repo). Step 7c: SKIPPED (not a migration/tooling phase).

### Requirements Coverage

| Requirement | Source Plan  | Description                                                         | Status      | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------- | ------------ | ------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FNDT-01     | 02-01        | Single package manager — package-lock.json removed, yarn.lock only  | ✓ SATISFIED | SC1 verified; commit 260f9fd                                                                                                                                                                                                                                                                                                                                                                                                                               |
| FNDT-02     | 02-02        | Node version unambiguous — NODE_VERSION removed/aligned with .nvmrc | ✓ SATISFIED | SC2 verified; commit 7c635bd. Note: REQUIREMENTS.md parenthetical "(Node 22 LTS)" superseded by CONTEXT D-05 (node-sass ABI evidence; Node 22 deferred to Phase 3) — the operative clause "removed or aligned with .nvmrc" is satisfied via removal                                                                                                                                                                                                        |
| FNDT-03     | 02-02        | Dead components removed (old-form.js, form-pulito.js)               | ✓ SATISFIED | SC3 verified; commit 7c635bd                                                                                                                                                                                                                                                                                                                                                                                                                               |
| FNDT-04     | 02-01, 02-02 | Unused deps removed, verified with `yarn why`                       | ✓ SATISFIED | SC4 verified; commits 260f9fd/94bbc68/077947e. Note: REQUIREMENTS.md lists `prismjs` in the removal list, but CONTEXT D-08 resolved it as a KEEPER — `yarn why` proved it is a required peer of gatsby-remark-prismjs (yarn 1 does not auto-install peers; RESEARCH Pitfall 1 documents the empirical build break). The requirement's own verification method (`yarn why` per removal) produced the keep decision. Intent satisfied: prismjs is not unused |
| SEOS-04     | 02-03        | ga placeholder removed; README rewritten for laryart.it             | ✓ SATISFIED | SC5 verified; commit ef270cb                                                                                                                                                                                                                                                                                                                                                                                                                               |

**Orphaned requirements:** none — all 5 Phase 2 requirement IDs (FNDT-01..04, SEOS-04) are claimed by plans and verified.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| —    | —    | none    | —        | —      |

Zero debt markers (TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER) in all phase-modified files (netlify.toml, .prettierignore, package.json, README.md, src/util/site.json). No stubs, no empty implementations, no hardcoded-empty props. The `console.error` stack trace in `yarn test` output is the intentional Phase 1 failure-path regression test (formik submit failure), not a defect.

### Human Verification Required

#### 1. Netlify post-deploy Node version resolution

**Test:** Trigger a Netlify deploy and check the build log for the resolved Node version.
**Expected:** Build log shows Node 20 resolved via `.nvmrc` — no `NODE_VERSION` env var, no Netlify UI pin overriding it.
**Why human:** Requires an actual Netlify deploy — external service integration no local check can exercise. This is VALIDATION.md's manual-only table item for FNDT-02 (research Open Question 1: if it diverges, set the Netlify UI pin to 20).

#### 2. Site renders identically after dead-component removal

**Test:** After `nvm use 20 && yarn build`, spot-check home, blog, and contact pages render without errors.
**Expected:** Site renders identically to pre-phase state — no missing components, no broken styles, no console errors.
**Why human:** Visual appearance. Automated evidence is strong (zero imports of deleted components, zero references to removed deps in src/ and gatsby configs, build green with all pages generated), but "renders as before" is ultimately a visual claim. VALIDATION.md manual-only table item for FNDT-03.

### Gaps Summary

No gaps. All 5 roadmap success criteria and all 19 plan must-have truths are verified against the actual codebase — not just SUMMARY claims. The verifier independently re-ran the phase's real gate (`nvm use 20 && yarn install && yarn build && yarn test` — all green), confirmed the lockfile state (yarn.lock sole tracked lockfile, no regeneration), confirmed all 11 dependency removals with zero dangling direct entries and verified transitive survivors, confirmed the dead components and `ga` field are gone with zero consumers, and read the README to confirm it is accurate Italian with zero starter boilerplate.

Two items remain that are inherently human-verifiable (external Netlify deploy, visual rendering) — both pre-scheduled in VALIDATION.md's manual-only table. All automated verification passes.

---

_Verified: 2026-08-19T11:25:00Z_
_Verifier: the agent (gsd-verifier)_
