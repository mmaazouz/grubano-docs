/**
 * Topic catalog for the harmonized doc generator (v5 — extended publics).
 *
 * The skeleton is STABLE: audiences in the fixed order below, matching the CD
 * sidebar (Découvrir → Clients → Restaurateurs → Fournisseurs → Franchisés →
 * Créateurs → Affiliés → Influenceurs → Livreurs → Ressources ; Développeurs is
 * a future /dev/ subdomain and intentionally absent). Topics inside an audience
 * can be added; existing slugs stay frozen (docs-map.json is a public contract).
 *
 * Each entry carries a `status`:
 *   - 'editorial' — hand-written strategic/positioning/legal surface. The
 *     generator REFUSES to touch it. Listed here for the SUMMARY view only.
 *   - 'generated' — owned by the generator (v5 pedagogical template). Re-runs
 *     allowed; cache via sourceHash; frontmatter carries `generated: true`.
 *   - 'planned'   — declared but not yet generated (generator refuses until
 *     flipped to 'generated' after review).
 *
 * `mirrors` = the "voir aussi" cross-public counterpart(s) — the same concept
 * seen from another audience (client ↔ restaurateur, créateur ↔ affilié…). It
 * seeds the knowledge-graph links the v5 template weaves into "Pour aller plus
 * loin".
 *
 * EDITORIAL_PAGES is DERIVED from this catalog so the two cannot drift.
 */

const AUDIENCES = [
  'Découvrir',
  'Clients',
  'Restaurateurs',
  'Fournisseurs',
  'Franchisés',
  'Créateurs',
  'Affiliés',
  'Influenceurs',
  'Livreurs',
  'Ressources',
]

const FEATURE_PAGES = {
  // ── Découvrir (transverse, éditorial) ─────────────────────────────────
  'intro': {
    audience: 'Découvrir',
    status: 'editorial',
    locale: 'fr',
    docPath: '/getting-started',
    title: 'Découvrir Grubano',
  },
  'home': {
    audience: 'Découvrir',
    status: 'editorial',
    locale: 'fr',
    docPath: '/',
    title: 'Centre d’aide Grubano',
  },

  // ── Clients ───────────────────────────────────────────────────────────
  'consumer.order': {
    audience: 'Clients',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/consumer',
    title: 'Commander & suivre',
    intent:
      'Trouver un restaurant local, passer commande (livraison / click & collect / sur place) et suivre l’avancée en temps réel.',
    sources: {
      routes: ['app/api/restaurants/route.ts', 'app/api/orders/route.ts'],
      models: ['Order', 'Restaurant'],
    },
    related: ['consumer.loyalty', 'consumer.account'],
    mirrors: ['restaurant.dashboard'],
    flow: ['Trouver un resto', 'Composer', 'Payer', 'Suivre la commande'],
    inlineLinks: {
      'fidélité': '/fr/guides/consumer-loyalty/',
      compte: '/fr/guides/consumer-account/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'consumer.loyalty': {
    audience: 'Clients',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/consumer-loyalty',
    title: 'Fidélité, cagnotte & parrainage',
    intent:
      'Cumuler des points et gravir les paliers, suivre sa cagnotte, et parrainer des proches via un code de parrainage pour gagner des avantages.',
    sources: {
      routes: [
        'app/api/loyalty/wallet/route.ts',
        'app/api/loyalty/history/route.ts',
        'app/api/referral/preview/route.ts',
      ],
      models: ['LoyaltyCustomer', 'LoyaltyTransaction', 'Referral', 'Reward'],
    },
    related: ['consumer.order', 'consumer.account'],
    mirrors: ['restaurant.loyalty'],
    flow: ['Commander', 'Cumuler des points', 'Gravir un palier', 'Parrainer'],
    inlineLinks: {
      commander: '/fr/guides/consumer/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'consumer.account': {
    audience: 'Clients',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/consumer-account',
    title: 'Mon compte',
    intent:
      'Gérer son compte client : coordonnées, adresses, favoris, avis laissés et langue de l’application.',
    sources: {
      routes: [
        'app/api/eat/account/route.ts',
        'app/api/account/email-change/request/route.ts',
      ],
      models: ['Account'],
    },
    related: ['consumer.order', 'consumer.loyalty'],
    mirrors: [],
    flow: ['Créer un compte', 'Compléter le profil', 'Ajouter des favoris', 'Gérer la sécurité'],
    inlineLinks: {
      'fidélité': '/fr/guides/consumer-loyalty/',
    },
    touchesMultiPlatformAggregation: false,
  },

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
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/restaurant',
    title: 'Tableau de bord',
    intent:
      'Voir en un coup d’œil l’activité de votre restaurant : commandes en cours, chiffre d’affaires, alertes — et piloter le service depuis cet écran unique.',
    sources: {
      routes: ['app/api/dashboard/route.ts', 'app/api/analytics/route.ts'],
      models: ['Order', 'Brand'],
    },
    related: ['restaurant.menu', 'restaurant.stocks', 'restaurant.reservations', 'restaurant.finances'],
    mirrors: ['consumer.order'],
    flow: ['Commandes en cours', 'Chiffres temps réel', 'Alertes', 'Multi-marques'],
    inlineLinks: {
      menu: '/fr/guides/menu/',
      stocks: '/fr/guides/stocks/',
      'réservations': '/fr/guides/reservations/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.menu': {
    audience: 'Restaurateurs',
    status: 'generated',
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
    mirrors: ['creators'],
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
    mirrors: ['supplier.catalog'],
    flow: [
      'Ajouter un article',
      'Définir un seuil mini',
      'Alerte de réappro',
      'Prévision de rupture 7 j',
    ],
    inlineLinks: {
      menu: '/fr/guides/menu/',
      'tableau de bord': '/fr/guides/restaurant/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.loyalty': {
    audience: 'Restaurateurs',
    status: 'generated',
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
    related: ['restaurant.dashboard'],
    mirrors: ['consumer.loyalty'],
    flow: ['Inscrire un client', 'Acheter', 'Crédit de points', 'Récompense'],
    inlineLinks: {
      'tableau de bord': '/fr/guides/restaurant/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.reservations': {
    audience: 'Restaurateurs',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/reservations',
    title: 'Réservations & sur place',
    intent:
      'Gérer les tables et les créneaux : plan de salle, accepter / refuser une demande, suivre l’occupation en temps réel.',
    sources: {
      routes: ['app/api/reservations/route.ts'],
      models: ['Reservation', 'RestaurantTable'],
    },
    related: ['restaurant.dashboard'],
    mirrors: ['consumer.order'],
    flow: ['Configurer la salle', 'Recevoir la demande', 'Valider', 'Service'],
    inlineLinks: {
      'tableau de bord': '/fr/guides/restaurant/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'restaurant.finances': {
    audience: 'Restaurateurs',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/finances',
    title: 'Finances & versements',
    intent:
      'Comprendre vos finances Grubano : commission de 10 % par commande, calendrier des versements, détail brut/commission/net, et déclaration DAC7.',
    sources: {
      routes: [
        'app/api/restaurants/[id]/finance/summary/route.ts',
        'app/api/restaurants/[id]/finance/operations/route.ts',
      ],
      models: ['LedgerEntry', 'Order'],
    },
    related: ['restaurant.dashboard', 'restaurant.pro'],
    mirrors: ['driver.earnings'],
    flow: ['Commande payée', 'Commission 10 %', 'Versement', 'Relevé & DAC7'],
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

  // ── Fournisseurs ‹NOUVEAU› ────────────────────────────────────────────
  'supplier.overview': {
    audience: 'Fournisseurs',
    status: 'editorial',
    locale: 'fr',
    docPath: '/guides/supplier',
    title: 'Vendre vos approvisionnements',
  },
  'supplier.catalog': {
    audience: 'Fournisseurs',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/supplier-catalog',
    title: 'Catalogue, zones & commandes',
    intent:
      'Publier votre catalogue et vos prix, définir vos zones de livraison et votre minimum de commande, puis recevoir et traiter les commandes des restaurateurs.',
    sources: {
      routes: [
        'app/api/supplier/catalog/route.ts',
        'app/api/supplier/orders/route.ts',
        'app/api/supplier/clients/route.ts',
        'app/api/supplier/profile/route.ts',
      ],
      models: ['SupplierProfile', 'SupplierCatalogItem', 'SupplyOrder', 'SupplyOrderLine'],
    },
    related: ['supplier.overview'],
    mirrors: ['restaurant.stocks'],
    flow: ['Publier le catalogue', 'Définir zones & minimum', 'Recevoir une commande', 'Traiter & livrer'],
    inlineLinks: {},
    touchesMultiPlatformAggregation: false,
  },

  // ── Franchisés ────────────────────────────────────────────────────────
  'franchise': {
    audience: 'Franchisés',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/franchise',
    title: 'La franchise sur Grubano',
    intent:
      'Devenir franchiseur (ouvrir sa marque au réseau) ou franchisé (exploiter une marque existante) — la marque reste au franchiseur, dans les limites fixées par Grubano.',
    sources: {
      routes: [
        'app/api/franchise/apply/route.ts',
        'app/api/franchise/brands/route.ts',
        'app/api/franchise/my-dashboard/route.ts',
      ],
      models: ['FranchiseApplication', 'FranchiseeApplication'],
    },
    related: ['franchise.operations', 'restaurant.dashboard'],
    mirrors: [],
    flow: ['Candidater', 'Validation Grubano', 'Adopter une marque', 'Exploiter'],
    inlineLinks: {
      'piloter son réseau': '/fr/guides/franchise-operations/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'franchise.operations': {
    audience: 'Franchisés',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/franchise-operations',
    title: 'Piloter son réseau',
    intent:
      'Piloter un réseau de franchise : plusieurs points de vente, suivi des royalties dues, et reporting consolidé — dans les limites fixées par Grubano.',
    sources: {
      routes: [
        'app/api/franchise/my-dashboard/route.ts',
        'app/api/franchise/finances/route.ts',
      ],
      models: ['FranchiseRoyalty'],
    },
    related: ['franchise'],
    mirrors: ['restaurant.finances'],
    flow: ['Points de vente', 'CA du réseau', 'Royalties', 'Reporting'],
    inlineLinks: {
      franchise: '/fr/guides/franchise/',
    },
    touchesMultiPlatformAggregation: false,
  },

  // ── Créateurs (recettes seulement — v5 : 3 rôles distincts) ───────────
  'creators': {
    audience: 'Créateurs',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/creators',
    title: 'Créateur de recettes',
    intent:
      'Soumettre des recettes de plats qu’un restaurant partenaire pourra adopter et cuisiner sous sa propre enseigne ; toucher une commission de 4 % sur les ventes de vos créations, et suivre vos gains.',
    sources: {
      routes: [
        'app/api/creators/apply/route.ts',
        'app/api/creators/dishes/route.ts',
        'app/api/creators/leaderboard/route.ts',
      ],
      models: ['Creator', 'CreatorDish'],
    },
    related: ['restaurant.menu'],
    mirrors: ['affiliate.overview'],
    flow: ['Candidater', 'Soumettre une recette', 'Adoption par un resto', 'Commission 4 %'],
    inlineLinks: {
      menu: '/fr/guides/menu/',
      'affiliation': '/fr/guides/affiliate/',
    },
    touchesMultiPlatformAggregation: false,
  },

  // ── Affiliés ‹NOUVEAU› ────────────────────────────────────────────────
  'affiliate.overview': {
    audience: 'Affiliés',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/affiliate',
    title: 'Le programme d’affiliation',
    intent:
      'Rejoindre le programme d’affiliation : obtenir des liens et des codes, toucher une commission sur les ventes que vous générez, suivre vos gains et demander un retrait.',
    sources: {
      routes: [
        'app/api/affiliate/apply/route.ts',
        'app/api/affiliate/join/route.ts',
        'app/api/affiliate/stats/route.ts',
        'app/api/affiliate/content/route.ts',
        'app/api/affiliate/withdraw/route.ts',
      ],
      models: ['Affiliate', 'ReferralClick', 'Referral'],
    },
    related: ['influencer.overview', 'creators'],
    mirrors: ['creators'],
    flow: ['Candidater', 'Obtenir liens & codes', 'Générer des ventes', 'Retirer ses gains'],
    inlineLinks: {
      'influenceur': '/fr/guides/influencer/',
    },
    touchesMultiPlatformAggregation: false,
  },

  // ── Influenceurs ‹NOUVEAU› (affilié vérifié) ──────────────────────────
  'influencer.overview': {
    audience: 'Influenceurs',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/influencer',
    title: 'Devenir influenceur',
    intent:
      'Devenir influenceur : un affilié au statut vérifié, avec un profil à audience, qui rejoint des programmes de restaurants (commission dans les bornes fixées par Grubano) et dispose de plus d’outils pour les gros volumes.',
    sources: {
      routes: [
        'app/api/affiliate/verify-request/route.ts',
        'app/api/creator/affiliate-opportunities/route.ts',
        'app/api/creator/affiliate-stats/route.ts',
      ],
      models: ['Affiliate'],
    },
    related: ['affiliate.overview'],
    mirrors: ['affiliate.overview'],
    flow: ['Être affilié', 'Demander la vérification', 'Rejoindre un programme', 'Performances & gains'],
    inlineLinks: {
      'affiliation': '/fr/guides/affiliate/',
    },
    touchesMultiPlatformAggregation: false,
  },

  // ── Livreurs ‹NOUVEAU› ────────────────────────────────────────────────
  'driver.overview': {
    audience: 'Livreurs',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/driver',
    title: 'Devenir livreur & missions',
    intent:
      'Devenir livreur indépendant sur Grubano : candidater (liste d’attente puis validation KYC), se rendre disponible, voir les missions, et réaliser une course étape par étape.',
    sources: {
      routes: [
        'app/api/logistics/register/route.ts',
        'app/api/logistics/availability/route.ts',
        'app/api/logistics/missions/route.ts',
        'app/api/logistics/missions/mine/route.ts',
        'app/api/logistics/missions/[id]/accept/route.ts',
        'app/api/logistics/missions/[id]/pickup/route.ts',
        'app/api/logistics/missions/[id]/deliver/route.ts',
        'app/api/logistics/profile/route.ts',
      ],
      models: ['LogisticsProfile'],
    },
    related: ['driver.earnings', 'driver.tracking'],
    mirrors: ['consumer.order'],
    flow: ['Candidater', 'Validation / KYC', 'Se rendre dispo', 'Réaliser une course'],
    inlineLinks: {
      'rémunération': '/fr/guides/driver-earnings/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'driver.earnings': {
    audience: 'Livreurs',
    status: 'generated',
    locale: 'fr',
    docPath: '/guides/driver-earnings',
    title: 'Rémunération & retraits',
    intent:
      'Comprendre votre rémunération de livreur : frais de livraison moins une commission Grubano de 20 %, pourboires reversés à 100 %, maturation à la livraison, et retrait à partir de 25 €.',
    sources: {
      routes: [
        'app/api/logistics/earnings/route.ts',
        'app/api/logistics/withdraw/route.ts',
        'app/api/logistics/fee-preview/route.ts',
      ],
      models: ['CourierEarning', 'LedgerEntry'],
    },
    related: ['driver.overview'],
    mirrors: ['restaurant.finances'],
    flow: ['Course livrée', 'Frais − commission 20 %', 'Maturation', 'Retrait dès 25 €'],
    inlineLinks: {
      missions: '/fr/guides/driver/',
    },
    touchesMultiPlatformAggregation: false,
  },
  'driver.tracking': {
    audience: 'Livreurs',
    status: 'editorial',
    locale: 'fr',
    docPath: '/guides/driver-tracking',
    title: 'Suivi de course',
  },

  // ── Ressources (transverse, éditorial) ────────────────────────────────
  'payments-security': {
    audience: 'Ressources',
    status: 'editorial',
    locale: 'fr',
    docPath: '/guides/payments-security',
    title: 'Paiements & sécurité',
  },
  'privacy': {
    audience: 'Ressources',
    status: 'editorial',
    locale: 'fr',
    docPath: '/guides/privacy',
    title: 'Confidentialité & vos données',
  },
  'legal': {
    audience: 'Ressources',
    status: 'editorial',
    locale: 'fr',
    docPath: '/guides/legal',
    title: 'Mentions légales & CGU',
  },
}

// Editorial paths (relative to repo root) — derived from the catalog above so
// additions stay in sync. Includes the EN twins where the path exists, so the
// language switcher never lands on a page the generator could rewrite.
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
