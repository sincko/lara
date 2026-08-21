# Phase 1: Test Scaffolding + Performance Baseline - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a regression net and a recorded performance baseline BEFORE any dependency or code changes happen. It scaffolds a minimal jest + @testing-library/react suite (form validation, form submit failure path, pagination math, page creation) and captures Lighthouse + PSI Core Web Vitals (LCP, CLS, INP) on the live site, stored in `.planning/` for Phase 6 comparison. No production code changes are made in this phase.

</domain>

<decisions>
## Implementation Decisions

### Test Runner & Setup
- **D-01:** Use Jest 29 + babel-jest with `babel-preset-gatsby` and `gatsby-plugin-jest` (official Gatsby plugin providing automatic mocks for `gatsby` module exports: `Link`, `graphql`, `useStaticQuery`, `StaticQuery`). — **Reversibility:** reversible — test tooling can be swapped without touching app code
- **D-02:** Add `@testing-library/react` + `@testing-library/jest-dom` for component tests.
- **D-03:** `yarn test` script replaced with the real jest run — must exit 0 with a real suite (FNDT-05).

### Test Scope (FNDT-05)
- **D-04:** Priority targets (pure logic, minimal Gatsby dependency):
  - `src/components/formik.js` — yup validation schema and `TextFieldConError` error-text logic
  - `src/templates/blog-list.js` — pagination math (`prevPage`/`nextPage`/`isFirst`/`isLast`, lines 80-84)
  - `src/components/navigation.js` — `handleToggleClick` state toggle
  - `gatsby-node.js` — page creation logic (createPages)
- **D-05:** Form submit failure path must be covered (the false-success bug in `formik.js` — success reported even when email send fails). This test will be the regression net for the Phase 4 fix.
- **D-06:** At least one passing assertion per covered area; snapshot tests for small presentational components (header, footer, logo) are optional and left to the agent's discretion.
- **D-07:** `emailjs-com` must be mocked before importing `FormikContact` (it calls `emailjs.init()` at module load time in `formik.js:8`).

### Performance Baseline (FNDT-06)
- **D-08:** Capture baseline with Lighthouse CLI (local) + PageSpeed Insights (live site), median of 3 runs, mobile profile, for LCP, CLS, INP.
- **D-09:** Store baseline results in `.planning/` (e.g., `.planning/baseline/`) so Phase 6 can compare against them.

### Test Organization
- **D-10:** Co-located `*.test.js` files next to components (Gatsby ecosystem default per TESTING.md), e.g., `src/components/formik.test.js`.

### the agent's Discretion
- Exact jest config details (transform, moduleNameMapper for gatsby mocks), whether to add coverage thresholds, and snapshot test selection are left to the planner/executor.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase & Requirements
- `.planning/ROADMAP.md` §Phase 1 — Phase goal, success criteria (4 criteria: `yarn test` exits 0; suite covers form validation/failure path/pagination/page creation; Lighthouse+PSI baseline median 3 mobile; baseline stored in `.planning/`)
- `.planning/REQUIREMENTS.md` §FNDT-05, §FNDT-06 — Requirement definitions

### Codebase Maps
- `.planning/codebase/TESTING.md` — Current testing state (zero tests), recommended stack (Jest 29 + gatsby-plugin-jest), priority targets, mocking requirements
- `.planning/codebase/CONVENTIONS.md` — Code style (Prettier, no semicolons, arrowParens avoid, double quotes, kebab-case files)
- `.planning/codebase/STACK.md` — Current dependency versions (Gatsby 5.15.0, React 18, yarn 1.22.22)

### Research
- `.planning/research/SUMMARY.md` §Pitfall 11 — "Big-bang upgrade with zero tests" — scaffold jest BEFORE the upgrade; highest-leverage prevention
- `.planning/research/PITFALLS.md` — Pitfall 11 details and phase mapping

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/content/posts/` — Real markdown content usable as natural test fixtures (e.g., `src/content/posts/2024-08-15-minnie.md`)
- `src/util/site.json` — Site metadata fixture for tests
- `gatsby-node.js` — `createPages` + `onCreateNode` logic to test (page creation from frontmatter.slug, blog pagination)

### Established Patterns
- Plain JavaScript (no TS), kebab-case files, PascalCase components, Prettier-only formatting (no ESLint)
- `yarn test` currently the failing starter placeholder — must be replaced
- GraphQL queries verified at build time via `reporter.panicOnBuild` — keep that coverage, don't unit-test GraphQL

### Integration Points
- `package.json` scripts — `test` script replaced; devDependencies added (jest, @testing-library/*, gatsby-plugin-jest, babel-preset-gatsby)
- `src/components/formik.js:8` — `emailjs.init()` at module load — any test importing FormikContact must mock `emailjs-com` first
- `.prettierignore` — currently ignores `package-lock.json`; test files should follow repo formatting

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches per the research and TESTING.md recommendations.

</specifics>

<deferred>
## Deferred Ideas

- ESLint flat config — dev-only tooling, deferred to v2 (MODR-03)
- Coverage thresholds enforcement — optional, agent's discretion
- E2E testing (Cypress/Playwright) — overkill for site size, not in scope

</deferred>

---

*Phase: 1-Test Scaffolding + Performance Baseline*
*Context gathered: 2026-08-18*
