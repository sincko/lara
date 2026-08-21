---
status: complete
files_reviewed:
  - src/components/formik.js
  - src/components/formik.test.js
  - src/components/top-contacts.js
  - src/assets/scss/style.scss
  - .env.example
  - .gitignore
  - package.json
critical: 0
warning: 4
info: 5
total: 9
---

# Phase 4 Code Review — mui-removal-form-reliability

## Summary

Phase 4 delivers on its contract: MUI v4 is fully gone from `src/` (grep confirms zero
`@material-ui`/`@mui` references), the emailjs swap to `@emailjs/browser` 4.4.1 is correct
(`init({ publicKey })` + `sendForm(serviceId, templateId, selector)` matches the v4 API),
and the FORM-04 false-success bug is genuinely fixed — `document.location.assign("/thanks")`
now lives exclusively in the `.then` branch (formik.js:48-52). The regression test is a real
net: it stubs `window.location.assign`, forces `sendForm` to reject, and asserts both
no-navigation and the inline Italian error. No critical findings.

## Findings

### CR-01 — none

No critical findings.

### WR-01 — `.env.example` commits real EmailJS credentials to git

**File:** `.env.example:3-5`

The file contains the actual production values for `GATSBY_EMAILJS_PUBLIC_KEY`,
`GATSBY_EMAILJS_SERVICE_ID`, and `GATSBY_EMAILJS_TEMPLATE_ID`, and the file is tracked
(`!.env.example` negation in `.gitignore:58` is correct and intentional).

Risk assessment:

- **Public key** (`user_...`): client-exposed by design — every visitor's browser needs it.
  Committing it is standard practice and not a leak.
- **Service ID / Template ID**: semi-sensitive. They are not secrets (they are also shipped
  to the browser in the production bundle), but they are the identifiers an attacker needs
  to send spam through the account. Committing them makes the account trivially enumerable
  from the repo. EmailJS's own abuse protection (rate limits, domain allow-listing) is the
  real defense, not secrecy of these IDs.
- **Recommendation:** keep the file (it is the documented onboarding path), but add a
  warning comment stating the values are real production credentials, that the account
  should have rate limiting + domain allow-listing enabled in the EmailJS dashboard, and
  that rotating the public key invalidates the committed example. Optionally replace
  values with `your_...` placeholders and keep real values only in Netlify env vars —
  but that trades onboarding convenience; either is defensible, the warning is not.

### WR-02 — `console.log` of EmailJS internals in production code

**File:** `src/components/formik.js:49,54`

`console.log(result.text, result.status)` and `console.log(error.text)` ship to production.
`error.text` is the EmailJS error message (e.g. "The service ID is required..."), which
leaks configuration details to the console. Low severity, but the success log is pure noise
and the error log is better served by a structured/guarded logger. Consider removing or
gating behind `process.env.NODE_ENV !== "production"`.

### WR-03 — `TextFieldConError` spreads `{...props}` after `{...field}` and after `helperText`

**File:** `src/components/formik.js:10-24`

Two consequences:

1. `{...props}` after `{...field}` lets any prop in `props` silently override Formik's
   `name`/`value`/`onChange`/`onBlur` bindings. Currently harmless (callers pass only
   `type`, `name`, `placeholder`, `aria-label`, `helperText`), but it is a footgun.
2. The static `helperText` prop overrides the yup error message, so users never see the
   actual validation message — only the class flip to `.error`. The test comment
   (formik.test.js:18-21) documents this as known behavior, and the UI-SPEC preservation
   contract may have mandated the static strings. If so, fine; otherwise render
   `meta.error || helperText` so the yup message surfaces. At minimum, destructure
   `helperText` out of `props` before spreading to avoid the silent override.

### WR-04 — Icon-only links in `top-contacts.js` lack accessible names

**File:** `src/components/top-contacts.js:6-11`

Both `<a>` elements contain only an SVG icon with no text and no `aria-label`. Screen
readers announce them as "link" (or the raw SVG title, which is absent here). Add
`aria-label="WhatsApp"` and `aria-label="Facebook"` (or visually-hidden text). The
react-icons swap itself is correct: `RiWhatsappLine`/`RiFacebookBoxLine` exist in
`react-icons/ri` (verified against the installed package) and `react-icons@^5.7.0` is
pinned in package.json:50.

### IN-01 — `setStatus({ sendError: false })` at submit start is correct but only clears the flag, not the message

**File:** `src/components/formik.js:41`

The reset is honest: a second submit after a failure re-hides the error until the new
attempt resolves. Note the error message stays mounted until the next submit begins
(no optimistic clear on field change) — acceptable UX, just documenting the behavior.

### IN-02 — `disabled={props.isSubmitting}` guard is correct, and the manual `setSubmitting(false)` in `.catch` is required

**File:** `src/components/formik.js:56,119`

Verified against Formik 2.2.9 internals: when `onSubmit` returns a promise, Formik wraps it
and dispatches `SUBMIT_SUCCESS`/`SUBMIT_FAILURE` (formik.cjs.development.js:886-905), but
the `.catch` in `onSubmit` swallows the rejection, so Formik never sees the failure and
never resets `isSubmitting`. The explicit `actions.setSubmitting(false)` in the `.catch`
(formik.js:56) is therefore necessary, not redundant — without it the button would stay
disabled forever after one failure. Good.

### IN-03 — Env-var guarded init is correct, but `sendForm` is not guarded

**File:** `src/components/formik.js:6-8,42-47`

`init` is correctly skipped when `GATSBY_EMAILJS_PUBLIC_KEY` is absent. However,
`sendForm` is called unconditionally with `process.env.GATSBY_EMAILJS_SERVICE_ID` /
`GATSBY_EMAILJS_TEMPLATE_ID`; if those are undefined, `@emailjs/browser` throws
synchronously inside `validateParams` ("The service ID is required..."). That throw
happens inside Formik's `executeSubmit` try/catch, which rethrows it — the promise chain
never reaches the `.catch`, so `isSubmitting` stays true and the button freezes. In
practice the build always has the vars (Netlify env + `.env.development`), so this is
informational; a defensive early-return in `onSubmit` when vars are missing would make the
failure mode graceful.

### IN-04 — `style.scss` `.contact_form` block complies with the theme-variable contract

**File:** `src/assets/scss/style.scss:434-520`

All colors come from existing theme variables (`--label-text`, `--input-focus-border`,
`--primary-color`, `--button-color`, `--button-alternate-color`, `--font-family`) — no new
hex values introduced. Error state reuses `--primary-color` (consistent with the site's
accent-as-error convention), focus uses `--input-focus-border`, and the disabled button
state (opacity 0.7 + `cursor: default`) is present. The flattened `textarea` rule
(style.scss:469-483) is a plain element selector scoped under `.contact_form` — no MUI
class remnants. One nit: `textarea` and `.input` duplicate ~10 lines of identical
declarations; a shared selector would be DRYer, but the flattening was likely deliberate
per the UI-SPEC.

### IN-05 — Test hygiene: `window.location` stub is not restored

**File:** `src/components/formik.test.js:33-37`

`delete window.location` + `Object.defineProperty` is never undone. Jest gives each test
file a fresh jsdom environment, so this cannot leak across files, but it would leak across
tests within this file if more are added later. Consider `afterEach` cleanup or
`jest.spyOn`-style restoration. The mock itself is correct: `jest.mock("@emailjs/browser")`
precedes the component import (required because `emailjs.init()` runs at module load), and
the regression test's assertions genuinely catch FORM-04 — a revert to the old
`finally`-redirect code would fail on `expect(assign).not.toHaveBeenCalled()`.
