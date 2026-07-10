'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Search } from 'nextra/components'
import { InPageSearch } from './InPageSearch'

/**
 * Navbar search — épuré, aligné sur docs/article-v5.html : le header ne porte
 * qu'un CHAMP simple (comme .hd__search de la maquette). Cliquer/focuser le
 * champ ouvre un OVERLAY qui contient le choix de portée (« Toute la doc » /
 * « Cette page ») + le widget actif. Plus de boutons permanents dans le
 * header. Sur la home : rien (le hero porte la recherche globale).
 */

type Labels = {
  all: string
  page: string
  scopeAria: string
  placeholder: string
  empty: string
  loading: string
  error: string
}

const LABELS: Record<string, Labels> = {
  fr: {
    all: 'Toute la doc',
    page: 'Cette page',
    scopeAria: 'Portée de la recherche',
    placeholder: 'Rechercher…',
    empty: 'Aucun résultat',
    loading: 'Chargement…',
    error: 'Échec du chargement de l’index de recherche.',
  },
  en: {
    all: 'All docs',
    page: 'This page',
    scopeAria: 'Search scope',
    placeholder: 'Search…',
    empty: 'No results',
    loading: 'Loading…',
    error: 'Failed to load the search index.',
  },
  es: {
    all: 'Toda la doc',
    page: 'Esta página',
    scopeAria: 'Ámbito de búsqueda',
    placeholder: 'Buscar…',
    empty: 'Sin resultados',
    loading: 'Cargando…',
    error: 'No se pudo cargar el índice de búsqueda.',
  },
  ar: {
    all: 'كل الوثائق',
    page: 'هذه الصفحة',
    scopeAria: 'نطاق البحث',
    placeholder: 'ابحث…',
    empty: 'لا توجد نتائج',
    loading: 'جارٍ التحميل…',
    error: 'تعذّر تحميل فهرس البحث.',
  },
  it: {
    all: 'Tutta la doc',
    page: 'Questa pagina',
    scopeAria: 'Ambito di ricerca',
    placeholder: 'Cerca…',
    empty: 'Nessun risultato',
    loading: 'Caricamento…',
    error: 'Impossibile caricare l’indice di ricerca.',
  },
}

type Scope = 'all' | 'page'
const STORE_KEY = 'gb-search-scope'

export function NavbarSearch({ lang = 'fr' }: { lang?: string }) {
  const t = LABELS[lang] ?? LABELS.fr
  const pathname = usePathname() || '/'
  const isHome = /^\/([a-z]{2})\/?$/.test(pathname) || pathname === '/'

  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<Scope>('all')
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const s = window.localStorage.getItem(STORE_KEY)
      if (s === 'page' || s === 'all') setScope(s)
    } catch { /* private mode */ }
  }, [])

  // Close the overlay on route change / outside click / Escape.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (s: Scope) => {
    setScope(s)
    try { window.localStorage.setItem(STORE_KEY, s) } catch { /* ignore */ }
  }

  // Hand focus to the active widget's own input once the overlay is open.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      wrapRef.current?.querySelector<HTMLInputElement>('.navov__panel input')?.focus()
    }, 30)
    return () => window.clearTimeout(id)
  }, [open, scope])

  if (isHome) return null

  return (
    <div className="navov" ref={wrapRef}>
      {open ? (
        <div className="navov__panel">
          <div className="navov__scope" role="tablist" aria-label={t.scopeAria}>
            <button type="button" role="tab" aria-selected={scope === 'all'} className="navov__tab" onClick={() => choose('all')}>
              <span className="ms" aria-hidden="true">travel_explore</span>{t.all}
            </button>
            <button type="button" role="tab" aria-selected={scope === 'page'} className="navov__tab" onClick={() => choose('page')}>
              <span className="ms" aria-hidden="true">description</span>{t.page}
            </button>
          </div>
          {scope === 'all' ? (
            <Search
              className="navov__pagefind"
              placeholder={t.placeholder}
              emptyResult={t.empty}
              loading={t.loading}
              errorText={t.error}
            />
          ) : (
            <InPageSearch lang={lang} />
          )}
        </div>
      ) : null}
      <div className="navov__field">
        <span className="ms" aria-hidden="true">search</span>
        <input
          type="text"
          className="navov__input"
          placeholder={t.placeholder}
          readOnly
          value=""
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        />
      </div>
    </div>
  )
}
