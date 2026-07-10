#!/usr/bin/env node
/**
 * validate-mdx.js — compile every content/**.mdx with the real MDX compiler.
 * Catches acorn/JSX/fence errors per file BEFORE a 2-minute next build dies
 * on the first one. Exits 1 if any file fails.
 *
 *   node scripts/validate-mdx.js [subpath]   (default: content)
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const target = path.join(ROOT, process.argv[2] || 'content')

function* mdxFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* mdxFiles(p)
    else if (e.name.endsWith('.mdx')) yield p
  }
}

async function main() {
  const { compile } = await import('@mdx-js/mdx')
  let ok = 0
  let bad = 0
  for (const file of mdxFiles(target)) {
    const raw = fs.readFileSync(file, 'utf8')
    // Frontmatter sanity — Nextra parses it as strict YAML: duplicate keys
    // are a build failure the MDX compile below would not catch.
    const fm = raw.match(/^---\n([\s\S]*?)\n---\n/)
    if (fm) {
      const keys = fm[1].split('\n').map((l) => (l.match(/^(\w+):/) || [])[1]).filter(Boolean)
      const dupes = keys.filter((k, i) => keys.indexOf(k) !== i)
      if (dupes.length) {
        bad++
        console.error(`✗ ${path.relative(ROOT, file)}: duplicate frontmatter key(s): ${[...new Set(dupes)].join(', ')}`)
        continue
      }
    }
    const src = raw.replace(/^---\n[\s\S]*?\n---\n/, '')
    try {
      await compile(src, { format: 'mdx' })
      ok++
    } catch (err) {
      bad++
      const loc = err.line ? ` (line ${err.line})` : ''
      console.error(`✗ ${path.relative(ROOT, file)}${loc}: ${err.reason || err.message}`)
    }
  }
  console.log(`[validate-mdx] ${ok} OK, ${bad} failed`)
  process.exit(bad ? 1 : 0)
}

main()
