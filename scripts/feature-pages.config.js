/**
 * Topic catalog for the harmonized doc generator.
 *
 * The skeleton is STABLE: four audiences, in this fixed order, never
 * reshuffled run-to-run. Topics inside an audience can be added; existing
 * topic positions and slugs stay.
 *
 * Each entry carries a `status`:
 *   - 'editorial' — hand-written, strategic surface. The generator REFUSES
 *     to touch the corresponding MDX. Listed here for the SUMMARY view only.
 *   - 'generated' — owned by the generator. Re-runs allowed; cache via
 *     sourceHash. The MDX carries `generated: true` in its frontmatter.
 *   - 'planned'   — declared but not yet generated. The generator refuses
 *     to write planned topics until they're flipped to 'generated' (a
 *     deliberate two-step so we don't accidentally pave a hand-written
 *     page on the first run after adding its entry).
 *
 * The EDITORIAL_PAGES set below is computed from this catalog so the two
 * representations cannot drift.
 */

const AUDIENCES = ['Restaurateurs', 'Clients', 'Franchisés', 'Créateurs', 'Hors guide']

const FEATURE_PAGES = {
  // ── Restaurateurs ─────────────────────────────────────────────────────
  'restaurant.quick-start': {
    audience: 'Restaurateurs',
    status: 'editorial',
    locale: 'fr',
    docPath: '/guides/quick-start',
    title: 'Démarrer en 15 minutes',
  },
  'restaurant.dashboard': {
    audience: 'Restaurateurs',
    status: 'planned',
    locale: 'fr',
    docPath: '/guides/restaurant',
    title: 'Tableau de bord',
    intent:
      'Voir en un coup d’œil l’activité de votre restaurant : commandes en cours, chiffre d’affaires, alertes — et piloter le service depuis cet écran unique.',
    sources: {
      routes: ['app/api/dashboard/route.ts', 'app/api/analytics/route.ts'],
      models: ['Order', 'Brand'],
    },
    related: ['restaurant.menu', 'restaurant.stocks', 'restaurant.reservations'],
    flow: ['Commandes en cours', 'Chiffres temps réel', 'Alertes', 'Multi-marques'],
    inlineLinks: {
      menu: '/fr/guides/menu/',
      stocks: '/fr/guides/stocks/',
      réservations: '/fr/guides/reservations/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.menu': {
    audience: 'Restaurateurs',
    status: 'planned',
    locale: 'fr',
    docPath: '/guides/menu',
    title: 'Menu & Scan IA',
    intent:
      'Mettre en ligne la carte d’un restaurant en photographiant simplement le menu — l’IA reconnaît les plats, propose nom, description et allergènes ; le restaurateur valide.',
    sources: {
      routes: ['app/api/menu/route.ts', 'app/api/menu/scan-dish/route.ts'],
      models: ['MenuItem'],
    },
    related: ['restaurant.stocks', 'restaurant.dashboard'],
    flow: ['Scanner la carte', 'Vérifier les plats', 'Publier', 'Mettre à jour'],
    inlineLinks: {
      stocks: '/fr/guides/stocks/',
      'tableau de bord': '/fr/guides/restaurant/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.stocks': {
    audience: 'Restaurateurs',
    status: 'generated',
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
    flow: [
      'Ajouter un article',
      'Définir un seuil mini',
      'Alerte de réappro',
      'Prévision de rupture 7 j',
    ],
    inlineLinks: {
      menu: '/fr/guides/menu/',
      'tableau de bord': '/fr/guides/restaurant/',
      'fidélité': '/fr/guides/loyalty/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.loyalty': {
    audience: 'Restaurateurs',
    status: 'planned',
    locale: 'fr',
    docPath: '/guides/loyalty',
    title: 'Programme fidélité',
    intent:
      'Fidéliser sa clientèle : 1 point = 1 € dépensé, paliers Bronze/Silver/Gold/Platinum, points crédités à la livraison de la commande.',
    sources: {
      routes: [
        'app/api/loyalty/register/route.ts',
        'app/api/loyalty/validate/route.ts',
        'app/api/loyalty/wallet/route.ts',
      ],
      models: ['LoyaltyCustomer', 'LoyaltyOrder', 'Reward'],
    },
    related: ['restaurant.dashboard', 'consumer.order'],
    flow: ['Inscrire un client', 'Acheter', 'Crédit de points', 'Récompense'],
    inlineLinks: {
      'tableau de bord': '/fr/guides/restaurant/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.reservations': {
    audience: 'Restaurateurs',
    status: 'planned',
    locale: 'fr',
    docPath: '/guides/reservations',
    title: 'Réservations',
    intent:
      'Gérer les tables et les créneaux : plan de salle, accepter / refuser une demande, suivre l’occupation en temps réel.',
    sources: {
      routes: ['app/api/reservations/route.ts'],
      models: ['Reservation', 'RestaurantTable'],
    },
    related: ['restaurant.dashboard'],
    flow: ['Configurer la salle', 'Recevoir la demande', 'Valider', 'Service'],
    inlineLinks: {
      'tableau de bord': '/fr/guides/restaurant/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.pro': {
    audience: 'Restaurateurs',
    status: 'editorial',
    locale: 'fr',
    docPath: '/guides/pro',
    title: 'Passer en Pro',
  },

  // ── Clients ───────────────────────────────────────────────────────────
  'consumer.order': {
    audience: 'Clients',
    status: 'planned',
    locale: 'fr',
    docPath: '/guides/consumer',
    title: 'Commander & suivre',
    intent:
      'Trouver un restaurant local, passer commande (livraison / click & collect / table) et suivre l’avancée en temps réel.',
    sources: {
      routes: [
        'app/api/restaurants/route.ts',
        'app/api/orders/route.ts',
      ],
      models: ['Order', 'Restaurant'],
    },
    related: ['restaurant.dashboard', 'restaurant.loyalty'],
    flow: ['Trouver un resto', 'Commander', 'Payer', 'Suivre la livraison'],
    inlineLinks: {
      fidélité: '/fr/guides/loyalty/',
    },
    touchesMultiPlatformAggregation: false,
  },

  // ── Franchisés ────────────────────────────────────────────────────────
  'franchise': {
    audience: 'Franchisés',
    status: 'planned',
    locale: 'fr',
    docPath: '/guides/franchise',
    title: 'Franchise',
    intent:
      'Adopter une marque existante du réseau, ou faire entrer la sienne — dans les limites fixées par Grubano.',
    sources: {
      routes: ['app/api/franchise/apply/route.ts', 'app/api/franchise/brands/route.ts', 'app/api/franchise/my-dashboard/route.ts'],
      models: [],
    },
    related: ['restaurant.dashboard'],
    flow: ['Candidater', 'Validation Grubano', 'Adopter une marque', 'Suivre les KPIs'],
    inlineLinks: {
      'tableau de bord': '/fr/guides/restaurant/',
    },
    touchesMultiPlatformAggregation: false,
  },

  // ── Créateurs ────────────────────────────────────────────────────────
  'creators': {
    audience: 'Créateurs',
    status: 'planned',
    locale: 'fr',
    docPath: '/guides/creators',
    title: 'Créateurs',
    intent:
      'Proposer une recette ou un lien d’affiliation et toucher une commission sur les ventes — dans les limites fixées par Grubano.',
    sources: {
      routes: [
        'app/api/creators/apply/route.ts',
        'app/api/creators/dishes/route.ts',
        'app/api/creators/leaderboard/route.ts',
        'app/api/referral/preview/route.ts',
      ],
      models: ['Creator', 'CreatorDish'],
    },
    related: ['restaurant.menu', 'consumer.order'],
    flow: ['Candidater', 'Proposer une recette', 'Partager un lien', 'Commission sur ventes'],
    inlineLinks: {
      menu: '/fr/guides/menu/',
    },
    touchesMultiPlatformAggregation: false,
  },

  // ── Hors guide (positionnement / éditorial) ──────────────────────────
  'intro': {
    audience: 'Hors guide',
    status: 'editorial',
    locale: 'fr',
    docPath: '/getting-started',
    title: 'Découvrir Grubano',
  },
  'home': {
    audience: 'Hors guide',
    status: 'editorial',
    locale: 'fr',
    docPath: '/',
    title: 'Centre d’aide Grubano',
  },
}

// Editorial paths (relative to repo root) — derived from the catalog above
// so additions stay in sync. Includes the EN twins where the path exists,
// because the language switcher must never land on a pavé that the
// generator could rewrite under our feet.
function buildEditorialPaths() {
  const paths = new Set()
  for (const cfg of Object.values(FEATURE_PAGES)) {
    if (cfg.status !== 'editorial') continue
    const slug = cfg.docPath === '/' ? '/index' : cfg.docPath
    paths.add(`content/fr${slug}.mdx`.replace('//', '/'))
    paths.add(`content/en${slug}.mdx`.replace('//', '/'))
  }
  return paths
}

const EDITORIAL_PAGES = buildEditorialPaths()

module.exports = { AUDIENCES, EDITORIAL_PAGES, FEATURE_PAGES }
