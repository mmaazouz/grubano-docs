/**
 * Site footer — matches accueil.html mockup (brand + legal links + language
 * indicator + copyright). Replaces the barebones Nextra footer.
 *
 * Legal links point at the operator site's /legal/* pages that already exist
 * per the main repo's routing. Status page is a soft placeholder for now.
 */

const COPY = {
  fr: {
    langLabel: 'Français',
    links: [
      { label: 'Conditions générales', href: 'https://www.grubano.com/legal/mentions-legales' },
      { label: 'Confidentialité',      href: 'https://www.grubano.com/legal/confidentialite' },
      { label: 'Mentions légales',     href: 'https://www.grubano.com/legal/mentions-legales' },
      { label: 'Statut',               href: 'https://www.grubano.com' },
    ],
    copyright: 'Tous droits réservés.',
  },
  en: {
    langLabel: 'English',
    links: [
      { label: 'Terms',                href: 'https://www.grubano.com/legal/mentions-legales' },
      { label: 'Privacy',              href: 'https://www.grubano.com/legal/confidentialite' },
      { label: 'Legal notice',         href: 'https://www.grubano.com/legal/mentions-legales' },
      { label: 'Status',               href: 'https://www.grubano.com' },
    ],
    copyright: 'All rights reserved.',
  },
} as const

type Locale = keyof typeof COPY

export function SiteFooter({ locale = 'fr' }: { locale?: string }) {
  const t = (COPY as Record<string, (typeof COPY)[Locale]>)[locale] ?? COPY.fr
  const year = new Date().getFullYear()
  return (
    <div className="foot__in">
      <div className="foot__brand">
        <span className="foot__mark" aria-hidden="true">G</span>
        <b>Grubano</b>
      </div>
      <div className="foot__links">
        {t.links.map((l) => (
          <a key={l.label} href={l.href}>{l.label}</a>
        ))}
      </div>
      <div className="foot__lang"><span className="ms">language</span>{t.langLabel}</div>
      <div className="foot__copy">© {year} Grubano. {t.copyright}</div>
    </div>
  )
}
