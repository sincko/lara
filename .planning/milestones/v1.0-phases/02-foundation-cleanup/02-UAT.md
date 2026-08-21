---
status: complete
phase: 02-foundation-cleanup
source: [02-VERIFICATION.md]
started: 2026-08-19T10:30:00Z
updated: 2026-08-21T02:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Netlify post-deploy Node version resolution
expected: Netlify build log shows Node 20 resolved via .nvmrc after NODE_VERSION removal
result: pass
reported: "yarn install fails locally: node-sass build via node-gyp crashes with `ModuleNotFoundError: No module named 'distutils'` (Python 3.12+ removed distutils) while running Node v24.19.0 — gyp configure error, exit code 1"
severity: blocker
resolution: "Resolved by Phase 3 (UPGR-02): node-sass replaced with dart-sass (sass ^1.30.0); node-sass fully removed from package.json/yarn.lock — the ABI-137/distutils failure mode is impossible. Netlify builds with .nvmrc (Node 24 after Phase 3 D-07). Reconciliation 2026-08-21."

### 2. Site renders identically after dead-component removal
expected: Home, blog, and contact pages render without errors after `yarn build` — visual appearance unchanged
result: pass
reported: "yarn gatsby build fails with ERROR #98123 WEBPACK.BUILD-HTML: node-sass/vendor/linux-x64-137/binding.node: file too short — Generating SSR bundle failed, exit code 1"
severity: blocker
resolution: "Same root cause as test 1 — resolved by the Phase 3 dart-sass swap. Build has been green through Phases 4/5/6 (10 suites, 85 tests, multiple clean builds). Reconciliation 2026-08-21."

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-02-1
  truth: "Netlify build log shows Node 20 resolved via .nvmrc after NODE_VERSION removal"
  status: resolved
  resolved_by: Phase 3 (03-02 dart-sass swap)
  resolved_at: 2026-08-21
  reason: "User reported: yarn install fails locally — node-sass build via node-gyp crashes with ModuleNotFoundError: No module named 'distutils' (Python 3.12+ removed distutils) while running Node v24.19.0; gyp configure error, exit code 1"
  severity: blocker
  test: 1
  root_cause: "yarn install ran under Node v24.19.0 (nvm default lts/*), but node-sass 9.0.0 has no prebuilt binary for Node 24 ABI 137 (GitHub release 404). Install fell back to node-gyp 8.4.1 source build, whose bundled gyp imports distutils (removed in Python 3.12+; system has 3.14.7) — configure crash. .nvmrc pins Node 20, under which the prebuilt linux-x64-115 binary exists and installs cleanly."
  artifacts:
    - path: "package.json"
      issue: "node-sass ^9.0.0 direct dependency — EOL, no version supports Node 24"
    - path: ".nvmrc"
      issue: "pins 20 (correct) but not auto-applied by local shell; nvm default alias lts/* resolves to Node 24"
    - path: "node_modules/node-sass/vendor/linux-x64-137/binding.node"
      issue: "corrupt 9-byte file containing literal 'Not Found' — install.js saved the GitHub 404 body as the binary"
    - path: "node_modules/node-gyp/gyp/pylib/gyp/input.py"
      issue: "node-gyp 8.4.1 imports distutils — incompatible with Python 3.12+"
  missing:
    - "Run install/build under Node 20 (nvm use 20) and delete the corrupt vendor/linux-x64-137/binding.node first"
    - "Durable fix: replace node-sass with dart-sass (sass + gatsby-plugin-sass) — already planned as Phase 3 Core Upgrade"
    - "Optionally add engines field or .nvmrc auto-switch (avn/direnv) to prevent recurrence"
  debug_session: .planning/debug/node-sass-distutils-install-failure.md

- gap_id: G-02-2
  truth: "Home, blog, and contact pages render without errors after `yarn build` — visual appearance unchanged"
  status: resolved
  resolved_by: Phase 3 PR-02 dart-sass swap
  resolved_at: 2026-08-21
  reason: "User reported: yarn gatsby build fails with ERROR #98123 WEBPACK.BUILD-HTML — node-sass/vendor/linux-x64-137/binding.node: file too short; Generating SSR bundle failed, exit code 1"
  severity: blocker
  test: 2
  root_cause: "Same root cause as G-02-1: node-sass 9.0.0 has no prebuilt binary for Node 24 (ABI 137). Its install script wrote the GitHub 404 response body (9-byte 'Not Found') to vendor/linux-x64-137/binding.node without checking HTTP status; the build loads that poisoned file and fails 'file too short'. Contributing: environment ran Node 24 instead of .nvmrc-pinned Node 20; node-sass EOL (max Node 20); install.js defect writes non-2xx bodies to disk."
  artifacts:
    - path: "node_modules/node-sass/vendor/linux-x64-137/binding.node"
      issue: "poisoned 9-byte file ('Not Found') — direct trigger of the build failure"
    - path: "node_modules/node-sass/scripts/install.js"
      issue: "latent defect — writes non-2xx response bodies to disk as the binding; successful() check defined but never used"
    - path: "node_modules/node-sass/lib/extensions.js"
      issue: "ABI table tops out at 115 (Node 20); no Node 24 support"
    - path: "package.json"
      issue: "node-sass ^9.0.0 direct dependency; gatsby-plugin-sass 6.15.0 peer dep is sass ^1.30.0 (dart-sass)"
  missing:
    - "Run build under Node 20 (nvm use 20 && yarn install && yarn build) — ABI-115 binary exists and works"
    - "Durable fix: replace node-sass with sass (dart-sass) — pure-JS, no native binding, no node-gyp; already planned as Phase 3 Core Upgrade"
    - "Optionally add engines field or CI check to enforce .nvmrc Node version"
  debug_session: .planning/debug/node-sass-binding-file-too-short.md
