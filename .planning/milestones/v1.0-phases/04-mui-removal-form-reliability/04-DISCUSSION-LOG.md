# Phase 4: MUI Removal + Form Reliability - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 4-mui-removal-form-reliability
**Areas discussed:** MUI removal, Formik UX preservation, EmailJS swap + env vars, false-success fix

---

## MUI Removal (FORM-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Plain SCSS with existing theme variables | Replace TextField/Button with input/textarea/button styled via _theme-variables.scss | ✓ |
| Migrate to @mui/material v7 | Keep the MUI component model on the maintained package | |

**User's choice:** [auto] Plain SCSS with existing theme variables (recommended default)
**Notes:** [auto] ROADMAP locks "plain-SCSS" in the phase goal; MUI v4 is EOL. Only two consumer files (formik.js, top-contacts.js). react-icons already in the dependency tree for the icon replacement.

## Formik UX Preservation (FORM-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Formik + yup, plain-CSS error display | Same validation schema, error text + error class under the field | ✓ |
| Drop Formik, hand-rolled validation | Rewrite the form without Formik | |

**User's choice:** [auto] Keep Formik + yup, plain-CSS error display (recommended default)
**Notes:** [auto] ROADMAP success criterion 2: "Formik validation UX is preserved: field errors and helper texts appear exactly as before". The existing test asserts the Mui-error class — must be updated to the new plain-CSS error class (D-06).

## EmailJS Swap + Env Vars (FORM-03, UPGR-05)

| Option | Description | Selected |
|--------|-------------|----------|
| @emailjs/browser v4 + GATSBY_* env vars | Maintained package, no hardcoded creds, .env.example committed | ✓ |
| Keep emailjs-com, only move creds to env | Minimal change, stays on the deprecated package | |

**User's choice:** [auto] @emailjs/browser v4 + GATSBY_* env vars (recommended default)
**Notes:** [auto] UPGR-05 locks the v4 swap; FORM-03 locks the env-var move. Current values to migrate: user_06xz85hi92oABMZqCIUu7 / service_q3997uk / template_m6tzcmm. Owner must set Netlify env vars after the phase (manual checkpoint).

## False-Success Fix (FORM-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect only on .then; inline error on .catch | No false success; form values kept; Italian error message | ✓ |
| Keep current behavior | Redirect regardless of send result | |

**User's choice:** [auto] Redirect only on .then; inline error on .catch (recommended default)
**Notes:** [auto] ROADMAP success criterion 4. The Phase 1 regression test (it.skip in formik.test.js) is unskipped and must pass (D-12).

## the agent's Discretion

- Exact SCSS class structure for the plain form (must use existing theme variables)
- Error text source (yup message vs static helper text — must match current observable behavior)
- Exact Italian inline error wording
- emailjs.init() placement (lazy vs module scope with env vars)

## Deferred Ideas

- Netlify form dual-channel conflict — owner decision, separate concern
- GA4 consent banner — 03-REVIEW WR-05, future
- English service-worker prompt — 03-REVIEW IN-02, cosmetic
- Pre-existing SCSS bugs (CR-01, CR-02) — 03-REVIEW, out of scope
