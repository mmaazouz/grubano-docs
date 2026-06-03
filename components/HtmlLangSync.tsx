'use client'

import { useEffect } from 'react'

/**
 * Keeps the <html> `lang` and `dir` attributes in sync with the active locale.
 *
 * The root layout (app/layout.tsx) renders <html lang="fr" dir="ltr"> as a
 * static default, because Next.js does not allow nested layouts to mutate the
 * <html> element. This component runs client-side from app/[lang]/layout.tsx
 * and updates the attributes once the locale is known, which:
 *   - corrects the lang for screen readers / search engines on /en/* pages,
 *   - flips dir to "rtl" for RTL locales (ar, fa, he, ur) when those land.
 *
 * Pure DOM mutation, no React state — safe under static export.
 */
const RTL_LOCALES = new Set(['ar', 'fa', 'he', 'ur'])

export function HtmlLangSync({ lang }: { lang: string }) {
  useEffect(() => {
    const el = document.documentElement
    if (el.getAttribute('lang') !== lang) el.setAttribute('lang', lang)
    const dir = RTL_LOCALES.has(lang) ? 'rtl' : 'ltr'
    if (el.getAttribute('dir') !== dir) el.setAttribute('dir', dir)
  }, [lang])

  return null
}
