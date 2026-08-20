# Deferred Items — Phase 05

Out-of-scope discoveries logged during execution (per executor scope boundary: do not auto-fix).

## 2026-08-20 — 05-05 gap-closure execution

- **Pre-existing uncommitted `@use` migration in src/assets/scss/style.scss** breaks
  `phase3-upgrade-matrix.test.js` (UPGR-02 asserts `lines[0]` of style.scss is the Google
  Fonts `@import url(...)`; the working-tree migration prepends `@use` directives and adds
  `$breakpoint-lg`). The 05-05 commits (a3f07f1, 306a105) deliberately staged only the
  task hunks and left this migration uncommitted — 85/85 tests pass on the committed
  state (verified in a detached worktree). Whoever owns the `@use` migration must also
  update `phase3-upgrade-matrix.test.js` (UPGR-02 assertion) when it lands.
- **Pre-existing uncommitted edits to src/components/navigation.js and
  src/components/top-contacts.js** (title attributes on links) and
  `.planning/config.json` (`_auto_chain_active` false) — not part of 05-05; left untouched.
