import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { getPageMap } from 'nextra/page-map'
import { useMDXComponents } from '@/mdx-components'
import { AppCTA } from '@/components/AppCTA'
import { Feedback, PrevNext } from '@/components/ArticleV5'

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

/** Flat ordered list of guide pages (separators skipped) from the page map,
 *  to drive the Précédent / Suivant cards with LOCALIZED sidebar titles. */
async function guidesOrder(lang: string): Promise<{ title: string; href: string; name: string }[]> {
  const pageMap = await getPageMap(`/${lang}`)
  type Item = { name?: string; route?: string; title?: string; children?: Item[]; type?: string }
  const guides = (pageMap as Item[]).find((i) => i.name === 'guides')
  if (!guides?.children) return []
  return guides.children
    .filter((c) => c.route && c.name && !c.name.startsWith('--'))
    .map((c) => ({ title: c.title || c.name!, href: c.route!.endsWith('/') ? c.route! : `${c.route}/`, name: c.name! }))
}

export default async function Page(props: {
  params: Promise<{ lang: string; mdxPath?: string[] }>
}) {
  const params = await props.params
  const result = await importPage(params.mdxPath, params.lang)
  const { default: MDXContent, toc, metadata, sourceCode } = result

  // Bottom rail of every guide article (article-v5 order): CTA « Ouvrir dans
  // Grubano » → feedback Oui/Non → cartes Précédent / Suivant. Nextra's own
  // pagination + « Last updated » are disabled via the guides _meta theme.
  const isGuidePage = (params.mdxPath?.[0] ?? '') === 'guides' && (params.mdxPath?.length ?? 0) > 1
  let bottomContent = undefined
  if (isGuidePage) {
    const order = await guidesOrder(params.lang)
    const slug = params.mdxPath![1]
    const idx = order.findIndex((o) => o.name === slug)
    const prev = idx > 0 ? order[idx - 1] : null
    const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
    bottomContent = (
      <>
        <AppCTA lang={params.lang} />
        <Feedback />
        <PrevNext prev={prev} next={next} />
      </>
    )
  }

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
