import type { MetaRecord } from 'nextra'

export default {
  index: {
    title: 'Accueil',
    type: 'page',
    // display:'hidden' removes the auto "Accueil" tab from the top navbar
    // (the custom hd__link "Accueil" on the right is the single home affordance,
    // matching accueil.html). The route stays; type:'page' keeps the full-width
    // landing layout.
    display: 'hidden',
    // Landing page — hide doc-page chrome that doesn't apply to a landing
    // (copy-page button, TOC + the feedback/edit-link that live inside it,
    // last-updated timestamp, prev/next pagination, breadcrumb).
    theme: {
      toc: false,
      copyPage: false,
      timestamp: false,
      pagination: false,
      breadcrumb: false,
    },
  },
  // hors sidebar (maquette) — atteignable depuis l'accueil « Pour bien démarrer »
  'getting-started': { title: 'Découvrir Grubano', display: 'hidden', theme: { toc: false, copyPage: false, timestamp: false, pagination: false } },
  // pagination/timestamp Nextra désactivés : remplacés par les cartes
  // Précédent/Suivant + la meta « Mis à jour le » localisée (article-v5).
  guides: { title: "Guides", display: 'children', theme: { pagination: false, timestamp: false, copyPage: false } },
  api: 'API Reference',
  changelog: 'Changelog',
} satisfies MetaRecord
