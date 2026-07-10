#!/usr/bin/env node
/**
 * fix-html-lang.js — post-build pass over the static export.
 *
 * The root layout renders a static <html lang="fr" dir="ltr"> for EVERY page
 * (Next.js App Router can't vary <html> attributes from the [lang] segment
 * under static export; HtmlLangSync only fixes them client-side). That breaks:
 *   - Pagefind, which splits its index per language from <html lang> and was
 *     indexing all locales as French (wrong stemming for en/es/ar/it),
 *   - SEO / screen readers on non-FR pages,
 *   - RTL first paint on /ar/ (flash of LTR before hydration).
 *
 * This script rewrites lang= and dir= on the <html> tag of every page under
 * out/<locale>/ to the correct values. Runs between `next build` and
 * `pagefind` (see package.json build script).
 */
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, '..', 'out')
const RTL = new Set(['ar', 'fa', 'he', 'ur'])
const LOCALES = ['fr', 'en', 'es', 'ar', 'it']

function* htmlFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* htmlFiles(p)
    else if (e.name.endsWith('.html')) yield p
  }
}

let patched = 0
for (const locale of LOCALES) {
  const dir = path.join(OUT, locale)
  if (!fs.existsSync(dir)) continue
  const dirAttr = RTL.has(locale) ? 'rtl' : 'ltr'
  for (const file of htmlFiles(dir)) {
    const src = fs.readFileSync(file, 'utf8')
    const out = src.replace(/(<html\b[^>]*?)\blang="[^"]*"([^>]*?)\bdir="[^"]*"/, `$1lang="${locale}"$2dir="${dirAttr}"`)
    if (out !== src) {
      fs.writeFileSync(file, out)
      patched++
    }
  }
}
console.log(`[fix-html-lang] patched ${patched} page(s)`)
