/**
 * learning-paths.ts — progression de lecture des parcours guidés, SANS
 * compte : stockée dans le navigateur (localStorage), une clé par parcours
 * (`grubano-path-<slug>` = tableau des slugs d'articles terminés).
 *
 * Source de vérité du mapping parcours → articles (doit refléter les steps
 * des pages content/fr/guides/parcours-*.mdx). Limite assumée : progression
 * liée au navigateur (pas de synchro multi-appareils).
 */

export const LEARNING_PATHS: Record<string, { steps: string[] }> = {
  restaurateur: { steps: ['quick-start', 'restaurant', 'menu', 'finances', 'pro'] },
  client: { steps: ['consumer-account', 'consumer', 'consumer-loyalty'] },
  livreur: { steps: ['driver', 'driver-earnings', 'driver-tracking'] },
  franchise: { steps: ['franchise', 'franchise-operations'] },
}

const KEY = (pathSlug: string) => `grubano-path-${pathSlug}`

/** Parcours contenant cet article (slug de fiche, ex. "finances"). */
export function pathsContaining(articleSlug: string): string[] {
  return Object.keys(LEARNING_PATHS).filter((p) =>
    LEARNING_PATHS[p].steps.includes(articleSlug),
  )
}

/** Slugs terminés d'un parcours (∩ steps — les entrées inconnues sont ignorées). */
export function readProgress(pathSlug: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY(pathSlug))
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(arr)) return []
    const steps = LEARNING_PATHS[pathSlug]?.steps ?? []
    return steps.filter((s) => arr.includes(s))
  } catch {
    return []
  }
}

export function isDone(articleSlug: string): boolean {
  return pathsContaining(articleSlug).some((p) => readProgress(p).includes(articleSlug))
}

/** Marque un article terminé dans TOUS les parcours qui le contiennent. */
export function markDone(articleSlug: string): void {
  if (typeof window === 'undefined') return
  for (const p of pathsContaining(articleSlug)) {
    try {
      const done = new Set(readProgress(p))
      done.add(articleSlug)
      window.localStorage.setItem(KEY(p), JSON.stringify([...done]))
    } catch {
      /* stockage indisponible (navigation privée) — silencieux */
    }
  }
  // notifie les composants montés dans CE même onglet (l'événement natif
  // 'storage' ne se déclenche que dans les AUTRES onglets)
  window.dispatchEvent(new CustomEvent('grubano-path-progress'))
}

export function unmarkDone(articleSlug: string): void {
  if (typeof window === 'undefined') return
  for (const p of pathsContaining(articleSlug)) {
    try {
      const done = readProgress(p).filter((s) => s !== articleSlug)
      window.localStorage.setItem(KEY(p), JSON.stringify(done))
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new CustomEvent('grubano-path-progress'))
}
