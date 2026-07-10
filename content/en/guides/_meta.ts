import type { MetaRecord } from 'nextra'

// Sidebar order = catalogue v5 (per audience). Mirrors content/fr/guides/_meta.ts.
export default {
  '-- clients': { type: 'separator', title: 'Customers' },
  consumer: 'Order & track',
  'consumer-loyalty': 'Loyalty & referral',
  'consumer-account': 'My account',

  '-- restaurant': { type: 'separator', title: 'Restaurants' },
  'quick-start': 'Get started in 15 minutes',
  restaurant: 'Dashboard',
  menu: 'Menu & AI Scan',
  stocks: 'Stock management',
  loyalty: 'Loyalty program',
  reservations: 'Reservations & dine-in',
  finances: 'Finances & payouts',
  pro: 'Go Pro',

  '-- supplier': { type: 'separator', title: 'Suppliers' },
  supplier: 'Sell your supplies',
  'supplier-catalog': 'Catalog, zones & orders',

  '-- franchise': { type: 'separator', title: 'Franchisees' },
  franchise: 'Franchising on Grubano',
  'franchise-operations': 'Run your network',

  '-- creators': { type: 'separator', title: 'Creators' },
  creators: 'Recipe creator',

  '-- affiliate': { type: 'separator', title: 'Affiliates' },
  affiliate: 'Affiliate program',

  '-- influencer': { type: 'separator', title: 'Influencers' },
  influencer: 'Become an influencer',

  '-- driver': { type: 'separator', title: 'Couriers' },
  driver: 'Become a courier & missions',
  'driver-earnings': 'Earnings & withdrawals',
  'driver-tracking': 'Ride tracking',

  '-- resources': { type: 'separator', title: 'Resources' },
  'payments-security': 'Payments & security',
  privacy: 'Privacy & data',
  legal: 'Legal notice & terms',
} satisfies MetaRecord
