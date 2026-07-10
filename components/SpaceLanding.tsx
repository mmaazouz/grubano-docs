import type { ReactNode } from 'react'

/**
 * SpaceLanding — blocs des pages « Démarrer ici » d'espace, alignés sur la
 * maquette CD landing-espace (sp-hero / grp / art-card). Classes avsp-*
 * stylées dans app/article-v5.css. Server components, zéro JS client.
 */

export function SpaceHero({
  icon,
  title,
  children,
}: {
  icon: string
  title: string
  children?: ReactNode
}) {
  return (
    <header className="avsp-hero">
      <span className="avsp-hero__ic"><span className="ms">{icon}</span></span>
      <div className="avsp-hero__m">
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </header>
  )
}

export function ActionGroup({
  icon,
  title,
  count,
  children,
}: {
  icon: string
  title: string
  count?: number
  children?: ReactNode
}) {
  return (
    <section className="avsp-grp">
      <div className="avsp-grp__h">
        <span className="ms">{icon}</span>
        <h2>{title}</h2>
        {typeof count === 'number' && <span className="avsp-grp__n">{count}</span>}
      </div>
      {children}
    </section>
  )
}

export function ActionCards({
  items = [],
}: {
  items?: { icon: string; title: string; sub?: string; href: string }[]
}) {
  return (
    <div className="avsp-cards">
      {items.map((it, i) => (
        <a className="avsp-card" href={it.href} key={i}>
          <span className="avsp-card__ic"><span className="ms">{it.icon}</span></span>
          <div className="avsp-card__m">
            <b>{it.title}</b>
            {it.sub && <span>{it.sub}</span>}
          </div>
          <span className="ms flip-rtl">arrow_forward</span>
        </a>
      ))}
    </div>
  )
}
