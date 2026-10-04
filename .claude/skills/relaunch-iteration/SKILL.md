---
name: relaunch-iteration
description: Ejecuta UNA iteración autónoma del relanzamiento (seleccionar lote del backlog → implementar en worktrees → verificar → revisar → integrar → reportar) usando el workflow relaunch-iteration. Úsalo con `/loop /relaunch-iteration` para iterar hasta agotar la fase.
arguments: [ticketIds]
allowed-tools: Read, Grep, Glob, Edit, Write, Workflow, Agent, Bash(git *), Bash(npm *), Bash(npx *), Bash(cd *), Bash(ls *), Bash(cat *)
---

Eres el orquestador (sesión principal, modelo recomendado: Opus 5.5). Ejecuta una iteración completa del relanzamiento en ESTE repositorio y, al final, decide si el bucle debe continuar.

## 1. Precondiciones (no sigas si fallan; explica qué falta)
- `REPO=$(git rev-parse --show-toplevel)` existe y contiene `CLAUDE.md`, `docs/relaunch/PLAN.md` y `docs/relaunch/BACKLOG.md`.
- Árbol limpio: `git -C $REPO status --porcelain` vacío. Si hay cambios sin commitear que no son tuyos, detente y pregunta.
- Rama de iteración: lee la fase activa en `PLAN.md` (sección "Fase activa"). La rama es `relaunch/<fase>` (p. ej. `relaunch/fase-1`). Si no existe, créala desde `origin/main` (`git fetch origin main && git switch -c relaunch/<fase> origin/main`); si existe, `git switch` a ella y `git pull --ff-only origin relaunch/<fase>` si tiene upstream.
- Etiqueta de iteración: `<fase>-iter-NN`, donde NN = número de archivos en `docs/relaunch/reports/` que empiezan por `<fase>-iter-` + 1, con dos dígitos.
- Dependencias instaladas (`node_modules` presente). Si no, instala con el comando de `CLAUDE.md`.

## 2. Ejecutar el workflow
Llama a la herramienta Workflow con `name: "relaunch-iteration"` y estos `args` (objeto JSON real, no string):
```json
{
  "repoPath": "<REPO absoluto>",
  "iterationBranch": "relaunch/<fase>",
  "iterationLabel": "<fase>-iter-NN",
  "baseBranch": "main",
  "batchSize": 4,
  "maxFixRounds": 2,
  "push": <true solo si CLAUDE.md o el humano autorizan push automático a ramas relaunch/*; si no, false>,
  "ticketIds": <lista de $ticketIds si el humano pasó ids; si no, null>
}
```
Si la herramienta Workflow no está disponible en esta sesión, ejecuta las mismas etapas manualmente con la herramienta Agent y los agentes `relaunch-orchestrator`, `relaunch-implementer`, `relaunch-verifier`, `relaunch-reviewer`/`security-reviewer`, respetando el mismo orden y las mismas reglas.

## 3. Después del workflow
- Lee el resultado (`finalize.summary`, `finalize.humanGate`, `finalize.remainingTodoInPhase`) y el reporte en `docs/relaunch/reports/<fase>-iter-NN.md`.
- Si `push` fue true y hay commits nuevos: confirma que `git -C $REPO log origin/relaunch/<fase>..HEAD` está vacío; si no, `git push -u origin relaunch/<fase>`.
- Si existe un PR abierto de `relaunch/<fase>` hacia `main`, actualiza su descripción con el resumen de la iteración; si no existe y `CLAUDE.md` autoriza abrir PRs, créalo como borrador con el título `relaunch(<fase>): <resumen>`.
- Informa al humano en ≤10 líneas: tickets aprobados/rechazados, estado de verificación, humanGate y tickets restantes.

## 4. Decisión de bucle (cuando corres bajo /loop)
- Continúa (programa el siguiente despertar en 2-10 minutos) si `remainingTodoInPhase > 0`, `humanGate` está vacío y la iteración avanzó (al menos un ticket done o rechazado con diagnóstico nuevo).
- DETÉN el bucle (ScheduleWakeup con stop) y resume al humano si: `remainingTodoInPhase == 0` (fase terminada: pide aprobación para pasar de fase), `humanGate` no está vacío, dos iteraciones seguidas no avanzaron, o la verificación final falló dos veces seguidas por la misma causa.
- Nunca pases a la siguiente fase sin aprobación humana explícita en el chat.
