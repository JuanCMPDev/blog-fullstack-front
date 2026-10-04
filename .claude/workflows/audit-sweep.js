export const meta = {
  name: 'audit-sweep',
  description: 'Barrido de auditoría multi-lente (seguridad, contrato API, rendimiento/SEO, calidad, accesibilidad) con verificación adversarial 2-de-3; propone tickets nuevos en docs/relaunch/BACKLOG.md con estado proposed',
  whenToUse: 'Al cerrar una fase del relanzamiento o cuando se sospechen regresiones. Requiere args {repoPath}; opcional {otherRepoPath, lenses, maxPerLens}.',
  phases: [
    { title: 'Find', detail: 'Un buscador Sonnet por lente', model: 'sonnet' },
    { title: 'Verify', detail: 'Tres refutadores Sonnet por hallazgo; sobrevive con ≥2 votos', model: 'sonnet' },
    { title: 'Propose', detail: 'Opus convierte los hallazgos confirmados en tickets proposed', model: 'opus' },
  ],
}

const cfg = Object.assign(
  { otherRepoPath: null, maxPerLens: 8, lenses: ['security', 'api-contract', 'performance-seo', 'code-quality', 'accessibility-ux'] },
  args || {},
)
if (!cfg.repoPath) throw new Error('audit-sweep: falta args.repoPath')
const R = cfg.repoPath

const FINDING = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
    file: { type: 'string' },
    line: { type: 'integer' },
    evidence: { type: 'string' },
    impact: { type: 'string' },
    fix: { type: 'string' },
    effort: { type: 'string', enum: ['S', 'M', 'L'] },
  },
  required: ['title', 'severity', 'file', 'evidence', 'impact', 'fix', 'effort'],
}
const FINDINGS_SCHEMA = { type: 'object', properties: { findings: { type: 'array', items: FINDING } }, required: ['findings'] }
const VERDICT_SCHEMA = {
  type: 'object',
  properties: { refuted: { type: 'boolean' }, reason: { type: 'string' } },
  required: ['refuted', 'reason'],
}
const PROPOSE_SCHEMA = {
  type: 'object',
  properties: { added: { type: 'array', items: { type: 'string' } }, duplicates: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } },
  required: ['added', 'duplicates', 'summary'],
}

const LENS_PROMPTS = {
  security: 'autenticación/autorización, validación de entrada, XSS, IDOR, secretos, cookies, CORS, subidas de archivos, rate limiting',
  'api-contract': `coherencia entre llamadas del frontend y rutas/formas de respuesta del backend${cfg.otherRepoPath ? ` (el otro repositorio está en ${cfg.otherRepoPath})` : ''}, códigos de estado, nombres, paginación`,
  'performance-seo': 'renderizado cliente vs servidor, tamaño de bundles, imágenes sin optimizar, N+1 en consultas, metadatos/OG/JSON-LD/sitemap/robots, Core Web Vitals',
  'code-quality': 'código duplicado, archivos muertos, tipos any, console.log, tests frágiles o ausentes, configuración de lint/build, dependencias obsoletas o en conflicto',
  'accessibility-ux': 'landmarks, etiquetas aria, contraste, foco, movimiento sin prefers-reduced-motion, formularios, copy en español, estados vacíos y de error',
}

phase('Find')
const found = (
  await parallel(
    cfg.lenses.map((lens) => () =>
      agent(
        `Audita el repositorio ${R} con la lente "${lens}" (${LENS_PROMPTS[lens] || lens}). Lee CLAUDE.md y docs/relaunch/BACKLOG.md primero y NO repitas tickets que ya existan allí (en cualquier estado).
Devuelve como máximo ${cfg.maxPerLens} hallazgos nuevos, cada uno verificado en el código con archivo y línea exactos y una cita de 1-3 líneas como evidencia. Sin especulación: si no puedes citar el código, no lo incluyas. No modifiques archivos.`,
        { label: `find:${lens}`, phase: 'Find', model: 'sonnet', schema: FINDINGS_SCHEMA },
      ),
    ),
  )
)
  .filter(Boolean)
  .flatMap((r) => r.findings)

// Deduplicación por archivo+título normalizado (código, no agente)
const seen = new Set()
const unique = found.filter((f) => {
  const key = `${f.file}::${f.title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g, ' ').trim()}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})
log(`Hallazgos: ${found.length} brutos → ${unique.length} únicos`)
if (!unique.length) return { confirmed: [], proposed: null }

phase('Verify')
const judged = await parallel(
  unique.map((f) => () =>
    parallel(
      ['¿Es realmente un defecto o un riesgo real y no una preferencia de estilo?', '¿La evidencia citada existe tal cual en el archivo y la línea indicados?', '¿El impacto descrito es alcanzable en producción con la configuración actual del repo?'].map((lens, i) => () =>
        agent(
          `Intenta REFUTAR este hallazgo del repositorio ${R}. Pregunta guía: ${lens}
Hallazgo: ${JSON.stringify(f)}
Lee el archivo real. Si tienes dudas razonables, refuted=true. No modifiques archivos.`,
          { label: `refute:${i + 1}:${f.file.split('/').pop()}`, phase: 'Verify', model: 'sonnet', effort: 'low', schema: VERDICT_SCHEMA },
        ),
      ),
    ).then((votes) => ({ finding: f, survives: votes.filter(Boolean).filter((v) => !v.refuted).length >= 2, votes })),
  ),
)
const confirmed = judged.filter(Boolean).filter((j) => j.survives).map((j) => j.finding)
log(`Confirmados tras verificación adversarial: ${confirmed.length}/${unique.length}`)
if (!confirmed.length) return { confirmed: [], proposed: null }

phase('Propose')
const proposed = await agent(
  `Convierte estos hallazgos confirmados en tickets del backlog de ${R}/docs/relaunch/BACKLOG.md con estado "proposed" (NO "todo": un humano o el orquestador los promueve). Respeta exactamente el formato de ticket del archivo (ids consecutivos con el prefijo de la fase que corresponda, campos priority/tags/blocked_by/acceptance/verify/notes). Agrupa hallazgos que se resuelven con el mismo cambio en un solo ticket. Omite los que dupliquen tickets existentes y lístalos en duplicates.
Hallazgos: ${JSON.stringify(confirmed)}
Haz commit: git -C ${R} add docs/relaunch/BACKLOG.md && git -C ${R} commit -m "docs(relaunch): tickets propuestos por audit-sweep". No hagas push.`,
  { label: 'propose:backlog', phase: 'Propose', model: 'opus', agentType: 'relaunch-orchestrator', schema: PROPOSE_SCHEMA },
)
return { confirmed, proposed }
