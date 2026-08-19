const fs = require('fs')
const path = require('path')

const nvmrcPath = path.resolve(__dirname, '..', '.nvmrc')

if (!fs.existsSync(nvmrcPath)) {
  process.exit(0)
}

const pinned = fs
  .readFileSync(nvmrcPath, 'utf8')
  .trim()
  .replace(/^v/, '')
  .split('.')[0]

const active = process.versions.node.split('.')[0]

if (pinned !== active) {
  console.error(
    `NODE_VERSION_MISMATCH: .nvmrc richiede Node ${pinned}, ma è attivo Node ${process.versions.node}. ` +
      'node-sass 9.0.0 non ha un binario precompilato per questo Node (vincolo ABI). ' +
      'Esegui `nvm use && yarn install` per ripristinare.'
  )
  process.exit(1)
}
