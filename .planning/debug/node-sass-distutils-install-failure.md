---
status: diagnosed
trigger: "G-02-1: yarn install fails locally — node-sass native build via node-gyp crashes with ModuleNotFoundError: No module named 'distutils' while running Node v24.19.0"
created: 2026-08-19T12:00:00Z
updated: 2026-08-19T12:20:00Z
---

## Current Focus

hypothesis: CONFIRMED — node-sass 9.0.0 has no prebuilt binary for Node 24 (ABI 137), so install falls back to node-gyp 8.4.1 source build whose bundled gyp imports distutils (removed in Python 3.12+). Triggered because the shell ran Node v24.19.0 (nvm default lts/\*) instead of the .nvmrc-pinned Node 20.
test: complete — all evidence gathered
expecting: n/a
next_action: return structured diagnosis (goal: find_root_cause_only)

## Symptoms

expected: `yarn install` completes successfully; node-sass native binding builds (or a prebuilt binary is used) so the project installs cleanly
actual: node-gyp configure fails: `File "/home/simos/progs/lara/node_modules/node-gyp/gyp/pylib/gyp/input.py", line 19, in <module> from distutils.version import StrictVersion` → `ModuleNotFoundError: No module named 'distutils'` → `gyp ERR! configure error`, exit code 1
errors: |
gyp verb get node dir target node version installed: 24.19.0
gyp verb build dir attempting to create "build" dir: /home/simos/progs/lara/node_modules/node-sass/build
Traceback (most recent call last):
File "/home/simos/progs/lara/node_modules/node-gyp/gyp/gyp_main.py", line 42, in <module>
import gyp # noqa: E402
File "/home/simos/progs/lara/node_modules/node-gyp/gyp/pylib/gyp/**init**.py", line 9, in <module>
import gyp.input
File "/home/simos/progs/lara/node_modules/node-gyp/gyp/pylib/gyp/input.py", line 19, in <module>
from distutils.version import StrictVersion
ModuleNotFoundError: No module named 'distutils'
gyp ERR! configure error
gyp ERR! stack Error: `gyp` failed with exit code: 1
gyp ERR! System Linux 7.1.8-200.fc44.x86_64
gyp ERR! command "/home/simos/.nvm/versions/node/v24.19.0/bin/node" "/home/simos/progs/lara/node_modules/node-gyp/bin/node-gyp.js" "rebuild" "--verbose" "--libsass_ext=" "--libsass_cflags=" "--libsass_ldflags=" "--libsass_library="
gyp ERR! cwd /home/simos/progs/lara/node_modules/node-sass
gyp ERR! node -v v24.19.0
reproduction: Run `yarn install` in /home/simos/progs/lara with Node v24.19.0 (nvm) on Fedora 44 (Python 3.12+ without distutils)
started: Discovered during UAT of Phase 02 (foundation-cleanup). Phase 02 removed package-lock.json, switched netlify.toml to `yarn build`, and removed unused deps. The project is a Gatsby 5.15 site that still depends on node-sass (deprecated, EOL). Phase 3 of the roadmap is "Core Upgrade" which plans to move to dart-sass.

## Eliminated

- hypothesis: Phase 02 introduced node-sass or changed its version
  evidence: node-sass ^9.0.0 predates Phase 02 (commit c39c0e9 "upgraded node-sass"); Phase 02 commits only removed deps and lockfile; each Phase 02 commit message records `nvm use 20 && yarn install && yarn build && yarn test` all green
  timestamp: 2026-08-19T12:10:00Z

- hypothesis: .nvmrc pins a Node version incompatible with node-sass
  evidence: .nvmrc = "20" (set in commit 4c35cb0, Aug 2024); node-sass 9.0.0 ships a prebuilt linux-x64-115 (Node 20 ABI) binary — verified present on GitHub releases (HTTP 302) and already downloaded locally (3.4MB binding.node, timestamped 09:52 today)
  timestamp: 2026-08-19T12:15:00Z

- hypothesis: distutils error is the primary failure (Python environment broken)
  evidence: distutils import fails because Python 3.14.7 (Fedora 44) removed distutils in 3.12 — but node-gyp only runs because the prebuilt-binary download for ABI 137 failed first. Under Node 20 the install never touches node-gyp (prebuilt binary exists). distutils is a secondary symptom of the Node-24 fallback path.
  timestamp: 2026-08-19T12:18:00Z

## Evidence

- timestamp: 2026-08-19T12:05:00Z
  checked: package.json + yarn.lock
  found: package.json:47 declares `"node-sass": "^9.0.0"` (direct dep, alongside gatsby-plugin-sass 6.15.0); yarn.lock resolves node-sass to exactly 9.0.0
  implication: node-sass 9.0.0 is the installed version; its support matrix ends at Node 20 (ABI 115)

- timestamp: 2026-08-19T12:05:00Z
  checked: .nvmrc + git history
  found: .nvmrc = "20" (set Aug 2024, commit 4c35cb0). Phase 02 commit 7c635bd removed `NODE_VERSION = "10"` from netlify.toml making .nvmrc the sole Node source; commit 260f9fd switched netlify command to `yarn build`
  implication: Project intent is Node 20 everywhere; Phase 02 changes are consistent with that intent

- timestamp: 2026-08-19T12:06:00Z
  checked: active node version + nvm config
  found: shell runs Node v24.19.0 (nvm). `~/.nvm/alias/default` = `lts/*` → resolves to Node 24. No avn/direnv/nvm auto-use hooks in .bashrc/.profile — nothing auto-switches to .nvmrc. nvm has v20.20.2, v24.18.0, v24.19.0 installed
  implication: The user's shell defaults to Node 24; `yarn install` ran under Node 24, not the pinned Node 20

- timestamp: 2026-08-19T12:08:00Z
  checked: node-sass ABI support (node_modules/node-sass/lib/extensions.js getHumanNodeVersion)
  found: ABI map ends at `case 115: return 'Node.js 20.x'` with `default: return false` — ABI 137 (Node 24) is unrecognized. Binary name is `linux-x64-{process.versions.modules}_binding.node` → `linux-x64-137_binding.node` under Node 24
  implication: node-sass 9.0.0 has no concept of Node 24; it will attempt to download a binary that was never published

- timestamp: 2026-08-19T12:12:00Z
  checked: GitHub releases for node-sass v9.0.0 prebuilt binaries (curl -sI)
  found: `linux-x64-115_binding.node` → HTTP 302 (exists); `linux-x64-137_binding.node` → HTTP 404 (does not exist)
  implication: No prebuilt binary for Node 24 ABI — install.js download fails and falls back to node-gyp source build

- timestamp: 2026-08-19T12:13:00Z
  checked: node_modules/node-sass/vendor/ contents
  found: `linux-x64-115/binding.node` = 3,473,024 bytes (valid, downloaded 09:52 today under Node 20); `linux-x64-137/binding.node` = 9 bytes containing literal text "Not Found" (the GitHub 404 response body saved by install.js's download handler, which writes the response buffer to dest without checking status)
  implication: Explains G-02-2's "binding.node: file too short" — the 9-byte "Not Found" file is not a valid ELF binary; gatsby build's require() of it fails. Also proves the download path was exercised under Node 24 and failed

- timestamp: 2026-08-19T12:14:00Z
  checked: node-gyp version + Python environment
  found: node-sass 9.0.0 depends on node-gyp ^8.4.1 (installed 8.4.1). System Python is 3.14.7 (Fedora 44); `import distutils` fails (removed in Python 3.12). node-gyp 8.4.1's bundled gyp (gyp/pylib/gyp/input.py:19) does `from distutils.version import StrictVersion`
  implication: The source-build fallback path is broken on this system: node-gyp 8.4.1 predates the distutils removal and has no setuptools fallback

- timestamp: 2026-08-19T12:16:00Z
  checked: Phase 02 commit verification claims
  found: Commits 260f9fd and 7c635bd both record `nvm use 20 && yarn install && yarn build && yarn test` all green
  implication: Under Node 20 the install works (prebuilt binary downloads); the failure is specific to running under Node 24

## Resolution

root_cause: "yarn install was run under Node v24.19.0 (nvm default alias lts/\* → Node 24; no shell auto-switch to .nvmrc), but node-sass 9.0.0 has no prebuilt binary for Node 24's ABI 137 (verified HTTP 404 on GitHub releases v9.0.0), so its install script fell back to a node-gyp 8.4.1 source build whose bundled gyp imports distutils — removed in Python 3.12+ (system has Python 3.14.7) — crashing configure with ModuleNotFoundError; the project pins Node 20 in .nvmrc, under which node-sass 9.0.0's prebuilt linux-x64-115 binary exists and installs cleanly (as Phase 02 commits verified)"
fix: "[diagnose-only] Immediate unblock: run `nvm use 20` before `yarn install` (delete the corrupt 9-byte vendor/linux-x64-137/binding.node first). Durable fix: Phase 3 Core Upgrade replaces node-sass with dart-sass (sass + gatsby-plugin-sass implementation option) — node-sass is EOL and will never support Node 24"
verification: "[diagnose-only] Evidence chain complete: ABI map, GitHub 404/302, corrupt binding.node, nvm default alias, Python 3.14 distutils absence"
files_changed: []
