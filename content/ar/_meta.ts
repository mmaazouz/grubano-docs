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
  // hors sidebar (maquette) — atteignable depuis l'accueil « Pour bien démarrer »
  'getting-started': { title: 'اكتشف Grubano', display: 'hidden' },
  // pagination/timestamp Nextra désactivés : remplacés par les cartes
  // Précédent/Suivant + la meta « Mis à jour le » localisée (article-v5).
  guides: { title: "الأدلة", display: 'children', theme: { pagination: false, timestamp: false, copyPage: false } },
} satisfies MetaRecord
