import { Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
import { HtmlLangSync } from '@/components/HtmlLangSync'
import { SidebarGroups } from '@/components/SidebarGroups'
import { LangSwitch } from '@/components/LangSwitch'
import { SiteFooter } from '@/components/SiteFooter'
import { NavbarSearch } from '@/components/NavbarSearch'

// Per-locale UI labels for our own header/footer + the minimal Nextra chrome
// we keep (the TOC title). editLink / feedback are intentionally NOT configured
// — those Nextra TOC affordances are absent from the CD mockups. Search labels
// live inside HomeHero and NavbarSearch (single global Pagefind search).
const UI = {
  fr: {
    toc: { title: 'Sur cette page', backToTop: 'Retour en haut' },
    home: 'Accueil',
  },
  en: {
    toc: { title: 'On this page', backToTop: 'Back to top' },
    home: 'Home',
  },
  es: {
    toc: { title: 'En esta página', backToTop: 'Volver arriba' },
    home: 'Inicio',
  },
  ar: {
    toc: { title: 'في هذه الصفحة', backToTop: 'العودة إلى الأعلى' },
    home: 'الرئيسية',
  },
  it: {
    toc: { title: 'In questa pagina', backToTop: "Torna all'inizio" },
    home: 'Home',
  },
} as const

type Lang = keyof typeof UI

// Header brand — official Grubano symbol (gradient leaf-G) + wordmark + tag.
// Compact lockup: small symbol + tight gaps so the mark doesn't overrun the
// sidebar column width.
const brand = (
  <span
    aria-label="Grubano — Centre d'aide"
    className="hd__brand"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', lineHeight: 1 }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/grubano-symbol.svg"
      alt="Grubano"
      height={21}
      style={{ height: 21, width: 'auto', flexShrink: 0, display: 'block' }}
    />
    <b className="grubano-logo__wordmark" style={{ fontSize: '0.95rem' }}>Grubano</b>
    <span className="grubano-logo__badge" style={{ fontSize: '0.72rem' }}>Centre d’aide</span>
  </span>
)

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const langKey: Lang = (lang in UI ? lang : 'fr') as Lang
  const t = UI[langKey]

  const pageMap = await getPageMap(`/${lang}`)

  // Navbar search slot: on doc pages NavbarSearch shows a scope toggle —
  // « Toute la doc » (global Pagefind, default) ↔ « Cette page » (in-page
  // section search). On the home it renders nothing (the hero hosts the global
  // field). This keeps whole-doc search reachable from every article.
  const search = <NavbarSearch lang={lang} />

  // Navbar — logo left, search middle (from Layout's search prop),
  // then children on the right: "Accueil" link + custom LangSwitch.
  // No projectLink (removes GitHub icon), no i18n (removes Nextra's
  // LocaleSwitch — replaced by our LangSwitch). Theme switch hidden via CSS.
  const navbar = (
    <Navbar logo={brand}>
      <a href={`/${lang}/`} className="hd__link" aria-label={t.home}>
        <span className="ms">home</span>
        <span>{t.home}</span>
      </a>
      <LangSwitch />
    </Navbar>
  )

  const footer = <SiteFooter locale={lang} />

  return (
    <>
      <Head />
      <Layout
        navbar={navbar}
        pageMap={pageMap}
        footer={footer}
        search={search}
        // No docsRepositoryBase / editLink / feedback: the "Modifier cette page"
        // and "Une question ?" TOC links are Nextra chrome absent from the CD
        // mockups (and would re-expose a GitHub URL — kept for a future /dev/).
        editLink={null}
        feedback={{ content: null }}
        sidebar={{ defaultMenuCollapseLevel: 1 }}
        toc={t.toc}
      >
        <HtmlLangSync lang={lang} />
        <SidebarGroups />
        {children}
      </Layout>
    </>
  )
}
