/**
 * "Pour bien démarrer" — 3 cards on the home page, pointing at the editorial
 * intro/start pages that already exist today. Étape 2 will refine once new
 * public-facing "Qu'est-ce que Grubano ?", "Créer un compte" pages exist.
 */

type Card = {
  key: string
  icon: string
  title: string
  subtitle: string
  href: string
}

const CARDS: Record<string, Card[]> = {
  fr: [
    { key: 'discover',  icon: 'help',        title: 'Découvrir Grubano',        subtitle: 'La marketplace en 2 minutes',    href: '/fr/getting-started/' },
    { key: 'quickstart',icon: 'bolt',        title: 'Démarrer en 15 minutes',   subtitle: 'Onboarding pas à pas',            href: '/fr/guides/quick-start/' },
    { key: 'pro',       icon: 'workspace_premium', title: 'Passer en Pro',      subtitle: 'Agrégation multi-plateformes',    href: '/fr/guides/pro/' },
  ],
  en: [
    { key: 'discover',  icon: 'help',        title: 'Discover Grubano',         subtitle: 'The marketplace in 2 minutes',    href: '/en/getting-started/' },
    { key: 'quickstart',icon: 'bolt',        title: 'Get started in 15 minutes',subtitle: 'Step-by-step onboarding',         href: '/en/guides/quick-start/' },
    { key: 'pro',       icon: 'workspace_premium', title: 'Go Pro',             subtitle: 'Multi-platform aggregation',      href: '/en/guides/pro/' },
  ],
  es: [
    { key: 'discover',  icon: 'help',        title: 'Descubrir Grubano',        subtitle: 'El marketplace en 2 minutos',     href: '/es/getting-started/' },
    { key: 'quickstart',icon: 'bolt',        title: 'Empezar en 15 minutos',    subtitle: 'Onboarding paso a paso',          href: '/es/guides/quick-start/' },
    { key: 'pro',       icon: 'workspace_premium', title: 'Pasar a Pro',        subtitle: 'Agregación multiplataforma',      href: '/es/guides/pro/' },
  ],
  ar: [
    { key: 'discover',  icon: 'help',        title: 'اكتشف Grubano',            subtitle: 'المنصة في دقيقتين',               href: '/ar/getting-started/' },
    { key: 'quickstart',icon: 'bolt',        title: 'ابدأ في 15 دقيقة',         subtitle: 'خطوات الانضمام خطوة بخطوة',       href: '/ar/guides/quick-start/' },
    { key: 'pro',       icon: 'workspace_premium', title: 'الترقية إلى Pro',    subtitle: 'تجميع المنصات المتعددة',          href: '/ar/guides/pro/' },
  ],
  it: [
    { key: 'discover',  icon: 'help',        title: 'Scoprire Grubano',         subtitle: 'Il marketplace in 2 minuti',      href: '/it/getting-started/' },
    { key: 'quickstart',icon: 'bolt',        title: 'Iniziare in 15 minuti',    subtitle: 'Onboarding passo dopo passo',     href: '/it/guides/quick-start/' },
    { key: 'pro',       icon: 'workspace_premium', title: 'Passare a Pro',      subtitle: 'Aggregazione multipiattaforma',   href: '/it/guides/pro/' },
  ],
}

const TITLE: Record<string, string> = {
  fr: 'Pour bien démarrer',
  en: 'Getting started',
  es: 'Para empezar bien',
  ar: 'لبداية موفّقة',
  it: 'Per iniziare al meglio',
}

export function QuickStartCards({ locale = 'fr' }: { locale?: string }) {
  const cards = CARDS[locale] ?? CARDS.fr
  const title = TITLE[locale] ?? TITLE.fr
  return (
    <section className="gb-sec gb-sec--muted">
      <div className="gb-sec__hd">
        <span className="ms">rocket_launch</span>
        <h2>{title}</h2>
      </div>
      <div className="gb-quicks">
        {cards.map((c) => (
          <a key={c.key} className="gb-quick" href={c.href}>
            <span className="gb-quick__ic">
              <span className="ms">{c.icon}</span>
            </span>
            <div className="gb-quick__m">
              <b>{c.title}</b>
              <span>{c.subtitle}</span>
            </div>
            <span className="ms flip-rtl">arrow_forward</span>
          </a>
        ))}
      </div>
    </section>
  )
}
