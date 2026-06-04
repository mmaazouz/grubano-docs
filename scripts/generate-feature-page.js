#!/usr/bin/env node
/**
 * generate-feature-page.js — Grubano harmonized doc generator
 *
 * Reads three sources, produces a coherent summary of the doc catalog,
 * and (re)generates feature pages on a sensitivity-hash basis:
 *
 *   CODE       — checkout of grubano-kitchen-hub (routes + Prisma models)
 *   INBOX      — Notion shared inbox page (what each agent has shipped)
 *   RÈGLEMENT  — Notion docs-rulebook page (canonical facts, guardrails,
 *                forbidden phrasings)
 *   CERVEAU    — Notion brain page (cross-agent decisions)
 *
 * Notion pages are fetched via the Notion API with NOTION_TOKEN, cached
 * to .notion-cache/ so subsequent runs can work offline / cheap.
 *
 * Each generated page embeds `generated: true` + a `sourceHash` in its
 * frontmatter. On re-runs, a page whose sourceHash already matches the
 * current input bundle (code facts + Notion slices) is skipped — no API
 * call. That is the "sensitivity update".
 *
 * The generator never overwrites editorial pages (see feature-pages.config.js
 * — the EDITORIAL_PAGES set is derived from the catalog).
 *
 * CLI:
 *   node scripts/generate-feature-page.js --summary
 *       Print the harmonized topic catalog grouped by audience + the source
 *       inventory (Notion cache freshness, code repo path). Cheap, no LLM.
 *
 *   node scripts/generate-feature-page.js <topic-key>
 *       (Re)generate the matching page. Skipped if sourceHash unchanged.
 *
 *   node scripts/generate-feature-page.js --all
 *       Iterate every topic whose status === 'generated'.
 *
 *   --force            Ignore sourceHash cache (regen anyway).
 *   --dry-run          Print plan + prompt head, no Claude call.
 *   --refresh-notion   Re-fetch Notion pages into .notion-cache/ before run.
 *
 * Env:
 *   APP_REPO_PATH       Path to a kitchen-hub checkout
 *                       (defaults: ../grubano-kitchen-hub, then ../grubano)
 *   ANTHROPIC_API_KEY   Required for generation; ignored for --summary
 *   ANTHROPIC_MODEL     Default claude-sonnet-4-5
 *   NOTION_TOKEN        Required for --refresh-notion; reads from
 *                       ../grubano/.env.local as a fallback
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const https = require('https')

const { AUDIENCES, EDITORIAL_PAGES, FEATURE_PAGES } = require('./feature-pages.config.js')

// Bumping this invalidates every sourceHash → forces regen on next run.
//   v1 — original 8-block template, in-content CTA, footer marker.
//   v2 — premium Menu-style layout: <FlowDiagram> at top, richer prose,
//        inline contextual links, wrapper-handled CTA, no footer marker.
//   v3 — canonical Pro definition + forbidden phrasings locked.
//   v4 — Notion-sourced strategic context fed into the prompt (the
//        harmonized 3-sources flow): règlement + cerveau slices included.
const TEMPLATE_VERSION = 4

// ── Paths & Notion ──────────────────────────────────────────────────────────

const DOCS_ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(DOCS_ROOT, 'content')
const NOTION_CACHE_DIR = path.join(DOCS_ROOT, '.notion-cache')

const NOTION_PAGES = {
  inbox: '36efd2c9-8146-8195-a65a-d146cfed0642',
  reglement: '374fd2c9-8146-810a-99ea-dd83c1e827da',
  cerveau: '36dfd2c9-8146-81ae-bfab-e5e09076ea8e',
}

// Locate kitchen-hub
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

// NOTION_TOKEN fallback to the kitchen-hub .env.local for local dev runs.
function readNotionToken() {
  if (process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN
  const envFile = path.join(APP_REPO, '.env.local')
  if (!fs.existsSync(envFile)) return null
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^NOTION_TOKEN=(.+)$/)
    if (m) return m[1].trim().replace(/^["']|["']$/g, '')
  }
  return null
}
const NOTION_TOKEN = readNotionToken()

// ── CLI ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const ARG_SUMMARY = argv.includes('--summary')
const ARG_ALL = argv.includes('--all')
const ARG_FORCE = argv.includes('--force')
const ARG_DRY = argv.includes('--dry-run')
const ARG_REFRESH = argv.includes('--refresh-notion')
const topicArg = argv.find((a) => !a.startsWith('--'))

// ── Notion fetcher (minimal, paginated, one level of children) ──────────────

function notionGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.notion.com',
        path: `/v1${pathname}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8')
          if (res.statusCode >= 400) {
            return reject(new Error(`Notion ${res.statusCode}: ${body.slice(0, 200)}`))
          }
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            reject(e)
          }
        })
      },
    )
    req.on('error', reject)
    req.end()
  })
}

function richTextToPlain(rt) {
  if (!Array.isArray(rt)) return ''
  return rt.map((t) => t.plain_text || '').join('')
}

function blockToText(block) {
  const type = block.type
  const data = block[type] || {}
  const rt = data.rich_text || data.title
  const text = richTextToPlain(rt)
  switch (type) {
    case 'heading_1':
      return `\n# ${text}`
    case 'heading_2':
      return `\n## ${text}`
    case 'heading_3':
      return `\n### ${text}`
    case 'bulleted_list_item':
      return `- ${text}`
    case 'numbered_list_item':
      return `1. ${text}`
    case 'quote':
      return `> ${text}`
    case 'callout':
      return `> [!] ${text}`
    case 'code':
      return '```\n' + text + '\n```'
    case 'divider':
      return '---'
    case 'paragraph':
    default:
      return text
  }
}

async function fetchChildrenPaginated(blockId) {
  const all = []
  let cursor = null
  do {
    const qs = cursor ? `?start_cursor=${cursor}&page_size=100` : '?page_size=100'
    const res = await notionGet(`/blocks/${blockId}/children${qs}`)
    all.push(...(res.results || []))
    cursor = res.has_more ? res.next_cursor : null
  } while (cursor)
  return all
}

async function fetchNotionPageAsText(pageId, depth = 2) {
  const blocks = await fetchChildrenPaginated(pageId)
  const lines = []
  for (const b of blocks) {
    const t = blockToText(b)
    if (t && t.trim()) lines.push(t)
    if (b.has_children && depth > 0) {
      try {
        const kids = await fetchChildrenPaginated(b.id)
        for (const k of kids) {
          const kt = blockToText(k)
          if (kt && kt.trim()) lines.push('  ' + kt.trim())
        }
      } catch {
        /* swallow nested-fetch errors — page is still usable */
      }
    }
  }
  return lines.join('\n')
}

async function loadNotionSources({ refresh }) {
  fs.mkdirSync(NOTION_CACHE_DIR, { recursive: true })
  const out = {}
  for (const [name, id] of Object.entries(NOTION_PAGES)) {
    const cacheFile = path.join(NOTION_CACHE_DIR, `${name}.txt`)
    if (refresh && NOTION_TOKEN) {
      try {
        console.log(`[generator] fetching Notion ${name} (${id.slice(0, 8)}…)`)
        const text = await fetchNotionPageAsText(id)
        fs.writeFileSync(cacheFile, text, 'utf8')
        out[name] = text
        continue
      } catch (e) {
        console.warn(`[generator] Notion fetch ${name} failed: ${e.message}`)
      }
    }
    if (fs.existsSync(cacheFile)) {
      out[name] = fs.readFileSync(cacheFile, 'utf8')
    } else {
      out[name] = ''
    }
  }
  return out
}

// ── Code-side fact gathering (unchanged) ────────────────────────────────────

function sha(s) {
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 16)
}

function readSafe(rel) {
  const full = path.join(APP_REPO, rel)
  if (!fs.existsSync(full)) return null
  return fs.readFileSync(full, 'utf8')
}

function extractPrismaModel(schemaSrc, modelName) {
  if (!schemaSrc) return null
  const re = new RegExp(`model\\s+${modelName}\\s*\\{[\\s\\S]*?\\n\\}`, 'm')
  const m = schemaSrc.match(re)
  return m ? m[0] : null
}

function readSourceHash(file) {
  if (!fs.existsSync(file)) return null
  const src = fs.readFileSync(file, 'utf8')
  const fm = src.match(/^---\s*\n([\s\S]*?)\n---/m)
  if (!fm) return null
  const h = fm[1].match(/^sourceHash:\s*['"]?([a-f0-9]+)['"]?\s*$/m)
  return h ? h[1] : null
}

function gatherFacts(cfg) {
  const facts = { routes: {}, models: {} }
  for (const rel of cfg.sources?.routes || []) {
    const src = readSafe(rel)
    if (src) facts.routes[rel] = src
  }
  if (cfg.sources?.models?.length) {
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

// ── Notion slicing (per-topic) ──────────────────────────────────────────────

function topicSlugTokens(topicKey, cfg) {
  // Words to look for in Notion text when picking topic-relevant slices.
  const tokens = new Set([topicKey.toLowerCase()])
  for (const part of topicKey.split('.')) tokens.add(part.toLowerCase())
  if (cfg.title) tokens.add(cfg.title.toLowerCase())
  const slug = cfg.docPath?.split('/').pop()
  if (slug) tokens.add(slug.toLowerCase())
  return [...tokens].filter(Boolean)
}

/** Extract paragraph-ish lines from `text` that mention any of the tokens. */
function sliceTextByTokens(text, tokens, limit = 30) {
  if (!text) return ''
  const lines = text.split('\n')
  const kept = []
  for (const line of lines) {
    const low = line.toLowerCase()
    if (tokens.some((t) => low.includes(t))) {
      kept.push(line.trim())
      if (kept.length >= limit) break
    }
  }
  return kept.join('\n')
}

// Headings in the règlement that must ALWAYS travel with every prompt — the
// "Règle d'or" (canonical facts + guardrails + forbidden phrasings). Match
// is case-insensitive substring on the heading line.
const REGLEMENT_GOLDEN_RULE_KEYS = [
  'règle d',          // « Règle d'or »
  'garde-fou',        // « Garde-fous » (singular/plural)
  'formulation',      // « Formulations interdites »
  'faits canon',      // « Faits canoniques »
  'économie',         // « Économie côté utilisateur »
  'pro',              // « Pro » / « Grubano Pro »
  'principe',         // « Principe »
  'style',            // « Style »
]

/**
 * Split a Notion-exported règlement into H2/H3 sections and keep:
 *   - every section whose heading matches a GOLDEN_RULE key (the always-keep
 *     "Règle d'or" — guardrails, canonical facts, forbidden phrasings),
 *   - any other section that mentions a topic-relevant token,
 *   - the lede paragraph before the first heading (it sets the frame).
 * Caps the result at ~6 KB so big règlements don't double the prompt cost.
 */
function sliceReglementByTopic(text, tokens) {
  if (!text) return ''
  const tokenSet = tokens.map((t) => t.toLowerCase())
  // Split BEFORE any markdown heading (# / ## / ### …) so each chunk starts
  // with a heading line — easy to test the heading text in isolation.
  const parts = text.split(/\n(?=#{1,3}\s)/)
  const kept = []
  for (const part of parts) {
    const firstLine = (part.split('\n')[0] || '').toLowerCase()
    const low = part.toLowerCase()
    const isHeading = /^#{1,3}\s/.test(firstLine.trim())
    const isGolden = isHeading && REGLEMENT_GOLDEN_RULE_KEYS.some((k) => firstLine.includes(k))
    const matchesTopic = tokenSet.some((t) => t && low.includes(t))
    if (!isHeading || isGolden || matchesTopic) kept.push(part)
  }
  // Hard cap to keep prompt cost bounded even if the rulebook grows.
  return kept.join('\n').slice(0, 6000)
}

function buildContextSlices(topicKey, cfg, notion) {
  const tokens = topicSlugTokens(topicKey, cfg)
  return {
    // Per-topic slice of the règlement, with the "Règle d'or" sections
    // (canonical facts + guardrails + forbidden phrasings) ALWAYS retained
    // even when their heading doesn't mention the topic.
    reglement: sliceReglementByTopic(notion.reglement || '', tokens),
    // Cerveau & inbox: line-level token match, tighter line caps post-optim.
    cerveau: sliceTextByTokens(notion.cerveau || '', tokens, 30),
    inbox: sliceTextByTokens(notion.inbox || '', tokens, 20),
  }
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

DÉFINITION CANONIQUE de Grubano Pro (la SEULE description acceptable de Pro, à utiliser au futur / "bientôt") :
> Grubano Pro permettra de recevoir les commandes de toutes vos autres
> plateformes (Uber Eats, Deliveroo, Just Eat…) directement sur votre
> tableau de bord Grubano : un seul écran pour toutes vos commandes,
> avec des analyses et rapports unifiés. La commission ne change pas
> (10 % en Standard comme en Pro). Pro est un forfait mensuel de
> 29 €/mois, sans engagement, qui s'ajoute à la commission sans la
> remplacer.

FORMULATIONS INTERDITES pour décrire Pro (n'écris JAMAIS ces phrases, ni leurs synonymes proches) :
- « accélérer la visibilité » / « visibilité accrue » / « boost de visibilité »
- « mise en avant dans la découverte » / « apparaître en priorité » côté Pro
- « débloquer l'affiliation créateurs » / « accès à l'affiliation » présenté comme une feature Pro
- « statistiques avancées » présentées comme une feature Pro distincte (cohortes, rétention, panier moyen, comparatifs marques, heures de pointe — n'invente AUCUNE de ces features Pro)
- « support prioritaire » comme feature Pro

Si la fonctionnalité que tu décris ne touche PAS à l'agrégation multi-plateformes, ne mentionne Pro QUE pour rappeler la commission identique 10 % ; ne décris pas le contenu de Pro hors du périmètre canonique ci-dessus.
`

const TEMPLATE_INSTRUCTIONS = `
GABARIT v4 — style aligné sur la page de référence « Menu & Scan IA » : aéré,
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
- Les liens sont des liens prose ordinaires : pas de **gras** autour,
  pas d'emoji ➡️ devant, pas de flèche → décorative.

FORMAT DE SORTIE :
- MDX seul. Pas de frontmatter (je l'ajoute). Pas de \`\`\`mdx fence.
  Pas d'explication.
- Imports MDX en tête : \`import { Steps, Callout } from 'nextra/components'\`.
  \`<FlowDiagram>\` est global, pas besoin de l'importer.
- N'utilise pas d'autres composants React.
`

function topicKeyFor(cfg) {
  for (const [k, v] of Object.entries(FEATURE_PAGES)) if (v === cfg) return k
  return '?'
}

function buildPrompt(cfg, facts, slices) {
  const RELATED_LINKS = relatedDocLinks(cfg.related, cfg.locale)
  const FLOW_STEPS = cfg.flow || []
  const INLINE_LINKS = cfg.inlineLinks || {}

  const factsBlock = [
    '== SOURCES CODE (routes) ==',
    ...Object.entries(facts.routes).map(
      ([p, src]) => `\n--- ${p} ---\n${src}\n`,
    ),
    '\n== SOURCES CODE (modèles Prisma) ==',
    ...Object.entries(facts.models).map(
      ([m, src]) => `\n--- model ${m} ---\n${src}\n`,
    ),
  ].join('\n')

  const contextBlock = [
    '== CONTEXTE STRATÉGIQUE (depuis Notion — règlement + cerveau + inbox) ==',
    '\nCes extraits priment sur tes intuitions. Si une affirmation contredit ces extraits, NE l\'ÉCRIS PAS.',
    '\n--- Règlement (canonique) ---\n' + (slices.reglement || '(vide — fournir le règlement Notion pour ce topic)'),
    '\n--- Cerveau (décisions liées au topic) ---\n' + (slices.cerveau || '(rien de pertinent dans le cerveau pour ce topic)'),
    '\n--- Inbox (faits récents liés au topic) ---\n' + (slices.inbox || '(rien de pertinent dans l\'inbox pour ce topic)'),
  ].join('\n')

  return [
    `Vous êtes le rédacteur technique de la documentation Grubano. Rédigez la fiche pour "${cfg.title}" (topic \`${topicKeyFor(cfg)}\`, locale \`${cfg.locale}\`).`,
    `\nINTENT (1 phrase, ce que l'utilisateur veut accomplir) : ${cfg.intent}`,
    STRATEGIC_GUARDRAILS,
    TEMPLATE_INSTRUCTIONS,
    `\nVARIABLES À UTILISER :`,
    `FLOW_STEPS     = ${JSON.stringify(FLOW_STEPS)}`,
    `INLINE_LINKS   = ${JSON.stringify(INLINE_LINKS)}`,
    `RELATED_LINKS  = ${JSON.stringify(RELATED_LINKS)}`,
    `\n${contextBlock}`,
    `\n${factsBlock}`,
  ].join('\n')
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
  return { text: block.text, usage: data.usage || {} }
}

// ── Output paths & frontmatter ──────────────────────────────────────────────

function targetPathFor(cfg) {
  // Root path '/' resolves to <locale>/index.mdx; anything else strips the
  // leading slash and appends .mdx.
  const slug = cfg.docPath === '/' ? '/index' : cfg.docPath
  const rel = slug.replace(/^\//, '') + '.mdx'
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

// ── Summary ─────────────────────────────────────────────────────────────────

function statSize(p) {
  try { return fs.statSync(p).size } catch { return 0 }
}

function notionCacheInventory() {
  const out = {}
  for (const [name, id] of Object.entries(NOTION_PAGES)) {
    const f = path.join(NOTION_CACHE_DIR, `${name}.txt`)
    out[name] = {
      id,
      cached: fs.existsSync(f),
      bytes: statSize(f),
      mtime: fs.existsSync(f) ? fs.statSync(f).mtime.toISOString().slice(0, 16).replace('T', ' ') : null,
    }
  }
  return out
}

function printSummary() {
  const lines = []
  lines.push('GRUBANO DOCS — SOMMAIRE GÉNÉRÉ')
  lines.push(`templateVersion=${TEMPLATE_VERSION}  app-repo=${path.relative(path.resolve(DOCS_ROOT, '..'), APP_REPO)}`)
  lines.push('')

  const counts = { editorial: 0, generated: 0, planned: 0 }

  for (const audience of AUDIENCES) {
    const entries = Object.entries(FEATURE_PAGES).filter(([, v]) => v.audience === audience)
    if (!entries.length) continue
    lines.push(audience)
    for (const [key, cfg] of entries) {
      counts[cfg.status] = (counts[cfg.status] || 0) + 1
      const tag = `[${cfg.status.padEnd(9)}]`
      const url = `/${cfg.locale}${cfg.docPath}`
      const exists = fs.existsSync(targetPathFor(cfg))
      const liveMark = exists ? '●' : '○'
      lines.push(`  ${liveMark} ${key.padEnd(28)} ${tag}  ${url.padEnd(28)}  ${cfg.title}`)
    }
    lines.push('')
  }

  lines.push('Sources lues :')
  const repoRel = path.relative(path.resolve(DOCS_ROOT, '..'), APP_REPO)
  lines.push(`  - CODE       : ${repoRel} (live checkout)`)
  for (const [name, info] of Object.entries(notionCacheInventory())) {
    if (info.cached) {
      lines.push(`  - ${name.toUpperCase().padEnd(9)}: ${info.id.slice(0, 8)}… cached ${info.bytes}B (${info.mtime} UTC)`)
    } else {
      lines.push(`  - ${name.toUpperCase().padEnd(9)}: ${info.id.slice(0, 8)}… NO CACHE — run --refresh-notion (NOTION_TOKEN required)`)
    }
  }
  lines.push('')

  lines.push('Status :')
  lines.push(`  Éditorial   : ${counts.editorial || 0}   (jamais réécrits par le générateur)`)
  lines.push(`  Généré      : ${counts.generated || 0}   (fiches owned par le générateur)`)
  lines.push(`  Planifié    : ${counts.planned || 0}   (déclarés, à régénérer après revue)`)
  lines.push('')
  lines.push(`Légende : ● fichier MDX existant   ○ pas encore écrit`)

  return lines.join('\n')
}

// ── Per-topic generation ────────────────────────────────────────────────────

async function generateOne(topicKey, notion) {
  const cfg = FEATURE_PAGES[topicKey]
  if (!cfg) {
    console.error(`[generator] Unknown topic: ${topicKey}`)
    process.exitCode = 1
    return
  }
  if (cfg.status === 'editorial') {
    console.error(`[generator] REFUSED ${topicKey}: editorial topic.`)
    process.exitCode = 1
    return
  }
  if (cfg.status === 'planned') {
    console.error(
      `[generator] REFUSED ${topicKey}: status='planned' — flip to 'generated' in feature-pages.config.js after manual review.`,
    )
    process.exitCode = 1
    return
  }
  const targetAbs = targetPathFor(cfg)
  const targetRel = path.relative(DOCS_ROOT, targetAbs).replace(/\\/g, '/')

  if (isEditorial(targetAbs)) {
    console.error(`[generator] REFUSED ${targetRel}: editorial path.`)
    process.exitCode = 1
    return
  }

  const facts = gatherFacts(cfg)
  if (!Object.keys(facts.routes).length && !Object.keys(facts.models).length) {
    console.error(`[generator] No code sources found for ${topicKey} — check feature-pages.config.js paths.`)
    process.exitCode = 1
    return
  }
  const slices = buildContextSlices(topicKey, cfg, notion)

  const sourceHash = sha(
    JSON.stringify({
      topic: topicKey,
      template: TEMPLATE_VERSION,
      intent: cfg.intent,
      facts,
      slices, // règlement + cerveau + inbox slices participate in the hash
    }),
  )

  if (!ARG_FORCE) {
    const existing = readSourceHash(targetAbs)
    if (existing === sourceHash) {
      console.log(`[generator] ${topicKey} → no input change since last run, skipping.`)
      return
    }
  }

  const prompt = buildPrompt(cfg, facts, slices)

  if (ARG_DRY) {
    console.log(`[generator] DRY-RUN ${topicKey}`)
    console.log(`  target: ${targetRel}`)
    console.log(`  sourceHash: ${sourceHash}`)
    console.log(`  prompt bytes: ${prompt.length}`)
    console.log('--- prompt head ---')
    console.log(prompt.slice(0, 1800))
    console.log('...')
    return
  }

  if (!API_KEY) {
    console.error('[generator] ANTHROPIC_API_KEY is required (use --dry-run to preview).')
    process.exitCode = 1
    return
  }

  console.log(`[generator] ${topicKey} → calling Claude (${MODEL})…`)
  const t0 = Date.now()
  const { text, usage } = await callClaude(prompt)
  const dt = ((Date.now() - t0) / 1000).toFixed(1)
  const cost =
    ((usage.input_tokens || 0) / 1_000_000) * 3 +
    ((usage.output_tokens || 0) / 1_000_000) * 15

  const body = text.trim() + '\n'
  fs.mkdirSync(path.dirname(targetAbs), { recursive: true })
  fs.writeFileSync(
    targetAbs,
    `${frontmatter(cfg, sourceHash, cfg.intent)}\n\n${body}`,
    'utf8',
  )
  console.log(
    `[generator] wrote ${targetRel} (in:${usage.input_tokens || 0} out:${usage.output_tokens || 0} tok, ${dt}s, ~$${cost.toFixed(4)})`,
  )
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (ARG_SUMMARY) {
    // For the summary view, refresh-notion is optional; otherwise just print
    // what's on disk so anyone can see the catalog quickly.
    if (ARG_REFRESH) {
      if (!NOTION_TOKEN) {
        console.warn('[generator] --refresh-notion requested but NOTION_TOKEN is missing.')
      } else {
        await loadNotionSources({ refresh: true })
      }
    }
    console.log(printSummary())
    return
  }

  // Generation path
  if (!ARG_ALL && !topicArg) {
    console.error(
      'Usage:\n' +
        '  node scripts/generate-feature-page.js --summary [--refresh-notion]\n' +
        '  node scripts/generate-feature-page.js <topic-key> [--force] [--dry-run] [--refresh-notion]\n' +
        '  node scripts/generate-feature-page.js --all       [--force] [--dry-run] [--refresh-notion]',
    )
    process.exit(1)
  }

  const notion = await loadNotionSources({ refresh: ARG_REFRESH })

  const topics = ARG_ALL
    ? Object.entries(FEATURE_PAGES)
        .filter(([, v]) => v.status === 'generated')
        .map(([k]) => k)
    : [topicArg]

  console.log(
    `[generator] ${topics.length} topic(s) — model=${MODEL} dry=${ARG_DRY} force=${ARG_FORCE} refreshNotion=${ARG_REFRESH}`,
  )
  console.log(`[generator] editorial-protected files: ${EDITORIAL_PAGES.size}`)
  for (const t of topics) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await generateOne(t, notion)
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
