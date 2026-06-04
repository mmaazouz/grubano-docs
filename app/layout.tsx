import 'nextra-theme-docs/style.css'
import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: {
    template: '%s – Grubano Docs',
    default: 'Grubano Documentation',
  },
  description: 'Documentation officielle de Grubano — la marketplace qui reconnecte les restaurants locaux et leurs clients, avec une commission juste de 10 %.',
  metadataBase: new URL('https://docs.grubano.com'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
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
