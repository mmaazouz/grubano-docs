'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LEARNING_PATHS, readProgress } from '@/lib/learning-paths'

/**
 * LearningPath — parcours guidé (maquette CD parcours-guide) avec PROGRESSION
 * DYNAMIQUE : la lecture réelle (localStorage, sans compte) prime sur les
 * status statiques des props MDX. Terminé = vert basil ✓ ; le premier article
 * non terminé = « EN COURS » ; barre et compteur X/N suivent. Le rendu
 * serveur affiche les props (fallback sans JS) puis s'hydrate depuis le
 * navigateur — y compris quand un autre onglet marque un article (storage).
 */

type Step = { title: string; note?: string; status?: 'done' | 'current' | 'todo'; href?: string }

const slugOf = (href?: string) => href?.match(/\/guides\/([^/]+)\/?$/)?.[1] ?? ''

export function LearningPath({
  title,
  subtitle,
  meta = [],
  steps = [],
}: {
  title?: string
  subtitle?: string
  meta?: { icon: string; text: string }[]
  steps?: Step[]
}) {
  const pathname = usePathname() || ''
  // slug du parcours : dérivé de l'URL de la page (parcours-<slug>)
  const pathSlug = pathname.match(/parcours-([a-z-]+)\/?$/)?.[1] ?? ''
  const tracked = Boolean(LEARNING_PATHS[pathSlug])

  const [doneSlugs, setDoneSlugs] = useState<string[] | null>(null)
  useEffect(() => {
    if (!tracked) return
    const sync = () => setDoneSlugs(readProgress(pathSlug))
    sync()
    window.addEventListener('grubano-path-progress', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('grubano-path-progress', sync)
      window.removeEventListener('storage', sync)
    }
  }, [pathSlug, tracked])

  // status effectifs : localStorage (une fois lu) sinon props (SSR/fallback)
  let effective: Step[] = steps
  if (tracked && doneSlugs !== null) {
    let currentAssigned = false
    effective = steps.map((s) => {
      const done = doneSlugs.includes(slugOf(s.href))
      if (done) return { ...s, status: 'done' as const }
      if (!currentAssigned) {
        currentAssigned = true
        return { ...s, status: 'current' as const }
      }
      return { ...s, status: 'todo' as const }
    })
  }

  const done = effective.filter((s) => s.status === 'done').length
  const pct = effective.length ? Math.round((done / effective.length) * 100) : 0
  const next = effective.find((s) => s.status === 'current') || effective.find((s) => s.status === 'todo')

  return (
    <aside className="gbv-lp">
      <div className="gbv-lp__hero">
        <span className="gbv-lp__eyebrow"><span className="ms">rocket_launch</span>Parcours guidé</span>
        {title && <h3>{title}</h3>}
        {subtitle && <p>{subtitle}</p>}
        {meta.length > 0 && (
          <div className="gbv-lp__meta">
            {meta.map((m, i) => (
              <span className="gbv-lp__it" key={i}><span className="ms">{m.icon}</span>{m.text}</span>
            ))}
          </div>
        )}
        <div className="gbv-lp__prog">
          <div className="gbv-lp__prog-top"><span>Votre progression</span><span>{done} / {effective.length} terminé</span></div>
          <div className="gbv-lp__bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
      </div>
      <div className="gbv-lp__steps">
        {effective.map((s, i) => {
          const st = s.status || 'todo'
          const Tag = (s.href ? 'a' : 'div') as 'a'
          return (
            <Tag className={`gbv-lp__step gbv-lp__step--${st}`} href={s.href} key={i}>
              <span className="gbv-lp__dot">
                {st === 'done' ? <span className="ms">check</span> : i + 1}
              </span>
              <div className="gbv-lp__m">
                <b>{s.title}</b>
                {s.note && <span><span className="ms">schedule</span>{s.note}</span>}
              </div>
              {st !== 'todo' && (
                <span className={`gbv-lp__badge gbv-lp__badge--${st}`}>{st === 'done' ? 'Terminé' : 'En cours'}</span>
              )}
              <span className="ms gbv-lp__go flip-rtl">arrow_forward</span>
            </Tag>
          )
        })}
      </div>
      {next && (
        <div className="gbv-lp__foot">
          <div className="gbv-lp__foot-m">Prochaine étape : <b>{next.title}</b></div>
        </div>
      )}
    </aside>
  )
}
