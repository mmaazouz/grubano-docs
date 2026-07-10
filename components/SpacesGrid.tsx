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
    { key: 'clients',      icon: 'restaurant',      title: 'Clients',       subtitle: 'Commander, suivre et payer',              href: '/fr/guides/espace-clients/' },
    { key: 'restaurateur', icon: 'storefront',      title: 'Restaurateurs', subtitle: 'Vendre et gérer mon établissement',       href: '/fr/guides/espace-restaurateurs/' },
    { key: 'fournisseurs', icon: 'local_shipping',  title: 'Fournisseurs',  subtitle: 'Vendre mes approvisionnements',           href: '/fr/guides/espace-fournisseurs/' },
    { key: 'franchises',   icon: 'hub',             title: 'Franchisés',    subtitle: 'Exploiter une marque, plusieurs points',  href: '/fr/guides/espace-franchises/' },
    { key: 'createurs',    icon: 'restaurant_menu', title: 'Créateurs',     subtitle: 'Proposer mes recettes',                   href: '/fr/guides/creators/' },
    { key: 'affilies',     icon: 'link',            title: 'Affiliés',      subtitle: 'Promouvoir et gagner',                    href: '/fr/guides/affiliate/' },
    { key: 'influenceurs', icon: 'campaign',        title: 'Influenceurs',  subtitle: 'Statut vérifié, gros volumes',            href: '/fr/guides/influencer/' },
    { key: 'livreurs',     icon: 'two_wheeler',     title: 'Livreurs',      subtitle: 'Livrer et gérer mes courses',             href: '/fr/guides/espace-livreurs/' },
    { key: 'developpeurs', icon: 'code',            title: 'Développeurs',  subtitle: 'API & intégrations',                      soon: true },
  ],
  en: [
    { key: 'customers',    icon: 'restaurant',      title: 'Customers',    subtitle: 'Order, track and pay',                     href: '/en/guides/consumer/' },
    { key: 'restaurants',  icon: 'storefront',      title: 'Restaurants',  subtitle: 'Sell and run your business',              href: '/en/guides/restaurant/' },
    { key: 'suppliers',    icon: 'local_shipping',  title: 'Suppliers',    subtitle: 'Sell your supplies',                       href: '/en/guides/supplier/' },
    { key: 'franchises',   icon: 'hub',             title: 'Franchisees',  subtitle: 'Run a brand, multiple locations',          href: '/en/guides/franchise/' },
    { key: 'creators',     icon: 'restaurant_menu', title: 'Creators',     subtitle: 'Submit your recipes',                      href: '/en/guides/creators/' },
    { key: 'affiliates',   icon: 'link',            title: 'Affiliates',   subtitle: 'Promote and earn',                         href: '/en/guides/affiliate/' },
    { key: 'influencers',  icon: 'campaign',        title: 'Influencers',  subtitle: 'Verified status, higher volumes',          href: '/en/guides/influencer/' },
    { key: 'couriers',     icon: 'two_wheeler',     title: 'Couriers',     subtitle: 'Deliver and manage your rides',            href: '/en/guides/driver/' },
    { key: 'developers',   icon: 'code',            title: 'Developers',   subtitle: 'API & integrations',                       soon: true },
  ],
  es: [
    { key: 'clientes',     icon: 'restaurant',      title: 'Clientes',      subtitle: 'Pedir, seguir y pagar',                   href: '/es/guides/consumer/' },
    { key: 'restaurantes', icon: 'storefront',      title: 'Restaurantes',  subtitle: 'Vender y gestionar su negocio',           href: '/es/guides/restaurant/' },
    { key: 'proveedores',  icon: 'local_shipping',  title: 'Proveedores',   subtitle: 'Vender sus suministros',                  href: '/es/guides/supplier/' },
    { key: 'franquicias',  icon: 'hub',             title: 'Franquiciados', subtitle: 'Operar una marca, varios locales',        href: '/es/guides/franchise/' },
    { key: 'creadores',    icon: 'restaurant_menu', title: 'Creadores',     subtitle: 'Proponer sus recetas',                    href: '/es/guides/creators/' },
    { key: 'afiliados',    icon: 'link',            title: 'Afiliados',     subtitle: 'Recomendar y ganar',                      href: '/es/guides/affiliate/' },
    { key: 'influencers',  icon: 'campaign',        title: 'Influencers',   subtitle: 'Estatus verificado, más volumen',         href: '/es/guides/influencer/' },
    { key: 'repartidores', icon: 'two_wheeler',     title: 'Repartidores',  subtitle: 'Entregar y gestionar sus rutas',          href: '/es/guides/driver/' },
    { key: 'developers',   icon: 'code',            title: 'Desarrolladores', subtitle: 'API e integraciones',                   soon: true },
  ],
  ar: [
    { key: 'clients',      icon: 'restaurant',      title: 'العملاء',        subtitle: 'اطلب وتتبّع وادفع',                        href: '/ar/guides/consumer/' },
    { key: 'restaurants',  icon: 'storefront',      title: 'المطاعم',        subtitle: 'بِع وأدر مطعمك',                           href: '/ar/guides/restaurant/' },
    { key: 'suppliers',    icon: 'local_shipping',  title: 'المورّدون',      subtitle: 'بِع مستلزماتك',                            href: '/ar/guides/supplier/' },
    { key: 'franchises',   icon: 'hub',             title: 'أصحاب الامتياز', subtitle: 'أدر علامة تجارية بعدة فروع',               href: '/ar/guides/franchise/' },
    { key: 'creators',     icon: 'restaurant_menu', title: 'المبتكرون',      subtitle: 'اقترح وصفاتك',                             href: '/ar/guides/creators/' },
    { key: 'affiliates',   icon: 'link',            title: 'الشركاء بالعمولة', subtitle: 'روّج واكسب',                             href: '/ar/guides/affiliate/' },
    { key: 'influencers',  icon: 'campaign',        title: 'المؤثرون',       subtitle: 'حساب موثّق وحجم أكبر',                     href: '/ar/guides/influencer/' },
    { key: 'couriers',     icon: 'two_wheeler',     title: 'عمال التوصيل',   subtitle: 'وصّل الطلبات وأدر مشاويرك',                href: '/ar/guides/driver/' },
    { key: 'developers',   icon: 'code',            title: 'المطوّرون',      subtitle: 'واجهات API والتكاملات',                    soon: true },
  ],
  it: [
    { key: 'clienti',      icon: 'restaurant',      title: 'Clienti',       subtitle: 'Ordinare, seguire e pagare',              href: '/it/guides/consumer/' },
    { key: 'ristoratori',  icon: 'storefront',      title: 'Ristoratori',   subtitle: 'Vendere e gestire il locale',             href: '/it/guides/restaurant/' },
    { key: 'fornitori',    icon: 'local_shipping',  title: 'Fornitori',     subtitle: 'Vendere le proprie forniture',            href: '/it/guides/supplier/' },
    { key: 'franchising',  icon: 'hub',             title: 'Affiliati in franchising', subtitle: 'Gestire un marchio, più punti vendita', href: '/it/guides/franchise/' },
    { key: 'creatori',     icon: 'restaurant_menu', title: 'Creatori',      subtitle: 'Proporre le proprie ricette',             href: '/it/guides/creators/' },
    { key: 'affiliati',    icon: 'link',            title: 'Affiliati',     subtitle: 'Consigliare e guadagnare',                href: '/it/guides/affiliate/' },
    { key: 'influencer',   icon: 'campaign',        title: 'Influencer',    subtitle: 'Status verificato, volumi maggiori',      href: '/it/guides/influencer/' },
    { key: 'rider',        icon: 'two_wheeler',     title: 'Rider',         subtitle: 'Consegnare e gestire le corse',           href: '/it/guides/driver/' },
    { key: 'sviluppatori', icon: 'code',            title: 'Sviluppatori',  subtitle: 'API e integrazioni',                      soon: true },
  ],
}

const SECTION_TITLE: Record<string, string> = {
  fr: 'Parcourir par espace',
  en: 'Browse by space',
  es: 'Explorar por espacio',
  ar: 'تصفّح حسب المساحة',
  it: 'Esplora per spazio',
}

const SOON_LABEL: Record<string, string> = {
  fr: 'À venir',
  en: 'Coming soon',
  es: 'Próximamente',
  ar: 'قريباً',
  it: 'In arrivo',
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
