# Backlog del relanzamiento — frontend (blog-fullstack-front)

Fuente de verdad para los bucles autónomos (`/relaunch-iteration`). Un ticket por bloque; los agentes leen y actualizan solo los campos `estado` y `notas`. Estados: `todo` · `in_progress` · `done` · `blocked` · `proposed` (propuesto por `audit-sweep`, requiere promoción humana). Prioridad P0-P3; esfuerzo S (≤ ½ día de agente), M (≤ 2 días), L (> 2 días). `blocked_by` acepta ids de este repo (`FR-*`) y del backend (`BK-*`, ver `blog-fullstack-back/docs/relaunch/BACKLOG.md`). `origen` remite a los hallazgos de `AUDIT.md` y `audit/*.md`.

Verificación estándar (todo ticket la ejecuta además de la suya): `npx tsc --noEmit && npm run lint && npm run test:run && npm run build`. En el entorno cloud el build avisa del sitemap/metadataBase por falta de red: no cuenta como fallo salvo que el ticket trate justo eso.

Convenciones de implementación: ver `CLAUDE.md`. Gates humanos: ver `PLAN.md`.

---

## Fase 0 — Cimientos

### FR-000 · Actualizar Next a 15.5.x (avisos críticos) y alinear paquetes @next
- fase: 0
- prioridad: P0
- estado: todo
- esfuerzo: S
- tags: security, deps
- blocked_by: —
- origen: DX-04
- archivos: package.json, package-lock.json
- descripcion: `next@15.3.9` acumula 28 avisos (2 críticos: RCE en Image Optimization con AVIF y en servidores Windows; alto: SSRF en rewrites, DoS en Server Components). La corrección está dentro del rango `^15`. Actualizar `next`, `@next/third-parties` y `eslint-config-next` a la misma 15.5.x (wanted 15.5.27 en la auditoría). No saltar a Next 16 en este ticket (quita `next lint`; va en FR-406).
- aceptacion:
  - `npm ls next` muestra 15.5.x y `npm audit --omit=dev` no lista avisos críticos/altos para `next`.
  - `@next/third-parties` y `eslint-config-next` en la misma versión que `next`.
  - Build y tests en verde; sin cambios de comportamiento.
- verificar: estándar + `npm audit --omit=dev --json | node -e "const a=JSON.parse(require('fs').readFileSync(0));const n=a.vulnerabilities?.next;console.log(n?JSON.stringify(n.severity):'next: sin avisos')"`
- notas: —

### FR-001 · CI en GitHub Actions + Dependabot
- fase: 0
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: ci, devex
- blocked_by: FR-002
- origen: DX-01, DX-18, FA-14
- archivos: .github/workflows/ci.yml, .github/dependabot.yml
- descripcion: Crear `verify` (ubuntu, Node 22, `npm ci --legacy-peer-deps` mientras exista FR-003 pendiente, `tsc --noEmit`, lint, `vitest run`, `next build` con caché de `.next/cache` y env `NEXT_PUBLIC_*` dummy) en PR y push a `main`, con `concurrency`. Añadir `dependabot.yml` semanal agrupado (minor+patch) para npm y mensual para github-actions. Plantilla en `audit/devex.md` sección (e). La protección de rama y activar alertas de Dependabot son acciones humanas en GitHub: anotarlas en `notas` para el humano.
- aceptacion:
  - El workflow pasa en una ejecución real en la rama `relaunch/*` (o, si no hay push automático, `act`/lectura cuidadosa + validación YAML con `node -e` o `yq`).
  - `npm test` deja de ser modo watch: scripts `test` → `vitest run`, `test:watch` → `vitest`.
- verificar: estándar + validación YAML del workflow
- notas: Acciones humanas pendientes: proteger `main` requiriendo `verify`; activar Dependabot alerts/security updates; desconectar los dos proyectos de Cloudflare Pages del repo.

### FR-002 · Lint completo (hooks/, utils/), 0 errores, scripts de typecheck
- fase: 0
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: devex, quality
- blocked_by: —
- origen: FA-14, DX-16
- archivos: eslint.config.mjs, package.json, hooks/comments/useCommentsRefactored.ts, hooks/use-media-upload.ts, hooks/use-toast.ts, hooks/useComments.ts
- descripcion: `next lint` solo cubre los directorios por defecto; `--dir hooks --dir utils` revela 3 errores y 9 warnings. Hacer que `npm run lint` ejecute `eslint .` con la flat config (o `next lint --dir app --dir components --dir hooks --dir lib --dir utils` mientras siga en Next 15), corregir los 3 errores y los `exhaustive-deps` que sean reales (no silenciar con disable), añadir script `typecheck: tsc --noEmit`.
- aceptacion:
  - `npm run lint` recorre app, components, hooks, lib y utils y termina con 0 errores; los warnings no superan los 3 actuales.
  - Ningún `eslint-disable` nuevo.
- verificar: estándar
- notas: —

### FR-003 · Resolver el conflicto de peers (react-day-picker 9) y retirar Cloudflare
- fase: 0
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: deps, devex
- blocked_by: FR-004
- origen: FA-15, DX-03, DX-07
- archivos: package.json, components/ui/calendar.tsx, components/admin/PostsTable.tsx
- descripcion: `npm ci` falla con ERESOLVE porque `react-day-picker@8` excluye React 19 (también `react-google-recaptcha-v3` y `react-tagsinput`, que se eliminan en FR-004). Actualizar `react-day-picker` a ≥ 9 y regenerar `components/ui/calendar.tsx` con la versión shadcn para v9 (único consumidor: `PostsTable`). Eliminar el script `pages:build` y `@cloudflare/next-on-pages`. Si el upgrade del calendario se complica, dejar `.npmrc` con `legacy-peer-deps=true` como paso intermedio y documentarlo en notas.
- aceptacion:
  - `npm ci` sin flags termina con exit 0 (o `.npmrc` comprometido y documentado en README si se opta por el intermedio).
  - El selector de fecha del admin funciona (probar `/admin/posts` en `next dev`).
  - `package.json` sin `pages:build` ni `@cloudflare/next-on-pages`.
- verificar: estándar + `rm -rf node_modules && npm ci`
- notas: Acción humana: desconectar los proyectos Cloudflare Pages en su dashboard (checks rojos en los últimos 6 commits).

### FR-004 · Eliminar dependencias sin uso
- fase: 0
- prioridad: P3
- estado: todo
- esfuerzo: S
- tags: deps
- blocked_by: —
- origen: FA-18, FU-31, DX-20
- archivos: package.json, package-lock.json
- descripcion: Desinstalar `emoji-picker-react`, `prism-react-renderer`, `react-masonry-css`, `react-tagsinput`, `@types/react-tagsinput`, `react-google-recaptcha-v3` (el proyecto tiene su propio `RecaptchaProvider`). `react-quill-new` y `embla-carousel-react` solo los usan archivos muertos: quitarlos junto con FR-005 o dejar nota. Confirmar cada uno con `grep -rn` antes de borrar.
- aceptacion:
  - Ninguna de las dependencias listadas aparece en `package.json` ni en imports.
  - Build en verde.
- verificar: estándar
- notas: —

### FR-005 · Borrar código muerto y rutas placeholder
- fase: 0
- prioridad: P3
- estado: todo
- esfuerzo: S
- tags: quality
- blocked_by: —
- origen: FA-17, FU-31, FU-25
- archivos: hooks/comments/*, components/admin/{ContentEditor,SimpleContentEditor,PostEditContainer,RecentPosts}.tsx, components/blog/CodeBlock.tsx, components/common/{SkeletonCard,UserAvatar}.tsx, lib/editor-config.ts, components/ui/{carousel,popover,slider}.tsx, app/(home)/en-construccion, app/(home)/exercises, next.config.mjs
- descripcion: Eliminar los archivos sin importadores (verificar cada uno con `grep -rn "<nombre>" app components hooks lib`). `hooks/comments/*` es un refactor paralelo nunca usado; el canónico es `hooks/useComments.ts` (decisión: borrar el refactor; si se prefiere lo contrario, escalar). Sustituir la página `/exercises` por un `redirects()` permanente a `/courses` en `next.config.mjs`. Quitar el CSS de Quill/tagsinput en `globals.css` solo si FR-213 no lo hace antes.
- aceptacion:
  - `npm run build` en verde; ninguna ruta pública nueva rota (comprobar `/exercises` → 308 a `/courses`).
  - El conteo de líneas TS/TSX baja al menos 1.000.
- verificar: estándar
- notas: —

### FR-006 · README real, .env.example y LICENSE/aviso de derechos
- fase: 0
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: docs
- blocked_by: —
- origen: DX-12, DX-22, DX-23, FU-30
- archivos: README.md, .env.example, .gitignore, LICENSE, public/{file,globe,next,vercel,window}.svg, public/google.json, public/placeholder-hero-image.jpg
- descripcion: Escribir un README en español (qué es, stack, variables de entorno, comandos, despliegue en Vercel, enlace a `docs/relaunch`). Añadir `!.env.example` al `.gitignore` y comprometer `.env.example` con las 6 variables `NEXT_PUBLIC_*` y comentarios. Borrar los 7 archivos de `public/` sin referencias. El repo es público: añadir LICENSE (propuesta: MIT para el código, contenido reservado) o un aviso explícito; si el humano no ha decidido, dejar `LICENSE` fuera y anotarlo.
- aceptacion:
  - `git ls-files .env.example` lo muestra; README sin texto de create-next-app.
  - Los archivos listados ya no existen y el build no los referencia.
- verificar: estándar
- notas: Decisión humana pendiente: licencia.

### FR-007 · Una sola fuente de configuración de URLs (`lib/env.ts`)
- fase: 0
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: config, seo
- blocked_by: —
- origen: FA-12, DX-13
- archivos: lib/env.ts (nuevo), lib/api.ts, next.config.mjs, app/robots.ts, app/sitemap.ts, app/(home)/post/[slug]/page.tsx, app/(home)/post/[slug]/PostPageClient.tsx, lib/site.ts (nuevo)
- descripcion: Hoy hay tres convenciones de URL base (rewrites, `page.tsx`, `lib/api.ts`) y cinco fallbacks mal escritos `https//technoespacio.com`. Crear `lib/env.ts` que valide con zod `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_API_URL` (normalizando `/api/v1`) y exporte `SITE_URL`, `API_ORIGIN`, `API_BASE`; crear `lib/site.ts` con nombre, descripción, handle `@juancm_dev`, redes y email. Usarlos en todos los puntos listados. En producción, variable ausente → error claro en build.
- aceptacion:
  - `grep -rn "https//" app components lib` devuelve 0 resultados.
  - `grep -rn "technoespacio.com" app components lib next.config.mjs` solo aparece en `lib/env.ts`/`lib/site.ts` (y en tests).
  - Tests unitarios de `lib/env.ts` (presente/ausente/sin sufijo).
- verificar: estándar
- notas: —

### FR-008 · Sitemap con posts (y proyectos) y fallo visible
- fase: 0
- prioridad: P0
- estado: todo
- esfuerzo: S
- tags: seo
- blocked_by: FR-007
- origen: FA-01, FU-07
- archivos: app/sitemap.ts, lib/api/server.ts (nuevo), lib/sitemap.test.ts (nuevo)
- descripcion: El sitemap llama a `posts/sitemap` (inexistente en el backend) y traga el error: solo 4 URLs. Implementar un fetcher de servidor que pagine `GET posts?page=n&limit=100` (existe y devuelve solo PUBLISHED) hasta `meta.lastPage`, con URL absoluta desde `lib/env.ts`, `lastModified` desde `updatedAt`, y añadir `/projects`, `/courses` y `/courses/[slug]`. Cuando exista `BK-004` (`GET posts/sitemap`), cambiar a ese endpoint. En caso de error de red, registrar con `logger.error` y, si `process.env.CI` está definido, lanzar.
- aceptacion:
  - Test unitario con fetch mockeado: `sitemap()` devuelve las URLs de los posts y de proyectos.
  - `npm run build` no muestra `Failed to parse URL`.
- verificar: estándar + `npm run test:run -- lib/sitemap`
- notas: —

### FR-009 · Reparar la lista de usuarios del admin (`new URL(relativa)`)
- fase: 0
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: bug, admin
- blocked_by: —
- origen: FA-03
- archivos: hooks/use-users.ts, lib/api.test.ts
- descripcion: Desde `5c44870`, `buildApiUrl` devuelve rutas relativas en el navegador y `new URL('/api/v1/users')` lanza; `/admin/users` muestra siempre una tabla vacía. Construir la query con `URLSearchParams` y `buildApiUrl(\`users?${params}\`)`. Añadir test de la rama navegador de `buildApiUrl` (stub de `window`).
- aceptacion:
  - Test que reproduce el fallo (falla antes, pasa después).
  - Manual en `next dev`: `/admin/users` carga datos con un backend o mock.
- verificar: estándar
- notas: —

### FR-010 · metadataBase, plantilla de título, canonical y noindex básicos
- fase: 0
- prioridad: P0
- estado: todo
- esfuerzo: S
- tags: seo
- blocked_by: FR-007
- origen: FU-02, FA-11, FU-32
- archivos: app/layout.tsx, app/admin/layout.tsx, app/(home)/signup/layout.tsx, app/(home)/reset-password/layout.tsx, app/(home)/post/[slug]/page.tsx
- descripcion: Añadir `metadataBase: new URL(SITE_URL)`, `title: { default, template: '%s | Techno Espacio' }`, `alternates: { canonical: './' }` en el layout raíz; `authors` con la persona; `robots: { index: false }` en los layouts de admin y auth; `twitter.creator`/`site` = `@juancm_dev`; quitar `keywords`. La metadata por página de las rutas cliente va en FR-205.
- aceptacion:
  - `next build` ya no avisa de `metadataBase`.
  - El HTML de `/admin` y `/signin` contiene `noindex`.
- verificar: estándar
- notas: —

### FR-011 · Assets referenciados pero inexistentes y placeholders
- fase: 0
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: seo, ux
- blocked_by: —
- origen: FU-05, FA-10
- archivos: app/layout.tsx, components/blog/StructuredData.tsx, components/blog/BlogPost.tsx, app/(home)/post/[slug]/PostPageClient.tsx, app/(home)/profile/[nick]/page.tsx, public/
- descripcion: `/logo.png`, `/og-image.jpg`, `/placeholder.svg` y `/default-avatar.png` no existen. Quitar el `<link rel="preload" href="/logo.png">`; añadir un logo cuadrado ≥ 112 px, una portada placeholder ligera (SVG o WebP < 30 kB) y apuntar todas las referencias a archivos reales (una constante en `lib/site.ts`).
- aceptacion:
  - `for f in logo og-image placeholder default-avatar; grep -rn "/$f" app components lib` → cada referencia apunta a un archivo existente en `public/`.
  - Sin 404 de assets en `next start` al cargar `/`, `/post/<slug>` y `/profile/<nick>`.
- verificar: estándar
- notas: —

### FR-012 · robots.ts: prefijos sin barra final y rutas sin valor
- fase: 0
- prioridad: P3
- estado: todo
- esfuerzo: S
- tags: seo
- blocked_by: FR-007
- origen: FU-29
- archivos: app/robots.ts
- descripcion: Las reglas `disallow` llevan barra final y no bloquean `/admin`, `/signin`, etc.; faltan `/search`, `/verify-email`, `/courses/*/exam/*`. Reescribir con prefijos correctos y `sitemap` desde `SITE_URL`.
- aceptacion:
  - `/robots.txt` generado contiene `Disallow: /admin`, `/signin`, `/signup`, `/profile`, `/reset-password`, `/search`, `/verify-email`.
- verificar: estándar
- notas: —

### FR-013 · Avatar por defecto neutro (no la foto del autor)
- fase: 0
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: ux, brand
- blocked_by: —
- origen: FU-13
- archivos: lib/utils.ts, components/common/AuthorAvatar.tsx, components/ui/avatar.tsx
- descripcion: `getAvatarUrl()` devuelve `/profile.jpg` (selfie del autor) para cualquier usuario sin avatar. Devolver `null` y usar `AvatarFallback` con iniciales (o un SVG neutro). Mantener la foto del autor solo en About/Hero.
- aceptacion:
  - Test de `getAvatarUrl(undefined)` → `null`; componentes muestran iniciales.
  - `grep -rn "profile.jpg" app components lib` solo en About/Hero.
- verificar: estándar
- notas: —

### FR-015 · Alinear contrato: commentCount, status en búsqueda pública, límite de tags
- fase: 0
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: contract
- blocked_by: —
- origen: FA-08, FA-23, FA-22
- archivos: lib/types.ts, components/blog/BlogPost.tsx, app/(home)/page.tsx, app/(home)/search/page.tsx, components/common/TagFilters.tsx, components/layout/Sidebar.tsx
- descripcion: Las tarjetas leen `comments` pero el backend envía `commentCount` (nunca se muestra); la búsqueda pública envía `status=PUBLISHED` (el backend lo forzará en BK-003); `TagFilters` espera 8 tags pero el backend devuelve 4 por defecto. Definir `PostPreview` (`commentCount`) y `PostDetail` (`comments: Comment[]`), eliminar los campos fantasma `image`/`date`, dejar de enviar `status`, pedir `popular-tags?limit=8` y compartir una sola petición de tags entre `TagFilters` y `Sidebar` (prop desde la página).
- aceptacion:
  - Las tarjetas muestran el número de comentarios con un fixture MSW o mock.
  - `grep -rn "status=PUBLISHED" app` → 0 en rutas públicas.
  - Una sola llamada a `popular-tags` por carga de home (comprobar en `next dev` con la pestaña Red o con mock que cuenta llamadas).
- verificar: estándar
- notas: —

---

## Fase 1 — Seguridad y contrato API

### FR-101 · Access token solo en memoria; arranque de sesión con refresh + profile/me
- fase: 1
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: security, auth
- blocked_by: BK-006
- origen: FA-05, FA-21, FA-24
- archivos: lib/auth.ts, components/layout/AuthProvider.tsx, components/auth/ProtectedRoute.tsx, lib/customFetch.ts
- descripcion: El `accessToken` y el perfil (con email) se persisten en `localStorage`. Persistir solo `hasSession: boolean`; al arrancar, si `hasSession`, llamar una vez a `auth/refresh-token` y luego a `profile/me` (no a la ruta pública `profile/:id`). `refreshAccessToken` debe guardar el token aunque `user` sea null (hoy lo descarta). Mantener la UI sin parpadeo con un estado `isBootstrapping`.
- aceptacion:
  - `localStorage['auth-storage']` no contiene `accessToken` ni `email`.
  - Recargar la página con cookie válida restaura la sesión (test con MSW: refresh → profile/me → user).
  - Login usa `profile/me`.
- verificar: estándar + tests de `lib/auth` (FR-401 aporta la infraestructura; si aún no existe, crear `vitest.config.ts` mínimo con alias `@` y `jsdom` en este ticket)
- notas: —

### FR-102 · Sanitizar HTML legacy y escapar JSON-LD
- fase: 1
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: security
- blocked_by: —
- origen: FA-05, FU-06, BS-15
- archivos: app/(home)/post/[slug]/PostPageClient.tsx, components/blog/StructuredData.tsx, lib/sanitize.ts (nuevo)
- descripcion: El contenido legacy se inyecta con `innerHTML`/`dangerouslySetInnerHTML` sin sanitizar y el JSON-LD se serializa sin escapar `<`. Añadir `isomorphic-dompurify` (funciona en servidor y cliente) con allowlist de etiquetas Quill, `javascript:` prohibido; escapar `<` como `<` en los scripts JSON-LD. El backend sanitizará también al guardar (BK-015); esta defensa en el render se mantiene.
- aceptacion:
  - Test: un `<img onerror=alert(1)>` y un `<script>` en contenido legacy se eliminan; un enlace `javascript:` se neutraliza.
  - Test: `StructuredData` no contiene `</script>` sin escapar cuando el título lo incluye.
- verificar: estándar
- notas: —

### FR-103 · Content-Security-Policy
- fase: 1
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: security
- blocked_by: FR-102, FR-214
- origen: FA-05, FU-37
- archivos: next.config.mjs, middleware.ts (nuevo o FR-106), app/layout.tsx
- descripcion: No hay CSP. Añadir una política en modo `Content-Security-Policy-Report-Only` primero (una iteración) y luego enforce: `default-src 'self'`, `script-src 'self' 'nonce-…'` (middleware que genera nonce) o, como mínimo, `'self'` + hosts de GA/Vercel; `img-src` con el CDN; `frame-src` YouTube; `connect-src` API. Documentar en README.
- aceptacion:
  - Cabecera presente en `next start`; `/`, `/post/<slug>` y `/admin` funcionan sin violaciones en consola (probar con Playwright o manualmente).
- verificar: estándar
- notas: Gate humano antes de pasar de report-only a enforce (riesgo de romper analítica/embeds).

### FR-104 · customFetch: 403 no es 401; no refrescar sin sesión
- fase: 1
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: auth
- blocked_by: BK-010
- origen: FA-06
- archivos: lib/customFetch.ts, hooks/*, components/auth/ProtectedRoute.tsx, app/admin/*/layout.tsx
- descripcion: Hoy cualquier 401 dispara refresh+retry, incluidos los fallos de rol (que el backend devolverá como 403 tras BK-010). Refrescar solo en 401 con sesión activa; devolver 403 al llamador con un error tipado `ForbiddenError` que la UI muestra como "sin permisos"; no reintentar. Añadir layouts `ProtectedRoute allowedRoles={['admin']}` para proyectos, cursos y exámenes del admin.
- aceptacion:
  - Tests MSW: 403 → sin llamada a refresh; 401 sin sesión → sin refresh; 401 con sesión → un refresh y un retry.
  - Un editor que entra en `/admin/projects` es redirigido.
- verificar: estándar
- notas: —

### FR-105 · Refresh bajo demanda y coordinación entre pestañas
- fase: 1
- prioridad: P2
- estado: todo
- esfuerzo: M
- tags: auth, perf
- blocked_by: FR-101
- origen: FA-07
- archivos: components/layout/AuthProvider.tsx, lib/auth.ts, lib/customFetch.ts, app/(home)/post/[slug]/PostPageClient.tsx, hooks/use-course-progress.ts, hooks/use-saved-posts.ts
- descripcion: Eliminar los `setInterval` (refresh cada 10 min y estado cada 5 min por pestaña). Refrescar solo ante 401 o cabecera `x-access-token`, serializando con `navigator.locks` y compartiendo token/logout por `BroadcastChannel`. Comprobar `user-status` en `visibilitychange`/focus con throttle de 5 min. Estrechar dependencias de efectos a `user?.userId` para que un refresh no vuelva a cargar posts ni reenvíe `markPostCompleted`.
- aceptacion:
  - Con dos pestañas abiertas (Playwright) ninguna cierra sesión tras 15 min simulados; un refresh no provoca refetch del post.
  - `grep -n setInterval components/layout/AuthProvider.tsx` → 0.
- verificar: estándar
- notas: —

### FR-106 · Admin: middleware de UX, noindex y protección por rol en servidor
- fase: 1
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: auth
- blocked_by: FR-101
- origen: FA-21, FA-06
- archivos: middleware.ts (nuevo), app/admin/layout.tsx
- descripcion: `/admin` solo se protege en cliente. Añadir `middleware.ts` que redirige a `/signin?next=` cuando no existe la cookie `refreshToken` (comprobación de UX; la autoridad sigue siendo el backend) y `robots: noindex` en el layout de admin (si no lo hizo FR-010). No intentar validar el JWT en el edge.
- aceptacion:
  - Sin cookie, `GET /admin` responde 307 a `/signin`; con cookie, 200.
- verificar: estándar
- notas: Tras BK-016 (cookie host-only para `api.`), este middleware dejará de ver la cookie: revisar entonces (usar una cookie `hasSession` no sensible emitida por el front).

### FR-107 · Estado inicial de likes y guardados; guardados desde su endpoint
- fase: 1
- prioridad: P2
- estado: todo
- esfuerzo: M
- tags: contract, ux
- blocked_by: BK-011
- origen: FA-09
- archivos: hooks/use-likes.ts, hooks/use-saved-posts.ts, hooks/use-profile.ts, components/blog/SaveButton.tsx
- descripcion: `hasLiked` arranca en `false` y nunca consulta `likes/post/:id/check`; los guardados leen solo la página 1 y el perfil filtra los primeros 50 posts públicos. Inicializar desde los endpoints `check` (o del campo `hasLiked`/`isSaved` que BK-011 añada al detalle), renderizar guardados desde `GET saved-posts` paginado y dejar de montar una lista completa por cada `SaveButton`.
- aceptacion:
  - Tests MSW: al cargar un post con like previo el botón aparece activo; perfil muestra guardados de la API, no filtrados.
- verificar: estándar
- notas: —

### FR-108 · Tipos generados desde el OpenAPI del backend
- fase: 1
- prioridad: P2
- estado: todo
- esfuerzo: M
- tags: contract, devex
- blocked_by: BK-021
- origen: FA-20, FA-08
- archivos: lib/api/schema.d.ts (generado), package.json (script `api:types`), lib/types.ts
- descripcion: Generar `lib/api/schema.d.ts` con `openapi-typescript` a partir del JSON de Swagger exportado por el backend (BK-021 lo publica como artefacto `openapi.json` en el repo back). Derivar `PostPreview`, `PostDetail`, `UserProfile`, `Comment` de ahí y borrar los tipos a mano equivalentes. Añadir el archivo generado al repo y un check en CI que falle si está desactualizado respecto al JSON referenciado.
- aceptacion:
  - `npm run api:types` regenera sin diff; `tsc` en verde usando los tipos generados en al menos posts y perfil.
- verificar: estándar
- notas: —

---

## Fase 2 — Rendimiento, SEO y renderizado

### FR-201 · Página de post renderizada en servidor (una sola carga, notFound, JSON-LD)
- fase: 2
- prioridad: P0
- estado: todo
- esfuerzo: L
- tags: seo, perf, render
- blocked_by: FR-102, FR-007
- origen: FU-01, FA-02, FA-10
- archivos: app/(home)/post/[slug]/page.tsx, app/(home)/post/[slug]/PostPageClient.tsx, components/blog/PostContentRenderer.tsx, components/blog/StructuredData.tsx, lib/api/server.ts
- descripcion: Hoy el servidor solo obtiene el post para la metadata y el cliente lo vuelve a pedir; el HTML es un esqueleto y un slug inexistente devuelve 200. Obtener el post una vez en servidor con `cache()`/`fetch` (`revalidate: 300`, tag `post:<slug>`), `notFound()` si no existe, renderizar en servidor el contenido v2 y el legacy sanitizado (FR-102), emitir JSON-LD desde el servidor y pasar `post` como prop a islas cliente: `LikeButton`, `SaveButton`, `ShareMenu`, `Comments` (lazy). Añadir `generateStaticParams` para los slugs publicados con `dynamicParams = true`. Los borradores se ven solo desde `/admin/posts/preview/[id]` (cliente con token) o Draft Mode.
- aceptacion:
  - `curl -s http://localhost:3000/post/<slug>` (tras `next build && next start` con API mock o real) contiene el `<h1>`, el cuerpo y el `application/ld+json`.
  - Slug inexistente → HTTP 404.
  - Una sola petición a `posts/slug/:slug` por carga (sin la segunda desde el cliente).
- verificar: estándar
- notas: Ticket grande: dividir en PRs si el implementador lo pide (servidor + islas).

### FR-202 · Resaltado de código en servidor y bundle del post < 250 kB
- fase: 2
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: perf
- blocked_by: FR-201
- origen: FU-08
- archivos: components/blog/PostContentRenderer.tsx, app/(home)/post/[slug]/PostPageClient.tsx, package.json
- descripcion: El post carga el Prism completo (332 lenguajes, 270 kB gz) más react-markdown y framer-motion. Resaltar en servidor con `shiki` (o `rehype-pretty-code`) y no enviar resaltador al cliente; cargar `react-markdown` con `next/dynamic` solo para posts legacy. Objetivo First Load JS de `/post/[slug]` < 250 kB.
- aceptacion:
  - Tabla de `next build`: `/post/[slug]` First Load JS < 250 kB (anotar el valor en notas).
  - Los bloques de código siguen resaltados en un post de prueba.
- verificar: estándar
- notas: —

### FR-203 · Home como Server Component con ISR
- fase: 2
- prioridad: P0
- estado: todo
- esfuerzo: M
- tags: seo, perf, render
- blocked_by: FR-015, FR-007
- origen: FU-09, FA-02, FA-22, FU-27
- archivos: app/(home)/page.tsx, components/blog/BlogList.tsx, components/common/TagFilters.tsx, components/layout/Sidebar.tsx, lib/api/server.ts
- descripcion: La home es `"use client"` y hace 5-8 llamadas tras hidratar. Convertirla en Server Component con `revalidate: 300`, paginación y filtro por tag mediante `searchParams` (URLs rastreables `/?page=2&tag=x`), primeros 6 posts en el HTML, tags populares y recomendados obtenidos en servidor y pasados como props. Mantener islas cliente solo para interacción. Esqueletos con el mismo número de tarjetas que la página.
- aceptacion:
  - `curl -s http://localhost:3000/` contiene los títulos y enlaces de los posts.
  - Cero llamadas a la API desde el cliente al cargar la home sin sesión.
- verificar: estándar
- notas: —

### FR-204 · Cursos y proyectos renderizados en servidor con metadata
- fase: 2
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: seo, render
- blocked_by: FR-203
- origen: FA-02, FA-11
- archivos: app/(home)/projects/page.tsx, app/(home)/courses/page.tsx, app/(home)/courses/[slug]/page.tsx
- descripcion: Mismo patrón que FR-203 para `/projects` (portfolio: contenido clave para la marca), `/courses` y `/courses/[slug]`, con `generateMetadata` propio y `notFound()`. Si el gate humano decide ocultar cursos (PLAN → decisiones), limitar este ticket a proyectos y anotar.
- aceptacion:
  - El HTML de `/projects` contiene nombre y stack de los proyectos; `/courses/<slug>` inexistente → 404.
- verificar: estándar
- notas: —

### FR-205 · Metadata y canonical por página (wrappers de servidor)
- fase: 2
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: seo
- blocked_by: FR-010
- origen: FU-02, FA-11
- archivos: app/(home)/{about,contact,faq,terminos,politica-privacidad,search,signin,signup,verify-email,reset-password}/page.tsx y layouts
- descripcion: Todas las páginas cliente comparten título y descripción. Dividir cada una en `page.tsx` de servidor que exporta `metadata` (título, descripción, canonical, `robots` donde toque) y un componente cliente hijo. `/search`, auth y `verify-email` con `robots: { index: false }`.
- aceptacion:
  - Cada ruta pública tiene `<title>` distinto en el HTML y `<link rel="canonical">`.
- verificar: estándar
- notas: —

### FR-206 · JSON-LD Person + WebSite y breadcrumb real
- fase: 2
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: seo, brand
- blocked_by: FR-007, FR-011
- origen: FU-06
- archivos: app/layout.tsx, components/blog/StructuredData.tsx, lib/site.ts
- descripcion: Añadir en el layout raíz JSON-LD `WebSite` y `Person` (nombre, jobTitle, url, image, `sameAs` LinkedIn/GitHub/X). En el post: `BlogPosting` con `author` → `/about`, `publisher` tipo Person, breadcrumb Inicio › Blog › título apuntando a rutas reales (`/blog` existe tras FR-303; hasta entonces `/`).
- aceptacion:
  - Validación con el validador de schema.org (o test de estructura) sin errores; sin URLs a rutas inexistentes.
- verificar: estándar
- notas: —

### FR-207 · Imagen OG rediseñada y por post
- fase: 2
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: seo, brand
- blocked_by: FR-010
- origen: FU-04
- archivos: app/opengraph-image.tsx (nuevo), app/(home)/post/[slug]/opengraph-image.tsx (nuevo), public/tecno-espacio.png
- descripcion: La OG actual pesa 425 kB y dice "Tecno Espacio.com / Lo ultimo en tech". Generar OG dinámicas con `next/og` (`ImageResponse`): sitio (nombre, rol, foto) y post (título, tags, autor), < 200 kB, 1200×630. Eliminar la PNG antigua tras reemplazar referencias.
- aceptacion:
  - `/opengraph-image` y `/post/<slug>/opengraph-image` responden 200 con `image/png` y < 200 kB.
  - La metadata del post referencia la nueva imagen.
- verificar: estándar
- notas: El humano debe aprobar el diseño (gate visual) antes de marcar done.

### FR-208 · RSS (`/feed.xml`)
- fase: 2
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: seo, brand
- blocked_by: FR-008
- origen: FU-14
- archivos: app/feed.xml/route.ts (nuevo), app/layout.tsx
- descripcion: Route Handler que devuelve RSS 2.0 con los 20 últimos posts publicados (título, enlace, fecha, extracto, autor), `revalidate: 3600`, y `<link rel="alternate" type="application/rss+xml">` en el layout.
- aceptacion:
  - `/feed.xml` válido (parsea con un validador RSS o test con `fast-xml-parser`), contiene posts.
- verificar: estándar
- notas: —

### FR-209 · Revalidación on-demand desde el backend
- fase: 2
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: perf, cross-repo
- blocked_by: FR-201, FR-203, BK-022
- origen: FA-02 (arquitectura objetivo)
- archivos: app/api/revalidate/route.ts (nuevo), lib/env.ts
- descripcion: POST con secreto compartido (`REVALIDATE_SECRET`) que llama a `revalidateTag('posts')`, `revalidateTag('post:<slug>')`, `revalidatePath('/sitemap.xml')`. El backend (BK-022) lo invoca al crear/editar/borrar/publicar posts y en el cron de SCHEDULED.
- aceptacion:
  - Test: POST sin secreto → 401; con secreto → 200 y `revalidateTag` invocado (mock).
- verificar: estándar
- notas: —

### FR-210 · Fuentes: variables, sin pesos muertos, sin preconnects
- fase: 2
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: perf
- blocked_by: —
- origen: FU-20
- archivos: app/layout.tsx, tailwind.config.ts, app/globals.css
- descripcion: Inter con 5 pesos (100 sin usar) y Manrope con 4, ambos `preload`; preconnects a Google Fonts innecesarios (next/font autohospeda). Usar las versiones variables (omitir `weight`), quitar los preconnects y definir `--font-mono` (JetBrains Mono o `ui-monospace`) para los bloques de código.
- aceptacion:
  - ≤ 2 archivos de fuente precargados en el HTML; `var(--font-mono)` definido.
- verificar: estándar
- notas: —

### FR-211 · framer-motion fuera del layout global y respeto a reduced-motion
- fase: 2
- prioridad: P2
- estado: todo
- esfuerzo: M
- tags: perf, a11y
- blocked_by: —
- origen: FU-22, FU-16
- archivos: components/layout/Header.tsx, components/common/Hero.tsx, app/globals.css, app/layout.tsx, 31 archivos que importan framer-motion
- descripcion: El header usa `motion` y mete ~35 kB gz en todas las páginas; 21 iconos flotantes y un gradiente infinito se animan sin respetar `prefers-reduced-motion`. Header sin framer-motion (CSS); entradas con `tailwindcss-animate` o `LazyMotion` + `m`; `MotionConfig reducedMotion="user"` donde quede motion; animaciones CSS envueltas en `@media (prefers-reduced-motion: no-preference)`; reducir los iconos flotantes a ≤ 4 (FR-302 decide si se eliminan).
- aceptacion:
  - First Load JS de `/terminos` < 120 kB (hoy 155 kB).
  - Con `prefers-reduced-motion: reduce` no hay animaciones infinitas (Playwright con `emulateMedia`).
- verificar: estándar
- notas: —

### FR-212 · Imágenes: sizes, priority, alt y assets pesados
- fase: 2
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: perf, a11y
- blocked_by: FR-011
- origen: FU-21, DX-22
- archivos: components/blog/BlogPost.tsx, components/blog/PostContentRenderer.tsx, app/(home)/post/[slug]/PostPageClient.tsx, app/(home)/profile/[nick]/page.tsx, public/
- descripcion: `layout="fill" objectFit` legacy (descarga a 100vw), sin `sizes` ni `priority`, imágenes del cuerpo como `<img>` sin dimensiones y alt genérico, `placeholder-post-image.jpeg` de 898 kB, `profile.jpg` 194 kB. Pasar a `fill` + `sizes` correctos, `priority` en la primera tarjeta/portada, `next/image` para imágenes del cuerpo cuando haya dimensiones (v2 las tiene), alt obligatorio en el editor, convertir assets a WebP ≤ 100 kB.
- aceptacion:
  - 0 warnings `no-img-element` en lint; ningún archivo de `public/` > 150 kB salvo el PDF.
- verificar: estándar
- notas: —

### FR-213 · globals.css: eliminar CSS de editores muertos y unificar tipografía
- fase: 2
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: quality, perf
- blocked_by: FR-005
- origen: FU-23, FU-15
- archivos: app/globals.css, tailwind.config.ts, app/(home)/post/[slug]/PostPageClient.tsx
- descripcion: ~200 líneas de CSS para Quill/tagsinput sin consumidores, tres bloques `@layer base`, tipografía de posts definida en cuatro sitios, `var(--font-mono)` indefinido, glob `./pages/**` inexistente. Dejar una sola configuración `typography` en Tailwind, borrar el CSS muerto y los `<style jsx global>`.
- aceptacion:
  - `globals.css` < 300 líneas; la página de post renderiza igual (captura antes/después en notas).
- verificar: estándar
- notas: —

### FR-214 · Analítica: una herramienta, id por entorno, consentimiento
- fase: 2
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: privacy, perf
- blocked_by: —
- origen: FA-16, FU-19, DX-27
- archivos: app/layout.tsx, components/common/ConsentBanner.tsx (nuevo si se mantiene GA), .env.example
- descripcion: GA4 (id hardcodeado), Vercel Analytics y Speed Insights cargan siempre y sin consentimiento. Recomendación: quedarse con Vercel Analytics + Speed Insights (sin cookies) y retirar GA; si el humano quiere GA, cargarlo tras consentimiento (Consent Mode v2) con el id en `NEXT_PUBLIC_GA_ID`. Actualizar la política de privacidad y su fecha.
- aceptacion:
  - Sin sesión ni consentimiento, el HTML no carga `gtag` (o GA está retirado).
- verificar: estándar
- notas: Decisión humana: ¿mantener GA4?

### FR-215 · Páginas 404/error en servidor y captura de errores
- fase: 2
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: ux, observability
- blocked_by: —
- origen: FU-25, FA-19
- archivos: app/not-found.tsx, app/error.tsx, app/global-error.tsx (nuevo), instrumentation.ts (nuevo)
- descripcion: `not-found.tsx` renderiza "Loading..." en servidor; `error.tsx` tiene un TODO de Sentry; no hay `global-error.tsx`. Reescribir 404 como Server Component en español con header/footer y enlaces (Blog, Proyectos, Contacto), `global-error.tsx`, y `instrumentation.ts` que registre errores (Sentry si el humano aporta DSN; si no, `logger.error` + `track` de Vercel).
- aceptacion:
  - `curl /ruta-inexistente` devuelve 404 con contenido útil en el HTML.
- verificar: estándar
- notas: —

### FR-216 · Accesibilidad: nombres accesibles, landmarks, contraste, teclado, encabezados
- fase: 2
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: a11y
- blocked_by: —
- origen: FU-12, FU-17, FU-18, FU-24, FU-28, FU-33
- archivos: components/layout/{Header,MobileMenu,Footer}.tsx, components/auth/UserMenu.tsx, components/blog/SaveButton.tsx, app/(home)/{signin,signup}/page.tsx, app/(home)/layout.tsx, components/ui/{card,pagination,sheet,dialog}.tsx, app/globals.css
- descripcion: Botón del menú móvil, toggles de contraseña, menú de usuario y Guardar sin nombre accesible; `<main>` anidado en 5 rutas; sin skip link; 25 usos de `text-muted-foreground/30..70` con contraste 1.5-2.7:1; `UserMenu` sin teclado (sustituir por `DropdownMenu` de shadcn); `CardTitle` como div; cadenas en inglés en sr-only. Corregir todo con `aria-label` en español, `role="search"`, `aria-current`, un solo `main`, tokens sin opacidad, `as` prop en `CardTitle`, h1 del cuerpo degradado a h2.
- aceptacion:
  - `axe` (vía `@axe-core/playwright` o extensión) sin violaciones críticas/serias en `/`, `/post/<slug>`, `/contact`.
  - Navegación completa con teclado en header, menú móvil y menú de usuario.
- verificar: estándar
- notas: —

---

## Fase 3 — Remodelación de producto y marca (requiere decisiones del PLAN)

### FR-301 · Nueva navegación e IA: Blog · Proyectos · Sobre mí · Contacto · CV
- fase: 3
- prioridad: P1
- estado: todo
- esfuerzo: S
- tags: brand, ux
- blocked_by: FR-303
- origen: FU-10, FU-03
- archivos: components/layout/Header.tsx, components/layout/MobileMenu.tsx, components/layout/Footer.tsx
- descripcion: Menú actual Inicio/Cursos/Proyectos/Contacto con registro en el header. Nuevo: Blog, Proyectos, Sobre mí, Contacto + icono de búsqueda, tema y botón "Descargar CV"; sin Iniciar sesión/Registrarse en el header público (acceso admin por `/signin`). Footer: columnas Navegación, Sígueme (redes + RSS + email), Legal; sin el widget falso de estado. Cursos visible solo si la decisión 1 del PLAN lo mantiene.
- aceptacion:
  - `/about` enlazada desde header y footer; header renderizado en servidor (sin estado `mounted` vacío).
- verificar: estándar
- notas: —

### FR-302 · Hero y copy de marca personal
- fase: 3
- prioridad: P0
- estado: todo
- esfuerzo: M
- tags: brand
- blocked_by: FR-211
- origen: FU-03, FU-16, FU-26
- archivos: components/common/Hero.tsx, app/layout.tsx (description), components/layout/Footer.tsx, app/(home)/faq/page.tsx, app/(home)/terminos/page.tsx, app/(home)/projects/page.tsx, app/not-found.tsx
- descripcion: Hero estático con foto profesional, "Juan Carlos Muñoz · Desarrollador full-stack", una frase de valor (qué construyes y sobre qué escribes), CTAs "Leer el blog" / "Ver proyectos" y redes. Sin typewriter ni iconos flotantes. Reescribir metadata, footer, FAQ (o eliminarla), términos y proyectos en primera persona; eliminar "noticias", "equipo editorial", "plataforma educativa", "observatorio digital" y afirmaciones no sostenibles ("2-3 artículos cada semana").
- aceptacion:
  - `grep -rniE "equipo editorial|observatorio|plataforma educativa|noticias" app components` → 0.
  - El h1 de la home es estable (sin texto cambiante) y contiene el nombre.
- verificar: estándar
- notas: Gate humano: aprobar textos y foto.

### FR-303 · Índice `/blog` y archivos por tag `/tags/[tag]` en servidor
- fase: 3
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: seo, render
- blocked_by: FR-203
- origen: FU-10, FU-06
- archivos: app/(home)/blog/page.tsx (nuevo), app/(home)/tags/[tag]/page.tsx (nuevo), app/sitemap.ts, components/blog/StructuredData.tsx
- descripcion: Hoy los posts solo viven en la home. Crear `/blog` (paginado, chips de tags, server-rendered, metadata) y `/tags/[tag]` indexable (sustituye a `/search?tags=`), añadirlos al sitemap y usar `/blog` en el breadcrumb.
- aceptacion:
  - HTML de `/blog` y `/tags/<tag>` con títulos de posts; ambos en `sitemap.xml`.
- verificar: estándar
- notas: —

### FR-304 · Página de post rediseñada: lectura, TOC, autor, relacionados, compartir
- fase: 3
- prioridad: P2
- estado: todo
- esfuerzo: L
- tags: ux, brand
- blocked_by: FR-201, FR-202, FR-213
- origen: FU-15
- archivos: app/(home)/post/[slug]/*, components/blog/{PostHeader,TableOfContents,AuthorBox,RelatedPosts,ShareRow}.tsx (nuevos)
- descripcion: Columna de lectura de 65-75 caracteres (18 px / 1.7), breadcrumb, meta (autor → /about, fechas, tiempo de lectura, tags), TOC sticky de h2/h3 (colapsable en móvil), barra de progreso (desactivada con reduced-motion), bloques de código con etiqueta de lenguaje y copiar, figuras con `figcaption`, fila de compartir (copiar, LinkedIn, X, WhatsApp, Web Share), caja de autor con CV, anterior/siguiente y 3 relacionados por tags. Quitar la barra lateral de esta ruta. Comentarios: según decisión 2 del PLAN (Giscus o ninguno).
- aceptacion:
  - Captura aprobada por el humano; `axe` sin violaciones serias; First Load JS sigue < 250 kB.
- verificar: estándar
- notas: Gate humano (diseño).

### FR-305 · Página "Sobre mí" profesional
- fase: 3
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: brand
- blocked_by: FR-205
- origen: FU-11
- archivos: app/(home)/about/page.tsx, components/common/DownloadCV.tsx, components/common/SocialLinks.tsx, public/profile.jpg
- descripcion: Titular, bio de dos párrafos, stack completo (hoy 4 skills), línea de tiempo de experiencia, proyectos seleccionados, botón de CV, foto profesional (480 px WebP), botón "Contáctame" funcional (hoy sin enlace), sin tabs, enlaces sociales con `aria-label`, sin "Blog iniciado en {año actual}". Contenido: lo aporta el humano (borrador por el agente a partir del CV en `public/`).
- aceptacion:
  - Página en servidor con metadata propia; todos los enlaces funcionan; `axe` limpio.
- verificar: estándar
- notas: Gate humano (textos).

### FR-306 · Voz, datos y páginas de apoyo coherentes
- fase: 3
- prioridad: P2
- estado: todo
- esfuerzo: S
- tags: brand
- blocked_by: FR-302
- origen: FU-26, FU-34, FU-35, FU-36, FU-32
- archivos: components/layout/Footer.tsx, app/(home)/faq/page.tsx, app/(home)/politica-privacidad/page.tsx, app/(home)/terminos/page.tsx, app/(home)/contact/page.tsx, components/common/SocialLinks.tsx, lib/site.ts
- descripcion: Unificar primera persona, una sola definición de redes (`lib/site.ts` + un componente `SocialLinks` con icono de X correcto), fechas reales en política/términos, `role="status"` en el éxito del formulario, email ofuscado o vía formulario, `text-glow` solo en oscuro o eliminado, `locale` `es_CO`. FAQ: fusionar en About/Contacto o reescribir sin promesas.
- aceptacion:
  - `grep -rn "twitter.com" app components` → 0; una sola definición de redes.
- verificar: estándar
- notas: —

### FR-307 · Captura de correo (newsletter) con Resend
- fase: 3
- prioridad: P2
- estado: todo
- esfuerzo: M
- tags: brand, cross-repo
- blocked_by: BK-023
- origen: FU-14
- archivos: components/common/SubscribeForm.tsx (nuevo), app/(home)/page.tsx, app/(home)/post/[slug]/*
- descripcion: Formulario de un campo (email + honeypot + reCAPTCHA) que llama a `POST newsletter/subscribe` (BK-023) y muestra confirmación accesible; bloque en home y al final del post; enlace a RSS.
- aceptacion:
  - Test MSW del envío; `role="status"` en la confirmación.
- verificar: estándar
- notas: —

### FR-308 · Ocultar o retirar LMS y registro público (según decisión)
- fase: 3
- prioridad: P1
- estado: blocked
- esfuerzo: L
- tags: brand, scope
- blocked_by: —
- origen: FU (e) Keep vs cut, PLAN decisiones 1 y 2
- archivos: app/(home)/courses/**, app/(home)/{signin,signup,verify-email,reset-password,profile}/**, components/common/{FeaturedCourses,ContinueLearning}.tsx, app/sitemap.ts, app/robots.ts
- descripcion: Según lo que decida el humano: (a) ocultar cursos/exámenes y registro del menú, home, sitemap y footer manteniendo rutas con `noindex`; o (b) retirar del front las rutas y componentes (≈ 13 % y 26 % del código) manteniendo el backend. Documentar el alcance elegido en notas antes de implementar.
- aceptacion:
  - Lo oculto no aparece en HTML público ni sitemap; lo retirado no deja imports rotos; build en verde.
- verificar: estándar
- notas: Estado `blocked` hasta que el humano responda a las decisiones 1 y 2 del PLAN.

### FR-310 · Consolidar componentes duplicados del admin y utilidades de página
- fase: 3
- prioridad: P3
- estado: todo
- esfuerzo: M
- tags: quality
- blocked_by: FR-005
- origen: audit/front-ux-seo.md (d)
- archivos: components/admin/{PostEditorV2,CoverImageUpload,SimpleCoverImageUpload,TagInput,SimpleTagInput}.tsx, components/blog/CreatePostForm.tsx, app/admin/posts/edit/[id]/page.tsx, components/common/{PageHero,BackgroundOrbs}.tsx (nuevos), lib/constants.ts
- descripcion: Un `PostForm` para crear y editar; un `CoverImageUpload` y un `TagInput` con prop `compact`; extraer `PageHero`/`BackgroundOrbs` (copiados en 4 páginas); mover `DIFFICULTY_COLORS` (6 copias) a `lib/constants.ts` si cursos se mantiene.
- aceptacion:
  - Crear y editar post funcionan en `next dev`; conteo de líneas de `components/admin` baja ≥ 300.
- verificar: estándar
- notas: —

### FR-311 · Fichas de proyecto `/projects/[slug]`
- fase: 3
- prioridad: P3
- estado: proposed
- esfuerzo: M
- tags: brand, seo
- blocked_by: FR-204
- origen: audit/front-ux-seo.md (e)
- archivos: app/(home)/projects/[slug]/page.tsx (nuevo)
- descripcion: El modelo ya tiene `slug`; una ficha por proyecto (problema, solución, stack, capturas, enlaces) multiplica el valor del portfolio para reclutadores y es indexable.
- aceptacion:
  - Ruta en servidor con metadata; enlazada desde la tarjeta; en sitemap.
- verificar: estándar
- notas: Propuesto; promover si el humano lo aprueba.

---

## Fase 4 — Calidad y observabilidad

### FR-401 · Infraestructura de tests: vitest.config, jsdom, Testing Library, MSW, cobertura
- fase: 4
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: tests, devex
- blocked_by: FR-001
- origen: DX-15, FA (e) plan de tests
- archivos: vitest.config.ts (nuevo), package.json, test/setup.ts (nuevo), test/msw/handlers.ts (nuevo)
- descripcion: Vitest no resuelve el alias `@`, no tiene DOM ni Testing Library ni cobertura. Añadir `vitest.config.ts` (alias, `environment: jsdom` para `*.test.tsx`, `coverage.provider v8` con umbrales iniciales en `lib/` y `hooks/`), `@testing-library/react`, `msw`, y los primeros tests de `customFetch` (401→refresh→retry; 5 concurrentes → 1 refresh; refresh falla → logout) y del store de auth. Si FR-101 ya creó una config mínima, extenderla.
- aceptacion:
  - `npm run test:run` ejecuta tests de `lib/customFetch` y `lib/auth` en jsdom con MSW; cobertura publicada en CI.
- verificar: estándar
- notas: —

### FR-402 · Tests de contrato con MSW
- fase: 4
- prioridad: P2
- estado: todo
- esfuerzo: M
- tags: tests, contract
- blocked_by: FR-401, FR-108
- origen: FA (e) plan de tests
- archivos: test/contract/*.test.ts(x)
- descripcion: Fixtures derivadas del OpenAPI: `BlogPost` muestra `commentCount`; `useUsers` pide `/api/v1/users?page=1&limit=10`; `sitemap()` emite URLs de posts; `useComments` pagina con `meta.currentPage/totalPages`; like/guardar se inicializan desde `check`.
- aceptacion:
  - ≥ 5 tests de contrato en verde y ejecutados en CI.
- verificar: estándar
- notas: —

### FR-403 · Playwright smoke (SSR, 404, sitemap, login, roles)
- fase: 4
- prioridad: P2
- estado: todo
- esfuerzo: M
- tags: tests
- blocked_by: FR-201, FR-203
- origen: FA (e) plan de tests
- archivos: e2e/*.spec.ts, playwright.config.ts, .github/workflows/ci.yml
- descripcion: Contra `next start` con API mockeada (MSW en Node o fixtures): `/` sin JS contiene títulos; `/post/<slug>` contiene h1, cuerpo y JSON-LD; slug inexistente → 404; `sitemap.xml` contiene `/post/`; login llega al dashboard; un editor es redirigido de `/admin/users`. Ejecutar en CI tras el build.
- aceptacion:
  - Job `e2e` en verde en CI.
- verificar: estándar + `npx playwright test`
- notas: —

### FR-404 · Observabilidad: logger único, telemetría real, Sentry
- fase: 4
- prioridad: P2
- estado: todo
- esfuerzo: M
- tags: observability
- blocked_by: FR-215
- origen: FA-19, DX-27, DX-06
- archivos: lib/logger.ts, lib/comments-telemetry.ts, 51 llamadas `console.*`, instrumentation.ts
- descripcion: 51 `console.*` fuera del logger; la telemetría va a `logger.info` que en producción está silenciada. Sustituir por `createLogger`, enviar telemetría a Vercel `track()` o `/api/telemetry`, integrar Sentry (`@sentry/nextjs`) si hay DSN.
- aceptacion:
  - `grep -rn "console\." app components hooks lib utils --include=*.ts --include=*.tsx | grep -v logger.ts | grep -v test` → 0.
- verificar: estándar
- notas: —

### FR-405 · Contenido v2: bloque de código, validación zod y migración de legacy
- fase: 4
- prioridad: P2
- estado: todo
- esfuerzo: L
- tags: content, cross-repo
- blocked_by: FR-201, BK-024
- origen: FA-13
- archivos: lib/post-content-v2.ts, components/blog/PostContentRenderer.tsx, components/admin/PostEditorV2.tsx
- descripcion: El modelo v2 no tiene bloque `code` y `parseContentV2` castea sin validar; el renderer legacy tiene un caso especial por slug. Añadir `code` (lenguaje, fuente, resaltado en servidor), validar con una unión discriminada zod (fallback a legacy si falla), y, tras la migración de datos del backend (BK-024), eliminar el renderer legacy y sus heurísticas.
- aceptacion:
  - Tests de `parseContentV2` con payloads válidos/inválidos; editor permite insertar código; sin referencias a slugs concretos en el renderer.
- verificar: estándar
- notas: —

### FR-406 · Actualización de dependencias mayores
- fase: 4
- prioridad: P3
- estado: todo
- esfuerzo: L
- tags: deps
- blocked_by: FR-001, FR-003
- origen: DX-16, DX-18, audit/devex.md (d)
- archivos: package.json, eslint.config.mjs, tailwind.config.ts, postcss.config.mjs
- descripcion: En iteraciones separadas y con CI verde entre cada una: ESLint flat `eslint .` (antes de Next 16), Next 16 + `eslint-config-next` alineado, Tailwind 4 (migración de config/PostCSS), zod 4, `react-syntax-highlighter` 16 o su eliminación tras FR-202, `@types/node` 22, React 19.x última. Cada salto un commit; si uno rompe el build, revertir y anotar.
- aceptacion:
  - `npm outdated` sin majors pendientes salvo los descartados con motivo en notas; build/tests en verde.
- verificar: estándar
- notas: —

### FR-407 · Caché de datos en cliente para lo que quede en cliente
- fase: 4
- prioridad: P3
- estado: todo
- esfuerzo: M
- tags: perf
- blocked_by: FR-203, FR-204
- origen: FA-22
- archivos: hooks/*, lib/query-client.ts (nuevo)
- descripcion: Tras mover las lecturas públicas al servidor, lo que siga en cliente (admin, perfil, comentarios) debe deduplicarse y cachearse con TanStack Query (o SWR); renombrar la función local `fetch` que ensombrece al global en `hooks/use-projects.ts`.
- aceptacion:
  - Ninguna petición duplicada en el panel admin al montar (comprobación con mock que cuenta llamadas).
- verificar: estándar
- notas: —

---

## Fase 5 — Lanzamiento

### FR-501 · Checklist de lanzamiento
- fase: 5
- prioridad: P1
- estado: todo
- esfuerzo: M
- tags: launch
- blocked_by: FR-201, FR-203, FR-205, FR-206, FR-207, FR-208, FR-216, FR-302, FR-305
- origen: PLAN
- archivos: docs/relaunch/LAUNCH_CHECKLIST.md (nuevo)
- descripcion: Lighthouse móvil ≥ 90 en `/` y `/post/<slug>` (preview de Vercel), validadores OG de LinkedIn/X/WhatsApp, Rich Results de Google sin errores, `sitemap.xml` y `feed.xml` válidos, redirecciones (`/exercises`, `www` ↔ apex), 404 correcto, cookies/dominio probados en producción (BK-016), copia de seguridad de la base de datos, nota de lanzamiento para redes.
- aceptacion:
  - Checklist completada con evidencias (capturas/URLs) y aprobada por el humano.
- verificar: manual + estándar
- notas: Gate humano final.
