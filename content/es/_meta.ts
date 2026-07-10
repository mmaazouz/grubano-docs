import type { MetaRecord } from 'nextra'

export default {
  index: {
    title: 'Inicio',
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
  'getting-started': 'Descubrir Grubano',
  // pagination/timestamp Nextra désactivés : remplacés par les cartes
  // Précédent/Suivant + la meta « Mis à jour le » localisée (article-v5).
  guides: { title: "Guías", theme: { pagination: false, timestamp: false, copyPage: false } },
} satisfies MetaRecord
