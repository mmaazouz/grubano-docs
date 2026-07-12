'use client'

import { usePathname } from 'next/navigation'

/**
 * AnalyticsBoard — illustration « data-viz Analyses » (maquette CD
 * component-analytics.html). Stat-tiles + sparklines de tendance.
 * Honnêteté live/bientôt (état réel du code) : les valeurs Chiffre d'affaires,
 * Commandes, Panier moyen sont LIVE (données d'exemple) ; les badges de
 * tendance (comparaison période précédente) et la Note moyenne sont « Bientôt ».
 * Illustration statique — aucun JS client hormis la détection de langue ; le
 * tracé animé est en CSS pur, gardé par prefers-reduced-motion. Classes anav-*
 * dans app/article-v5.css. Localisé (FR/EN/ES/AR/IT) via le chemin.
 */

const LANGS = ['fr', 'en', 'es', 'ar', 'it'] as const
type Lang = (typeof LANGS)[number]

function useLang(): Lang {
  const pathname = usePathname() || '/fr/'
  const seg = pathname.split('/')[1]
  return (LANGS as readonly string[]).includes(seg) ? (seg as Lang) : 'fr'
}

type T = {
  revenue: string
  orders: string
  basket: string
  rating: string
  soon: string
  trendSoon: string
  revenue7: string
  orders7: string
  mon: string
  sun: string
  note: string
}

const L: Record<Lang, T> = {
  fr: {
    revenue: 'Chiffre d’affaires', orders: 'Commandes', basket: 'Panier moyen', rating: 'Note moyenne',
    soon: 'Bientôt', trendSoon: 'Tendance bientôt',
    revenue7: 'Chiffre d’affaires · 7 jours', orders7: 'Commandes · 7 jours', mon: 'Lun', sun: 'Dim',
    note: 'Données d’exemple. La courbe des 7 derniers jours est réelle ; la comparaison avec la période précédente et la note moyenne font partie des enrichissements à venir.',
  },
  en: {
    revenue: 'Revenue', orders: 'Orders', basket: 'Average basket', rating: 'Average rating',
    soon: 'Soon', trendSoon: 'Trend soon',
    revenue7: 'Revenue · 7 days', orders7: 'Orders · 7 days', mon: 'Mon', sun: 'Sun',
    note: 'Sample data. The 7-day curve is live; comparison with the previous period and the average rating are among the upcoming additions.',
  },
  es: {
    revenue: 'Ingresos', orders: 'Pedidos', basket: 'Cesta media', rating: 'Nota media',
    soon: 'Pronto', trendSoon: 'Tendencia pronto',
    revenue7: 'Ingresos · 7 días', orders7: 'Pedidos · 7 días', mon: 'Lun', sun: 'Dom',
    note: 'Datos de ejemplo. La curva de los últimos 7 días es real; la comparación con el periodo anterior y la nota media forman parte de las próximas mejoras.',
  },
  ar: {
    revenue: 'الإيرادات', orders: 'الطلبات', basket: 'متوسط السلة', rating: 'متوسط التقييم',
    soon: 'قريباً', trendSoon: 'الاتجاه قريباً',
    revenue7: 'الإيرادات · 7 أيام', orders7: 'الطلبات · 7 أيام', mon: 'الإثنين', sun: 'الأحد',
    note: 'بيانات توضيحية. منحنى الأيام السبعة الأخيرة حقيقي؛ أما المقارنة مع الفترة السابقة ومتوسط التقييم فمن التحسينات القادمة.',
  },
  it: {
    revenue: 'Fatturato', orders: 'Ordini', basket: 'Scontrino medio', rating: 'Voto medio',
    soon: 'A breve', trendSoon: 'Tendenza a breve',
    revenue7: 'Fatturato · 7 giorni', orders7: 'Ordini · 7 giorni', mon: 'Lun', sun: 'Dom',
    note: 'Dati di esempio. La curva degli ultimi 7 giorni è reale; il confronto con il periodo precedente e il voto medio fanno parte dei prossimi miglioramenti.',
  },
}

/** muted « bientôt » badge (schedule icon + label) */
function Soon({ label }: { label: string }) {
  return (
    <span className="anav-soon">
      <span className="ms">schedule</span>
      {label}
    </span>
  )
}

export function AnalyticsBoard() {
  const t = L[useLang()]
  return (
    <aside className="anav" aria-label={t.revenue}>
      <div className="anav-tiles">
        {/* LIVE tiles — valeur d'exemple + badge « Tendance bientôt » */}
        <div className="anav-tile">
          <div className="anav-tile__h">
            <span className="anav-tile__ic"><span className="ms">payments</span></span>
            <span className="anav-tile__lbl">{t.revenue}</span>
          </div>
          <div className="anav-tile__v"><span className="anav-num">12 480</span><span className="anav-u"> €</span></div>
          <div className="anav-tile__foot"><Soon label={t.trendSoon} /></div>
        </div>
        <div className="anav-tile">
          <div className="anav-tile__h">
            <span className="anav-tile__ic"><span className="ms">receipt_long</span></span>
            <span className="anav-tile__lbl">{t.orders}</span>
          </div>
          <div className="anav-tile__v"><span className="anav-num">486</span></div>
          <div className="anav-tile__foot"><Soon label={t.trendSoon} /></div>
        </div>
        <div className="anav-tile">
          <div className="anav-tile__h">
            <span className="anav-tile__ic"><span className="ms">shopping_basket</span></span>
            <span className="anav-tile__lbl">{t.basket}</span>
          </div>
          <div className="anav-tile__v"><span className="anav-num">25,70</span><span className="anav-u"> €</span></div>
          <div className="anav-tile__foot"><Soon label={t.trendSoon} /></div>
        </div>
        {/* Note moyenne — métrique à venir : tuile en état « Bientôt » */}
        <div className="anav-tile anav-tile--soon">
          <div className="anav-tile__h">
            <span className="anav-tile__ic anav-tile__ic--soon"><span className="ms">star</span></span>
            <span className="anav-tile__lbl">{t.rating}</span>
          </div>
          <div className="anav-tile__v anav-tile__v--soon"><span className="anav-num">—</span></div>
          <div className="anav-tile__foot"><Soon label={t.soon} /></div>
        </div>
      </div>

      <div className="anav-spark-row">
        <div className="anav-scard">
          <div className="anav-scard__top">
            <div>
              <div className="anav-scard__lbl">{t.revenue7}</div>
              <div className="anav-scard__v"><span className="anav-num">12 480 €</span></div>
            </div>
            <span className="anav-scard__chip"><Soon label={t.trendSoon} /></span>
          </div>
          <div className="anav-spark">
            <svg viewBox="0 0 300 72" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="anav-sgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FF6A1F" stopOpacity=".22" />
                  <stop offset="1" stopColor="#FF6A1F" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="anav-area" d="M0,52 L50,44 L100,48 L150,30 L200,34 L250,20 L300,12 L300,72 L0,72 Z" fill="url(#anav-sgrad)" />
              <path className="anav-line" d="M0,52 L50,44 L100,48 L150,30 L200,34 L250,20 L300,12" />
              <circle className="anav-halo" cx="300" cy="12" r="9" />
              <circle className="anav-dot" cx="300" cy="12" r="4" />
            </svg>
            <div className="anav-spark__x"><span>{t.mon}</span><span>{t.sun}</span></div>
          </div>
        </div>

        <div className="anav-scard">
          <div className="anav-scard__top">
            <div>
              <div className="anav-scard__lbl">{t.orders7}</div>
              <div className="anav-scard__v"><span className="anav-num">486</span></div>
            </div>
            <span className="anav-scard__chip"><Soon label={t.trendSoon} /></span>
          </div>
          <svg className="anav-mini" viewBox="0 0 220 34" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="anav-mgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2BA45C" stopOpacity=".2" />
                <stop offset="1" stopColor="#2BA45C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="anav-mini__area" d="M0,24 L36,20 L73,26 L110,14 L146,18 L183,10 L220,8 L220,34 L0,34 Z" fill="url(#anav-mgrad)" />
            <path className="anav-mini__line" d="M0,24 L36,20 L73,26 L110,14 L146,18 L183,10 L220,8" />
            <circle className="anav-mini__dot" cx="220" cy="8" r="3.4" />
          </svg>
          <div className="anav-spark__x"><span>{t.mon}</span><span>{t.sun}</span></div>
        </div>
      </div>

      <p className="anav-note">
        <span className="ms">info</span>
        <span>{t.note}</span>
      </p>
    </aside>
  )
}
