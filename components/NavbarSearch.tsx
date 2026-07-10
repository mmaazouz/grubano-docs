'use client'

import { usePathname } from 'next/navigation'
import { InPageSearch } from './InPageSearch'

/**
 * Decides what the navbar search slot renders, per route:
 *  - HOME (/, /fr, /fr/, /en, /en/): nothing — the home hero hosts the GLOBAL
 *    site search, so a second global field in the navbar would be redundant
 *    (and the CD home mockup has no header search).
 *  - Any other page (articles): the in-page search, scoped to the current
 *    article only.
 */
export function NavbarSearch({ lang = 'fr' }: { lang?: string }) {
  const pathname = usePathname() || '/'
  const isHome = /^\/([a-z]{2})\/?$/.test(pathname) || pathname === '/'
  if (isHome) return null
  return <InPageSearch lang={lang} />
}
