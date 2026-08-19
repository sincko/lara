# LaryArt — decoupage ed oggetti d'arte fatti a mano

Sito personale di Lara, che realizza decoupage originali e oggetti d'arte fatti a mano per passione. Il sito è costruito con [Gatsby](https://www.gatsbyjs.com/) e [Decap CMS](https://decapcms.org/) (il fork mantenuto di Netlify CMS) ed è pubblicato su Netlify all'indirizzo [https://laryart.it](https://laryart.it).

## Contenuti

- **Blog** (`src/content/posts/`): 19 post in Markdown con frontmatter (titolo, data, slug, immagine in evidenza).
- **Pagine** (`src/content/pages/`): `index`, `laryart`, `privacy`, `contatti`.
- **Modulo di contatto**: form realizzato con Formik e yup, invio tramite emailjs.

## Stack tecnologico

- [Gatsby](https://www.gatsbyjs.com/) 5.15 — generatore di siti statici
- [React](https://react.dev/) 18
- [Decap CMS](https://decapcms.org/) — gestione dei contenuti su `/admin/` (fork mantenuto di Netlify CMS)
- [Sass](https://sass-lang.com/) (dart-sass) — compilazione SCSS
- Formik + yup — modulo di contatto
- [Matomo](https://matomo.org/) — statistiche di visita
- Node.js 24 (`.nvmrc`) e yarn 1.22.22 (`packageManager` in `package.json`)

## Sviluppo locale

Prerequisiti:

- Node.js 24 (con [nvm](https://github.com/nvm-sh/nvm): `nvm use` legge `.nvmrc`)
- yarn 1.22

> Il progetto impone automaticamente Node 24: `yarn install`, `yarn build` e `yarn develop` falliscono con un errore esplicito sotto qualsiasi altra versione (campo `engines` + `engine-strict` in `.yarnrc` + guardia `scripts/check-node-version.js`). Se l'installazione fallisce per versione di Node, il comando di ripristino è `nvm use && yarn install`. Per chi usa nvm, `nvm alias default 24` evita di ripetere `nvm use` a ogni sessione.

Comandi:

```bash
yarn install    # installa le dipendenze
yarn develop    # avvia il server di sviluppo su http://localhost:8000
yarn build      # build di produzione in public/
yarn test       # esegue la suite di test (jest)
yarn format     # formatta il codice con Prettier
yarn clean      # pulisce la cache di Gatsby
```

> Usa solo i comandi yarn: un altro package manager reintrodurrebbe il doppio lockfile.

## Decap CMS

La gestione dei contenuti avviene tramite Decap CMS (il fork mantenuto di Netlify CMS) all'indirizzo `/admin/` (autenticazione via git-gateway). Per usare il CMS in locale:

```bash
npx decap-server
yarn develop
```

## Pubblicazione

Il sito è pubblicato su Netlify:

- Build command: `yarn build`
- Publish directory: `public`
- Versione Node: 24 (letta da `.nvmrc`)

## Struttura del progetto

- `src/content/` — contenuti (post e pagine in Markdown)
- `src/components/` — componenti React
- `src/templates/` — template delle pagine
- `src/assets/scss/` — stili SCSS
- `static/admin/config.yml` — configurazione di Decap CMS
- `gatsby-config.js` — configurazione del sito (metadati da `src/util/site.json`)
