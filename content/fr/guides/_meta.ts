import { createElement as h } from 'react'
import type { MetaRecord } from 'nextra'

// Séparateur de catégorie avec icône Material (maquette .side__gh)
const cat = (icon: string, label: string) =>
  h('span', { className: 'sb-cat' }, h('span', { className: 'ms sb-cat__ic' }, icon), h('span', { className: 'sb-cat__t' }, label))

// Sidebar order = catalogue v5 (par public). Séparateurs = en-têtes de section.
export default {
  '-- clients': { type: 'separator', title: cat('restaurant', 'Clients') },
  'espace-clients': { title: 'Démarrer ici', display: 'hidden', theme: { toc: false } },
  'parcours-client': { title: 'Parcours : première commande', display: 'hidden' },
  consumer: 'Commander & suivre',
  'consumer-loyalty': 'Fidélité & parrainage',
  'consumer-account': 'Mon compte',

  '-- restaurant': { type: 'separator', title: cat('storefront', 'Restaurateurs') },
  'espace-restaurateurs': { title: 'Démarrer ici', display: 'hidden', theme: { toc: false } },
  'parcours-restaurateur': { title: 'Parcours : bien démarrer', display: 'hidden' },
  'quick-start': 'Démarrer en 15 minutes',
  restaurant: 'Tableau de bord',
  menu: 'Menu & Scan IA',
  stocks: 'Gestion des stocks',
  loyalty: 'Programme fidélité',
  reservations: 'Réservations & sur place',
  finances: 'Finances & versements',
  pro: 'Passer en Pro',

  '-- supplier': { type: 'separator', title: cat('local_shipping', 'Fournisseurs') },
  'espace-fournisseurs': { title: 'Démarrer ici', display: 'hidden', theme: { toc: false } },
  supplier: 'Vendre vos approvisionnements',
  'supplier-catalog': 'Catalogue, zones & commandes',

  '-- franchise': { type: 'separator', title: cat('hub', 'Franchisés') },
  'espace-franchises': { title: 'Démarrer ici', display: 'hidden', theme: { toc: false } },
  'parcours-franchise': { title: 'Parcours : lancer une franchise', display: 'hidden' },
  franchise: 'La franchise sur Grubano',
  'franchise-operations': 'Piloter son réseau',

  '-- creators': { type: 'separator', title: cat('restaurant_menu', 'Créateurs') },
  creators: 'Créateur de recettes',

  '-- affiliate': { type: 'separator', title: cat('link', 'Affiliés') },
  affiliate: 'Programme d’affiliation',

  '-- influencer': { type: 'separator', title: cat('campaign', 'Influenceurs') },
  influencer: 'Devenir influenceur',

  '-- driver': { type: 'separator', title: cat('two_wheeler', 'Livreurs') },
  'espace-livreurs': { title: 'Démarrer ici', display: 'hidden', theme: { toc: false } },
  'parcours-livreur': { title: 'Parcours : devenir livreur', display: 'hidden' },
  driver: 'Devenir livreur & missions',
  'driver-earnings': 'Rémunération & retraits',
  'driver-tracking': 'Suivi de course',

  '-- resources': { type: 'separator', title: cat('folder_open', 'Ressources') },
  'payments-security': 'Paiements & sécurité',
  privacy: 'Confidentialité & données',
  legal: 'Mentions légales & CGU',
} satisfies MetaRecord
