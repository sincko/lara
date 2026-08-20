---
status: testing
phase: 06-performance-asset-cleanup-final-verification
source: [06-VERIFICATION.md]
started: 2026-08-21T00:49:21+02:00
updated: 2026-08-21T00:49:21+02:00
---

## Current Test

number: 1
name: Visual pass over the live site after Phase 6
expected: |
  /, /blog/, /minnie/ render without broken images (UI-SPEC E4 backstop);
  fonts render with swap (no FOIT); tab icon = favicon-32x32.png
awaiting: user response

## Tests

### 1. Visual pass over the live site after Phase 6
expected: |
  - https://laryart.it/ — hero and 6 home cards render; no broken images
  - https://laryart.it/blog/ — 9 post cards render; pagination pills visible
  - https://laryart.it/minnie/ — featured image renders; banner fills correctly
  - Fonts render as before (Ubuntu + Parisienne) — no invisible text while loading (font-display: swap)
  - Browser tab shows the favicon (favicon-32x32.png)
result: [pending]

### 2. Latent script warnings disposition (06-REVIEW.md)
expected: owner decides: WR-01 (process.exit stdout race in check-unreferenced.js) and WR-02 (GREP_ROOTS blind spot: gatsby-browser.js/gatsby-ssr.js/gatsby-node.js/netlify.toml) — fix now or defer
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
