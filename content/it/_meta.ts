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
  // hors sidebar (maquette) — atteignable depuis l'accueil « Pour bien démarrer »
  // Format ARTICLE (maquette discover v2) : TOC actif, pagination Nextra
  // remplacée par les cartes Précédent/Suivant custom (comme guides).
  'getting-started': { title: 'Scoprire Grubano', display: 'hidden', theme: { copyPage: false, timestamp: false, pagination: false } },
  // pagination/timestamp Nextra désactivés : remplacés par les cartes
  // Précédent/Suivant + la meta « Mis à jour le » localisée (article-v5).
  guides: { title: "Guide", display: 'children', theme: { pagination: false, timestamp: false, copyPage: false } },
} satisfies MetaRecord
