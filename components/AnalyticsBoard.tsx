/**
 * AnalyticsBoard — illustration « data-viz Analyses » reprise de la maquette CD
 * validée (component-analytics.html) : grille de stat-tiles (Chiffre
 * d'affaires, Commandes, Panier moyen, Note moyenne) avec variation, et une
 * rangée de sparklines de tendance. Illustration statique de doc — aucun JS
 * client : les animations de tracé sont en CSS pur, gardées par
 * prefers-reduced-motion. Classes anav-* stylées dans app/article-v5.css.
 * Données d'exemple. Lexique canonique respecté (aucun libellé de mode ici).
 * Server component, zéro prop.
 */

type Tile = {
  icon: string
  label: string
  value: string
  unit?: string
  chip: { dir: 'up' | 'down'; text: string }
  cmp: string
}

const TILES: Tile[] = [
  { icon: 'payments', label: 'Chiffre d’affaires', value: '12 480', unit: ' €', chip: { dir: 'up', text: '+12 %' }, cmp: 'vs 7 j préc.' },
  { icon: 'receipt_long', label: 'Commandes', value: '486', chip: { dir: 'up', text: '+8 %' }, cmp: 'vs 7 j préc.' },
  { icon: 'shopping_basket', label: 'Panier moyen', value: '25,70', unit: ' €', chip: { dir: 'down', text: '−5 %' }, cmp: 'vs 7 j préc.' },
  { icon: 'star', label: 'Note moyenne', value: '4,8', unit: ' ★', chip: { dir: 'up', text: '+0,2' }, cmp: 'vs 7 j préc.' },
]

export function AnalyticsBoard() {
  return (
    <aside className="anav" aria-label="Illustration : indicateurs de la page Analyses (données d’exemple)">
      <div className="anav-tiles">
        {TILES.map((t) => (
          <div className="anav-tile" key={t.label}>
            <div className="anav-tile__h">
              <span className="anav-tile__ic"><span className="ms">{t.icon}</span></span>
              <span className="anav-tile__lbl">{t.label}</span>
            </div>
            <div className="anav-tile__v">
              {t.value}
              {t.unit && <span className="anav-u">{t.unit}</span>}
            </div>
            <div className="anav-tile__foot">
              <span className={`anav-chip anav-chip--${t.chip.dir}`}>
                <span className="ms">{t.chip.dir === 'up' ? 'arrow_upward' : 'arrow_downward'}</span>
                {t.chip.text}
              </span>
              <span className="anav-tile__cmp">{t.cmp}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="anav-spark-row">
        <div className="anav-scard">
          <div className="anav-scard__top">
            <div>
              <div className="anav-scard__lbl">Chiffre d’affaires · 7 jours</div>
              <div className="anav-scard__v">12 480 €</div>
            </div>
            <span className="anav-chip anav-chip--up anav-scard__chip"><span className="ms">arrow_upward</span>+12 %</span>
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
            <div className="anav-spark__x"><span>Lun</span><span>Dim</span></div>
          </div>
        </div>

        <div className="anav-scard">
          <div className="anav-scard__top">
            <div>
              <div className="anav-scard__lbl">Commandes · 7 jours</div>
              <div className="anav-scard__v">486</div>
            </div>
            <span className="anav-chip anav-chip--up anav-scard__chip"><span className="ms">arrow_upward</span>+8 %</span>
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
          <div className="anav-spark__x"><span>Lun</span><span>Dim</span></div>
        </div>
      </div>

      <p className="anav-note">
        <span className="ms">info</span>
        <span>Données d’exemple. Le point final de la courbe met en avant la valeur du jour ; la comparaison avec la période précédente et la note moyenne font partie des enrichissements à venir.</span>
      </p>
    </aside>
  )
}
