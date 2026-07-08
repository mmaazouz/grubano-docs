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
  // Material Symbols Rounded is now self-hosted via @font-face in globals.css
  // (public/fonts/material-symbols-rounded.woff2) — no external font request.
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning className={fontVars}>
      <body>{children}</body>
    </html>
  )
}
