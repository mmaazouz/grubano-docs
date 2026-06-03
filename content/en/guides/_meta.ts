import type { MetaRecord } from 'nextra'

export default {
  '-- restaurant': {
    type: 'separator',
    title: 'Restaurant operator',
  },
  restaurant: 'Dashboard',
  menu: 'Menu & AI scan',
  stocks: 'Stock management',
  loyalty: 'Loyalty program',
  reservations: 'Reservations',
  pro: 'Go Pro',
  '-- consumer': {
    type: 'separator',
    title: 'Consumer',
  },
  consumer: 'Order & track',
  '-- partners': {
    type: 'separator',
    title: 'Partners',
  },
  franchise: 'Franchise',
  creators: 'Creators',
} satisfies MetaRecord
