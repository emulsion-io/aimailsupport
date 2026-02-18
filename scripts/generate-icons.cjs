const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

const sourceIconPath = path.resolve(__dirname, '..', 'docs', 'icon.png')
const outputDir = path.resolve(__dirname, '..', 'ai-mail-support', 'images')
const sizes = [16, 32, 64]

async function ensureSourceExists() {
    try {
        await fs.access(sourceIconPath)
    } catch {
        throw new Error(`Source icon not found: ${sourceIconPath}`)
    }
}

async function generateVariant(size, variantName) {
    const base = sharp(sourceIconPath)
        .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })

    let pipeline = base

    if (variantName === 'light') {
        pipeline = base.modulate({ brightness: 1.18, saturation: 1.05 })
    } else if (variantName === 'dark') {
        pipeline = base.modulate({ brightness: 0.82, saturation: 0.95 })
    }

    const outputPath = path.join(outputDir, `icon-${variantName}-${size}.png`)
    await pipeline.png().toFile(outputPath)
}

async function run() {
    await ensureSourceExists()
    await fs.mkdir(outputDir, { recursive: true })

    for (const size of sizes) {
        await generateVariant(size, 'color')
        await generateVariant(size, 'light')
        await generateVariant(size, 'dark')
    }

    // Keep a canonical icon filename for any additional static references.
    await sharp(sourceIconPath).png().toFile(path.join(outputDir, 'icon.png'))

    console.log(`Generated icon assets in: ${outputDir}`)
}

run().catch((error) => {
    console.error(error)
    process.exit(1)
})
