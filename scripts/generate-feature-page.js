#!/usr/bin/env node
/**
 * generate-feature-page.js — Grubano docs feature-page generator (B1-bis)
 *
 * For a given topic key (e.g. `restaurant.stocks`), gathers facts from a
 * checkout of grubano-kitchen-hub, calls the Claude API with the 8-block
 * template + the strategic guardrails, and writes a MDX page into
 * content/<locale>/<docPath>.mdx.
 *
 * The generator:
 *   - REFUSES to overwrite editorial pages (see feature-pages.config.js).
 *   - Embeds `generated: true` + a `sourceHash` in the frontmatter so the
 *     existing wrapper logic can detect generated pages, and so re-runs
 *     skip topics whose source has not changed.
 *   - Reuses the EXACT same API key + model as translate-content.js
 *     (claude-sonnet-4-5) — no new infra.
 *
 * CLI:
 *   APP_REPO_PATH=../grubano-kitchen-hub \
 *   ANTHROPIC_API_KEY=sk-ant-... \
 *   node scripts/generate-feature-page.js <topic-key>
 *
 *   <topic-key>         — single topic to (re)generate
 *   --all               — every topic in FEATURE_PAGES
 *   --force             — ignore sourceHash cache
 *   --dry-run           — print the prompt + planned output, no API call
 *
 * Env:
 *   APP_REPO_PATH          (default: ../grubano-kitchen-hub, then ../grubano)
 *   ANTHROPIC_API_KEY      required unless --dry-run
 *   ANTHROPIC_MODEL        default claude-sonnet-4-5
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const { EDITORIAL_PAGES, FEATURE_PAGES } = require('./feature-pages.config.js')

// Bumping this invalidates every sourceHash → forces regen on next run.
// Bump when you change the prompt / template structure in a meaningful way.
const TEMPLATE_VERSION = 1

// ── Locate repos ────────────────────────────────────────────────────────────

const DOCS_ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(DOCS_ROOT, 'content')

function resolveAppRepo() {
  const candidates = [
    process.env.APP_REPO_PATH,
    path.resolve(DOCS_ROOT, '..', 'grubano-kitchen-hub'),
    path.resolve(DOCS_ROOT, '..', 'grubano'),
  ].filter(Boolean)
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'app', 'api'))) return path.resolve(c)
  }
  throw new Error(
    `Could not find the main app repo. Tried:\n  ${candidates.join('\n  ')}\n` +
      `Set APP_REPO_PATH to the grubano-kitchen-hub checkout.`,
  )
}

const APP_REPO = resolveAppRepo()
const DOCS_MAP = JSON.parse(
  fs.readFileSync(path.join(DOCS_ROOT, 'public', 'docs-map.json'), 'utf8'),
)

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5'
const API_KEY = process.env.ANTHROPIC_API_KEY

// ── CLI ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const ARG_ALL = argv.includes('--all')
const ARG_FORCE = argv.includes('--force')
const ARG_DRY = argv.includes('--dry-run')
const topicArg = argv.find((a) => !a.startsWith('--'))

if (!ARG_ALL && !topicArg) {
  console.error(
    'Usage: node scripts/generate-feature-page.js <topic-key> [--force] [--dry-run]\n' +
      '       node scripts/generate-feature-page.js --all [--force] [--dry-run]',
  )
  process.exit(1)
}
if (!ARG_DRY && !API_KEY) {
  console.error(
    '[generator] ANTHROPIC_API_KEY is required (use --dry-run to preview without an API call).',
  )
  process.exit(1)
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sha(s) {
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 16)
}

function readSafe(rel) {
  const full = path.join(APP_REPO, rel)
  if (!fs.existsSync(full)) return null
  return fs.readFileSync(full, 'utf8')
}

/** Pluck the named model block from a Prisma schema file. */
function extractPrismaModel(schemaSrc, modelName) {
  if (!schemaSrc) return null
  const re = new RegExp(`model\\s+${modelName}\\s*\\{[\\s\\S]*?\\n\\}`, 'm')
  const m = schemaSrc.match(re)
  return m ? m[0] : null
}

/** Read the existing frontmatter sourceHash from a .mdx file. */
function readSourceHash(file) {
  if (!fs.existsSync(file)) return null
  const src = fs.readFileSync(file, 'utf8')
  const fm = src.match(/^---\s*\n([\s\S]*?)\n---/m)
  if (!fm) return null
  const h = fm[1].match(/^sourceHash:\s*['"]?([a-f0-9]+)['"]?\s*$/m)
  return h ? h[1] : null
}

function gatherFacts(cfg) {
  const facts = {
    routes: {},
    models: {},
  }
  for (const rel of cfg.sources.routes || []) {
    const src = readSafe(rel)
    if (src) facts.routes[rel] = src
  }
  if (cfg.sources.models?.length) {
    const schema = readSafe('prisma/schema.prisma')
    for (const m of cfg.sources.models) {
      const block = extractPrismaModel(schema, m)
      if (block) facts.models[m] = block
    }
  }
  return facts
}

function relatedDocLinks(relatedKeys, locale) {
  const out = []
  for (const key of relatedKeys || []) {
    const entry = DOCS_MAP.topics[key]
    if (!entry?.doc) continue
    out.push(`/${locale}${entry.doc}/`)
  }
  return out
}

// ── Prompt ──────────────────────────────────────────────────────────────────

const STRATEGIC_GUARDRAILS = `
GARDE-FOUS STRATÉGIQUES (impératifs) :
- Documenter UNIQUEMENT ce qui est démontrable dans les sources fournies (routes + modèles Prisma). N'invente JAMAIS de fonctionnalité, de champ, de statut, de route, de bouton UI, ni de page d'app.
- Économie côté utilisateur uniquement : commission 10 % et abonnement Pro 29 €/mois sont les SEULES données financières publiables. N'INVENTE PAS d'autres tarifs, ni de commission d'affiliation, ni de royalties de franchise, ni la marge interne que Grubano garde sur ces flux (= confidentiel).
- Fonctionnalité visiblement prévue dans le code mais non livrée → formuler au FUTUR avec « bientôt ».
- Ne nomme JAMAIS de marques (Gnocchi Bar, Pasta Fresca, etc.) — utiliser des descriptions génériques (« votre marque principale »).
- Pas de framing « dark kitchens » / « ghost kitchens » — Grubano = marketplace de restaurants LOCAUX qui cuisinent dans LEUR cuisine.
- Ton : bénéfices clairs, premium, sobre. Français. Tutoiement INTERDIT — utilisez le « vous » de politesse.
`

const TEMPLATE_INSTRUCTIONS = `
GABARIT (8 blocs, dans cet ordre exact) :

1. **Titre** : un H1 \`# <title>\`. Pas de fil d'ariane à inclure dans le MDX, Nextra le pose automatiquement.
2. **Accroche bénéfice** : exactement UNE phrase, au présent, orientée bénéfice utilisateur, juste sous le H1.
3. **Ce que ça fait** : un paragraphe court (2–4 phrases) qui décrit la fonctionnalité en termes simples, sans jargon.
4. **Comment l'utiliser** : étapes numérotées (\`<Steps>\` Nextra) OU tableau Markdown (Action / Où / Effet), selon ce qui est le plus clair pour les sources fournies. Reposer EXCLUSIVEMENT sur les routes/champs/statuts présents dans les sources.
5. **Bon à savoir / limites** : un ou deux \`<Callout>\` Nextra si pertinent. OMETTRE le bloc s'il n'y a rien à dire — ne meuble pas.
6. **Pour aller plus loin** : une liste de 2–4 liens internes pointant uniquement vers les URLs fournies dans \`RELATED_LINKS\`. OMETTRE si la liste est vide.
7. **Bloc CTA stratégique** (TOUJOURS PRÉSENT — c'est le cœur rentable, ne le supprime pas) :
   - Sous un H2 \`## Passer à l'action\`
   - Lien principal : « **Faites-le dans l'app →** » pointant vers \`APP_LINK\`.
   - Si \`SHOW_PRO_HINT === true\` : ajouter, en dessous, une phrase courte « Bientôt avec Grubano Pro : agrégation multi-plateformes — toutes vos commandes consolidées en un seul écran. » puis un lien « Découvrir Grubano Pro » vers \`/<locale>/guides/pro/\`.
   - Toujours, en dessous, en plus petit : « Pas encore sur Grubano ? [Démarrer en 15 minutes](\`QUICK_START_LINK\`). »
8. **Pied** : une dernière ligne en italique, courte : « *Page générée depuis le code de grubano-kitchen-hub.* ». L'horodatage « dernière mise à jour » et le lien « Modifier cette page » sont rendus automatiquement par le thème Nextra — ne les inclus pas.

FORMAT DE SORTIE :
- Réponds avec le MDX seul. Pas de frontmatter (je l'ajoute moi-même). Pas de \`\`\`mdx fence. Pas d'explication.
- Imports MDX autorisés et recommandés en tête : \`import { Steps, Callout } from 'nextra/components'\`.
- N'utilise pas de composants React custom hors \`Steps\` et \`Callout\`.
`

function buildPrompt(cfg, facts) {
  const appEntry = DOCS_MAP.topics[topicKeyForPrompt(cfg)]
  const APP_LINK =
    (appEntry && appEntry.app) || 'https://www.grubano.com'
  const QUICK_START_LINK = `/${cfg.locale}/guides/quick-start/`
  const SHOW_PRO_HINT = !!cfg.touchesMultiPlatformAggregation
  const RELATED_LINKS = relatedDocLinks(cfg.related, cfg.locale)

  const factsBlock = [
    '== SOURCES (routes) ==',
    ...Object.entries(facts.routes).map(
      ([p, src]) => `\n--- ${p} ---\n${src}\n`,
    ),
    '\n== SOURCES (modèles Prisma) ==',
    ...Object.entries(facts.models).map(
      ([m, src]) => `\n--- model ${m} ---\n${src}\n`,
    ),
  ].join('\n')

  return [
    `Vous êtes le rédacteur technique de la documentation Grubano. Rédigez la fiche pour "${cfg.title}" (topic \`${topicKeyForPrompt(cfg)}\`, locale \`${cfg.locale}\`).`,
    `\nINTENT (1 phrase, ce que l'utilisateur veut accomplir) : ${cfg.intent}`,
    STRATEGIC_GUARDRAILS,
    TEMPLATE_INSTRUCTIONS,
    `\nVARIABLES À UTILISER DANS LE BLOC CTA :`,
    `APP_LINK         = ${APP_LINK}`,
    `QUICK_START_LINK = ${QUICK_START_LINK}`,
    `SHOW_PRO_HINT    = ${SHOW_PRO_HINT}`,
    `RELATED_LINKS    = ${JSON.stringify(RELATED_LINKS)}`,
    `\n${factsBlock}`,
  ].join('\n')
}

function topicKeyForPrompt(cfg) {
  // The cfg object doesn't carry the key, so look it up.
  for (const [k, v] of Object.entries(FEATURE_PAGES)) if (v === cfg) return k
  return '?'
}

// ── Claude call ─────────────────────────────────────────────────────────────

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Claude API ${res.status}: ${text.slice(0, 400)}`)
  }
  const data = await res.json()
  const block = (data.content || []).find((b) => b.type === 'text')
  if (!block) throw new Error('Claude API returned no text block')
  return {
    text: block.text,
    usage: data.usage || {},
  }
}

// ── Write ───────────────────────────────────────────────────────────────────

function targetPathFor(cfg) {
  // /guides/stocks → content/<locale>/guides/stocks.mdx
  const rel = cfg.docPath.replace(/^\//, '') + '.mdx'
  return path.join(CONTENT_DIR, cfg.locale, rel)
}

function isEditorial(targetAbs) {
  const rel = path.relative(DOCS_ROOT, targetAbs).replace(/\\/g, '/')
  return EDITORIAL_PAGES.has(rel)
}

function frontmatter(cfg, sourceHash, description) {
  return [
    '---',
    `title: ${JSON.stringify(cfg.title)}`,
    `description: ${JSON.stringify(description)}`,
    'generated: true',
    `sourceHash: ${sourceHash}`,
    `generator: scripts/generate-feature-page.js`,
    `templateVersion: ${TEMPLATE_VERSION}`,
    '---',
  ].join('\n')
}

// ── Per-topic generation ────────────────────────────────────────────────────

async function generateOne(topicKey) {
  const cfg = FEATURE_PAGES[topicKey]
  if (!cfg) {
    console.error(`[generator] Unknown topic: ${topicKey}`)
    process.exitCode = 1
    return
  }
  const targetAbs = targetPathFor(cfg)
  const targetRel = path.relative(DOCS_ROOT, targetAbs).replace(/\\/g, '/')

  if (isEditorial(targetAbs)) {
    console.error(
      `[generator] REFUSED to write ${targetRel}: marked editorial in feature-pages.config.js.`,
    )
    process.exitCode = 1
    return
  }

  const facts = gatherFacts(cfg)
  if (!Object.keys(facts.routes).length && !Object.keys(facts.models).length) {
    console.error(
      `[generator] No sources found for ${topicKey} — check feature-pages.config sources paths.`,
    )
    process.exitCode = 1
    return
  }

  const sourceHash = sha(
    JSON.stringify({
      topic: topicKey,
      template: TEMPLATE_VERSION,
      intent: cfg.intent,
      facts,
    }),
  )

  if (!ARG_FORCE) {
    const existing = readSourceHash(targetAbs)
    if (existing === sourceHash) {
      console.log(`[generator] ${topicKey} → no source change since last run, skipping.`)
      return
    }
  }

  const prompt = buildPrompt(cfg, facts)

  if (ARG_DRY) {
    console.log(`[generator] DRY-RUN ${topicKey}`)
    console.log(`  target: ${targetRel}`)
    console.log(`  sourceHash: ${sourceHash}`)
    console.log(`  prompt bytes: ${prompt.length}`)
    console.log('--- prompt head ---')
    console.log(prompt.slice(0, 1500))
    console.log('...')
    return
  }

  console.log(`[generator] ${topicKey} → calling Claude (${MODEL})…`)
  const t0 = Date.now()
  const { text, usage } = await callClaude(prompt)
  const dt = ((Date.now() - t0) / 1000).toFixed(1)

  // Cost estimate based on public Sonnet 4.5 pricing — purely informative.
  const cost =
    ((usage.input_tokens || 0) / 1_000_000) * 3 +
    ((usage.output_tokens || 0) / 1_000_000) * 15

  const description = cfg.intent
  const body = text.trim() + '\n'
  fs.mkdirSync(path.dirname(targetAbs), { recursive: true })
  fs.writeFileSync(
    targetAbs,
    `${frontmatter(cfg, sourceHash, description)}\n\n${body}`,
    'utf8',
  )
  console.log(
    `[generator] wrote ${targetRel} (in:${usage.input_tokens || 0} out:${usage.output_tokens || 0} tok, ${dt}s, ~$${cost.toFixed(4)})`,
  )
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const topics = ARG_ALL ? Object.keys(FEATURE_PAGES) : [topicArg]
  console.log(
    `[generator] ${topics.length} topic(s) — model=${MODEL} dry=${ARG_DRY} force=${ARG_FORCE}`,
  )
  console.log(`[generator] editorial-protected files: ${EDITORIAL_PAGES.size}`)
  for (const t of topics) {
    try {
      // sequential — keeps logs readable and rate-limit-safe
      // eslint-disable-next-line no-await-in-loop
      await generateOne(t)
    } catch (err) {
      console.error(`[generator] FAILED ${t}: ${err.message}`)
      process.exitCode = 2
    }
  }
}

main().catch((err) => {
  console.error('[generator] fatal:', err)
  process.exit(1)
})
