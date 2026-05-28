import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
})

export default withNextra({
  reactStrictMode: true,
  // Pin the workspace root so file tracing ignores stray lockfiles in parent dirs.
  outputFileTracingRoot: __dirname,
})
