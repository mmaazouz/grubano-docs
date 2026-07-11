'use client'

import { usePathname } from 'next/navigation'

/**
 * Lien de droite du header, fidèle aux maquettes CD :
 *  - ACCUEIL (accueil.html) : « Retour à l'app » avec flèche arrow_back,
 *    vers l'application publique.
 *  - ARTICLES (article.html) : RIEN — le header article = logo + Centre
 *    d'aide + recherche + langue (le logo ramène déjà à l'accueil).
 */

const LABELS: Record<string, string> = {
  fr: 'Retour à l’app',
  en: 'Back to the app',
  es: 'Volver a la app',
  ar: 'العودة إلى التطبيق',
  it: 'Torna all’app',
}

export function HeaderAppLink({ lang = 'fr' }: { lang?: string }) {
  const pathname = usePathname() || '/'
  const isHome = /^\/([a-z]{2})\/?$/.test(pathname) || pathname === '/'
  if (!isHome) return null
  const label = LABELS[lang] ?? LABELS.fr
  return (
    <a className="hd__link" href="https://www.grubano.com" aria-label={label}>
      <span className="ms flip-rtl">arrow_back</span>
      <span>{label}</span>
    </a>
  )
}
