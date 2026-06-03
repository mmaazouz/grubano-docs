import { Layout, Navbar, Footer } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: {
    template: '%s – Grubano Docs',
    default: 'Grubano Documentation',
  },
  description: 'Documentation officielle de Grubano — la plateforme de gestion de dark kitchens multi-marques.',
  metadataBase: new URL('https://docs.grubano.com'),
}

// Grubano docs logo: rounded orange tile with a bold white "G",
// followed by the "grubano" wordmark (navy/ink, semibold) and a muted "docs" tag.
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
        boxShadow:
          '0 2px 6px rgba(249, 115, 22, 0.35), 0 1px 2px rgba(0, 0, 0, 0.08)',
        flexShrink: 0,
      }}
    >
      G
    </span>
    <span
      className="grubano-logo__wordmark"
      style={{ fontSize: '1.05rem' }}
    >
      grubano
    </span>
    <span
      className="grubano-logo__badge"
      style={{ fontSize: '0.95rem' }}
    >
      docs
    </span>
  </span>
)

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap()

  const navbar = (
    <Navbar
      logo={logo}
      projectLink="https://github.com/mmaazouz/grubano-docs"
    >
      {/* Quick link back to the main Grubano site */}
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
        Site principal ↗
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
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          footer={footer}
          docsRepositoryBase="https://github.com/mmaazouz/grubano-docs/tree/main"
          editLink="Modifier cette page"
          feedback={{ content: 'Une question ?', labels: 'feedback' }}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          toc={{ title: 'Sur cette page', backToTop: 'Retour en haut' }}
          themeSwitch={{ dark: 'Sombre', light: 'Clair', system: 'Système' }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
