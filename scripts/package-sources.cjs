const fs = require('node:fs')
const path = require('node:path')
const archiver = require('archiver')

const root = path.resolve(__dirname, '..')
const version = require('../src/manifest.json').version
const outputDir = path.join(root, 'dist')
fs.mkdirSync(outputDir, { recursive: true })
const outputPath = path.join(outputDir, `ai-mail-extended-${version}-sources.zip`)
const output = fs.createWriteStream(outputPath)
const archive = archiver('zip', { zlib: { level: 9 } })
output.on('error', error => { throw error })
archive.on('error', error => { throw error })
output.on('close', () => console.log(`Source archive: ${outputPath} (${archive.pointer()} bytes)`))
archive.pipe(output)
archive.directory(path.join(root, 'src'), 'src')
archive.directory(path.join(root, 'scripts'), 'scripts')
for (const file of ['package.json', 'package-lock.json', 'tsconfig.json', '.posthtmlrc', 'LICENSE', 'docs/icon.png']) {
    archive.file(path.join(root, file), { name: file })
}
archive.file(path.join(root, 'docs/BUILD-SOURCES.md'), { name: 'README.md' })
archive.finalize()
