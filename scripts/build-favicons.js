#!/usr/bin/env node
/**
 * build-favicons.js — generate the Grubano favicon set with a transparent
 * background, from app/icon.svg as the single source of truth.
 *
 * Outputs:
 *   app/favicon.ico        — multi-size ICO (16, 32, 48), PNG-inside
 *   app/icon.svg           — left as-is (source of truth, hand-edited)
 *   app/apple-icon.png     — 180×180 with alpha
 *   public/web-app-manifest-192x192.png — PWA icon (192)
 *   public/web-app-manifest-512x512.png — PWA icon (512)
 *
 * All raster outputs preserve the SVG's transparent background (alpha
 * channel) — no opaque square behind the mark.
 *
 * Why a custom script and not RealFaviconGenerator:
 *   - One source of truth (app/icon.svg) lives in the repo.
 *   - Re-runnable on every brand tweak with `node scripts/build-favicons.js`.
 *   - Zero new runtime deps — `sharp` is already pulled in transitively.
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = path.resolve(__dirname, '..')
const SRC_SVG = path.join(ROOT, 'app', 'icon.svg')

async function pngFromSvg(svgBuffer, size) {
  return sharp(svgBuffer, { density: 384 })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // keep transparent
    })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/**
 * Pack a list of PNG buffers into a single .ico file with one ICONDIRENTRY
 * per image. Each entry carries the image's pixel size (0 == 256), 32 bpp,
 * and a byte-offset to its PNG payload — Vista+ / all evergreen browsers
 * accept this PNG-inside-ICO layout natively.
 */
function buildIcoFromPngs(pngsBySize) {
  // pngsBySize: [{ size: 16|32|48|..., buf: Buffer }, …]
  const count = pngsBySize.length
  const HEADER = 6
  const ENTRY = 16
  const headerBuf = Buffer.alloc(HEADER + ENTRY * count)
  headerBuf.writeUInt16LE(0, 0)         // reserved
  headerBuf.writeUInt16LE(1, 2)         // type 1 = icon
  headerBuf.writeUInt16LE(count, 4)     // image count

  let dataOffset = HEADER + ENTRY * count
  const dataBuffers = []
  pngsBySize.forEach(({ size, buf }, i) => {
    const off = HEADER + ENTRY * i
    headerBuf.writeUInt8(size >= 256 ? 0 : size, off + 0)   // width
    headerBuf.writeUInt8(size >= 256 ? 0 : size, off + 1)   // height
    headerBuf.writeUInt8(0, off + 2)                        // palette
    headerBuf.writeUInt8(0, off + 3)                        // reserved
    headerBuf.writeUInt16LE(1, off + 4)                     // planes
    headerBuf.writeUInt16LE(32, off + 6)                    // bpp
    headerBuf.writeUInt32LE(buf.length, off + 8)            // size
    headerBuf.writeUInt32LE(dataOffset, off + 12)           // offset
    dataBuffers.push(buf)
    dataOffset += buf.length
  })
  return Buffer.concat([headerBuf, ...dataBuffers])
}

/** Quick "has any non-fully-opaque pixel?" check — proves the alpha channel
 *  survived round-tripping. Reads the PNG via sharp, fetches raw RGBA. */
async function hasTransparentPixels(pngBuf) {
  const { data, info } = await sharp(pngBuf).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  })
  if (info.channels < 4) return false
  // Sample every 4 bytes (RGBA) and look for any alpha < 255
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true
  }
  return false
}

async function main() {
  if (!fs.existsSync(SRC_SVG)) {
    throw new Error(`Source SVG missing: ${SRC_SVG}`)
  }
  const svg = fs.readFileSync(SRC_SVG)

  console.log(`[favicon] source: ${path.relative(ROOT, SRC_SVG)}`)

  // Multi-size .ico (16, 32, 48): one ICONDIRENTRY per size.
  const ICO_SIZES = [16, 32, 48]
  const icoPngs = []
  for (const size of ICO_SIZES) {
    const buf = await pngFromSvg(svg, size)
    icoPngs.push({ size, buf })
  }
  const icoBuf = buildIcoFromPngs(icoPngs)
  fs.writeFileSync(path.join(ROOT, 'app', 'favicon.ico'), icoBuf)
  console.log(
    `[favicon] wrote app/favicon.ico (${icoBuf.length} B, sizes ${ICO_SIZES.join('/')})`,
  )

  // Apple touch icon — 180×180, transparent.
  const apple = await pngFromSvg(svg, 180)
  fs.writeFileSync(path.join(ROOT, 'app', 'apple-icon.png'), apple)
  console.log(`[favicon] wrote app/apple-icon.png (${apple.length} B, 180×180)`)

  // PWA icons (transparent), to public/ so a future manifest can reference them.
  fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true })
  for (const size of [192, 512]) {
    const buf = await pngFromSvg(svg, size)
    const out = path.join(ROOT, 'public', `web-app-manifest-${size}x${size}.png`)
    fs.writeFileSync(out, buf)
    console.log(
      `[favicon] wrote public/web-app-manifest-${size}x${size}.png (${buf.length} B, ${size}×${size})`,
    )
  }

  // Transparency self-check on every raster output.
  console.log('[favicon] transparency check:')
  for (const { size, buf } of icoPngs) {
    const ok = await hasTransparentPixels(buf)
    console.log(`  - ico/${size}×${size}     alpha ok? ${ok}`)
  }
  for (const [name, full] of [
    ['app/apple-icon.png', path.join(ROOT, 'app', 'apple-icon.png')],
    ['public/web-app-manifest-192x192.png', path.join(ROOT, 'public', 'web-app-manifest-192x192.png')],
    ['public/web-app-manifest-512x512.png', path.join(ROOT, 'public', 'web-app-manifest-512x512.png')],
  ]) {
    const buf = fs.readFileSync(full)
    const ok = await hasTransparentPixels(buf)
    console.log(`  - ${name.padEnd(38)} alpha ok? ${ok}`)
  }
}

main().catch((err) => {
  console.error('[favicon] fatal:', err)
  process.exit(1)
})
