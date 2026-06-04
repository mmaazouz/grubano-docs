import type { ReactNode } from 'react'

/**
 * Small horizontal flow diagram for feature pages — a row of pill-shaped
 * step boxes connected by orange arrows. Wraps onto multiple lines on
 * narrow viewports; readable as a plain ordered list when CSS is missing.
 *
 * Usage in MDX (the component is registered globally via mdx-components.ts,
 * so no import is needed in the page):
 *
 *   <FlowDiagram steps={[
 *     'Ajouter un article',
 *     'Définir un seuil mini',
 *     'Alerte de réappro',
 *     'Prévision 7j',
 *   ]} />
 *
 * Pure server component, zero client JS.
 */
export function FlowDiagram({
  steps,
  label,
}: {
  steps: string[]
  label?: string
}): ReactNode {
  if (!steps?.length) return null
  return (
    <aside
      className="grubano-flow"
      aria-label={label || 'Schéma de flux'}
    >
      <ol className="grubano-flow__list">
        {steps.map((step, i) => (
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
