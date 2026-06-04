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
//   v1 — original 8-block template, in-content CTA, footer marker.
//   v2 — premium Menu-style layout: <FlowDiagram> at top, richer prose,
//        inline contextual links, wrapper-handled CTA, no footer marker.
const TEMPLATE_VERSION = 2

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
GABARIT v2 — style aligné sur la page de référence « Menu & Scan IA » : aéré,
premium, calme, avec de l'air entre les blocs. Pas de surcharge de Callouts.
Étapes propres. Liens contextuels tissés dans la prose.

ORDRE des blocs :

1. **Titre H1** \`# <title>\`. (Nextra pose automatiquement le fil d'ariane.)

2. **Accroche bénéfice** : exactement UNE phrase, au présent, orientée
   bénéfice utilisateur, juste sous le H1. Doit donner envie de lire la
   suite, sans survendre.

3. **Schéma de flux** : appelle \`<FlowDiagram steps={FLOW_STEPS} />\`
   IMMÉDIATEMENT APRÈS l'accroche. Le composant est déjà disponible
   globalement (pas d'import à émettre). Recopie EXACTEMENT le tableau
   \`FLOW_STEPS\` fourni ci-dessous — n'invente pas d'étapes.

4. **Ce que ça fait** (H2 \`## Ce que ça fait\`) : 1 ou 2 paragraphes qui
   expliquent la fonctionnalité EN PROFONDEUR — le POURQUOI et le contexte
   métier (à qui ça sert, quel problème ça résout, quand l'utiliser), pas
   seulement le QUOI. Vivant, pas une fiche technique sèche. Tisse 1–2
   liens hypertextes contextuels en utilisant les entrées \`INLINE_LINKS\`
   si elles apparaissent naturellement dans la prose.

5. **Comment l'utiliser** (H2 \`## Comment l'utiliser\`) : étapes
   numérotées avec \`<Steps>\` Nextra (préféré, plus aéré) OU un tableau
   Markdown propre (Action / Où / Effet) si vraiment plus clair. Repose
   EXCLUSIVEMENT sur les routes/champs/statuts/unités du code fourni.
   Chaque étape est courte (1–3 phrases) et concrète. Tisse 1 lien
   contextuel \`INLINE_LINKS\` ici aussi si pertinent.

6. **Bon à savoir** (H2 \`## Bon à savoir\`) : UN seul \`<Callout>\` (type
   "info" ou "warning") avec l'information non évidente la plus utile
   — limite, comportement par défaut, piège classique. OMETTRE
   complètement la section si rien d'utile à dire ; ne meuble pas.

7. **Pour aller plus loin** (H2 \`## Pour aller plus loin\`) : 2 à 4
   liens internes pointant UNIQUEMENT vers les URLs fournies dans
   \`RELATED_LINKS\`. Une phrase descriptive par lien, pas juste l'URL nue.
   OMETTRE si \`RELATED_LINKS\` est vide.

NE PAS ÉMETTRE :
- AUCUN bloc « Passer à l'action » / « Faites-le dans l'app » dans le
  corps : un encart CTA premium identique est ajouté automatiquement
  au pied de chaque page de guide par le thème. NE LE DUPLIQUE PAS.
- AUCUN pied « Page générée depuis le code » ni horodatage : le thème
  Nextra rend déjà « Modifier cette page » et « last updated ».
- Aucun bouton CTA dans le contenu : la carte d'action est rendue par
  le wrapper.

LIENS HYPERTEXTE EN LIGNE :
- Quand un terme de \`INLINE_LINKS\` apparaît dans le texte des blocs 4–6,
  enveloppe-le d'un lien Markdown vers la cible (max 1–2 par bloc, jamais
  deux fois la même cible dans le même paragraphe — pas de spam).
- N'ajoute pas de liens vers des URLs que tu inventes. Strictement
  \`INLINE_LINKS\` + \`RELATED_LINKS\`.

FORMAT DE SORTIE :
- MDX seul. Pas de frontmatter (je l'ajoute). Pas de \`\`\`mdx fence.
  Pas d'explication.
- Imports MDX en tête : \`import { Steps, Callout } from 'nextra/components'\`.
  \`<FlowDiagram>\` est global, pas besoin de l'importer.
- N'utilise pas d'autres composants React.
`

function buildPrompt(cfg, facts) {
  const RELATED_LINKS = relatedDocLinks(cfg.related, cfg.locale)
  const FLOW_STEPS = cfg.flow || []
  const INLINE_LINKS = cfg.inlineLinks || {}

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
    `\nVARIABLES À UTILISER :`,
    `FLOW_STEPS     = ${JSON.stringify(FLOW_STEPS)}`,
    `INLINE_LINKS   = ${JSON.stringify(INLINE_LINKS)}`,
    `RELATED_LINKS  = ${JSON.stringify(RELATED_LINKS)}`,
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
