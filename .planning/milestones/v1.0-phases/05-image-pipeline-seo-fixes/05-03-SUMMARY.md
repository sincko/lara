---
phase: 05-image-pipeline-seo-fixes
plan: 03
subsystem: seo
tags: [seo, react-helmet, lang, hreflang, italian-copy, markdown, privacy, pagination]

# Dependency graph
requires:
  - phase: 05-image-pipeline-seo-fixes
    provides: 05-01 + 05-02 — gatsby-plugin-image 3.16.0 migration complete, blog-list.js query already swapped (this plan only touches copy), blog-list.test.js dead gatsby-image mock already removed
provides:
  - SEOS-01 complete: <html lang="it"> on every page, zero hreflang alternates in source and built output
  - SEOS-02 complete: Italian blog-list meta (Blog / Blog — Pagina N), Precedente/Successivo labels, Pagina non trovata/Grazie titles, zero English starter copy in rendered source
  - SEOS-03 complete: privacy page rebuilt as clean markdown — 8 links preserved, H4 fixed, email deobfuscated, Italian title
  - IMAG-03 belt complete: Seo string-only image guard (imageUrl typeof-string) — [object Object] cannot recur
affects: [05-04, phase 6 performance verification, /gsd-verify-work phase 5]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seo image prop belt-and-suspenders: const imageUrl = typeof image === \"string\" && image.length > 0 ? image : null; image: `${siteUrl}${imageUrl || defaultImage}`"
    - "Pagination-aware Italian meta: title {currentPage === 1 ? \"Blog\" : `Blog — Pagina ${currentPage}`}, description template + (currentPage > 1 ? ` Pagina ${currentPage}` : \"\")"
    - "Test co-change discipline: behavior change and asserting test change land in ONE commit (Phase 4 precedent)"

key-files:
  created: []
  modified:
    - src/components/seo.js
    - src/templates/blog-list.js
    - src/templates/blog-list.test.js
    - src/pages/404.js
    - src/pages/thanks.js
    - src/content/pages/privacy.md

key-decisions:
  - "lang=\"it\" replaces en-US; all three redundant hreflang alternates (it-it/it/x-default) deleted — no alternates remain (D-13/D-14)"
  - "imageUrl typeof-string guard feeds seo.image with defaultImage fallback (/assets/heart.png) — non-string/empty image props cannot stringify to [object Object] (D-11)"
  - "Blog-list meta uses the UI-SPEC Copywriting Contract strings verbatim: Blog / Blog — Pagina N title, Italian description sentence + Pagina N suffix (D-15)"
  - "Pagination labels Precedente/Successivo with rel=prev/rel=next preserved; six test assertions co-changed in the same commit (D-16)"
  - "privacy.md rebuilt as clean markdown: frontmatter title Privacy e Cookie, 8 links preserved with exact link text, leading-space #### fixed, email deobfuscated (D-19)"

patterns-established:
  - "Italian copy conventions: zero English in rendered meta/UI; only named strings change, all surrounding markup byte-identical"
  - "Stale hashed JS chunks in public/ from prior builds must be cleared with yarn clean before rendered-source greps (Gatsby does not delete old chunks on rebuild)"

requirements-completed: [IMAG-03, SEOS-01, SEOS-02, SEOS-03]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "seo.js hardened: <html lang=\"it\" />, all three hreflang <link rel=\"alternate\"> tags deleted, imageUrl typeof-string guard wired into seo.image with defaultImage fallback — every page renders lang=it, zero rel=alternate in source or built output, zero [object Object] site-wide"
    requirement: SEOS-01
    verification:
      - kind: unit
        ref: "grep src/components/seo.js (lang=\"it\", no hrefLang, imageUrl guard, imageUrl || defaultImage interpolation)"
        status: pass
      - kind: other
        ref: "yarn build exit 0; grep public/index.html (html lang=\"it\", rel=alternate count 0); grep -c \"object Object\" public/*/index.html → 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "blog-list Italian meta + pagination labels: title Blog / Blog — Pagina N, description \"I post del blog di LaryArt: decoupage, oggetti d'arte e creazioni fatti a mano.\" (+ Pagina N), labels Precedente/Successivo with rel attrs; six test assertions co-changed in the same commit; dead gatsby-image references gone from the test file"
    requirement: SEOS-02
    verification:
      - kind: unit
        ref: "grep src/templates/blog-list.js (Precedente, Successivo, Blog — Pagina ${currentPage}, Italian description, no Stackrole, no Page X of Y); grep src/templates/blog-list.test.js (queryByText(\"Precedente\"), getByText(\"Successivo\"), no Previous/Next, no gatsby-image)"
        status: pass
      - kind: unit
        ref: "yarn test src/templates/blog-list.test.js — 3 tests pass"
        status: pass
      - kind: other
        ref: "yarn clean && yarn build; grep public/blog/index.html + public/blog/2/index.html (titles Blog / Blog — Pagina 2, Precedente/Successivo labels, Stackrole count 0, Blog — Page count 0)"
        status: pass
    human_judgment: false
  - id: D3
    description: "404 and thanks pages render Italian SEO titles: Pagina non trovata / Grazie in source and built HTML; no English title strings remain; no image prop added (D-12); visible h1/body copy untouched"
    requirement: SEOS-02
    verification:
      - kind: unit
        ref: "grep src/pages/404.js + src/pages/thanks.js (Pagina non trovata, Grazie, no Page not found/Thank you)"
        status: pass
      - kind: other
        ref: "yarn build exit 0; grep public/404/index.html + public/thanks/index.html (titles rendered, no English)"
        status: pass
    human_judgment: false
  - id: D4
    description: "privacy.md rebuilt as clean markdown: frontmatter title Privacy e Cookie, raw <a>/<p> HTML blocks converted to 8 markdown links with exact link text preserved (Firefox, Chrome, Internet Explorer, Safari, Opera, Google, cookiechoices, Garante), leading-space #### heading fixed to valid H4, email deobfuscated to s.foschi@protonmail.com — rendered HTML has balanced p tags, zero chiocciola, Italian title"
    requirement: SEOS-03
    verification:
      - kind: unit
        ref: "grep src/content/pages/privacy.md (no <a / no <p>, ^#### Attiva, s.foschi@protonmail.com, no Privacy Policy, all 8 hrefs present)"
        status: pass
      - kind: other
        ref: "yarn build exit 0; grep public/privacy/index.html (chiocciola count 0, title Privacy e Cookie, p-tag balance 20/20 via python walker)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Held-out visual check on /privacy after build — rebuilt markdown renders as valid HTML (catches dangling HTML, heading-as-text, orphan links)"
    verification: []
    human_judgment: true
    rationale: "UI-SPEC backstop E6 — a human visual judgment on the rendered /privacy page; automation verified tag balance and title but cannot judge visual rendering quality"

# Metrics
duration: 14 min
completed: 2026-08-20
status: complete
---

# Phase 05 Plan 03: SEO Wave — Italian Meta, lang/hreflang, Seo Guard, Privacy Rebuild Summary

**Every page now renders `<html lang="it">` with zero hreflang alternates; blog-list carries the Italian Copywriting Contract meta (Blog / Blog — Pagina N) and Precedente/Successivo labels with co-changed tests; 404/thanks titles are Italian; the Seo image prop is string-guarded against [object Object]; and the malformed privacy page is clean markdown with all 8 links preserved — SEOS-01/02/03 and the IMAG-03 belt complete.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-08-20T08:20:00Z
- **Completed:** 2026-08-20T08:34:21Z
- **Tasks:** 4
- **Files modified:** 6

## Accomplishments

- **seo.js hardened (SEOS-01 + IMAG-03 belt):** `<html lang="en-US" />` → `<html lang="it" />`; all three redundant `<link rel="alternate">` hreflang tags (it-it/it/x-default) deleted; `const imageUrl = typeof image === "string" && image.length > 0 ? image : null` guard feeds `image: \`${siteUrl}${imageUrl || defaultImage}\`` — a non-string/empty image prop now falls back to `/assets/heart.png` (site.json) instead of stringifying to `[object Object]`. Built output confirms `lang="it"` on every page and zero `rel="alternate"` anywhere.
- **Italian blog-list meta + labels (SEOS-02, D-15/D-16):** title `Blog` (page 1) / `Blog — Pagina ${currentPage}` (page ≥ 2); description `I post del blog di LaryArt: decoupage, oggetti d'arte e creazioni fatti a mano.` + ` Pagina N` suffix; pagination labels `Precedente` (rel=prev) / `Successivo` (rel=next) with icon spans and `{" "}` spacing byte-identical. The six test assertions co-changed in the same commit (test-update discipline) and the stale gatsby-image comment updated — targeted suite green.
- **404/thanks Italian titles (SEOS-02, D-17):** `Pagina non trovata` / `Grazie` — one-line swaps, no image prop added (D-12), visible h1/body copy untouched. Rendered titles confirmed in built HTML.
- **privacy.md clean-markdown rebuild (SEOS-03, D-19):** frontmatter `title: Privacy Policy` → `Privacy e Cookie` (kills the English title leak into `<title>`/h1/meta); the raw-HTML `<a>`/`<p>` block converted to five markdown paragraphs and the trailing raw `<a>` blocks to three markdown links — all 8 links preserved with exact link text (Firefox, Chrome, Internet Explorer, Safari, Opera, Google, cookiechoices, Garante); the leading-space ` ####` heading fixed to a valid H4; email deobfuscated to `s.foschi@protonmail.com`. Rendered HTML: balanced p tags (20/20), zero `chiocciola`, `<title>Privacy e Cookie</title>`.
- **Full verification green:** `yarn clean && yarn build` exit 0; full jest suite 10 suites / 85 tests pass; zero `Stackrole base blog page` / `Blog — Page` / `[object Object]` in a pristine `public/`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Harden seo.js: lang="it", remove hreflang, imageUrl string guard (SEOS-01, IMAG-03 D-11/D-13/D-14)** - `cbca781` (feat)
2. **Task 2: Italian blog-list meta + pagination labels + test co-change (SEOS-02, D-15/D-16)** - `15e5e68` (feat)
3. **Task 3: Translate 404/thanks titles (SEOS-02, D-17)** - `be68a82` (feat)
4. **Task 4: Rebuild privacy.md as clean markdown (SEOS-03, D-19; title SEOS-02)** - `0c82f86` (feat)

**Plan metadata:** pending (docs: complete plan — commit containing SUMMARY.md)

## Files Created/Modified

- `src/components/seo.js` - `lang="it"` on `<html>`; three hreflang `<link rel="alternate">` entries deleted; `imageUrl` typeof-string guard feeding `seo.image` with defaultImage fallback
- `src/templates/blog-list.js` - Italian Seo block (Blog / Blog — Pagina N title, Italian description + Pagina N suffix); Precedente/Successivo labels with rel attrs preserved
- `src/templates/blog-list.test.js` - six assertions re-labeled to Precedente/Successivo; stale gatsby-image comment updated (dead mock already removed in 05-02)
- `src/pages/404.js` - `<Seo title="Pagina non trovata" />`
- `src/pages/thanks.js` - `<Seo title="Grazie" />`
- `src/content/pages/privacy.md` - frontmatter `title: Privacy e Cookie`; raw-HTML blocks → 8 markdown links; `####` H4 fixed; email deobfuscated

## Decisions Made

- **String-only image contract enforced at the component boundary (D-11):** the guard lives in seo.js (not just at call sites) so any future misuse — object, undefined, empty string — silently falls back to defaultImage. This is the belt behind 05-01's getSrc call-site fix.
- **UI-SPEC Copywriting Contract strings used verbatim** for the blog-list title/description and pagination labels — no agent-discretion wording drift (D-15/D-16).
- **Test co-change in the same commit** (Phase 4 test-update discipline): the six assertion swaps and the source label swap land together, so the commit is atomically revertable (T-05-14 mitigated).
- **`yarn clean` before rendered-source greps:** stale hashed JS chunks from prior builds (component---src-templates-blog-list-js-*.js) still contained the old English strings; a clean rebuild is required for accurate `public/` greps. Documented as a pattern for the phase verifier.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stale hashed JS chunks in public/ tripped the SEOS-02 success-criteria greps**
- **Found during:** Plan-level verification (after Task 4)
- **Issue:** `grep -rl "Stackrole base blog page" public/` returned 6 files — all `component---src-templates-blog-list-js-*.js(.map)` chunks from previous builds. Gatsby does not delete old hashed chunks on rebuild, so the pre-existing English strings persisted in stale JS even though the rendered HTML pages were already clean.
- **Fix:** Ran `yarn clean && yarn build` to regenerate a pristine `public/` — after which all success-criteria greps pass (Stackrole 0, Blog — Page 0, [object Object] 0).
- **Files modified:** none (build artifact hygiene only)
- **Verification:** all plan-level greps re-run on the clean build — SEOS-01/02/03 and IMAG-03 belt all pass
- **Committed in:** n/a (no source change; documented as a pattern for the phase verifier)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for the plan's own success-criteria greps to be meaningful. No source change, no scope creep — the fix is build hygiene that the phase verifier should replicate.

## Issues Encountered

- **`</p>` vs `<p>` grep count appeared imbalanced (20 vs 19)** on `public/privacy/index.html` — the naive `grep -o '<p>'` misses `<p ` with attributes. A python tag-walker confirmed 20 opens / 20 closes with zero unmatched; the rendered HTML is balanced. No fix needed.
- **Pagination label counts on /blog:** page 1 renders only `Successivo` (isFirst guard suppresses Precedente) and page 2 renders both — correct existing behavior, verified in built HTML.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SEOS-01 complete: `lang="it"` + zero hreflang verified in source and built output
- SEOS-02 complete: Italian blog-list meta, Precedente/Successivo labels, Pagina non trovata/Grazie titles; zero English starter copy in a clean `public/`
- SEOS-03 complete: privacy page renders valid HTML from clean markdown; held-out visual check on /privacy remains for the phase verifier (coverage D5)
- IMAG-03 belt complete: Seo string guard prevents any future [object Object] across all pages
- 05-04 can proceed; phase-level verifier should run `yarn clean && yarn build` before rendered-source greps

---
*Phase: 05-image-pipeline-seo-fixes*
*Completed: 2026-08-20*

## Self-Check: PASSED

- SUMMARY.md exists at `.planning/phases/05-image-pipeline-seo-fixes/05-03-SUMMARY.md`
- All commits present: `cbca781` (Task 1), `15e5e68` (Task 2), `be68a82` (Task 3), `0c82f86` (Task 4)
- All six modified source files exist: seo.js, blog-list.js, blog-list.test.js, 404.js, thanks.js, privacy.md
- Final verification re-run: `yarn clean && yarn build` exit 0; full jest suite 10 suites / 85 tests pass; zero Stackrole / Blog — Page / [object Object] / rel=alternate / chiocciola in pristine `public/`; `<html lang="it">` on every page
