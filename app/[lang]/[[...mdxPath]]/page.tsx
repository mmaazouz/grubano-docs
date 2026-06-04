import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents } from '@/mdx-components'
import { AppCTA } from '@/components/AppCTA'

// Generate every (lang, mdxPath) tuple from content/<lang>/** at build time.
// `output: 'export'` requires every dynamic route to be statically enumerated.
export const generateStaticParams = generateStaticParamsFor('mdxPath', 'lang')

export async function generateMetadata(props: {
  params: Promise<{ lang: string; mdxPath?: string[] }>
}) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath, params.lang)
  return metadata
}

const { wrapper: Wrapper } = useMDXComponents()

export default async function Page(props: {
  params: Promise<{ lang: string; mdxPath?: string[] }>
}) {
  const params = await props.params
  const result = await importPage(params.mdxPath, params.lang)
  const { default: MDXContent, toc, metadata, sourceCode } = result

  // Inject the "Open in Grubano" CTA at the bottom of every guide page.
  // Detection is by URL shape, not file path: any route under /guides/.
  // EXCEPT generated feature pages (frontmatter `generated: true`): those
  // already render their own richer block-7 strategic CTA per the template,
  // so the wrapper-injected card would be redundant noise.
  const isGuidePage = (params.mdxPath?.[0] ?? '') === 'guides'
  const isGenerated = (metadata as { generated?: boolean })?.generated === true
  const bottomContent =
    isGuidePage && !isGenerated ? <AppCTA lang={params.lang} /> : undefined

  return (
    <Wrapper
      toc={toc}
      metadata={metadata}
      sourceCode={sourceCode}
      bottomContent={bottomContent}
    >
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
