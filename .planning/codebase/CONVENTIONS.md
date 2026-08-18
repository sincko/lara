# Coding Conventions

**Analysis Date:** 2026-08-18

## Overview

Gatsby 5 static site (LaryArt — personal blog/portfolio). All application code is plain JavaScript (`.js`, no `.jsx` extension, no TypeScript in `src/` despite `typescript` being a devDependency in `package.json`). Styling is SCSS with CSS custom properties. Content is Markdown managed via Netlify CMS.

## Naming Patterns

**Files:**
- kebab-case for all source files: `post-card.js`, `blog-list-home.js`, `top-contacts.js` (see `src/components/`)
- SCSS partials use underscore prefix: `_defaults.scss`, `_theme-variables.scss`, `_utility.scss` (see `src/assets/scss/`)
- Gatsby config files at repo root: `gatsby-config.js`, `gatsby-node.js`, `gatsby-browser.js`

**Components:**
- PascalCase component names: `PostCard`, `FormikContact`, `BlogListHome`, `LaraMontanari`
- Component files named after their default export (kebab-case version): `src/components/post-card.js` exports `PostCard`
- Local helper components defined in the same file: `ListLink` in `src/components/navigation.js`, `Pagination` in `src/templates/blog-list.js` and `src/templates/blog-post.js`, `PostMaker` in `src/components/blog-list-home.js`, `TextFieldConError` in `src/components/formik.js`

**Functions:**
- Arrow functions for all components and callbacks: `const PostCard = ({ data }) => (...)` (`src/components/post-card.js:5`)
- `props =>` style with parens omitted for single params (matches `.prettierrc` `arrowParens: "avoid"`): `const ListLink = props => (...)` (`src/components/navigation.js:24`)
- Named function declarations only for Gatsby page-query exports and one component: `export default function BlogListHome()` (`src/components/blog-list-home.js:25`)
- Class components use `render()` and constructor-bound handlers: `handleToggleClick() { ... }` bound in constructor (`src/components/navigation.js:30-42`)

**Variables:**
- camelCase: `siteTitle`, `currentPage`, `numPages`, `blogSlug`, `postsPerPage`
- Destructuring from props/data is the norm: `const { frontmatter, html } = markdownRemark` (`src/templates/index-page.js:36`)
- GraphQL query results destructured: `const { site } = useStaticQuery(query)` (`src/components/layout.js:23`)

**Types:**
- No TypeScript in `src/` — plain JS only
- PropTypes used in exactly one file: `Seo.propTypes` + `Seo.defaultProps` (`src/components/seo.js:71-83`). All other components omit PropTypes.

## Code Style

**Formatting:**
- Prettier 3 (`package.json` devDependencies), config in `.prettierrc`:
  - `"arrowParens": "avoid"` — omit parens around single arrow-function params
  - `"semi": false` — no semicolons
- `.prettierignore` excludes `.cache`, `package.json`, `package-lock.json`, `public`
- Run via `yarn format` → `prettier --write "**/*.{js,jsx,json,md}"` (`package.json:17`)
- `.vscode/settings.json` sets `editor.tabSize: 2`, `prettier.useTabs: true`, `editor.wordWrap: "on"`

**Linting:**
- No ESLint config, no linter installed. No lint script in `package.json`. Code quality relies on Prettier only.

**Strings:**
- Double quotes everywhere: `import React from "react"` (`src/components/layout.js:1`)
- Exception: `src/components/logo.js` uses single quotes and semicolons — an unformatted outlier that does not follow the repo style

**JSX:**
- Multi-line JSX indented 2 spaces; conditional rendering via ternary with `""` fallback: `{Image ? (<Img ... />) : ("")}` (`src/templates/index-page.js:59-67`)
- Boolean-ish conditionals: `{(article ? true : null) && <meta ... />}` (`src/components/seo.js:38`)
- Class-name modifiers use a leading-dash convention: `"menu-trigger" + (this.state.showMenu ? " is-active" : "")` (`src/components/navigation.js:55-57`), `className="icon -right"`, `className="button -outline"` (`src/pages/404.js:28-31`)

## Import Organization

**Order:**
1. React first: `import React from "react"`
2. Gatsby imports: `import { Link, graphql } from "gatsby"`
3. Third-party libraries (icons, formik, material-ui, yup, emailjs)
4. Local components via relative paths: `import Layout from "../components/layout"`
5. Assets/styles last: `import "../assets/scss/style.scss"` (`src/components/layout.js:8`)

**Path Aliases:**
- None. All imports are relative paths (`../components/...`, `../assets/...`).

## Error Handling

**Patterns:**
- Minimal error handling overall. The only explicit handling:
  - `reporter.panicOnBuild` for GraphQL query failures in `gatsby-node.js:31`
  - `.catch(error => { console.log(error.text); return })` in the emailjs submit handler (`src/components/formik.js:45-48`)
- Form validation via yup schema: `yup.object({ email: yup.string().email().required(), nome: yup.string().required() })` (`src/components/formik.js:25-28`), surfaced through `meta.error && meta.touched` in `TextFieldConError` (`src/components/formik.js:12`)
- No try/catch blocks, no error boundaries, no custom error types anywhere in `src/`

## Logging

**Framework:** `console` only.

**Patterns:**
- `console.log(result.text, result.status)` and `console.log(error.text)` in the emailjs promise chain (`src/components/formik.js:43-46`)
- No structured logging, no logger abstraction

## Comments

**When to Comment:**
- Rarely. Comments are mostly leftover starter-template notes and commented-out code:
  - `//https://dashboard.emailjs.com/admin` (`src/components/formik.js:7`)
  - `// data.markdownRemark holds your post data` (`src/templates/blog-post.js:53`)
  - Commented-out JSX blocks: `src/components/logo.js:6-8`, `src/templates/blog-post.js:25-27,44`, `src/components/formik.js:120-121`, `src/assets/scss/style.scss:9-13`
  - Commented-out config: `gatsby-config.js:17-19`

**JSDoc/TSDoc:**
- Not used. No JSDoc comments in any source file.

## Function Design

**Size:**
- Components are small (10–140 lines per file). Largest files: `src/templates/blog-post.js` (140), `src/components/formik.js` (128), `src/templates/blog-list.js` (115).

**Parameters:**
- Props destructured inline: `({ children, className })`, `({ data, pageContext })`
- Helper components take a single `props` object: `const Pagination = props => ...` (`src/templates/blog-list.js:39`)
- One file builds a props object then spreads it: `let props = { previous, next }` + `<Pagination {...props} />` (`src/templates/blog-post.js:60-63,111`)

**Return Values:**
- Components return JSX directly (implicit return in arrow functions)
- Conditional render fallbacks return `""` (empty string), not `null`: `src/components/post-card.js:18`, `src/templates/index-page.js:66`

## Module Design

**Exports:**
- Single default export per file for all components/pages: `export default PostCard`
- Named exports only for GraphQL queries: `export const pageQuery = graphql` (all templates), `export const blogListQuery` (`src/templates/blog-list.js:9`)
- Gatsby API hooks as named exports in `gatsby-node.js` (`exports.createPages`, `exports.onCreateNode`) and `gatsby-browser.js` (`export const onServiceWorkerUpdateReady`)

**Barrel Files:**
- None. No `index.js` files; components imported directly by path.

## GraphQL Conventions

- Queries defined as `graphql` tagged template literals
- Templates export named `pageQuery` (or `blogListQuery`) for Gatsby's page-data generation: `src/templates/blog-post.js:118`, `src/templates/blog-list.js:9`
- Components use `useStaticQuery` with a local `const query = graphql` (or inline in `StaticQuery`): `src/components/layout.js:12-20`, `src/components/seo.js:85-97`, `src/components/blog-list-home.js:28-57`
- Field aliasing used to map metadata: `siteTitle: title`, `defaultImage: image` (`src/components/seo.js:88-94`)
- Image fragments: `...GatsbyImageSharpFluid`, `...GatsbyImageSharpFluidLimitPresentationSize`

## SCSS Conventions

- Partials imported in `src/assets/scss/style.scss`: `@import "theme-variables"; @import "defaults"; @import "lib/css-grid-utility"; @import "utility"; @import "lib/prism-default";`
- CSS custom properties defined in `:root` in `_theme-variables.scss`: `--primary-color: #ff1c65`, `--font-family-titles`, `--grid-gap: 30px`
- Breakpoint variables: `$breakpoint-sm: 576px` … `$breakpoint-xl: 1200px` (`_theme-variables.scss:2-5`)
- Class naming: kebab-case, BEM-flavored (`site-header`, `post-card`, `featured-image`, `blog-post-content`); modifiers as leading-dash suffix classes (`.icon.-right` in `_utility.scss:10`, `.button-white` in `style.scss`)
- Nested selectors for component-scoped styles (`style.scss:44-62`)

## Content Conventions

- Blog posts and pages are Markdown with frontmatter (`template`, `slug`, `title`, `date`, `featuredImage`) in `src/content/posts/` and `src/content/pages/`
- Site metadata lives in `src/util/site.json` (loaded by `gatsby-config.js:13`)
- UI copy is Italian; code identifiers are English

## Anti-Patterns Observed (do not replicate)

- **Array index as React key:** `key={index}` in `src/components/navigation.js:46` — use a stable id
- **`dangerouslySetInnerHTML`** for all markdown HTML rendering (`src/templates/blog-post.js:96`, `src/templates/contatti.js:39`, `src/templates/index-page.js:49`, `src/templates/laryart.js:28`, `src/templates/privacy.js:38`) — acceptable for trusted local markdown, but never use with user-supplied HTML
- **Hardcoded secrets in source:** `emailjs.init("user_...")` (`src/components/formik.js:8`) — move to env vars
- **Dead/unused files:** `src/components/old-form.js` (starter demo form, unused), `src/components/form-pulito.js` (fragment-only file starting with `;<form`, not a valid module)
- **Unformatted outlier:** `src/components/logo.js` uses semicolons + single quotes, violating the Prettier config
- **`let` for never-reassigned props objects:** `let props = {...}` (`src/templates/blog-post.js:60`, `src/templates/blog-list.js:89`) — use `const`

---

*Convention analysis: 2026-08-18*
