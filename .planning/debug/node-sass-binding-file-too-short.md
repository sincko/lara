---
status: diagnosed
trigger: "G-02-2: yarn gatsby build fails with ERROR #98123 WEBPACK.BUILD-HTML — node-sass/vendor/linux-x64-137/binding.node: file too short; Generating SSR bundle failed, exit code 1"
created: 2026-08-19T14:20:00Z
updated: 2026-08-19T14:20:00Z
---

## Current Focus

hypothesis: CONFIRMED — node-sass 9.0.0 has no prebuilt binary for Node 24 (ABI 137); its install script wrote the GitHub 404 response body ("Not Found", 9 bytes) to vendor/linux-x64-137/binding.node, and the build loads that truncated file → "file too short"
test: hexdump of binding.node, HTTP status of the release URL, extensions.js ABI table, install.js source
expecting: binding.node contains "Not Found" text; release URL returns 404; ABI table tops out at 115 (Node 20)
next_action: none — diagnose-only mode; return structured diagnosis

## Symptoms

expected: `yarn gatsby build` completes; home, blog, and contact pages render without errors
actual: Build fails at "Building production JavaScript and CSS bundles" → "Generating SSR bundle failed" with ERROR #98123 WEBPACK.BUILD-HTML
errors: |
ERROR #98123 WEBPACK.BUILD-HTML
Generating SSR bundle failed
/home/simos/progs/lara/node_modules/node-sass/vendor/linux-x64-137/binding.node: file too short
File: src/assets/scss/style.scss
not finished Building HTML renderer - 1.281s
error Command failed with exit code 1.
reproduction: Run `yarn gatsby build` in /home/simos/progs/lara (Node v24.19.0). Build gets past bootstrap, then fails when webpack loads the node-sass native binding for SCSS compilation.
started: Discovered during UAT of Phase 02 (foundation-cleanup). Phase 02 removed package-lock.json, switched netlify.toml to `yarn build`, removed unused deps. Project is Gatsby 5.15 site still depending on node-sass (deprecated, EOL).

## Eliminated

- hypothesis: binding.node is a truncated download of a valid prebuilt binary (network interruption)
  evidence: File content is exactly the 9-byte ASCII string "Not Found" — the GitHub 404 response body, not a partial ELF. A truncated ELF would contain ELF magic bytes.
  timestamp: 2026-08-19T14:20:00Z

- hypothesis: node-sass 9.0.0 supports Node 24 and the binary simply wasn't downloaded
  evidence: node-sass's own ABI table (lib/extensions.js getHumanNodeVersion) tops out at ABI 115 = Node 20.x; ABI 137 returns false (unsupported). Release URL for linux-x64-137_binding.node returns HTTP 404 (verified via curl -I), while linux-x64-115_binding.node returns 302 (exists).
  timestamp: 2026-08-19T14:20:00Z

- hypothesis: the build failure is independent of the G-02-1 install failure
  evidence: Both are downstream of the same condition: node-sass 9.0.0 running under Node 24. Install: no prebuilt binary → 404 body written as binding → postinstall testBinary fails → node-gyp fallback → distutils crash (G-02-1). Build: the poisoned 9-byte binding is loaded → "file too short" (G-02-2). One root cause, two symptoms.
  timestamp: 2026-08-19T14:20:00Z

## Evidence

- timestamp: 2026-08-19T14:20:00Z
  checked: node_modules/node-sass/vendor/linux-x64-137/binding.node
  found: 9 bytes, content is ASCII "Not Found" (hexdump: 4e6f 7420 466f 756e 64). Created 2026-08-19 14:06 — during the failed yarn install under Node 24.
  implication: The file is the GitHub 404 response body saved as the binding, not a truncated ELF binary.

- timestamp: 2026-08-19T14:20:00Z
  checked: node_modules/node-sass/vendor/linux-x64-115/binding.node
  found: 3,473,024 bytes, valid ELF 64-bit shared object (file(1) confirms), created 2026-08-19 09:52 — from the earlier successful install under Node 20.
  implication: Under Node 20 (ABI 115) the prebuilt binary exists and works. The problem is specific to ABI 137 (Node 24).

- timestamp: 2026-08-19T14:20:00Z
  checked: HTTP status of node-sass 9.0.0 release assets (curl -sI)
  found: https://github.com/sass/node-sass/releases/download/v9.0.0/linux-x64-137_binding.node → HTTP 404; linux-x64-115_binding.node → HTTP 302 (exists)
  implication: node-sass 9.0.0 ships no prebuilt binary for Node 24. Confirmed externally, not just inferred.

- timestamp: 2026-08-19T14:20:00Z
  checked: node_modules/node-sass/lib/extensions.js getHumanNodeVersion ABI table
  found: Table tops out at `case 115: return 'Node.js 20.x'`; ABI 137 falls to `default: return false`. isSupportedEnvironment() therefore returns false for Node 24.
  implication: node-sass 9.0.0 (released ~2023, before Node 24 existed) does not support Node 24. No node-sass version supports Node 24 — the project is EOL.

- timestamp: 2026-08-19T14:20:00Z
  checked: node_modules/node-sass/scripts/install.js download() function
  found: The `successful(response)` status check (lines 32-34) is defined but NEVER used. The promise chain `fetch(url).then(r => r.buffer()).then(buffer => fs.createWriteStream(dest).end(buffer))` writes the response body to disk regardless of HTTP status. A 404 body ("Not Found") is written as the binding file.
  implication: Latent defect in node-sass's installer: it poisons vendor/ with a 9-byte file instead of failing loudly. This masks the real problem and breaks every subsequent build.

- timestamp: 2026-08-19T14:20:00Z
  checked: node_modules/node-sass/scripts/build.js testBinary() + lib/extensions.js hasBinary()
  found: hasBinary() = fs.existsSync (existence only, no size/ELF validation). postinstall testBinary() finds the 9-byte file "exists", tries require → fails → falls back to node-gyp source build → crashes with ModuleNotFoundError: distutils (G-02-1). The poisoned file is left in place.
  implication: The truncated binding survives the failed install and is what the build later loads.

- timestamp: 2026-08-19T14:20:00Z
  checked: Node environment (~/.nvm/versions/node/, node --version)
  found: nvm has v20.20.2, v24.18.0, v24.19.0 installed. v24.19.0 was installed today 14:02 (right before the failed install at 14:06). The active shell Node is v24.19.0. .nvmrc pins `20`.
  implication: The user's default Node is 24, not the .nvmrc-pinned 20. .nvmrc only takes effect via `nvm use` (or automatically on Netlify). Phase 02 commit 7c635bd shows the author ran `nvm use 20 && yarn install && yarn build && yarn test all green` — under Node 20 everything works. The UAT run happened under Node 24.

- timestamp: 2026-08-19T14:20:00Z
  checked: package.json, yarn.lock, gatsby-plugin-sass package.json
  found: node-sass ^9.0.0 is a DIRECT dependency in package.json (resolved 9.0.0 in yarn.lock). gatsby-plugin-sass 6.15.0's peerDependency is `sass: ^1.30.0` (dart-sass) — node-sass is a legacy leftover from the starter template, not required by the plugin. sass-loader 10 uses node-sass when present.
  implication: The project pins a deprecated, EOL compiler. Phase 3 (Core Upgrade) already plans the dart-sass migration.

## Resolution

root_cause: "node-sass 9.0.0 has no prebuilt binary for Node 24 (ABI 137) — its install script wrote the GitHub 404 response body ('Not Found', 9 bytes) to node_modules/node-sass/vendor/linux-x64-137/binding.node without checking HTTP status; the build then loads that truncated file and fails with 'file too short'. Contributing conditions (AND-gate): (1) environment runs Node v24.19.0 instead of the .nvmrc-pinned Node 20; (2) node-sass 9.0.0 is EOL and supports at most Node 20 (ABI 115); (3) node-sass's install.js defect writes non-2xx response bodies to disk as the binding, leaving a poisoned file that masks the real incompatibility. G-02-1 (distutils crash) and G-02-2 (file too short) share this single root cause."

fix: "" # diagnose-only mode — no fix applied
verification: "" # diagnose-only mode
files_changed: []
