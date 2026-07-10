import type { MetaRecord } from 'nextra'

export default {
  index: {
    title: 'الرئيسية',
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
  'getting-started': 'اكتشف Grubano',
  // pagination/timestamp Nextra désactivés : remplacés par les cartes
  // Précédent/Suivant + la meta « Mis à jour le » localisée (article-v5).
  guides: { title: "الأدلة", theme: { pagination: false, timestamp: false, copyPage: false } },
} satisfies MetaRecord
