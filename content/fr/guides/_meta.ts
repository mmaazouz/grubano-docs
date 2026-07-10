import type { MetaRecord } from 'nextra'

// Sidebar order = catalogue v5 (par public). Séparateurs = en-têtes de section.
export default {
  '-- clients': { type: 'separator', title: 'Clients' },
  'espace-clients': { title: 'Démarrer ici', theme: { toc: false } },
  'parcours-client': 'Parcours : première commande',
  consumer: 'Commander & suivre',
  'consumer-loyalty': 'Fidélité & parrainage',
  'consumer-account': 'Mon compte',

  '-- restaurant': { type: 'separator', title: 'Restaurateurs' },
  'espace-restaurateurs': { title: 'Démarrer ici', theme: { toc: false } },
  'parcours-restaurateur': 'Parcours : bien démarrer',
  'quick-start': 'Démarrer en 15 minutes',
  restaurant: 'Tableau de bord',
  menu: 'Menu & Scan IA',
  stocks: 'Gestion des stocks',
  loyalty: 'Programme fidélité',
  reservations: 'Réservations & sur place',
  finances: 'Finances & versements',
  pro: 'Passer en Pro',

  '-- supplier': { type: 'separator', title: 'Fournisseurs' },
  'espace-fournisseurs': { title: 'Démarrer ici', theme: { toc: false } },
  supplier: 'Vendre vos approvisionnements',
  'supplier-catalog': 'Catalogue, zones & commandes',

  '-- franchise': { type: 'separator', title: 'Franchisés' },
  'espace-franchises': { title: 'Démarrer ici', theme: { toc: false } },
  'parcours-franchise': 'Parcours : lancer une franchise',
  franchise: 'La franchise sur Grubano',
  'franchise-operations': 'Piloter son réseau',

  '-- creators': { type: 'separator', title: 'Créateurs' },
  creators: 'Créateur de recettes',

  '-- affiliate': { type: 'separator', title: 'Affiliés' },
  affiliate: 'Programme d’affiliation',

  '-- influencer': { type: 'separator', title: 'Influenceurs' },
  influencer: 'Devenir influenceur',

  '-- driver': { type: 'separator', title: 'Livreurs' },
  'espace-livreurs': { title: 'Démarrer ici', theme: { toc: false } },
  'parcours-livreur': 'Parcours : devenir livreur',
  driver: 'Devenir livreur & missions',
  'driver-earnings': 'Rémunération & retraits',
  'driver-tracking': 'Suivi de course',

  '-- resources': { type: 'separator', title: 'Ressources' },
  'payments-security': 'Paiements & sécurité',
  privacy: 'Confidentialité & données',
  legal: 'Mentions légales & CGU',
} satisfies MetaRecord
