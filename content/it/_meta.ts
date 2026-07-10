import type { MetaRecord } from 'nextra'

export default {
  index: {
    title: 'Home',
    type: 'page',
    display: 'hidden',
    theme: {
      toc: false,
      copyPage: false,
      timestamp: false,
      pagination: false,
      breadcrumb: false,
    },
  },
  'getting-started': 'Scoprire Grubano',
  // pagination/timestamp Nextra désactivés : remplacés par les cartes
  // Précédent/Suivant + la meta « Mis à jour le » localisée (article-v5).
  guides: { title: "Guide", theme: { pagination: false, timestamp: false } },
} satisfies MetaRecord
