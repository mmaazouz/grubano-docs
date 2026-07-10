'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * In-page search — the navbar search field on ARTICLE pages. Searches ONLY the
 * current article's own content (its headings + the text under each), NOT the
 * whole site. This is deliberately distinct from the home's global search.
 *
 * Why not Pagefind here: Pagefind indexes the whole site; it has no first-class
 * "restrict to the current page" mode (its filters are declared facets, and
 * filtering by the current URL yields clunky page-fragment results). A clean
 * in-page search is a different feature, so this is a small self-contained
 * component that reads the rendered article DOM (headings + following text),
 * matches the query accent-insensitively, and scroll-jumps to the section on
 * click — keeping the validated orange overlay visual.
 */

type Labels = { placeholder: string; empty: string; hint: string }

const LABELS: Record<string, Labels> = {
  fr: {
    placeholder: 'Rechercher dans cet article…',
    empty: 'Rien trouvé dans cet article.',
    hint: 'Recherche dans la page',
  },
  en: {
    placeholder: 'Search this article…',
    empty: 'Nothing found in this article.',
    hint: 'On-page search',
  },
  es: {
    placeholder: 'Buscar en este artículo…',
    empty: 'Nada encontrado en este artículo.',
    hint: 'Búsqueda en la página',
  },
  ar: {
    placeholder: 'ابحث في هذا المقال…',
    empty: 'لا شيء في هذا المقال.',
    hint: 'بحث داخل الصفحة',
  },
  it: {
    placeholder: 'Cerca in questo articolo…',
    empty: 'Nessun risultato in questo articolo.',
    hint: 'Ricerca nella pagina',
  },
}

type Section = { id: string; title: string; level: number; body: string }

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function collectSections(): Section[] {
  const root = document.querySelector('.nextra-content') || document.querySelector('article main')
  if (!root) return []
  const heads = Array.from(root.querySelectorAll('h1, h2, h3')) as HTMLElement[]
  return heads
    .map((h, i) => {
      let body = ''
      let n = h.nextElementSibling
      const next = heads[i + 1]
      while (n && n !== next) {
        if (!/^H[1-3]$/.test(n.tagName)) body += ' ' + (n.textContent || '')
        n = n.nextElementSibling
      }
      const title = (h.textContent || '').replace(/#/g, '').trim()
      return {
        id: h.id || '',
        title,
        level: h.tagName === 'H1' ? 1 : h.tagName === 'H2' ? 2 : 3,
        body: body.replace(/\s+/g, ' ').trim(),
      }
    })
    .filter((s) => s.title)
}

/** Build a short snippet around the first match of `q` in `text`. */
function snippet(text: string, q: string): { before: string; hit: string; after: string } | null {
  const nt = norm(text)
  const nq = norm(q)
  const i = nt.indexOf(nq)
  if (i < 0) return null
  const start = Math.max(0, i - 40)
  const end = Math.min(text.length, i + nq.length + 60)
  return {
    before: (start > 0 ? '…' : '') + text.slice(start, i),
    hit: text.slice(i, i + q.length),
    after: text.slice(i + q.length, end) + (end < text.length ? '…' : ''),
  }
}

export function InPageSearch({ lang = 'fr' }: { lang?: string }) {
  const t = LABELS[lang] ?? LABELS.fr
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Reset when the route changes (new article).
  useEffect(() => {
    setQuery('')
    setOpen(false)
  }, [pathname])

  // Read the article DOM at query time — no cached index, so no mount/focus
  // timing to get wrong. The current article's content is guaranteed present
  // by the time the user types. Cheap (a handful of headings).
  const results = useMemo(() => {
    const q = query.trim()
    if (q.length < 2) return []
    const nq = norm(q)
    return collectSections()
      .map((s) => {
        const inTitle = norm(s.title).includes(nq)
        const snip = snippet(s.body, q)
        if (!inTitle && !snip) return null
        return { s, snip: snip ?? snippet(s.title, q) }
      })
      .filter(Boolean)
      .slice(0, 8) as { s: Section; snip: ReturnType<typeof snippet> }[]
  }, [query, pathname])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const jump = useCallback((s: Section) => {
    setOpen(false)
    // getElementById (raw id, no CSS parsing) handles accented heading ids
    // like "mettre-à-jour-en-langage-naturel" that querySelector chokes on.
    const el = s.id ? document.getElementById(s.id) : null
    if (!el) return
    // Default behavior honours the CSS `scroll-behavior: smooth` on <html> in
    // real browsers, and reliably jumps where explicit 'smooth' can no-op.
    el.scrollIntoView({ block: 'start' })
    el.classList.add('inpage-flash')
    window.setTimeout(() => el.classList.remove('inpage-flash'), 1300)
  }, [])

  return (
    <div className="inpage" ref={wrapRef}>
      <span className="ms inpage__ic" aria-hidden="true">search</span>
      <input
        type="text"
        className="inpage__input"
        placeholder={t.placeholder}
        aria-label={t.hint}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
      />
      {open && query.trim().length >= 2 && (
        <div className="inpage__results" role="listbox">
          {results.length === 0 ? (
            <div className="inpage__empty">{t.empty}</div>
          ) : (
            results.map(({ s, snip }, i) => (
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="inpage__item"
                key={s.id + i}
                onClick={() => jump(s)}
              >
                <span className="inpage__title">{s.title}</span>
                {snip && (
                  <span className="inpage__snip">
                    {snip.before}
                    <mark>{snip.hit}</mark>
                    {snip.after}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
