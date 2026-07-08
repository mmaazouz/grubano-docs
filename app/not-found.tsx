import type { ReactNode } from 'react'

/**
 * Custom 404 — matches the CD mockup (404.html): brand header, big gradient
 * "404", headline, a search box that sends the visitor to the help-center
 * home, a "Retour à l'accueil" CTA, and a grid of popular articles.
 *
 * Rendered by Next.js App Router for any unmatched route. It lives outside
 * the [lang] Nextra Layout, so it carries its own minimal header/footer —
 * hence the self-contained markup here.
 */

const POPULAR: { icon: string; title: string; sub: string; href: string }[] = [
  { icon: 'bolt',        title: 'Comment ça marche',   sub: 'Commander pas à pas',   href: '/fr/getting-started/' },
  { icon: 'credit_card', title: 'Payer votre commande', sub: 'Modes de paiement',    href: '/fr/guides/consumer/' },
  { icon: 'near_me',     title: 'Suivre votre commande', sub: 'Statut en temps réel', href: '/fr/guides/consumer/' },
  { icon: 'person_add',  title: 'Créer un compte',     sub: 'E-mail, Google ou Apple', href: '/fr/guides/consumer/' },
]

export default function NotFound(): ReactNode {
  return (
    <div className="nf">
      <header className="nf__hd">
        <a className="nf__brand" href="/fr/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/grubano-symbol.svg" alt="Grubano" height={26} />
          <b>Grubano</b>
          <span>Centre d’aide</span>
        </a>
      </header>

      <main className="nf__stage">
        <div className="nf__card">
          <div className="nf__big">404</div>
          <h1>Page introuvable</h1>
          <p>
            La page que vous cherchez n’existe pas ou a été déplacée. Essayez une
            recherche, ou revenez à l’accueil du centre d’aide.
          </p>

          <a className="nf__search" href="/fr/" aria-label="Rechercher">
            <span className="ms">search</span>
            <span>Rechercher un article, un guide, une question…</span>
          </a>

          <a className="nf__cta" href="/fr/">
            <span className="ms flip-rtl">arrow_back</span>
            Retour à l’accueil
          </a>

          <div className="nf__pop">
            <div className="nf__pop-t">Articles populaires</div>
            <div className="nf__pop-list">
              {POPULAR.map((p) => (
                <a className="nf__pop-card" href={p.href} key={p.title}>
                  <span className="nf__pop-ic"><span className="ms">{p.icon}</span></span>
                  <div className="nf__pop-m">
                    <b>{p.title}</b>
                    <span>{p.sub}</span>
                  </div>
                  <span className="ms flip-rtl">arrow_forward</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="nf__foot">© {new Date().getFullYear()} Grubano — Centre d’aide</footer>
    </div>
  )
}
