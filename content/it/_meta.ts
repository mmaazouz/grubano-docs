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
  guides: 'Guide',
} satisfies MetaRecord
