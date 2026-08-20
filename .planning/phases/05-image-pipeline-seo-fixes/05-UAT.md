---
status: testing
phase: 05-image-pipeline-seo-fixes
source: [05-VERIFICATION.md]
started: 2026-08-20T12:06:44+02:00
updated: 2026-08-20T12:24:00+02:00
---

## Current Test

number: 2
name: Disposition of 3 code-review warnings (05-REVIEW.md)
expected: |
  owner decides scope for each: WR-01 stray © in .home-posts (pre-existing); WR-02 broken mobile pagination media query (pre-existing, adjacent to this phase's pagination work); WR-03 English month names in post dates (MMMM DD, YYYY) on a lang=it site
awaiting: user response

## Tests

### 1. Final visual pass on the 4 fixed surfaces
expected: |
  - /farfalla-blu (landscape): image fills the 50vh banner, centered under the header, no white gap
  - /autunno (portrait): top of photo fully visible, no bottom clipping
  - /blog: pagination pills clearly visible (white pills with dark text, active page highlighted), Precedente/Successivo present
  - /privacy: all 8 external links open in a new tab (target=_blank); h1-h4 headings render in the Ubuntu text font (not Parisienne)
  - / and /blog cards: crop identical to legacy (centered, not saliency-shifted)
result: issue
reported: "The following links don't open in target=_blank https://policies.google.com/privacy https://www.cookiechoices.org/ http://www.garanteprivacy.it/cookie; in the blog list the images have a gap below, blog pagination is ok"
severity: major

### 2. Disposition of 3 code-review warnings (05-REVIEW.md)
expected: owner decides scope for each: WR-01 stray © in .home-posts (pre-existing); WR-02 broken mobile pagination media query (pre-existing, adjacent to this phase's pagination work); WR-03 English month names in post dates (MMMM DD, YYYY) on a lang=it site
result: [pending]

## Summary

total: 2
passed: 0
issues: 1
pending: 1
skipped: 0
blocked: 0

## Gaps

- gap_id: G-05-1a
  truth: "All 8 external privacy links open in a new tab (target=_blank)"
  status: failed
  reason: "User reported: https://policies.google.com/privacy, https://www.cookiechoices.org/, http://www.garanteprivacy.it/cookie don't open in target=_blank"
  severity: major
  test: 1
  root_cause: "remark-gfm autolink: bare URL text between raw <a> tags is auto-wrapped in a nested <a href> WITHOUT target/_blank — the 3 links whose link text is a bare URL (policies.google.com, cookiechoices.org, garanteprivacy.it) render as <a target=_blank><a href=url>url</a></a>, and browsers honor the inner anchor (no target). The 5 named-text links (Firefox, Chrome, IE, Safari, Opera) are unaffected."
  artifacts:
    - path: "src/content/pages/privacy.md"
      issue: "lines 67-69: raw <a> blocks with bare URL as text — GFM autolink nests an inner <a> without target"
  missing:
    - "Wrap the URL text in a <span> inside the raw <a> tags (e.g. <a href=\"...\" target=\"_blank\" rel=\"noopener noreferrer\"><span>https://...</span></a>) — verified: remark parse then produces a single <a> node with target; the <span> breaks the autolink match"
  debug_session: ""

- gap_id: G-05-1b
  truth: "Blog-list card images have no gap below the image"
  status: failed
  reason: "User reported: in the blog list the images have a gap below"
  severity: cosmetic
  test: 1
  root_cause: "gatsby-plugin-image's .gatsby-image-wrapper-constrained sets display: inline-block (plugin CSS) — inside the card the inline-block wrapper leaves a descender gap below the image. The blog-post banner got display:block in the delta fix but .post-card .featured-image did not."
  artifacts:
    - path: "src/assets/scss/style.scss"
      issue: ".post-card .featured-image lacks display:block — plugin CSS makes it inline-block"
  missing:
    - "Add display:block to .post-card .featured-image (same pattern as the banner fix)"
  debug_session: ""
