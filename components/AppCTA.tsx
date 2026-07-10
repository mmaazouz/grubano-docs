import type { ReactNode } from 'react'

/**
 * CTA « Ouvrir dans Grubano » — dégradé ink + halo zest, aligné sur le bloc
 * .cta de docs/article-v5.html. Monté en bas de chaque page de guide par
 * app/[lang]/[[...mdxPath]]/page.tsx via le slot bottomContent.
 *
 * Cible : la home publique (https://www.grubano.com) — pas de deep-link tant
 * que les routes app ne sont pas publiées dans docs-map.json (champ `app`).
 * Server component, zéro JS client.
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
  es: {
    title: '¿Listo para ponerlo en práctica?',
    body: 'Encuentre lo que acaba de leer en su panel de Grubano.',
    cta: 'Abrir en Grubano',
  },
  ar: {
    title: 'جاهز للتطبيق؟',
    body: 'اعثر على ما قرأته للتو في لوحة تحكم Grubano الخاصة بك.',
    cta: 'افتح في Grubano',
  },
  it: {
    title: 'Pronto a metterlo in pratica?',
    body: 'Ritrova ciò che hai appena letto nel tuo pannello Grubano.',
    cta: 'Apri in Grubano',
  },
} as const

type Lang = keyof typeof COPY

export function AppCTA({ lang }: { lang: string }): ReactNode {
  const t = (COPY as Record<string, (typeof COPY)[Lang]>)[lang] ?? COPY.fr

  return (
    <aside className="av-cta" aria-label={t.cta}>
      <div className="av-cta__m">
        <b>{t.title}</b>
        <span>{t.body}</span>
      </div>
      <a
        className="av-cta__btn"
        href="https://www.grubano.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="ms" aria-hidden="true">open_in_new</span>
        {t.cta}
      </a>
    </aside>
  )
}
