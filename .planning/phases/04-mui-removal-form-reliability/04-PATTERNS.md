# Phase 4: MUI Removal + Form Reliability - Pattern Map

**Mapped:** 2026-08-19
**Files analyzed:** 7 (6 modified, 1 new)
**Analogs found:** 6 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/formik.js` | component | event-driven (form submit → promise chain) | itself (in-place rewrite) + `src/pages/thanks.js` (react-icons/import style) | exact (self-rewrite) |
| `src/components/top-contacts.js` | component | static render | `src/components/navigation.js` (react-icons ri import) | exact |
| `src/components/formik.test.js` | test | request-response (mock + assert) | itself (in-place update) + `src/templates/blog-list.test.js` (jest.mock patterns) | exact (self-update) |
| `src/assets/scss/style.scss` | stylesheet | transform (SCSS → CSS) | itself: `.contact_form` (434-464), `.button-pink` (341-383), `.icons-top` (54-64) | exact (self-extension) |
| `package.json` | config | — | itself (deps block 26-55); Phase 3 precedent: node-sass → sass swap | exact |
| `.env.example` | config | — | **none in repo** — use RESEARCH.md Example 2 + D-08/D-09 | no-analog |
| `.gitignore` | config | — | itself (line 56-57 dotenv block) | exact |

---

## Pattern Assignments

### `src/components/formik.js` (component, event-driven)

**Analog:** itself — in-place rewrite. The file is the only Formik consumer in the codebase; the rewrite preserves its structure while swapping MUI elements for plain ones. Import-order and icon conventions come from `src/pages/thanks.js` / `src/components/navigation.js`.

**Current imports to transform** (formik.js:1-8):
```js
import React from "react"
import { Formik, Form, Field, useField } from "formik"
import { TextField, Button } from "@material-ui/core"   // ← DELETE (D-01)
import * as yup from "yup"
import emailjs from "emailjs-com"                        // ← → "@emailjs/browser" (D-07)

//https://dashboard.emailjs.com/admin
emailjs.init("user_06xz85hi92oABMZqCIUu7")               // ← → guarded env-var init (D-08)
```

**Target import block** (RESEARCH.md Example 1, lines 315-322 — verified against Formik + EmailJS v4 docs):
```js
import React from "react"
import { Formik, Form, Field, useField } from "formik"
import * as yup from "yup"
import emailjs from "@emailjs/browser"

if (process.env.GATSBY_EMAILJS_PUBLIC_KEY) {
  emailjs.init({ publicKey: process.env.GATSBY_EMAILJS_PUBLIC_KEY })
}
```
Note: v4 `init()` takes an options object `{ publicKey }`, NOT the v3 string (RESEARCH.md §State of the Art). Guard prevents init with `undefined` (Pitfall 3).

**TextFieldConError pattern to preserve** (formik.js:10-23) — the `useField` + `meta.error && meta.touched` logic stays; only the render target changes:
```js
const TextFieldConError = ({ placeholder, ...props }) => {
  const [field, meta] = useField(props)
  const errorText = meta.error && meta.touched ? meta.error : ""
  return (
    <Field
      placeholder={placeholder}
      {...field}
      helperText={errorText}
      error={!!errorText}
      as={TextField}          // ← → plain <input> + helper <p> (RESEARCH.md Pattern 1)
      {...props}
    />
  )
}
```
**Critical ordering fact** (formik.test.js:17-20 comment): `{...props}` spreads AFTER `helperText={errorText}`, so the static helperText props ("Nome richiesto"/"Email richiesta") override the yup messages. The observable validation signal is the error STATE, not the message text. The plain replacement must render the static helper text always-visible and flip it to the `error` class (D-05, UI-SPEC Copywriting Contract).

**Target field pattern** (RESEARCH.md Example 1, lines 324-338):
```jsx
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
Class name `error` is locked by RESEARCH.md Pitfall 7 + Assumption A4: it must land on BOTH the input and the helper `<p>` (the test asserts on the helper text element).

**onSubmit — the bug to fix** (formik.js:39-52, current anti-pattern):
```js
onSubmit={(values, actions) => {
  emailjs
    .sendForm("service_q3997uk", "template_m6tzcmm", "#contact_form")
    .then(result => {
      console.log(result.text, result.status)
    })
    .catch(error => {
      console.log(error.text)
      return
    })
  actions.resetForm()                    // ← BUG: runs unconditionally
  actions.setSubmitting(false)            // ← BUG: runs unconditionally
  document.location.assign("/thanks")     // ← BUG: false success (FORM-04)
}}
```

**Target onSubmit** (RESEARCH.md Example 1, lines 348-366 — return the promise so Formik awaits it, Pitfall 4):
```jsx
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

**Form JSX to preserve verbatim** (formik.js:56-71): the `<Form>` attributes (`id="contact_form"`, `data-netlify="true"`, `className="contact_form"`, `name`, `form-name`, `method="POST"`, `action="/thanks"`, `onSubmit={props.handleSubmit}`) and the honeypot block (D-13):
```jsx
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
```

**Field items to preserve** (formik.js:73-114) — same names, placeholders, aria-labels (test selectors depend on them, UI-SPEC Copywriting Contract):
- nome: `TextFieldConError type="text" name="nome" placeholder="Nome" helperText="Nome richiesto" aria-label="Nome"` inside `<div className="item material">`
- email: `TextFieldConError type="text" name="email" placeholder="Email" helperText="Email richiesta" aria-label="Email"` inside `<div className="item">`
- cellulare: `<Field aria-label="Cellulare" type="text" name="cellulare" placeholder="Cellulare" />` (plain Field, default `as="input"`)
- messaggio: `<Field as="textarea" rows="5" className="textarea" name="messaggio" aria-label="Scrivi qui il motivo per cui mi contatti" placeholder="Scrivi qui il motivo per cui mi contatti" />` — `as="textarea"` replaces `multiline as={TextField}`

**Button + send-error** (RESEARCH.md Example 1, lines 398-407 — `disabled={isSubmitting}` is the UI-SPEC Delta Register double-send guard):
```jsx
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
```

**Error handling pattern:** no try/catch (CONVENTIONS.md §Error Handling — the codebase uses promise `.catch` only). Keep the `console.log` calls (RESEARCH.md Open Question 2: keep, matches D-04 "behave as before").

---

### `src/components/top-contacts.js` (component, static render)

**Analog:** `src/components/navigation.js` (react-icons ri import, lines 1-3) + `src/pages/thanks.js` (icon with `style={{ fontSize }}`, lines 17-22).

**Current file** (top-contacts.js:1-17, full):
```js
import React from "react"
import FacebookIcon from "@material-ui/icons/Facebook"   // ← DELETE
import WhatsAppIcon from "@material-ui/icons/WhatsApp"   // ← DELETE
const TopContacts = () => {
  return (
    <div className="icons-top">
      <a href="https://wa.me/393356785620" target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon width="24" height="24" />
      </a>
      <a href="https://www.facebook.com/larenlarylara" target="_blank" rel="noopener noreferrer">
        <FacebookIcon width="24" height="24" />
      </a>
    </div>
  )
}

export default TopContacts
```

**Import pattern** (navigation.js:3 — the exact ri-set import style used in 7 files):
```js
import { RiMenu3Line, RiCloseLine } from "react-icons/ri"
```
→ becomes `import { RiWhatsappLine, RiFacebookBoxLine } from "react-icons/ri"` (D-03).

**Icon sizing pattern** (thanks.js:17-22 — react-icons takes `style={{ fontSize }}`, not `width`/`height` attributes):
```jsx
<RiCheckboxCircleLine
  style={{
    fontSize: "128px",
    color: "var(--primary-color)",
  }}
/>
```
→ For 24px icons: `style={{ fontSize: "24px" }}` (or `size="24"`). Color must NOT be set inline — UI-SPEC Delta Register: "same color inheritance from `.icons-top a`" (style.scss:54-64 handles `color: #8c1a3f` and `:hover { color: var(--primary-color) }`).

**Structure to preserve:** the `<div className="icons-top">` wrapper, both `<a>` hrefs, `target="_blank" rel="noopener noreferrer"` — unchanged (D-04).

---

### `src/components/formik.test.js` (test, request-response)

**Analog:** itself — in-place update. Mock-before-import pattern from itself (lines 5-10); jsdom test structure from `src/components/navigation.test.js`; `__esModule` mock convention from `src/templates/blog-list.test.js:7-10` (only needed for component mocks, not for the emailjs object mock).

**Current mock block to update** (formik.test.js:5-10, D-10):
```js
// MUST precede the import of FormikContact — emailjs.init() runs at module load (formik.js:8)
jest.mock("emailjs-com", () => ({
  init: jest.fn(),
  sendForm: jest.fn(),
}))
import FormikContact from "./formik"
```
→ change module name to `"@emailjs/browser"`. Keep the factory returning the default-export object `{ init, sendForm }` — matches `import emailjs from "@emailjs/browser"` default-import style (RESEARCH.md Pitfall 5). Keep the comment (init still runs at module load, now guarded).

**Error-class assertion to update** (formik.test.js:21-24, D-06):
```js
const nomeHelper = screen.getByText("Nome richiesto")
const emailHelper = screen.getByText("Email richiesta")
await waitFor(() => expect(nomeHelper).toHaveClass("Mui-error"))   // ← → "error"
expect(emailHelper).toHaveClass("Mui-error")                        // ← → "error"
```
Assert on the helper text element (not the input) — the implementation must put the `error` class on the helper `<p>` (RESEARCH.md Pitfall 7).

**Test to unskip** (formik.test.js:31-53, D-12) — remove `it.skip`, keep the body; the location-stub pattern is already correct:
```js
it("does NOT navigate to /thanks when emailjs.sendForm rejects — regression net for FORM-04", async () => {
  emailjs.sendForm.mockRejectedValue({ text: "network error" })
  // stub document.location.assign so jsdom doesn't actually navigate
  delete window.location
  Object.defineProperty(window, "location", {
    value: { assign: jest.fn() },
    writable: true,
  })
  const assign = window.location.assign

  render(<FormikContact />)
  fireEvent.change(screen.getByLabelText("Nome"), {
    target: { value: "Lara" },
  })
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "lara@example.com" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Invia" }))

  await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalledTimes(1))
  expect(assign).not.toHaveBeenCalled()
})
```
Optional FORM-04 strengthening (RESEARCH.md Example 3, lines 470-473): assert the inline alert appears:
```js
await waitFor(() =>
  expect(screen.getByRole("alert")).toHaveTextContent("Si è verificato un errore")
)
```

**Test environment header** (formik.test.js:1): `/** @jest-environment jsdom */` — keep. jest.config.js already maps SCSS via identity-obj-proxy (jest.config.js:6), so the new SCSS classes need no test config changes.

---

### `src/assets/scss/style.scss` (stylesheet, transform)

**Analog:** itself — extend the existing `.contact_form` block in place. Button styling copies `.button-pink` (style.scss:341-383); icon hover already handled by `.icons-top` (style.scss:54-64).

**Existing `.contact_form` block to extend** (style.scss:434-464):
```scss
.contact_form {
  margin-top: 36px;

  /* label + .MuiInput-formControl {
    margin-top: 0;
  } */
  label {
    color: var(--label-text);
    display: block;
  }
  .item {
    padding-bottom: 16px;

    &.material {
      padding: 0;
    }
  }

  .hidden {
    display: none;
  }

  .textarea {
    width: 100%;

    textarea {
      max-width: 100%;
      width: 100%;
    }
  }
}
```
**Pitfall 6 (locked):** the nested `.textarea textarea` selector (456-463) was written for MUI's wrapper-div DOM. With a plain `<textarea className="textarea">` the element IS the textarea — flatten the rule (e.g. `.contact_form textarea { width: 100%; max-width: 100% }`) or the width rules silently stop applying. The commented-out MUI label rule (437-439) can be deleted.

**Button pattern to copy** (style.scss:341-360, `.button-pink` — the UI-SPEC Delta Register target):
```scss
.button-pink,
.button-white {
  --padding: 20px;
  --margin: 20px;
  display: inline-flex;
  align-items: center;
  padding: var(--padding) calc(var(--padding) * 2);
  background-color: var(--button-alternate-color);
  color: var(--button-color);
  border-radius: 12px;
  border: 1px solid var(--button-alternate-color);
  text-decoration: none;
  appearance: none;
  font-size: inherit;
  line-height: 1;
  transition: background 0.3s linear;
  &:hover {
    background-color: var(--button-color);
    color: var(--button-alternate-color);
  }
```
→ `.submit` copies: `background-color: var(--button-alternate-color)`, `color: var(--button-color)`, `border-radius: 12px`, `border: 1px solid var(--button-alternate-color)`, hover inversion, `transition: background 0.3s linear`. Plus UI-SPEC Typography: 14px/500/line-height 1, `text-transform: uppercase; letter-spacing: 0.03em`; plus `&:disabled { opacity: 0.7; cursor: default }` (Delta Register loading state).

**Theme variables available** (`_theme-variables.scss:7-31` — the ONLY color source, D-02 "no new colors"):
```scss
:root {
  --font-family-titles: "Parisienne", cursive;
  --font-family: "Ubuntu", sans-serif;
  --font-size-small: 12px;

  --primary-color: #ff1c65;          // error states ONLY (UI-SPEC Color)
  --header-bg: var(--primary-color);
  --home-link-color: #ff1c65;
  --home-link-hover-color: var(--primary-color);
  --button-color: #ffffff;
  --button-alternate-color: #ff0060; // submit button background ONLY
  --post-link-color: #ff0060;
  --nav-link-hover-bg: #111;
  --text-color-meta: rgba(0, 0, 0, 0.5);
  --label-text: rgba(0, 0, 0, 0.5);  // helper text color
  --input-focus-border: #83aaac;     // focus border ONLY
  --grid-gap: 30px;
}
```

**Target SCSS block** (RESEARCH.md Example 4, lines 481-550 — implements the UI-SPEC Visual Delta Register TARGET column):
```scss
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
SCSS conventions: nested selectors, kebab-case classes, `var(--x)` custom properties (CONVENTIONS.md §SCSS Conventions). The `.item.material { padding: 0 }` rule (447-449) is preserved as-is (UI-SPEC Spacing Scale).

---

### `package.json` (config)

**Analog:** itself — dependencies block (26-55). Phase 3 precedent: node-sass → sass swap (now `"sass": "^1.30.0"` at line 53).

**Current deps to change** (package.json:26-31):
```json
"dependencies": {
  "@material-ui/core": "^4.12.4",     // ← REMOVE (D-01)
  "@material-ui/icons": "^4.11.3",    // ← REMOVE (D-01)
  "decap-cms-app": "3.6.4",
  "emailjs-com": "^3.2.0",            // ← REMOVE (D-07)
  "formik": "^2.2.9",
```
→ add `"@emailjs/browser": "4.4.1"` (RESEARCH.md §Standard Stack — verified latest; pin exact per the project's mixed pin/caret style). Install commands (RESEARCH.md §Standard Stack):
```bash
yarn add @emailjs/browser@4.4.1
yarn remove @material-ui/core @material-ui/icons emailjs-com
```
**Environment gotcha (AGENTS.md):** Node 24 enforced via `engines` + `engine-strict` + `scripts/check-node-version.js` — run yarn with `nvm use 24` active. yarn 1.22 only (never npm — would reintroduce a second lockfile).

---

### `.env.example` (config, NEW — no analog in repo)

**No analog found.** No `.env*` file exists in the repo (verified: `git ls-files | grep -i env` → empty). The only `process.env` consumer in the codebase is `.planning/baseline/capture-baseline.js:117-118` (`process.env.PSI_API_KEY` — a Node script, not a Gatsby component). Use RESEARCH.md Example 2 + D-08/D-09 for content.

**Content pattern** (D-08/D-09 values as placeholders):
```bash
# EmailJS credentials — exposed client-side via Gatsby's GATSBY_ prefix.
# Copy to .env.development (local) and set in Netlify UI (production).
GATSBY_EMAILJS_PUBLIC_KEY=user_06xz85hi92oABMZqCIUu7
GATSBY_EMAILJS_SERVICE_ID=service_q3997uk
GATSBY_EMAILJS_TEMPLATE_ID=template_m6tzcmm
```
**Critical gotcha (RESEARCH.md Pitfall 1, verified):** `.gitignore:57` `.env*` matches `.env.example` — `git check-ignore -v .env.example` → `.gitignore:57:.env*`. A plain `git add .env.example` silently fails. The durable fix is the `.gitignore` negation rule (next section).

---

### `.gitignore` (config)

**Analog:** itself — the dotenv block (lines 56-57):
```
# dotenv environment variable files
.env*
```
→ add the negation rule AFTER line 57 (RESEARCH.md Pitfall 1):
```
# dotenv environment variable files
.env*
!.env.example
```
Verification: `git check-ignore -v .env.example` must return exit 1 (not ignored) after the edit; `git ls-files .env.example` must list the file after commit (RESEARCH.md §Validation Architecture, FORM-03 row).

---

## Shared Patterns

### Prettier style (applies to all JS/SCSS edits)
**Source:** `.prettierrc:1-4`
```json
{
  "arrowParens": "avoid",
  "semi": false
}
```
No semicolons, double quotes, `props =>` without parens, 2-space indent. Run `yarn format` after edits. No ESLint exists (CONVENTIONS.md §Code Style).

### Import order (applies to formik.js, top-contacts.js, formik.test.js)
**Source:** CONVENTIONS.md §Import Organization (verified in thanks.js:1-6, navigation.js:1-3):
1. React first: `import React from "react"`
2. Gatsby imports
3. Third-party libraries (formik, yup, emailjs, react-icons)
4. Local components via relative paths
5. Assets/styles last

### react-icons ri import (applies to top-contacts.js)
**Source:** 7 files, e.g. `src/components/navigation.js:3`:
```js
import { RiMenu3Line, RiCloseLine } from "react-icons/ri"
```
Sizing via `style={{ fontSize: "24px" }}` (thanks.js:19 pattern) — react-icons ignores `width`/`height` attributes.

### jest.mock-before-import (applies to formik.test.js)
**Source:** `src/components/formik.test.js:5-10`:
```js
// MUST precede the import of FormikContact — emailjs.init() runs at module load (formik.js:8)
jest.mock("emailjs-com", () => ({
  init: jest.fn(),
  sendForm: jest.fn(),
}))
import FormikContact from "./formik"
```
babel-jest hoists `jest.mock` anyway, but the visual order documents the module-load side effect. The factory returns the default-export object — matches `import emailjs from "@emailjs/browser"` (Pitfall 5).

### SCSS theme variables (applies to style.scss)
**Source:** `src/assets/scss/_theme-variables.scss:7-31` — all form colors come from `--primary-color`, `--button-alternate-color`, `--button-color`, `--label-text`, `--input-focus-border`, `--font-family`. No new colors (D-02, UI-SPEC Color).

### Italian UI copy (applies to formik.js)
**Source:** UI-SPEC Copywriting Contract — "Invia", "Nome richiesto", "Email richiesta", "Si è verificato un errore nell'invio del messaggio. Riprova.", honeypot label "Non compilare questo campo se sei un umano:". All locked.

### Env-var access (applies to formik.js)
**Source:** RESEARCH.md Pitfall 2 — `process.env.GATSBY_*` is inlined at build time by Gatsby's DefinePlugin (verified in `node_modules/gatsby/dist/utils/webpack.config.js:102`). No runtime lookup; Netlify vars must be set before the first post-phase deploy (manual checkpoint, 04-VALIDATION.md §Manual-Only Verifications).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.env.example` | config | — | No `.env*` file exists anywhere in the repo; the only `process.env` consumer is a Node baseline script (`.planning/baseline/capture-baseline.js`). Planner should use RESEARCH.md Example 2 + D-08/D-09 values and the `.gitignore` negation fix (Pitfall 1). |

## Metadata

**Analog search scope:** `src/components/`, `src/templates/`, `src/pages/`, `src/assets/scss/`, repo root configs, `.planning/phases/01-*` (test scaffolding precedent)
**Files scanned:** formik.js, formik.test.js, top-contacts.js, navigation.js, navigation.test.js, blog-list.test.js, thanks.js, 404.js, contatti.js, style.scss (full), _theme-variables.scss, _defaults.scss, _utility.scss, package.json, .gitignore, .prettierrc, jest.config.js, jest.setup.js, __mocks__/gatsby.js, gatsby-config.js, netlify.toml, 04-UI-SPEC.md, 04-VALIDATION.md, 04-DISCUSSION-LOG.md, 01-01-PLAN.md
**Runtime probes:** `git check-ignore -v .env.example` (gitignored — confirmed), `git ls-files | grep -i env` (no env files tracked — confirmed)
**Pattern extraction date:** 2026-08-19
