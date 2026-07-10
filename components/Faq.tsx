'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

/**
 * FAQ accordéon — single-open comme docs/article-v5.html (ouvrir une question
 * referme les autres). Remplace la version <details> multi-open de DocVisuals.
 * Mêmes classes gbv-qa (stylées gbv-components.css + article-v5.css).
 */
export function Faq({
  items = [],
}: {
  items?: { icon?: string; q: string; a: ReactNode }[]
}) {
  const [open, setOpen] = useState(0)
  return (
    <div className="gbv-faq">
      {items.map((it, i) => (
        <details
          className="gbv-qa"
          key={i}
          open={open === i}
          onToggle={(e) => {
            if ((e.target as HTMLDetailsElement).open && open !== i) setOpen(i)
          }}
        >
          <summary
            className="gbv-qa__q"
            onClick={(e) => {
              e.preventDefault()
              setOpen(open === i ? -1 : i)
            }}
          >
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
