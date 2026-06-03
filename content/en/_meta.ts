import type { MetaRecord } from 'nextra'

export default {
  index: {
    title: 'Home',
    type: 'page',
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
  guides: 'Guides',
  api: 'API Reference',
  changelog: 'Changelog',
} satisfies MetaRecord
