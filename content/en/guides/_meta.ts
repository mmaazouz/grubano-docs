import { createElement as h } from 'react'
import type { MetaRecord } from 'nextra'

// Séparateur de catégorie avec icône Material (maquette .side__gh)
const cat = (icon: string, label: string) =>
  h('span', { className: 'sb-cat' }, h('span', { className: 'ms sb-cat__ic' }, icon), h('span', { className: 'sb-cat__t' }, label))

// Sidebar order = catalogue v5 (per audience). Mirrors content/fr/guides/_meta.ts.
export default {
  '-- clients': { type: 'separator', title: cat('restaurant', 'Customers') },
  'espace-clients': { title: 'Start here', display: 'hidden', theme: { toc: false } },
  'parcours-client': { title: 'Journey: first order', display: 'hidden' },
  consumer: 'Order & track',
  'consumer-loyalty': 'Loyalty & referral',
  'consumer-account': 'My account',

  '-- restaurant': { type: 'separator', title: cat('storefront', 'Restaurants') },
  'espace-restaurateurs': { title: 'Start here', display: 'hidden', theme: { toc: false } },
  'parcours-restaurateur': { title: 'Journey: get started', display: 'hidden' },
  'quick-start': 'Get started in 15 minutes',
  restaurant: 'Dashboard',
  menu: 'Menu & AI Scan',
  stocks: 'Stock management',
  loyalty: 'Loyalty program',
  reservations: 'Reservations & dine-in',
  promotions: 'Promotions & offers',
  kds: 'Kitchen screen (KDS)',
  reviews: 'Customer reviews',
  analytics: 'Analytics & AI briefing',
  'supplier-orders': 'Ordering from your suppliers',
  finances: 'Finances & payouts',
  pro: 'Go Pro',

  '-- supplier': { type: 'separator', title: cat('local_shipping', 'Suppliers') },
  'espace-fournisseurs': { title: 'Start here', display: 'hidden', theme: { toc: false } },
  supplier: 'Sell your supplies',
  'supplier-catalog': 'Catalog, zones & orders',

  '-- franchise': { type: 'separator', title: cat('hub', 'Franchisees') },
  'espace-franchises': { title: 'Start here', display: 'hidden', theme: { toc: false } },
  'parcours-franchise': { title: 'Journey: launch a franchise', display: 'hidden' },
  franchise: 'Franchising on Grubano',
  'franchise-operations': 'Run your network',

  '-- creators': { type: 'separator', title: cat('restaurant_menu', 'Creators') },
  creators: 'Recipe creator',

  '-- affiliate': { type: 'separator', title: cat('link', 'Affiliates') },
  affiliate: 'Affiliate program',

  '-- influencer': { type: 'separator', title: cat('campaign', 'Influencers') },
  influencer: 'Become an influencer',

  '-- driver': { type: 'separator', title: cat('two_wheeler', 'Couriers') },
  'espace-livreurs': { title: 'Start here', display: 'hidden', theme: { toc: false } },
  'parcours-livreur': { title: 'Journey: become a courier', display: 'hidden' },
  driver: 'Become a courier & missions',
  'driver-earnings': 'Earnings & withdrawals',
  'driver-tracking': 'Ride tracking',

  '-- resources': { type: 'separator', title: cat('folder_open', 'Resources') },
  'payments-security': 'Payments & security',
} satisfies MetaRecord
