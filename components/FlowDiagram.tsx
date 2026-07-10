import type { ReactNode } from 'react'

/**
 * Horizontal flow diagram for feature pages.
 *
 * Two input shapes (both registered globally via mdx-components.ts):
 *   - RICH (article-v5 mockup .flow): steps = [{ icon, title, desc }] →
 *     card frieze with icon tile + ink number badge + title + description.
 *   - LEGACY: steps = string[] → the original pill row (kept so the pages
 *     not yet regenerated keep rendering).
 *
 * Pure server component, zero client JS.
 */

type RichStep = { icon: string; title: string; desc?: string }

export function FlowDiagram({
  steps,
  label,
}: {
  steps: (string | RichStep)[]
  label?: string
}): ReactNode {
  if (!steps?.length) return null

  const rich = typeof steps[0] === 'object'
  if (rich) {
    const rs = steps as RichStep[]
    return (
      <aside
        className="avflow"
        style={{ ['--av-cols' as string]: String(rs.length || 1) }}
        aria-label={label || 'Schéma de flux'}
      >
        {rs.map((s, i) => (
          <div className="avflow__step" key={i}>
            <div className="avflow__ic">
              <span className="ms">{s.icon}</span>
              <span className="avflow__n">{i + 1}</span>
            </div>
            <div className="avflow__m">
              <div className="avflow__t">{s.title}</div>
              {s.desc && <div className="avflow__d">{s.desc}</div>}
            </div>
          </div>
        ))}
      </aside>
    )
  }

  return (
    <aside className="grubano-flow" aria-label={label || 'Schéma de flux'}>
      <ol className="grubano-flow__list">
        {(steps as string[]).map((step, i) => (
          <li className="grubano-flow__step" key={i}>
            <span className="grubano-flow__index" aria-hidden="true">
              {i + 1}
            </span>
            <span className="grubano-flow__label">{step}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
