import type { MetaRecord } from 'nextra'

export default {
  index: {
    title: 'Home',
    type: 'page',
    // display:'hidden' removes the auto "Home" tab from the top navbar
    // (the custom hd__link on the right is the single home affordance).
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
  'getting-started': 'Quick start',
  // pagination/timestamp Nextra désactivés : remplacés par les cartes
  // Précédent/Suivant + la meta « Mis à jour le » localisée (article-v5).
  guides: { title: "Guides", theme: { pagination: false, timestamp: false, copyPage: false } },
  api: 'API Reference',
  changelog: 'Changelog',
} satisfies MetaRecord
