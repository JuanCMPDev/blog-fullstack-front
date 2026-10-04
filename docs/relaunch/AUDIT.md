# Auditoría del frontend — blog-fullstack-front

Fecha: 2026-10-04 · Commit auditado: `29e168a` (`main`) · Next.js 15.3.9 / React 19 / Tailwind 3 / shadcn · Método: lectura de código con evidencia `archivo:línea`, build de producción, typecheck, lint y tests; el sitio en producción no era accesible desde el entorno, así que nada se midió en navegador. Informes completos en `audit/` (arquitectura y contrato API: `front-architecture.md`, 24 hallazgos FA-*; SEO/rendimiento/accesibilidad/UX: `front-ux-seo.md`, 37 hallazgos FU-*; experiencia de desarrollo, CI/CD y dependencias de ambos repos: `devex.md`, 28 hallazgos DX-*). El backend tiene su propia auditoría en `blog-fullstack-back/docs/relaunch/AUDIT.md`.

## Resumen ejecutivo

El código está técnicamente sano (typecheck limpio, build correcto, 48 tests en verde, 3 warnings de lint, cabeceras de seguridad, tokens de diseño ordenados), pero **no está construido ni posicionado como el blog/portfolio profesional que se quiere relanzar**:

1. **Se comporta como una SPA.** 27 de 30 páginas son `"use client"` y todo el contenido público (lista de posts, cuerpo del post, cursos, proyectos) se descarga en el navegador tras hidratar. Un crawler o un lector sin JS recibe un esqueleto; la página de post pesa 521 kB de JS y hace dos veces la misma petición (servidor para metadatos, cliente para el cuerpo). Slugs inexistentes devuelven 200.
2. **La indexación está rota en lo básico.** El `sitemap.xml` no contiene ningún post (llama a `posts/sitemap`, que no existe en el backend, y el error se traga); no hay `metadataBase`, plantilla de título ni canonical; todas las páginas salvo los posts comparten título, descripción e imagen OG; el JSON-LD apunta a `/blog` (ruta inexistente) y a `/logo.png` (archivo inexistente); no hay RSS.
3. **La marca es la de un medio genérico ("noticias, cursos, equipo editorial, observatorio digital"), no la de una persona.** La página "Sobre mí" existe pero nada enlaza a ella; el menú es Inicio/Cursos/Proyectos/Contacto con botones de registro; la imagen OG dice "Tecno Espacio.com / Lo ultimo en tech"; el avatar por defecto de cualquier usuario es la foto personal del autor.
4. **Seguridad del cliente.** El access token vive en `localStorage` mientras el HTML legacy de los posts se renderiza sin sanitizar y no hay CSP: un editor puede robar la sesión de un admin. El refresh por temporizador en cada pestaña rota el refresh token y provoca cierres de sesión aleatorios.
5. **Deuda y riesgo operativo.** Sin CI; `npm ci` falla sin `--legacy-peer-deps` (react-day-picker 8 vs React 19); el lint no cubre `hooks/` ni `utils/` (3 errores ocultos); ~1.4k líneas de código muerto y 7 dependencias sin uso; script de Cloudflare obsoleto; la lista de usuarios del admin lleva rota desde el commit `5c44870`.

## Verificación ejecutada

| Comprobación | Resultado |
|---|---|
| `npm ci` | Falla con ERESOLVE sin `--legacy-peer-deps` (react-day-picker@8.10.1 exige React 16-18) |
| `tsc --noEmit` | 0 errores |
| `next lint` (dirs por defecto) | 0 errores, 3 warnings; con `--dir hooks --dir utils`: 3 errores, 9 warnings |
| `vitest run` | 12 archivos, 48 tests, todos en verde (solo `lib/*`) |
| `next build` | Correcto; avisa `metadataBase` ausente y `Failed to parse URL from posts/sitemap` |
| First Load JS | base 102 kB · `/` 199 kB · `/post/[slug]` **521 kB** · `/admin` 298 kB · `/terminos` 155 kB |

## Hallazgos priorizados (índice)

Cada hallazgo remite a su ticket en `BACKLOG.md`. Severidad: P0 bloquea el objetivo del relanzamiento o está roto en producción; P1 corregir antes de enlazar desde redes; P2 pronto; P3 higiene.

| Sev | Hallazgos | Tema | Ticket(s) |
|---|---|---|---|
| P0 | FA-01, FU-07 | Sitemap sin posts; endpoint inexistente; URL relativa en servidor | FR-008 (+ BK-004 en el backend) |
| P0 | FU-01, FA-02 | Post y home renderizados solo en cliente; doble fetch; soft-404 | FR-201, FR-203 |
| P0 | FU-02, FA-11 | Sin `metadataBase`, plantilla de título, canonical ni metadata por página | FR-010, FR-205 |
| P0 | FU-03 | Posicionamiento de medio genérico, no marca personal | FR-301, FR-302, FR-305, FR-306 |
| P1 | FA-03 | Lista de usuarios del admin rota (`new URL(relativa)`) | FR-009 |
| P1 | FA-05, BS-15 | Token en localStorage + HTML sin sanitizar + sin CSP | FR-101, FR-102, FR-103 |
| P1 | FA-04, BS-05 | El rewrite de Vercel colapsa IPs: throttling y reCAPTCHA globales | BK-005 (backend) + decisión en FR-107 notas |
| P1 | FA-23, FA-24, BS-03, BS-04 | Búsqueda pública lista borradores; perfil público expone email | BK-003, BK-006 (backend); FR-015 (front deja de enviar `status`) |
| P1 | FU-04, FU-05, FU-06 | OG inconsistente y pesada; assets inexistentes; JSON-LD incorrecto | FR-011, FR-206, FR-207 |
| P1 | FU-08 | Prism completo (270 kB gz) en la página de post | FR-202 |
| P1 | FU-09, FA-22 | Home y listados en cliente; peticiones duplicadas | FR-203, FR-015 |
| P1 | FU-10, FU-11 | Navegación/IA de medio; About escondida y débil | FR-301, FR-305 |
| P1 | FU-12, FU-17, FU-18, FU-24, FU-28, FU-33 | Accesibilidad: controles sin nombre, landmarks, contraste, teclado | FR-216 |
| P1 | FU-13 | Avatar por defecto = foto personal del autor | FR-013 |
| P1 | FU-14 | Sin RSS ni captura de correo | FR-208, FR-307 |
| P2 | FA-06, BS-10 | 403 devuelto como 401 → refresh y rotación innecesarios | BK-010 (backend) + FR-104 |
| P2 | FA-07 | Refresh por temporizador en cada pestaña; carreras entre pestañas | FR-105 |
| P2 | FA-08, FA-20 | Tipos a mano con campos fantasma (`comments` vs `commentCount`) | FR-015, FR-108 |
| P2 | FA-09 | Estado de likes/guardados no se inicializa | FR-107 (+ BK-011) |
| P2 | FA-10 | Soft-404; assets fantasma | FR-201, FR-011 |
| P2 | FA-12 | Tres convenciones de URL base de la API | FR-007 |
| P2 | FA-13 | Dos formatos de contenido; v2 sin bloque de código ni validación | FR-405 |
| P2 | FA-14, FA-15 | Sin CI; lint parcial; peer conflict; script Cloudflare | FR-001, FR-002, FR-003 |
| P2 | FA-16, FU-19 | Tres herramientas de analítica sin consentimiento | FR-214 |
| P2 | FA-21 | Protección de `/admin` solo en cliente; sesión no recuperable desde cookie | FR-106, FR-101 |
| P2 | FU-15 | Experiencia de lectura mínima (sin TOC, autor, relacionados) | FR-304 |
| P2 | FU-16, FU-22 | Hero con typewriter y 21 iconos animados; framer-motion en el layout global; sin reduced-motion | FR-211, FR-302 |
| P2 | FU-20, FU-21, FU-23, FU-27 | Fuentes, imágenes, CSS y layout shift | FR-210, FR-212, FR-213 |
| P2 | FU-25, FA-19 | 404/error pobres; errores invisibles en producción | FR-215, FR-404 |
| P2 | FU-26 | Voz plural "nosotros" y afirmaciones inventadas | FR-306 |
| P3 | FA-17, FA-18, FU-30, FU-31 | Código muerto, dependencias sin uso, archivos de plantilla | FR-004, FR-005, FR-006 |
| P3 | FU-29, FU-32, FU-34, FU-35, FU-36, FU-37 | robots, metadata menor, enlaces sociales triplicados, glow, contacto | FR-012, FR-306, FR-310 |
| P1 | DX-01 | Sin CI/CD, sin PRs ni protección de ramas | FR-001 |
| P1 | DX-03 | Checks de Cloudflare Pages en rojo en los últimos 6 commits; `pages:build` obsoleto | FR-003 (+ desconectar los proyectos en Cloudflare: acción humana) |
| P1 | DX-04 | `next@15.3.9` con 28 avisos de seguridad (2 críticos); corrección dentro del rango (15.5.x) | FR-000 |
| P2 | DX-07, DX-12, DX-13 | `npm ci` falla sin flag no documentado; sin `.env.example`; fallbacks `https//` mal escritos | FR-003, FR-006, FR-007 |
| P2 | DX-15, DX-16 | Infra de tests mínima (sin jsdom/alias/Testing Library); `lint` parcial y `test` en modo watch | FR-002, FR-401 |
| P2 | DX-18 | Dependabot desactivado; dependencias 6-12 meses atrasadas | FR-001 (dependabot.yml) + acción humana en GitHub |
| P3 | DX-20, DX-22, DX-23, DX-24, DX-27 | Dependencias sin uso, assets sobrantes, README plantilla, sin LICENSE, 51 `console.*` | FR-004, FR-005, FR-006, FR-404 |

## Mapa de renderizado actual

| Ruta | Render | Datos | Riesgo SEO |
|---|---|---|---|
| `/` | cliente | 5-8 llamadas tras hidratar (`popular-tags` dos veces) | alto |
| `/post/[slug]` | shell servidor + cliente | servidor solo para metadata; cuerpo en cliente; 521 kB | alto |
| `/courses`, `/courses/[slug]`, `/projects` | cliente | cliente | medio-alto |
| `/about`, `/contact`, `/faq`, legales | cliente sin datos | — (texto en HTML pero `opacity:0` hasta hidratar) | medio (metadata duplicada) |
| `/search`, auth, `/profile/*`, `/admin/**` | cliente | cliente | bajo (deberían ser `noindex`) |
| `/sitemap.xml` | servidor | endpoint inexistente → vacío | crítico |

## Fortalezas que conviene conservar

- TypeScript estricto limpio, build correcto, 48 tests de helpers puros, helpers pequeños y bien delimitados (`lib/api.ts`, `lib/post-content-v2.ts`, adaptadores de media).
- `generateMetadata` del post en servidor (OG/Twitter correctos para crawlers sociales); `robots.ts`/`sitemap.ts` existen como esqueleto.
- Cabeceras de seguridad (HSTS preload, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy); `customFetch` con mutex de refresh; soporte de `x-access-token`.
- Tokens de diseño HSL con paridad claro/oscuro y contraste AA en los tokens principales; primitivas Radix/shadcn accesibles en Sheet/Dialog/Select/Tabs/Form.
- Modelo de contenido v2 por bloques (párrafo, encabezado, imagen, galería, vídeo, quiz) con validación de ID de YouTube: base correcta para renderizar en servidor.
- Página de contacto completa (formulario validado, honeypot, reCAPTCHA v3, CV, redes); modelo de proyectos listo para portfolio; analítica RUM ya instalada para medir el impacto de la migración.
- Las librerías de admin (recharts, Quill) no se filtran a rutas públicas.
