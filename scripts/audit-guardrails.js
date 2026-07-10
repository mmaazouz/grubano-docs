#!/usr/bin/env node
/**
 * audit-guardrails.js — deterministic guardrail sweep over generated FR guides.
 * Catches the grep-detectable violations of the doc rulebook. Semantic checks
 * (tone, Pro framing nuance, role distinction) are done separately by a review
 * pass; this is the fast, high-precision net.
 *
 *   node scripts/audit-guardrails.js [dir]   (default: content/fr/guides)
 * Exits 1 if any HARD violation is found.
 */
const fs = require('fs')
const path = require('path')

const dir = process.argv[2] || path.join(__dirname, '..', 'content', 'fr', 'guides')

// Rules: { id, re, hard, why }. `hard` → fails the exit code.
const RULES = [
  // Brand names must never appear (use generic descriptions).
  { id: 'brand', hard: true, why: 'nom de marque interdit',
    re: /\b(Gnocchi\s*Bar|Le\s+Riz\s+Gourmand|Pasta\s*Fresca|Rollix|Bowl\s*Healthy|Mac\s*&?\s*Cheese)\b/gi },
  // Dark/ghost kitchen framing forbidden.
  { id: 'darkkitchen', hard: true, why: 'framing dark/ghost kitchen interdit',
    re: /\b(dark\s*kitchens?|ghost\s*kitchens?|cuisines?\s+fant[oô]mes?)\b/gi },
  // Forbidden Pro phrasings.
  { id: 'pro-visibilite', hard: true, why: 'Pro décrit comme visibilité (interdit)',
    re: /(visibilit[eé]\s+(accrue|augment)|boost\s+de\s+visibilit|mise\s+en\s+avant\s+dans\s+la\s+d[eé]couverte|appara[iî]tre\s+en\s+priorit[eé])/gi },
  { id: 'pro-stats', hard: true, why: 'Pro décrit comme statistiques avancées (interdit)',
    re: /statistiques?\s+avanc[eé]es?/gi },
  { id: 'pro-support', hard: true, why: 'Pro décrit comme support prioritaire (interdit)',
    re: /support\s+prioritaire/gi },
  { id: 'pro-affiliation', hard: true, why: 'Pro décrit comme accès affiliation (interdit)',
    re: /(d[eé]bloque[rz]?\s+l['’]affiliation|acc[eè]s\s+[aà]\s+l['’]affiliation)/gi },
  // Tutoiement (French UI must vouvoie). Word-boundary "tu/ton/tes/toi/ta".
  { id: 'tutoiement', hard: false, why: 'tutoiement possible (vérifier — « vous » requis)',
    re: /\b(tu\s+(peux|dois|as|es|veux|vas|fais|trouves|cliques|gagnes)|n['’]h[eé]site\s+pas\s+[aà]\s+te\b)/gi },
]

// Any percentage that is NOT the allowed 10 % commission is suspect (internal
// rate leak). We list every %-number and flag non-10 ones for human eyes.
const PCT_RE = /(\d+(?:[.,]\d+)?)\s*%/g
// Any monthly euro amount that is NOT 29 is suspect.
const EUR_MONTH_RE = /(\d+(?:[.,]\d+)?)\s*€\s*\/?\s*mois/gi

function line(src, idx) {
  return src.slice(0, idx).split('\n').length
}

let hard = 0
let soft = 0
const report = []

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
for (const f of files) {
  const abs = path.join(dir, f)
  const src = fs.readFileSync(abs, 'utf8')
  // Only audit generated pages (skip editorial stubs / hand-written).
  const isGenerated = /^generated:\s*true\s*$/m.test(src)
  const hits = []

  for (const r of RULES) {
    r.re.lastIndex = 0
    let m
    while ((m = r.re.exec(src))) {
      hits.push({ id: r.id, hard: r.hard, why: r.why, at: line(src, m.index), text: m[0] })
      if (r.hard) hard++
      else soft++
    }
  }
  // Percentages ≠ 10
  PCT_RE.lastIndex = 0
  let pm
  while ((pm = PCT_RE.exec(src))) {
    const val = pm[1].replace(',', '.')
    if (val !== '10') {
      hits.push({ id: 'pct', hard: false, why: `pourcentage « ${pm[0]} » ≠ 10 % — taux interne ?`, at: line(src, pm.index), text: pm[0] })
      soft++
    }
  }
  // €/mois ≠ 29
  EUR_MONTH_RE.lastIndex = 0
  let em
  while ((em = EUR_MONTH_RE.exec(src))) {
    const val = em[1].replace(',', '.')
    if (val !== '29') {
      hits.push({ id: 'eur', hard: false, why: `forfait « ${em[0]} » ≠ 29 €/mois — tarif inventé ?`, at: line(src, em.index), text: em[0] })
      soft++
    }
  }
  // Visual present? (v5 requires an "Aperçu visuel" — a component or mermaid.)
  const hasVisual = /<(FlowDiagram|JourneyStrip|RelatedActors|MiniMap|Comparison|LearningPath)\b/.test(src) || /```mermaid/.test(src)
  if (isGenerated && !hasVisual) {
    hits.push({ id: 'no-visual', hard: false, why: 'aucun visuel (Aperçu visuel v5 manquant)', at: 1, text: '' })
    soft++
  }

  if (hits.length) {
    report.push({ file: f, generated: isGenerated, hits })
  }
}

for (const r of report) {
  console.log(`\n${r.file}${r.generated ? '' : '  (non-généré)'}`)
  for (const h of r.hits) {
    console.log(`  ${(h.hard ? 'HARD' : 'soft').padEnd(4)} L${String(h.at).padEnd(4)} [${h.id}] ${h.why}${h.text ? ` → « ${h.text} »` : ''}`)
  }
}
console.log(`\n── ${files.length} fichiers · ${hard} HARD · ${soft} soft ──`)
process.exit(hard > 0 ? 1 : 0)
