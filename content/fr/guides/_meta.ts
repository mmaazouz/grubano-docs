import type { MetaRecord } from 'nextra'

export default {
  '-- restaurant': {
    type: 'separator',
    title: 'Restaurateur',
  },
  'quick-start': 'Démarrer en 15 minutes',
  restaurant: 'Tableau de bord',
  menu: 'Menu & Scan IA',
  stocks: 'Gestion des stocks',
  loyalty: 'Programme fidélité',
  reservations: 'Réservations',
  pro: 'Passer en Pro',
  '-- consumer': {
    type: 'separator',
    title: 'Consommateur',
  },
  consumer: 'Commander & suivre',
  '-- partners': {
    type: 'separator',
    title: 'Partenaires',
  },
  franchise: 'Franchise',
  creators: 'Créateurs',
} satisfies MetaRecord
