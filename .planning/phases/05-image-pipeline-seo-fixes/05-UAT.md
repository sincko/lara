---
status: testing
phase: 05-image-pipeline-seo-fixes
source: [05-VERIFICATION.md]
started: 2026-08-20T12:06:44+02:00
updated: 2026-08-20T12:06:44+02:00
---

## Current Test

number: 1
name: Final visual pass on the 4 fixed surfaces
expected: |
  Banner fills the 50vh area (no gap under landscape, no bottom clip on portrait);
  /blog pagination pills visible (white pills, dark text, active pill highlighted);
  /privacy external links open in new tab; /privacy headings in Ubuntu text font
awaiting: user response

## Tests

### 1. Final visual pass on the 4 fixed surfaces
expected: |
  - /farfalla-blu (landscape): image fills the 50vh banner, centered under the header, no white gap
  - /autunno (portrait): top of photo fully visible, no bottom clipping
  - /blog: pagination pills clearly visible (white pills with dark text, active page highlighted), Precedente/Successivo present
  - /privacy: all 8 external links open in a new tab (target=_blank); h1-h4 headings render in the Ubuntu text font (not Parisienne)
  - / and /blog cards: crop identical to legacy (centered, not saliency-shifted)
result: [pending]

2. Disposition of 3 code-review warnings (05-REVIEW.md)
expected: owner decides scope for each: WR-01 stray © in .home-posts (pre-existing); WR-02 broken mobile pagination media query (pre-existing, adjacent to this phase's pagination work); WR-03 English month names in post dates (MMMM DD, YYYY) on a lang=it site
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
