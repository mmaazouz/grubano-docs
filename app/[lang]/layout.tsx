import { Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
import { HtmlLangSync } from '@/components/HtmlLangSync'
import { LangSwitch } from '@/components/LangSwitch'
import { SiteFooter } from '@/components/SiteFooter'

// Per-locale UI labels for the Nextra theme chrome + our own header/footer.
const UI = {
  fr: {
    editLink: 'Modifier cette page',
    feedback: { content: 'Une question ?', labels: 'feedback' },
    toc: { title: 'Sur cette page', backToTop: 'Retour en haut' },
    searchPlaceholder: 'Rechercher…',
    searchEmpty: 'Aucun résultat',
    searchLoading: 'Chargement…',
    searchError: 'Échec du chargement de l’index de recherche.',
    home: 'Accueil',
  },
  en: {
    editLink: 'Edit this page',
    feedback: { content: 'Question?', labels: 'feedback' },
    toc: { title: 'On this page', backToTop: 'Back to top' },
    searchPlaceholder: 'Search…',
    searchEmpty: 'No results',
    searchLoading: 'Loading…',
    searchError: 'Failed to load the search index.',
    home: 'Home',
  },
} as const

type Lang = keyof typeof UI

// Header brand — orange G tile + "Grubano" + "Centre d'aide" tag.
const brand = (
  <span
    aria-label="Grubano — Centre d'aide"
    className="hd__brand"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', lineHeight: 1 }}
  >
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        background: '#FF6A1F',
        color: '#fff',
        fontWeight: 900,
        fontSize: 17,
        fontFamily: 'var(--gb-font-display), system-ui, sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(255, 106, 31, 0.35), 0 1px 2px rgba(0, 0, 0, 0.08)',
        flexShrink: 0,
      }}
    >
      G
    </span>
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
        docsRepositoryBase="https://github.com/mmaazouz/grubano-docs/tree/main"
        editLink={t.editLink}
        feedback={t.feedback}
        sidebar={{ defaultMenuCollapseLevel: 1 }}
        toc={t.toc}
      >
        <HtmlLangSync lang={lang} />
        {children}
      </Layout>
    </>
  )
}
