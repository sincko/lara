# Phase 1: Test Scaffolding + Performance Baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-18
**Phase:** 1-Test Scaffolding + Performance Baseline
**Areas discussed:** Test runner & setup, Test scope, Baseline tooling, Test organization

---

## Test Runner & Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Jest 29 + gatsby-plugin-jest | Official Gatsby plugin with automatic gatsby module mocks; matches TESTING.md recommendation | ✓ |
| Vitest + @vitejs/plugin-react | Alternative runner with gatsby module alias | |

**User's choice:** Jest 29 + gatsby-plugin-jest (auto-selected in --auto mode, recommended default)
**Notes:** Matches `.planning/codebase/TESTING.md` recommendation and research Pitfall 11 (scaffold jest before the upgrade).

## Test Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Priority targets | formik yup validation + failure path, pagination math, page creation, navigation toggle | ✓ |
| Broader coverage | Include snapshot tests for all presentational components | |

**User's choice:** Priority targets (auto-selected in --auto mode, recommended default)
**Notes:** FNDT-05 scope. Form submit failure path test is the regression net for the Phase 4 false-success fix. emailjs-com must be mocked before importing FormikContact (module-load init).

## Baseline Tooling

| Option | Description | Selected |
|--------|-------------|----------|
| Lighthouse CLI + PSI | Local Lighthouse CLI + PageSpeed Insights on live site, median 3, mobile | ✓ |
| PSI only | PageSpeed Insights only | |

**User's choice:** Lighthouse CLI + PSI (auto-selected in --auto mode, recommended default)
**Notes:** FNDT-06. Results stored in `.planning/` for Phase 6 comparison.

## Test Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Co-located *.test.js | Test files next to components (Gatsby ecosystem default) | ✓ |
| __tests__/ directory | Centralized test directory | |

**User's choice:** Co-located *.test.js (auto-selected in --auto mode, recommended default)
**Notes:** Per TESTING.md recommendation.

---

## the agent's Discretion

- Exact jest config details (transform, moduleNameMapper for gatsby mocks)
- Coverage thresholds (optional)
- Snapshot test selection for presentational components

## Deferred Ideas

- ESLint flat config — v2 (MODR-03)
- E2E testing (Cypress/Playwright) — overkill for site size
