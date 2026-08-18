# External Integrations

**Analysis Date:** 2026-08-18

## APIs & External Services

**Analytics:**
- Matomo (self-hosted) - Web analytics via `gatsby-plugin-matomo` 0.17.0
  - SDK/Client: `gatsby-plugin-matomo` (configured in `gatsby-config.js`)
  - Config: `siteId: "4"`, `matomoUrl: "https://matomo.duckdns.org/"`, `siteUrl: "https://laryart.it"`, `disableCookies: false`
  - Privacy note: `src/content/pages/privacy.md` states Matomo is self-hosted on the site owner's server in the EU, no third-party tracking cookies

**Email Delivery:**
- EmailJS - Contact form email sending via `emailjs-com` 3.2.0
  - SDK/Client: `emailjs-com` (imported in `src/components/formik.js`)
  - Auth: Public user ID hardcoded at module scope: `emailjs.init("user_06xz85hi92oABMZqCIUu7")` (line 8 of `src/components/formik.js`) — **exposed in client bundle; this is the EmailJS public key pattern, but the service/template IDs are also hardcoded**: `sendForm("service_q3997uk", "template_m6tzcmm", "#contact_form")` (line 41)
  - Dashboard: https://dashboard.emailjs.com/admin (referenced in comment, line 7)
  - Note: The form also carries `data-netlify="true"` attributes (`src/components/formik.js` line 58), so submissions are dual-wired to EmailJS and Netlify Forms

**Fonts:**
- Google Fonts - Parisienne (display) and Ubuntu (400/700) loaded via CSS `@import` in `src/assets/scss/_theme-variables.scss` (lines 8-9)

**Social:**
- WhatsApp - Click-to-chat links `https://wa.me/393356785620` in `src/components/top-contacts.js` and `src/templates/blog-post.js`
- Facebook - Page link `https://www.facebook.com/larenlarylara` in `src/components/top-contacts.js`
- Flaticon - Icon attribution links in `src/components/footer-links.js`

**Search Engine Verification:**
- Google Search Console - `google-site-verification` meta tag with content `40Ge_IepZPmFBcdvFDVKxRUhCXu2JAtpArVh8GkJUnk` in `src/components/seo.js` (line 62)

## Data Storage

**Databases:**
- None. No database, no ORM, no server-side persistence.

**File Storage:**
- Git repository + Netlify - All content (markdown in `src/content/`) and media (`static/assets/`, referenced as `/assets/...` in frontmatter) are stored as files in the repo and served statically. Media is committed to git (e.g., `static/assets/*.jpg`).

**Caching:**
- Gatsby build-time caching via `netlify-plugin-gatsby-cache` (in `netlify.toml`); `gatsby-plugin-offline` provides service-worker caching for the PWA.

## Authentication & Identity

**Auth Provider:**
- Netlify Identity + Git Gateway - Powers Netlify CMS admin login (`/admin/`)
  - Implementation: `static/admin/config.yml` uses `backend: name: git-gateway`, `branch: master`; CMS writes content commits directly to the `master` branch
  - Local dev uses `local_backend: true` (requires `npx netlify-cms-proxy-server`)
  - No custom auth code in `src/`; no OAuth flows in the app itself

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry/Bugsnag/etc. Only `console.log` in `src/components/formik.js` (lines 43, 47).

**Logs:**
- Netlify build/deploy logs only; no application-level logging infrastructure.

## CI/CD & Deployment

**Hosting:**
- Netlify - Primary host; site `https://laryart.it` (also referenced as `pensive-engelbart-b7e7bb` in the README badge)
  - Config: `netlify.toml` (`publish = "public"`, `command = "npm run build"`, `NODE_VERSION = "10"` — stale, conflicts with `.nvmrc` Node 20)
  - Deploy badge in `README.md` references Netlify API badge `dee6a7bd-f632-4cfd-830c-4ac41cac464d`

**CI Pipeline:**
- None. No GitHub Actions (`.github/workflows` absent), no other CI config. Deploys happen via Netlify's git integration on push to `master` (origin: `git@github.com:sincko/lara.git`).

## Environment Configuration

**Required env vars:**
- None. The site runs with zero environment variables — all config is hardcoded:
  - `gatsby-config.js` (Matomo siteId/URL, manifest, siteUrl)
  - `src/util/site.json` (site metadata, placeholder `ga` value)
  - `src/components/formik.js` (EmailJS user/service/template IDs)

**Secrets location:**
- No `.env` files, no secret store. EmailJS credentials are committed in client-side source (`src/components/formik.js`). Netlify Identity/Git Gateway credentials are managed in the Netlify dashboard, not in the repo.

## Webhooks & Callbacks

**Incoming:**
- Netlify Forms - The contact form (`data-netlify="true"` in `src/components/formik.js` and `src/components/form-pulito.js`) posts to Netlify's form handler; submissions are delivered via Netlify's notification system (email/webhook configured in Netlify dashboard, not in repo). Honeypot field `bot-field` present in `src/components/formik.js` (line 67).

**Outgoing:**
- None implemented in code (EmailJS calls are client-side XHR, not webhooks).

---

*Integration audit: 2026-08-18*
