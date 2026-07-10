'use client'

import { usePathname } from 'next/navigation'
import { Search } from 'nextra/components'

/**
 * Navbar search — fidèle à la maquette article-v5 : UNE recherche globale
 * simple (Pagefind), aucun sélecteur de portée, aucune recherche in-page.
 * Sur la home : rien (le hero porte déjà la recherche globale).
 */

const PLACEHOLDER: Record<string, { placeholder: string; empty: string; loading: string; error: string }> = {
  fr: {
    placeholder: 'Rechercher dans toute la documentation',
    empty: 'Aucun résultat',
    loading: 'Chargement…',
    error: 'Échec du chargement de l’index de recherche.',
  },
  en: {
    placeholder: 'Search the whole documentation',
    empty: 'No results',
    loading: 'Loading…',
    error: 'Failed to load the search index.',
  },
  es: {
    placeholder: 'Buscar en toda la documentación',
    empty: 'Sin resultados',
    loading: 'Cargando…',
    error: 'No se pudo cargar el índice de búsqueda.',
  },
  ar: {
    placeholder: 'ابحث في كامل الوثائق',
    empty: 'لا توجد نتائج',
    loading: 'جارٍ التحميل…',
    error: 'تعذّر تحميل فهرس البحث.',
  },
  it: {
    placeholder: 'Cerca in tutta la documentazione',
    empty: 'Nessun risultato',
    loading: 'Caricamento…',
    error: 'Impossibile caricare l’indice di ricerca.',
  },
}

export function NavbarSearch({ lang = 'fr' }: { lang?: string }) {
  const t = PLACEHOLDER[lang] ?? PLACEHOLDER.fr
  const pathname = usePathname() || '/'
  const isHome = /^\/([a-z]{2})\/?$/.test(pathname) || pathname === '/'
  if (isHome) return null

  return (
    <Search
      placeholder={t.placeholder}
      emptyResult={t.empty}
      loading={t.loading}
      errorText={t.error}
    />
  )
}
