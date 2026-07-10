import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  // Tells Nextra to prefix every page-map link with the active locale. Required
  // when running without middleware (i.e. with `output: 'export'`) so /fr/...
  // and /en/... URLs are correctly emitted into the static export.
  unstable_shouldAddLocaleToLinks: true,
})

export default withNextra({
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // i18n via Nextra's content/<locale>/ convention. Nextra reads `locales` and
  // `defaultLocale` here, then strips this `i18n` block so Next.js native i18n
  // routing — which is INCOMPATIBLE with output: 'export' — never activates.
  // All five locales carry real content since the GROS LOT étape E run
  // (guides + home + getting-started translated FR → en/es/ar/it).
  i18n: {
    locales: ['fr', 'en', 'es', 'ar', 'it'],
    defaultLocale: 'fr',
  },
})
