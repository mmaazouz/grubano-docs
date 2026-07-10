'use client'

import { Search } from 'nextra/components'

/**
 * Home hero — badge + title + subtitle + GLOBAL search + popular chips.
 *
 * The big search field is a real, autonomous instance of Nextra's Pagefind
 * <Search> (whole-site index). It renders its OWN results overlay right below
 * the field and does NOT move focus anywhere else — it is the site's global
 * search entry point. (Nextra's <Search> is self-contained: it only needs
 * window.pagefind, no navbar/theme context, so embedding it here is clean.)
 */

const COPY = {
  fr: {
    badge: "Centre d'aide Grubano",
    icon: 'support_agent',
    title: 'Comment pouvons-nous vous aider ?',
    subtitle:
      "Trouvez des réponses, des guides et des ressources pour tous les espaces Grubano.",
    placeholder: 'Rechercher un article, un guide, une question…',
    empty: 'Aucun résultat',
    loading: 'Chargement…',
    error: 'Échec du chargement de l’index de recherche.',
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
    subtitle: 'Find answers, guides and resources for every Grubano space.',
    placeholder: 'Search articles, guides, questions…',
    empty: 'No results',
    loading: 'Loading…',
    error: 'Failed to load the search index.',
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

  return (
    <section className="gb-hero">
      <div className="gb-hero__in">
        <span className="gb-hero__eyebrow">
          <span className="ms">{t.icon}</span>
          {t.badge}
        </span>
        <h1>{t.title}</h1>
        <p className="gb-hero__subtitle">{t.subtitle}</p>

        <div className="gb-hero__search">
          <span className="ms gb-hero__search-ic" aria-hidden="true">search</span>
          <Search
            className="gb-hero__pagefind"
            placeholder={t.placeholder}
            emptyResult={t.empty}
            loading={t.loading}
            errorText={t.error}
          />
        </div>

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
