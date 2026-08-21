---
phase: 02-foundation-cleanup
plan: 03
subsystem: docs
tags: [seo, site-metadata, readme, italian, starter-remnants, yarn, netlify]

# Dependency graph
requires:
  - phase: 02-foundation-cleanup
    plan: 01
    provides: single-lockfile yarn-only baseline; proven `nvm use 20 && yarn install && yarn build && yarn test` green loop
  - phase: 02-foundation-cleanup
    plan: 02
    provides: clean manifest (9 deps removed), .nvmrc as sole Node source, dead components deleted
provides:
  - src/util/site.json without the dead `ga` placeholder — `meta` object fully intact (D-11)
  - README.md rewritten in Italian for laryart.it with zero starter boilerplate (D-12)
  - yarn-only workflow documented (no npm commands) — package-lock.json resurrection guard
affects: [phase 3 (upgrades on clean manifest), Netlify deploy config, contributor onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Forbidden-token grep discipline (Pitfall 5): final README verified with `rg -iq 'stackrole|gatsby-starter-foundation|Deploy to Netlify|twitter-header|screenshot\\.png|package-lock\\.json|Google Analytics|UA-|pensive-engelbart'` → zero matches"
    - "Yarn-only documentation: README documents `yarn install/develop/build/test/format/clean` and never mentions npm commands (Pitfall 3 prevention)"
    - "Node-version pinning: every build/test command opens with `nvm use 20` (node-sass ABI 115 prebuilt; shell default Node 24 fails)"

key-files:
  created: []
  modified:
    - src/util/site.json (top-level `"ga": "UA-XXXXXXXXX-X"` field removed; `meta` object unchanged — 11 lines → 10 lines)
    - README.md (full Italian rewrite: 160 lines of Stackrole starter boilerplate → 44 lines describing laryart.it)

key-decisions:
  - "D-11 implemented: `ga` placeholder removed from site.json after grep confirmed zero consumers (`rg -n '\"ga\"|\\.ga\\b' src/ gatsby-config.js gatsby-node.js gatsby-browser.js static/` → only site.json:10 defined it; gatsby-config.js reads `settings.meta` only)"
  - "D-12 implemented: README rewritten entirely in Italian — title `LaryArt — decoupage ed oggetti d'arte fatti a mano`, site description, tech stack (Gatsby 5.15, React 18, Netlify CMS, node-sass, Formik, Matomo), content structure (19 posts + 4 pages), yarn-only commands, Node 20 requirement, Netlify deployment"
  - "Yarn-only warning phrased without the forbidden literal: `Usa solo i comandi yarn: un altro package manager reintrodurrebbe il doppio lockfile` — avoids the `package-lock.json` token while still preventing Pitfall 3"
  - "One atomic commit for both tasks per plan instruction (SEOS-04 = D-11 + D-12 together)"

patterns-established:
  - "Pattern 1: Forbidden-token grep as the README acceptance gate (Pitfall 5)"
  - "Pattern 2: Node-version pinning (nvm use 20 before every build/test command)"

requirements-completed: [SEOS-04]

# Coverage metadata (#1602) — one entry per shipped deliverable. Drives DETERMINISTIC UAT routing in verify-work.
coverage:
  - id: D1
    description: "Dead `ga` placeholder removed from src/util/site.json; `meta` object (title, titleTemplate, description, siteUrl, image, twitterUsername) fully intact; valid JSON (SEOS-04, D-11)"
    requirement: SEOS-04
    verification:
      - kind: other
        ref: "command `! rg -q '\"ga\"' src/util/site.json && node -e \"const s=require('./src/util/site.json'); if(s.meta.siteUrl!=='https://laryart.it')process.exit(1); if(s.ga!==undefined)process.exit(1); if(!s.meta.title.includes('LaryArt'))process.exit(1); console.log('OK')\"` exits 0"
        status: pass
      - kind: integration
        ref: "command `nvm use 20 && yarn build && yarn test` exits 0 (build 9.15s; 4 suites, 8 passed, 1 skipped)"
        status: pass
    human_judgment: false
  - id: D2
    description: "README.md rewritten in Italian for laryart.it — site description, tech stack, content structure, yarn-only local dev commands, Node 20 requirement, Netlify deployment; zero starter boilerplate tokens (SEOS-04, D-12)"
    requirement: SEOS-04
    verification:
      - kind: other
        ref: "command `! rg -iq 'stackrole|gatsby-starter-foundation|Deploy to Netlify|twitter-header|screenshot\\.png|package-lock\\.json|Google Analytics|UA-|pensive-engelbart' README.md && rg -q 'yarn install' README.md && rg -q 'yarn develop' README.md && rg -q 'yarn build' README.md && rg -q 'laryart\\.it' README.md && ! rg -iq 'npm install|npm run build' README.md && rg -q 'Node.js 20' README.md` exits 0"
        status: pass
      - kind: integration
        ref: "command `nvm use 20 && yarn build && yarn test` exits 0 (build 8.72s; 4 suites, 8 passed, 1 skipped)"
        status: pass
    human_judgment: true
    rationale: "The grep checks prove token absence/presence, but the Italian prose quality and factual accuracy of the README (does it describe laryart.it correctly for a human reader?) is a judgment no automated test asserts — verifier should read the README."

# Metrics
duration: 4min
completed: 2026-08-19
status: complete
---

# Phase 2 Plan 3: Starter Remnants — ga Placeholder + Italian README Summary

**Dead `ga` placeholder removed from `src/util/site.json` (D-11) and the 160-line Stackrole starter README replaced with a 44-line Italian README describing laryart.it (D-12) — one atomic commit with forbidden-token grep clean and `nvm use 20 && yarn build && yarn test` green**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-19T11:20:00Z
- **Completed:** 2026-08-19T11:24:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- SEOS-04 satisfied: `src/util/site.json` top-level `"ga": "UA-XXXXXXXXX-X"` field removed (11 → 10 lines); `meta` object (title, titleTemplate, description, siteUrl, image, twitterUsername) byte-identical; valid JSON proven via `node -e "require('./src/util/site.json')"`
- D-11 pre-verification: `rg -n '"ga"|\.ga\b' src/ gatsby-config.js gatsby-node.js gatsby-browser.js static/` matched ONLY `src/util/site.json:10` (the definition) — zero consumers; `gatsby-config.js` reads `settings.meta` only; CMS config.yml's only "ga" match is the `git-gateway` backend name (unrelated)
- D-12 satisfied: README.md fully rewritten in Italian — title `LaryArt — decoupage ed oggetti d'arte fatti a mano`, site description (artigianato, decoupage, oggetti d'arte fatti a mano), tech stack (Gatsby 5.15, React 18, Netlify CMS su /admin/, node-sass, Formik + yup, Matomo), content structure (19 post in `src/content/posts/`, 4 pagine in `src/content/pages/`), yarn-only commands (`yarn install/develop/build/test/format/clean`), Node 20 requirement (`.nvmrc`), Netlify deployment (build command `yarn build`, publish `public`)
- Forbidden-token grep clean (Pitfall 5): zero matches for `stackrole`, `gatsby-starter-foundation`, `Deploy to Netlify`, `twitter-header`, `screenshot.png`, `package-lock.json`, `Google Analytics`, `UA-`, `pensive-engelbart`
- Pitfall 3 prevention: README documents yarn-only workflow; `rg -iq 'npm install|npm run build' README.md` exits 1 — the yarn-only warning is phrased without the forbidden `package-lock.json` literal ("un altro package manager reintrodurrebbe il doppio lockfile")
- Full loop green under Node 20: `yarn build` (8.7–9.2s, node-sass ABI 115 prebuilt) + `yarn test` (4 suites, 8 passed, 1 skipped)

## Task Commits

Both tasks were committed atomically as one SEOS-04 commit per plan instruction:

1. **Task 1: Remove ga placeholder from site.json (D-11)** — part of `ef270cb` (docs)
2. **Task 2: Rewrite README.md in Italian for laryart.it (D-12)** — part of `ef270cb` (docs)

**Plan metadata:** committed with this SUMMARY (docs)

## Files Created/Modified

- `src/util/site.json` - top-level `"ga": "UA-XXXXXXXXX-X"` field removed (line 10) and trailing comma on the `twitterUsername` line fixed; `meta` object unchanged; valid JSON
- `README.md` - full Italian rewrite (160 lines → 44 lines): title, site description, tech stack, content structure, local dev commands (yarn-only), CMS usage, Netlify deployment; zero starter boilerplate

## Decisions Made

- One atomic commit for both tasks (SEOS-04 = D-11 + D-12 together) per plan instruction
- README structure: title → site description → contenuti → stack tecnologico → sviluppo locale → Netlify CMS → pubblicazione → struttura del progetto (agent discretion per D-12)
- Yarn-only warning phrased without the forbidden `package-lock.json` token to keep the forbidden-token grep clean while still preventing Pitfall 3

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All pre-verifications matched research predictions exactly (ga defined only at site.json:10, zero consumers; gatsby-config.js reads `settings.meta` only).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Phase 02 complete:** all 3 plans (02-01 lockfile consolidation, 02-02 node config + dead components + dependency sweep, 02-03 starter remnants) have SUMMARYs — ready for `/gsd-verify-work 02` and phase transition
- **Contract for downstream plans:** every build/test command opens with `nvm use 20`; yarn-only workflow (never npm); README now documents the real site
- **Post-deploy check (Phase 2 gate):** after the next Netlify deploy, verify the build log shows Node 20 resolution via `.nvmrc` (research Open Question 1 — if it diverges, set the Netlify UI pin to 20)

---

*Phase: 02-foundation-cleanup*
*Completed: 2026-08-19*

## Self-Check: PASSED

- Commit `ef270cb` present in git log with `02-03` and `SEOS-04` in the message
- `rg -q '"ga"' src/util/site.json` exits 1; `node -e "require('./src/util/site.json')"` succeeds; `meta.siteUrl` = `https://laryart.it`; `meta.title` contains `LaryArt`
- Forbidden-token grep on README.md exits 1 (zero matches); `yarn install`/`yarn develop`/`yarn build`/`laryart.it`/`Node.js 20` all present; no npm commands documented
- `nvm use 20 && yarn build && yarn test` exit 0 (4 suites, 8 passed, 1 skipped)
