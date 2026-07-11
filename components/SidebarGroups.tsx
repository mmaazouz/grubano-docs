'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * SidebarGroups — rend les catégories de la sidebar DÉPLIABLES comme la
 * maquette article-v5 (.side__group) : cliquer un en-tête de catégorie
 * (séparateur porteur de .sb-cat) plie/déplie ses articles ; la catégorie
 * contenant la page active est ouverte, les autres fermées.
 *
 * Enhancement DOM pur par-dessus le markup Nextra (les séparateurs ne sont
 * pas pliables nativement et transformer les sections en dossiers casserait
 * toutes les URLs). Sans JS, la sidebar reste entièrement dépliée — dégradé
 * acceptable.
 */
export function SidebarGroups() {
  const pathname = usePathname()

  useEffect(() => {
    const containers = document.querySelectorAll('.nextra-sidebar, .nextra-mobile-nav')
    if (!containers.length) return

    const lists = [] as HTMLUListElement[]
    for (const c of containers) lists.push(...c.querySelectorAll('ul'))
    for (const ul of lists) {
      const items = Array.from(ul.children) as HTMLElement[]
      const seps = items.filter((li) => li.querySelector(':scope > .sb-cat, .sb-cat'))
      if (!seps.length) continue

      for (const sep of seps) {
        // groupe = les <li> suivants jusqu'au prochain séparateur
        const group: HTMLElement[] = []
        let n = sep.nextElementSibling as HTMLElement | null
        while (n && !n.querySelector('.sb-cat')) {
          group.push(n)
          n = n.nextElementSibling as HTMLElement | null
        }
        const hasActive = group.some((li) => li.querySelector('a[aria-current], a[data-active], .active, a[class*="text-primary"]'))
        const setOpen = (open: boolean) => {
          sep.setAttribute('data-open', open ? 'true' : 'false')
          for (const li of group) li.style.display = open ? '' : 'none'
        }
        // chevron (une seule fois)
        const cat = sep.querySelector('.sb-cat')
        if (cat && !cat.querySelector('.sb-cat__ch')) {
          const ch = document.createElement('span')
          ch.className = 'ms sb-cat__ch flip-rtl'
          ch.textContent = 'chevron_right'
          cat.appendChild(ch)
        }
        setOpen(hasActive)
        if (!(sep as HTMLElement & { _sbWired?: boolean })._sbWired) {
          ;(sep as HTMLElement & { _sbWired?: boolean })._sbWired = true
          sep.addEventListener('click', () => {
            setOpen(sep.getAttribute('data-open') !== 'true')
          })
        }
      }
    }
  }, [pathname])

  return null
}
