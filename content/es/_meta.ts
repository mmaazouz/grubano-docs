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
  guides: 'Guías',
} satisfies MetaRecord
