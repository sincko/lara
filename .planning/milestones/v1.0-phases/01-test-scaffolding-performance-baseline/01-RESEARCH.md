# Phase 1: Test Scaffolding + Performance Baseline - Research

**Researched:** 2026-08-18
**Domain:** Jest 29 + @testing-library/react scaffolding for Gatsby 5.15; Lighthouse CLI + PageSpeed Insights performance baseline
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use Jest 29 + babel-jest with `babel-preset-gatsby` and `gatsby-plugin-jest` (official Gatsby plugin providing automatic mocks for `gatsby` module exports: `Link`, `graphql`, `useStaticQuery`, `StaticQuery`). — **Reversibility:** reversible — test tooling can be swapped without touching app code
- **D-02:** Add `@testing-library/react` + `@testing-library/jest-dom` for component tests.
- **D-03:** `yarn test` script replaced with the real jest run — must exit 0 with a real suite (FNDT-05).
- **D-04:** Priority targets (pure logic, minimal Gatsby dependency):
  - `src/components/formik.js` — yup validation schema and `TextFieldConError` error-text logic
  - `src/templates/blog-list.js` — pagination math (`prevPage`/`nextPage`/`isFirst`/`isLast`, lines 80-84)
  - `src/components/navigation.js` — `handleToggleClick` state toggle
  - `gatsby-node.js` — page creation logic (createPages)
- **D-05:** Form submit failure path must be covered (the false-success bug in `formik.js` — success reported even when email send fails). This test will be the regression net for the Phase 4 fix.
- **D-06:** At least one passing assertion per covered area; snapshot tests for small presentational components (header, footer, logo) are optional and left to the agent's discretion.
- **D-07:** `emailjs-com` must be mocked before importing `FormikContact` (it calls `emailjs.init()` at module load time in `formik.js:8`).
- **D-08:** Capture baseline with Lighthouse CLI (local) + PageSpeed Insights (live site), median of 3 runs, mobile profile, for LCP, CLS, INP.
- **D-09:** Store baseline results in `.planning/` (e.g., `.planning/baseline/`) so Phase 6 can compare against them.
- **D-10:** Co-located `*.test.js` files next to components (Gatsby ecosystem default per TESTING.md), e.g., `src/components/formik.test.js`.

### the agent's Discretion
- Exact jest config details (transform, moduleNameMapper for gatsby mocks), whether to add coverage thresholds, and snapshot test selection are left to the planner/executor.

### Deferred Ideas (OUT OF SCOPE)
- ESLint flat config — dev-only tooling, deferred to v2 (MODR-03)
- Coverage thresholds enforcement — optional, agent's discretion
- E2E testing (Cypress/Playwright) — overkill for site size, not in scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FNDT-05 | Minimal test suite scaffolded (jest + testing-library) covering form validation, pagination math, and page creation | Sections: Standard Stack (exact devDependency matrix + versions), Architecture Patterns (official jest.config.js / jest-preprocess.js / __mocks__/gatsby.js), Code Examples (per-target test patterns), Common Pitfalls (SCSS/images/gatsby transform, emailjs mock, jsdom vs node env) |
| FNDT-06 | Performance baseline captured (Lighthouse + PSI on live site) before any changes | Sections: Standard Stack (lighthouse 13.4.1 CLI flags), Code Examples (median-of-3 capture commands + metric extraction), Environment Availability (Chrome 151 ✓, Node 24 ✓ / .nvmrc 20 ✗ for LH13, PSI quota 429 observed), State of the Art (LCP/CLS/INP thresholds, PSI lab-data stability) |
</phase_requirements>

## Project Constraints (from AGENTS.md)

No `./AGENTS.md` exists in the repo — no project-specific agent directives to honor beyond `.planning/` docs (CONVENTIONS.md: Prettier-only, no semicolons, `arrowParens: "avoid"`, double quotes, kebab-case files; phase boundary: **no production code changes in this phase**).

## Summary

This phase has two halves: (1) scaffold a real Jest 29 + @testing-library/react regression net on a repo that currently has zero tests and a `test` script that exits 1, and (2) capture a pre-change Lighthouse + PSI Core Web Vitals baseline (LCP, CLS, INP; median of 3, mobile) stored in `.planning/baseline/` for Phase 6 comparison.

**Critical finding — locked decision D-01 is partially impossible:** `gatsby-plugin-jest` is **no longer on the npm registry** (verified E404 via `npm view`, the registry API, and the GitHub repo — the package was unpublished). The current official Gatsby unit-testing guide (fetched live from gatsbyjs.com/docs + the raw master docs source) no longer mentions it and instead prescribes `jest + babel-jest + babel-preset-gatsby + identity-obj-proxy` with a **manual `__mocks__/gatsby.js`** that provides exactly the mocks D-01 wants (`Link`, `graphql`, `useStaticQuery`, `StaticQuery`/`Slice`). The official `examples/using-jest` repo pins jest ^29 + jest-environment-jsdom ^29 + @testing-library/react. Recommendation: adopt the official manual-mock setup — D-01's *mechanism* is impossible, its *intent* (automatic Gatsby mocks) is fully preserved, and the swap is trivially reversible.

Jest 29.7.0 is the correct Jest line (last 29.x release; the Gatsby docs say "Jest 29 or above" and the official example pins ^29.1.2 — jest 30, released May 2026, is unnecessary risk). `jest-environment-jsdom@29.7.0` must be installed separately and minor-version-matched to jest. All four priority test targets are testable without touching production code: formik.js exports only `FormikContact`, so its validation must be tested **behaviorally** (RTL render + fireEvent — yup messages assert through the UI); blog-list pagination math and navigation toggle are plain RTL tests with `gatsby` mocked; gatsby-node.js is a **node-environment** test (`@jest-environment node` docblock) calling `createPages` with mocked `graphql`/`actions`/`reporter` args.

For the baseline: Lighthouse CLI 13.4.1 works locally (google-chrome 151 auto-detected; local Node 24.18 satisfies LH's `>=22.19` requirement, though `.nvmrc`'s Node 20 does not — run with the nvm-managed Node, do not touch `.nvmrc` this phase). PSI API v5 works without an API key but the anonymous shared quota was **exhausted on 2026-08-18 (HTTP 429 observed live)** — plan a fallback (Lighthouse CLI against the live URL, or a free API key as an open question for the user). Baseline files must record methodology metadata (dates, tool versions, URLs, commit SHA) so Phase 6 compares apples to apples.

**Primary recommendation:** Use the official Gatsby manual-mock Jest setup (jest@29.7.0, babel-jest@29.7.0, babel-preset-gatsby@3.16.0, jest-environment-jsdom@29.7.0, @testing-library/react@16.3.2, @testing-library/jest-dom@6.6.3, identity-obj-proxy@3.0.0) — NOT gatsby-plugin-jest (unpublished). Capture baseline via `npx lighthouse <url> --only-categories=performance --output=json --output-path=... --form-factor=mobile` ×3 + PSI API ×3, median per metric, stored in `.planning/baseline/`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Form validation logic (yup schema, TextFieldConError) | API/Backend — none (single-tier) | — | This repo is a single-tier static Gatsby site; the tested code is client/browser React. Tests run in jsdom, which emulates the browser tier, so component/validation behavior belongs to the browser tier under test |
| Pagination math (blog-list) | Browser/Client | — | Pure render-time computation in a React template; jsdom test |
| Navigation state toggle | Browser/Client | — | React class-component state; jsdom test |
| Page creation logic (gatsby-node createPages) | API/Backend (Gatsby Node API) | — | Runs in Node at build time, never in a browser; **must be tested in `@jest-environment node`, not jsdom** |
| Core Web Vitals baseline | CDN/Static (live site) | Browser/Client (emulation) | Baseline measures the *deployed* site (laryart.it) from the outside; Lighthouse/PSI emulate a mobile browser client against the CDN-served static output |

**Single-tier nuance:** the app itself is a single-tier static site (no SSR/API servers), but this phase deliberately spans two runtime contexts: jsdom (component tests) and Node (gatsby-node tests) plus an external measurement context (Lighthouse/PSI on the live site). The map above records which tier each capability belongs to so the planner does not, e.g., test `gatsby-node.js` in jsdom or unit-test GraphQL queries (build-time `reporter.panicOnBuild` already covers those).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| jest | 29.7.0 | Test runner + assertions | Official Gatsby using-jest example pins ^29 [VERIFIED: npm registry]; Gatsby docs: "Jest 29 or above" [CITED: gatsbyjs.com/docs/how-to/testing/unit-testing]; jest 30 (May 2026) is unnecessary risk |
| babel-jest | 29.7.0 | Babel transform bridge | Must minor-match jest; official example pins ^29.1.2 [VERIFIED: npm registry] |
| babel-preset-gatsby | 3.16.0 | Babel preset matching Gatsby 5's own build preset | Official guide: "install babel-jest and babel-preset-gatsby to ensure the babel preset(s) match what are used internally" [CITED: gatsbyjs.com/docs/how-to/testing/unit-testing]; version 3.16.0 is the same line gatsby@5.15.0 already depends on (`"babel-preset-gatsby": "^3.15.0"`) [VERIFIED: npm registry + repo package.json] |
| jest-environment-jsdom | 29.7.0 | jsdom test environment for component tests | Jest 29 no longer bundles jsdom; must be installed separately and minor-matched to jest [CITED: jestjs.io/docs/configuration#testenvironment] [VERIFIED: npm registry]; official example pins ^29.1.2 |
| @testing-library/react | 16.3.2 | Render React components in tests | Gatsby's recommended utility: "we highly recommend checking out the Testing React components guide. It explains how to install @testing-library/react" [CITED: gatsbyjs.com/docs/how-to/testing/unit-testing]; peers `react ^18` — matches repo [VERIFIED: npm registry] |
| @testing-library/jest-dom | 6.6.3 | Custom matchers (toBeInTheDocument, toBeDisabled...) | Repo React 18; v6 has **no peerDependencies** (works with Jest 29 matcher API) [VERIFIED: npm registry]. Latest v7.0.1 (Aug 2026) declares a `vitest >= 0.32` peer and was published days before research [VERIFIED: npm registry] — v6 is the safe Jest choice |
| identity-obj-proxy | 3.0.0 | Mock SCSS/CSS imports in moduleNameMapper | Named in the official Gatsby guide for stylesheets [CITED: gatsbyjs.com/docs/how-to/testing/unit-testing]; 9M+ weekly downloads, stable since 2016 [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gatsby-plugin-jest | — (UNPUBLISHED) | Automatic `gatsby` module mocks | **DO NOT INSTALL** — E404 on npm registry + GitHub 404 [VERIFIED: npm registry + api.github.com]. Replaced by manual `__mocks__/gatsby.js` (see Architecture Patterns) |
| lighthouse | 13.4.1 | Local CWV baseline via CLI (npx, no install needed) | Baseline capture; engines `>=22.19` [VERIFIED: npm registry]; runs from npx on Node 24, never added to package.json |
| @testing-library/dom | ^10 (transitive) | DOM queries for RTL | Comes with @testing-library/react@16 peer; no direct install needed [VERIFIED: npm registry] |
| jest.setup.js | — | `@testing-library/jest-dom` import + any global matcher setup | Official using-jest example registers jest-dom via `setupFilesAfterEnv` [CITED: github.com/gatsbyjs/gatsby examples/using-jest/jest.setup.js] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gatsby-plugin-jest (D-01, impossible) | Manual `__mocks__/gatsby.js` per official docs | Identical mock coverage (`Link`, `graphql`, `useStaticQuery`); ~20 lines of boilerplate; this IS the current official recommendation |
| jest 29.7.0 | jest 30.4.2 (latest) | Jest 30 is 3 months old; Gatsby's example and docs target 29; 29.7.0 is battle-tested with babel-jest 29 |
| @testing-library/jest-dom 6.6.3 | @testing-library/jest-dom 7.0.1 | v7 adds vitest peer dep, published 2026-08-09 (9 days before research); v6.6.3 (Oct 2024) is stable, peerless, and sufficient |
| PSI API (no key) | PSI with free API key | Anonymous quota exhausted (429 observed 2026-08-18); key raises quota — see Open Questions |
| Lighthouse 13 CLI | PSI API only | PSI may 429; CLI is fully under our control and works offline against any URL (live or local `gatsby serve`) |

**Installation (yarn 1, the repo's package manager):**
```bash
yarn add --dev jest@29.7.0 babel-jest@29.7.0 jest-environment-jsdom@29.7.0 \
  @testing-library/react@16.3.2 @testing-library/jest-dom@6.6.3 \
  identity-obj-proxy@3.0.0 babel-preset-gatsby@3.16.0
```
Note: `babel-preset-gatsby@3.16.0` is already a transitive dep of gatsby@5.15.0 — pinning it explicitly in devDependencies aligns the jest transform with the build preset. Lighthouse is run via `npx lighthouse@13.4.1` (no repo dependency).

**Version verification (all verified live 2026-08-18 via npm registry):** jest 29.7.0 ✓ (2023-10), babel-jest 29.7.0 ✓, jest-environment-jsdom 29.7.0 ✓, babel-preset-gatsby 3.16.0 ✓ (2026-01, latest on the 3.x line), @testing-library/react 16.3.2 ✓ (2026-01), @testing-library/jest-dom 6.6.3 ✓ (2024-10), identity-obj-proxy 3.0.0 ✓ (2016), lighthouse 13.4.1 ✓ (2026-07, latest). Local Node 24.18.0 + yarn 1.22.22 confirmed.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| jest | npm | ~10 yrs (29.7.0: 2023) | ~39.5M/wk | github.com/jestjs/jest | OK | Approved |
| babel-jest | npm | ~10 yrs | ~45.9M/wk | github.com/jestjs/jest | OK | Approved |
| babel-preset-gatsby | npm | 5 yrs (3.16.0: 2026-01) | ~250K/wk | github.com/gatsbyjs/gatsby | OK | Approved |
| @testing-library/react | npm | ~8 yrs (16.3.2: 2026-01) | ~46.2M/wk | github.com/testing-library/react-testing-library | OK | Approved |
| @testing-library/jest-dom | npm | 6.6.3 (2024-10); v7 line 2026-08 | ~41.4M/wk | github.com/testing-library/jest-dom | **SUS (v7 "too-new")** | Pinned v6.6.3 — v7 flagged; planner adds checkpoint:human-verify only if the executor deviates to v7 |
| identity-obj-proxy | npm | 10 yrs (2016) | ~9.0M/wk | github.com/keyanzhang/identity-obj-proxy | OK | Approved |
| jest-environment-jsdom | npm | ~10 yrs | ~21.0M/wk | github.com/jestjs/jest | OK | Approved |
| lighthouse | npm | ~9 yrs (13.4.1: 2026-07) | ~3.8M/wk | github.com/GoogleChrome/lighthouse | **SUS (too-new)** | Used via npx only, never added to package.json — no install gate needed |
| gatsby-plugin-jest | npm | — | — | — | **SLOP-equivalent: does-not-exist (E404)** | REMOVED from stack — replaced by manual `__mocks__/gatsby.js` (locked D-01 mechanism impossible; intent preserved) |

**Packages removed due to [SLOP] verdict:** `gatsby-plugin-jest` — E404 on registry API, npm view, and the gatsbyjs/gatsby GitHub tree. **Do not install; do not re-add from any tarball/mirror.**
**Packages flagged as suspicious [SUS]:** `@testing-library/jest-dom@7.0.1` (brand-new, vitest peer) — research pins v6.6.3 so no checkpoint needed unless the executor upgrades; `lighthouse@13.4.1` — npx-only usage, no repo install, no gate required.

*All packages above verified against the npm registry (npm view + registry API) and, for the three official-ecosystem packages (babel-preset-gatsby, @testing-library/react, identity-obj-proxy), cross-checked against official Gatsby docs. No postinstall scripts on any recommended package (`npm view <pkg> scripts` empty for jest, lighthouse, identity-obj-proxy).*

## Architecture Patterns

### System Architecture Diagram

```
                        ┌─────────────────────────────────────────────┐
                        │                PHASE 1 (this phase)          │
                        └─────────────────────────────────────────────┘

 TEST HALF                              BASELINE HALF
 ┌──────────────────────┐               ┌──────────────────────────────────┐
 │ yarn test ──► jest    │               │ npx lighthouse@13 <url> ×3        │
 │   │                  │               │   └─► JSON LHR files              │
 │   ├─ jest.config.js  │               │ PSI API v5 runPagespeed ×3        │
 │   │   ├─ transform   │               │   └─► JSON response (may 429)     │
 │   │   │  jest-preprocess.js          │ median(LCP, CLS, INP) per source  │
 │   │   │  (babel-preset-gatsby)       │        │                          │
 │   │   ├─ moduleNameMapper            │        ▼                          │
 │   │   │  .scss→identity-obj-proxy    │  .planning/baseline/              │
 │   │   │  images→file-mock.js         │  ├─ lighthouse/…report.json ×3    │
 │   │   ├─ setupFiles: loadershim.js   │  ├─ psi/…response.json ×3         │
 │   │   └─ setupFilesAfterEnv:         │  ├─ BASELINE.md (medians, meta)   │
 │   │      jest.setup.js (jest-dom)    │  └─ compare-vs-baseline notes ──► │
 │   └─ __mocks__/gatsby.js ──(manual   │           │                       │
 │      mocks: Link→<a>, graphql,       │           ▼  (Phase 6)            │
 │      useStaticQuery)                 │   CWV verification vs baseline    │
 │                                      │                                   │
 │   jsdom env:                         │   target URLs:                    │
 │   ├─ formik.test.js  (yup + fail     │   ├─ https://laryart.it/          │
 │   │   path via mocked emailjs)       │   ├─ https://laryart.it/blog      │
  │   ├─ blog-list.test.js (pagination)  │   └─ (1 post page, e.g.            │
  │   ├─ navigation.test.js (toggle)     │      /minnie)                      │
 │   └─ header/footer/logo snapshots*   │                                   │
 │   node env (@jest-environment node): │   * optional, agent's discretion  │
 │   └─ gatsby-node.test.js (createPages)                                   │
 └──────────────────────┘               └──────────────────────────────────┘
```
*Data flow: `yarn test` → jest config → babel transform → module mocks → jsdom/node suites → exit code 0. Baseline: two independent measurement sources (local CLI, remote API) → JSON artifacts → median extraction → BASELINE.md consumed by Phase 6. No production code is touched by either half.*

### Recommended Project Structure (additions only)

```
├── jest.config.js           # Official Gatsby config (transform, moduleNameMapper, ignores)
├── jest-preprocess.js       # babel-jest.createTransformer({ presets: ["babel-preset-gatsby"] })
├── jest.setup.js            # import "@testing-library/jest-dom"
├── loadershim.js            # global.___loader = { enqueue: jest.fn() }
├── __mocks__/
│   ├── gatsby.js            # jest.requireActual("gatsby") + Link/graphql/useStaticQuery overrides
│   └── file-mock.js         # module.exports = "test-file-stub"
├── src/
│   ├── components/
│   │   ├── formik.test.js       # D-04/D-05/D-07 targets
│   │   ├── navigation.test.js   # handleToggleClick
│   │   └── (optional) header.test.js, footer.test.js, logo.test.js  # D-06 snapshots
│   ├── templates/
│   │   └── blog-list.test.js    # pagination math
│   └── (gatsby-node.test.js at REPO ROOT, next to gatsby-node.js)
└── .planning/
    └── baseline/
        ├── lighthouse/       # laryart-it-home-1.json … -3.json, blog, post
        ├── psi/              # same URLs
        └── BASELINE.md       # median table + methodology metadata
```

### Pattern 1: Official Gatsby Jest Configuration (manual mocks, no gatsby-plugin-jest)
**What:** The current official setup — jest.config.js + jest-preprocess.js + loadershim.js + __mocks__/{gatsby,file-mock}.js. Source of truth fetched live from the Gatsby docs and the `examples/using-jest` repo.
**When to use:** Every Gatsby 5 unit-testing setup (replaces the unpublished gatsby-plugin-jest).
**Example:**
```javascript
// jest.config.js — Source: https://www.gatsbyjs.com/docs/how-to/testing/unit-testing/ (fetched 2026-08-18)
module.exports = {
  transform: {
    "^.+\\.jsx?$": `<rootDir>/jest-preprocess.js`,
  },
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss)$": `identity-obj-proxy`,
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": `<rootDir>/__mocks__/file-mock.js`,
  },
  testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
  transformIgnorePatterns: [`node_modules/(?!(gatsby|gatsby-script|gatsby-link)/)`],
  globals: {
    __PATH_PREFIX__: ``,
  },
  testEnvironmentOptions: {
    url: `http://localhost`,
  },
  setupFiles: [`<rootDir>/loadershim.js`],
  setupFilesAfterEnv: [`<rootDir>/jest.setup.js`],
}
```
```javascript
// jest-preprocess.js — Source: same official guide
const babelOptions = {
  presets: ["babel-preset-gatsby"],
}
module.exports = require("babel-jest").default.createTransformer(babelOptions)
```
```javascript
// loadershim.js — Source: same official guide
global.___loader = {
  enqueue: jest.fn(),
}
```
```javascript
// __mocks__/gatsby.js — Source: same official guide (trimmed to repo needs)
const React = require("react")
const gatsby = jest.requireActual("gatsby")

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest.fn().mockImplementation(
    ({ activeClassName, activeStyle, getProps, innerRef, partiallyActive, ref, replace, to, ...rest }) =>
      React.createElement("a", { ...rest, href: to })
  ),
  useStaticQuery: jest.fn(),
}
```
Notes: repo components import `Link`, `graphql`, `useStaticQuery` — all covered. `gatsby-image` `Img` and `@material-ui/core` are NOT auto-mocked; tests of components using them need `jest.mock("gatsby-image")` / the components avoided (priority targets don't import them — see Pattern 3).

### Pattern 2: Per-file test environment (jsdom vs node)
**What:** Jest 29 defaults to `testEnvironment: "node"`. Component tests need jsdom; `gatsby-node.test.js` needs node.
**When to use:** Always — set explicitly per suite. The official using-jest example writes `/** @jest-environment jsdom */` at the top of component test files.
**Example:**
```javascript
// src/components/formik.test.js — line 1
/** @jest-environment jsdom */
```
```javascript
// gatsby-node.test.js — line 1 (default is node, but be explicit)
/** @jest-environment node */
const { createPages } = require("../gatsby-node")

describe("createPages", () => {
  it("creates /blog plus paginated pages and one page per post", async () => {
    const actions = { createPage: jest.fn() }
    const graphql = jest.fn().mockResolvedValue({
      data: { allMarkdownRemark: { edges: samplePosts } },
    })
    const reporter = { panicOnBuild: jest.fn() }
    await createPages({ actions, graphql, reporter })
    const paths = actions.createPage.mock.calls.map(c => c[0].path)
    // 19 blog posts @ 9/page ⇒ numPages = 3 ⇒ paths: /blog, /blog/2, /blog/3 + 19 post paths
    expect(paths).toEqual(expect.arrayContaining(["/blog", "/blog/2", "/blog/3"]))
    expect(reporter.panicOnBuild).not.toHaveBeenCalled()
  })
})
```
**Fixture note:** repo has 19 markdown posts, 19 with `template: blog-post` → numPages = `Math.ceil(19/9)` = 3 (verified by grep on src/content/posts). The test should derive expectations from a small inline fixture (e.g., 10 posts → 2 pages), not from real content, to stay deterministic.

### Pattern 3: Behavioral form tests (formik.js — no exports to unit-test)
**What:** `formik.js` exports ONLY `FormikContact` (default export); `validationSchema` and `TextFieldConError` are module-local. Since this phase forbids production changes, validation and the failure path must be tested through the UI with RTL + fireEvent, with `emailjs-com` mocked **before** import (D-07).
**When to use:** Any component whose logic is only reachable via interaction.
**Example:**
```javascript
/** @jest-environment jsdom */
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

// MUST precede the import of FormikContact — emailjs.init() runs at module load (formik.js:8)
jest.mock("emailjs-com", () => ({
  init: jest.fn(),
  sendForm: jest.fn(),
}))
import emailjs from "emailjs-com"
import FormikContact from "./formik"

describe("FormikContact", () => {
  it("shows validation errors for empty required fields (yup schema via UI)", async () => {
    render(<FormikContact />)
    fireEvent.click(screen.getByText("Invia"))
    expect(await screen.findByText("email is a required field")).toBeInTheDocument()
    expect(screen.getByText("nome is a required field")).toBeInTheDocument()
    // NOTE: yup default messages are English ("email is a required field");
    // assert the ACTUAL strings after a trial run — they surface via TextFieldConError's
    // errorText = meta.error && meta.touched
  })

  it("does NOT navigate to /thanks when emailjs.sendForm rejects (false-success bug regression, D-05)", async () => {
    emailjs.sendForm.mockRejectedValue({ text: "network error" })
    // stub document.location.assign so jsdom doesn't actually navigate
    const assign = jest.fn()
    Object.defineProperty(window, "location", { value: { assign }, writable: true })

    render(<FormikContact />)
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Lara" } })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "lara@example.com" } })
    fireEvent.click(screen.getByText("Invia"))

    await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalledTimes(1))
    // Current buggy code calls assign() unconditionally after the promise chain:
    expect(assign).not.toHaveBeenCalled() // FAILS today → regression net proves the bug; Phase 4 fixes it
  })
})
```
**MUI note:** formik.js imports `TextField`/`Button` from `@material-ui/core` — these render fine under jsdom in Jest 29 (no window.matchMedia needed for basic TextField/Button usage; if a "matchMedia not implemented" error appears, add the standard mock in jest.setup.js — see Pitfall 5).

### Anti-Patterns to Avoid
- **Unit-testing `graphql` tagged templates:** Gatsby queries are validated at build time by `reporter.panicOnBuild` (gatsby-node.js:31). `graphql: jest.fn()` exists only so imports don't crash — never assert on query contents. (CONTEXT.md "Integration Points" says the same.)
- **Rendering components that import `gatsby-image` without mocking it:** `Img` requires the static-image runtime; if a priority target pulls it in transitively, `jest.mock("gatsby-image", () => ({ Img: () => <img /> }))`. Priority targets (formik, navigation, blog-list **math**) are chosen to avoid this — blog-list does import `PostCard` → which imports `gatsby-image`, so **extract pagination assertions to a `Pagination`-level render with props, or mock `gatsby-image`** (see Common Pitfalls 2).
- **Snapshots of MUI components:** MUI v4 generates long class-name strings; snapshots churn on any upgrade and will be obsolete after Phase 4 removes MUI. D-06's optional snapshots should target header/footer/logo only.
- **Writing tests that pass today but encode the bug:** the failure-path test MUST assert the correct behavior (no redirect on rejection) even though it fails on current code — that is the Phase 4 regression net. Do not weaken it to pass.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gatsby module mocks (Link/graphql/useStaticQuery) | Custom per-file jest.mock calls | Manual `__mocks__/gatsby.js` (official pattern) | One file, hoisted automatically by Jest for every test; per-file mocks scatter and drift |
| Babel transform config for Gatsby | Custom babel.config.js | `jest-preprocess.js` with `babel-preset-gatsby` | Must match Gatsby's internal preset exactly or JSX/import syntax breaks |
| SCSS import handling | Manual style stubs | `identity-obj-proxy` in moduleNameMapper | One regex covers all `.scss`; the official guide names it explicitly |
| Static asset imports | Inline module mocks | `__mocks__/file-mock.js` | Official pattern; images/fonts return "test-file-stub" |
| Median-of-3 CWV computation | ad-hoc manual arithmetic | Small node script (or jq) over 3 JSON LHRs | Reproducible, auditable; script output stored with the baseline |
| jsdom environment | Custom DOM shim | `jest-environment-jsdom@29.7.0` | The maintained jsdom integration; minor-matched to jest |

**Key insight:** the entire test half is solved boilerplate — the official Gatsby guide and the `examples/using-jest` repo are the canonical answer. The only genuinely custom work is the four test files, and two of them (formik failure path, gatsby-node) encode domain-specific fixtures.

## Common Pitfalls

### Pitfall 1: gatsby-plugin-jest is gone from npm
**What goes wrong:** D-01 names gatsby-plugin-jest; `yarn add gatsby-plugin-jest` fails with E404; any tutorial still recommending it (pre-2025 blog posts) breaks the install.
**Why it happens:** The package was unpublished from the npm registry (verified E404 on registry API + GitHub tree 2026-08-18).
**How to avoid:** Use the official manual `__mocks__/gatsby.js` setup above. Flag the D-01 deviation to the planner/user explicitly (research already does).
**Warning signs:** `npm view gatsby-plugin-jest` → "Not Found".

### Pitfall 2: SCSS + image imports crash the transform
**What goes wrong:** `Cannot parse import of style.scss` / `Unexpected token` on `.jpg` — layout.js:8 imports `../assets/scss/style.scss`, and blog-list → PostCard pulls images.
**Why it happens:** Jest doesn't understand non-JS module formats; without moduleNameMapper, the transform chokes.
**How to avoid:** The official moduleNameMapper (`.scss` → identity-obj-proxy, images → file-mock) is mandatory. Verify the regexes cover this repo's extensions: `.scss` only (no `.css` imports in src), `.jpg`/`.png`/`.svg` in static assets.
**Warning signs:** `SyntaxError: Unexpected token` mentioning `style.scss` or an image path.

### Pitfall 3: transformIgnorePatterns missing gatsby → "Unexpected token import"
**What goes wrong:** `node_modules/gatsby/cache-dir/gatsby-browser-entry.js:1 SyntaxError: Unexpected token import`.
**Why it happens:** Gatsby ships un-transpiled ESM in node_modules; Jest skips node_modules by default.
**How to avoid:** Copy `transformIgnorePatterns: [\`node_modules/(?!(gatsby|gatsby-script|gatsby-link)/)\`]` verbatim from the official config.
**Warning signs:** Any ESM-syntax error pointing inside node_modules.

### Pitfall 4: emailjs.init() at module load
**What goes wrong:** Importing `FormikContact` in a test executes `emailjs.init("user_...")` (formik.js:8) → network call / ReferenceError in jsdom.
**Why it happens:** Side-effectful module top-level.
**How to avoid:** `jest.mock("emailjs-com", ...)` declared BEFORE the `import FormikContact` line (jest.mock is hoisted by babel-jest, so it works regardless of order — but keep it visually first per D-07). Also note the hardcoded key in formik.js:8 — the test must not leak it anywhere (assert only on mock calls, never on the key string).
**Warning signs:** Test fails with `init is not a function` or unexpected fetch attempts.

### Pitfall 5: MUI v4 + jsdom issues
**What goes wrong:** `window.matchMedia is not a function` (MUI useMediaQuery) or long MUI snapshot churn.
**Why it happens:** MUI v4 components probe the DOM environment; jsdom lacks matchMedia.
**How to avoid:** Add the standard matchMedia mock to jest.setup.js:
```javascript
// jest.setup.js
import "@testing-library/jest-dom"
if (!window.matchMedia) {
  window.matchMedia = query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false } })
}
```
Text/TextField/Button (what formik.js uses) generally render without it, but the mock is cheap insurance. Skip snapshots of MUI components entirely.
**Warning signs:** `TypeError: window.matchMedia is not a function`.

### Pitfall 6: Prettier style conflicts in test files
**What goes wrong:** `yarn format` rewrites test files (no semicolons, arrowParens avoid) and CI/dev diff noise; or test files written with semicolons fail nothing but violate CONVENTIONS.md.
**Why it happens:** Repo uses Prettier 3 with `semi: false, arrowParens: "avoid"`; `.prettierignore` currently ignores `.cache`, `package.json`, `package-lock.json`, `public` — test files are NOT ignored.
**How to avoid:** Write test files in repo style (no semicolons, double quotes, kebab-case names, `props =>` single-param arrows). Run `yarn format` after writing tests. The official Gatsby example files use semicolons — do not copy that style blindly.
**Warning signs:** `git diff` shows formatting-only churn in *.test.js.

### Pitfall 7: jest-dom import path changed
**What goes wrong:** Old tutorials write `import "@testing-library/jest-dom/extend-expect"` (v5) — fails on v6 (the example repo's jest.setup.js still shows the v5 path).
**Why it happens:** v6 moved the entry to `@testing-library/jest-dom` root.
**How to avoid:** `jest.setup.js` → `import "@testing-library/jest-dom"` (v6). Do not copy the using-jest example verbatim here.
**Warning signs:** `Cannot find module '@testing-library/jest-dom/extend-expect'`.

### Pitfall 8: gatsby-node tests must run in node env
**What goes wrong:** `gatsby-node.test.js` run under jsdom fails on `require("path")` resolution or DOM-isms; or createPages runs the real GraphQL and hangs.
**Why it happens:** gatsby-node.js is Node-API code (`exports.createPages`), not browser code.
**How to avoid:** `/** @jest-environment node */` docblock + inject mocked `graphql`, `actions`, `reporter` as plain function args — no gatsby internals needed. The official guide's jest.config defaults to node; the docblock keeps it explicit.
**Warning signs:** Errors mentioning `document`/`window` in gatsby-node.test.js.

### Pitfall 9: PSI anonymous quota 429
**What goes wrong:** `curl https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...` → HTTP 429 "Quota exceeded for quota metric 'Queries'" (observed live 2026-08-18 on the shared anonymous quota).
**Why it happens:** The no-key shared quota is per-project and can be exhausted globally.
**How to avoid:** Baseline script must (a) tolerate 429 with retry/backoff, (b) fall back to Lighthouse CLI against the live URL (same metrics, lab-based), or (c) use a free API key from Google Cloud console (open question for user — see Open Questions). Record in BASELINE.md which source produced each number.
**Warning signs:** JSON body containing `"error": {"code": 429, "status": "RESOURCE_EXHAUSTED"}`.

### Pitfall 10: Baseline variance / apples-to-oranges comparison in Phase 6
**What goes wrong:** Phase 6 compares Phase-1 medians against a different Lighthouse major, different throttle settings, or different device profile → meaningless delta.
**Why it happens:** CWV lab metrics are environment-sensitive (docs/variability.md).
**How to avoid:** Pin `npx lighthouse@13.4.1` (exact major), record `--form-factor=mobile` + default throttling (devtools), store **all** raw JSON + tool versions + date + git commit SHA in `.planning/baseline/` so Phase 6 reproduces the exact same measurement recipe. Use median, not mean (variance guide).
**Warning signs:** BASELINE.md without a methodology/versions section.

## Code Examples

Verified patterns from official sources:

### 1. Full official Jest scaffold for Gatsby 5 (config + preprocess + mocks)
```javascript
// jest.config.js — Source: https://www.gatsbyjs.com/docs/how-to/testing/unit-testing/ (fetched 2026-08-18)
module.exports = {
  transform: { "^.+\\.jsx?$": `<rootDir>/jest-preprocess.js` },
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss)$": `identity-obj-proxy`,
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": `<rootDir>/__mocks__/file-mock.js`,
  },
  testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
  transformIgnorePatterns: [`node_modules/(?!(gatsby|gatsby-script|gatsby-link)/)`],
  globals: { __PATH_PREFIX__: `` },
  testEnvironmentOptions: { url: `http://localhost` },
  setupFiles: [`<rootDir>/loadershim.js`],
  setupFilesAfterEnv: [`<rootDir>/jest.setup.js`],
}
// jest-preprocess.js
const babelOptions = { presets: ["babel-preset-gatsby"] }
module.exports = require("babel-jest").default.createTransformer(babelOptions)
// loadershim.js
global.___loader = { enqueue: jest.fn() }
// jest.setup.js (v6 path — do NOT use the v5 "extend-expect" path)
import "@testing-library/jest-dom"
```
*(All four snippets verified against the official guide raw source, 2026-08-18; the jest.setup.js v6 fix and matchMedia mock are research additions over the example repo's stale v5 line.)*

### 2. Manual gatsby module mock (official, trimmed to repo imports)
```javascript
// __mocks__/gatsby.js — Source: official guide (fetched 2026-08-18)
const React = require("react")
const gatsby = jest.requireActual("gatsby")
module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest.fn().mockImplementation(
    ({ activeClassName, activeStyle, getProps, innerRef, partiallyActive, ref, replace, to, ...rest }) =>
      React.createElement("a", { ...rest, href: to })
  ),
  useStaticQuery: jest.fn(),
}
// __mocks__/file-mock.js
module.exports = "test-file-stub"
```
`Slice` override from the docs is omitted — this repo doesn't use Gatsby Slice; keep the mock minimal (or include it for future-proofing, agent's discretion).

### 3. gatsby-node createPages test (node environment)
```javascript
/** @jest-environment node */
const { createPages } = require("../gatsby-node")

describe("createPages", () => {
  const posts = [
    { node: { id: "1", frontmatter: { slug: "/a", template: "blog-post", title: "A" } } },
    { node: { id: "2", frontmatter: { slug: "/b", template: "blog-post", title: "B" } } },
  ]

  it("creates post pages with prev/next context and paginates /blog at 9/page", async () => {
    const actions = { createPage: jest.fn() }
    const graphql = jest.fn().mockResolvedValue({ data: { allMarkdownRemark: { edges: posts } } })
    const reporter = { panicOnBuild: jest.fn() }
    await createPages({ actions, graphql, reporter })

    const calls = actions.createPage.mock.calls.map(c => c[0])
    const paths = calls.map(c => c.path)
    expect(paths).toContain("/a")                     // post page
    expect(paths).toContain("/blog")                  // page 1
    expect(calls.find(c => c.path === "/blog").context).toMatchObject({ limit: 9, currentPage: 1, numPages: 1 })
    expect(reporter.panicOnBuild).not.toHaveBeenCalled()
  })

  it("panics when the GraphQL query returns errors", async () => {
    const actions = { createPage: jest.fn() }
    const graphql = jest.fn().mockResolvedValue({ errors: [{ message: "boom" }] })
    const reporter = { panicOnBuild: jest.fn() }
    await createPages({ actions, graphql, reporter })
    expect(reporter.panicOnBuild).toHaveBeenCalledWith("Error while running GraphQL query.")
  })
})
```

### 4. Pagination math + Navigation toggle tests
```javascript
/** @jest-environment jsdom */
// src/templates/blog-list.test.js — assert the math via a rendered Pagination
// (blog-list.js lines 80-84: isFirst = currentPage === 1; isLast = currentPage === numPages;
//  prevPage = currentPage-1===1 ? "/blog/" : "/blog/"+ (currentPage-1); nextPage = "/blog/"+(currentPage+1))
// Approach: render BlogIndex with a stub data + pageContext, assert Link hrefs. Mock gatsby-image
// and post-card to keep the tree light:
jest.mock("../components/post-card", () => props => <div>{props.data.frontmatter.title}</div>)
jest.mock("gatsby-image", () => ({ Img: () => <img alt="" /> }))
jest.mock("gatsby", () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>, graphql: jest.fn() }))
// (OR: rely on the root __mocks__/gatsby.js and only mock gatsby-image + post-card)

import { render, screen } from "@testing-library/react"
import BlogIndex from "./blog-list"

it("page 1 of 3: no Previous, has Next → /blog/2, active number 1", () => {
  render(<BlogIndex data={{ allMarkdownRemark: { edges: [{ node: { id: "1", frontmatter: { date: "2024-01-01", title: "X" } } }] } }} pageContext={{ currentPage: 1, numPages: 3 }} />)
  expect(screen.queryByText("Previous")).toBeNull()
  expect(screen.getByText("Next").closest("a")).toHaveAttribute("href", "/blog/2")
  expect(screen.getByText("1")).toHaveClass("is-active")
})
it("page 2 of 3: Previous → /blog/, Next → /blog/3", () => { /* ... */ })
```
```javascript
/** @jest-environment jsdom */
// src/components/navigation.test.js
import { render, screen, fireEvent } from "@testing-library/react"
import Navigation from "./navigation"

it("toggles the is-active class on the menu trigger", () => {
  render(<Navigation />)
  const trigger = screen.getByRole("button")
  expect(trigger.className).not.toContain("is-active")
  fireEvent.click(trigger)
  expect(trigger.className).toContain("is-active")
  fireEvent.click(trigger)
  expect(trigger.className).not.toContain("is-active")
})
```

### 5. Performance baseline capture (Lighthouse CLI + PSI, median of 3, mobile)
```bash
# One URL, three runs, raw JSON each (exact versions pinned for Phase 6 reproducibility)
URLS="https://laryart.it/ https://laryart.it/blog"
mkdir -p .planning/baseline/lighthouse .planning/baseline/psi

for u in $URLS; do
  slug=$(echo "$u" | sed 's|https://laryart.it||; s|/|_|g; s|^_*||; s|$|_home|' )
  for i in 1 2 3; do
    npx -y lighthouse@13.4.1 "$u" \
      --only-categories=performance \
      --form-factor=mobile \
      --output=json \
      --output-path=".planning/baseline/lighthouse/${slug}-${i}.json" \
      --quiet 2>/dev/null
    sleep 5   # let the CDN/server settle between runs
  done
done
```
```bash
# PSI (may 429 — see Pitfall 9); three runs per URL, raw responses stored
for u in $URLS; do
  slug=$(echo "$u" | sed 's|https://laryart.it||; s|/|_|g; s|^_*||; s|$|_home|' )
  for i in 1 2 3; do
    enc=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$u")
    curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${enc}&strategy=mobile&category=performance" \
      -o ".planning/baseline/psi/${slug}-${i}.json"
    sleep 5
  done
done
```
```bash
# Median extraction (LCP numericValue ms, CLS, INP, perf score) — per source
# e.g. with jq:
for f in .planning/baseline/lighthouse/*.json; do
  jq -r '[.fetchTime, .audits["largest-contentful-paint"].numericValue,
          .audits["cumulative-layout-shift"].numericValue,
          .audits["interaction-to-next-paint"].numericValue,
          (.categories.performance.score * 100)] | @tsv' "$f"
done | sort -n -k2 | awk 'NR==2'   # median by LCP — or compute median per column in a tiny node script
```
Recommend a small `node` script (`.planning/baseline/median.js` or inline) that reads the 3 JSONs per URL per source, computes median per metric, and writes `BASELINE.md` with: URL × source × metric medians, tool versions (`npx lighthouse --version`, PSI API version), capture dates, git commit SHA, and a one-line methodology ("Lighthouse 13.4.1 CLI, mobile, default throttling, median of 3; PSI v5, strategy=mobile, median of 3"). Store it alongside the JSONs so Phase 6 reruns the identical recipe.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| gatsby-plugin-jest (automatic gatsby mocks) | Manual `__mocks__/gatsby.js` (official docs) | Package unpublished from npm (E404 verified 2026-08-18) | D-01's mechanism must be swapped; intent preserved via the official manual mock |
| `@testing-library/jest-dom/extend-expect` import (v5) | `import "@testing-library/jest-dom"` (v6+) | v6 (Aug 2023) | Example repos still show the old path — copy configs with care |
| jest-environment-jsdom bundled with jest | Separate package, minor-matched | Jest 27+ split | Must add `jest-environment-jsdom@29.7.0` explicitly or tests fail with "Test environment not found" |
| PSI field data (CrUX loadingExperience) | CrUX API separate; lab data (lighthouseResult) is the stable PSI part | 2025 announcement (docs updated 2025-08-28) | Baseline should rely on `lighthouseResult.audits` for LCP/CLS/INP; don't depend on loadingExperience |
| jest 29 | jest 30.4.2 (latest, May 2026) | May 2026 | Gatsby ecosystem (docs + example) still targets 29; stay on 29.7.0 this phase |
| Gatsby 5.15.0 (repo) | Gatsby 5.16.1 (latest stable, Feb 2026) | Phase 3, NOT this phase | Test scaffold must survive the upgrade — no production changes now; jest config is dependency-agnostic |
| Lighthouse 12.x | Lighthouse 13.4.1 (requires Node ≥22.19) | 2026 | Local Node 24.18 ✓; `.nvmrc` Node 20 ✗ — run baseline under nvm-managed Node, do not edit `.nvmrc` this phase |

**Deprecated/outdated:**
- `gatsby-plugin-jest`: unpublished; every guide mentioning it is stale.
- `@testing-library/jest-dom/extend-expect`: v5-only path.
- `gatsby-image` `Img` (repo legacy): still present in the repo — tests must mock it; replaced in Phase 5.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `gatsby-plugin-jest` was unpublished from npm (E404) and the official docs have replaced it with the manual `__mocks__/gatsby.js` pattern [VERIFIED: npm registry API + gatsbyjs.com docs fetched live 2026-08-18] | Standard Stack / Pitfall 1 | None — both the registry 404 and the current docs were verified live; the manual pattern is the official one |
| A2 | Local Node 24.18.0 (not `.nvmrc`'s Node 20) will be used to run Lighthouse 13 CLI (engines `>=22.19`) [VERIFIED: node --version; npm view lighthouse engines] | Environment Availability | If the executor runs under `.nvmrc` Node 20, LH 13 refuses to start — must use the nvm default Node 24 |
| A3 | Repo has 19 markdown posts, all `template: blog-post` → `Math.ceil(19/9)` = 3 paginated blog pages [VERIFIED: grep on src/content/posts] | Code Examples | Only affects fixture choice in the gatsby-node test; tests should use inline fixtures anyway |
| A4 | `@material-ui/core` TextField/Button render under jsdom without matchMedia mocks; matchMedia mock is insurance [ASSUMED — based on MUI v4 + jsdom training knowledge, not exercised this session] | Pitfall 5 | If MUI probes matchMedia, tests crash — the documented fallback (matchMedia mock in jest.setup.js) is included, so impact is a small edit |
| A5 | PSI anonymous quota exhaustion (429 observed) is temporary/shared, and retries or the Lighthouse-CLI fallback suffice; a free API key is the durable fix [VERIFIED: 429 observed live 2026-08-18; CITED: developers.google.com/speed/docs/insights/v5/get-started — "can be used with or without an API key"] | Pitfall 9 / Open Questions | If quota stays exhausted for weeks, PSI half of the baseline comes only from the CLI fallback — still meets D-08 (Lighthouse + PSI) only if the user provides a key; surfaced as an Open Question |
| A6 | Yup default validation messages are English ("email is a required field") and surface as `meta.error` text via TextFieldConError [ASSUMED — yup 1.7.1 default message behavior from training knowledge; no repo code overrides `message`] | Code Examples | The form test must assert exact strings — a trial run will confirm; if wrong, assert on the actual strings |
| A7 | `document.location.assign("/thanks")` is stub-able via `Object.defineProperty(window, "location", { value: { assign } })` in jsdom [ASSUMED — standard jsdom pattern, not exercised this session] | Code Examples | If jsdom's location is non-configurable, use `delete window.location` before defineProperty, or spy on the `location` object; minor test-code fix |
| A8 | jest 29.7.0 is the correct line for Gatsby 5 (docs say "Jest 29 or above", official example pins ^29.1.2) [CITED: gatsbyjs.com docs; VERIFIED: npm registry] | Standard Stack | If a future Gatsby patch pins jest 30, upgrade is a devDependency bump — low risk |

**If this table is empty:** n/a — table above contains all `[ASSUMED]`-tagged claims; A4/A6/A7 are test-implementation details with documented fallbacks, A2/A5 have concrete workarounds.

## Open Questions (RESOLVED)

1. **PSI API key — provide one, or accept CLI-only baseline?** **[RESOLVED in Plan 04]**
   - What we know: PSI v5 works without a key for low volume, but the anonymous shared quota returned HTTP 429 "Quota exceeded" on 2026-08-18 (verified live). D-08 locks "Lighthouse CLI + PageSpeed Insights"; D-09 locks storage, not the key.
   - What's unclear: whether the quota recovers quickly (per-hour/day window) and whether the user has/wants a Google Cloud API key (free, raises quota).
   - Recommendation: baseline script tries PSI with retry/backoff and falls back to Lighthouse-CLI-against-live-URL per metric; if the user can provide a key, pass it via env var (`PSI_API_KEY`) without committing it. Planner: add a `checkpoint:human-verify` before the PSI capture step to confirm key availability.
   - **Resolution (plans 01-03/01-04):** capture-baseline.js implements retry/backoff (3 retries, 10s/30s/60s) + `process.env.PSI_API_KEY` support + per-metric Lighthouse-CLI fallback with `{ source: "lighthouse-fallback", psi_quota: "429" }` markers; Plan 04's blocking checkpoint lets the owner choose psi-key or psi-fallback before the full capture.

2. **Which URLs for the baseline?** **[RESOLVED in Plan 03]**
   - What we know: success criteria say "live site" median-3 mobile LCP/CLS/INP. Repo has `/` (home), `/blog` (301 → `/blog/` — trailing slash; Lighthouse follows redirects), post pages (19), `/laryart`, `/contatti` (contact form — most interesting for Phase 6 font/asset work), `/privacy`.
   - What's unclear: the minimal URL set Phase 6 must match. ROADMAP Phase 6 says "CWV verification on the live site" without listing URLs.
   - Recommendation: capture 3 URLs as the canonical set — `https://laryart.it/`, `https://laryart.it/blog/`, and one post (`https://laryart.it/minnie` — frontmatter slug verified at planning time: src/content/posts/2024-08-15-minnie.md line 4). More URLs = more time per run (3 URLs × 3 runs × 2 sources ≈ 20+ min). Record the set in BASELINE.md; Phase 6 uses the same set.
   - **Resolution (plan 01-03):** canonical set hardcoded in capture-baseline.js as `["https://laryart.it/", "https://laryart.it/blog/", "https://laryart.it/minnie"]`; slugify → home / blog / post-minnie; recorded in README.md.

3. **Snapshot tests (D-06, agent's discretion) — take or skip?** **[RESOLVED in Plan 02]**
   - What we know: header.js is a 7-line passthrough, footer/logo are small; snapshots are cheap. But Phase 4 removes MUI and Phase 5 changes images — presentational snapshots of header/footer/logo are unaffected by those.
   - What's unclear: executor preference.
   - Recommendation: include 1-2 trivial snapshots (header, logo) to satisfy D-06's "at least one passing assertion per covered area" beyond the required areas — but never snapshot MUI-rendered output.
   - **Resolution (plan 01-02):** snapshots skipped — blog-list pagination, navigation toggle, and gatsby-node createPages tests provide the required passing assertions; header/footer/logo snapshots left to executor discretion per D-06 (no snapshot task in the plans).

4. **Does the 301 `/blog` → `/blog/` matter for Lighthouse?** **[RESOLVED in Plan 03]**
   - What we know: `curl -I https://laryart.it/blog` → 301. Lighthouse follows redirects and reports the final URL.
   - Recommendation: use the canonical `/blog/` URL in the baseline script to avoid a redirect in the critical path; note the choice in BASELINE.md.
   - **Resolution (plan 01-03):** canonical `/blog/` used in the URLS constant; the redirect note is documented in capture-baseline.js and README.md, and re-verified at execution via `curl -sI`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | jest 29, babel-jest, gatsby-node tests, Lighthouse CLI | ✓ | 24.18.0 (nvm default) | `.nvmrc` pins 20 — jest 29 works on both; Lighthouse 13 needs ≥22.19 → must run baseline with nvm Node 24, NOT `nvm use` 20 |
| yarn | devDependency install (yarn add --dev) | ✓ | 1.22.22 | — (repo packageManager; do not switch to npm this phase) |
| google-chrome | Lighthouse CLI (auto-detected) | ✓ | Chrome 151.0.7922.137 | `CHROME_PATH` env var; or `--chrome-flags="--headless --no-sandbox"` for root environments |
| Lighthouse CLI | local baseline (npx, no repo install) | ✓ (via npx) | 13.4.1 (pinned) | PSI API as the alternate source |
| PSI API (no key) | live-site baseline | ⚠️ quota 429 observed 2026-08-18 | API v5 | Retry/backoff; fallback to Lighthouse CLI against live URL; free API key (open question) |
| laryart.it | baseline target | ✓ | HTTP 200, ~1.1s TTFB | — (live site is the D-08 target) |
| jq or node | median extraction from JSON LHRs | ✓ (node; jq: check at execution) | — | Pure-node extraction script (recommended) |
| @testing-library/react peer @types/react | npm install peer resolution (yarn 1 is lenient) | ✓ (not required at runtime) | — | Yarn 1 does not enforce peers; if yarn complains, add `--ignore-engines` never needed — peers only |

**Missing dependencies with no fallback:**
- None — every hard requirement has a verified fallback. The only conditional is the PSI quota (Open Question 1).

**Missing dependencies with fallback:**
- PSI anonymous quota (429): Lighthouse CLI against the live URL yields the same lab metrics (LCP/CLS/INP, mobile, median of 3) — baseline completeness depends on the user's answer to Open Question 1.

## Validation Architecture

Nyquist Dimension 8 — how every test and baseline metric in this phase is validated.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + @testing-library/react 16.3.2 + @testing-library/jest-dom 6.6.3 |
| Config file | `jest.config.js` (repo root, official Gatsby pattern) |
| Quick run command | `yarn test -- --watch` (or targeted: `yarn test src/components/formik.test.js`) |
| Full suite command | `yarn test` (replaces the starter placeholder; must exit 0) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FNDT-05 (form validation) | yup schema rejects empty nome/email with per-field error text via TextFieldConError | unit (jsdom, RTL) | `yarn test src/components/formik.test.js -t "validation"` | ❌ Wave 0 |
| FNDT-05 (submit failure path, D-05) | emailjs.sendForm rejection → NO redirect to /thanks, no false success (regression net for Phase 4 FORM-04) | unit (jsdom, RTL, mocked emailjs) | `yarn test src/components/formik.test.js -t "failure"` | ❌ Wave 0 |
| FNDT-05 (pagination math) | isFirst/isLast/prevPage/nextPage correct for pages 1, 2, 3 of 3 | unit (jsdom, RTL) | `yarn test src/templates/blog-list.test.js` | ❌ Wave 0 |
| FNDT-05 (navigation toggle) | handleToggleClick flips is-active class on the trigger button | unit (jsdom, RTL) | `yarn test src/components/navigation.test.js` | ❌ Wave 0 |
| FNDT-05 (page creation) | createPages creates post pages with prev/next context + /blog pagination; panicOnBuild on GraphQL errors | unit (node env, injected mocks) | `yarn test gatsby-node.test.js` | ❌ Wave 0 |
| FNDT-06 (Lighthouse baseline) | LCP/CLS/INP medians (3 runs, mobile) captured via Lighthouse 13.4.1 CLI → JSON in `.planning/baseline/lighthouse/` | manual/scripted capture (not unit-testable) | `node .planning/baseline/capture-lighthouse.js` (or the bash loop above) | ❌ Wave 0 |
| FNDT-06 (PSI baseline) | Same metrics via PSI v5 API ×3 → JSON in `.planning/baseline/psi/` | manual/scripted capture | `node .planning/baseline/capture-psi.js` (retry on 429) | ❌ Wave 0 |
| FNDT-06 (storage, D-09) | `BASELINE.md` exists with median table + methodology (versions, dates, commit SHA, URLs) | manual verification | read `.planning/baseline/BASELINE.md` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn test` (full suite — it is tiny: 4 files, <10s)
- **Per wave merge:** `yarn test`
- **Phase gate:** `yarn test` exits 0 with all 4 suites green (except the D-05 failure-path test which intentionally fails on current buggy code — see note below) + baseline files present in `.planning/baseline/`

**D-05 regression-net note:** the failure-path test asserts `expect(assign).not.toHaveBeenCalled()` — this FAILS against the current buggy formik.js (which calls `document.location.assign("/thanks")` unconditionally). That is the point: it is the red test that Phase 4 (FORM-04) turns green. The phase gate must therefore be: suite green **except** this one documented red test, OR (preferred) mark it `it.skip` with a comment linking FNDT-05→FORM-04 so `yarn test` exits 0 while the assertion is preserved. **Planner decision needed — recommend `it.skip` + comment so success criterion 1 (`yarn test` exits 0) holds.**

### Wave 0 Gaps
- [ ] `jest.config.js` + `jest-preprocess.js` + `jest.setup.js` + `loadershim.js` + `__mocks__/{gatsby,file-mock}.js` — scaffold (no tests exist today; verified by TESTING.md: zero test files, no config)
- [ ] `src/components/formik.test.js` — covers FNDT-05 validation + failure path
- [ ] `src/templates/blog-list.test.js` — covers FNDT-05 pagination math
- [ ] `src/components/navigation.test.js` — covers FNDT-05 toggle
- [ ] `gatsby-node.test.js` — covers FNDT-05 page creation
- [ ] Framework install: `yarn add --dev jest@29.7.0 babel-jest@29.7.0 jest-environment-jsdom@29.7.0 @testing-library/react@16.3.2 @testing-library/jest-dom@6.6.3 identity-obj-proxy@3.0.0 babel-preset-gatsby@3.16.0` — none detected (package.json has no jest/testing deps)
- [ ] `.planning/baseline/` + capture scripts + `BASELINE.md` — baseline storage (D-09)

## Security Domain

`security_enforcement` is absent from `.planning/config.json` → treat as enabled. This phase adds no production code and no new runtime attack surface — but the test tooling introduces a few security-relevant behaviors worth encoding:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (no auth in scope; tests run locally) |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (indirect) | yup validation is the *system under test*; the validation tests assert required/email rules — they do not relax or bypass them. No new input surface added |
| V6 Cryptography | no | — (no crypto; PSI/HTTPS calls use TLS by default via curl/node fetch) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secrets leak via test output | Information disclosure | formik.js:8 hardcodes `emailjs.init("user_...")` — tests must NEVER print or assert the key; mock `emailjs-com` so the real key never executes in tests. The mocked module returns `{ init: jest.fn(), sendForm: jest.fn() }` |
| PSI API key leakage | Information disclosure | If the user supplies a key (Open Question 1), pass via env var `PSI_API_KEY`, never commit it; baseline scripts read `process.env.PSI_API_KEY` |
| Baseline JSON artifacts tampering (low) | Tampering | JSONs + BASELINE.md are committed to git in `.planning/` — git history is the integrity record; include commit SHA in BASELINE.md |
| `--chrome-flags="--no-sandbox"` (if needed) | Elevation of privilege (defense-in-depth) | Only used if running as root; prefer plain `--headless` on this dev machine (Chrome 151 runs unprivileged) |
| Untrusted URL input to Lighthouse/PSI | Tampering | URLs are hardcoded constants in capture scripts (laryart.it only) — never accept user input into the scripts |

## Sources

### Primary (HIGH confidence)
- npm registry (queried live 2026-08-18) — `npm view` + registry API for: jest 29.7.0, babel-jest 29.7.0, jest-environment-jsdom 29.7.0, babel-preset-gatsby 3.16.0 (+ its dep line inside gatsby@5.15.0), @testing-library/react 16.3.2 (peers react ^18), @testing-library/jest-dom 6.6.3/7.0.1 (peers: v6 none, v7 vitest), identity-obj-proxy 3.0.0, lighthouse 13.4.1 (engines >=22.19), **gatsby-plugin-jest → E404 (unpublished)**
- gatsbyjs.com/docs/how-to/testing/unit-testing/ (fetched live 2026-08-18) — official jest.config.js, jest-preprocess.js, loadershim.js, __mocks__/gatsby.js; "Jest 29 or above"; no gatsby-plugin-jest anywhere in the guide
- github.com/gatsbyjs/gatsby examples/using-jest (fetched live) — package.json pins (jest ^29.1.2, jest-environment-jsdom ^29.1.2, @testing-library/react ^13.4.0, @testing-library/jest-dom ^5.16.5 [stale v5 line — see Pitfall 7], identity-obj-proxy ^3.0.0), jest.config.js (setupFilesAfterEnv: jest.setup.js), loadershim.js, __mocks__/gatsby.js, file-mock.js, jsdom docblock pattern in tests
- developers.google.com/speed/docs/insights/v5/get-started (fetched live) — PSI API usable with or without key; response shape (lighthouseResult.audits); CrUX field data deprecation note
- github.com/GoogleChrome/lighthouse readme (fetched live) — CLI options (--only-categories, --output/--output-path, --form-factor, --chrome-flags, --preset), Node 22 requirement, variability guidance, programmatic API
- github.com/GoogleChrome/lighthouse docs/configuration.md — onlyCategories/onlyAudits settings
- Local codebase evidence — package.json (test placeholder, gatsby 5.15.0 dep incl. babel-preset-gatsby ^3.15.0), src/components/formik.js (emailjs.init at line 8, validationSchema, TextFieldConError), src/templates/blog-list.js (pagination math lines 80-84, Pagination component), src/components/navigation.js (handleToggleClick), gatsby-node.js (createPages), src/content/posts (19 posts, all blog-post), .prettierrc/.prettierignore, .nvmrc (20), live laryart.it HTTP checks

### Secondary (MEDIUM confidence)
- PSI live probe (2026-08-18) — HTTP 429 "Quota exceeded" on anonymous key; verified against the official "with or without an API key" statement
- Local sandbox install test (2026-08-18) — jest@29.7.0 + babel-jest@29.7.0 + jest-environment-jsdom@29.7.0 install cleanly under Node 24; babel-jest `createTransformer` loads
- jestjs.io configuration docs — testEnvironment default (node), jsdom as separate package (training knowledge cross-checked against package metadata: jest 29 has no jsdom dependency)

### Tertiary (LOW confidence — needs validation)
- Exact yup 1.7.1 default error message strings ("email is a required field") — assert after first test run (A6)
- MUI v4 TextField/Button behavior under jest 29 jsdom (matchMedia) — mock included as insurance (A4)
- `Object.defineProperty(window, "location", ...)` stubbing in jsdom (A7)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified live on the npm registry; the D-01 deviation (gatsby-plugin-jest unpublished) is registry-verified, and the replacement is the current official docs pattern
- Architecture: HIGH — official Gatsby guide + official example repo fetched live; repo source files read for the four test targets
- Pitfalls: HIGH — registry/API observations (E404, 429) are primary evidence; MUI/matchMedia and yup-message items are flagged MEDIUM/LOW in the Assumptions Log
- Code examples: HIGH (config/mocks verbatim from official sources) with MEDIUM test-file details (RTL interaction patterns standard, but exact yup strings/MUI behavior to confirm on first run)

**Research date:** 2026-08-18
**Valid until:** 2026-09-17 (30 days — jest/gatsby testing stack is stable; re-verify gatsby-plugin-jest status only if a stale tutorial suggests it)

---

*Phase: 01-test-scaffolding-performance-baseline*
*Research completed: 2026-08-18*
*Ready for planning: yes*
