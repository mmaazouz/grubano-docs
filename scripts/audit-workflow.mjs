export const meta = {
  name: 'audit-docs-v5',
  description: 'Audit each regenerated FR guide against the Grubano doc guardrails, then adversarially verify each flagged violation',
  phases: [
    { title: 'Audit' },
    { title: 'Verify' },
  ],
}

// args = [{ topic, file }] — repo-relative .mdx paths of the generated pages.
// Tolerate a JSON-encoded string (harness may deliver args as a string).
const PAGES = Array.isArray(args)
  ? args
  : typeof args === 'string'
    ? JSON.parse(args)
    : []
if (!PAGES.length) throw new Error('audit-docs-v5: empty args — expected [{topic,file}]')

const GUARDRAILS = `
RÈGLEMENT DOC GRUBANO — critères d'audit (une page de doc consommateur/partenaire) :

1. ZÉRO TAUX INTERNE. Les SEULS chiffres financiers publiables sont la commission
   Grubano « 10 % » et l'abonnement « Grubano Pro 29 €/mois ». Tout AUTRE
   pourcentage ou forfait (commission d'affiliation, redevance/royalties de
   franchise, taux livreur, marge interne) est CONFIDENTIEL et ne doit PAS
   apparaître. Un « 20 % », « 6 % », « 40 % », « 15 €/mois »… = VIOLATION.
2. PRO — cadrage canonique UNIQUEMENT : Grubano Pro = recevoir les commandes des
   AUTRES plateformes (Uber Eats, Deliveroo, Just Eat…) sur le tableau de bord
   Grubano (agrégation + rapports unifiés), forfait 29 €/mois qui s'AJOUTE à la
   commission 10 % (inchangée), au FUTUR / « bientôt ». INTERDIT de présenter Pro
   comme : visibilité/mise en avant/priorité dans la découverte, statistiques
   avancées, support prioritaire, accès à l'affiliation. = VIOLATION.
3. PAS de framing « dark kitchen » / « ghost kitchen » / « cuisine fantôme ».
   Grubano = restaurants LOCAUX qui cuisinent dans LEUR cuisine. = VIOLATION.
4. FONCTIONS GATÉES = « à venir »/« bientôt ». Les briques argent des publics
   récents (versements/gains livreur, versements affilié, redevances franchise,
   payouts créateur) sont gatées OFF : elles doivent être formulées au FUTUR.
   Annoncer un paiement/versement EFFECTIF et actif = VIOLATION.
5. DISTINCTION 3 RÔLES : créateur = chef qui publie des RECETTES ; affilié =
   partenaire qui recommande via lien/code de PARRAINAGE ; influenceur = un
   PALIER (audience vérifiée) de l'affilié, PAS un 4e métier, PAS le créateur.
   Confondre les rôles (ex. décrire l'affilié comme un créateur de recettes, ou
   ériger l'influenceur en rôle séparé) = VIOLATION.
6. PAS de nom de marque (Gnocchi Bar, Pasta Fresca, Rollix, Le Riz Gourmand,
   Bowl Healthy, Mac & Cheese…). Descriptions génériques (« votre marque »). = VIOLATION.
7. VOUVOIEMENT. Le tutoiement (« tu peux », « ton compte ») est INTERDIT. = VIOLATION.
8. TON PÉDAGOGIQUE v5 : chaleureux, clair, explique le POURQUOI, parle au lecteur
   (« vous »). La page doit ÉDUQUER, pas être une fiche technique sèche. Une page
   plate/purement descriptive = FAIBLESSE (severity low), pas un blocker.
9. APERÇU VISUEL v5 présent : au moins un composant visuel (<FlowDiagram>,
   <JourneyStrip>, <RelatedActors>, <MiniMap>, <Comparison>, <LearningPath>) OU
   un bloc \`\`\`mermaid, placé haut dans la page. Absent = FAIBLESSE (severity med).
`

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['topic', 'visualPresent', 'toneOk', 'roleDistinctionOk', 'violations'],
  properties: {
    topic: { type: 'string' },
    visualPresent: { type: 'boolean' },
    toneOk: { type: 'boolean' },
    roleDistinctionOk: { type: 'boolean' },
    violations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['rule', 'severity', 'quote', 'explanation'],
        properties: {
          rule: { type: 'string', description: 'the numbered guardrail broken, e.g. "1-taux-interne"' },
          severity: { type: 'string', enum: ['hard', 'med', 'low'] },
          quote: { type: 'string', description: 'the exact offending text from the page' },
          explanation: { type: 'string' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['real', 'reason'],
  properties: {
    real: { type: 'boolean', description: 'true if this is a genuine guardrail violation, false if false-positive' },
    reason: { type: 'string' },
  },
}

const results = await pipeline(
  PAGES,
  // Stage 1 — audit one page against the guardrails.
  (p) =>
    agent(
      `Tu es l'auditeur qualité de la doc Grubano. Lis INTÉGRALEMENT le fichier \`${p.file}\` (topic « ${p.topic} ») avec l'outil Read, puis audite-le STRICTEMENT contre le règlement ci-dessous. Ne signale QUE ce qui viole réellement une règle — cite le texte fautif EXACT. Une valeur "10 %" ou "29 €/mois" est AUTORISÉE (ne la signale pas). Sois précis, pas zélé.\n\n${GUARDRAILS}\n\nRends l'objet structuré : visualPresent (un visuel v5 est-il présent ?), toneOk (ton pédagogique « vous » ?), roleDistinctionOk (les rôles ne sont pas confondus ?), et la liste des violations (vide si la page est conforme).`,
      { label: `audit:${p.topic}`, phase: 'Audit', schema: FINDINGS_SCHEMA },
    ),
  // Stage 2 — adversarially verify each flagged violation (kill false positives).
  (finding, p) => {
    if (!finding) return { topic: p.topic, file: p.file, confirmed: [], meta: null }
    const toVerify = finding.violations || []
    if (!toVerify.length) {
      return {
        topic: p.topic,
        file: p.file,
        confirmed: [],
        meta: { visualPresent: finding.visualPresent, toneOk: finding.toneOk, roleDistinctionOk: finding.roleDistinctionOk },
      }
    }
    return parallel(
      toVerify.map((v) => () =>
        agent(
          `Vérification ADVERSARIALE d'une violation présumée du règlement doc Grubano dans \`${p.file}\`.\nRègle : ${v.rule} (severity ${v.severity}).\nTexte cité : « ${v.quote} »\nExplication de l'auditeur : ${v.explanation}\n\nRelis le passage réel dans le fichier (Read) et tranche : est-ce une VRAIE violation, ou un faux positif (ex. « 10 % »/« 29 €/mois » autorisés, une fonction déjà correctement formulée « bientôt », un rôle correctement distingué) ? Par défaut, si le doute persiste après lecture, considère real=false. Extrait de règlement pertinent :\n${GUARDRAILS}`,
          { label: `verify:${p.topic}:${v.rule}`, phase: 'Verify', schema: VERDICT_SCHEMA },
        ).then((verdict) => ({ ...v, verdict })),
      ),
    ).then((verdicts) => ({
      topic: p.topic,
      file: p.file,
      confirmed: verdicts.filter(Boolean).filter((v) => v.verdict?.real),
      meta: { visualPresent: finding.visualPresent, toneOk: finding.toneOk, roleDistinctionOk: finding.roleDistinctionOk },
    }))
  },
)

// Consolidate.
const clean = results.filter(Boolean)
const withViolations = clean.filter((r) => r.confirmed.length > 0)
const missingVisual = clean.filter((r) => r.meta && !r.meta.visualPresent)
const toneIssues = clean.filter((r) => r.meta && !r.meta.toneOk)
const roleIssues = clean.filter((r) => r.meta && !r.meta.roleDistinctionOk)

log(`Audit: ${clean.length} pages · ${withViolations.length} avec violation confirmée · ${missingVisual.length} sans visuel · ${toneIssues.length} ton · ${roleIssues.length} rôles`)

return {
  totalPages: clean.length,
  confirmedViolations: withViolations.map((r) => ({ topic: r.topic, file: r.file, violations: r.confirmed })),
  missingVisual: missingVisual.map((r) => r.topic),
  toneIssues: toneIssues.map((r) => r.topic),
  roleIssues: roleIssues.map((r) => r.topic),
}
