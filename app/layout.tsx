import 'nextra-theme-docs/style.css'
import './globals.css'
import type { ReactNode } from 'react'
import { Gabarito, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'

// Self-hosted brand fonts via next/font: at build time Next.js downloads the
// woff2 files, serves them from the same origin as the app, and exposes each
// font-family under a stable CSS custom property. No external Google Fonts
// request at runtime — CSP-friendly.
const fontDisplay = Gabarito({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--gb-font-display',
  display: 'swap',
})

const fontUi = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--gb-font-ui',
  display: 'swap',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--gb-font-mono',
  display: 'swap',
})

export const metadata = {
  title: {
    template: '%s – Centre d’aide Grubano',
    default: 'Centre d’aide Grubano',
  },
  description: "Centre d'aide officiel de Grubano — commander, vendre, gérer, livrer.",
  metadataBase: new URL('https://docs.grubano.com'),
  // File-based icon convention (app/favicon.ico + app/icon.svg + app/apple-icon.png).
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const fontVars = `${fontDisplay.variable} ${fontUi.variable} ${fontMono.variable}`
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning className={fontVars}>
      <head>
        {/* Material Symbols Rounded — icon ligature font used by the design.
            TODO: self-host to remove the last external font request once we
            introduce a CSP header on docs.grubano.com. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,0&display=block"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
