# AGENTS.md

Gatsby 5 static site for laryart.it (Italian artisan blog/portfolio). Content-driven: Markdown + Netlify CMS, deployed on Netlify.

## Commands

- `yarn develop` / `yarn build` / `yarn clean` / `yarn format` — always via **yarn 1.22** (npm would reintroduce a second lockfile)
- `yarn test` — jest suite (4 suites, ~9 tests). Single test: `yarn test src/components/formik.test.js`
- Local CMS: `npx netlify-cms-proxy-server` + `yarn develop` (admin at `/admin/`)

## Environment gotchas

- **Node 20 is enforced** (`engines` + `engine-strict` in `.yarnrc` + `scripts/check-node-version.js`). Any yarn command fails on other Node versions. Recovery: `nvm use && yarn install`.
- `postinstall` runs `scripts/clean-node-sass-vendor.js` — deletes non-ELF node-sass bindings and fails install if no valid binary exists. If node-sass errors appear, the fix is `nvm use && yarn install`, not reinstalling node-sass.
- Netlify build: `yarn build` → publish `public/` (`netlify.toml`); Node version comes from `.nvmrc`.

## Architecture

- **Template-driven routing**: every Markdown file's frontmatter `template` field maps to `src/templates/<template>.js` in `gatsby-node.js` `createPages`. A `template:` value with no matching file breaks the build.
- Content: `src/content/posts/` (blog), `src/content/pages/` (index, laryart, privacy, contatti), site metadata in `src/util/site.json` (loaded by `gatsby-config.js`). UI copy is Italian.
- Blog pagination: 9 posts/page, `/blog` + `/blog/<n>`, computed in `gatsby-node.js`.
- Images still use deprecated `gatsby-image` v3 (`Img` + `fluid` fragments) — migration to `gatsby-plugin-image` is planned (phase 3), don't mix in new `gatsby-plugin-image` usage without migrating.
- `src/pages/` holds only static `404.js` and `thanks.js`; everything else is generated from Markdown.

## Testing quirks

- Tests are co-located `*.test.js`. `gatsby-node.test.js` needs `/** @jest-environment node */` (no window); component tests default to jsdom.
- `src/components/formik.js` calls `emailjs.init()` at module load — any test importing it must `jest.mock("emailjs-com")` **before** the import (see `formik.test.js`).
- No ESLint — Prettier is the only formatter. Style: no semicolons, `arrowParens: "avoid"`, double quotes, kebab-case filenames, no TypeScript in `src/`.

## Known issues (planned work, don't "fix" silently)

- Hardcoded emailjs key in `src/components/formik.js:8` — planned move to env var (phase 3).
- `.planning/` is GSD planning state (roadmap, phases, codebase analysis) — not source code; `graphify-out/` is a generated knowledge graph. Don't edit either as part of feature work.
