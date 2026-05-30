#!/usr/bin/env node
/**
 * translate-content.js — Grubano docs translator (Agent 5)
 *
 * Reads English source files written by generate-from-source.js:
 *   content/en/api/*.mdx
 *   content/en/changelog/*.mdx
 *
 * Translates each into fr / es / ar / it via the Claude API and writes:
 *   content/{fr,es,ar,it}/api/*.mdx
 *   content/{fr,es,ar,it}/changelog/*.mdx
 *
 * Idempotent: each source file embeds a `sourceHash` in its frontmatter. We
 * copy that hash into the translated file. On re-runs, if a target file's
 * sourceHash already matches the EN source, we skip the API call.
 *
 * _meta.ts files are NOT sent to the API — we generate them directly with
 * a small per-language lookup table for the localized 'index' label, since
 * the only translatable string is "Overview" / "Changelog".
 *
 * Required env:
 *   ANTHROPIC_API_KEY
 *
 * Optional env:
 *   ANTHROPIC_MODEL          (default: claude-sonnet-4-5)
 *   TRANSLATE_CONCURRENCY    (default: 4)
 *   TRANSLATE_LANGS          (default: fr,es,ar,it)
 *   TRANSLATE_DRY_RUN=1      (skip API calls; print plan)
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/translate-content.js
 */

const fs = require('fs')
const path = require('path')

// ── Config ───────────────────────────────────────────────────────────────────

const DOCS_ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(DOCS_ROOT, 'content')
const SOURCE_LANG = 'en'
const TARGET_LANGS = (process.env.TRANSLATE_LANGS || 'fr,es,ar,it')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5'
const CONCURRENCY = Math.max(1, Number(process.env.TRANSLATE_CONCURRENCY || 4))
const DRY_RUN = process.env.TRANSLATE_DRY_RUN === '1'
const API_KEY = process.env.ANTHROPIC_API_KEY

const LANG_NAME = {
  fr: 'French',
  es: 'Spanish',
  ar: 'Arabic',
  it: 'Italian',
}

// Localized label for the auto-generated section index entry.
const INDEX_LABEL = {
  api: { en: 'Overview', fr: "Vue d'ensemble", es: 'Resumen', ar: 'نظرة عامة', it: 'Panoramica' },
  changelog: {
    en: 'Changelog',
    fr: 'Journal des modifications',
    es: 'Registro de cambios',
    ar: 'سجل التغييرات',
    it: 'Registro delle modifiche',
  },
}

if (!DRY_RUN && !API_KEY) {
  console.error('[translate] ANTHROPIC_API_KEY is required (set TRANSLATE_DRY_RUN=1 to preview).')
  process.exit(1)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function listMdx(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => path.join(dir, f))
}

function readSourceHash(filePath) {
  if (!fs.existsSync(filePath)) return null
  const src = fs.readFileSync(filePath, 'utf8')
  const m = src.match(/^---\s*\n([\s\S]*?)\n---/m)
  if (!m) return null
  const fm = m[1]
  const h = fm.match(/^sourceHash:\s*['"]?([a-f0-9]+)['"]?\s*$/m)
  return h ? h[1] : null
}

function buildSystemPrompt(langCode) {
  const langName = LANG_NAME[langCode] || langCode
  const rtlNote =
    langCode === 'ar'
      ? '\n- The file IS Arabic prose; produce naturally right-to-left readable Arabic. The markdown source remains LTR — do not add directional control characters.'
      : ''
  return `You are a professional technical translator. Translate the following MDX documentation file from English to ${langName}.

Rules:
- PRESERVE the YAML frontmatter delimiters (---) and key names exactly. Translate ONLY the VALUES of the keys 'title' and 'description'. Leave 'sourceHash' (and any other keys) byte-for-byte identical.
- PRESERVE all markdown structure: headings, lists, tables (including pipe characters and dashes), block quotes, and link targets.
- PRESERVE all code blocks (inside triple-backtick fences) EXACTLY — do not translate code.
- PRESERVE all inline code (\`...\`) EXACTLY — these are API identifiers like \`/api/orders\`, \`GET\`, \`sessionId\`, status codes like \`200\`. Never translate them.
- PRESERVE all HTML, JSX, and MDX expressions exactly: {/* comments */}, <Component>, etc.
- Translate prose and translatable table-cell values (e.g. "Bad request" → equivalent in target language). Do NOT translate HTTP method names, status codes, endpoint paths, or technical identifiers.
- Translate the auto-generated banner comment {/* AUTO-GENERATED ... */} contents minimally — keep the script reference intact.${rtlNote}

Output ONLY the translated file content. No explanations. No surrounding code fences.`
}

async function callClaude(systemPrompt, userContent) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Claude API ${res.status}: ${text.slice(0, 400)}`)
  }
  const data = await res.json()
  const block = (data.content || []).find((b) => b.type === 'text')
  if (!block || !block.text) throw new Error('Claude API returned no text block')
  return block.text
}

/** Run async tasks with a concurrency limit. */
async function runWithConcurrency(items, limit, worker) {
  const results = []
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      try {
        results[i] = await worker(items[i], i)
      } catch (err) {
        results[i] = { error: err }
      }
    }
  })
  await Promise.all(runners)
  return results
}

/**
 * Build a _meta.ts for a target dir based on the .mdx files actually present.
 * We localize the `index` label only; other entries fall back to a titled
 * version of the filename (Nextra also does this auto-discovery, so listing
 * them explicitly is mainly for stable ordering and to make the file readable).
 */
function buildMeta(targetDir, section, langCode) {
  const files = fs
    .readdirSync(targetDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
  if (!files.length) return null

  const indexLabel = INDEX_LABEL[section]?.[langCode] || INDEX_LABEL[section]?.en || 'Index'
  const hasIndex = files.includes('index')
  const others = files.filter((k) => k !== 'index').sort()

  const lines = []
  lines.push('// AUTO-GENERATED by scripts/translate-content.js — do not edit by hand.')
  lines.push("import type { MetaRecord } from 'nextra'")
  lines.push('')
  lines.push('export default {')
  if (hasIndex) lines.push(`  index: ${JSON.stringify(indexLabel)},`)
  for (const k of others) {
    const title = k.charAt(0).toUpperCase() + k.slice(1)
    lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(title)},`)
  }
  lines.push('} satisfies MetaRecord')
  return lines.join('\n') + '\n'
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const sections = ['api', 'changelog']
  const tasks = []

  for (const section of sections) {
    const srcDir = path.join(CONTENT_DIR, SOURCE_LANG, section)
    const sources = listMdx(srcDir)
    if (!sources.length) {
      console.warn(`[translate] no source files in ${path.relative(DOCS_ROOT, srcDir)} — skipping ${section}`)
      continue
    }
    for (const lang of TARGET_LANGS) {
      const outDir = path.join(CONTENT_DIR, lang, section)
      // Defer mkdir until we actually have a file to write so a 100%-failed
      // translation run doesn't leave behind empty locale folders that Nextra
      // would then try to render.

      for (const srcFile of sources) {
        const fileName = path.basename(srcFile)
        const outFile = path.join(outDir, fileName)
        tasks.push({ section, lang, srcFile, outFile, outDir, fileName })
      }
    }
  }

  console.log(
    `[translate] ${tasks.length} candidate file(s) across ${TARGET_LANGS.length} language(s). Model=${MODEL} concurrency=${CONCURRENCY} dryRun=${DRY_RUN}`,
  )

  let translated = 0
  let skipped = 0
  let failed = 0

  await runWithConcurrency(tasks, CONCURRENCY, async (t) => {
    const srcHash = readSourceHash(t.srcFile)
    const existingHash = readSourceHash(t.outFile)
    if (srcHash && existingHash && srcHash === existingHash) {
      skipped++
      return
    }
    if (DRY_RUN) {
      console.log(`[translate] would translate ${t.lang}/${t.section}/${t.fileName}`)
      return
    }
    const src = fs.readFileSync(t.srcFile, 'utf8')
    try {
      const out = await callClaude(buildSystemPrompt(t.lang), src)
      fs.mkdirSync(t.outDir, { recursive: true })
      fs.writeFileSync(t.outFile, out.endsWith('\n') ? out : out + '\n', 'utf8')
      translated++
      console.log(`[translate] wrote ${t.lang}/${t.section}/${t.fileName}`)
    } catch (err) {
      failed++
      console.error(`[translate] FAILED ${t.lang}/${t.section}/${t.fileName}: ${err.message}`)
    }
  })

  // After all translations: regenerate _meta.ts for every dir that ended up
  // with at least one .mdx file, so the sidebar matches reality.
  for (const section of sections) {
    for (const lang of TARGET_LANGS) {
      const outDir = path.join(CONTENT_DIR, lang, section)
      if (!fs.existsSync(outDir)) continue
      const meta = buildMeta(outDir, section, lang)
      if (!meta) continue
      const metaPath = path.join(outDir, '_meta.ts')
      const existing = fs.existsSync(metaPath) ? fs.readFileSync(metaPath, 'utf8') : null
      if (existing !== meta) {
        fs.writeFileSync(metaPath, meta, 'utf8')
        console.log(`[translate] wrote ${path.relative(DOCS_ROOT, metaPath)}`)
      }
    }
  }

  console.log(
    `[translate] done. translated=${translated} skipped(cached)=${skipped} failed=${failed}`,
  )
  if (failed > 0) process.exit(2)
}

main().catch((err) => {
  console.error('[translate] fatal:', err)
  process.exit(1)
})
