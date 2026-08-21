---
phase: 03-core-upgrade
plan: 04
subsystem: analytics
tags: [matomo, gatsby-browser, _paq, cookie-less, privacy]

# Dependency graph
requires:
  - phase: 03-01
    provides: Gatsby 5.16.1 + dart-sass baseline with green Node 20 build/test loop
provides:
  - Vendored Matomo `_paq` tracking snippet in gatsby-browser.js (no gatsby-plugin-matomo)
  - Cookie-less tracking (disableCookies) making the privacy page's no-tracking-cookies claim true
affects: [03-06 (post-deploy live verification checkpoint), privacy page UAT]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Vendored third-party tracking snippet in gatsby-browser.js with module-scope `typeof window` guard (SSR/build safety)"
    - "onRouteUpdate page-view tracking with `!window._paq` guard and 32ms react-helmet title delay"

key-files:
  created: []
  modified:
    - package.json
    - yarn.lock
    - gatsby-config.js
    - gatsby-browser.js

key-decisions:
  - "Replaced gatsby-plugin-matomo ^0.17.0 with a vendored `_paq` snippet (D-12/D-13) — no external build-time dependency, only runtime matomo.js/matomo.php requests"
  - "disableCookies pushed BEFORE any trackPageView (ordering constraint) — cookie-less tracking matches the privacy page's no-tracking-cookies claim"

patterns-established:
  - "Vendored analytics snippet: module-scope init guarded by `typeof window !== \"undefined\"`, config calls before tracking calls, script injected before first script tag"

requirements-completed: [UPGR-04]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Vendored Matomo _paq tracking in gatsby-browser.js — plugin removed, cookie-less tracking with same siteId 4 / matomoUrl, onRouteUpdate page-view tracking"
    requirement: UPGR-04
    verification:
      - kind: integration
        ref: "source ~/.nvm/nvm.sh && nvm use 20 && yarn install && yarn clean && yarn build && yarn test"
        status: pass
      - kind: other
        ref: "acceptance greps: matomo absent from package.json/gatsby-config.js/yarn.lock; MATOMO_URL/SITE_ID present; disableCookies before trackPageView; onRouteUpdate + window guards + onServiceWorkerUpdateReady intact"
        status: pass
    human_judgment: true
    rationale: "Live Matomo event delivery (matomo.duckdns.org receiving page views) can only be verified post-deploy — plan 03-06's checkpoint covers it (T-03-12). Local build/test prove the snippet compiles and the site builds, not that the Matomo server records visits."

# Metrics
duration: 3min
completed: 2026-08-19
status: complete
---

# Phase 3 Plan 4: Vendored Matomo Tracking Summary

**gatsby-plugin-matomo removed and replaced with a vendored `_paq` snippet in gatsby-browser.js — cookie-less tracking (disableCookies) with the same siteId "4" and matomoUrl, onRouteUpdate page-view tracking, and a green Node 20 build/test loop**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-19T15:48:23Z
- **Completed:** 2026-08-19T15:51:22Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments

- `gatsby-plugin-matomo` ^0.17.0 removed from dependencies via `yarn remove` — yarn.lock regenerated with the plugin tree gone
- Matomo plugin block (lines 22-30) deleted from gatsby-config.js; no plugin reordering
- Vendored `_paq` snippet added to gatsby-browser.js: module-scope init guarded by `typeof window !== "undefined"`, `disableCookies` pushed before any `trackPageView` (cookie-less, D-12), same siteId "4" and matomoUrl "https://matomo.duckdns.org/", async/defer matomo.js injection
- `onRouteUpdate` export tracks page views on route changes with `!window._paq` guard, referrer/custom-url/document-title pushes, and the 32ms react-helmet title delay (D-13)
- Existing `onServiceWorkerUpdateReady` hook untouched; `yarn clean && yarn build && yarn test` green under Node 20 (4 suites, 8 passed, 1 skipped)

## Task Commits

Each task was committed atomically:

1. **Task 1: Vendored Matomo: remove gatsby-plugin-matomo + add _paq snippet with disableCookies (UPGR-04, D-12/D-13)** - `e7f8f18` (feat)

**Plan metadata:** committed with this SUMMARY (docs)

## Files Created/Modified

- `package.json` - gatsby-plugin-matomo dependency removed
- `yarn.lock` - regenerated, matomo plugin tree gone
- `gatsby-config.js` - matomo plugin block (lines 22-30) deleted
- `gatsby-browser.js` - vendored `_paq` snippet + `onRouteUpdate` export with window guards

## Decisions Made

- Followed the plan exactly: vendored snippet per RESEARCH.md §Code Examples (verified against Matomo official docs + the removed plugin's source), values migrated from the removed plugin block
- `disableCookies` ordering constraint honored — config call before any tracking call

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `yarn format` reformatted the entire repo (prettier 3.8 churn)**
- **Found during:** Task 1 (style constraint step — plan instructs `yarn format` after editing)
- **Issue:** `yarn format` runs prettier over `**/*.{js,jsx,json,md}` — the whole repo, not just the 4 task files. Prettier 3.8 rewrote ~90 files (planning docs, baseline JSON, source components) with formatting churn unrelated to this plan.
- **Fix:** Reverted every out-of-scope file with `git checkout --` (per-file, no blanket reset), keeping only the 4 task files. Verified the 2 pre-existing modified content posts (pluto-1/pluto-2, Pluto→Pippo rename) were preserved untouched — they were modified before this plan started and are not mine to commit.
- **Files modified:** reverted ~90 files outside task scope; task files kept
- **Verification:** `git status --short` shows only the 4 task files + the 2 pre-existing pluto modifications; `npx prettier --check` passes on the 3 edited JS/JSON task files
- **Committed in:** e7f8f18 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The format churn was reverted to keep the commit atomic to the 4 task files. No scope creep; the task files themselves are prettier-clean.

## Issues Encountered

- `yarn format` is repo-wide in this project (prettier 3.8 vs the repo's older formatting) — running it per plan instructions caused mass churn that had to be reverted. Future plans in this phase should format only the edited files (e.g. `npx prettier --write <files>`) instead of `yarn format`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for 03-05 (advanced-sitemap removal) — package.json/yarn.lock are clean and committed, no wave-2 serialization conflict remains
- Live Matomo verification deferred to plan 03-06's post-deploy checkpoint (T-03-12)

## Self-Check: PASSED

- `package.json`, `gatsby-browser.js`, `gatsby-config.js`, `yarn.lock` exist on disk
- Commit `e7f8f18` found in git log
- All 9 acceptance criteria passed (greps + Node 20 build/test loop)
- Plan-level verification passed: `yarn install && yarn clean && yarn build && yarn test` exits 0

---

*Phase: 03-core-upgrade*
*Completed: 2026-08-19*
