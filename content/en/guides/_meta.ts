import { createElement as h } from 'react'
import type { MetaRecord } from 'nextra'

// Séparateur de catégorie avec icône Material (maquette .side__gh)
const cat = (icon: string, label: string) =>
  h('span', { className: 'sb-cat' }, h('span', { className: 'ms sb-cat__ic' }, icon), h('span', { className: 'sb-cat__t' }, label))

// Sidebar order = catalogue v5 (per audience). Mirrors content/fr/guides/_meta.ts.
export default {
  '-- clients': { type: 'separator', title: cat('restaurant', 'Customers') },
  consumer: 'Order & track',
  'consumer-loyalty': 'Loyalty & referral',
  'consumer-account': 'My account',

  '-- restaurant': { type: 'separator', title: cat('storefront', 'Restaurants') },
  'quick-start': 'Get started in 15 minutes',
  restaurant: 'Dashboard',
  menu: 'Menu & AI Scan',
  stocks: 'Stock management',
  loyalty: 'Loyalty program',
  reservations: 'Reservations & dine-in',
  finances: 'Finances & payouts',
  pro: 'Go Pro',

  '-- supplier': { type: 'separator', title: cat('local_shipping', 'Suppliers') },
  supplier: 'Sell your supplies',
  'supplier-catalog': 'Catalog, zones & orders',

  '-- franchise': { type: 'separator', title: cat('hub', 'Franchisees') },
  franchise: 'Franchising on Grubano',
  'franchise-operations': 'Run your network',

  '-- creators': { type: 'separator', title: cat('restaurant_menu', 'Creators') },
  creators: 'Recipe creator',

  '-- affiliate': { type: 'separator', title: cat('link', 'Affiliates') },
  affiliate: 'Affiliate program',

  '-- influencer': { type: 'separator', title: cat('campaign', 'Influencers') },
  influencer: 'Become an influencer',

  '-- driver': { type: 'separator', title: cat('two_wheeler', 'Couriers') },
  driver: 'Become a courier & missions',
  'driver-earnings': 'Earnings & withdrawals',
  'driver-tracking': 'Ride tracking',

  '-- resources': { type: 'separator', title: cat('folder_open', 'Resources') },
  'payments-security': 'Payments & security',
} satisfies MetaRecord
