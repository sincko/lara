# Testing Patterns

**Analysis Date:** 2026-08-18

## Test Framework

**Runner:**
- None. No test runner is installed or configured (no Jest, Vitest, Mocha, Cypress, or Playwright in `package.json` dependencies or devDependencies).

**Assertion Library:**
- None.

**Config:**
- No `jest.config.*`, `vitest.config.*`, `cypress.*`, or `playwright.*` files exist in the repo.

**Run Commands:**
```bash
yarn test   # Placeholder only — prints "Write tests! -> https://gatsby.dev/unit-testing" and exits 1
```

The `test` script in `package.json:21` is the unmodified Gatsby starter placeholder:

```json
"test": "echo \"Write tests! -> https://gatsby.dev/unit-testing\" && exit 1"
```

## Test File Organization

**Location:**
- Not applicable — there are zero test files in the repository. A repo-wide search for `*.test.*`, `*.spec.*`, and `*.stories.*` (excluding `node_modules`, `.cache`, `public`) returns nothing.

**Naming:**
- No convention established. If tests are added, the Gatsby ecosystem default is co-located `*.test.js` files next to components (e.g., `src/components/post-card.test.js`) or a `__tests__/` directory.

## Test Structure

**Suite Organization:**
- Not applicable — no suites exist.

**Patterns:**
- No setup/teardown/assertion patterns exist in the codebase.

## Mocking

**Framework:**
- None.

**What would need mocking (based on codebase dependencies):**
- Gatsby APIs: `Link`, `graphql`, `useStaticQuery`, `StaticQuery` — every component imports from `"gatsby"` (`src/components/layout.js:2`, `src/components/seo.js:5`, `src/components/blog-list-home.js:2`)
- `gatsby-image` `Img` component (`src/components/post-card.js:3`, `src/templates/blog-post.js:3`)
- `@reach/router` `useLocation` (`src/components/seo.js:4`)
- `emailjs-com` — `emailjs.init()` runs at module load time in `src/components/formik.js:8`, so any test importing `FormikContact` must mock `emailjs-com` before import
- `@material-ui/core` and `@material-ui/icons` components
- `react-icons/ri` icon components

## Fixtures and Factories

**Test Data:**
- Not applicable — no fixtures exist.
- Natural fixture source if tests are added: real markdown content in `src/content/posts/` (e.g., `src/content/posts/2024-08-15-minnie.md`) and `src/content/pages/`, plus `src/util/site.json` for site metadata.

**Location:**
- Not applicable.

## Coverage

**Requirements:** None enforced. No coverage tooling (`coverage` and `.nyc_output` appear only in `.gitignore` as generic entries).

**View Coverage:**
```bash
# No coverage tooling installed. Would require adding Jest + @testing-library/react + gatsby-plugin-jest.
```

## Test Types

**Unit Tests:**
- Not used.

**Integration Tests:**
- Not used.

**E2E Tests:**
- Not used. No Cypress/Playwright. The only automated verification is the Netlify build itself (`netlify.toml` → `npm run build` → `gatsby build`), which catches GraphQL query errors at build time via `reporter.panicOnBuild` (`gatsby-node.js:31`).

## Common Patterns

**Async Testing:**
- Not applicable — no tests exist. The only async code in the app is the emailjs promise chain in `src/components/formik.js:40-48` and `createPages` in `gatsby-node.js:4`.

**Error Testing:**
- Not applicable — no tests exist.

## Recommendations for Adding Tests

If a testing setup is introduced, the minimal viable stack for this Gatsby 5 + React 18 codebase:

1. **Runner:** Jest 29 + `babel-jest` with the Gatsby Babel preset (`babel-preset-gatsby`), or Vitest with `@vitejs/plugin-react` and the `gatsby` module alias.
2. **Rendering:** `@testing-library/react` + `@testing-library/jest-dom` for component tests.
3. **Gatsby mocks:** Use `gatsby-plugin-jest` (official Gatsby plugin) which provides automatic mocks for `gatsby` module exports (`Link`, `graphql`, `useStaticQuery`, `StaticQuery`).
4. **Priority targets** (pure logic, no Gatsby dependency):
   - `src/components/formik.js` — yup validation schema and `TextFieldConError` error-text logic
   - `src/templates/blog-list.js` — pagination math (`prevPage`/`nextPage`/`isFirst`/`isLast` computation, lines 80-84)
   - `src/components/navigation.js` — `handleToggleClick` state toggle
5. **Snapshot tests** are appropriate for the small presentational components (`src/components/header.js`, `src/components/footer.js`, `src/components/logo.js`).
6. **Build-time verification** already exists via `gatsby build`; keep GraphQL queries covered by that rather than unit tests.

---

*Testing analysis: 2026-08-18*
