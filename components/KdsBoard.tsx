'use client'

import { usePathname } from 'next/navigation'

/**
 * KdsBoard — illustration « écran cuisine (KDS) » (maquette CD component-kds.html) :
 * trois colonnes À préparer / En préparation / Prêt, tickets avec minuteur et
 * bouton d'avancement, légende de flux. Illustration statique — aucun JS client
 * hormis la détection de langue ; les animations sont en CSS pur, gardées par
 * prefers-reduced-motion. Classes kdsv-* dans app/article-v5.css. Localisé
 * (FR/EN/ES/AR/IT) via le chemin. « Click & collect » = terme de marque gardé
 * verbatim dans toutes les langues. AR = traduction auto, relecture arabophone due.
 */

const LANGS = ['fr', 'en', 'es', 'ar', 'it'] as const
type Lang = (typeof LANGS)[number]

function useLang(): Lang {
  const pathname = usePathname() || '/fr/'
  const seg = pathname.split('/')[1]
  return (LANGS as readonly string[]).includes(seg) ? (seg as Lang) : 'fr'
}

type Mode = 'deliv' | 'cc' | 'place'
type Bump = 'start' | 'ready' | 'ok'

type Dict = {
  head1: string // « Cuisine — » préfixe
  restaurant: string
  service: string
  live: string
  cols: { todo: string; prep: string; done: string }
  modes: Record<Mode, string>
  bumps: Record<Bump, string>
  hint: string
  legendNote: string
  items: Record<string, string> // clé item → libellé localisé
  optNoSalt: string
}

const D: Record<Lang, Dict> = {
  fr: {
    head1: 'Cuisine — ', restaurant: 'Chez Waguih', service: 'Service du soir', live: 'En direct',
    cols: { todo: 'À préparer', prep: 'En préparation', done: 'Prêt' },
    modes: { deliv: 'Livraison', cc: 'Click & collect', place: 'Sur place' },
    bumps: { start: 'Commencer', ready: 'Prêt', ok: 'Prêt — à remettre' },
    hint: 'avance vers « Prêt »',
    legendNote: 'Le minuteur passe à l’orange puis au rouge si le ticket traîne.',
    optNoSalt: '— sans sel',
    items: { burger: 'Burger maison', fries: 'Frites', lemonade: 'Limonade', pizza: 'Pizza reine', tiramisu: 'Tiramisu', caesar: 'Salade César', carbonara: 'Pâtes carbonara', poke: 'Poke bowl saumon', icedtea: 'Thé glacé', wrap: 'Wrap poulet', cookie: 'Cookie' },
  },
  en: {
    head1: 'Kitchen — ', restaurant: 'Chez Waguih', service: 'Evening service', live: 'Live',
    cols: { todo: 'To prepare', prep: 'In progress', done: 'Ready' },
    modes: { deliv: 'Delivery', cc: 'Click & collect', place: 'Dine-in' },
    bumps: { start: 'Start', ready: 'Ready', ok: 'Ready — to hand over' },
    hint: 'moving to “Ready”',
    legendNote: 'The timer turns orange, then red, if a ticket lingers.',
    optNoSalt: '— no salt',
    items: { burger: 'House burger', fries: 'Fries', lemonade: 'Lemonade', pizza: 'Margherita pizza', tiramisu: 'Tiramisu', caesar: 'Caesar salad', carbonara: 'Pasta carbonara', poke: 'Salmon poke bowl', icedtea: 'Iced tea', wrap: 'Chicken wrap', cookie: 'Cookie' },
  },
  es: {
    head1: 'Cocina — ', restaurant: 'Chez Waguih', service: 'Servicio de noche', live: 'En directo',
    cols: { todo: 'Por preparar', prep: 'En preparación', done: 'Listo' },
    modes: { deliv: 'Entrega', cc: 'Click & collect', place: 'En el local' },
    bumps: { start: 'Empezar', ready: 'Listo', ok: 'Listo — para entregar' },
    hint: 'avanza a «Listo»',
    legendNote: 'El temporizador se pone naranja y luego rojo si el ticket se demora.',
    optNoSalt: '— sin sal',
    items: { burger: 'Hamburguesa de la casa', fries: 'Patatas fritas', lemonade: 'Limonada', pizza: 'Pizza margarita', tiramisu: 'Tiramisú', caesar: 'Ensalada César', carbonara: 'Pasta carbonara', poke: 'Poke bowl de salmón', icedtea: 'Té helado', wrap: 'Wrap de pollo', cookie: 'Galleta' },
  },
  ar: {
    head1: 'المطبخ — ', restaurant: 'Chez Waguih', service: 'خدمة المساء', live: 'مباشر',
    cols: { todo: 'قيد التحضير', prep: 'جارٍ التحضير', done: 'جاهز' },
    modes: { deliv: 'التوصيل', cc: 'Click & collect', place: 'في المطعم' },
    bumps: { start: 'ابدأ', ready: 'جاهز', ok: 'جاهز — للتسليم' },
    hint: 'ينتقل إلى «جاهز»',
    legendNote: 'يتحوّل المؤقّت إلى البرتقالي ثم الأحمر إذا تأخّر الطلب.',
    optNoSalt: '— بدون ملح',
    items: { burger: 'برغر البيت', fries: 'بطاطس مقلية', lemonade: 'ليموناضة', pizza: 'بيتزا مارغريتا', tiramisu: 'تيراميسو', caesar: 'سلطة سيزر', carbonara: 'باستا كاربونارا', poke: 'بوكي بول بالسلمون', icedtea: 'شاي مثلّج', wrap: 'راب دجاج', cookie: 'كوكي' },
  },
  it: {
    head1: 'Cucina — ', restaurant: 'Chez Waguih', service: 'Servizio serale', live: 'In diretta',
    cols: { todo: 'Da preparare', prep: 'In preparazione', done: 'Pronto' },
    modes: { deliv: 'Consegna', cc: 'Click & collect', place: 'Al tavolo' },
    bumps: { start: 'Inizia', ready: 'Pronto', ok: 'Pronto — da consegnare' },
    hint: 'avanza a «Pronto»',
    legendNote: 'Il timer diventa arancione e poi rosso se il ticket si attarda.',
    optNoSalt: '— senza sale',
    items: { burger: 'Burger della casa', fries: 'Patatine', lemonade: 'Limonata', pizza: 'Pizza margherita', tiramisu: 'Tiramisù', caesar: 'Insalata Cesare', carbonara: 'Pasta carbonara', poke: 'Poke bowl al salmone', icedtea: 'Tè freddo', wrap: 'Wrap di pollo', cookie: 'Biscotto' },
  },
}

const MODE_ICON: Record<Mode, string> = { deliv: 'local_shipping', cc: 'shopping_bag', place: 'restaurant' }
const BUMP_ICON: Record<Bump, string> = { start: 'play_arrow', ready: 'check', ok: 'done_all' }

type Ticket = {
  num: string
  mode: Mode
  timer: string
  timerState?: 'warn' | 'late'
  done?: boolean
  items: { q: string; key: string; noSalt?: boolean }[]
  bump: Bump
  moving?: boolean
}

const COLUMNS: { key: 'todo' | 'prep' | 'done'; tickets: Ticket[] }[] = [
  {
    key: 'todo',
    tickets: [
      { num: '#A-118', mode: 'deliv', timer: '0:45', bump: 'start', items: [{ q: '1×', key: 'burger' }, { q: '1×', key: 'fries', noSalt: true }, { q: '1×', key: 'lemonade' }] },
      { num: '#A-119', mode: 'cc', timer: '0:20', bump: 'start', items: [{ q: '2×', key: 'pizza' }, { q: '1×', key: 'tiramisu' }] },
    ],
  },
  {
    key: 'prep',
    tickets: [
      { num: '#A-116', mode: 'place', timer: '6:10', timerState: 'warn', bump: 'ready', moving: true, items: [{ q: '1×', key: 'caesar' }, { q: '1×', key: 'carbonara' }] },
      { num: '#A-117', mode: 'deliv', timer: '3:30', bump: 'ready', items: [{ q: '1×', key: 'poke' }, { q: '1×', key: 'icedtea' }] },
    ],
  },
  {
    key: 'done',
    tickets: [
      { num: '#A-114', mode: 'cc', timer: '9:05', done: true, bump: 'ok', items: [{ q: '1×', key: 'wrap' }, { q: '1×', key: 'cookie' }] },
    ],
  },
]

export function KdsBoard() {
  const d = D[useLang()]
  return (
    <aside className="kdsv" aria-label={`${d.cols.todo} · ${d.cols.prep} · ${d.cols.done}`}>
      <div className="kdsv-board">
        <div className="kdsv-top">
          <span className="kdsv-top__badge"><span className="ms">skillet</span></span>
          <div className="kdsv-top__t">
            <b>{d.head1}{d.restaurant}</b>
            <span>{d.service}</span>
          </div>
          <span className="kdsv-live"><span className="kdsv-live__dot" />{d.live}</span>
        </div>

        <div className="kdsv-cols">
          {COLUMNS.map((c) => (
            <div className={`kdsv-col kdsv-col--${c.key}`} key={c.key}>
              <div className="kdsv-col__h">
                <span className="kdsv-col__dot" />
                <b>{d.cols[c.key]}</b>
                <span className="kdsv-col__n">{c.tickets.length}</span>
              </div>
              <div className="kdsv-col__list">
                {c.tickets.map((t) => (
                  <div className={`kdsv-tk${t.moving ? ' kdsv-tk--moving' : ''}`} key={t.num}>
                    <div className="kdsv-tk__top">
                      <span className="kdsv-tk__num">{t.num}</span>
                      <span className={`kdsv-tk__mode kdsv-tk__mode--${t.mode}`}>
                        <span className="ms">{MODE_ICON[t.mode]}</span>
                        {d.modes[t.mode]}
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
                            {d.items[it.key]}
                            {it.noSalt && <span className="kdsv-opt"> {d.optNoSalt}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <span className={`kdsv-tk__bump kdsv-tk__bump--${t.bump}`}>
                      <span className="ms">{BUMP_ICON[t.bump]}</span>
                      {d.bumps[t.bump]}
                    </span>
                    {t.moving && (
                      <div className="kdsv-tk__hint">
                        <span>{d.hint}</span>
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
        <span className="kdsv-legend__step kdsv-legend__step--todo"><span className="kdsv-legend__d" />{d.cols.todo}</span>
        <span className="ms kdsv-legend__ar flip-rtl">arrow_forward</span>
        <span className="kdsv-legend__step kdsv-legend__step--prep"><span className="kdsv-legend__d" />{d.cols.prep}</span>
        <span className="ms kdsv-legend__ar flip-rtl">arrow_forward</span>
        <span className="kdsv-legend__step kdsv-legend__step--done"><span className="kdsv-legend__d" />{d.cols.done}</span>
        <span className="kdsv-legend__note"><span className="ms">bolt</span>{d.legendNote}</span>
      </div>
    </aside>
  )
}
