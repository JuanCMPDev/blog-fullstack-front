export const meta = {
  name: 'relaunch-iteration',
  description: 'Una iteración autónoma del relanzamiento: selecciona un lote del backlog, implementa cada ticket en un worktree aislado (Sonnet), verifica (Haiku), revisa adversarialmente (Sonnet; Opus para security) e integra los tickets verdes (Opus)',
  whenToUse: 'Invocado por el skill /relaunch-iteration (y por /loop /relaunch-iteration). Requiere args {repoPath, iterationBranch, iterationLabel}.',
  phases: [
    { title: 'Plan', detail: 'Opus selecciona y valida el lote desde docs/relaunch/BACKLOG.md', model: 'opus' },
    { title: 'Implement', detail: 'Un implementador Sonnet por ticket, en worktree aislado', model: 'sonnet' },
    { title: 'Verify', detail: 'Haiku ejecuta typecheck/lint/tests/build en el worktree de cada ticket', model: 'haiku' },
    { title: 'Review', detail: 'Revisión adversarial por ticket (Sonnet; Opus si el ticket es de seguridad)', model: 'sonnet' },
    { title: 'Integrate', detail: 'Opus fusiona las ramas aprobadas, re-verifica, actualiza BACKLOG.md y escribe el reporte', model: 'opus' },
  ],
}

// ---------------------------------------------------------------------------
// Configuración (todo llega por args; el script no puede leer el reloj ni el FS)
// ---------------------------------------------------------------------------
const cfg = Object.assign(
  { batchSize: 4, maxFixRounds: 2, push: false, ticketIds: null, baseBranch: 'main' },
  args || {},
)
for (const k of ['repoPath', 'iterationBranch', 'iterationLabel']) {
  if (!cfg[k]) throw new Error(`relaunch-iteration: falta args.${k}`)
}
const R = cfg.repoPath
const BACKLOG = `${R}/docs/relaunch/BACKLOG.md`
const PLAN = `${R}/docs/relaunch/PLAN.md`
const CLAUDE_MD = `${R}/CLAUDE.md`

// ---------------------------------------------------------------------------
// Schemas de salida estructurada
// ---------------------------------------------------------------------------
const TICKET = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    priority: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    description: { type: 'string' },
    acceptance: { type: 'array', items: { type: 'string' } },
    files: { type: 'array', items: { type: 'string' } },
    verifyCommands: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'title', 'priority', 'tags', 'description', 'acceptance', 'verifyCommands'],
}
const BATCH_SCHEMA = {
  type: 'object',
  properties: {
    phase: { type: 'string' },
    tickets: { type: 'array', items: TICKET },
    skipped: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'reason'] },
    },
    humanGate: { type: 'string', description: 'Vacío si no hay bloqueo; si no, qué decisión humana hace falta antes de seguir' },
  },
  required: ['phase', 'tickets', 'skipped', 'humanGate'],
}
const CHECK = {
  type: 'object',
  properties: { name: { type: 'string' }, status: { type: 'string', enum: ['pass', 'fail', 'env-blocked', 'skipped'] }, summary: { type: 'string' } },
  required: ['name', 'status', 'summary'],
}
const IMPL_SCHEMA = {
  type: 'object',
  properties: {
    ticketId: { type: 'string' },
    status: { type: 'string', enum: ['done', 'partial', 'blocked'] },
    worktreePath: { type: 'string' },
    branch: { type: 'string' },
    commits: { type: 'array', items: { type: 'string' } },
    filesChanged: { type: 'array', items: { type: 'string' } },
    checks: { type: 'array', items: CHECK },
    unverifiable: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['ticketId', 'status', 'worktreePath', 'branch', 'commits', 'filesChanged', 'checks', 'notes'],
}
const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    overall: { type: 'string', enum: ['pass', 'fail', 'env-blocked'] },
    commit: { type: 'string' },
    steps: { type: 'array', items: CHECK },
  },
  required: ['overall', 'steps'],
}
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    approved: { type: 'boolean' },
    blocking: {
      type: 'array',
      items: { type: 'object', properties: { file: { type: 'string' }, line: { type: 'integer' }, issue: { type: 'string' }, fix: { type: 'string' } }, required: ['file', 'issue', 'fix'] },
    },
    nits: { type: 'array', items: { type: 'string' } },
    acceptance: {
      type: 'array',
      items: { type: 'object', properties: { criterion: { type: 'string' }, status: { type: 'string', enum: ['met', 'unmet', 'unverifiable'] } }, required: ['criterion', 'status'] },
    },
  },
  required: ['approved', 'blocking', 'nits', 'acceptance'],
}
const INTEGRATE_SCHEMA = {
  type: 'object',
  properties: {
    merged: { type: 'array', items: { type: 'string' } },
    rejected: { type: 'array', items: { type: 'object', properties: { ticketId: { type: 'string' }, reason: { type: 'string' } }, required: ['ticketId', 'reason'] } },
    headCommit: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['merged', 'rejected', 'headCommit', 'notes'],
}
const FINALIZE_SCHEMA = {
  type: 'object',
  properties: {
    reportPath: { type: 'string' },
    backlogUpdated: { type: 'boolean' },
    commit: { type: 'string' },
    pushed: { type: 'boolean' },
    remainingTodoInPhase: { type: 'integer' },
    humanGate: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['reportPath', 'backlogUpdated', 'commit', 'pushed', 'remainingTodoInPhase', 'humanGate', 'summary'],
}

// ---------------------------------------------------------------------------
// Fase 1 — Plan (Opus)
// ---------------------------------------------------------------------------
phase('Plan')
const batch = await agent(
  `Eres el orquestador del relanzamiento. Repositorio: ${R} (rama de iteración: ${cfg.iterationBranch}, base: ${cfg.baseBranch}).
Lee ${CLAUDE_MD}, ${PLAN} y ${BACKLOG}.
${cfg.ticketIds ? `El humano pidió exactamente estos tickets: ${cfg.ticketIds.join(', ')}. Úsalos si están en estado todo y desbloqueados; explica en skipped los que no.` : `Selecciona hasta ${cfg.batchSize} tickets en estado "todo", de la fase activa indicada en PLAN.md, cuyos blocked_by estén todos en "done". Prioriza P0 > P1 > P2 > P3 y, a igual prioridad, el orden del backlog.`}
Nunca pongas en el mismo lote dos tickets que editen el mismo archivo con lógica distinta (riesgo de conflicto); deja el segundo para la siguiente iteración y anótalo en skipped.
Para cada ticket devuelve la descripción completa, criterios de aceptación verificables y los comandos de verificación (usa los de CLAUDE.md si el ticket no los trae). Si algún ticket seleccionado requiere una decisión humana (migración en producción, borrar funcionalidad visible, cambios de dominio/cookies/CORS, rotación de secretos), NO lo incluyas: descríbelo en humanGate.
No modifiques ningún archivo.`,
  { label: 'plan:lote', phase: 'Plan', model: 'opus', agentType: 'relaunch-orchestrator', schema: BATCH_SCHEMA },
)
if (!batch || !batch.tickets.length) {
  log(`Sin tickets ejecutables. humanGate="${batch ? batch.humanGate : 'n/a'}"`)
  return { iteration: cfg.iterationLabel, batch, results: [], integrated: null, finalize: null }
}
log(`Lote ${cfg.iterationLabel} (${batch.phase}): ${batch.tickets.map((t) => t.id).join(', ')}${batch.skipped.length ? ` · omitidos: ${batch.skipped.map((s) => s.id).join(', ')}` : ''}`)

// ---------------------------------------------------------------------------
// Fase 2-4 — pipeline por ticket: implementar → (verificar → revisar → corregir)*
// ---------------------------------------------------------------------------
const isSecurity = (t) => t.tags.some((x) => ['security', 'auth', 'upload', 'cookies', 'cors'].includes(x.toLowerCase()))

const implementPrompt = (t, feedback) => `Implementa el ticket ${t.id} — ${t.title} (prioridad ${t.priority}, tags: ${t.tags.join(', ') || 'ninguna'}).
Repositorio: ${R}. Rama de iteración (base de tu trabajo): ${cfg.iterationBranch}.
${feedback ? `Trabajas en el worktree YA EXISTENTE ${feedback.worktreePath} (rama ${feedback.branch}); antepón "cd ${feedback.worktreePath} && " a cada comando. NO crees otro worktree ni otra rama.\nFEEDBACK A RESOLVER (ronda ${feedback.round}):\n${feedback.text}\n` : `Trabajas en un worktree aislado creado para ti (tu directorio de trabajo actual); crea/usa la rama relaunch/${t.id.toLowerCase()} a partir de ${cfg.iterationBranch}.`}
Descripción: ${t.description}
Criterios de aceptación:
${t.acceptance.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}
Archivos probables: ${(t.files || []).join(', ') || 'determínalos leyendo el código'}
Comandos de verificación obligatorios: ${t.verifyCommands.join(' ; ')}
Sigue el procedimiento de tu definición de agente. Haz commit al terminar. Reporta la ruta absoluta del worktree y la rama exacta.`

const verifyPrompt = (t, impl) => `Ejecuta la suite de verificación en ${impl.worktreePath} (rama ${impl.branch}) para el ticket ${t.id}.
Comandos obligatorios del ticket: ${t.verifyCommands.join(' ; ')} — además de typecheck, lint (sin --fix), tests y build según ${CLAUDE_MD}.
Antepón "cd ${impl.worktreePath} && " a cada comando. No edites nada. Devuelve resultados literales.`

const reviewPrompt = (t, impl, verify) => `Revisa adversarialmente el ticket ${t.id} — ${t.title}.
Worktree: ${impl.worktreePath}; rama: ${impl.branch}; base: ${cfg.iterationBranch}. Diff: git -C ${impl.worktreePath} diff ${cfg.iterationBranch}...${impl.branch}
Resultado del verificador: ${JSON.stringify(verify)}
Criterios de aceptación:
${t.acceptance.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}
Reporte del implementador: ${impl.notes}
Archivos que dice haber cambiado: ${impl.filesChanged.join(', ')}
Un criterio "unverifiable" solo es aceptable si el implementador lo documentó y el riesgo es bajo. Si el verificador reporta fail, approved debe ser false.`

const perTicket = await pipeline(
  batch.tickets,
  // Etapa 1: implementación inicial en worktree aislado
  (t) =>
    agent(implementPrompt(t, null), {
      label: `impl:${t.id}`,
      phase: 'Implement',
      model: 'sonnet',
      agentType: 'relaunch-implementer',
      isolation: 'worktree',
      schema: IMPL_SCHEMA,
    }).then((impl) => ({ ticket: t, impl })),
  // Etapa 2: bucle verificar → revisar → corregir (máx. cfg.maxFixRounds correcciones)
  async (prev, t) => {
    if (!prev || !prev.impl) return { ticket: t, impl: null, verify: null, review: null, rounds: 0, outcome: 'implementer-failed' }
    let impl = prev.impl
    let verify = null
    let review = null
    let round = 0
    while (true) {
      verify = await agent(verifyPrompt(t, impl), {
        label: `verify:${t.id}${round ? `#${round}` : ''}`,
        phase: 'Verify',
        model: 'haiku',
        effort: 'low',
        agentType: 'relaunch-verifier',
        schema: VERIFY_SCHEMA,
      })
      review = await agent(reviewPrompt(t, impl, verify), {
        label: `review:${t.id}${round ? `#${round}` : ''}`,
        phase: 'Review',
        model: isSecurity(t) ? 'opus' : 'sonnet',
        agentType: isSecurity(t) ? 'security-reviewer' : 'relaunch-reviewer',
        schema: REVIEW_SCHEMA,
      })
      const green = verify && verify.overall !== 'fail' && review && review.approved && impl.status === 'done'
      if (green) return { ticket: t, impl, verify, review, rounds: round, outcome: 'approved' }
      if (round >= cfg.maxFixRounds) return { ticket: t, impl, verify, review, rounds: round, outcome: 'rejected' }
      round += 1
      const text = [
        verify && verify.overall === 'fail' ? `Verificación FALLÓ: ${verify.steps.filter((s) => s.status === 'fail').map((s) => `${s.name}: ${s.summary}`).join(' | ')}` : '',
        review && review.blocking.length ? `Bloqueantes del revisor: ${review.blocking.map((b) => `${b.file}${b.line ? ':' + b.line : ''} — ${b.issue} → ${b.fix}`).join(' | ')}` : '',
        impl.status !== 'done' ? `El implementador dejó el ticket en estado ${impl.status}: ${impl.notes}` : '',
      ].filter(Boolean).join('\n')
      log(`${t.id}: ronda de corrección ${round}/${cfg.maxFixRounds}`)
      const fixed = await agent(implementPrompt(t, { worktreePath: impl.worktreePath, branch: impl.branch, round, text }), {
        label: `fix:${t.id}#${round}`,
        phase: 'Implement',
        model: 'sonnet',
        agentType: 'relaunch-implementer',
        schema: IMPL_SCHEMA,
      })
      if (!fixed) return { ticket: t, impl, verify, review, rounds: round, outcome: 'implementer-failed' }
      impl = Object.assign({}, fixed, { worktreePath: fixed.worktreePath || impl.worktreePath, branch: fixed.branch || impl.branch })
    }
  },
)

const results = perTicket.filter(Boolean)
const approved = results.filter((r) => r.outcome === 'approved')
const rejected = results.filter((r) => r.outcome !== 'approved')
log(`Aprobados: ${approved.map((r) => r.ticket.id).join(', ') || 'ninguno'} · Rechazados: ${rejected.map((r) => `${r.ticket.id}(${r.outcome})`).join(', ') || 'ninguno'}`)

// ---------------------------------------------------------------------------
// Fase 5 — Integrate (barrera justificada: la fusión necesita TODOS los resultados)
// ---------------------------------------------------------------------------
phase('Integrate')
let integrated = null
let finalVerify = null
if (approved.length) {
  integrated = await agent(
    `Integra en ${R} (checkout principal, debe estar en la rama ${cfg.iterationBranch}; verifica con git -C ${R} status --porcelain y git -C ${R} branch --show-current; si no está limpia o no es esa rama, detente y explícalo en notes sin fusionar nada) las siguientes ramas aprobadas, en este orden:
${approved.map((r, i) => `  ${i + 1}. ${r.ticket.id}: rama ${r.impl.branch} (worktree ${r.impl.worktreePath})`).join('\n')}
Para cada una: git -C ${R} merge --no-ff --no-edit ${'<rama>'}. Si hay conflicto, resuélvelo conservando el comportamiento de ambos tickets, ejecuta el typecheck rápido y commitea la fusión. Si un conflicto no es resoluble con seguridad, aborta esa fusión (git merge --abort), déjala en rejected con la razón y continúa con las demás.
Al terminar, elimina los worktrees ya fusionados (git -C ${R} worktree remove --force <path>) y sus ramas locales (git -C ${R} branch -d <rama>). No hagas push. No toques main/master/develop.`,
    { label: 'integrate:merge', phase: 'Integrate', model: 'opus', agentType: 'relaunch-orchestrator', schema: INTEGRATE_SCHEMA },
  )
  finalVerify = await agent(
    `Ejecuta la suite completa de verificación (typecheck, lint sin --fix, tests, build) en ${R} (rama ${cfg.iterationBranch}, HEAD ${integrated ? integrated.headCommit : 'desconocido'}). Antepón "cd ${R} && " a cada comando. No edites nada.`,
    { label: 'integrate:verify', phase: 'Integrate', model: 'haiku', effort: 'low', agentType: 'relaunch-verifier', schema: VERIFY_SCHEMA },
  )
} else {
  log('Nada que integrar en esta iteración.')
}

const finalize = await agent(
  `Cierra la iteración ${cfg.iterationLabel} en ${R} (rama ${cfg.iterationBranch}).
Datos:
- Lote: ${JSON.stringify(batch.tickets.map((t) => ({ id: t.id, title: t.title })))}
- Omitidos en Plan: ${JSON.stringify(batch.skipped)}; humanGate del Plan: "${batch.humanGate}"
- Resultados por ticket: ${JSON.stringify(results.map((r) => ({ id: r.ticket.id, outcome: r.outcome, rounds: r.rounds, branch: r.impl && r.impl.branch, commits: r.impl && r.impl.commits, verify: r.verify && r.verify.overall, blocking: r.review && r.review.blocking, nits: r.review && r.review.nits, unverifiable: r.impl && r.impl.unverifiable })))}
- Integración: ${JSON.stringify(integrated)}
- Verificación final: ${JSON.stringify(finalVerify)}
Tareas:
1. Si la verificación final es "fail": NO marques nada como done; intenta identificar la fusión culpable, revierte SOLO esa fusión (git -C ${R} revert -m 1 <merge-commit>), re-ejecuta el typecheck y los tests, y documenta todo en el reporte. Si no puedes aislarla con seguridad, deja la rama como está y marca humanGate.
2. Si la verificación final es "pass" (o "env-blocked" únicamente por pasos que CLAUDE.md declara dependientes de base de datos/red): actualiza ${BACKLOG} marcando los tickets fusionados como done (con el hash del commit de fusión) y los rechazados con una nota breve en su campo notes (estado sigue todo). Mantén el formato del archivo.
3. Escribe ${R}/docs/relaunch/reports/${cfg.iterationLabel}.md con: lote, aprobados/rechazados y por qué, resultados literales de verificación, riesgos abiertos, humanGate y recomendación para la siguiente iteración.
4. git -C ${R} add docs/relaunch && git -C ${R} commit -m "chore(relaunch): iteración ${cfg.iterationLabel}" (solo si hay cambios).
5. ${cfg.push ? `Haz push: git -C ${R} push -u origin ${cfg.iterationBranch} (nunca a main/master/develop).` : 'NO hagas push (push=false).'}
6. Cuenta cuántos tickets quedan en estado todo en la fase activa y devuélvelo en remainingTodoInPhase. Si la fase quedó sin tickets todo o si hay una decisión humana pendiente, descríbela en humanGate.`,
  { label: 'integrate:finalize', phase: 'Integrate', model: 'opus', agentType: 'relaunch-orchestrator', schema: FINALIZE_SCHEMA },
)

log(finalize ? finalize.summary : 'Finalización sin resultado (agente omitido o fallido)')
return { iteration: cfg.iterationLabel, batch, results, integrated, finalVerify, finalize }
