import { Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
import { HtmlLangSync } from '@/components/HtmlLangSync'
import { LangSwitch } from '@/components/LangSwitch'
import { SiteFooter } from '@/components/SiteFooter'

// Per-locale UI labels for our own header/footer + the minimal Nextra chrome
// we keep (search + TOC title). editLink / feedback are intentionally NOT
// configured — those Nextra TOC affordances are absent from the CD mockups.
const UI = {
  fr: {
    toc: { title: 'Sur cette page', backToTop: 'Retour en haut' },
    searchPlaceholder: 'Rechercher…',
    searchEmpty: 'Aucun résultat',
    searchLoading: 'Chargement…',
    searchError: 'Échec du chargement de l’index de recherche.',
    home: 'Accueil',
  },
  en: {
    toc: { title: 'On this page', backToTop: 'Back to top' },
    searchPlaceholder: 'Search…',
    searchEmpty: 'No results',
    searchLoading: 'Loading…',
    searchError: 'Failed to load the search index.',
    home: 'Home',
  },
} as const

type Lang = keyof typeof UI

// Header brand — official Grubano symbol (gradient leaf-G) + wordmark + tag,
// matching accueil.html's hd__brand block exactly.
const brand = (
  <span
    aria-label="Grubano — Centre d'aide"
    className="hd__brand"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', lineHeight: 1 }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/grubano-symbol.svg"
      alt="Grubano"
      height={26}
      style={{ height: 26, width: 'auto', flexShrink: 0, display: 'block' }}
    />
    <b className="grubano-logo__wordmark" style={{ fontSize: '1.05rem' }}>Grubano</b>
    <span className="grubano-logo__badge" style={{ fontSize: '0.78rem' }}>Centre d’aide</span>
  </span>
)

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const langKey: Lang = lang === 'en' ? 'en' : 'fr'
  const t = UI[langKey]

  const pageMap = await getPageMap(`/${lang}`)

  const search = (
    <Search
      placeholder={t.searchPlaceholder}
      emptyResult={t.searchEmpty}
      loading={t.searchLoading}
      errorText={t.searchError}
    />
  )

  // Navbar — logo left, search middle (from Layout's search prop),
  // then children on the right: "Accueil" link + custom LangSwitch.
  // No projectLink (removes GitHub icon), no i18n (removes Nextra's
  // LocaleSwitch — replaced by our LangSwitch). Theme switch hidden
  // via CSS.
  const navbar = (
    <Navbar logo={brand}>
      <a href={`/${lang}/`} className="hd__link" aria-label={t.home}>
        <span className="ms">home</span>
        <span>{t.home}</span>
      </a>
      <LangSwitch />
    </Navbar>
  )

  const footer = <SiteFooter locale={lang} />

  return (
    <>
      <Head />
      <Layout
        navbar={navbar}
        pageMap={pageMap}
        footer={footer}
        search={search}
        // No docsRepositoryBase / editLink / feedback: the "Modifier cette page"
        // and "Une question ?" TOC links are Nextra chrome absent from the CD
        // mockups (and would re-expose a GitHub URL — kept for a future /dev/).
        editLink={null}
        feedback={{ content: null }}
        sidebar={{ defaultMenuCollapseLevel: 1 }}
        toc={t.toc}
      >
        <HtmlLangSync lang={lang} />
        {children}
      </Layout>
    </>
  )
}
