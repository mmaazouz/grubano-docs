import type { ReactNode } from 'react'

/**
 * DocVisuals — the CD visual component family for the v5 pedagogical template.
 * Re-implemented in React from the CD mockups (cartes-reliees, frise-parcours,
 * mini-carte, parcours-guide, comparaison, faq). All classes are `gbv-*`
 * prefixed (styled in app/globals.css) to avoid any collision with Nextra.
 * Server components, no client JS (FAQ uses native <details>).
 */

/* ── RelatedActors — "cartes reliées" (acteurs reliés par des flèches) ──── */
export function RelatedActors({
  title,
  subtitle,
  nodes = [],
  returnNote,
}: {
  title?: string
  subtitle?: string
  nodes?: { icon: string; label: string; desc?: string; variant?: 'zest' | 'ink'; to?: string }[]
  returnNote?: ReactNode
}) {
  return (
    <aside className="gbv-rel">
      {(title || subtitle) && (
        <div className="gbv-rel__head">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      <div className="gbv-rel__flow">
        {nodes.map((n, i) => (
          <>
            <div className={`gbv-node ${n.variant === 'ink' ? 'gbv-node--ink' : 'gbv-node--zest'}`} key={`n${i}`}>
              <span className="gbv-node__ic"><span className="ms">{n.icon}</span></span>
              <div className="gbv-node__m">
                <b>{n.label}</b>
                {n.desc && <span>{n.desc}</span>}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div className="gbv-conn" key={`c${i}`}>
                {n.to && <span className="gbv-conn__lbl">{n.to}</span>}
                <span className="gbv-conn__line">
                  <span className="gbv-conn__track" />
                  <span className="ms flip-rtl">arrow_forward</span>
                </span>
              </div>
            )}
          </>
        ))}
      </div>
      {returnNote && (
        <div className="gbv-rel__return">
          <span className="ms flip-rtl">u_turn_left</span>
          {returnNote}
        </div>
      )}
    </aside>
  )
}

/* ── JourneyStrip — "frise de parcours" (frise d'étapes numérotées) ─────── */
export function JourneyStrip({
  title,
  subtitle,
  steps = [],
}: {
  title?: string
  subtitle?: string
  steps?: { icon: string; title: string; desc?: string }[]
}) {
  return (
    <aside className="gbv-wf" style={{ ['--gbv-cols' as string]: String(steps.length || 1) }}>
      {(title || subtitle) && (
        <div className="gbv-wf__head">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      <div className="gbv-wf__track">
        {steps.map((s, i) => (
          <div className="gbv-step" key={i}>
            <span className="gbv-step__ic">
              <span className="ms">{s.icon}</span>
              <span className="gbv-step__n">{i + 1}</span>
            </span>
            <div className="gbv-step__m">
              <div className="gbv-step__b">{s.title}</div>
              {s.desc && <div className="gbv-step__d">{s.desc}</div>}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

/* ── MiniMap — "mini-carte qui fait quoi" (hub central + satellites) ────── */
export function MiniMap({
  title,
  subtitle,
  center,
  blocks = [],
}: {
  title?: string
  subtitle?: string
  center: { icon: string; label: string; desc?: string }
  blocks?: { icon: string; title: string; role?: string; desc?: string }[]
}) {
  return (
    <aside className="gbv-map">
      {(title || subtitle) && (
        <div className="gbv-map__head">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      <div className="gbv-hub">
        <div className="gbv-hub__center">
          <span className="gbv-hub__ic"><span className="ms">{center.icon}</span></span>
          <b>{center.label}</b>
          {center.desc && <span>{center.desc}</span>}
        </div>
        <div className="gbv-hub__spokes"><span className="gbv-hub__ln" /></div>
        <div className="gbv-sat">
          {blocks.map((b, i) => (
            <div className="gbv-blk" key={i}>
              <div className="gbv-blk__top">
                <span className="gbv-blk__ic"><span className="ms">{b.icon}</span></span>
                <b>{b.title}</b>
              </div>
              {b.role && <span className="gbv-blk__role">{b.role}</span>}
              {b.desc && <p>{b.desc}</p>}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

/* ── LearningPath — "parcours guidé" (série d'articles ordonnés) ───────── */
export function LearningPath({
  title,
  subtitle,
  meta = [],
  steps = [],
}: {
  title?: string
  subtitle?: string
  meta?: { icon: string; text: string }[]
  steps?: { title: string; note?: string; status?: 'done' | 'current' | 'todo'; href?: string }[]
}) {
  const done = steps.filter((s) => s.status === 'done').length
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0
  const next = steps.find((s) => s.status === 'current') || steps.find((s) => s.status === 'todo')
  return (
    <aside className="gbv-lp">
      <div className="gbv-lp__hero">
        <span className="gbv-lp__eyebrow"><span className="ms">rocket_launch</span>Parcours guidé</span>
        {title && <h3>{title}</h3>}
        {subtitle && <p>{subtitle}</p>}
        {meta.length > 0 && (
          <div className="gbv-lp__meta">
            {meta.map((m, i) => (
              <span className="gbv-lp__it" key={i}><span className="ms">{m.icon}</span>{m.text}</span>
            ))}
          </div>
        )}
        <div className="gbv-lp__prog">
          <div className="gbv-lp__prog-top"><span>Votre progression</span><span>{done} / {steps.length} terminé</span></div>
          <div className="gbv-lp__bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
      </div>
      <div className="gbv-lp__steps">
        {steps.map((s, i) => {
          const st = s.status || 'todo'
          const Tag = (s.href ? 'a' : 'div') as 'a'
          return (
            <Tag className={`gbv-lp__step gbv-lp__step--${st}`} href={s.href} key={i}>
              <span className="gbv-lp__dot">
                {st === 'done' ? <span className="ms">check</span> : i + 1}
              </span>
              <div className="gbv-lp__m">
                <b>{s.title}</b>
                {s.note && <span><span className="ms">schedule</span>{s.note}</span>}
              </div>
              {st !== 'todo' && (
                <span className={`gbv-lp__badge gbv-lp__badge--${st}`}>{st === 'done' ? 'Terminé' : 'En cours'}</span>
              )}
              <span className="ms gbv-lp__go flip-rtl">arrow_forward</span>
            </Tag>
          )
        })}
      </div>
      {next && (
        <div className="gbv-lp__foot">
          <div className="gbv-lp__foot-m">Prochaine étape : <b>{next.title}</b></div>
        </div>
      )}
    </aside>
  )
}

/* ── Comparison — tableau comparatif (options en colonnes) ─────────────── */
export function Comparison({
  options = [],
  rows = [],
}: {
  options?: { icon: string; name: string; desc?: string; featured?: boolean; tag?: string }[]
  rows?: { label: string; icon?: string; values: ReactNode[] }[]
}) {
  return (
    <div className="gbv-cmp" style={{ ['--gbv-opts' as string]: String(options.length || 1) }}>
      <div className="gbv-cmp__grid">
        <div className="gbv-cmp__cell gbv-cmp__hd gbv-cmp__corner gbv-cmp__rowh" />
        {options.map((o, i) => (
          <div className={`gbv-cmp__cell gbv-cmp__hd`} key={`o${i}`}>
            <div className={`gbv-cmp__opt ${o.featured ? 'gbv-cmp__opt--feat' : ''}`}>
              {o.tag && <span className="gbv-cmp__tag">{o.tag}</span>}
              <span className="gbv-cmp__oic"><span className="ms">{o.icon}</span></span>
              <b>{o.name}</b>
              {o.desc && <span>{o.desc}</span>}
            </div>
          </div>
        ))}
        {rows.map((r, ri) => (
          <>
            <div className="gbv-cmp__cell gbv-cmp__rowh" key={`rh${ri}`}>
              {r.icon && <span className="ms">{r.icon}</span>}
              {r.label}
            </div>
            {r.values.map((v, vi) => (
              <div className={`gbv-cmp__cell gbv-cmp__val ${options[vi]?.featured ? 'gbv-cmp__val--feat' : ''}`} key={`v${ri}-${vi}`}>
                {v === true ? <span className="ms gbv-cmp__yes">check</span>
                  : v === false ? <span className="ms gbv-cmp__no">remove</span>
                  : v}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  )
}

/* ── Faq — accordéon natif <details> ───────────────────────────────────── */
export function Faq({
  items = [],
}: {
  items?: { icon?: string; q: string; a: ReactNode }[]
}) {
  return (
    <div className="gbv-faq">
      {items.map((it, i) => (
        <details className="gbv-qa" key={i} open={i === 0}>
          <summary className="gbv-qa__q">
            <span className="gbv-qa__ic"><span className="ms">{it.icon || 'help'}</span></span>
            <span className="gbv-qa__tw">{it.q}</span>
            <span className="ms gbv-qa__chev">expand_more</span>
          </summary>
          <div className="gbv-qa__a">{typeof it.a === 'string' ? <p>{it.a}</p> : it.a}</div>
        </details>
      ))}
    </div>
  )
}
