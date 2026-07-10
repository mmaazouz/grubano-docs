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
const { parseStatusEnum, buildStateDiagram } = require('./gen-state-diagram.js')

// Bumping this invalidates every sourceHash → forces regen on next run.
//   v1 — original 8-block template, in-content CTA, footer marker.
//   v2 — premium Menu-style layout: <FlowDiagram> at top, richer prose,
//        inline contextual links, wrapper-handled CTA, no footer marker.
//   v3 — canonical Pro definition + forbidden phrasings locked.
//   v4 — Notion-sourced strategic context fed into the prompt (the
//        harmonized 3-sources flow): règlement + cerveau slices included.
//   v5 — pedagogical template (débutant→expert layered): visual-first
//        (FlowDiagram / JourneyStrip / RelatedActors / MiniMap / Mermaid
//        state-diagram), "L'essentiel" beginner block, conditional
//        Exemple/Bonnes pratiques/Erreurs/Astuces/FAQ/Dépannage blocks,
//        knowledge-graph "Pour aller plus loin", 3-role partner distinction.
const TEMPLATE_VERSION = 5

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

⛔ ZÉRO TAUX INTERNE PUBLIÉ — TRÈS IMPORTANT :
Le code te montre peut-être des constantes ou des valeurs par défaut pour la commission d'affiliation, le taux de redevance de franchise, les royalties, ou tout autre prélèvement interne. **Tu ne dois JAMAIS publier ces chiffres**, même s'ils apparaissent littéralement dans une ligne comme \`FRANCHISE_DEFAULT_FEE = 0.06\` ou \`AFFILIATE_RATE = 0.20\`. Ces valeurs sont **confidentielles** (Mohammed peut les ajuster).
Remplace toute valeur interne par l'une des formulations suivantes :
- « dans les limites fixées par Grubano »
- « défini avec vous au moment de l'ouverture »
- « les conditions financières sont fixées entre les acteurs concernés »
Les SEULS chiffres financiers publiables sont la commission Grubano de **10 %** et l'abonnement Pro de **29 €/mois**. Tout autre pourcentage, tout autre forfait, toute autre commission = ne PAS écrire.

TROIS RÔLES PARTENAIRES DISTINCTS (ne jamais les confondre) :
- **Créateur** = chef / cuisinier qui publie des recettes et concepts de plats. Rémunéré sur l'usage de ses recettes. NE PAS le décrire comme un influenceur ni un affilié.
- **Affilié** = partenaire qui recommande Grubano via un lien/code de parrainage et touche sur les commandes apportées. NE PAS le décrire comme un créateur de recettes.
- **Influenceur** = un PALIER de l'affilié à audience vérifiée (pas un rôle séparé) : mêmes mécaniques d'affiliation, statut vérifié en plus. NE PAS l'ériger en 4ᵉ métier ni le confondre avec le créateur.
Quand une page parle de l'un, ne lui prête pas les fonctions d'un autre. En cas de doute, reste générique et renvoie vers la fiche du bon public via « Voir aussi ».

PUBLICS RÉCENTS (livreur, fournisseur, franchisé, affilié, influenceur) : décris leur espace UNIQUEMENT d'après les routes/modèles fournis. Beaucoup de briques argent (versements, gains) sont encore gatées OFF → formule au futur « bientôt » et n'annonce jamais un paiement effectif tant que la source ne le démontre pas.
`

const TEMPLATE_INSTRUCTIONS = `
GABARIT v5 — PAGE D'APPRENTISSAGE, pas fiche technique. Objectif : ÉDUQUER.
Une page = un parcours du simple au détaillé : le débutant trouve l'essentiel
en haut, l'expert descend vers les détails. La page se lit EN COUCHES —
personne n'est perdu, personne ne s'ennuie. Ton chaleureux, clair,
pédagogique ; on parle au lecteur (« vous ») ; on explique le POURQUOI ;
zéro jargon inutile. Aéré, premium, calme, de l'air entre les blocs.

── BLOCS OBLIGATOIRES (dans cet ordre) ─────────────────────────────────────

1. **Titre H1** \`# <title>\` + **accroche bénéfice** juste dessous : UNE phrase
   au présent, orientée résultat, qui donne envie sans survendre.

2. **Aperçu visuel** — un schéma qui explique en un coup d'œil, IMMÉDIATEMENT
   après l'accroche (⚡ il REMPLACE un gros paragraphe). Choisis le visuel le
   plus adapté au sujet, parmi (détails props plus bas) :
   • \`<FlowDiagram steps={FLOW_STEPS} />\` ou \`<JourneyStrip …/>\` → une
     SÉQUENCE d'étapes. Si \`FLOW_STEPS\` est fourni, recopie-le EXACTEMENT.
   • un bloc \`\`\`mermaid → un CYCLE DE VIE. Si \`STATE_DIAGRAM\` est fourni
     ci-dessous (non vide), colle-le TEL QUEL dans un bloc mermaid. N'invente
     jamais d'états ni de transitions.
   • \`<RelatedActors …/>\` ou \`<MiniMap …/>\` → une RELATION entre acteurs
     (client, restaurant, livreur, créateur, affilié, influenceur,
     fournisseur, franchisé). N'emploie QUE des rôles réels de la plateforme.
   Exactement UN visuel principal ici. Ne fabrique aucune donnée : appuie-toi
   sur \`FLOW_STEPS\` / \`STATE_DIAGRAM\` / les rôles réels / le code fourni.

3. **L'essentiel** (H2 \`## L'essentiel\`) — niveau DÉBUTANT : 2 à 3 phrases
   simples : à quoi ça sert, pour qui, ce que ça change concrètement. Pas de
   détail technique ici.

4. **Comment ça marche** (H2 \`## Comment ça marche\`) — le PRINCIPE + le
   contexte métier : le POURQUOI (quel problème c'est résolu, quand l'utiliser),
   pas seulement le quoi. 1–2 paragraphes vivants. Tisse 1–2 liens
   \`INLINE_LINKS\` s'ils tombent naturellement.

5. **Étape par étape** (H2 \`## Étape par étape\`) — le guide pratique, orienté
   action : \`<Steps>\` Nextra (préféré) OU un tableau Markdown (Action / Où /
   Effet). Repose EXCLUSIVEMENT sur les routes/champs/statuts/unités du code.
   Chaque étape courte (1–3 phrases), concrète.

6. **Pour aller plus loin** (H2 \`## Pour aller plus loin\`) — le knowledge
   graph : 2 à 4 liens internes pris UNIQUEMENT dans \`RELATED_LINKS\`, chacun
   avec une phrase descriptive. Quand c'est pertinent, catégorise en une ligne :
   « À lire avant », « Étape suivante », « Voir aussi » (le pendant du sujet
   chez un AUTRE public). OMETTRE le bloc si \`RELATED_LINKS\` est vide.

── BLOCS CONDITIONNELS (n'inclure QUE si tu as de la vraie matière ; sinon
   OMETTRE — ne meuble jamais) ─────────────────────────────────────────────

- **Exemple concret** (H2) : un mini-cas réaliste Grubano (générique, sans
  nom de marque). Idéal pour le niveau intermédiaire.
- **Bonnes pratiques** (H2) : 2–4 recommandations concrètes (intermédiaire).
- **Erreurs fréquentes** (H2) : pièges classiques à éviter (avancé). Un
  \`<Callout type="warning">\` va bien ici.
- **Astuces & conseils** (H2) : gains de temps. Si une fonction IA existe
  dans le code du sujet, ajoute 1 conseil pour bien s'en servir.
- **Questions fréquentes** (H2) : 2 à 4 VRAIES questions via
  \`<Faq items={[…]} />\`. Réponses courtes, uniquement d'après les sources.
- **Dépannage** (H2) : seulement si la fonction a des ratés courants
  démontrables.

── COMPOSANTS DISPONIBLES (globaux — AUCUN import à émettre pour eux) ────────
Émets-les avec des props VALIDES ; ne mets QUE des données réelles.

  <FlowDiagram steps={FLOW_STEPS} />
  <JourneyStrip title="…" steps={[{ icon:"add", title:"…", desc:"…" }]} />
      icon = nom d'icône Material Symbols (ex. add, menu_book, payments, check).
  <RelatedActors title="…" nodes={[{ icon:"person", label:"Client",
      desc:"…", variant:"zest"|"ink", to:"étiquette de la flèche" }]}
      returnNote={<span>…</span>} />
  <MiniMap title="…" center={{ icon:"hub", label:"Grubano", desc:"…" }}
      blocks={[{ icon:"person", title:"Client", role:"commande", desc:"…" }]} />
  <Comparison
      options={[{ icon:"…", name:"Standard", desc:"…" },
                { icon:"…", name:"Pro", desc:"…", featured:true, tag:"Pro" }]}
      rows={[{ label:"…", icon:"…", values:[true,false] }]} />
      (valeurs = true/false → coche/tiret, ou une courte chaîne. À n'utiliser
      QUE pour des comparaisons publiables : Standard vs Pro (10 % + 29 €/mois),
      ou distinctions de rôles issues du catalogue. Jamais de tarif inventé.)
  <LearningPath title="…" subtitle="…" meta={[{icon:"schedule",text:"10 min"}]}
      steps={[{ title:"…", note:"…", status:"done"|"current"|"todo",
                href:"UNE URL de RELATED_LINKS" }]} />
      (parcours guidé — href UNIQUEMENT depuis RELATED_LINKS, jamais inventé.)
  <Faq items={[{ icon:"help", q:"…", a:"…" }]} />

Pour \`<Steps>\` et \`<Callout>\`, garde l'import \`nextra/components\`.

── CALLOUTS (4 variantes) ───────────────────────────────────────────────────
\`<Callout type="info">\` astuce / info · \`type="warning"\` attention / « bientôt »
· \`type="error">\` risque réel · \`type="default">\` bonne pratique. Sans excès :
1 à 3 sur toute la page, jamais deux collés.

── NE PAS ÉMETTRE ───────────────────────────────────────────────────────────
- Aucun bloc « Passer à l'action » / « Faites-le dans l'app » ni bouton CTA :
  un encart CTA premium est ajouté automatiquement au pied par le thème.
- Aucun pied « Page générée depuis le code » ni horodatage : le thème rend
  déjà « Modifier cette page » et « last updated ».

── LIENS HYPERTEXTE EN LIGNE ────────────────────────────────────────────────
- Un terme de \`INLINE_LINKS\` qui apparaît dans la prose → enveloppe-le d'un
  lien Markdown vers sa cible (max 1–2 par bloc, pas de spam, jamais deux fois
  la même cible dans un paragraphe).
- Strictement \`INLINE_LINKS\` + \`RELATED_LINKS\` : n'invente aucune URL.
- Liens prose ordinaires : pas de **gras**, pas d'emoji, pas de flèche
  décorative.

── FORMAT DE SORTIE ─────────────────────────────────────────────────────────
- MDX seul. Pas de frontmatter (je l'ajoute). Pas de \`\`\`mdx d'enrobage. Pas
  d'explication avant/après.
- SEUL import autorisé, si tu utilises <Steps>/<Callout> :
  \`import { Steps, Callout } from 'nextra/components'\`. Tous les composants
  visuels ci-dessus (FlowDiagram, JourneyStrip, RelatedActors, MiniMap,
  Comparison, LearningPath, Faq) sont globaux — NE les importe PAS.
- N'utilise aucun autre composant React que ceux listés.
- Dans les props des composants (Faq items, RelatedActors nodes…), délimite
  les chaînes avec des guillemets DOUBLES "…" et utilise l'apostrophe
  typographique ’ à l'intérieur (jamais l'apostrophe droite ' dans une chaîne
  — « l'objet » ' briserait la chaîne et casserait la compilation MDX).
`

function topicKeyFor(cfg) {
  for (const [k, v] of Object.entries(FEATURE_PAGES)) if (v === cfg) return k
  return '?'
}

// Build the Mermaid state-diagram for a topic from its OWN declared models
// (so it is always relevant): pick a lifecycle-looking status enum (≥3 states),
// preferring an explicit cfg.stateModel, then 'Order', then the richest one.
// Returns { model, mermaid } or null when the topic has no such lifecycle.
function computeStateDiagram(cfg, facts) {
  const candidates = []
  for (const [model, src] of Object.entries(facts.models || {})) {
    const states = parseStatusEnum(src, model, 'status')
    if (states.length >= 3) candidates.push({ model, states })
  }
  if (!candidates.length) return null
  const pick =
    candidates.find((c) => c.model === cfg.stateModel) ||
    candidates.find((c) => c.model === 'Order') ||
    candidates.sort((a, b) => b.states.length - a.states.length)[0]
  return { model: pick.model, mermaid: buildStateDiagram(pick.states) }
}

function buildPrompt(cfg, facts, slices) {
  const RELATED_LINKS = relatedDocLinks(cfg.related, cfg.locale)
  const FLOW_STEPS = cfg.flow || []
  const INLINE_LINKS = cfg.inlineLinks || {}
  const stateDiagram = computeStateDiagram(cfg, facts)

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
    stateDiagram
      ? `STATE_DIAGRAM  = (cycle de vie « ${stateDiagram.model} » — colle-le TEL QUEL dans un bloc \`\`\`mermaid si tu choisis le visuel cycle de vie)\n\`\`\`mermaid\n${stateDiagram.mermaid}\n\`\`\``
      : `STATE_DIAGRAM  = (aucun cycle de vie pour ce sujet — utilise un autre visuel)`,
    `\n${contextBlock}`,
    `\n${factsBlock}`,
  ].join('\n')
}

// ── Claude call ─────────────────────────────────────────────────────────────

async function callClaude(prompt, attempt = 1) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      // v5 pages (visuals + conditional blocks) run longer than v4 — 4096 was
      // hit by one topic and truncated the page mid-JSX. 8192 gives headroom;
      // typical pages land at 1.5–4k output tokens.
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    // Backoff on rate-limit so an --all run in CI doesn't fail just
    // because we paced 8 topics inside the 30 k-input-tokens-per-minute
    // window. 3 attempts → 60 s → 120 s → 180 s.
    if (res.status === 429 && attempt <= 3) {
      const wait = 60 * attempt
      console.warn(`[generator] rate-limited; waiting ${wait}s before retry ${attempt + 1}/3`)
      await new Promise((r) => setTimeout(r, wait * 1000))
      return callClaude(prompt, attempt + 1)
    }
    const text = await res.text().catch(() => '')
    throw new Error(`Claude API ${res.status}: ${text.slice(0, 400)}`)
  }
  const data = await res.json()
  const block = (data.content || []).find((b) => b.type === 'text')
  if (!block) throw new Error('Claude API returned no text block')
  return { text: block.text, usage: data.usage || {} }
}

// ── MDX sanitizer (defensive — strips fence-wrapping artefacts) ────────────

/**
 * The LLM sometimes wraps its MDX output in a code fence (```mdx … ```) or
 * appends a dangling closing ``` / a trailing `---` separator with an
 * import-only code block. Both would break rendering. We strip them.
 */
function sanitizeMdxBody(text, topicKey) {
  let body = text.trim()
  let changed = false

  // Full ```<lang> wrap around the whole body — the model has emitted
  // ```mdx and ```typescript wraps, so accept any language tag. Anchored to
  // the true start/end of the body (no m-flag: greedy inner + end-of-string
  // closer). Only unwrap when the inside is fence-balanced AND still contains
  // the page's H1 — i.e. it really is a whole-page wrap, not a page that
  // merely starts and ends with legitimate code blocks.
  const fullFence = /^```[a-z]*\s*\n([\s\S]*)\n```\s*$/
  const fm = body.match(fullFence)
  if (fm && (fm[1].match(/```/g) || []).length % 2 === 0 && /^#\s/m.test(fm[1])) {
    body = fm[1].trim()
    changed = true
  }
  // Orphan LEADING opening fence (its closer was already lost or sits in the
  // trailing artefact stripped below) — only when fences are unbalanced, so a
  // page legitimately starting with a code block is never corrupted.
  if (((body.match(/```/g) || []).length % 2) === 1) {
    body = body.replace(/^```[a-z]*\s*\n/, (m) => {
      changed = true; return ''
    }).trim()
  }
  // Trailing `---` separator + a code block that just re-imports nextra
  // components — pure noise.
  body = body.replace(
    /\n+---\s*\n+```[a-z]*\s*\nimport[^\n`]+\n```\s*$/i,
    (m) => { changed = true; return '' },
  ).trim()
  // Standalone trailing closing ``` (no opening) — but ONLY when the fences
  // are unbalanced. A page whose last block is a Mermaid diagram legitimately
  // ends on ``` and must not be corrupted.
  const fenceCount = (body.match(/```/g) || []).length
  if (fenceCount % 2 === 1) {
    body = body.replace(/\n+```\s*$/, (m) => { changed = true; return '' }).trim()
  }
  // Trailing lone `---` (orphan horizontal rule).
  body = body.replace(/\n+---\s*$/g, (m) => { changed = true; return '' }).trim()

  if (changed) {
    console.log(`[generator] ${topicKey} → sanitized trailing fence/separator artefacts`)
  }

  // French elision apostrophes (l'historique, qu'une) inside single-quoted
  // JSX prop strings terminate the string early → acorn parse error → build
  // failure. A straight ' between two letters is always an apostrophe, never
  // a string delimiter (delimiters are preceded by : ( [ , or space). Convert
  // to the typographic ’ — JS-safe in any quoting and correct FR typography.
  body = body.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])'([A-Za-zÀ-ÖØ-öø-ÿ])/g, (m, a, b) => {
    changed = true
    return `${a}’${b}`
  })

  // If the body uses <Steps> / <Callout>, the nextra/components import must
  // COVER every used component — an import of only { Steps } with a <Callout>
  // in the body crashes prerender just as hard as no import at all. Compute
  // the used set; if an import exists, widen it in place, else inject one.
  const used = ['Steps', 'Callout'].filter((c) => new RegExp(`<${c}[\\s/>]`).test(body))
  if (used.length) {
    const importRe = /^import\s+\{([^}]+)\}\s+from\s+['"]nextra\/components['"]\s*$/m
    const im = body.match(importRe)
    const covered = im ? im[1].split(',').map((s) => s.trim()) : []
    const missing = used.filter((c) => !covered.includes(c))
    if (missing.length) {
      const full = [...new Set([...covered, ...used])].join(', ')
      console.log(`[generator] ${topicKey} → fixing nextra/components import (adds: ${missing.join(', ')})`)
      if (im) {
        body = body.replace(importRe, `import { ${full} } from 'nextra/components'`)
      } else {
        body = `import { ${full} } from 'nextra/components'\n\n` + body
      }
    }
  }
  return body
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

  const body = sanitizeMdxBody(text, topicKey) + '\n'
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
