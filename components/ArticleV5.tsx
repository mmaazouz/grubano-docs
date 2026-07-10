'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ArticleV5 — composants d'article alignés sur docs/article-v5.html
 * (maquette CD validée). Classes av-* stylées dans app/article-v5.css.
 * Client component file: ArticleMeta/Feedback need the pathname/state; the
 * rest are trivial so they share the module (bundle stays tiny).
 */

const LANGS = ['fr', 'en', 'es', 'ar', 'it'] as const
type Lang = (typeof LANGS)[number]

function useLang(): Lang {
  const pathname = usePathname() || '/fr/'
  const seg = pathname.split('/')[1]
  return (LANGS as readonly string[]).includes(seg) ? (seg as Lang) : 'fr'
}

const META_LABELS: Record<Lang, { for: string; read: string; min: string; updated: string }> = {
  fr: { for: 'Pour :', read: 'Lecture :', min: 'min', updated: 'Mis à jour le' },
  en: { for: 'For:', read: 'Reading time:', min: 'min', updated: 'Updated on' },
  es: { for: 'Para:', read: 'Lectura:', min: 'min', updated: 'Actualizado el' },
  ar: { for: 'لـ:', read: 'القراءة:', min: 'د', updated: 'آخر تحديث في' },
  it: { for: 'Per:', read: 'Lettura:', min: 'min', updated: 'Aggiornato il' },
}

/* ── Zone 1 : ligne meta sous le lead ──────────────────────────────────── */
export function ArticleMeta({
  audience,
  minutes,
  updated,
}: {
  audience: string
  minutes: number
  updated: string // ISO date, e.g. "2026-07-10"
}) {
  const lang = useLang()
  const t = META_LABELS[lang]
  let dateStr = updated
  try {
    dateStr = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(updated + 'T12:00:00Z'),
    )
  } catch {
    /* keep ISO on bad input */
  }
  return (
    <div className="av-meta">
      <span className="av-meta__it"><span className="ms">group</span>{t.for} <b>{audience}</b></span>
      <span className="av-meta__it"><span className="ms">schedule</span>{t.read} <b>{minutes} {t.min}</b></span>
      <span className="av-meta__it"><span className="ms">update</span>{t.updated} <b>{dateStr}</b></span>
    </div>
  )
}

/* ── Eyebrow de section (kicker zest au-dessus du h2) ──────────────────── */
export function Eyebrow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="av-k">
      <span className="ms">{icon}</span>
      {children}
    </div>
  )
}

/* ── Encadré « L'essentiel » ───────────────────────────────────────────── */
export function Essentials({
  title,
  items = [],
}: {
  title: string
  items?: ReactNode[]
}) {
  return (
    <div className="av-ess">
      <span className="av-ess__ic"><span className="ms">bolt</span></span>
      <div className="av-ess__m">
        <b className="av-ess__t">{title}</b>
        <ul>
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ── Décomposition premium (tableau chiffré) ───────────────────────────── */
export function Breakdown({
  title,
  icon = 'calculate',
  rows = [],
}: {
  title: string
  icon?: string
  rows?: { icon: string; label: string; value: string; variant?: 'minus' | 'total' }[]
}) {
  return (
    <div className="av-ex">
      <div className="av-ex__hd"><span className="ms">{icon}</span>{title}</div>
      <div className="av-ex__rows">
        {rows.map((r, i) => (
          <div className={`av-ex__r${r.variant ? ` av-ex__r--${r.variant}` : ''}`} key={i}>
            <span className="av-ex__k">
              <span className="av-ex__kic"><span className="ms">{r.icon}</span></span>
              {r.label}
            </span>
            <span className="av-ex__v">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Cartes « articles liés » ──────────────────────────────────────────── */
export function RelatedCards({
  items = [],
}: {
  items?: { icon: string; title: string; sub?: string; href: string }[]
}) {
  return (
    <div className="av-more">
      {items.map((it, i) => (
        <a href={it.href} key={i}>
          <span className="av-more__ic"><span className="ms">{it.icon}</span></span>
          <div className="av-more__m">
            <b>{it.title}</b>
            {it.sub && <span>{it.sub}</span>}
          </div>
          <span className="ms flip-rtl">arrow_forward</span>
        </a>
      ))}
    </div>
  )
}

/* ── Feedback « Cet article vous a-t-il été utile ? » ──────────────────── */
const FB_LABELS: Record<Lang, { q: string; yes: string; no: string; thanks: string }> = {
  fr: { q: 'Cet article vous a-t-il été utile ?', yes: 'Oui', no: 'Non', thanks: 'Merci pour votre retour !' },
  en: { q: 'Was this article helpful?', yes: 'Yes', no: 'No', thanks: 'Thanks for your feedback!' },
  es: { q: '¿Le ha resultado útil este artículo?', yes: 'Sí', no: 'No', thanks: '¡Gracias por su opinión!' },
  ar: { q: 'هل كان هذا المقال مفيداً؟', yes: 'نعم', no: 'لا', thanks: 'شكراً على ملاحظتك!' },
  it: { q: 'Questo articolo ti è stato utile?', yes: 'Sì', no: 'No', thanks: 'Grazie per il tuo feedback!' },
}

export function Feedback() {
  const lang = useLang()
  const t = FB_LABELS[lang]
  const [done, setDone] = useState(false)
  return (
    <div className="av-fb">
      <b>{t.q}</b>
      {done ? (
        <span className="av-fb__thanks"><span className="ms">check_circle</span>{t.thanks}</span>
      ) : (
        <div className="av-fb__btns">
          <button type="button" onClick={() => setDone(true)}><span className="ms">thumb_up</span>{t.yes}</button>
          <button type="button" onClick={() => setDone(true)}><span className="ms">thumb_down</span>{t.no}</button>
        </div>
      )}
    </div>
  )
}

/* ── Précédent / Suivant (cartes) ──────────────────────────────────────── */
const PN_LABELS: Record<Lang, { prev: string; next: string }> = {
  fr: { prev: 'Précédent', next: 'Suivant' },
  en: { prev: 'Previous', next: 'Next' },
  es: { prev: 'Anterior', next: 'Siguiente' },
  ar: { prev: 'السابق', next: 'التالي' },
  it: { prev: 'Precedente', next: 'Successivo' },
}

export function PrevNext({
  prev,
  next,
}: {
  prev?: { title: string; href: string } | null
  next?: { title: string; href: string } | null
}) {
  const lang = useLang()
  const t = PN_LABELS[lang]
  if (!prev && !next) return null
  return (
    <nav className="av-pn">
      {prev ? (
        <a href={prev.href}>
          <span className="av-pn__l"><span className="ms flip-rtl">arrow_back</span>{t.prev}</span>
          <span className="av-pn__t">{prev.title}</span>
        </a>
      ) : (
        <a className="av-pn--ghost" aria-hidden="true" />
      )}
      {next ? (
        <a className="av-pn--next" href={next.href}>
          <span className="av-pn__l">{t.next}<span className="ms flip-rtl">arrow_forward</span></span>
          <span className="av-pn__t">{next.title}</span>
        </a>
      ) : (
        <a className="av-pn--ghost" aria-hidden="true" />
      )}
    </nav>
  )
}
