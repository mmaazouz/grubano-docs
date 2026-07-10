'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Custom language selector — replaces Nextra's default LocaleSwitch so the
 * dropdown matches the CD mockup (flags, checkmark, "à venir" badge on the
 * languages not yet activated).
 *
 * Active locales navigate to the same page in the target language.
 * Disabled locales show but do nothing (les 3 langues D3 : es / ar / it).
 */

type Lang = {
  code: string
  flag: string
  name: string
  active: boolean
}

const LANGS: Lang[] = [
  { code: 'fr', flag: '🇫🇷', name: 'Français', active: true },
  { code: 'en', flag: '🇬🇧', name: 'English',  active: true },
  { code: 'es', flag: '🇪🇸', name: 'Español',  active: true },
  { code: 'ar', flag: '🇸🇦', name: 'العربية',   active: true },
  { code: 'it', flag: '🇮🇹', name: 'Italiano', active: true },
]

const SOON: Record<string, string> = { fr: 'à venir', en: 'soon' }

export function LangSwitch() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  const current = pathname?.split('/')[1] || 'fr'
  const currentLang = LANGS.find((l) => l.code === current) || LANGS[0]

  // Click-outside to close
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const switchTo = (code: string) => {
    if (code === current) { setOpen(false); return }
    const newPath = (pathname || `/${current}/`).replace(
      new RegExp(`^/${current}(?=/|$)`),
      `/${code}`,
    )
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=${365 * 24 * 60 * 60}`
    window.location.href = newPath
  }

  const soonLabel = SOON[current] || SOON.fr

  return (
    <div className={`lang${open ? ' open' : ''}`} ref={ref}>
      <button
        className="lang__btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="ms">language</span>
        <span>{currentLang.name}</span>
        <span className="ms">expand_more</span>
      </button>
      <div className="lang__menu" role="menu">
        {LANGS.map((l) => {
          const isCurrent = l.code === current
          const cls = ['lang__opt']
          if (isCurrent) cls.push('on')
          if (!l.active) cls.push('lang__opt--soon')
          return (
            <button
              key={l.code}
              type="button"
              className={cls.join(' ')}
              onClick={() => l.active && switchTo(l.code)}
              disabled={!l.active}
              role="menuitem"
            >
              <span className="fl" aria-hidden="true">{l.flag}</span>
              <span className="lang__opt-name">{l.name}</span>
              {!l.active ? (
                <span className="lang__opt-soon">{soonLabel}</span>
              ) : (
                <span className="ms">check</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
