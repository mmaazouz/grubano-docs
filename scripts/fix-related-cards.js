#!/usr/bin/env node
/**
 * fix-related-cards.js — audit de fidélité article-v5, point 3.
 * La maquette montre 4 cartes « Articles liés » (grille 2×2) ; les fiches
 * générées en avaient 1 à 3. Remplace DÉTERMINISTIQUEMENT le bloc
 * <RelatedCards items={[…]} /> de chaque fiche FR générée par 4 cartes
 * calculées depuis le catalogue (related ∪ mirrors ∪ même public), sans
 * toucher au reste du contenu (le FR validé reste figé) et sans appel API.
 *
 *   node scripts/fix-related-cards.js [--dry]
 */
const fs = require('fs')
const path = require('path')
const { FEATURE_PAGES, TOPIC_EXTRAS } = require('./feature-pages.config.js')

const DRY = process.argv.includes('--dry')
const GUIDES = path.join(__dirname, '..', 'content', 'fr', 'guides')

/** 4 topics liés pour `key` : related, puis mirrors, puis même public. */
function relatedFour(key) {
  const cfg = FEATURE_PAGES[key]
  const seen = new Set([key])
  const out = []
  const push = (k) => {
    if (out.length >= 4 || seen.has(k)) return
    const t = FEATURE_PAGES[k]
    if (!t?.docPath || !TOPIC_EXTRAS[k]) return
    seen.add(k)
    out.push(k)
  }
  for (const k of cfg.related || []) push(k)
  for (const k of cfg.mirrors || []) push(k)
  for (const [k, t] of Object.entries(FEATURE_PAGES)) {
    if (out.length >= 4) break
    if (t.audience === cfg.audience) push(k)
  }
  // dernier recours : n'importe quel topic documenté
  for (const k of Object.keys(TOPIC_EXTRAS)) {
    if (out.length >= 4) break
    push(k)
  }
  return out
}

function cardsBlock(key) {
  const items = relatedFour(key).map((k) => {
    const t = FEATURE_PAGES[k]
    const x = TOPIC_EXTRAS[k]
    return `  {\n    icon: ${JSON.stringify(x.card.icon)},\n    title: ${JSON.stringify(t.title)},\n    sub: ${JSON.stringify(x.card.sub)},\n    href: ${JSON.stringify(`/fr${t.docPath}/`)}\n  }`
  })
  return `<RelatedCards items={[\n${items.join(',\n')}\n]} />`
}

let touched = 0
for (const [key, cfg] of Object.entries(FEATURE_PAGES)) {
  if (cfg.status !== 'generated' || cfg.locale !== 'fr') continue
  const file = path.join(GUIDES, cfg.docPath.split('/').pop() + '.mdx')
  if (!fs.existsSync(file)) continue
  const src = fs.readFileSync(file, 'utf8')
  const re = /<RelatedCards items=\{\[[\s\S]*?\]\}\s*\/>/
  if (!re.test(src)) {
    console.warn(`(pas de bloc RelatedCards) ${path.basename(file)}`)
    continue
  }
  const next = src.replace(re, cardsBlock(key))
  if (next !== src) {
    touched++
    if (DRY) console.log(`would fix: ${path.basename(file)} → [${relatedFour(key).join(', ')}]`)
    else {
      fs.writeFileSync(file, next)
      console.log(`fixed: ${path.basename(file)} → [${relatedFour(key).join(', ')}]`)
    }
  }
}
console.log(`${touched} fiche(s) mises à 4 cartes${DRY ? ' (dry-run)' : ''}`)
