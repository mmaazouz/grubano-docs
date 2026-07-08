'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Home hero — badge + title + subtitle + big search + popular chips.
 * Matches the design mockup (accueil.html) exactly.
 *
 * The search input is a click-to-focus proxy: it looks like a real input but
 * on activation focuses the navbar's Pagefind search input, so the site keeps
 * a single search source of truth. `/` shortcut fallback for browsers where
 * the navbar input hasn't mounted yet.
 */

const COPY = {
  fr: {
    badge: "Centre d'aide Grubano",
    icon: 'support_agent',
    title: 'Comment pouvons-nous vous aider ?',
    subtitle:
      "Trouvez des réponses, des guides et des ressources pour tous les espaces Grubano.",
    placeholder: 'Rechercher un article, un guide, une question…',
    popularLabel: 'Populaire :',
    popular: [
      { label: 'suivre ma commande', href: '/fr/guides/consumer/' },
      { label: 'modes de paiement', href: '/fr/guides/consumer/' },
      { label: 'créer un compte', href: '/fr/guides/consumer/' },
    ],
  },
  en: {
    badge: 'Grubano Help Center',
    icon: 'support_agent',
    title: 'How can we help you?',
    subtitle:
      'Find answers, guides and resources for every Grubano space.',
    placeholder: 'Search articles, guides, questions…',
    popularLabel: 'Popular:',
    popular: [
      { label: 'track my order', href: '/en/guides/consumer/' },
      { label: 'payment methods', href: '/en/guides/consumer/' },
      { label: 'create an account', href: '/en/guides/consumer/' },
    ],
  },
} as const

type Locale = keyof typeof COPY

export function HomeHero({ locale = 'fr' }: { locale?: string }) {
  const t = (COPY as Record<string, (typeof COPY)[Locale]>)[locale] ?? COPY.fr
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
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
  }, [])

  const kbdChars = shortcut === '⌘K' ? ['⌘', 'K'] : ['Ctrl', 'K']

  return (
    <section className="gb-hero">
      <div className="gb-hero__in">
        <span className="gb-hero__eyebrow">
          <span className="ms">{t.icon}</span>
          {t.badge}
        </span>
        <h1>{t.title}</h1>
        <p className="gb-hero__subtitle">{t.subtitle}</p>

        <button
          type="button"
          onClick={trigger}
          className="gb-hero__search"
          aria-label={t.placeholder}
        >
          <span className="ms gb-hero__search-ic">search</span>
          <span className="gb-hero__search-ph">{t.placeholder}</span>
          <span className="gb-hero__kbd" aria-hidden="true">
            {kbdChars.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </span>
        </button>

        <div className="gb-hero__pop">
          {t.popularLabel}{' '}
          {t.popular.map((p, i) => (
            <span key={p.href + i}>
              {i > 0 && ' · '}
              <a href={p.href}>{p.label}</a>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
