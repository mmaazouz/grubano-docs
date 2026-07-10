import type { ReactNode } from 'react'

/**
 * Spaces grid — the 9-audience card layout on the home page.
 *
 * Cards with `soon: true` render greyed out with a "À venir" badge and no
 * arrow. Their audience doesn't have a landing page yet — étape 2 will flip
 * these to real hrefs when the content ships. Kept in the grid now so the
 * scope of Grubano is honestly visible from day one.
 */

type Space = {
  key: string
  icon: string
  title: string
  subtitle: string
  href?: string
  soon?: boolean
}

// Per accueil.html: every space is a normal card EXCEPT "Développeurs", which
// carries the "À venir" badge and is non-clickable. The 4 audiences whose
// landing pages don't exist yet (fournisseurs / affiliés / influenceurs /
// livreurs) point at '#' as a placeholder — étape 2 (arborescence) wires
// their real routes.
const SPACES: Record<string, Space[]> = {
  fr: [
    { key: 'clients',      icon: 'restaurant',      title: 'Clients',       subtitle: 'Commander, suivre et payer',              href: '/fr/guides/consumer/' },
    { key: 'restaurateur', icon: 'storefront',      title: 'Restaurateurs', subtitle: 'Vendre et gérer mon établissement',       href: '/fr/guides/restaurant/' },
    { key: 'fournisseurs', icon: 'local_shipping',  title: 'Fournisseurs',  subtitle: 'Vendre mes approvisionnements',           href: '/fr/guides/supplier/' },
    { key: 'franchises',   icon: 'hub',             title: 'Franchisés',    subtitle: 'Exploiter une marque, plusieurs points',  href: '/fr/guides/franchise/' },
    { key: 'createurs',    icon: 'restaurant_menu', title: 'Créateurs',     subtitle: 'Proposer mes recettes',                   href: '/fr/guides/creators/' },
    { key: 'affilies',     icon: 'link',            title: 'Affiliés',      subtitle: 'Promouvoir et gagner',                    href: '/fr/guides/affiliate/' },
    { key: 'influenceurs', icon: 'campaign',        title: 'Influenceurs',  subtitle: 'Statut vérifié, gros volumes',            href: '/fr/guides/influencer/' },
    { key: 'livreurs',     icon: 'two_wheeler',     title: 'Livreurs',      subtitle: 'Livrer et gérer mes courses',             href: '/fr/guides/driver/' },
    { key: 'developpeurs', icon: 'code',            title: 'Développeurs',  subtitle: 'API & intégrations',                      soon: true },
  ],
  en: [
    { key: 'customers',    icon: 'restaurant',      title: 'Customers',    subtitle: 'Order, track and pay',                     href: '/en/guides/consumer/' },
    { key: 'restaurants',  icon: 'storefront',      title: 'Restaurants',  subtitle: 'Sell and run your business',              href: '/en/guides/restaurant/' },
    { key: 'suppliers',    icon: 'local_shipping',  title: 'Suppliers',    subtitle: 'Sell your ingredients',                    href: '#' },
    { key: 'franchises',   icon: 'hub',             title: 'Franchisees',  subtitle: 'Run a brand, multiple locations',          href: '/en/guides/franchise/' },
    { key: 'creators',     icon: 'restaurant_menu', title: 'Creators',     subtitle: 'Submit your recipes',                      href: '/en/guides/creators/' },
    { key: 'affiliates',   icon: 'link',            title: 'Affiliates',   subtitle: 'Promote and earn',                         href: '#' },
    { key: 'influencers',  icon: 'campaign',        title: 'Influencers',  subtitle: 'Verified status, higher volumes',          href: '#' },
    { key: 'couriers',     icon: 'two_wheeler',     title: 'Couriers',     subtitle: 'Deliver and manage your rides',            href: '#' },
    { key: 'developers',   icon: 'code',            title: 'Developers',   subtitle: 'API & integrations',                       soon: true },
  ],
}

const SECTION_TITLE: Record<string, string> = {
  fr: 'Parcourir par espace',
  en: 'Browse by space',
}

const SOON_LABEL: Record<string, string> = {
  fr: 'À venir',
  en: 'Coming soon',
}

function Card({ s, soonLabel }: { s: Space; soonLabel: string }): ReactNode {
  const inner = (
    <>
      <span className="gb-space__ic">
        <span className="ms">{s.icon}</span>
      </span>
      <div className="gb-space__m">
        <b>{s.title}</b>
        <span>{s.subtitle}</span>
        {s.soon ? <span className="gb-space__soon">{soonLabel}</span> : null}
      </div>
      {!s.soon && <span className="ms gb-space__go flip-rtl">arrow_forward</span>}
    </>
  )
  if (s.soon) {
    return (
      <div className="gb-space gb-space--soon" aria-disabled="true">
        {inner}
      </div>
    )
  }
  return (
    <a className="gb-space" href={s.href}>
      {inner}
    </a>
  )
}

export function SpacesGrid({ locale = 'fr' }: { locale?: string }) {
  const spaces = SPACES[locale] ?? SPACES.fr
  const title = SECTION_TITLE[locale] ?? SECTION_TITLE.fr
  const soon = SOON_LABEL[locale] ?? SOON_LABEL.fr
  return (
    <section className="gb-sec">
      <div className="gb-sec__hd">
        <span className="ms">grid_view</span>
        <h2>{title}</h2>
      </div>
      <div className="gb-spaces">
        {spaces.map((s) => (
          <Card key={s.key} s={s} soonLabel={soon} />
        ))}
      </div>
    </section>
  )
}
