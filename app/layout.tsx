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

// Root layout — intentionally minimal. The Nextra theme (sidebar, navbar,
// footer, page map) lives in app/[lang]/layout.tsx so it can read the active
// locale from params. The html `lang`/`dir` attributes default to French here;
// per-locale overrides happen client-side from app/[lang]/layout.tsx since
// Next.js does not allow nested layouts to mutate the html element.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
