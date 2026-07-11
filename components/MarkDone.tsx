'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LEARNING_PATHS, isDone, markDone, pathsContaining, readProgress, unmarkDone } from '@/lib/learning-paths'

/**
 * « Marquer comme terminé » — bande de fin d'article pour les fiches qui
 * appartiennent à un parcours guidé. Au clic : l'article passe « terminé »
 * (localStorage, sans compte), la bande confirme en vert basil et propose
 * l'article suivant du parcours. Re-cliquable pour annuler. FR uniquement
 * (les parcours n'existent qu'en français tant que les traductions sont
 * gelées).
 */

const PATH_LABELS: Record<string, string> = {
  restaurateur: 'Bien démarrer en tant que restaurateur',
  client: 'Votre première commande',
  livreur: 'Devenir livreur pas à pas',
  franchise: 'Lancer une franchise',
}

// titres des fiches (pour « Continuer : … ») — libellés sidebar FR
const STEP_TITLES: Record<string, string> = {
  'quick-start': 'Démarrer en 15 minutes',
  restaurant: 'Tableau de bord',
  menu: 'Menu & Scan IA',
  finances: 'Finances & versements',
  pro: 'Passer en Pro',
  'consumer-account': 'Mon compte',
  consumer: 'Commander & suivre',
  'consumer-loyalty': 'Fidélité & parrainage',
  driver: 'Devenir livreur & missions',
  'driver-earnings': 'Rémunération & retraits',
  'driver-tracking': 'Suivi de course',
  franchise: 'La franchise sur Grubano',
  'franchise-operations': 'Piloter son réseau',
}

export function MarkDone({ slug }: { slug: string }) {
  const pathname = usePathname() || ''
  const isFr = pathname.startsWith('/fr/')
  const paths = pathsContaining(slug)

  const [done, setDone] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const sync = () => setDone(isDone(slug))
    sync()
    setHydrated(true)
    window.addEventListener('grubano-path-progress', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('grubano-path-progress', sync)
      window.removeEventListener('storage', sync)
    }
  }, [slug])

  if (!isFr || !paths.length) return null
  const pathSlug = paths[0]
  const steps = LEARNING_PATHS[pathSlug].steps
  const progress = hydrated ? readProgress(pathSlug) : []
  const nextAfterDone = done ? steps.find((s) => !progress.includes(s)) : undefined

  return (
    <div className={`av-md${done ? ' av-md--done' : ''}`} data-hydrated={hydrated}>
      <span className="av-md__ic ms">{done ? 'check_circle' : 'flag'}</span>
      <div className="av-md__m">
        <b>{done ? 'Article terminé !' : 'Cet article fait partie d’un parcours guidé'}</b>
        <span>
          {done ? (
            nextAfterDone ? (
              <>Continuez : <a href={`/fr/guides/${nextAfterDone}/`}>{STEP_TITLES[nextAfterDone] ?? nextAfterDone}</a></>
            ) : (
              <>Parcours « {PATH_LABELS[pathSlug]} » terminé — bravo !</>
            )
          ) : (
            <>« {PATH_LABELS[pathSlug]} » — <a href={`/fr/guides/parcours-${pathSlug}/`}>voir le parcours</a></>
          )}
        </span>
      </div>
      <button
        type="button"
        className="av-md__btn"
        onClick={() => (done ? unmarkDone(slug) : markDone(slug))}
        aria-pressed={done}
      >
        <span className="ms">{done ? 'undo' : 'check'}</span>
        {done ? 'Annuler' : 'Marquer comme terminé'}
      </button>
    </div>
  )
}
