# Phase 5: Image Pipeline + SEO Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 5-Image Pipeline + SEO Fixes
**Areas discussed:** gatsby-plugin-image migration, Placeholder strategy, og:image fix, Italian SEO, Privacy page cleanup
**Mode:** `--auto` (autonomous — recommended options auto-selected)

---

## gatsby-plugin-image Migration (IMAG-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Lockstep 5.16.0 (recommended) | gatsby-plugin-image at 5.16.0 per Phase 3 registry-verified matrix | ✓ |
| Latest (5.17+) | Deviates from the lockstep discipline | |

**User's choice:** Lockstep 5.16.0 (auto-selected)
**Notes:** All three Img/fluid consumers migrate (blog-post, index-page, post-card — post-card covers both list surfaces). Sizing and alt text carry over unchanged — no visual redesign. gatsby-image removed from package.json after migration.

## Placeholder Strategy (IMAG-02)

| Option | Description | Selected |
|--------|-------------|----------|
| BLURRED default + DOMINANT_COLOR hero (recommended) | BLURRED everywhere; DOMINANT_COLOR only on the index-page hero to keep LCP lean | ✓ |
| BLURRED everywhere | Uniform but heavier hero placeholder | |

**User's choice:** BLURRED default, DOMINANT_COLOR on index hero (auto-selected)
**Notes:** tracedSVG removed from gatsby-remark-images config (gatsby-config.js:50). Body-image path (remark) NOT migrated to gatsby-plugin-image in this phase.

## og:image Fix (IMAG-03)

| Option | Description | Selected |
|--------|-------------|----------|
| getSrc() + string-only guard (recommended) | blog-post resolves URL via getSrc() from gatsby-plugin-image; Seo ignores non-string image values | ✓ |
| Absolute /assets/ path passthrough | Use the raw frontmatter path (loses processed-URL guarantees) | |

**User's choice:** getSrc() + string-only guard in Seo (auto-selected)
**Notes:** Fixes `[object Object]` in og:image meta (CONCERNS.md §Known Bugs).

## Italian SEO (SEOS-01, SEOS-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Full Italian sweep (recommended) | lang="it", drop redundant hreflang, real Italian blog meta + pagination labels + 404/thanks titles | ✓ |
| Meta-only (SEOS-01/02 minimal) | lang + description only, leave UI labels in English | |

**User's choice:** Full Italian sweep (auto-selected)
**Notes:** blog-list.js:102-105 English starter meta replaced; "Previous"/"Next" → "Precedente"/"Successivo"; 404.js/thanks.js titles translated. Exact wording is the agent's discretion.

## Privacy Page Cleanup (SEOS-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Full markdown rebuild (recommended) | Convert embedded HTML block to clean markdown; fix broken headings/`</p>` fragments; preserve all links | ✓ |
| Minimal fragment fix | Patch only the broken HTML | |

**User's choice:** Full markdown rebuild (auto-selected)
**Notes:** Email obfuscation ("s.foschi [chiocciola] protonmail.com") addressed as part of the clean rewrite — exact handling at the agent's discretion.

---

## the agent's Discretion

- Exact Italian wording for blog-list meta description/title and pagination labels
- SCSS/className handling if GatsbyImage needs a wrapper for the featured-image layout
- Whether gatsby-remark-images quality adjusts alongside tracedSVG removal
- Exact gatsbyImageData arg naming (breakpoints vs srcSetBreakpoints) per current docs

## Deferred Ideas

- Body-image migration (markdown inline images) — future
- gatsby-plugin-netlify-cms-paths revisit (Phase 3 D-09)
- robots.txt — future phase
- Image CDN (Gatsby Cloud) — out of scope per REQUIREMENTS.md
