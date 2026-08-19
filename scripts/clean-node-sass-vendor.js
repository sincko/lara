const fs = require('fs')
const path = require('path')

const vendorDir =
  process.env.NODE_SASS_VENDOR_DIR ||
  path.resolve(__dirname, '..', 'node_modules', 'node-sass', 'vendor')

if (!fs.existsSync(vendorDir)) {
  process.exit(0)
}

const ELF_MAGIC = Buffer.from([0x7f, 0x45, 0x4c, 0x46])

function isElf(filePath) {
  const fd = fs.openSync(filePath, 'r')
  const head = Buffer.alloc(4)
  const bytesRead = fs.readSync(fd, head, 0, 4, 0)
  fs.closeSync(fd)
  return bytesRead === 4 && head.equals(ELF_MAGIC)
}

for (const entry of fs.readdirSync(vendorDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const binding = path.join(vendorDir, entry.name, 'binding.node')
  if (!fs.existsSync(binding)) continue
  if (!isElf(binding)) {
    fs.unlinkSync(binding)
    console.log(`removed corrupt binding: ${binding}`)
  }
}

const abiBinding = path.join(
  vendorDir,
  `linux-x64-${process.versions.modules}`,
  'binding.node'
)
const buildBinding = path.resolve(vendorDir, '..', 'build', 'Release', 'binding.node')

if (!fs.existsSync(abiBinding) && !fs.existsSync(buildBinding)) {
  console.error(
    'NODE_SASS_BINARY_MISSING: nessun binario node-sass valido per il Node attivo. ' +
      'Esegui `nvm use && yarn install` per ripristinare.'
  )
  process.exit(1)
}
