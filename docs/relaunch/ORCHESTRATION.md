# Orquestación autónoma del relanzamiento

Cómo se ejecutan los fixes del plan con agentes, qué modelo hace qué, y cómo se mantiene el control humano.

## Roles y modelos

| Rol | Modelo | Por qué este modelo | Herramientas | Definición |
|---|---|---|---|---|
| Orquestador | **Claude Opus 5.5** | Decide el lote, resuelve conflictos de merge, juzga cuándo escalar. Es el que más contexto cruzado necesita y el que menos veces se ejecuta por iteración (2-3 llamadas). | lectura, shell, edición, Agent | `.claude/agents/relaunch-orchestrator.md` |
| Implementador | **Claude Sonnet 5.5** | Ejecuta un ticket acotado con criterios de aceptación y comandos de verificación; es el rol más frecuente (uno por ticket, más rondas de corrección), donde Sonnet rinde al nivel necesario a una fracción del coste. | lectura, shell, edición | `relaunch-implementer.md` |
| Revisor adversarial | **Claude Sonnet 5.5** | Revisión independiente del diff contra los criterios de aceptación; intenta refutar. Un segundo par de ojos distinto del implementador reduce falsos verdes. | solo lectura + shell | `relaunch-reviewer.md` |
| Revisor de seguridad | **Claude Opus 5.5** | Obligatorio para tickets `security`, `auth`, `upload`, `cookies`, `cors`: el coste de un fallo aquí es alto y la revisión requiere razonamiento de atacante. | solo lectura + shell | `security-reviewer.md` |
| Verificador | **Claude Haiku 4.5** | Trabajo mecánico y determinista: instalar, typecheck, lint, tests, build, y copiar resultados literales. No interpreta ni edita. Es el uso "estrictamente prudente" de Haiku. | shell + lectura | `relaunch-verifier.md` |
| Scout | **Claude Haiku 4.5** | Inventarios mecánicos (listar rutas, buscar usos, medir tamaños) para alimentar al orquestador. Sin juicio. | lectura + shell | `relaunch-scout.md` |

IDs completos si se quiere fijar versión en el frontmatter `model:`: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-4-5-20251001`. Los alias `opus`/`sonnet`/`haiku` apuntan al último de cada familia.

Haiku **no** se usa para implementar, revisar ni decidir: sus salidas solo son datos (resultados de comandos, listas) que otros roles consumen.

## Una iteración (`/relaunch-iteration` → workflow `relaunch-iteration`)

```
Plan (Opus) ──► por ticket, en paralelo y sin barreras:
                 Implement (Sonnet, worktree aislado)
                   └► Verify (Haiku) ─► Review (Sonnet | Opus si security)
                        └► ¿verde? no → Fix (Sonnet, misma worktree) ×≤2 → Verify → Review
             ──► Integrate (Opus: merge --no-ff en orden, resolver conflictos)
             ──► Verify final (Haiku) ──► Finalize (Opus: BACKLOG.md, reporte, commit[, push])
```

- **Entrada**: `docs/relaunch/BACKLOG.md` (tickets `todo` de la fase activa, desbloqueados). Lote por defecto: 4 tickets; `maxFixRounds`: 2.
- **Aislamiento**: cada ticket se implementa en su propio git worktree y rama `relaunch/<ticket-id>`; el checkout principal queda en `relaunch/<fase>`.
- **Criterio de fusión**: verificador sin `fail` + revisor `approved` + implementador `done`. Un ticket rechazado vuelve a `todo` con nota; no bloquea a los demás.
- **Salida**: `docs/relaunch/reports/<fase>-iter-NN.md`, `BACKLOG.md` actualizado (estados y hashes), commit en `relaunch/<fase>`.
- **Push/PR**: deshabilitados por defecto (ver `CLAUDE.md` → "Ramas y despliegue"). Al habilitarlos, solo a ramas `relaunch/*`; nunca a `main`.

## El bucle

Tres formas de ejecutar iteraciones de forma autónoma, de menor a mayor autonomía:

1. **Interactivo** — en Claude Code, dentro del repo: `/relaunch-iteration` (una iteración) o `/relaunch-iteration FR-012 FR-015` (tickets concretos).
2. **Bucle en sesión** — `/loop /relaunch-iteration`: el orquestador se auto-programa (1 min-1 h entre iteraciones) y se detiene solo cuando la fase queda sin tickets, aparece un gate humano, dos iteraciones no avanzan o la verificación final falla dos veces por la misma causa. Vive mientras viva la sesión (`--resume` lo restaura).
3. **Programado** — una Routine de Claude Code (cloud) o una tarea programada de escritorio que abra una sesión nueva en el repo con el prompt `/relaunch-iteration` cada noche. Recomendado solo tras 2-3 iteraciones supervisadas en modo 1 o 2, y con `push: true` a `relaunch/*` para que el trabajo quede persistido.

Al cerrar una fase: `audit-sweep` (workflow) rehace un barrido multi-lente con verificación adversarial 2-de-3 y añade tickets `proposed`, que un humano (o el orquestador con aprobación) promueve a `todo`.

## Control humano (gates)

El bucle **se detiene y pregunta** antes de: cambiar de fase; borrar funcionalidad visible (cursos/exámenes, registro, comentarios); crear o aplicar migraciones; tocar cookies, CORS o dominios; rotar secretos; cambiar límites globales de throttling; y cuando dos iteraciones seguidas no avanzan. Estas reglas viven en los agentes, en el skill y en `PLAN.md`; cambiarlas requiere editar los tres.

Reglas duras para todos los roles: nunca push a `main`/`master`/`develop`; nunca desactivar o borrar tests para ponerse en verde; nunca debilitar guards/validaciones; nunca `prisma migrate deploy|reset` ni `db push`; secretos solo por variables de entorno.

## Permisos

`.claude/settings.json` permite sin preguntar las herramientas de lectura/edición y los comandos de npm, npx (tsc/eslint/next/vitest/jest/prisma generate|validate), git local y `git push` **solo** a `origin relaunch/*`; deniega force-push, push a `main`/`master`/`develop`, `reset --hard`, `rm -rf` y migraciones destructivas. Ajusta la lista a tu criterio antes de correr bucles desatendidos; para sesiones cloud puedes usar `permissions.defaultMode: "auto"`.

## Dos repositorios

Cada repo tiene su propio `BACKLOG.md` con sus tickets; las dependencias cruzadas se expresan con `blocked_by: BK-xxx` (en el front) o `blocked_by: FR-xxx` (en el back) y se resuelven marcando el ticket del otro repo como `done`. Si ambos repos están clonados lado a lado (`../blog-fullstack-back`), los agentes pueden leer el otro repo para comprobar contratos; si no, el ticket debe documentar el contrato esperado.

## Coste y cadencia (orientativo)

Por iteración de 4 tickets: 2-3 llamadas Opus (plan, integración, cierre), 4-8 implementaciones Sonnet (incl. correcciones), 4-8 revisiones Sonnet, 1-2 revisiones Opus si hay tickets de seguridad, 9-17 ejecuciones Haiku. El coste lo dominan las implementaciones Sonnet; Haiku es marginal. Ver estimación en `PLAN.md` → "Coste estimado".
