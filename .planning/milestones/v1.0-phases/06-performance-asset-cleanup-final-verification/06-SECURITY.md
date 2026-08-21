---
phase: 6
slug: performance-asset-cleanup-final-verification
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-21
---

# Phase 6 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| package.json → yarn.lock → node_modules | @fontsource packages cross here; a tampered package would ship to the build | code (npm registry) |
| layout.js imports → build output | self-hosted font CSS/woff2 crosses here; a wrong import path breaks the build | fonts (static assets) |
| check-unreferenced.js → static/assets/ | the destructive --delete run crosses here; a false negative deletes a referenced file | files (image assets) |
| static/ root → gatsby-plugin-manifest output | the legacy PWA deletion crosses here; a wrong glob deletes non-legacy files | icons/manifest |
| /favicon.ico requests → Netlify | the accepted 404 crosses here — legacy browsers silently ignore it | HTTP |
| live site → capture-baseline.js | the CWV capture crosses here; a pre-deploy run reports stale state as final | metrics (LCP/CLS) |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-06-01 | Tampering | package.json — @fontsource pinned wrong/non-exact version | high | mitigate | RESEARCH Package Legitimacy Audit (both OK, no postinstall); exact "5.3.0" greps in acceptance; yarn.lock is the resolution record | closed |
| T-06-02 | Tampering | SCSS-import path re-attempted → sass-loader "Can't find stylesheet to import" build break | high | mitigate | the task action pins the layout-entry path only; a broken build is an immediate red gate (verify blocks on `yarn build`) | closed |
| T-06-03 | Tampering | a Google-Fonts origin import reintroduced in SCSS/JS | medium | mitigate | zero-CSS-import grep on source (task 1) + zero-origin grep on the built output (task 2) | closed |
| T-06-04 | DoS | @font-face misconfiguration (missing swap) → invisible text under slow font load | low | mitigate | @fontsource ships swap in every face (D-04); the built-CSS swap count gate asserts it | closed |
| T-06-05 | Tampering | deletion script — a referenced file deleted (false negative in the grep) | critical | mitigate | script-computed list from the 5 grep roots (D-07); the trilly/trilli exact-basename rule (Pitfall 3); build + rendered-HTML grep for every kept path (D-10); git history restore path; UI-SPEC E4 backstop covers the residual risk with the human visual pass in 06-04 | closed |
| T-06-06 | Tampering | byte-identity gate misfires — all 8 pairs differ, a cmp gate would block the entire dedup or, worse, keep the wrong twin | medium | mitigate | the reference grep is the sole gate (research Pitfall 2); the kept file is untouched — no re-encode, no rename | closed |
| T-06-07 | Tampering | the .xcf sources deleted instead of moved (D-08 default is move) | low | mitigate | the task moves them with git mv BEFORE the script --delete run; acceptance asserts design/ files exist | closed |
| T-06-08 | DoS | deletion script run without --delete accidentally touching files | low | mitigate | read-only default is coded into the script contract (acceptance asserts dry-run leaves 61 files) | closed |
| T-06-09 | Tampering | gatsby-config.js manifest/offline options changed (D-12 contract broken) | medium | mitigate | zero-diff acceptance gate on gatsby-config.js; the continuity gate verifies the plugin output | closed |
| T-06-10 | DoS | legacy delete leaves an icon gap (a head tag references a deleted file) | high | mitigate | the head-link greps (rel=manifest/rel=icon/apple-touch) + icons/ listing prove the plugin generates everything; research verified zero gap from a real build | closed |
| T-06-11 | Info disclosure | wrong glob deletes files outside the legacy set (e.g. static/admin or assets) | high | mitigate | the exact git rm globs listed in the action; acceptance asserts only 27 deletions and that static/ shows only admin/ + assets/ | closed |
| T-06-12 | Tampering | capture runs against the pre-deploy site → stale numbers reported as final | critical | mitigate | the blocking manual checkpoint (D-16) gates the capture; the plan forbids the pre-deploy run; the checkpoint's deploy-confirm + curl 200 are the gate | closed |
| T-06-13 | Repudiation | fabricated/overlooked median in the comparison — claiming improvement without the print | high | mitigate | median.js stdout is the source (never hand-typed); the SUMMARY records the printed rows and the explicit per-metric verdict | closed |
| T-06-14 | Tampering | baseline-tooling.test.js hardcoded medians drift from the committed artifacts | medium | mitigate | the co-change is in the same commit as the capture artifacts (atomic); `yarn test` green gates it | closed |
| T-06-15 | Info disclosure | PSI_API_KEY leaked in logs/artifacts | medium | mitigate | the script never prints/logs the key (D-17, baseline-tooling.test.js asserts it); key passed via env only | closed |
| T-06-16 | DoS | capture interrupted → missing/partial runs, empty table | medium | mitigate | bounded-mode re-capture per slug; the commit happens only after the full capture completes | closed |
| T-06-SC | Tampering | npx-based lighthouse dependency fetch | low | mitigate | the pinned version lives in the existing script (D-17); no new dependencies installed | closed |

*Status: open · closed · open — below {block_on} threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-06-01 | T-06-10 (delta) | The legacy root `/favicon.ico` now returns 404 after the legacy PWA set deletion; browsers ignore it silently, and the modern `favicon-32x32.png` is linked in the head | owner | 2026-08-21 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-21 | 17 | 17 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-21
