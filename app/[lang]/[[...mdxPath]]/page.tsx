import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { getPageMap } from 'nextra/page-map'
import * as fsSync from 'fs'
import * as path from 'path'
import { useMDXComponents } from '@/mdx-components'
import { AppCTA } from '@/components/AppCTA'
import { Feedback, PrevNext } from '@/components/ArticleV5'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { FEATURE_PAGES, TOPIC_EXTRAS } = require('@/scripts/feature-pages.config.js') as {
  FEATURE_PAGES: Record<string, { docPath?: string; locale?: string }>
  TOPIC_EXTRAS: Record<string, { cta?: { title: string; body: string } }>
}

/** CTA contextuel du topic dont la fiche FR répond à ce slug (fidélité pt 9). */
function ctaForSlug(slug: string): { title: string; body: string } | undefined {
  for (const [key, cfg] of Object.entries(FEATURE_PAGES)) {
    if (cfg.docPath?.split('/').pop() === slug) return TOPIC_EXTRAS[key]?.cta
  }
  return undefined
}

type TocEntry = { value: string; id: string; depth: number }

/**
 * Sommaire fidèle à la maquette : « Sur cette page » liste les EYEBROWS
 * courts (Aperçu, L'essentiel, …), à plat — pas les titres H2 longs ni les
 * H3. On lit le MDX brut pour apparier chaque H2 à l'eyebrow qui le précède,
 * puis on remplace le libellé dans le toc Nextra (les ancres H2 restent).
 * Fallback : pages sans eyebrows (éditorial) → titres H2 d'origine, à plat.
 */
function eyebrowToc(lang: string, mdxPath: string[], toc: TocEntry[]): TocEntry[] {
  const file = path.join(process.cwd(), 'content', lang, ...mdxPath) + '.mdx'
  let map: Record<string, string> = {}
  try {
    const src = fsSync.readFileSync(file, 'utf8')
    for (const m of src.matchAll(/<Eyebrow[^>]*>([^<]+)<\/Eyebrow>\s*\n+##\s+(.+)/g)) {
      map[m[2].trim()] = m[1].trim()
    }
  } catch {
    /* fichier introuvable (route virtuelle) — toc inchangé */
  }
  return (toc || [])
    .filter((t) => t.depth === 2)
    .map((t) => ({ ...t, value: map[String(t.value).trim()] ?? t.value }))
}

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
  // Landings « Démarrer ici » (espace-*) : pas de rail bas — ce sont des
  // sommaires d'espace, pas des articles (le CTA/feedback/prev-next y serait
  // du bruit).
  const slug0 = params.mdxPath?.[1] ?? ''
  const isGuidePage =
    (params.mdxPath?.[0] ?? '') === 'guides' &&
    (params.mdxPath?.length ?? 0) > 1 &&
    !slug0.startsWith('espace-')
  let bottomContent = undefined
  if (isGuidePage) {
    const order = await guidesOrder(params.lang)
    const slug = params.mdxPath![1]
    const idx = order.findIndex((o) => o.name === slug)
    const prev = idx > 0 ? order[idx - 1] : null
    const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
    // Libellé CTA contextuel (FR uniquement tant que les traductions sont
    // gelées ; les autres locales gardent le libellé générique localisé).
    const cta = params.lang === 'fr' ? ctaForSlug(slug) : undefined
    bottomContent = (
      <>
        <AppCTA lang={params.lang} title={cta?.title} body={cta?.body} />
        <Feedback />
        <PrevNext prev={prev} next={next} />
      </>
    )
  }

  // Sommaire maquette : eyebrows courts, à plat (guides uniquement — la home
  // et les landings n'ont pas de TOC).
  const finalToc = (isGuidePage
    ? eyebrowToc(params.lang, params.mdxPath!, toc as unknown as TocEntry[])
    : toc) as typeof toc

  return (
    <Wrapper
      toc={finalToc}
      metadata={metadata}
      sourceCode={sourceCode}
      bottomContent={bottomContent}
    >
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
