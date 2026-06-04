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
  // Icon discovery is handled by Next.js App Router via the file-based
  // convention: app/favicon.ico, app/icon.svg, app/apple-icon.png. Each is
  // served with a content-hashed URL (except favicon.ico which keeps the
  // standard /favicon.ico path), and Next.js auto-injects the matching
  // <link rel="icon" …> tags into <head> — so a stale browser cache picks
  // up the new icon on the next page load without a manual hard refresh.
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
