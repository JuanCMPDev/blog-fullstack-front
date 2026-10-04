# blog-fullstack-front — guía para agentes

Frontend de **Techno Espacio** (technoespacio.com), blog/portfolio personal en español. Next.js 15.3 (App Router, React 19), TypeScript estricto, Tailwind 3 + shadcn/ui (new-york), Zustand, react-hook-form + zod, Vitest. Desplegado en Vercel desde `main`. Consume la API NestJS de `blog-fullstack-back` (prefijo `/api/v1`).

## Comandos
```bash
npm ci --legacy-peer-deps      # instalar (react-day-picker@8 vs React 19 obliga al flag)
npm run dev                    # http://localhost:3000 (turbopack)
npx tsc --noEmit               # typecheck
npm run lint                   # eslint (next lint); no usar --fix en verificación
npm run test:run               # vitest run (tests en lib/*.test.ts)
npm run build                  # build de producción; debe terminar sin errores
```
Definición de "verde" antes de cualquier commit: typecheck + lint + tests + build sin errores. Los warnings de lint existentes no deben aumentar.

## Entorno (sesiones cloud / agentes)
- Antepón `cd /ruta/absoluta && ` a cada comando: el directorio de trabajo no se conserva entre llamadas.
- No hay acceso de red a technoespacio.com ni a la API en sesiones cloud: `next build` mostrará el error del sitemap y usará `http://localhost:3000` como metadataBase; no es un fallo del código salvo que se indique lo contrario en el ticket.
- Variables de entorno (ver `.env.example` cuando exista): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_MEDIA_URL`, `NEXT_PUBLIC_APP_LOG_LEVEL`, `NEXT_PUBLIC_ENABLE_LEGACY_BASE64_FALLBACK`. Nunca las hardcodees.

## Estructura
- `app/(home)/*` páginas públicas · `app/admin/*` panel (protegido solo en cliente por `ProtectedRoute`) · `app/layout.tsx` metadata global. Decisión 2026-10-04: cursos/exámenes, perfiles públicos, guardados, likes de posts y actividad se retiran (tickets FR-016 y FR-017); la cuenta de usuario existe solo para comentar.
- `components/{blog,common,layout,auth,admin,profile,ui}` · `hooks/*` · `lib/*` (api, customFetch, auth store, tipos, contenido v1/v2) · `utils/*`.
- `docs/relaunch/*` auditoría, plan, backlog y reportes del relanzamiento.

## Convenciones
- Server Components por defecto; `"use client"` solo donde haya estado/efectos/eventos. Las páginas públicas con contenido indexable (home, post, cursos, proyectos) deben renderizar su contenido en servidor.
- Toda llamada a la API pasa por `buildApiUrl()` (`lib/api.ts`) y, si requiere sesión, por `customFetch()` (`lib/customFetch.ts`). Los endpoints deben existir en el backend: compara con `grep -rnE "@(Get|Post|Put|Patch|Delete)\(" ../blog-fullstack-back/src` cuando el otro repo esté disponible; si no, documenta la dependencia en el ticket.
- Tipos compartidos en `lib/types.ts`; sin `any`, sin `@ts-ignore`, sin `console.*` fuera de `lib/logger.ts`.
- Imágenes con `next/image` y hosts en `next.config.mjs`; copy en español neutro con tildes; componentes UI desde `components/ui` (shadcn), estilos con tokens de `app/globals.css`/`tailwind.config.ts`.
- Tests unitarios junto al módulo (`*.test.ts`); un bug corregido lleva un test que fallaba antes.
- Commits: `tipo(ámbito): resumen [TICKET-ID]` (fix, feat, refactor, chore, docs, test, perf, security).

## Ramas y despliegue
- `main` = producción (Vercel). Nunca push directo a `main`/`develop`; trabajo en `relaunch/<fase>` o `relaunch/<ticket>`; integración por PR hacia `main`.
- Push automático desde los bucles autónomos: **habilitado** únicamente a ramas `relaunch/*` (`push: true` en el skill), autorizado por el propietario el 2026-10-04. Nunca a `main`/`develop`/`master`.
- Apertura automática de PRs borrador desde los bucles: **deshabilitada**.

## Relanzamiento autónomo
- Fuente de verdad: `docs/relaunch/PLAN.md` (fases, gates humanos, fase activa) y `docs/relaunch/BACKLOG.md` (tickets con estado, prioridad, dependencias, criterios de aceptación y comandos de verificación).
- Roles: `relaunch-orchestrator` (Opus 5.5) planifica/integra; `relaunch-implementer` (Sonnet 5.5) implementa un ticket por worktree; `relaunch-reviewer` (Sonnet 5.5) y `security-reviewer` (Opus 5.5) revisan adversarialmente; `relaunch-verifier` y `relaunch-scout` (Haiku 4.5) ejecutan verificaciones e inventarios mecánicos.
- Una iteración: `/relaunch-iteration` (workflow `relaunch-iteration`). Bucle: `/loop /relaunch-iteration`. Estado: `/relaunch-status`. Nuevos hallazgos: workflow `audit-sweep`.
- Gates humanos obligatorios: cambio de fase, borrar funcionalidad visible, migraciones de datos, cookies/CORS/dominios, secretos.
