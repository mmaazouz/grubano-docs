import { Layout, Navbar, Footer } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'

// Per-locale UI labels for the Nextra theme chrome.
const UI = {
  fr: {
    editLink: 'Modifier cette page',
    feedback: { content: 'Une question ?', labels: 'feedback' },
    toc: { title: 'Sur cette page', backToTop: 'Retour en haut' },
    themeSwitch: { dark: 'Sombre', light: 'Clair', system: 'Système' },
    mainSite: 'Site principal ↗',
  },
  en: {
    editLink: 'Edit this page',
    feedback: { content: 'Question?', labels: 'feedback' },
    toc: { title: 'On this page', backToTop: 'Back to top' },
    themeSwitch: { dark: 'Dark', light: 'Light', system: 'System' },
    mainSite: 'Main site ↗',
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
        background: '#F97316',
        color: '#fff',
        fontWeight: 800,
        fontSize: 17,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(249, 115, 22, 0.35), 0 1px 2px rgba(0, 0, 0, 0.08)',
        flexShrink: 0,
      }}
    >
      G
    </span>
    <span className="grubano-logo__wordmark" style={{ fontSize: '1.05rem' }}>
      grubano
    </span>
    <span className="grubano-logo__badge" style={{ fontSize: '0.95rem' }}>
      docs
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
        docsRepositoryBase="https://github.com/mmaazouz/grubano-docs/tree/main"
        editLink={t.editLink}
        feedback={t.feedback}
        sidebar={{ defaultMenuCollapseLevel: 1 }}
        toc={t.toc}
        themeSwitch={t.themeSwitch}
      >
        {children}
      </Layout>
    </>
  )
}
