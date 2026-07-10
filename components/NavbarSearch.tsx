'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Search } from 'nextra/components'
import { InPageSearch } from './InPageSearch'

/**
 * Navbar search slot. The GLOBAL (whole-doc) search must be reachable from
 * EVERY page, not just the home hero — so on any article we render a scope
 * toggle:
 *   • « Toute la doc » (default) → Nextra's Pagefind <Search> (whole site).
 *   • « Cette page »            → the in-page section search (this article).
 * The home is left to its hero, which already hosts the global field front and
 * centre (the CD home mockup has no header search), so the navbar slot there
 * would be a redundant second global field.
 */

const LABELS = {
  fr: {
    all: 'Toute la doc',
    page: 'Cette page',
    scopeAria: 'Portée de la recherche',
    placeholder: 'Rechercher dans toute la doc…',
    empty: 'Aucun résultat',
    loading: 'Chargement…',
    error: 'Échec du chargement de l’index de recherche.',
  },
  en: {
    all: 'All docs',
    page: 'This page',
    scopeAria: 'Search scope',
    placeholder: 'Search all docs…',
    empty: 'No results',
    loading: 'Loading…',
    error: 'Failed to load the search index.',
  },
} as const

type Scope = 'all' | 'page'
const STORE_KEY = 'gb-search-scope'

export function NavbarSearch({ lang = 'fr' }: { lang?: string }) {
  const t = lang === 'en' ? LABELS.en : LABELS.fr
  const pathname = usePathname() || '/'
  const isHome = /^\/([a-z]{2})\/?$/.test(pathname) || pathname === '/'

  // Remember the reader's preferred scope across pages.
  const [scope, setScope] = useState<Scope>('all')
  useEffect(() => {
    try {
      const s = window.localStorage.getItem(STORE_KEY)
      if (s === 'page' || s === 'all') setScope(s)
    } catch {
      /* private mode — ignore */
    }
  }, [])
  const choose = (s: Scope) => {
    setScope(s)
    try {
      window.localStorage.setItem(STORE_KEY, s)
    } catch {
      /* ignore */
    }
  }

  if (isHome) return null

  return (
    <div className="navsearch" data-scope={scope}>
      <div className="navsearch__seg" role="tablist" aria-label={t.scopeAria}>
        <button
          type="button"
          role="tab"
          aria-selected={scope === 'all'}
          className="navsearch__tab"
          onClick={() => choose('all')}
        >
          <span className="ms" aria-hidden="true">travel_explore</span>
          <span className="navsearch__tab-t">{t.all}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={scope === 'page'}
          className="navsearch__tab"
          onClick={() => choose('page')}
        >
          <span className="ms" aria-hidden="true">description</span>
          <span className="navsearch__tab-t">{t.page}</span>
        </button>
      </div>
      <div className="navsearch__field">
        {scope === 'all' ? (
          <Search
            className="navsearch__pagefind"
            placeholder={t.placeholder}
            emptyResult={t.empty}
            loading={t.loading}
            errorText={t.error}
          />
        ) : (
          <InPageSearch lang={lang} />
        )}
      </div>
    </div>
  )
}
