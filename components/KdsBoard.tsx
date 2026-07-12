/**
 * KdsBoard — illustration « écran cuisine (KDS) » reprise de la maquette CD
 * validée (component-kds.html) : trois colonnes À préparer / En préparation /
 * Prêt, tickets avec minuteur et bouton d'avancement, légende de flux.
 * Illustration statique de doc — aucun JS client, aucun setInterval : les
 * animations de la maquette sont en CSS pur, gardées par
 * prefers-reduced-motion. Classes kdsv-* stylées dans app/article-v5.css.
 * Lexique canonique : modes « Livraison », « Click & collect », « Sur place ».
 * Server component, zéro prop.
 */

type Mode = 'deliv' | 'cc' | 'place'

type Ticket = {
  num: string
  mode: Mode
  timer: string
  timerState?: 'warn' | 'late'
  /** ticket « Prêt » : icône check_circle à la place du minuteur */
  done?: boolean
  items: { q: string; name: string; opt?: string }[]
  bump: 'start' | 'ready' | 'ok'
  moving?: boolean
}

const MODES: Record<Mode, { icon: string; label: string }> = {
  deliv: { icon: 'local_shipping', label: 'Livraison' },
  cc: { icon: 'shopping_bag', label: 'Click & collect' },
  place: { icon: 'restaurant', label: 'Sur place' },
}

const BUMPS: Record<Ticket['bump'], { icon: string; label: string }> = {
  start: { icon: 'play_arrow', label: 'Commencer' },
  ready: { icon: 'check', label: 'Prêt' },
  ok: { icon: 'done_all', label: 'Prêt — à remettre' },
}

const COLUMNS: { key: 'todo' | 'prep' | 'done'; title: string; tickets: Ticket[] }[] = [
  {
    key: 'todo',
    title: 'À préparer',
    tickets: [
      {
        num: '#A-118', mode: 'deliv', timer: '0:45', bump: 'start',
        items: [
          { q: '1×', name: 'Burger maison' },
          { q: '1×', name: 'Frites', opt: '— sans sel' },
          { q: '1×', name: 'Limonade' },
        ],
      },
      {
        num: '#A-119', mode: 'cc', timer: '0:20', bump: 'start',
        items: [
          { q: '2×', name: 'Pizza reine' },
          { q: '1×', name: 'Tiramisu' },
        ],
      },
    ],
  },
  {
    key: 'prep',
    title: 'En préparation',
    tickets: [
      {
        num: '#A-116', mode: 'place', timer: '6:10', timerState: 'warn', bump: 'ready', moving: true,
        items: [
          { q: '1×', name: 'Salade César' },
          { q: '1×', name: 'Pâtes carbonara' },
        ],
      },
      {
        num: '#A-117', mode: 'deliv', timer: '3:30', bump: 'ready',
        items: [
          { q: '1×', name: 'Poke bowl saumon' },
          { q: '1×', name: 'Thé glacé' },
        ],
      },
    ],
  },
  {
    key: 'done',
    title: 'Prêt',
    tickets: [
      {
        num: '#A-114', mode: 'cc', timer: '9:05', done: true, bump: 'ok',
        items: [
          { q: '1×', name: 'Wrap poulet' },
          { q: '1×', name: 'Cookie' },
        ],
      },
    ],
  },
]

export function KdsBoard() {
  return (
    <aside
      className="kdsv"
      aria-label="Illustration : écran cuisine (KDS) — trois colonnes, À préparer, En préparation, Prêt"
    >
      <div className="kdsv-board">
        <div className="kdsv-top">
          <span className="kdsv-top__badge"><span className="ms">skillet</span></span>
          <div className="kdsv-top__t">
            <b>Cuisine — Chez Waguih</b>
            <span>Service du soir</span>
          </div>
          <span className="kdsv-live"><span className="kdsv-live__dot" />En direct</span>
        </div>

        <div className="kdsv-cols">
          {COLUMNS.map((c) => (
            <div className={`kdsv-col kdsv-col--${c.key}`} key={c.key}>
              <div className="kdsv-col__h">
                <span className="kdsv-col__dot" />
                <b>{c.title}</b>
                <span className="kdsv-col__n">{c.tickets.length}</span>
              </div>
              <div className="kdsv-col__list">
                {c.tickets.map((t) => (
                  <div className={`kdsv-tk${t.moving ? ' kdsv-tk--moving' : ''}`} key={t.num}>
                    <div className="kdsv-tk__top">
                      <span className="kdsv-tk__num">{t.num}</span>
                      <span className={`kdsv-tk__mode kdsv-tk__mode--${t.mode}`}>
                        <span className="ms">{MODES[t.mode].icon}</span>
                        {MODES[t.mode].label}
                      </span>
                      <span className={`kdsv-tk__timer${t.timerState ? ` kdsv-tk__timer--${t.timerState}` : ''}`}>
                        <span className="ms">{t.done ? 'check_circle' : 'timer'}</span>
                        {t.timer}
                      </span>
                    </div>
                    <ul className="kdsv-tk__items">
                      {t.items.map((it, i) => (
                        <li key={i}>
                          <span className="kdsv-q">{it.q}</span>
                          <span>
                            {it.name}
                            {it.opt && <span className="kdsv-opt"> {it.opt}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <span className={`kdsv-tk__bump kdsv-tk__bump--${t.bump}`}>
                      <span className="ms">{BUMPS[t.bump].icon}</span>
                      {BUMPS[t.bump].label}
                    </span>
                    {t.moving && (
                      <div className="kdsv-tk__hint">
                        <span>avance vers « Prêt »</span>
                        <span className="ms flip-rtl">arrow_forward</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kdsv-legend">
        <span className="kdsv-legend__step kdsv-legend__step--todo"><span className="kdsv-legend__d" />À préparer</span>
        <span className="ms kdsv-legend__ar flip-rtl">arrow_forward</span>
        <span className="kdsv-legend__step kdsv-legend__step--prep"><span className="kdsv-legend__d" />En préparation</span>
        <span className="ms kdsv-legend__ar flip-rtl">arrow_forward</span>
        <span className="kdsv-legend__step kdsv-legend__step--done"><span className="kdsv-legend__d" />Prêt</span>
        <span className="kdsv-legend__note"><span className="ms">bolt</span>Le minuteur passe à l’orange puis au rouge si le ticket traîne.</span>
      </div>
    </aside>
  )
}
