'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * A big visual search field for the home hero. Clicking / focusing it focuses
 * the navbar's existing Pagefind search input (`input[type="search"]`) — so we
 * reuse Nextra's working search instead of forking a second one.
 *
 * Falls back to dispatching the `/` keyboard shortcut (Nextra binds it window-
 * wide to open the search) if the input cannot be found in the DOM.
 */
export function HeroSearchTrigger({ placeholder }: { placeholder: string }) {
  const [shortcut, setShortcut] = useState('Ctrl+K')

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac')) {
      setShortcut('⌘K')
    }
  }, [])

  const trigger = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>('input[type="search"]')
    if (input) {
      input.focus()
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // Fallback — Nextra binds `/` globally to focus its search.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
  }, [])

  return (
    <button
      type="button"
      onClick={trigger}
      className="grubano-hero__search"
      aria-label={placeholder}
    >
      <svg
        className="grubano-hero__search-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span className="grubano-hero__search-placeholder">{placeholder}</span>
      <kbd className="grubano-hero__search-kbd">{shortcut}</kbd>
    </button>
  )
}
