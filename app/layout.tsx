import { Layout, Navbar, Footer } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: {
    template: '%s – Grubano Docs',
    default: 'Grubano Documentation',
  },
  description: 'Documentation officielle de Grubano — la plateforme de gestion de dark kitchens multi-marques.',
  metadataBase: new URL('https://docs.grubano.com'),
}

const logo = (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#E8593C" />
      <text x="5" y="20" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="bold" fill="white">G</text>
    </svg>
    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#E8593C' }}>Grubano</span>
    <span style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.05em', textTransform: 'uppercase' }}>docs</span>
  </div>
)

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap()

  const navbar = (
    <Navbar
      logo={logo}
      projectLink="https://github.com/mmaazouz/grubano-docs"
    />
  )

  const footer = (
    <Footer>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
        © {new Date().getFullYear()} Grubano — Tous droits réservés
      </p>
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
