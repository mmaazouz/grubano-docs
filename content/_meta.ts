import type { MetaRecord } from 'nextra'

export default {
  index: {
    title: 'Accueil',
    type: 'page',
  },
  'getting-started': {
    title: 'Démarrage rapide',
  },
  guides: {
    title: 'Guides',
    type: 'menu',
  },
  api: {
    title: 'API Reference',
    type: 'menu',
  },
  changelog: {
    title: 'Changelog',
  },
} satisfies MetaRecord
