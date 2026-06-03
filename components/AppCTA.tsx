import type { ReactNode } from 'react'

/**
 * "Ouvrir dans Grubano" CTA card, mounted at the bottom of guide pages by
 * app/[lang]/[[...mdxPath]]/page.tsx via the wrapper's `bottomContent` slot.
 *
 * Cible: la home publique du site applicatif (https://www.grubano.com).
 * Pas de deep-link par page tant que les vraies routes app ne sont pas
 * confirmées et publiées dans docs-map.json (champ `app`).
 *
 * Locale-aware: French / English label tables only — es/ar/it land later.
 * Pure server component, zero client JS, no new deps.
 */

const COPY = {
  fr: {
    title: 'Prêt à passer à la pratique ?',
    body: 'Retrouvez ce que vous venez de lire dans votre tableau de bord Grubano.',
    cta: 'Ouvrir dans Grubano',
  },
  en: {
    title: 'Ready to put it into practice?',
    body: 'Find what you just read inside your Grubano dashboard.',
    cta: 'Open in Grubano',
  },
} as const

type Lang = keyof typeof COPY

export function AppCTA({ lang }: { lang: string }): ReactNode {
  const t = (COPY as Record<string, (typeof COPY)[Lang]>)[lang] ?? COPY.fr

  return (
    <aside className="grubano-app-cta" aria-label={t.cta}>
      <div className="grubano-app-cta__inner">
        <div className="grubano-app-cta__text">
          <p className="grubano-app-cta__title">{t.title}</p>
          <p className="grubano-app-cta__body">{t.body}</p>
        </div>
        <a
          href="https://www.grubano.com"
          target="_blank"
          rel="noopener noreferrer"
          className="grubano-app-cta__link"
        >
          {t.cta} <span aria-hidden="true">→</span>
        </a>
      </div>
    </aside>
  )
}
