---
phase: 05-image-pipeline-seo-fixes
verified: 2026-08-20T10:05:29Z
status: passed
score: 15/15 must-haves verified
behavior_unverified: 0
overrides_applied: 0
gaps: []
human_verification:

  - test: "Serve the built site (yarn serve or open public/ files) and visually confirm the four fixed surfaces: (1) a blog post with a LANDSCAPE featured image and one with a PORTRAIT image — banner fills the 50vh box (no white gap, no bottom clip, centered); (2) /blog pagination row (and /blog/2) — Precedente/Successivo/page numbers are readable white/dark pills on the pink background; (3) /privacy — all 8 external links open a new tab (target=_blank) and headings render in Ubuntu, not Parisienne; (4) / (index hero) and card thumbnails on / and /blog look correct at the 540x360 center crop."
    expected: "All four surfaces render at visual parity: banner filled and centered, pagination clearly visible, privacy links/headings as intended, hero/cards look as before."
    why_human: "Machine verification confirms the compiled CSS rules, rendered classes, and target=_blank attributes exist (grep + python tag checks), but cannot judge final visual appearance — 05-04-SUMMARY 'Next Phase Readiness' explicitly defers this final visual pass to the phase verifier. The held-out human checkpoint was resolved (user reported 4 deltas, all fixed and machine re-verified), but the fixed state itself has not been visually re-approved."

  - test: "Decide disposition of the 3 code-review warnings in 05-REVIEW.md: WR-01 stray '©' character at style.scss:220 silently breaks the .home-posts .grids rule (pre-existing, ships in production CSS); WR-02 malformed mobile pagination media query at style.scss:640-644 — 'padding: 50px 0 ul' produces garbage declarations, so multi-page mobile pagination renders as a cramped centered row (pre-existing, but interacts with this phase's SEOS-02 pagination work); WR-03 post dates render English month names ('August 15, 2024') via date(formatString: 'MMMM DD, YYYY') on a lang=it site — a visible i18n inconsistency on every post/list/home."
    expected: "Either accept as pre-existing/out-of-scope (fix in a later phase) or schedule fixes. The phase goal (Italian SEO meta + valid pages) is machine-verified complete regardless; these items do not block the goal."
    why_human: "The warnings are judgment calls about pre-existing defects and scope boundaries — an automated verifier cannot decide whether to fix them now or defer. WR-01/WR-02 predate this phase (c67d505); WR-03 affects visible body content, not the SEO meta that SEOS-02/SC4 target."
---

# Phase 5: Image Pipeline + SEO Fixes Verification Report

**Phase Goal:** Images render through gatsby-plugin-image with proper placeholders, and the site exposes correct Italian SEO meta and valid pages
**Verified:** 2026-08-20T10:05:29Z
**Status:** human_needed (all automated must-haves VERIFIED; final visual sign-off + review-warning disposition require human)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth   | Status     | Evidence       |
| --- | ------- | ---------- | -------------- |
| 1   | All five image surfaces (blog-post, index-page, blog-list, post-card, blog-list-home) render via gatsby-plugin-image with BLURRED/DOMINANT_COLOR placeholders; zero gatsby-image imports remain (SC1, IMAG-01) | ✓ VERIFIED | `src/templates/blog-post.js:3,56-57,81-91,131-136` — `import { GatsbyImage, getImage, getSrc } from "gatsby-plugin-image"`, `gatsbyImageData(layout: CONSTRAINED, quality: 80, breakpoints: [350,700,1050,1400], placeholder: BLURRED)`; `index-page.js:3,20-25,60-66` — `placeholder: DOMINANT_COLOR`, `loading="eager"`; `post-card.js:3,9-15`; `blog-list.js:27-34` + `blog-list-home.js:46-53` byte-identical card queries. `grep -rn "from \"gatsby-image\"" src/` → 0. Built output: `gatsby-image-wrapper` present in `public/`, `gatsby-image-outer-wrapper` count 0 |
| 2   | Sharing any page shows a real og:image URL; zero [object Object] in rendered HTML (SC2, IMAG-03) | ✓ VERIFIED | `grep -o 'property="og:image" content="[^"]*"' public/*/index.html` — post pages `https://laryart.it/static/<hash>/<file>.jpg` (e.g. `farfalla-blu`), pages without image fall back to `https://laryart.it/assets/heart.png`; `grep -c "object Object" public/*/index.html` → 0 site-wide |
| 3   | Page source shows `<html lang="it">` and zero hreflang alternates (SC3, SEOS-01) | ✓ VERIFIED | `public/index.html`: `<html lang="it">`; `grep -rl 'rel="alternate"' public/` → 0; `seo.js:31` `<html lang="it" />`, no hrefLang anywhere in source |
| 4   | Every page exposes real Italian meta; no hardcoded English starter text in rendered source (SC4, SEOS-02) | ✓ VERIFIED | `public/blog/index.html`: `<meta name="description" content="I post del blog di LaryArt: decoupage, oggetti d&#x27;arte e creazioni fatti a mano."/>`, title `Blog`; `/blog/2`: description + `Pagina 2`, title `Blog — Pagina 2`; `public/404/index.html` → `Pagina non trovata`; `public/thanks/index.html` → `Grazie`; `public/privacy/index.html` → `Privacy e Cookie`; `Stackrole base blog page` count 0; `Blog — Page` count 0; `Previous`/`Next` absent (rendered `Precedente`/`Successivo` on /blog and /blog/2) |
| 5   | Privacy page renders as valid, clean content — no malformed HTML or broken fragments (SC5, SEOS-03) | ✓ VERIFIED | `privacy.md`: frontmatter `title: Privacy e Cookie`, `#### Attiva l'opzione Do Not Track` heading fixed, `s.foschi@protonmail.com` deobfuscated; rendered `public/privacy/index.html`: p tags 20 opens / 20 closes balanced (python tag walker), `chiocciola` count 0, all 8 external links present with `target="_blank" rel="noopener noreferrer"` (verified per-href in rendered HTML), `class="wrapper privacy-content"` present |
| 6   | gatsby-plugin-image installed at exact pin 3.16.0; SSR-registered in gatsby-config; tracedSVG removed; remark options otherwise verbatim (IMAG-01/02, D-01-corrected/D-06/D-08) | ✓ VERIFIED | `package.json:32` `"gatsby-plugin-image": "3.16.0"` (no caret; `grep "5.16.0"` fails); `gatsby-config.js:38` `"gatsby-plugin-image"` string entry; no `tracedSVG` anywhere in gatsby-config.js; `maxWidth: 1024, showCaptions: true, linkImagesToOriginal: false, loading: "lazy"` verbatim |
| 7   | blog-post query uses the research-verified gatsbyImageData arg shape; renders GatsbyImage with preserved guard; og:image resolved via getSrc → URL string only (D-02/D-03/D-04/D-10) | ✓ VERIFIED | `blog-post.js:131-136` `gatsbyImageData(layout: CONSTRAINED, quality: 80, breakpoints: [350, 700, 1050, 1400], placeholder: BLURRED)` (no srcSetBreakpoints, no maxWidth); `:57` `const imageSrc = getSrc(...)`; `:72` `image={imageSrc}`; `:81-91` `Image ? <GatsbyImage ...> : ""` guard preserved with objectFit/objectPosition/className/alt |
| 8   | Index hero is the only DOMINANT_COLOR and only eager surface (D-03/D-07) | ✓ VERIFIED | `grep -rn 'loading="eager"' src/` → only `index-page.js:65`; `grep -rn 'placeholder: DOMINANT_COLOR' src/` → only `index-page.js:24`; built `public/index.html` contains `data-placeholder-image` ×2 (dominant-color bg `#f8a8a8`) |
| 9   | Card queries byte-identical in both lists with transformOptions center-crop override (IMAG-01, D-03, T-05-06) | ✓ VERIFIED | `blog-list.js:27-34` and `blog-list-home.js:46-53` — identical `layout: CONSTRAINED, width: 540, height: 360, quality: 80, transformOptions: { fit: COVER, cropFocus: CENTER }, placeholder: BLURRED`; `grep maxWidth\|maxHeight src/` → 0; built cards render `object-fit:cover;object-position:50% 50%` |
| 10  | gatsby-image removed from package.json and yarn.lock after all consumers migrated (D-05) | ✓ VERIFIED | `grep -q '"gatsby-image"' package.json` fails; `grep -c "gatsby-image@" yarn.lock` → 0; `grep -rn 'from "gatsby-image"' src/` → 0 |
| 11  | Seo image prop is string-only with belt-and-suspenders guard; non-string/empty falls back to defaultImage (IMAG-03 belt, D-11) | ✓ VERIFIED | `seo.js:20` `const imageUrl = typeof image === "string" && image.length > 0 ? image : null`; `:25` `image: \`${siteUrl}${imageUrl || defaultImage}\``; propTypes `image: PropTypes.string`; built pages without featured images show `og:image content="https://laryart.it/assets/heart.png"` |
| 12  | Pagination renders Italian Precedente/Successivo with rel attrs; tests co-changed in the same commit (SEOS-02, D-16) | ✓ VERIFIED | `blog-list.js:52,69` `Precedente` (rel="prev") / `Successivo` (rel="next"); `blog-list.test.js` — six assertions on `queryByText("Precedente")`/`getByText("Successivo")` with href/class assertions preserved, no `Previous`/`Next`/`gatsby-image`; `yarn test` → 10 suites / 85 tests pass; rendered /blog shows `Successivo` only (isFirst), /blog/2 shows both |
| 13  | 404 and thanks pages render Italian SEO titles (SEOS-02, D-17) | ✓ VERIFIED | `404.js:10` `<Seo title="Pagina non trovata" />`; `thanks.js:10` `<Seo title="Grazie" />`; rendered titles confirmed in `public/404/index.html` and `public/thanks/index.html`; no "Page not found"/"Thank you" |
| 14  | Privacy page rebuilt as clean markdown — title, H4 fix, email deobfuscation, 8 links preserved (SEOS-03, D-19) | ✓ VERIFIED | `privacy.md:4` `title: Privacy e Cookie`; `:40` `#### Attiva l'opzione Do Not Track` (no leading space); `:71` `s.foschi@protonmail.com`; exactly 8 `href=` links in markdown matching the plan's preserved list; no `<a ` (source has raw HTML only as the intentional post-checkpoint target=_blank form — 8 anchors, user-approved at the 05-04 checkpoint, verified rendering with target/rel in built HTML); no `</p>\|<p>` literal markup issues |
| 15  | Visual-delta fixes shipped: banner centered + absolute-filled, pagination pills visible on pink, privacy links target=_blank, privacy headings Ubuntu — all additive, no selector rewritten (IMAG-01/SEOS-02/SEOS-03 parity; 05-04 checkpoint outcomes) | ✓ VERIFIED | Compiled CSS in `public/styles.*.css`: `.blog-post .featured-image{border-radius:12px;display:block;margin:0 auto;min-height:50vh}` + `.blog-post .featured-image img{height:100%;inset:0;object-fit:cover;object-position:50% 50%;position:absolute;width:100%}`; `.pagination a{...background-color:#fff...color:#8c1a3f}` + `.pagination a.is-active,.pagination a:hover{background-color:#8c1a3f;color:#fff}`; `.pagination.-post` reset present; `.contact-page .privacy-content h1..h6{font-family:var(--font-family)}`; rendered /privacy has `target="_blank"` on all 8 external links (10 total with wa.me + mailto) and `privacy-content` class. All machine-verifiable aspects green — final visual appearance is the human item below |

**Score:** 15/15 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected    | Status | Details |
| -------- | ----------- | ------ | ------- |
| `package.json` | `"gatsby-plugin-image": "3.16.0"` exact pin; gatsby-image absent | ✓ VERIFIED | line 32; no caret; no gatsby-image |
| `yarn.lock` | gatsby-plugin-image 3.16.0 tree; no gatsby-image | ✓ VERIFIED | `grep -c "gatsby-image@"` → 0 |
| `gatsby-config.js` | plugin string entry; tracedSVG removed; remark options verbatim | ✓ VERIFIED | line 38; `maxWidth: 1024` etc. intact |
| `src/templates/blog-post.js` | GatsbyImage + gatsbyImageData + getSrc-wired Seo | ✓ VERIFIED | lines 3, 56-57, 72, 81-91, 131-136 |
| `src/templates/index-page.js` | DOMINANT_COLOR + eager hero | ✓ VERIFIED | lines 20-25, 61-66 |
| `src/components/post-card.js` | GatsbyImage in Link wrapper | ✓ VERIFIED | lines 9-15 |
| `src/templates/blog-list.js` | card query + Italian meta + Precedente/Successivo | ✓ VERIFIED | lines 27-34, 52, 69, 105-111 |
| `src/components/blog-list-home.js` | byte-identical card query | ✓ VERIFIED | lines 46-53 |
| `src/components/seo.js` | lang="it", no hreflang, string guard | ✓ VERIFIED | lines 20, 25, 31 |
| `src/templates/blog-list.test.js` | Italian assertions, no gatsby-image | ✓ VERIFIED | 85 tests pass |
| `src/pages/404.js` / `src/pages/thanks.js` | Italian titles | ✓ VERIFIED | one-line swaps |
| `src/content/pages/privacy.md` | clean markdown, 8 links, Italian title | ✓ VERIFIED | raw-HTML anchors are the intentional checkpoint-approved target=_blank form |
| `src/templates/privacy.js` | `wrapper privacy-content` scope hook | ✓ VERIFIED | line 34 |
| `src/assets/scss/style.scss` | additive banner fill, pagination pills, privacy-content override | ✓ VERIFIED | lines 331-344, 574-591, 442-451; zero existing selectors rewritten |

### Key Link Verification

| From | To  | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| blog-post.js | Seo | `getSrc(frontmatter.featuredImage?.childImageSharp)` → `image={imageSrc}` string | ✓ WIRED | built post HTML shows real `og:image content="https://laryart.it/static/..."` |
| blog-list.js / blog-list-home.js | PostCard | pageQuery/StaticQuery gatsbyImageData → `GatsbyImage image={getImage(...)}` | ✓ WIRED | both queries byte-identical; cards render `gatsby-image-wrapper gatsby-image-wrapper-constrained featured-image` in built HTML |
| seo.js | react-helmet | `<html lang="it" />`, og/twitter meta, `imageUrl || defaultImage` | ✓ WIRED | `lang="it"` on every built page; `rel="alternate"` 0 site-wide |
| gatsby-config.js | build | `"gatsby-plugin-image"` SSR registration | ✓ WIRED | shared `.gatsby-image-wrapper` CSS present in built HTML |
| privacy.md | gatsby-transformer-remark | markdown → /privacy HTML | ✓ WIRED | balanced p tags 20/20; 8 links with target/rel render; `privacy-content` class present |
| gatsby-plugin-image (npm) | package.json / yarn.lock | exact pin 3.16.0 | ✓ WIRED | install → config → resolver → SSR output pipeline proven by green build |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| blog-post GatsbyImage | `Image` via getImage | GraphQL `gatsbyImageData` from sharp 5.16.0 | ✓ real processed image (`/static/<hash>/...jpg` + webp srcSet in built HTML) | ✓ FLOWING |
| index hero | `Image` via getImage | gatsbyImageData DOMINANT_COLOR | ✓ `data-placeholder-image` with `background-color:#f8a8a8`, real srcSet | ✓ FLOWING |
| post cards | `getImage(...)` | gatsbyImageData width/height 540/360 | ✓ 540x360 constrained box, 4 srcSet widths (135/270/540/1080w), blur-up placeholder | ✓ FLOWING |
| Seo og:image | `imageSrc` string | getSrc on childImageSharp | ✓ real absolute URL; defaultImage fallback on pages without featured image | ✓ FLOWING |
| blog-list meta | `currentPage` | pageContext from gatsby-node pagination | ✓ `Blog` / `Blog — Pagina 2`; Italian description + `Pagina 2` suffix | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Full phase gate | `yarn test` (10 suites / 85 tests) | All pass, exit 0 | ✓ PASS |
| [object Object] eliminated | `grep -c "object Object" public/*/index.html` | 0 (grep exit 1 = no matches) | ✓ PASS |
| Real og:image URL | `grep -o 'property="og:image" content="[^"]*"' public/farfalla-blu/index.html` | `https://laryart.it/static/29964eb0954502082a107ae9d0064790/df56b/img_20200814_201009_839.jpg` | ✓ PASS |
| lang + hreflang | `grep -o '<html lang="[^"]*"' public/index.html`; `grep -rl 'rel="alternate"' public/` | `<html lang="it"`; 0 files | ✓ PASS |
| Pagination-aware titles | `grep -o '<title[^>]*>...' public/blog/index.html public/blog/2/index.html` | `Blog` / `Blog — Pagina 2` | ✓ PASS |
| Privacy link attrs | python regex over `public/privacy/index.html` | 8/8 external links carry `target="_blank" rel="noopener noreferrer"` | ✓ PASS |
| Privacy tag balance | python tag walker | 20 opens / 20 closes | ✓ PASS |
| Hero placeholder | `grep -c "data-placeholder-image" public/index.html` | 2 | ✓ PASS |
| Card rendering | built HTML inspection | `gatsby-image-wrapper-constrained featured-image` per card, `max-width:540px` box, `object-fit:cover` | ✓ PASS |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| n/a — no probe scripts declared in PLANs | — | no `scripts/*/tests/probe-*.sh` exist; phase verification is grep- and build-based by design (05-04 task 1) | SKIP (not applicable) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| IMAG-01 | 05-01, 05-02, 05-04 | gatsby-image migrated to gatsby-plugin-image across blog-post, index-page, blog-list, post-card, blog-list-home | ✓ SATISFIED | all 5 surfaces on GatsbyImage/gatsbyImageData; zero gatsby-image imports; package+lockfile clean; banner absolute-fill parity in compiled CSS |
| IMAG-02 | 05-01, 05-02, 05-04 | tracedSVG config removed; BLURRED/DOMINANT_COLOR placeholders used | ✓ SATISFIED | tracedSVG absent from gatsby-config; BLURRED on post/cards; DOMINANT_COLOR on hero only; `data-placeholder-image` in built HTML |
| IMAG-03 | 05-01, 05-03 | og:image bug fixed via getSrc() — no [object Object] in meta tags | ✓ SATISFIED | getSrc string at call site + typeof-string guard in seo.js; 0 `[object Object]` site-wide; real `/static/` URLs on post pages |
| SEOS-01 | 05-03 | html lang set to "it"; redundant hreflang alternates removed | ✓ SATISFIED | `lang="it"` source + rendered; `rel="alternate"` 0 site-wide; no hrefLang in seo.js |
| SEOS-02 | 05-03, 05-04 | Hardcoded English starter meta replaced with real Italian descriptions | ✓ SATISFIED | Italian blog-list title/description (pagination-aware), Precedente/Successivo, Pagina non trovata/Grazie, Privacy e Cookie; zero Stackrole/Page X of Y/Previous/Next in rendered source; pagination visibility fix shipped |
| SEOS-03 | 05-03, 05-04 | Privacy page HTML cleaned up — valid markdown, no broken fragments | ✓ SATISFIED | clean markdown rebuild; balanced p tags; zero chiocciola; 8 links preserved (target=_blank restored per user checkpoint); headings in Ubuntu |

No orphaned requirements: all 6 IDs in REQUIREMENTS.md map to phase-5 plans and are implemented.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none in phase-modified files) | — | No TBD/FIXME/XXX, no placeholder stubs, no `return null`/`=> {}` hollow handlers, no hardcoded-empty props in any phase file | — | — |
| 05-REVIEW.md WR-01 (pre-existing, style.scss:220) | `©` after `padding-bottom: 100px;` breaks `.home-posts .grids` rule in shipped CSS | ⚠️ Warning | Pre-existing defect (c67d505) in a file this phase touched; does not affect the image pipeline or SEO meta goals | 
| 05-REVIEW.md WR-02 (pre-existing, style.scss:640-644) | malformed `padding: 50px 0 ul {…}` in mobile pagination media query → mobile pagination row stays cramped | ⚠️ Warning | Pre-existing; interacts with SEOS-02 pagination visibility but desktop fix verified shipped; routed to human decision |
| 05-REVIEW.md WR-03 (this phase's query blocks) | `date(formatString: "MMMM DD, YYYY")` renders English month names on lang=it site | ⚠️ Warning | Visible body content, not SEO meta — outside SC4/SEOS-02 letter; routed to human decision |

### Human Verification Required

### 1. Final visual pass on the four fixed surfaces

**Test:** Serve the built site (`TMPDIR=/home/simos/tmp yarn serve`, or open `public/` files directly) and visually confirm: (1) a blog post with a LANDSCAPE featured image and one with a PORTRAIT image — banner fills the 50vh box with no white gap, no bottom clip, centered; (2) /blog and /blog/2 pagination row — Precedente/Successivo and page numbers are readable white pills with dark text on the pink background, active page a dark pill; (3) /privacy — all 8 external links open a new tab and headings render in Ubuntu (not Parisienne); (4) / index hero and card thumbnails at the legacy 540x360 center crop.
**Expected:** All four surfaces at visual parity with the pre-migration site.
**Why human:** Machine checks confirm the compiled CSS rules, rendered classes, and `target="_blank"` attributes exist (all greps/python checks pass), but cannot judge final rendering quality. The blocking checkpoint was resolved (user reported 4 deltas, all fixed and machine re-verified), yet 05-04-SUMMARY "Next Phase Readiness" explicitly defers a final visual pass on the *fixed* state to the phase verifier.

### 2. Disposition of code-review warnings (05-REVIEW.md)

**Test:** Decide for each warning: fix now (WR-01 stray `©` breaking `.home-posts .grids`; WR-02 broken mobile pagination media query; WR-03 English month names via `date(formatString: "MMMM DD, YYYY")` on all three date queries) or defer to a later phase.
**Expected:** Explicit accept-and-defer or scheduled fix. The phase goal is machine-verified complete regardless — WR-01/WR-02 are pre-existing SCSS defects, WR-03 affects visible post dates, not the Italian SEO meta surface.
**Why human:** Scope judgment — an automated verifier cannot decide whether pre-existing defects and body-copy i18n belong in this phase.

### Gaps Summary

No gaps found. All 15 must-have truths, all 5 roadmap success criteria, and all 6 requirement IDs (IMAG-01/02/03, SEOS-01/02/03) are verified against the actual codebase: source files, compiled CSS, rendered `public/` HTML, and a green test suite (10 suites / 85 tests). Every prohibition holds (eager/DOMINANT_COLOR hero-only, no deprecated gatsbyImageData args, no English starter strings, no hreflang, no tracedSVG, additive-only SCSS). Deviations documented by the executor were verified as legitimate: `layout: CONSTRAINED` enum form (required by Gatsby GraphQL — the plan's lowercase string fails validation), 3.16.0 pin (registry-verified correction of D-01's non-existent 5.16.0), test co-changes for the gatsby-image removal, `yarn clean` before rendered-source greps, and the four user-approved visual-delta fixes (banner absolute-fill, pagination pills, privacy target=_blank raw-HTML anchors, privacy Ubuntu headings — all intentional per the 05-04 human checkpoint).

Status is **human_needed** — not because of any failed check, but because final visual sign-off on the fixed surfaces and disposition of the three code-review warnings require human judgment. All automated evidence is green.

---

_Verified: 2026-08-20T10:05:29Z_
_Verifier: the agent (gsd-verifier)_
