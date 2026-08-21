# Phase 4: MUI Removal + Form Reliability - Research

**Researched:** 2026-08-19
**Domain:** React form component refactor (MUI v4 → plain SCSS), client-side email SDK migration (emailjs-com → @emailjs/browser v4), Gatsby build-time env vars
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Remove `@material-ui/core` ^4.12.4 and `@material-ui/icons` ^4.11.3 from package.json. The only MUI consumers are `src/components/formik.js` (TextField, Button) and `src/components/top-contacts.js` (FacebookIcon, WhatsAppIcon). **Reversibility:** reversible
- **D-02:** Replace the MUI TextField/Button in formik.js with plain `<input>`/`<textarea>`/`<button>` elements styled via the existing SCSS theme variables (`--primary-color`, `--button-alternate-color`, etc. from `_theme-variables.scss`). The `.contact_form` SCSS block (style.scss:434-464) already has partial styling — extend it. **Reversibility:** reversible
- **D-03:** Replace the MUI icons in top-contacts.js with `react-icons` (already a dependency, used across 7 other files — RiWhatsappLine/RiFacebookBoxLine from the ri set). **Reversibility:** reversible
- **D-04:** The form must look and behave as before: same fields (nome, email, cellulare, messaggio), same placeholders, same layout, same submit button ("Invia"). No visual redesign.
- **D-05:** Keep Formik + yup exactly as-is (validationSchema: email + nome required). The error display must survive the MUI removal: field errors and helper texts appear exactly as before — error text under the field, error state styling on the input. The plain-CSS replacement must render the yup error messages (or the existing static helper texts "Nome richiesto"/"Email richiesta") with an error class.
- **D-06:** The existing test `formik.test.js` asserts the MUI-specific `Mui-error` class — it must be updated to assert the new plain-CSS error class instead. The test's intent (validation errors surface through the UI) stays.
- **D-07:** Replace `emailjs-com` ^3.2.0 with `@emailjs/browser` v4 (the maintained package). Import changes from `import emailjs from "emailjs-com"` to `import emailjs from "@emailjs/browser"`. **Reversibility:** reversible
- **D-08:** No hardcoded credentials: the public key, service ID, and template ID move to `GATSBY_EMAILJS_PUBLIC_KEY`, `GATSBY_EMAILJS_SERVICE_ID`, `GATSBY_EMAILJS_TEMPLATE_ID` env vars (GATSBY_ prefix so Gatsby exposes them client-side). Commit `.env.example` with the current values as placeholders. **Reversibility:** reversible
- **D-09:** The current values to migrate: public key `user_06xz85hi92oABMZqCIUu7`, service `service_q3997uk`, template `template_m6tzcmm`. The owner must set these in Netlify env vars after the phase (manual checkpoint).
- **D-10:** The test mock must change from `jest.mock("emailjs-com")` to `jest.mock("@emailjs/browser")` — the module-load init call moves to env-var-driven init.
- **D-11:** The form must only redirect to /thanks on `.then` (success). On `.catch`, show an inline error message (Italian, e.g. "Si è verificato un errore nell'invio del messaggio. Riprova.") and keep the form values — `setSubmitting(false)` without reset, NO redirect. **Reversibility:** reversible
- **D-12:** Unskip the Phase 1 regression test `formik.test.js` `it.skip("does NOT navigate to /thanks when emailjs.sendForm rejects")` — it must pass after the fix. This is the FORM-04 regression net.
- **D-13:** The success path stays: `.then` → resetForm → redirect to /thanks. The Netlify form attributes (`data-netlify="true"`, honeypot bot-field) stay as-is (dual-channel fallback is a separate concern, not this phase).

### the agent's Discretion
- Exact SCSS class structure for the plain form (input/textarea/button/error styles) — must use existing theme variables, no new colors
- Whether the error text shows the yup message or the static helper text (must match current observable behavior)
- Exact inline error message wording for the failure path (Italian, clear)
- Whether `emailjs.init()` moves to a lazy call or stays at module scope with env vars

### Deferred Ideas (OUT OF SCOPE)
- **Netlify form dual-channel conflict** (EmailJS vs data-netlify attributes) — owner decision, separate concern (CONCERNS.md §Fragile Areas)
- **GA4 consent banner** — flagged in 03-REVIEW WR-05, future enhancement
- **English service-worker prompt** — flagged in 03-REVIEW IN-02, cosmetic, future
- **Pre-existing SCSS bugs** (CR-01 stray ©, CR-02 broken mobile pagination) — flagged in 03-REVIEW, not this phase's scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FORM-01 | MUI v4 removed (core + icons) — contact form uses plain CSS with existing SCSS theme variables | §Standard Stack (react-icons already installed), §Architecture Patterns (Pattern 1: plain-element Formik wiring), §Code Examples (Example 1) |
| FORM-02 | Formik error/helperText UX preserved in the plain-CSS replacement | §Architecture Patterns (Pattern 1: useField + meta.error/meta.touched + error class), UI-SPEC Copywriting Contract (static helper texts, always visible, flip to error class) |
| FORM-03 | EmailJS key moved to GATSBY_* environment variable — no hardcoded key in source; .env.example committed | §Standard Stack (@emailjs/browser 4.4.1), §Common Pitfalls (Pitfall 1: `.env*` gitignore blocks `.env.example`; Pitfall 2: build-time inlining), §Code Examples (Example 2) |
| FORM-04 | False-success bug fixed — form no longer reports success when email send fails | §Code Examples (Example 2: promise chain with redirect only in `.then`), §Common Pitfalls (Pitfall 4: async submit), §Validation Architecture (unskipped regression test) |
| UPGR-05 | emailjs-com replaced with @emailjs/browser v4 | §Standard Stack (verified 4.4.1, default export shape), §State of the Art (v3→v4 breaking changes) |
</phase_requirements>

## Summary

Phase 4 replaces MUI v4 with plain SCSS in the contact form while preserving the Formik validation UX exactly, swaps the deprecated `emailjs-com` for `@emailjs/browser` v4, moves EmailJS credentials to `GATSBY_*` env vars, and fixes the false-success bug (redirect only on `.then`). All critical API claims were verified this session against official documentation (EmailJS SDK docs, Gatsby env-var docs, Netlify framework guide, Formik API reference) and by unpacking the actual `@emailjs/browser@4.4.1` npm tarball to read its type declarations and implementation source.

Key verified facts: `@emailjs/browser` latest is **4.4.1** (published 2024-07-11, zero dependencies, no postinstall script, official `emailjs-com/emailjs-sdk` GitHub repo). It **keeps a default export** `{ init, send, sendForm, EmailJSResponseStatus }` — so `import emailjs from "@emailjs/browser"` works unchanged from the v3 import style. The v4 breaking change is `init()`: it takes an options object `{ publicKey: "..." }` instead of the v3 string `"user_XXX"` (a legacy string is still accepted for v3 compat, but the object form is the documented API). `sendForm(serviceID, templateID, form, options)` is unchanged in signature and returns `Promise<EmailJSResponseStatus>` with `.status`/`.text`. Gatsby inlines `GATSBY_*` vars into client bundles at build time via webpack DefinePlugin (verified in `node_modules/gatsby/dist/utils/webpack.config.js:102`), so `process.env.GATSBY_EMAILJS_*` reads work in components but are frozen at build time — Netlify env vars must be set before the first post-phase deploy.

**Primary recommendation:** Rewrite `formik.js` with plain `<input>`/`<textarea>`/`<button>` wired through Formik's `useField`/`Field` (default `as="input"`, `as="textarea"` for messaggio), keep `emailjs.init({ publicKey: process.env.GATSBY_EMAILJS_PUBLIC_KEY })` at module scope (guarded), return the `sendForm` promise chain from `onSubmit` with redirect only in `.then` and a `setStatus`-driven inline Italian error on `.catch`, and update `formik.test.js` (mock module name, error-class assertion, unskip). **Critical gotcha found:** `.env.example` is currently gitignored by the `.env*` pattern (verified via `git check-ignore`) — the plan must force-add it or add a `!.env.example` negation rule.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Form rendering + validation UX | Browser / Client | — | React component (`formik.js`) rendered in `contatti.js` template; Formik/yup run entirely client-side |
| Email sending | Browser / Client | — | EmailJS is a client-side SDK — `sendForm` posts FormData directly to `api.emailjs.com` from the browser; no backend exists |
| Env var injection | Build time (Gatsby webpack) | — | `GATSBY_*` vars are inlined into the client bundle by DefinePlugin at `gatsby build`/`develop` time — not read at runtime |
| Netlify form fallback | CDN / Static | — | `data-netlify="true"` + honeypot attributes are post-processed by Netlify at deploy; untouched this phase (D-13) |
| Success redirect | Browser / Client | — | `document.location.assign("/thanks")` client-side navigation (D-13 keeps this) |
| Env var provisioning | External service (Netlify UI) | — | Owner sets `GATSBY_EMAILJS_*` in Netlify site settings — manual checkpoint, not code |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @emailjs/browser | 4.4.1 | Client-side email sending | Official maintained successor to deprecated emailjs-com; zero deps; default export keeps v3 import style |
| formik | 2.4.9 (installed, `^2.2.9`) | Form state + validation orchestration | Already in project; D-05 locks it as-is |
| yup | 1.7.1 (installed) | Schema validation (email + nome required) | Already in project; D-05 locks it as-is |
| react-icons | 5.7.0 (installed) | RiWhatsappLine / RiFacebookBoxLine icons | Already in project, used in 7 files; D-03 locks it |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jest + @testing-library/react | 29.7.0 / 16.3.2 (installed) | Regression net for FORM-02/FORM-04 | Existing suite; only `formik.test.js` changes |
| sass (dart-sass) | ^1.30.0 (installed) | Compiles the extended `.contact_form` SCSS | Already in project (Phase 3 replaced node-sass) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @emailjs/browser | staying on emailjs-com | emailjs-com is deprecated ("The SDK name changed to @emailjs/browser" — npm deprecation notice verified); UPGR-05 locks the swap |
| Plain SCSS form | MUI v5/v6 | MUI v4 is EOL; upgrading majors is a bigger change than D-02's plain-SCSS contract; no visual redesign allowed |
| react-icons | inline SVGs | react-icons already installed and used across the site — zero new deps |

**Installation:**
```bash
yarn add @emailjs/browser@4.4.1
yarn remove @material-ui/core @material-ui/icons emailjs-com
```

**Version verification (performed this session):**
- `npm view @emailjs/browser version` → `4.4.1` (latest; `time.modified` 2024-07-11, `time.created` 2021-12-29)
- `npm view emailjs-com deprecated` → `"The SDK name changed to @emailjs/browser"`
- `npm view react-icons version` → `5.7.0` (matches installed)
- `npm view formik version` → `2.4.9` (matches yarn.lock resolution)
- `npm view yup version` → `1.7.1` (matches installed)

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| @emailjs/browser@4.4.1 | npm | 4.5 yrs (created 2021-12-29) | high (official EmailJS SDK) | github.com/emailjs-com/emailjs-sdk | OK | Approved |
| react-icons@5.7.0 | npm | 10 yrs (created 2015-10-23) | very high | github.com/react-icons/react-icons | OK | Approved (already installed — no new install) |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Additional legitimacy signals verified for `@emailjs/browser`: zero runtime dependencies, no `postinstall` script (`npm view @emailjs/browser scripts.postinstall` → empty), official docs at emailjs.com/docs/sdk reference this exact package name, and the unpacked tarball's `es/index.d.ts` matches the documented API. No `[ASSUMED]` packages in this phase.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │  Netlify build (yarn build)                │
                    │  GATSBY_EMAILJS_* from Netlify UI env vars │
                    └──────────────┬──────────────────────────────┘
                                   │ DefinePlugin inlines
                                   │ process.env.GATSBY_* into bundle
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Browser: /contatti page (contatti.js → FormikContact)                │
│                                                                      │
│  User fills form ──► Formik state (useField/Field)                   │
│        │                                                             │
│        │ submit "Invia"                                             │
│        ▼                                                             │
│  yup validationSchema ──fail──► helper texts flip to .error class    │
│        │ pass                          (no submit, no redirect)     │
│        ▼                                                             │
│  onSubmit: emailjs.sendForm(serviceId, templateId, "#contact_form") │
│        │                                                             │
│        ├── .then ──► resetForm() ──► location.assign("/thanks")     │
│        │                                                             │
│        └── .catch ─► setStatus({sendError}) ─► inline Italian error  │
│                      (values kept, no redirect, isSubmitting=false)  │
└──────────────┬───────────────────────────────────────────────────────┘
               │ POST FormData (client-side)
               ▼
        api.emailjs.com  ──►  artisan's inbox
```

### Recommended Project Structure
```
src/
├── components/
│   ├── formik.js            # rewritten: plain elements + @emailjs/browser + env vars
│   ├── formik.test.js       # updated: mock module, error class, unskipped FORM-04 test
│   └── top-contacts.js      # react-icons swap
├── assets/scss/
│   ├── _theme-variables.scss  # UNCHANGED (source of all form colors)
│   └── style.scss             # .contact_form block extended (input/textarea/button/error)
└── (root)
    ├── .env.example         # NEW: GATSBY_EMAILJS_* placeholders (force-add vs .gitignore)
    ├── .gitignore           # add "!.env.example" negation rule
    └── package.json         # -@material-ui/*, -emailjs-com, +@emailjs/browser
```

### Pattern 1: Plain-element Formik field with preserved error UX
**What:** Replace `TextFieldConError` (useField + `Field as={TextField}`) with `useField` + plain `<input>` + a helper `<p>` that is always visible with the static text and flips to the error class. This preserves the current observable behavior exactly: the static helper texts ("Nome richiesto"/"Email richiesta") always render, and the validation signal is the error class flip (the yup message never rendered verbatim in the current code because `{...props}` spreads after `helperText` — documented in formik.test.js:17-20 and 01-01-SUMMARY.md).
**When to use:** For nome and email (the two validated fields). Cellulare and messaggio use plain `<Field>` (default `as="input"`, `as="textarea"` for messaggio).
**Example:**
```jsx
// Source: Formik docs (formik.org/docs/api/field — Field defaults to <input>, as="textarea" supported)
const TextFieldConError = ({ placeholder, helperText, ...props }) => {
  const [field, meta] = useField(props)
  const hasError = !!(meta.error && meta.touched)
  return (
    <>
      <input
        {...field}
        {...props}
        placeholder={placeholder}
        className={hasError ? "input error" : "input"}
      />
      <p className={hasError ? "helper error" : "helper"}>{helperText}</p>
    </>
  )
}
```

### Pattern 2: EmailJS v4 init + sendForm with env vars
**What:** Module-scope `emailjs.init({ publicKey: process.env.GATSBY_EMAILJS_PUBLIC_KEY })` (guarded), then `sendForm(serviceId, templateId, "#contact_form")` in onSubmit. The v4 object-form init is the documented API; the legacy string form still works for v3 compat (verified in tarball `buildOptions.js`).
**When to use:** This is the recommended placement (agent discretion resolved): module scope matches D-10's "env-var-driven init" wording and the current code structure; the guard prevents init with `undefined` when env vars are absent. In tests the mock absorbs the call either way.
**Example:**
```js
// Source: emailjs.com/docs/sdk/init + /docs/sdk/send-form (verified this session)
import emailjs from "@emailjs/browser"

if (process.env.GATSBY_EMAILJS_PUBLIC_KEY) {
  emailjs.init({ publicKey: process.env.GATSBY_EMAILJS_PUBLIC_KEY })
}
```

### Pattern 3: Honest async submit (FORM-04 fix)
**What:** `onSubmit` returns the `sendForm` promise chain; redirect only in `.then`; `.catch` sets Formik `status` for the inline error and calls `setSubmitting(false)` without reset. Returning the promise lets Formik manage `isSubmitting` automatically (it awaits the returned promise), and the button gets `disabled={isSubmitting}` as the double-send guard (UI-SPEC Delta Register).
**When to use:** The whole onSubmit rewrite.
**Example:**
```jsx
// Source: Formik docs (formik.org/docs/guides/form-submission — async onSubmit returns a promise)
onSubmit={(values, actions) => {
  actions.setStatus({ sendError: false })
  return emailjs
    .sendForm(
      process.env.GATSBY_EMAILJS_SERVICE_ID,
      process.env.GATSBY_EMAILJS_TEMPLATE_ID,
      "#contact_form"
    )
    .then(result => {
      console.log(result.text, result.status)
      actions.resetForm()
      document.location.assign("/thanks")
    })
    .catch(error => {
      console.log(error.text)
      actions.setStatus({ sendError: true })
      actions.setSubmitting(false)
    })
}}
```

### Anti-Patterns to Avoid
- **Redirecting outside the promise chain:** the current bug (formik.js:49-51) calls `resetForm`/`setSubmitting`/`assign` unconditionally after the chain — this is exactly what FORM-04 fixes. All post-send actions must live inside `.then`/`.catch`.
- **`as={TextField}` with plain elements:** don't keep the MUI component as the `as` target — use `as="input"`/`as="textarea"` (or omit `as` for input, the default).
- **Nested `.textarea textarea` selector:** the existing SCSS (style.scss:456-463) targets `textarea` *inside* the `.textarea` wrapper (MUI's DOM). With a plain `<textarea className="textarea">` the element IS the textarea — the nested selector must be flattened or the width rules silently stop applying.
- **Committing `.env.example` without checking gitignore:** `.env*` (gitignore line 57) matches `.env.example` — verified via `git check-ignore -v .env.example`. A plain `git add .env.example` silently fails.
- **Reading env vars at runtime:** `process.env.GATSBY_*` is inlined at build time; changing Netlify vars requires a rebuild (and possibly a cache-cleared deploy) to take effect.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state/validation | custom onChange/error state | Formik + yup (already installed) | D-05 locks them; touched/error semantics are subtle |
| Email sending | fetch to EmailJS REST API | @emailjs/browser `sendForm` | Handles FormData serialization, lib_version, validation, rate limiting |
| Icons | hand-drawn SVGs | react-icons ri set | Already installed; D-03 locks RiWhatsappLine/RiFacebookBoxLine |
| Env var loading | dotenv in components | Gatsby's built-in `GATSBY_` mechanism | DefinePlugin inlines at build; dotenv would be redundant and wrong for client code |
| Error message state | local useState plumbing | Formik `status` via `actions.setStatus` | Idiomatic Formik channel for submit-level (non-field) errors |

**Key insight:** Every problem this phase touches already has a blessed solution in the project (Formik, yup, react-icons, Gatsby env vars) or in the official EmailJS SDK. The only genuinely new code is the SCSS block and the promise-chain restructure.

## Runtime State Inventory

> This is a component replacement, not a string rename — no stored data, OS registrations, or build artifacts carry renamed strings. The one runtime-state item is live service configuration:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no database/datastore in this static site | — |
| Live service config | **Netlify site env vars: `GATSBY_EMAILJS_PUBLIC_KEY` / `GATSBY_EMAILJS_SERVICE_ID` / `GATSBY_EMAILJS_TEMPLATE_ID` are NOT set** (no `.env*` files exist locally; Netlify UI state not inspectable from here — [ASSUMED] unset) | Manual checkpoint: owner sets all three in Netlify UI (Site settings → Environment variables) before the first post-phase deploy |
| OS-registered state | None | — |
| Secrets/env vars | None in git (hardcoded key lives in formik.js:8 — removed this phase); no `.env` files on disk | Code edit only |
| Build artifacts | None — no installed packages carry the old names (node-sass already gone since Phase 3) | — |

**Nothing found in category:** Stored data, OS-registered state, build artifacts — verified by repo inspection (static Gatsby site, no DB, no scheduler).

## Common Pitfalls

### Pitfall 1: `.env.example` is silently gitignored
**What goes wrong:** `git add .env.example` does nothing — the file never lands in the repo, FORM-03's "committed .env.example" criterion fails invisibly.
**Why it happens:** `.gitignore` line 57 is `.env*`, which matches `.env.example`. Verified: `git check-ignore -v .env.example` → `.gitignore:57:.env*`.
**How to avoid:** Add a negation rule `!.env.example` to `.gitignore` (after the `.env*` line), or `git add -f .env.example`. The negation rule is the durable fix.
**Warning signs:** `git status` shows nothing after adding the file.

### Pitfall 2: GATSBY_* vars are frozen at build time
**What goes wrong:** Owner sets Netlify env vars but the deployed form still uses old/undefined values; or local `yarn develop` picks up stale values after changing `.env.development`.
**Why it happens:** Gatsby's webpack DefinePlugin replaces `process.env.GATSBY_X` with the literal value during compilation (verified in `node_modules/gatsby/dist/utils/webpack.config.js:102` — `key.match(/^GATSBY_/)` included for the web target). No runtime lookup exists.
**How to avoid:** Set Netlify vars BEFORE the first post-phase deploy; recommend a cache-cleared deploy (the `netlify-plugin-gatsby-cache` plugin caches `.cache`/`public` and may serve stale inlined bundles). Restart `yarn develop` after local env changes.
**Warning signs:** Form shows the send-error message in production despite correct-looking code; `gatsby build` log shows no env warnings.

### Pitfall 3: Undefined env vars at build → broken form at runtime
**What goes wrong:** If `GATSBY_EMAILJS_*` are unset, `sendForm` rejects with "The public key is required..." (verified in tarball `validateParams.js` — throws when publicKey/serviceID/templateID are missing; the async wrapper converts it to a rejection). The form then always shows the inline error.
**Why it happens:** `JSON.stringify(undefined)` in the DefinePlugin reduce produces a bare `undefined` replacement.
**How to avoid:** Guard the module-scope `init` with `if (process.env.GATSBY_EMAILJS_PUBLIC_KEY)`. The graceful degradation (inline error, no crash) is acceptable — but the manual Netlify checkpoint is the real fix.
**Warning signs:** Inline send-error on every submit in an environment where env vars weren't configured.

### Pitfall 4: Async submit without returning the promise
**What goes wrong:** `isSubmitting` flips back to false immediately (or never), enabling double-submits; the disabled-button guard doesn't work.
**Why it happens:** Formik only awaits `onSubmit`'s return value. The current code doesn't return the chain and manually calls `setSubmitting(false)` unconditionally.
**How to avoid:** `return emailjs.sendForm(...).then(...).catch(...)` from onSubmit; add `disabled={isSubmitting}` to the button (UI-SPEC Delta Register locks this addition).
**Warning signs:** Button re-enables instantly after click; EmailJS rate limit (1 req/sec, per official docs) errors on rapid clicks.

### Pitfall 5: Test mock shape mismatch after the swap
**What goes wrong:** `jest.mock("@emailjs/browser", () => ({ init: jest.fn(), sendForm: jest.fn() }))` — the factory returns the default-export object, which is correct for `import emailjs from "@emailjs/browser"` (default export verified in tarball `es/index.d.ts`). But if the component switches to named imports (`import { sendForm } from "@emailjs/browser"`), the mock breaks.
**Why it happens:** The package has BOTH a default export and named exports; the mock must match the import style used.
**How to avoid:** Keep the default-import style (D-07 locks `import emailjs from "@emailjs/browser"`); keep the factory returning the object with `init` + `sendForm` jest.fn()s.
**Warning signs:** `emailjs.sendForm is not a function` in tests.

### Pitfall 6: `.textarea` nested SCSS selector stops matching
**What goes wrong:** The messaggio textarea loses its width rules after the swap.
**Why it happens:** style.scss:456-463 styles `.textarea { width: 100%; textarea { ... } }` — written for MUI's wrapper-div DOM. A plain `<textarea className="textarea">` has no inner `textarea` child.
**How to avoid:** Flatten the rule to target the textarea element directly (`.contact_form textarea { width: 100%; max-width: 100% }` or `.textarea { width: 100%; max-width: 100% }`).
**Warning signs:** Textarea renders at default width in the browser.

### Pitfall 7: Error-class assertion ambiguity
**What goes wrong:** The updated test asserts `toHaveClass("error")` but the implementation uses a different class name, or the class lands on the input instead of the helper text.
**Why it happens:** Class naming is agent discretion; the test and implementation must agree, and the helper `<p>` (not just the input) must carry the error class because the test targets `screen.getByText("Nome richiesto")`.
**How to avoid:** Lock the class name `error` (UI-SPEC references "flips to `.error` class") on BOTH the helper `<p>` and the input; assert on the helper text element as the current test does.
**Warning signs:** Test fails with "class not found" while the form visually shows errors.

## Code Examples

Verified patterns from official sources:

### Example 1: Plain-element Formik form (FORM-01 + FORM-02)
```jsx
// Source: Formik API reference (formik.org/docs/api/field) — Field defaults to <input>;
// as="textarea" renders a textarea; useField returns [field, meta]
import React from "react"
import { Formik, Form, Field, useField } from "formik"
import * as yup from "yup"
import emailjs from "@emailjs/browser"

if (process.env.GATSBY_EMAILJS_PUBLIC_KEY) {
  emailjs.init({ publicKey: process.env.GATSBY_EMAILJS_PUBLIC_KEY })
}

const TextFieldConError = ({ placeholder, helperText, ...props }) => {
  const [field, meta] = useField(props)
  const hasError = !!(meta.error && meta.touched)
  return (
    <>
      <input
        {...field}
        {...props}
        placeholder={placeholder}
        className={hasError ? "input error" : "input"}
      />
      <p className={hasError ? "helper error" : "helper"}>{helperText}</p>
    </>
  )
}

const validationSchema = yup.object({
  email: yup.string().email().required(),
  nome: yup.string().required(),
})

const FormikContact = () => (
  <Formik
    initialValues={{ nome: "", email: "", cellulare: "", messaggio: "" }}
    onSubmit={(values, actions) => {
      actions.setStatus({ sendError: false })
      return emailjs
        .sendForm(
          process.env.GATSBY_EMAILJS_SERVICE_ID,
          process.env.GATSBY_EMAILJS_TEMPLATE_ID,
          "#contact_form"
        )
        .then(result => {
          console.log(result.text, result.status)
          actions.resetForm()
          document.location.assign("/thanks")
        })
        .catch(error => {
          console.log(error.text)
          actions.setStatus({ sendError: true })
          actions.setSubmitting(false)
        })
    }}
    validationSchema={validationSchema}
  >
    {props => (
      <Form
        id="contact_form"
        data-netlify="true"
        className="contact_form"
        name="contact_form"
        form-name="contact_form"
        method="POST"
        action="/thanks"
        onSubmit={props.handleSubmit}
      >
        <p className="hidden">
          <label>
            Non compilare questo campo se sei un umano:{" "}
            <input name="bot-field" />
          </label>
        </p>
        <div className="item material">
          <TextFieldConError type="text" name="nome" placeholder="Nome" helperText="Nome richiesto" aria-label="Nome" />
        </div>
        <div className="item">
          <TextFieldConError type="text" name="email" placeholder="Email" helperText="Email richiesta" aria-label="Email" />
        </div>
        <div className="item">
          <Field aria-label="Cellulare" type="text" name="cellulare" placeholder="Cellulare" />
        </div>
        <div className="item">
          <Field as="textarea" rows="5" className="textarea" name="messaggio" aria-label="Scrivi qui il motivo per cui mi contatti" placeholder="Scrivi qui il motivo per cui mi contatti" />
        </div>
        <div className="item text-align-right">
          <button type="submit" className="submit" disabled={props.isSubmitting}>
            Invia
          </button>
        </div>
        {props.status && props.status.sendError && (
          <p className="send-error" role="alert">
            Si è verificato un errore nell'invio del messaggio. Riprova.
          </p>
        )}
      </Form>
    )}
  </Formik>
)
```

### Example 2: @emailjs/browser v4 API (UPGR-05)
```js
// Source: emailjs.com/docs/sdk/init + /docs/sdk/send-form (fetched 2026-08-19)
// init — v4 breaking change: options object, not the v3 "user_XXX" string
emailjs.init({ publicKey: "YOUR_PUBLIC_KEY" })

// sendForm — unchanged signature; returns Promise<{status, text}>
emailjs.sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", "#myForm").then(
  response => console.log("SUCCESS!", response.status, response.text),
  error => console.log("FAILED...", error.text)
)
// Per-call options also supported (official React example pattern):
// emailjs.sendForm(serviceId, templateId, form.current, { publicKey: "..." })
```

### Example 3: Updated test file (D-06, D-10, D-12)
```js
/** @jest-environment jsdom */
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

// MUST precede the import of FormikContact — emailjs.init() runs at module load
jest.mock("@emailjs/browser", () => ({
  init: jest.fn(),
  sendForm: jest.fn(),
}))
import FormikContact from "./formik"

describe("FormikContact validation", () => {
  it("surfaces yup validation errors for empty required fields through the UI", async () => {
    render(<FormikContact />)
    fireEvent.click(screen.getByRole("button", { name: "Invia" }))
    const nomeHelper = screen.getByText("Nome richiesto")
    const emailHelper = screen.getByText("Email richiesta")
    await waitFor(() => expect(nomeHelper).toHaveClass("error"))
    expect(emailHelper).toHaveClass("error")
  })
})

describe("submit failure path", () => {
  it("does NOT navigate to /thanks when emailjs.sendForm rejects — regression net for FORM-04", async () => {
    emailjs.sendForm.mockRejectedValue({ text: "network error" })
    delete window.location
    Object.defineProperty(window, "location", {
      value: { assign: jest.fn() },
      writable: true,
    })
    const assign = window.location.assign

    render(<FormikContact />)
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Lara" } })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "lara@example.com" } })
    fireEvent.click(screen.getByRole("button", { name: "Invia" }))

    await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalledTimes(1))
    expect(assign).not.toHaveBeenCalled()
    // Optional FORM-04 strengthening: assert the inline Italian error appears
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Si è verificato un errore")
    )
  })
})
```

### Example 4: SCSS extension of `.contact_form` (FORM-01, UI-SPEC target)
```scss
// Source: UI-SPEC Visual Delta Register + existing theme variables (_theme-variables.scss)
.contact_form {
  // ...existing rules preserved (margin-top, label, .item, .hidden)...
  .input {
    width: 100%;
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    font-family: var(--font-family);
    font-size: 16px;
    line-height: 1.5;
    &:focus {
      outline: none;
      border-color: var(--input-focus-border);
    }
    &.error {
      border-color: var(--primary-color);
    }
  }
  textarea {
    width: 100%;
    max-width: 100%;
    min-height: 120px;
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    font-family: var(--font-family);
    font-size: 16px;
    line-height: 1.5;
    &:focus {
      outline: none;
      border-color: var(--input-focus-border);
    }
  }
  .helper {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--label-text);
    &.error {
      color: var(--primary-color);
    }
  }
  .submit {
    padding: 8px 24px;
    background-color: var(--button-alternate-color);
    color: var(--button-color);
    border: 1px solid var(--button-alternate-color);
    border-radius: 12px;
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: background 0.3s linear;
    &:hover {
      background-color: var(--button-color);
      color: var(--button-alternate-color);
    }
    &:disabled {
      opacity: 0.7;
      cursor: default;
    }
  }
  .send-error {
    margin-top: 16px;
    color: var(--primary-color);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| emailjs-com v3 (`init("user_XXX")` string) | @emailjs/browser v4 (`init({ publicKey })` object) | v4 released 2021; emailjs-com deprecated | Import style unchanged (default export); only init signature changes; legacy string still accepted for compat |
| MUI v4 TextField/Button | Plain input/textarea/button + SCSS theme variables | This phase (MUI v4 EOL) | No ThemeProvider exists in the codebase, so MUI rendered defaults (indigo button) — the plain version actually matches the site's pink theme better |
| Unconditional redirect after send | Redirect only in `.then`, inline error on `.catch` | This phase (FORM-04) | Honest success reporting; double-send guard added via `disabled={isSubmitting}` |

**Deprecated/outdated:**
- `emailjs-com`: npm deprecation notice "The SDK name changed to @emailjs/browser" (verified)
- `@material-ui/core` / `@material-ui/icons` v4: EOL, superseded by @mui/* v5/v6 — project chose plain SCSS instead (D-02)
- MUI `as={TextField}` Formik binding pattern: replaced by native `as="input"`/`as="textarea"` (Formik's default)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Netlify site env vars for GATSBY_EMAILJS_* are currently unset (no `.env*` files exist locally; Netlify UI not inspectable from this session) | Runtime State Inventory / Environment Availability | Low — the manual checkpoint covers setting them regardless of current state |
| A2 | The EmailJS account still has service `service_q3997uk` and template `template_m6tzcmm` active (values from D-09, not verifiable without dashboard access) | Standard Stack / Code Examples | Medium — if the owner rotated/deleted them, the form fails at runtime; the manual checkpoint should include a live send test |
| A3 | A cache-cleared Netlify deploy is needed after setting env vars (netlify-plugin-gatsby-cache may serve stale inlined bundles) | Common Pitfalls (Pitfall 2) | Low — worst case the first deploy uses old values and a second clear-cache deploy fixes it |
| A4 | The exact error class name will be `error` (UI-SPEC references "flips to `.error` class"; final naming is agent discretion) | Architecture Patterns / Code Examples | Low — test and implementation are written in the same phase and must agree |

## Open Questions

1. **Should the send-error message clear on retry?**
   - What we know: Formik `status` persists until changed; a failed submit followed by a successful one would redirect anyway (so stale error is invisible on success), but a failed→failed sequence should keep showing it.
   - What's unclear: whether to reset `status` at the start of each submit.
   - Recommendation: Reset via `actions.setStatus({ sendError: false })` at the top of onSubmit (shown in Example 1) — cheap and correct.

2. **Keep the `console.log` calls in the promise handlers?**
   - What we know: Current code logs `result.text/status` and `error.text`; they're harmless and useful for debugging.
   - What's unclear: owner preference for production logging.
   - Recommendation: Keep them (matches current behavior, D-04 "behave as before"); removal is a trivial follow-up if desired.

3. **Local dev env provisioning**
   - What we know: No `.env*` files exist; Gatsby loads `.env.development` for `yarn develop` and `.env.production` for builds (both gitignored).
   - What's unclear: whether the owner wants a local `.env.development` created (uncommitted) for manual testing.
   - Recommendation: The plan should create `.env.development` locally (gitignored, not committed) with the D-09 values so `yarn develop` can be manually verified; document it in the plan's manual checkpoint.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | yarn install/build/test | ✓ | 24.18.0 (nvm) | — |
| yarn | package management | ✓ | 1.22.22 | — |
| jest + RTL | FORM-02/FORM-04 regression tests | ✓ | 29.7.0 / 16.3.2 (installed) | — |
| @emailjs/browser | UPGR-05 | ✗ (not yet installed — this phase installs it) | 4.4.1 on registry | — |
| react-icons | D-03 icons | ✓ | 5.7.0 (installed) | — |
| Local env vars (.env.development) | local `yarn develop` form testing | ✗ (no .env files exist) | — | Inline env vars in the dev command, or skip local send testing |
| Netlify env vars (GATSBY_EMAILJS_*) | production form function | ✗ (must be set by owner) | — | None — blocking for production; manual checkpoint |

**Missing dependencies with no fallback:**
- Netlify `GATSBY_EMAILJS_*` env vars — the production form cannot send email until the owner sets them (manual checkpoint, D-09).

**Missing dependencies with fallback:**
- Local `.env.development` — fallback: run `GATSBY_EMAILJS_PUBLIC_KEY=... GATSBY_EMAILJS_SERVICE_ID=... GATSBY_EMAILJS_TEMPLATE_ID=... yarn develop` inline, or verify send behavior only in production after the Netlify checkpoint.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest 29.7.0 + @testing-library/react 16.3.2 + @testing-library/jest-dom 6.6.3 |
| Config file | jest.config.js (babel-preset-gatsby transform, identity-obj-proxy for SCSS, loadershim + jest.setup.js) |
| Quick run command | `yarn test src/components/formik.test.js` |
| Full suite command | `yarn test` (jest --watch=false; 6 test files incl. gatsby-node.test.js, phase3-upgrade-matrix.test.js, gatsby-browser.test.js) |
| Build verification | `yarn build` (gatsby build) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-01 | No @material-ui imports remain; build passes | static grep + build | `grep -rn "@material-ui" src/` (expect 0) + `yarn build` | ✅ (grep is a command, not a file) |
| FORM-02 | Validation errors surface via `.error` class on helper texts | unit | `yarn test src/components/formik.test.js -t "surfaces yup validation errors"` | ✅ (updated in-phase) |
| FORM-03 | No hardcoded key in source; .env.example committed | static grep + git | `grep -rn "user_06xz85hi92oABMZqCIUu7" src/` (expect 0) + `git ls-files .env.example` | ✅ (commands) |
| FORM-04 | Failed send → no redirect, inline error, values kept | unit (unskipped regression) | `yarn test src/components/formik.test.js -t "does NOT navigate"` | ✅ (unskipped in-phase) |
| UPGR-05 | @emailjs/browser in deps; emailjs-com gone; mock updated | unit + lockfile | `yarn test src/components/formik.test.js` + `grep -c emailjs-com yarn.lock` (expect 0) | ✅ (updated in-phase) |

### Sampling Rate
- **Per task commit:** `yarn test src/components/formik.test.js`
- **Per wave merge:** `yarn test` (full suite)
- **Phase gate:** Full suite green + `yarn build` passes before `/gsd-verify-work`

### Wave 0 Gaps
- None — test infrastructure exists from Phase 1 (jest.config.js, jest.setup.js, loadershim.js, __mocks__/). The formik.test.js updates (mock module, class assertion, unskip) are part of this phase's tasks, not Wave 0 scaffolding.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface in this phase |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No protected resources |
| V5 Input Validation | yes | yup schema (email format + required) — unchanged per D-05; honeypot `bot-field` preserved (D-13) |
| V6 Cryptography | no | No crypto operations |

### Known Threat Patterns for {Gatsby static site + client-side EmailJS}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Spam/abuse of the email endpoint | DoS / Tampering | Honeypot field (preserved, D-13); EmailJS rate limit 1 req/sec (official docs); optional `blockList`/`limitRate` init options available in v4 |
| Double-submit / duplicate emails | DoS | `disabled={isSubmitting}` button guard (UI-SPEC Delta Register) + Formik awaiting the returned promise |
| Public key exposure in client bundle | Info disclosure | By design — EmailJS FAQ confirms the public key only triggers predefined templates, cannot send custom spam; GATSBY_ prefix is the correct mechanism for client-exposed values |
| Missing env vars → silent failure | Availability | Guarded init + inline Italian error on `.catch` (graceful degradation, no crash) |
| XSS via form values | Tampering | Form values are sent via FormData to EmailJS and never rendered back into the DOM; the send-error message is static text |
| Malformed form DOM breaking sendForm | Tampering | `#contact_form` selector + `name` attributes preserved; `validateForm` in the SDK throws a clear error if the form element is missing |

## Sources

### Primary (HIGH confidence)
- **emailjs.com/docs/sdk/installation, /sdk/init, /sdk/send-form, /examples/reactjs** (fetched 2026-08-19) — v4 init object signature, sendForm signature/return, React example with per-call publicKey
- **@emailjs/browser@4.4.1 npm tarball** (unpacked and read: `es/index.d.ts`, `es/methods/init/init.js`, `es/methods/sendForm/sendForm.js`, `es/utils/buildOptions/buildOptions.js`, `es/utils/validateParams/validateParams.js`, `es/models/EmailJSResponseStatus.js`) — default export shape, legacy string compat, sync-throw→rejection behavior, zero deps
- **npm registry** (`npm view`) — @emailjs/browser 4.4.1 latest, emailjs-com deprecation notice, react-icons 5.7.0, formik 2.4.9, yup 1.7.1
- **gatsbyjs.com/docs/how-to/local-development/environment-variables** (fetched) — GATSBY_ prefix requirement, .env.development/.env.production loading, build-time inlining
- **node_modules/gatsby/dist/utils/webpack.config.js:102** (read) — `key.match(/^GATSBY_/)` DefinePlugin inclusion for the web target
- **docs.netlify.com/build/frameworks/framework-setup-guides/gatsby** (fetched) — "Environment variables prefixed with GATSBY_ are processed by Gatsby and made available in the browser"
- **docs.netlify.com/environment-variables/overview** (fetched) — env var key naming rules (alphanumeric + underscore, first char a letter), UI/CLI/API setting methods
- **formik.org/docs/api/field** (fetched) — Field defaults to `<input>`, `as="textarea"`, useField meta.error/meta.touched
- **emailjs.com/docs/faq/is-it-okay-to-expose-my-public-key** (fetched) — public key exposure is by design
- **Codebase reads:** formik.js, formik.test.js, top-contacts.js, _theme-variables.scss, style.scss (420-529, 341-385, 50-70), _utility.scss, package.json, jest.config.js, jest.setup.js, loadershim.js, .gitignore, netlify.toml, .nvmrc, contatti.js, thanks.js, 01-01-SUMMARY.md, 04-UI-SPEC.md, 04-CONTEXT.md, 04-DISCUSSION-LOG.md, ROADMAP.md, REQUIREMENTS.md, STATE.md
- **Runtime probes:** `git check-ignore -v .env.example` (gitignored — confirmed), `node -e require('react-icons/ri')` (RiWhatsappLine/RiFacebookBoxLine exist — confirmed), `grep -rn "@material-ui" src/` (only formik.js + top-contacts.js — confirmed), `grep node-sass package.json yarn.lock` (gone — confirmed)

### Secondary (MEDIUM confidence)
- .planning/graphs/graph.json (fresh, 2026-08-19 17:49) — formik.js ↔ formik.test.js ↔ emailjs-com relationships; no additional cross-document surprises surfaced. Graph query tooling unavailable in this session's gsd-tools shim; relationships read via direct grep of the graph file.

### Tertiary (LOW confidence)
- None — all claims either verified against official sources or explicitly logged in the Assumptions Log.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry this session; API shapes verified from official docs + tarball source
- Architecture: HIGH — patterns verified against Formik/EmailJS official docs; codebase structure read directly
- Pitfalls: HIGH — Pitfall 1 (gitignore) and Pitfall 3 (validateParams throw) verified by direct command/source inspection; Pitfall 2 verified in Gatsby's webpack source

**Research date:** 2026-08-19
**Valid until:** 2026-09-19 (stable stack; @emailjs/browser last published 2024-07-11 — slow-moving)
