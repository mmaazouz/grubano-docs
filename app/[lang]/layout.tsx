import { Layout, Navbar, Footer } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
import { HtmlLangSync } from '@/components/HtmlLangSync'

// Languages exposed in the navbar dropdown. Order = display order.
// Only locales that have real content are listed; es/ar/it land in D3 once
// their content trees exist (LocaleSwitch would otherwise route users into
// 404s). When AR is added, HtmlLangSync flips <html dir> to rtl automatically.
const I18N = [
  { locale: 'fr', name: 'Français' },
  { locale: 'en', name: 'English' },
] as const

// Per-locale UI labels for the Nextra theme chrome.
const UI = {
  fr: {
    editLink: 'Modifier cette page',
    feedback: { content: 'Une question ?', labels: 'feedback' },
    toc: { title: 'Sur cette page', backToTop: 'Retour en haut' },
    themeSwitch: { dark: 'Sombre', light: 'Clair', system: 'Système' },
    mainSite: 'Site principal ↗',
    searchPlaceholder: 'Rechercher dans la documentation…',
    searchEmpty: 'Aucun résultat',
    searchLoading: 'Chargement…',
    searchError: 'Échec du chargement de l’index de recherche.',
  },
  en: {
    editLink: 'Edit this page',
    feedback: { content: 'Question?', labels: 'feedback' },
    toc: { title: 'On this page', backToTop: 'Back to top' },
    themeSwitch: { dark: 'Dark', light: 'Light', system: 'System' },
    mainSite: 'Main site ↗',
    searchPlaceholder: 'Search the documentation…',
    searchEmpty: 'No results',
    searchLoading: 'Loading…',
    searchError: 'Failed to load the search index.',
  },
} as const

type Lang = keyof typeof UI

// Grubano docs logo (unchanged from D2·a): rounded orange tile + wordmark + tag.
const logo = (
  <span
    aria-label="Grubano Docs"
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
    <span className="grubano-logo__wordmark" style={{ fontSize: '1.05rem' }}>
      Grubano
    </span>
    <span className="grubano-logo__badge" style={{ fontSize: '0.78rem' }}>
      Centre d’aide
    </span>
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

  // Locale-scoped page map → sidebar only lists pages for the active locale.
  const pageMap = await getPageMap(`/${lang}`)

  const search = (
    <Search
      placeholder={t.searchPlaceholder}
      emptyResult={t.searchEmpty}
      loading={t.searchLoading}
      errorText={t.searchError}
    />
  )

  const navbar = (
    <Navbar logo={logo} projectLink="https://github.com/mmaazouz/grubano-docs">
      <a
        href="https://www.grubano.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--grubano-ink)',
          padding: '0 0.5rem',
          whiteSpace: 'nowrap',
        }}
      >
        {t.mainSite}
      </a>
    </Navbar>
  )

  const footer = (
    <Footer>
      <span
        style={{
          width: '100%',
          textAlign: 'center',
          color: 'var(--grubano-muted)',
          fontSize: '0.85rem',
        }}
      >
        © {new Date().getFullYear()} Grubano · {' '}
        <a
          href="https://www.grubano.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit' }}
        >
          grubano.com
        </a>
      </span>
    </Footer>
  )

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
        themeSwitch={t.themeSwitch}
        i18n={[...I18N]}
      >
        <HtmlLangSync lang={lang} />
        {children}
      </Layout>
    </>
  )
}
