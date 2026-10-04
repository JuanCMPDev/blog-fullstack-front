# Plan de remodelación y relanzamiento — Techno Espacio

Fecha del plan: 2026-10-04 · Repos: `blog-fullstack-front` (Next.js, Vercel) y `blog-fullstack-back` (NestJS, Docker/Coolify) · Autoría de la auditoría: sesión de Claude Code con cinco agentes auditores (ver `AUDIT.md`).

## Objetivo

Convertir technoespacio.com en un **blog/portfolio profesional** que sirva como tarjeta de presentación desde redes sociales (LinkedIn, X, GitHub): rápido, indexable, seguro, con identidad personal clara, publicable en minutos y mantenible con bucles de agentes supervisados.

Qué significa "profesional" aquí (criterios de salida del relanzamiento):
- Lighthouse móvil ≥ 90 en Performance, SEO, Accesibilidad y Best Practices en home y post.
- Cada post: metadatos completos (title/description/canonical/OG/Twitter/JSON-LD), contenido renderizado en servidor, imagen OG válida, sitemap y RSS correctos.
- Identidad: nombre, foto, bio, enlaces sociales y CV visibles en home y about; portfolio de proyectos con capturas reales.
- Seguridad: sin hallazgos P0/P1 abiertos; CI verde en ambos repos; sin secretos ni artefactos en git.
- Operación: `main` es la rama por defecto y la única desplegada; cada cambio pasa por PR con CI.

## Acción inmediata (antes de cualquier iteración)

La auditoría confirmó en ejecución que la API de `media` del backend no tenía autenticación (ticket **BK-001**, hallazgo BS-01/BQ-01). **Hecho el 2026-10-04** en la rama `relaunch/hotfix-media` del backend junto con **BK-019** (reenvío de verificación) y **BK-004** (endpoint de sitemap), con tests de comportamiento y revisión de seguridad adversarial (Opus). Nada está en producción todavía; al desplegar `main`, este hotfix debe ir incluido.

## Fase activa

**Fase 0 — Cimientos** (actualizar esta línea al cambiar de fase; el skill `/relaunch-iteration` la lee).

Tickets por fase y repo (ver `BACKLOG.md` de cada repo): Fase 0 → backend BK-001…BK-009, BK-012…BK-014, BK-019, BK-048, BK-049 (15; BK-001/004/019 hechos) · frontend FR-000…FR-013, FR-015…FR-017 (16). Fase 1 → backend BK-010, BK-011, BK-015…BK-018, BK-020, BK-021, BK-025, BK-028…BK-031 (12) · frontend FR-101…FR-108 (8). Fase 2 → backend BK-022, BK-032…BK-037 (7) · frontend FR-201…FR-216 (16). Fase 3 → backend BK-023, BK-024, BK-039 (3) · frontend FR-301…FR-307, FR-310, FR-311 (9). Fase 4 → backend BK-040…BK-045 (6) · frontend FR-401…FR-407 (7). Fase 5 → BK-047, FR-501. Cancelados por decisión: BK-026, BK-027, BK-038, FR-308.

## Fases

| Fase | Objetivo | Entrada | Salida (gate humano) | Tamaño estimado |
|---|---|---|---|---|
| **0 · Cimientos** | Que todo se pueda verificar y desplegar con confianza: hotfix de seguridad (hecho), CI, lint/format baseline, limpieza de artefactos, README/.env reales, deps en conflicto, sitemap, y la **reducción de alcance decidida**: retirar cursos/exámenes y reducir la cuenta a "solo comentar" en ambos repos. | Esta auditoría + decisiones del 2026-10-04 | CI verde en ambos repos; `BACKLOG` F0 en done; rama por defecto cambiada a `main` en GitHub. | 3-4 iteraciones |
| **1 · Seguridad y contrato API** | Cerrar P0/P1 de auth/cookies/throttling/validación/IDOR; alinear 100 % las llamadas del front con las rutas del back; proteger `/admin` en servidor. | Gate F0 | `security-reviewer` aprueba; matriz de contrato sin MISSING/MISMATCH; humano aprueba cambios de cookies/CORS/dominio. | 3-4 iteraciones |
| **2 · Rendimiento, SEO y renderizado** | Home/post/cursos/proyectos como Server Components con revalidación; metadata por página; JSON-LD Person/WebSite/BlogPosting correctos; RSS; imágenes y fuentes optimizadas; bundle del post < 200 kB First Load JS. | Gate F1 | Lighthouse ≥ 90 en home y post (medido en preview de Vercel); humano revisa visualmente. | 3-4 iteraciones |
| **3 · Remodelación de producto y marca** | Nueva arquitectura de información (Inicio, Blog, Proyectos, Sobre mí, Contacto), hero personal con enlace al canal de YouTube, página de post rediseñada (tipografía, TOC, código, compartir, autor, relacionados), about/CV/portfolio, newsletter/RSS. La retirada del LMS y la cuenta mínima ya se ejecutan en la Fase 0. | Gate F2 + URL del canal de YouTube y textos aprobados | Humano aprueba diseño en preview; copy revisado; sin regresiones de F1/F2. | 3-5 iteraciones |
| **4 · Calidad y observabilidad** | Tests de valor (Testing Library + MSW en front; e2e con DB en CI en back; Playwright smoke), Sentry/logging estructurado, consolidar analítica, actualizar dependencias mayores (Next, Tailwind 4, Prisma 7, react-day-picker 9), eliminar código muerto y duplicados. | Gate F3 | Cobertura mínima acordada; alertas de errores activas; deps sin CVEs altas. | 3-4 iteraciones |
| **5 · Lanzamiento** | Checklist final (OG validators, sitemap/robots, redirecciones, 404, dominio/cookies en prod, backups DB), nota de lanzamiento y publicación en redes. | Gate F4 | Humano publica. | 1 iteración |

Las fases 1 y 2 pueden solaparse parcialmente (tickets de F2 que no tocan auth pueden entrar cuando F1 lleve ≥ 70 %), pero el bucle solo trabaja la fase activa salvo indicación humana.

## Decisiones (actualizado 2026-10-04 tras la respuesta del propietario)

Tomadas:
1. **LMS**: se retiran cursos, módulos y exámenes del frontend y del backend (tickets FR-016, BK-048). Nada está en producción todavía, así que la migración que elimina las tablas no necesita plan de datos; sigue requiriendo gate humano por ser migración.
2. **Cuentas**: se mantienen los comentarios con una **cuenta mínima** cuyo único fin es comentar: registro con verificación de email, login, recuperación de contraseña, nick y avatar opcional; likes de comentarios. Se retiran: perfiles públicos (`/profile/*`, `GET profile/:identifier`, actividades), posts guardados, likes de posts, portada/bio/skills/redes del perfil y `Settings` (FR-017, BK-049). El panel de administración conserva la gestión de usuarios (banear, roles).
3. **Marca**: marca personal (Juan Carlos Muñoz, desarrollador) con **Techno Espacio** como nombre del blog y del canal de YouTube. El canal se enlaza en header/footer/about, en el JSON-LD `Person.sameAs` y en la caja de autor; hace falta la URL del canal (pendiente de que la aporte el propietario).
4. **Rama por defecto del backend**: autorizado el cambio a `main`. El proxy de GitHub de esta sesión no permite escribir ajustes del repositorio, así que debe hacerse en GitHub → Settings → Branches (default branch → `main`); después borrar `master` y `develop`.
5. **Push automático**: autorizado a ramas `relaunch/*` (ya reflejado en `CLAUDE.md`). La apertura automática de PRs sigue deshabilitada: los PRs hacia `main` los abre el propietario (o se autoriza más adelante).

Pendientes (el bucle se detiene si llega a un ticket que las necesita):
6. **Dominio de cookies y transporte**: ¿el navegador llama a `api.technoespacio.com` directamente (CORS ya configurado) o se mantiene el rewrite de Vercel? Afecta a BK-005, BK-016 y FR-106. Recomendación: llamadas directas y cookie host-only `SameSite=Lax`.
7. **Licencia** de ambos repos (el frontend es público sin LICENSE) y **analítica** (¿GA4 con consentimiento o solo Vercel Analytics?).
8. **Rol EDITOR**: con un solo autor, ¿se mantiene el rol? Si sí, política "solo sus posts" (BK-030).

## Cómo se ejecuta

Ver `ORCHESTRATION.md`. Resumen: `BACKLOG.md` por repo → `/relaunch-iteration` (workflow con Opus orquestador, Sonnet implementadores/revisores, Haiku verificador) → rama `relaunch/<fase>` → PR a `main` revisado por humano al cerrar cada fase. Bucle: `/loop /relaunch-iteration`.

Orden recomendado entre repos en cada fase: primero los tickets `BK-*` de los que dependan tickets `FR-*` (p. ej. endpoint de sitemap), luego el front. Si ambos repos están clonados lado a lado, el orquestador comprueba los contratos leyendo el otro repo.

## Métricas de seguimiento

- Backlog: tickets por estado y fase (`/relaunch-status`). Total inicial: 46 tickets backend, 57 frontend.
- Verificación: tsc/lint/tests/build por iteración (reportes en `reports/`). Líneas base: backend ESLint 330 errores, Jest 82/84 (2 specs frágiles), cobertura 7,7 %; frontend lint 3 warnings, Vitest 48/48, cobertura solo en `lib/`. Deben mejorar de forma monótona.
- Producto: Lighthouse móvil (home, post) sin medir aún (sitio no accesible desde el entorno); First Load JS de `/post/[slug]` 521 kB (objetivo < 250 kB), `/` 199 kB, `/terminos` 155 kB (objetivo < 120 kB); páginas públicas clave renderizadas en servidor: 0 de 4.
- Seguridad: hallazgos abiertos al inicio: backend 1 P0 + 11 P1 (BS/BQ), frontend 4 P0 + 11 P1 (FA/FU); `npm audit --omit=dev`: backend 4 críticos/13 altos, frontend 1 crítico/5 altos (Next 15.3.9). Objetivo: 0 P0/P1 y 0 críticos/altos antes de la Fase 5.

## Coste estimado (orientativo, precios API de octubre 2026: Opus 5.5 4/20, Sonnet 5.5 2/10, Haiku 4.5 1/5 USD por millón de tokens de entrada/salida)

Una iteración de 4 tickets consume del orden de 2-3 sesiones Opus (plan, integración, cierre), 4-8 sesiones Sonnet de implementación, 4-8 de revisión y 10-17 de Haiku. Con caché de prompt activa, el gasto típico queda en el rango **10-30 USD por iteración**; una fase de 15-25 tickets, en **60-200 USD**. Los tickets `L` (p. ej. migrar home/post a Server Components) pueden duplicar el coste de su iteración. Son órdenes de magnitud, no presupuesto: mide las primeras dos iteraciones y ajusta `batchSize`/`maxFixRounds`.

## Riesgos y mitigaciones

- **Sin base de datos ni red en sesiones cloud**: los specs que dependen de Postgres quedan `env-blocked`; mitigación: F0 añade CI con Postgres de servicio para que el verde real lo dé GitHub Actions.
- **Dos repos, un contrato**: mitigación: tickets cruzados con `blocked_by` y matriz de contrato regenerada por `relaunch-scout` al cerrar cada fase.
- **Cambios de cookies/dominio en producción**: solo con gate humano y prueba en preview.
- **Deriva del plan**: `audit-sweep` al cerrar cada fase propone tickets; el humano los promueve.
