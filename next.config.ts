import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
})

export default withNextra({
  reactStrictMode: true,
  // Pin the workspace root so file tracing ignores stray lockfiles in parent dirs.
  outputFileTracingRoot: __dirname,
  // Static export for o2switch FTP deploy (no Node runtime on the docs subdomain).
  // Producing ./out with one HTML per route. trailingSlash keeps Apache happy with
  // /foo/ → /foo/index.html. images.unoptimized is mandatory for `output: 'export'`.
  // I18n is handled via Nextra's content/<locale>/ folder convention — NOT via
  // Next.js native i18n routing, which is incompatible with `output: 'export'`.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
})
