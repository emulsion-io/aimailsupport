const fs = require('node:fs')
const path = require('node:path')

// Keep the official distribution intact so add-on validators can identify it.
const vendorDir = path.resolve(__dirname, '../ai-mail-support/vendor')
fs.mkdirSync(vendorDir, { recursive: true })
fs.copyFileSync(
    path.resolve(__dirname, '../node_modules/dompurify/dist/purify.min.js'),
    path.join(vendorDir, 'purify.min.js')
)

// Add after Parcel so it does not transform the official vendor distribution.
const optionsPath = path.resolve(__dirname, '../ai-mail-support/options/options.html')
const html = fs.readFileSync(optionsPath, 'utf8')
const script = '<script src="../vendor/purify.min.js"></script>'
if (!html.includes(script)) {
    if (!html.includes('<script')) throw new Error('Options page has no script entry point')
    fs.writeFileSync(optionsPath, html.replace('<script', `${script}<script`).trimEnd() + '\n')
}
