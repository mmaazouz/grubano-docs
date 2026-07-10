#!/usr/bin/env node
/**
 * gen-state-diagram.js — build a Mermaid stateDiagram from a Prisma status
 * field's inline `// a|b|c` enum comment (the app uses String fields with a
 * pipe-listed comment rather than real Prisma enums).
 *
 * Exposes:
 *   parseStatusEnum(schemaSrc, modelName) -> string[]      (ordered states)
 *   buildStateDiagram(states, opts) -> string              (mermaid block body)
 *   orderLifecycleMermaid(appRepoPath) -> string           (the order cycle)
 *
 * CLI (prints the order lifecycle mermaid):
 *   APP_REPO_PATH=../grubano node scripts/gen-state-diagram.js [Model] [field]
 */

const fs = require('fs')
const path = require('path')

// Terminal "negative" states — reachable from any non-terminal step, then end.
const TERMINAL_RE = /cancel|annul|reject|refus|refund|rembours|expire|failed|echou/i

/** Extract the ordered enum values from `field  String  ... // a | b | c`. */
function parseStatusEnum(schemaSrc, modelName, fieldName = 'status') {
  if (!schemaSrc) return []
  const model = schemaSrc.match(new RegExp(`model\\s+${modelName}\\s*\\{[\\s\\S]*?\\n\\}`, 'm'))
  if (!model) return []
  const line = model[0]
    .split('\n')
    .find((l) => new RegExp(`^\\s*${fieldName}\\b`).test(l))
  if (!line) return []
  const comment = line.split('//')[1]
  if (!comment) return []
  return comment
    .split('|')
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9_]+$/i.test(s))
}

/** Human label for a state token: "picked_up" -> "Récupérée". Falls back to a
 *  Titleized token. A small FR lexicon covers the order lifecycle cleanly. */
const FR_LABELS = {
  received: 'Reçue',
  preparing: 'En préparation',
  ready: 'Prête',
  picked_up: 'Récupérée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  pending: 'En attente',
  confirmed: 'Confirmée',
  sent: 'Envoyée',
  approved: 'Validée',
  rejected: 'Refusée',
  active: 'Active',
  suspended: 'Suspendue',
}
function labelFor(token) {
  if (FR_LABELS[token]) return FR_LABELS[token]
  return token.charAt(0).toUpperCase() + token.slice(1).replace(/_/g, ' ')
}

/**
 * Build a Mermaid stateDiagram-v2 body from ordered states:
 *  - happy path chains the non-terminal states in order,
 *  - each terminal-negative state branches out of every non-terminal step.
 */
function buildStateDiagram(states, { direction = 'LR' } = {}) {
  if (!states.length) return ''
  const terminal = states.filter((s) => TERMINAL_RE.test(s))
  const happy = states.filter((s) => !TERMINAL_RE.test(s))
  const id = (s) => s // tokens are already mermaid-safe
  const lines = ['stateDiagram-v2', `  direction ${direction}`]
  // state labels
  for (const s of states) lines.push(`  ${id(s)}: ${labelFor(s)}`)
  // happy path
  lines.push(`  [*] --> ${id(happy[0])}`)
  for (let i = 0; i < happy.length - 1; i++) {
    lines.push(`  ${id(happy[i])} --> ${id(happy[i + 1])}`)
  }
  lines.push(`  ${id(happy[happy.length - 1])} --> [*]`)
  // terminal branches from every non-final happy state
  for (const t of terminal) {
    for (let i = 0; i < happy.length - 1; i++) {
      lines.push(`  ${id(happy[i])} --> ${id(t)}`)
    }
    lines.push(`  ${id(t)} --> [*]`)
  }
  return lines.join('\n')
}

function readSchema(appRepoPath) {
  const p = path.join(appRepoPath, 'prisma', 'schema.prisma')
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''
}

/** The Order lifecycle diagram as a fenced mermaid block body (no fences). */
function orderLifecycleMermaid(appRepoPath, modelName = 'Order', fieldName = 'status') {
  const schema = readSchema(appRepoPath)
  const states = parseStatusEnum(schema, modelName, fieldName)
  return buildStateDiagram(states)
}

module.exports = { parseStatusEnum, buildStateDiagram, orderLifecycleMermaid, labelFor }

// ── CLI ──────────────────────────────────────────────────────────────────
if (require.main === module) {
  const appRepo =
    process.env.APP_REPO_PATH ||
    path.resolve(__dirname, '..', '..', 'grubano-kitchen-hub')
  const finalRepo = fs.existsSync(path.join(appRepo, 'prisma'))
    ? appRepo
    : path.resolve(__dirname, '..', '..', 'grubano')
  const model = process.argv[2] || 'Order'
  const field = process.argv[3] || 'status'
  const states = parseStatusEnum(readSchema(finalRepo), model, field)
  if (!states.length) {
    console.error(`No status enum found on ${model}.${field} in ${finalRepo}`)
    process.exit(1)
  }
  console.error(`States: ${states.join(', ')}`)
  console.log('```mermaid')
  console.log(buildStateDiagram(states))
  console.log('```')
}
