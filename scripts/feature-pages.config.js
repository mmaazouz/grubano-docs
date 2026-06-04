/**
 * Generator registry — the explicit boundary between EDITORIAL pages
 * (hand-written, never overwritten by the generator) and GENERATED pages
 * (templated from the kitchen-hub source code).
 *
 * Editorial pages: the positioning / conversion surfaces where wording is a
 * deliberate strategic choice (home landing, "Découvrir Grubano" intro,
 * "Passer en Pro", "Démarrer en 15 minutes"). The generator REFUSES to write
 * to any path in `EDITORIAL_PAGES` even when invoked with --all.
 *
 * Generated pages: feature reference cards driven from the route handlers
 * and Prisma models. Each topic declares the source files it pulls facts
 * from, the target doc path, the related topics for cross-linking, and a
 * Pro-multi-platform flag for the strategic CTA block.
 */

// Editorial paths, relative to repo root, that the generator must never touch.
const EDITORIAL_PAGES = new Set([
  'content/fr/index.mdx',
  'content/en/index.mdx',
  'content/fr/getting-started.mdx',
  'content/en/getting-started.mdx',
  'content/fr/guides/pro.mdx',
  'content/en/guides/pro.mdx',
  'content/fr/guides/quick-start.mdx',
])

// Topic registry. Keys mirror docs-map.json so the same name flows
// app ↔ docs ↔ generator. Only `restaurant.stocks` is in scope for the
// B1-bis proof; other entries can be uncommented as the template stabilizes.
const FEATURE_PAGES = {
  'restaurant.stocks': {
    locale: 'fr',
    docPath: '/guides/stocks',
    title: 'Gestion des stocks',
    intent:
      "Tenir l'inventaire d'une marque à jour : ajouter des articles, suivre les quantités et les DLC, recevoir des alertes de réapprovisionnement, et mettre à jour les stocks en langage naturel via l'IA.",
    sources: {
      routes: ['app/api/stocks/route.ts', 'app/api/stocks/update-ai/route.ts'],
      models: ['StockItem'],
    },
    related: ['restaurant.menu', 'restaurant.dashboard'],
    // High-level flow rendered as a <FlowDiagram> at the top of the page.
    // 3–5 steps, very short labels (≤ 5 words). Verb-led where possible.
    flow: [
      'Ajouter un article',
      'Définir un seuil mini',
      'Alerte de réappro',
      'Prévision de rupture 7 j',
    ],
    // Terms to weave as inline links inside the prose (in addition to the
    // "Pour aller plus loin" block). Key = surface form to look for, value
    // = target href. Case-insensitive match. Generator suggests, the LLM
    // decides where it reads naturally.
    inlineLinks: {
      menu: '/fr/guides/menu/',
      'tableau de bord': '/fr/guides/restaurant/',
      'fidélité': '/fr/guides/loyalty/',
    },
    // Set to true ONLY if the feature touches multi-platform aggregation
    // (Uber Eats / Deliveroo / Just Eat etc. consolidated into one screen).
    // Stock journaling is local-only → false. The Pro callout in the CTA
    // block is then omitted entirely (no "bientôt" sleight of hand).
    touchesMultiPlatformAggregation: false,
  },
}

module.exports = { EDITORIAL_PAGES, FEATURE_PAGES }
