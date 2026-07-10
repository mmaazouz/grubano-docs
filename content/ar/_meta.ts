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
  guides: 'الأدلة',
} satisfies MetaRecord
