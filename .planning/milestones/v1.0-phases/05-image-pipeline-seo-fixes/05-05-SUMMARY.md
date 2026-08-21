---
phase: 05-image-pipeline-seo-fixes
plan: 05
subsystem: ui
tags: [scss, gatsby-plugin-image, pagination, privacy, gap-closure, external-links]

# Dependency graph
requires:
  - phase: 05-image-pipeline-seo-fixes
    provides: 05-04 — visual-delta fixes (banner display:block precedent 68d7cfe, pagination pills, privacy target=_blank raw HTML)
provides:
  - IMAG-01 card-gap fix: .post-card .featured-image gains display:block (additive, banner precedent) — descender gap killed on blog-list/home card images
  - WR-02 (user request): blog-post prev/next pagination keeps the desktop flex formatting under 991px — malformed `padding: 50px 0 ul` statement and the `&.-post ul` grid/gray-block mobile override removed
  - G-05-1a explicitly DECLINED by user at the package checkpoint — no plugin install, privacy links left as-is
affects: [phase 6 performance verification, /gsd-verify-work phase 5]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive display:block on the .post-card .featured-image wrapper rule (border-radius + display:block in source order) — same additive-only discipline as the 05-04 banner fix; nested img rule untouched"
    - "Verify gates run against the exact committed state (detached worktree + symlinked node_modules) — isolates the plan's hunks from unrelated pre-existing working-tree edits"

key-files:
  created:
    - .planning/phases/05-image-pipeline-seo-fixes/deferred-items.md
  modified:
    - src/assets/scss/style.scss
    - .planning/phases/05-image-pipeline-seo-fixes/05-UAT.md

key-decisions:
  - "G-05-1a (privacy external links target=_blank) accepted as unresolved by EXPLICIT USER DECISION: 'don't insert the plugin and leave that links as they are now' — tasks 1-2 skipped entirely, no package.json/yarn.lock/gatsby-config.js/privacy.md changes, UAT gap marked status: rejected"
  - "Task 4 verify gate `! grep -q 'display:grid'` is blind-green-impossible: the pre-existing .grids utility (css-grid-utility.scss, initial commit) always emits display:grid — verified the gate's real intent scoped to .pagination rules (0 matches)"
  - "Commits stage only the plan's hunks via targeted patches — the pre-existing uncommitted @use migration in style.scss stays out of the plan commits"

patterns-established:
  - "Surgical staging: git apply --cached with a task-scoped patch hunks when the working tree carries unrelated pre-existing edits"
  - "Committed-state verification via git worktree add --detach + node_modules symlink when the working tree differs from HEAD"

requirements-completed: [IMAG-01, SEOS-03, SEOS-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Blog-list/home card images have no gap below: .post-card .featured-image carries display:block in compiled CSS (order-tolerant — border-radius first per dart-sass source order), banner .blog-post .featured-image display:block intact, nested img rule untouched, zero marker regressions (gatsby-image-outer-wrapper 0, [object Object] 0)"
    requirement: IMAG-01
    verification:
      - kind: other
        ref: "grep -q 'post-card .featured-image{[^}]*display:block' public/styles.*.css && grep -q 'blog-post .featured-image{[^}]*display:block' public/styles.*.css && grep -rl 'gatsby-image-outer-wrapper' public/ | wc -l == 0 && grep -rl 'object Object' public --include='*.html' | wc -l == 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Post prev/next pagination renders identically on mobile and desktop: compiled CSS contains -post ul{display:flex;justify-content:space-between}, zero display:grid inside .pagination rules, malformed padding:50px 0 ul gone, mobile .num{display:none} (blog-list pills) kept"
    requirement: IMAG-01
    verification:
      - kind: other
        ref: "grep -q -- '-post ul{display:flex;justify-content:space-between}' public/styles.*.css; python scoped .pagination walker → display:grid count 0; ! grep -q 'padding:50px 0 ul' public/styles.*.css; object Object 0"
        status: pass
    human_judgment: true
    rationale: "The visual outcome (side-by-side white prev/next buttons on mobile, no stacked gray blocks) is a rendering judgment — the compiled-CSS assertions prove the mechanism, the /gsd-verify-work phase pass confirms the look"
  - id: D3
    description: "G-05-1a privacy external-links fix — DECLINED by user decision at the blocking-human package checkpoint; no dependency, no config, no privacy.md change; gap recorded as rejected in 05-UAT.md"
    verification:
      - kind: other
        ref: "05-UAT.md gap G-05-1a status: rejected; git diff HEAD~2..HEAD -- package.json yarn.lock gatsby-config.js src/content/pages/privacy.md → empty"
        status: pass
    human_judgment: true
    rationale: "The user explicitly chose to leave the 3 bare-URL privacy links as-is (nested-anchor rendering persists); closing the gap without user consent would violate the decision"

# Metrics
duration: 9min
completed: 2026-08-20
status: complete
---

# Phase 05 Plan 05: Gap-Closure (Card-Gap + Mobile Pagination) Summary

**G-05-1b and the WR-02 mobile-pagination user request are fixed and committed atomically (a3f07f1, 306a105) with build+CSS asserts green on the exact committed states — .post-card .featured-image gains display:block (descender gap killed, banner precedent 68d7cfe) and the malformed `padding: 50px 0 ul` / grid override are removed so post prev/next buttons keep the desktop flex formatting under 991px; G-05-1a (privacy external links) is closed as REJECTED by explicit user decision at the package checkpoint — no plugin installed, privacy links left as-is.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-08-20T14:52:48Z
- **Completed:** 2026-08-20T15:01:37Z
- **Tasks:** 2 executed of 4 planned (tasks 1-2 skipped by user decision)
- **Files modified:** 3 (style.scss, 05-UAT.md, deferred-items.md created)

## Accomplishments

- **G-05-1b closed (IMAG-01):** `display: block;` added to the existing `.post-card .featured-image` rule (additive, joins `border-radius: 12px` in source order — the exact pattern of the 05-04 banner fix). The plugin's `.gatsby-image-wrapper-constrained` inline-block descender gap is gone on blog-list/home cards. Compiled CSS verified order-tolerantly (`post-card .featured-image{border-radius:12px;display:block}`), the banner rule's display:block intact, the nested `img { display: block; margin: 0 }` rule untouched, media-query variant untouched.
- **WR-02 closed (user request):** inside the `.pagination` `@media (max-width: 991px)` block, removed (1) the malformed `padding: 50px 0 ul { ... }` statement (compiled to garbage declarations — the root cause) and (2) the `&.-post ul { display: grid; justify-content: normal; a { padding: 20px; ... background: #fafafa } }` override that restyled post prev/next as stacked gray blocks on mobile. The desktop `-post` flex layout now applies at all widths; the mobile `.num { display: none }` (blog-list page pills) kept as intended.
- **G-05-1a declined per user:** the blocking-human package-legitimacy checkpoint for gatsby-remark-external-links@0.0.4 was declined — "don't insert the plugin and leave that links as they are now". Tasks 1-2 skipped entirely: no `yarn add`, no package.json/yarn.lock/gatsby-config.js/privacy.md changes (verified: `git diff HEAD~2..HEAD` for those paths is empty). 05-UAT.md gap G-05-1a updated `status: failed` → `status: rejected` with `reason: "User declined fix at package checkpoint — links left as-is (no plugin install)"`. Gap G-05-1b untouched.
- **Verification discipline:** each task's verify gate ran against a detached worktree pinned to its own commit (isolating the plan's hunks from unrelated pre-existing working-tree edits). Task 3 gates: build exit 0, post-card + blog-post display:block greps PASS, outer-wrapper 0, object Object 0. Task 4 gates: build exit 0, `-post ul{display:flex;justify-content:space-between}` PASS, scoped display:grid in `.pagination` rules = 0, `padding:50px 0 ul` gone, object Object 0. Full jest suite 10 suites / 85 tests PASS on the committed state `306a105`.

## Task Commits

Each task was committed atomically:

1. **Task 1-2: G-05-1a (plugin install + privacy.md markdown conversion)** - SKIPPED by explicit user decision (package declined at blocking-human checkpoint)
2. **Task 3: Fix G-05-1b — display:block on post-card featured-image** - `a3f07f1` (fix)
3. **Task 4: Fix mobile post pagination — prev/next keep desktop formatting** - `306a105` (fix)

**Plan metadata:** pending (docs: complete plan — this commit)

## Files Created/Modified

- `src/assets/scss/style.scss` - `.post-card .featured-image` gains `display: block` (Task 3); `.pagination` media query loses the malformed `padding: 50px 0 ul` statement and the `&.-post ul` grid/gray-block override, keeps `.num { display: none }` (Task 4)
- `.planning/phases/05-image-pipeline-seo-fixes/05-UAT.md` - gap G-05-1a status `failed` → `rejected` with user-decision reason
- `.planning/phases/05-image-pipeline-seo-fixes/deferred-items.md` - created: out-of-scope pre-existing working-tree changes logged

## Decisions Made

- **G-05-1a closed as rejected, not fixed:** the user's explicit choice at the package checkpoint governs — no dependency, links left as-is. Documented in UAT and this SUMMARY so no future plan re-opens it silently.
- **Surgical commits over whole-file staging:** the working tree carried unrelated pre-existing edits (a style.scss `@use` migration, navigation.js/top-contacts.js title attributes, config.json flag). Task hunks were staged via `git apply --cached` task-scoped patches so each commit contains exactly the plan's change.
- **Committed-state verification:** verify gates ran on `git worktree add --detach <commit>` builds (node_modules symlinked), proving green on the exact committed source — unaffected by the dirty working tree.

## Deviations from Plan

### Skipped by User Decision (not an auto-fix deviation)

**1. Tasks 1-2 (G-05-1a) SKIPPED — package declined at blocking-human checkpoint**
- **Found during:** Task 1 (package legitimacy gate, `gate="blocking-human"`)
- **Issue:** the user declined installing gatsby-remark-external-links@0.0.4 and the whole G-05-1a fix: "don't insert the plugin and leave that links as they are now"
- **Resolution:** tasks 1-2 executed as NO-OPs — no `yarn add`, no package.json/yarn.lock/gatsby-config.js/privacy.md changes; the 8 raw-HTML privacy anchors (incl. the 3 bare-URL nested-anchor links) stay exactly as they are; 05-UAT.md gap G-05-1a marked `status: rejected` with the user-decision reason
- **Files modified:** .planning/phases/05-image-pipeline-seo-fixes/05-UAT.md (status + reason only)
- **Verification:** `git diff HEAD~2..HEAD -- package.json yarn.lock gatsby-config.js src/content/pages/privacy.md` → empty
- **Committed in:** no commit (deliberately nothing to commit; UAT edit lands with the docs commit)

### Auto-fixed / handling notes

**2. [Rule 3 - Blocking] Task 4 verify gate `! grep -q 'display:grid'` can never pass site-wide**
- **Found during:** Task 4 verify
- **Issue:** the plan's gate greps the whole compiled CSS for `display:grid`, but the pre-existing `.grids` utility rule (src/assets/scss/lib/css-grid-utility.scss:44, initial commit 94cdf1c — the blog card grid layout) always emits `display:grid` in every build, regardless of the pagination fix. The gate as written is blind-green-impossible.
- **Fix:** verified the gate's real intent scoped — a python walker confirmed **0** `display:grid` occurrences inside any `.pagination` rule (the grid/gray-block override is truly gone) while `.grids{grid-gap:var(--grid-gap);display:grid}` remains intact (required for the blog grid). The remaining gate clauses (`-post ul` flex grep, `padding:50px 0 ul` absence, object Object 0) pass verbatim.
- **Files modified:** none (verify-scope adjustment only)
- **Verification:** python `.pagination` scope walker → display:grid count 0
- **Committed in:** `306a105` (Task 4 commit)

---

**Total deviations:** 1 user-declined skip (tasks 1-2) + 1 verify-gate handling note (Task 4)
**Impact on plan:** G-05-1a remains unresolved by explicit user choice (documented, UAT marked rejected). Both remaining tasks executed exactly as planned; the display:grid gate correction only removes a false-negative, no scope creep.

## Issues Encountered

- **Pre-existing working-tree edits (out of scope, logged to deferred-items.md):** a style.scss `@use` migration + `$breakpoint-lg` (uncommitted) breaks `phase3-upgrade-matrix.test.js` UPGR-02 (asserts line 0 is the Google Fonts import) — 85/85 tests pass on the committed state (verified via stash + worktree), so the failure is not caused by 05-05. Also uncommitted: navigation.js/top-contacts.js title attributes and `.planning/config.json` (`_auto_chain_active` false). All left untouched and recorded in `.planning/phases/05-image-pipeline-seo-fixes/deferred-items.md`.
- **/tmp tmpfs full** (known environment issue): `git apply --cached` patch files had to live under /home/simos/tmp instead.
- **Task 3 verify initially ran on the dirty working tree** (the `@use` migration present) — the build was green and greps passed, but per strict per-commit gate semantics the gate was re-run on the detached commit state for both tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- IMAG-01 complete: banner + card featured images both display:block (gap-free), verified in compiled CSS with zero marker regressions
- WR-02 complete: post prev/next identical on mobile and desktop; blog-list page pills still hidden on mobile (intended)
- G-05-1a documented as rejected (user decision) — the 3 bare-URL privacy links keep the nested-anchor rendering; if the user changes their mind, the plan's task 1-2 mechanism (markdown `[URL](URL)` + gatsby-remark-external-links) is fully researched and ready
- Full jest suite green on the committed state; remaining working-tree edits (nav/top-contacts titles, @use migration) are owned outside this plan and must land with their test updates
- Ready for the phase verifier's final visual pass: card images gap-free, mobile post pagination = desktop

---
*Phase: 05-image-pipeline-seo-fixes*
*Completed: 2026-08-20*

## Self-Check: PASSED

- 05-05-SUMMARY.md exists at `.planning/phases/05-image-pipeline-seo-fixes/05-05-SUMMARY.md`
- Task commits present: `a3f07f1` (Task 3 display:block), `306a105` (Task 4 mobile pagination)
- Both verify gates green on the exact committed states (detached worktree builds): Task 3 post-card/banner display:block greps + markers 0/0; Task 4 -post flex grep + scoped display:grid 0 + padding statement absent + object Object 0
- Jest suite 85/85 PASS on committed state `306a105`; 85/85 also on the working tree with the pre-existing @use migration stashed (the UPGR-02 failure is owned by the out-of-scope migration)
- Zero file deletions across the plan commits; UAT gap G-05-1a marked `status: rejected` (user decision), G-05-1b untouched
- package.json / yarn.lock / gatsby-config.js / privacy.md untouched (user-declined tasks 1-2) — verified via `git diff HEAD~2..HEAD` for those paths
