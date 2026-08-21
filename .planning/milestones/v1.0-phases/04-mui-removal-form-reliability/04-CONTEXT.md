# Phase 4: MUI Removal + Form Reliability - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase removes MUI v4 (`@material-ui/core` + `@material-ui/icons`) from the contact form and top contacts, replacing them with plain SCSS styled with the existing theme variables — while preserving the Formik validation UX exactly. It also fixes the false-success bug (the form redirects to /thanks even when the email send fails) and moves the hardcoded EmailJS credentials to `GATSBY_*` environment variables with a committed `.env.example`. The emailjs-com → @emailjs/browser v4 swap (UPGR-05) happens here too. No visual redesign — the form must look and behave as before, minus MUI.

</domain>

<decisions>
## Implementation Decisions

### MUI Removal (FORM-01)
- **D-01:** Remove `@material-ui/core` ^4.12.4 and `@material-ui/icons` ^4.11.3 from package.json. The only MUI consumers are `src/components/formik.js` (TextField, Button) and `src/components/top-contacts.js` (FacebookIcon, WhatsAppIcon). **Reversibility:** reversible
- **D-02:** Replace the MUI TextField/Button in formik.js with plain `<input>`/`<textarea>`/`<button>` elements styled via the existing SCSS theme variables (`--primary-color`, `--button-alternate-color`, etc. from `_theme-variables.scss`). The `.contact_form` SCSS block (style.scss:434-464) already has partial styling — extend it. **Reversibility:** reversible
- **D-03:** Replace the MUI icons in top-contacts.js with `react-icons` (already a dependency, used across 7 other files — RiWhatsappLine/RiFacebookBoxLine from the ri set). **Reversibility:** reversible
- **D-04:** The form must look and behave as before: same fields (nome, email, cellulare, messaggio), same placeholders, same layout, same submit button ("Invia"). No visual redesign.

### Formik UX Preservation (FORM-02)
- **D-05:** Keep Formik + yup exactly as-is (validationSchema: email + nome required). The error display must survive the MUI removal: field errors and helper texts appear exactly as before — error text under the field, error state styling on the input. The plain-CSS replacement must render the yup error messages (or the existing static helper texts "Nome richiesto"/"Email richiesta") with an error class.
- **D-06:** The existing test `formik.test.js` asserts the MUI-specific `Mui-error` class — it must be updated to assert the new plain-CSS error class instead. The test's intent (validation errors surface through the UI) stays.

### EmailJS → @emailjs/browser + env vars (FORM-03, UPGR-05)
- **D-07:** Replace `emailjs-com` ^3.2.0 with `@emailjs/browser` v4 (the maintained package). Import changes from `import emailjs from "emailjs-com"` to `import emailjs from "@emailjs/browser"`. **Reversibility:** reversible
- **D-08:** No hardcoded credentials: the public key, service ID, and template ID move to `GATSBY_EMAILJS_PUBLIC_KEY`, `GATSBY_EMAILJS_SERVICE_ID`, `GATSBY_EMAILJS_TEMPLATE_ID` env vars (GATSBY_ prefix so Gatsby exposes them client-side). Commit `.env.example` with the current values as placeholders. **Reversibility:** reversible
- **D-09:** The current values to migrate: public key `user_06xz85hi92oABMZqCIUu7`, service `service_q3997uk`, template `template_m6tzcmm`. The owner must set these in Netlify env vars after the phase (manual checkpoint).
- **D-10:** The test mock must change from `jest.mock("emailjs-com")` to `jest.mock("@emailjs/browser")` — the module-load init call moves to env-var-driven init.

### False-Success Fix (FORM-04)
- **D-11:** The form must only redirect to /thanks on `.then` (success). On `.catch`, show an inline error message (Italian, e.g. "Si è verificato un errore nell'invio del messaggio. Riprova.") and keep the form values — `setSubmitting(false)` without reset, NO redirect. **Reversibility:** reversible
- **D-12:** Unskip the Phase 1 regression test `formik.test.js` `it.skip("does NOT navigate to /thanks when emailjs.sendForm rejects")` — it must pass after the fix. This is the FORM-04 regression net.
- **D-13:** The success path stays: `.then` → resetForm → redirect to /thanks. The Netlify form attributes (`data-netlify="true"`, honeypot bot-field) stay as-is (dual-channel fallback is a separate concern, not this phase).

### the agent's Discretion
- Exact SCSS class structure for the plain form (input/textarea/button/error styles) — must use existing theme variables, no new colors
- Whether the error text shows the yup message or the static helper text (must match current observable behavior)
- Exact inline error message wording for the failure path (Italian, clear)
- Whether `emailjs.init()` moves to a lazy call or stays at module scope with env vars

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase & Requirements
- `.planning/ROADMAP.md` §Phase 4 — Goal, 5 success criteria, requirements FORM-01..04 + UPGR-05
- `.planning/REQUIREMENTS.md` §FORM-01..04, §UPGR-05 — Requirement definitions
- `.planning/phases/03-core-upgrade/03-CONTEXT.md` — D-07 (Node 24), D-08/D-09 (Decap swap) — the environment this phase builds on
- `.planning/phases/03-core-upgrade/03-REVIEW.md` — WR-05 (GA4 consent gap, out of scope), IN-02 (English SW prompt, out of scope)

### Codebase Maps
- `.planning/codebase/CONCERNS.md` §Known Bugs — the false-success bug (formik.js:39-52), §Dependencies at Risk — MUI v4 EOL, emailjs-com deprecated
- `.planning/codebase/ARCHITECTURE.md` — Contact Form Flow (formik.js onSubmit → emailjs.sendForm → /thanks), hardcoded emailjs.init at module scope
- `.planning/codebase/CONVENTIONS.md` — Code style (Prettier, no semicolons, double quotes, arrowParens avoid)
- `.planning/codebase/STACK.md` — MUI v4 usage surface (formik.js, top-contacts.js), react-icons already in use

### Tests
- `src/components/formik.test.js` — the FORM-04 regression net (it.skip, must be unskipped per D-12); the Mui-error class assertion to update per D-06
- `.planning/phases/01-test-scaffolding-performance-baseline/01-SUMMARY.md` — jest setup, emailjs mock pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/assets/scss/_theme-variables.scss` — theme variables (`--primary-color`, `--button-alternate-color`, `--label-text`, etc.) for the plain form styles
- `src/assets/scss/style.scss:434-464` — existing `.contact_form` block (label color, .item padding, .hidden, .textarea) to extend
- `react-icons` ri set — already used in 7 files; RiWhatsappLine/RiFacebookBoxLine for top-contacts
- `src/components/formik.test.js` — existing test suite to update (D-06) and unskip (D-12)

### Established Patterns
- Plain JavaScript (no TS), Prettier formatting (no semicolons, double quotes, arrowParens avoid)
- Formik + yup validation (email + nome required), Field/useField pattern
- Italian UI copy throughout
- Node 24 enforced (engines + engine-strict + check-node-version.js); yarn 1.22.22

### Integration Points
- `src/components/formik.js` — the form component (MUI TextField/Button → plain elements; emailjs-com → @emailjs/browser; hardcoded creds → GATSBY_* env vars; false-success fix)
- `src/components/top-contacts.js` — MUI icons → react-icons
- `package.json` — remove @material-ui/core + @material-ui/icons + emailjs-com; add @emailjs/browser
- `.env.example` — NEW file with GATSBY_EMAILJS_* placeholders
- `src/components/formik.test.js` — mock update + unskip
- `src/assets/scss/style.scss` — extend .contact_form with input/textarea/button/error styles
- Netlify env vars — manual checkpoint: owner sets GATSBY_EMAILJS_* in Netlify UI after the phase

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard approaches per CONCERNS.md evidence and the locked requirement versions (@emailjs/browser v4).

</specifics>

<deferred>
## Deferred Ideas

- **Netlify form dual-channel conflict** (EmailJS vs data-netlify attributes) — owner decision, separate concern (CONCERNS.md §Fragile Areas)
- **GA4 consent banner** — flagged in 03-REVIEW WR-05, future enhancement
- **English service-worker prompt** — flagged in 03-REVIEW IN-02, cosmetic, future
- **Pre-existing SCSS bugs** (CR-01 stray ©, CR-02 broken mobile pagination) — flagged in 03-REVIEW, not this phase's scope

</deferred>

---

*Phase: 4-MUI Removal + Form Reliability*
*Context gathered: 2026-08-19*
