import { createElement as h } from 'react'
import type { MetaRecord } from 'nextra'

// Séparateur de catégorie avec icône Material (maquette .side__gh)
const cat = (icon: string, label: string) =>
  h('span', { className: 'sb-cat' }, h('span', { className: 'ms sb-cat__ic' }, icon), h('span', { className: 'sb-cat__t' }, label))

// Ordine della sidebar = catalogo v5 (per pubblico). Rispecchia content/fr/guides/_meta.ts.
export default {
  '-- clients': { type: 'separator', title: cat('restaurant', 'Clienti') },
  'espace-clients': { title: 'Inizia qui', display: 'hidden', theme: { toc: false } },
  'parcours-client': { title: 'Percorso: primo ordine', display: 'hidden' },
  consumer: 'Ordinare e seguire',
  'consumer-loyalty': 'Fedeltà e passaparola',
  'consumer-account': 'Il mio account',

  '-- restaurant': { type: 'separator', title: cat('storefront', 'Ristoratori') },
  'espace-restaurateurs': { title: 'Inizia qui', display: 'hidden', theme: { toc: false } },
  'parcours-restaurateur': { title: 'Percorso: iniziare bene', display: 'hidden' },
  'quick-start': 'Iniziare in 15 minuti',
  restaurant: 'Pannello di controllo',
  menu: 'Menù e scansione IA',
  stocks: 'Gestione delle scorte',
  loyalty: 'Programma fedeltà',
  reservations: 'Prenotazioni e sala',
  promotions: 'Promozioni e offerte',
  kds: 'Schermo cucina (KDS)',
  reviews: 'Recensioni dei clienti',
  analytics: 'Analisi e briefing IA',
  'supplier-orders': 'Ordinare dai propri fornitori',
  finances: 'Finanze e versamenti',
  pro: 'Passare a Pro',

  '-- supplier': { type: 'separator', title: cat('local_shipping', 'Fornitori') },
  'espace-fournisseurs': { title: 'Inizia qui', display: 'hidden', theme: { toc: false } },
  supplier: 'Vendere le proprie forniture',
  'supplier-catalog': 'Catalogo, zone e ordini',

  '-- franchise': { type: 'separator', title: cat('hub', 'Franchising') },
  'espace-franchises': { title: 'Inizia qui', display: 'hidden', theme: { toc: false } },
  'parcours-franchise': { title: 'Percorso: avviare un franchising', display: 'hidden' },
  franchise: 'Il franchising su Grubano',
  'franchise-operations': 'Gestire la propria rete',

  '-- creators': { type: 'separator', title: cat('restaurant_menu', 'Creatori') },
  creators: 'Creatore di ricette',

  '-- affiliate': { type: 'separator', title: cat('link', 'Affiliati') },
  affiliate: 'Programma di affiliazione',

  '-- influencer': { type: 'separator', title: cat('campaign', 'Influencer') },
  influencer: 'Diventare influencer',

  '-- driver': { type: 'separator', title: cat('two_wheeler', 'Rider') },
  'espace-livreurs': { title: 'Inizia qui', display: 'hidden', theme: { toc: false } },
  'parcours-livreur': { title: 'Percorso: diventare rider', display: 'hidden' },
  driver: 'Diventare rider e missioni',
  'driver-earnings': 'Compensi e prelievi',
  'driver-tracking': 'Tracciamento della consegna',

  '-- resources': { type: 'separator', title: cat('folder_open', 'Risorse') },
  'payments-security': 'Pagamenti e sicurezza',
} satisfies MetaRecord
