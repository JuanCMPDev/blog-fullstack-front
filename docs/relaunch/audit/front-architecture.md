# Techno Espacio frontend: architecture, data fetching, auth flow and API contract audit

Repo: `/home/user/blog-fullstack-front` (branch `ccr-5f9e7014-m1i9c3`, which matches `origin/main` at `29e168a`). The backend reference is `/home/user/blog-fullstack-back` at `b6787d6` (NestJS, global prefix `api/v1`).
Date: 2026-10-04. Scope: architecture, data fetching, auth flow, API contract, rendering/SEO, state/data layer, code health and tests. Every finding below is backed by `file:line` evidence that was read during this audit. Findings tagged **(cross-repo)** need a backend change too, or only a backend change, but they show up in the frontend contract.

Checks that were run:
- `tsc --noEmit` passes with 0 errors.
- Plain `next lint` (the default dirs, which is what `npm run lint` and `next build` use) reports 0 errors and 3 warnings.
- `next lint --dir app --dir components --dir hooks --dir lib --dir utils` reports **3 errors and 9 warnings**. All 3 errors are in `hooks/`, which the default run never lints.
- `vitest run` passes: 12 files, **48 tests**. The figure of 40 that circulated earlier came from a run where 2 suites failed to import.
- `next build` succeeds, but it logs `Error fetching posts for sitemap: TypeError: Failed to parse URL from posts/sitemap` and `metadataBase property ... is not set`. `/post/[slug]` has a **First Load JS of 521 kB**, `/` is 199 kB and `/admin` is 298 kB. Logs: `scratchpad/front-checks2.log` and `scratchpad/front-arch-checks.log`.
- `npm install --dry-run` fails with `ERESOLVE` because `react-day-picker@8.10.1` declares `peer react@"^16.8.0 || ^17.0.0 || ^18.0.0"` and the project installs `react@19.0.0`.

---

## (a) Executive summary

The frontend is a Next.js 15 App Router app that is used almost entirely like a client-side SPA. 27 of the 30 `page.tsx` files are `"use client"`. The 3 exceptions are `/post/[slug]`, which wraps a client component; `/admin/users`, which renders the client `UsersTable`; and the `/exercises` redirect. Every piece of public blog content is fetched in `useEffect` from the browser. That includes the home post list, the post body, courses and projects. Browser calls go through a Next.js rewrite proxy (`/api/v1/*` → `api.technoespacio.com`). Only `/post/[slug]` has a server-side `generateMetadata`, so OG and Twitter tags are now correct. Even on that page, the article body, H1 and JSON-LD only appear after JS runs and a second fetch from the client completes.

For a blog, the most serious problem is SEO discoverability. **`sitemap.xml` contains no posts at all.** It calls `posts/sitemap`, which does not exist in the backend (FA-01). The post HTML that crawlers receive is a skeleton (FA-02), unknown slugs return HTTP 200 (soft 404s), and every page except posts shares the same title and description (FA-11).

On the auth side, the access token is persisted in `localStorage` while post HTML is rendered without sanitization and there is no CSP. Together these let any editor-authored script steal tokens (FA-05). The refresh model runs a 10-minute `setInterval` in every tab, and a refresh rotates the refresh token, so tabs race each other (FA-07). The backend turns role failures into 401s, so the frontend responds to "forbidden" by refreshing and retrying (FA-06). There is no logout loop, but each forbidden call costs a token rotation.

The API contract mostly lines up. The matrix in section (c) groups the call sites into 44 rows, and nearly all of them hit an existing route with the right method. The exceptions:
- One missing route: `posts/sitemap`.
- One regression: the admin users list has been broken since `5c44870`, because `new URL()` is given a relative URL (FA-03).
- Several shape and semantic mismatches:
  - The `commentCount` vs `comments` mismatch means post cards never show a comment count.
  - `hasLiked` is never computed on the new nested-comments route.
  - The like and saved state of posts is never checked.

Three backend contract issues are visible from the frontend:
- The public `posts/search` honours `status=DRAFT`, so anyone can list drafts.
- The public `profile/:identifier` returns users' emails.
- Throttling and reCAPTCHA key on the proxy IP because browser traffic goes through the Vercel rewrite. The global limit is 20 req/min per IP, and an anonymous page view makes 5 to 8 API calls (FA-04).

Code health is reasonable: TS strict is clean and helpers are small and tested. However:
- About 1.4k lines of dead code, including an unused parallel comments-hook refactor.
- 7 unused dependencies.
- Lint does not cover `hooks/` or `utils/`.
- No CI.
- A peer-dependency conflict that breaks a plain `npm ci`.
- A leftover Cloudflare build script.
- The tests only cover pure `lib/*` helpers, none of the auth, fetch, hook or component code.

The target is realistic and incremental:
1. Fix the sitemap and the users-list regression.
2. Move the public read paths (`/`, `/post/[slug]`, `/courses*`, `/projects`) to Server Components with `fetch` + `revalidate`/tags and a revalidate webhook. Keep likes, saves and comments as client islands.
3. Keep the access token in memory, refresh on demand with cross-tab coordination, and sanitize legacy HTML.
4. Add CI with lint over all dirs, Vitest + MSW for `customFetch`, the auth store and hooks, and a Playwright smoke test that asserts SSR HTML.

**P0:** FA-01 Sitemap ships with zero posts (`posts/sitemap` doesn't exist; the error is swallowed).
**P1:**
- FA-02 Public content (post body, home list, courses, projects) is client-rendered, with a double fetch on post pages.
- FA-03 Admin users list broken in production (`new URL(relative)` throws).
- FA-04 The rewrite proxy collapses client IPs, so all users share the throttling and reCAPTCHA budget (cross-repo).
- FA-05 Access token in `localStorage` + unsanitized post HTML + no CSP lets an editor escalate to admin.
- FA-23 Public `posts/search?status=DRAFT` lists drafts (cross-repo).
- FA-24 Public `profile/:identifier` returns emails, and login depends on it (cross-repo).

---

## (b) Findings

Severity: P0 = broken in production with major impact; P1 = high impact, fix next; P2 = should fix; P3 = cleanup. Effort: S ≤ ½ day, M ≤ 2 days, L > 2 days.

| ID | Sev | Title | Evidence (file:line + quote) | Impact | Recommended fix | Effort |
|---|---|---|---|---|---|---|
| FA-01 | **P0** | Sitemap contains no posts | `app/sitemap.ts:8` `fetch(buildApiUrl('posts/sitemap'), { next: { revalidate: 3600 } })`. The backend has no `posts/sitemap` route (route list: `posts.controller.ts:67-481`). The request falls into `@Get(':id')` with `ParseIntPipe` (`posts.controller.ts:291`), which returns 400. `app/sitemap.ts:11-14` catches the error and returns `[]`. The build log shows `Failed to parse URL from posts/sitemap`: server-side `buildApiUrl` returns a relative path when `NEXT_PUBLIC_API_URL` is unset (`lib/api.ts:28-29`). | `sitemap.xml` lists only `/`, `/about`, `/contact` and `/faq`. No post, course or project URLs reach search engines through the sitemap. The failure is silent. | Backend: add `GET posts/sitemap` (published only; `slug`, `updatedAt`, `publishDate`) declared **before** `:id`. Frontend: call it through a server-only fetcher with an absolute base URL, and add `/courses`, `/courses/[slug]` and `/projects`. Log or throw on failure in CI, and add a test that `sitemap()` contains post URLs. As an interim step, page through `GET posts?page=n&limit=100`. | S |
| FA-02 | **P1** | Public content is client-rendered; post page fetches twice | `app/(home)/page.tsx:1` `"use client"` with a `useEffect` fetch at `:38-75`. `app/(home)/post/[slug]/page.tsx:78-80` `return <PostPageClient />`, and `PostPageClient.tsx:217-271` fetches `posts/slug/:slug` again in `useEffect` after the server already fetched it for metadata (`page.tsx:20-21`). JSON-LD is rendered only after the client fetch (`PostPageClient.tsx:522-527`). The legacy renderer uses `document.createElement` (`:335`), so it cannot run on the server. `/post/[slug]` First Load JS is 521 kB (build log), mostly from the full Prism `react-syntax-highlighter` build (`:25`), `react-markdown` and `framer-motion`. | The SSR HTML for every post is a skeleton. H1, body, internal links and JSON-LD depend on JS rendering. Non-Google crawlers and LLM crawlers see nothing. LCP waits for JS download, an API round trip, then `motion` (`initial opacity:0`, `:544`). The home page's post links are not in the HTML either. | Migrate the public read paths to Server Components (see section (e)). The post page server-fetches with `{ next: { revalidate: 3600, tags: ['post:'+slug] } }`, calls `notFound()`, and renders contentV2 and sanitized legacy HTML on the server with server-side highlighting (shiki) or `PrismLight`. Likes, saves, share and comments become client islands that receive `post` as props, which removes the second fetch. Drafts move to an admin preview route that fetches on the client. | L |
| FA-03 | **P1** | Admin users list broken since `5c44870` | `hooks/use-users.ts:42` `const url = new URL(buildApiUrl("users"));`. Since `5c44870`, `lib/api.ts:23-25` returns `/api/v1/users` (relative) in the browser, and `new URL('/api/v1/users')` throws `ERR_INVALID_URL` (verified with node). The error is caught at `use-users.ts:61-62` with `console.error`. `lib/api.test.ts` only tests the server branch. | `/admin/users` always shows an empty table. Ban, unban and role management cannot be used from the UI. | Use `buildApiUrl(\`users?${new URLSearchParams({...})}\`)`. Add a `buildApiUrl` test for the browser branch (stub `window`) and a hook test with MSW. | S |
| FA-04 | **P1** (cross-repo) | Rewrite proxy collapses client IPs: global rate limit and degraded reCAPTCHA | `next.config.mjs:6-7` rewrites `/api/v1/:path*` to the API. `lib/api.ts:23-25` sends every browser call through it. Backend: `app.module.ts:29-31` `throttlers: [{ttl: 60000, limit: 20}]` uses the default tracker `getTracker(req){ return req.ip }` (`@nestjs/throttler` 6.5.0, `throttler.guard.js:141-142`). `main.ts` never sets `trust proxy`. Login is limited to 5/min and register to 3/min (`auth.controller.ts`). reCAPTCHA sends `remoteip: request.ip` (`recaptcha.guard.ts:54`). An anonymous home view makes 5 calls: `posts`, `popular-tags` twice (`TagFilters.tsx:26`, `Sidebar.tsx:48`), `recommended` and `courses`. A logged-in view adds `courses/my-progress` twice and `auth/user-status`. | All visitors arrive from a few Vercel egress IPs, and possibly also behind the Coolify proxy, so they share one 20 req/min bucket. Expect 429s after a handful of concurrent readers, and failed logins across users. reCAPTCHA scoring sees the proxy IP. Backend logs lose the client IP. **Verify with production 429 rates.** | Pick one: **(A)** have the browser call `https://api.technoespacio.com` directly. CORS with credentials, cookie domain and `exposedHeaders` are already configured for this (`main.ts:36-51`, `auth.controller.ts:36-42`). Then set `app.set('trust proxy', 1)` for Traefik. **(B)** Keep the proxy, but forward through `middleware.ts` with a signed `x-client-ip` header and a custom `getTracker`. Also deduplicate requests (FA-22). | M |
| FA-05 | **P1** | Access token persisted in `localStorage`; post HTML rendered unsanitized; no CSP | `lib/auth.ts:186` `storage: createJSONStorage(() => localStorage)` and `:193` `accessToken: state.accessToken`. `PostPageClient.tsx:335-336` `tempDiv.innerHTML = content` (img `onerror` handlers fire even on a detached node) and `:417` `dangerouslySetInnerHTML={{ __html: parts[i] }}`. No sanitizer exists in either repo (grep for `dompurify` and `sanitize` returns nothing). `next.config.mjs` headers have no `Content-Security-Policy`. `StructuredData.tsx:100` `JSON.stringify` into `<script>` does not escape `</script>`. | Any editor, or a compromised editor account, can store a script in a post. When an admin opens it, the script reads `auth-storage` and can call `/api/v1/auth/refresh-token` on the same origin, where the cookie is sent, to get fresh tokens. That is editor→admin escalation and persistent session theft. Logged-in users' PII (email etc.) also sits in `localStorage`. | Keep `accessToken` in memory only (`partialize` → `user` minus PII, or a boolean `hasSession`) and refresh once on boot. Sanitize legacy HTML (DOMPurify on the client, or `sanitize-html` on the backend at save time). Escape `<` in JSON-LD (`.replace(/</g,'\\u003c')`). Add a CSP with nonces via middleware, or at least `script-src 'self'` plus GA and Vercel hosts. | M |
| FA-06 | P2 (cross-repo) | Role failure surfaces as 401; frontend treats every 401 as token expiry | Backend `auth.guard.ts:67` calls `checkRoles` inside `try`. `:146` throws `UnauthorizedException('Permisos insuficientes')`, which is caught and rethrown as `UnauthorizedException('Token inválido o error al verificar')` at `:120`. `customFetch.ts:30-59` responds to any 401 by calling `refreshAccessToken()` (a rotating refresh, `auth.service.ts:294-316`) and retrying once. Editors can reach admin-only pages (`/admin/projects`, `/admin/courses`, `/admin/exams`) because only the sidebar hides them (`AdminSidebar.tsx:46-53`). Only `/admin/users` has an admin-only layout. | There is **no logout loop**: the refresh succeeds and the retry returns 401 to the caller. But each forbidden request costs 3 HTTP calls and a refresh-token rotation (DB delete, insert and bcrypt), and the user sees a misleading "Unauthorized" message. Anonymous 401s cost refresh (400), logout (400) and a thrown `Error('No autorizado')`. | Backend: throw `ForbiddenException` from `checkRoles` and let it pass through, as `:71-73` already does for bans. Frontend: refresh only on 401, map 403 to a permission error or toast, never retry 403, and skip the refresh when there is no session. Add `ProtectedRoute allowedRoles={["admin"]}` layouts for the admin-only sections. | S |
| FA-07 | P2 | Per-tab refresh polling with a rotating refresh token: wasteful and racy | `AuthProvider.tsx:84-88` `setInterval(refreshAccessToken, 10*60*1000)`. `:91-95` `checkUserStatus` every 5 min. `:99` calls it again whenever `accessToken` or `user` changes, because of the effect deps at `:106`. `refreshAccessToken` writes a new `user` object (`auth.ts:122-126`). That re-runs consumers keyed on `user`: `PostPageClient.tsx:271` refetches the post and flashes the skeleton, `markPostCompleted` POSTs again (`:274-278`), and `use-course-progress.ts:109` and `use-saved-posts.ts:137-141` refetch. `ProtectedRoute.tsx:39` calls `refreshAccessToken()` outside the `customFetch` mutex. The backend rotation deletes the old jti (`auth.service.ts:296-298`), so two concurrent refreshes with the same cookie mean one fails. The failing tab runs `set({user:null, accessToken:null})` (`auth.ts:129`), which persists to `localStorage` and logs out every tab on the next load. The backend already silently refreshes via `x-access-token` (`auth.guard.ts:88-110`), so the timer is redundant. | N tabs make N refreshes every 10 min and 2N status checks every 5 min, all running while tabs are hidden. Logouts are sporadic, and content re-renders every 10 min. | Remove the intervals. Refresh on demand (401 or `x-access-token`) and once on app boot. Coordinate across tabs with `navigator.locks.request('auth-refresh', …)` plus a `BroadcastChannel` to share the new token and logout. Check `user-status` on `visibilitychange`/focus, throttled to at most once every 5 min. Narrow effect deps to `user?.userId`. | M |
| FA-08 | P2 | Shape mismatch: list endpoints return `commentCount`; frontend reads `comments` (plus phantom `image` and `date`) | Backend `paginated-posts.dto.ts:9` `commentCount: number` and `posts.service.ts:213`. Frontend `lib/types.ts:29-32` `image: string … comments: number` and `:53` `date: string`. `components/blog/BlogPost.tsx:17,93` renders `{comments}`, which is undefined. The detail endpoint returns `comments: Comment[]` (`posts.service.ts:272-301`), handled ad hoc at `PostPageClient.tsx:630-634`. | Post cards (home, search, profile) never show a comment count. The types mislead every consumer. | Model the DTOs explicitly (`PostPreview` with `commentCount`, `PostDetail` with `comments`). Better, generate the types from the backend Swagger with `openapi-typescript` (Swagger is already set up in `main.ts:54-70`). | S |
| FA-09 | P2 (cross-repo) | Like and saved state wrong after reload | Comments: the frontend uses `posts/:postId/comments/nested` (`resource-endpoints.ts:33`). The backend handler calls `findAllNested(postId, query)` **without a userId** (`posts.controller.ts:226`). The legacy `comments/post/:id/nested` passes it (`comments.controller.ts:84-102`), so `hasLiked` is always false. Post likes: `use-likes.ts:20` `useState(false)`, and `likes/post/:postId/check` (`likes.controller.ts:129`) is never called. Saves: `use-saved-posts.ts:28` reads only page 1 (backend default `limit=10`, `saved-posts.service.ts:149`), and `saved-posts/:postId/check` is never called. The profile's saved posts are derived by filtering the first 50 public posts (`use-profile.ts:87`) even though `GET saved-posts` already returns full previews. | Users never see their own likes or saves; the first click is a no-op PUT or POST. Saved state is wrong beyond 10 saves, and the profile shows a wrong list beyond 50 posts. | Backend: `@UseGuards(OptionalAuthGuard)` on `posts/:postId/comments/nested` and pass `req.user?.id`. Frontend: initialise likes and saves from the `/check` endpoints, or have the detail endpoint return `hasLiked` and `isSaved`. Render saved posts straight from `GET saved-posts`. | M |
| FA-10 | P2 | Soft 404s, missing static assets, no `metadataBase` | `post/[slug]/page.tsx` never calls `notFound()`, so a missing post returns HTTP 200 and then the client navigates with `router.push("/404")` (`PostPageClient.tsx:233,262`). `/placeholder.svg` is referenced at `BlogPost.tsx:37`, `PostPageClient.tsx:554` and `profile/[nick]/page.tsx:64,230`, and `/logo.png` at `app/layout.tsx:79` (preload) and `StructuredData.tsx:57` (Article publisher logo). **Neither file exists in `public/`.** The backend returns `'/default-avatar.png'` (`profile.service.ts:25,126`), which also doesn't exist. The build warns `metadataBase … not set`. | Soft 404s get indexed. Every page preloads a 404. Article JSON-LD carries an invalid logo. Posts without a cover show broken images. | Call `notFound()` in the server page. Point fallbacks at `/placeholder-post-image.jpeg` and `/tecno-espacio.png`, or add the assets. Set `metadataBase: new URL(SITE_URL)` in the root layout. Have the backend return `null` for avatars and let the frontend choose the placeholder. | S |
| FA-11 | P2 | No per-page metadata or canonicals outside posts | Only `app/layout.tsx:27` and `post/[slug]/page.tsx:30` export metadata. Every other page is `"use client"` and cannot export it: `/courses`, `/courses/[slug]`, `/projects`, `/about`, `/faq`, `/terminos`, `/politica-privacidad`, `/search` and the auth pages. There is no `alternates.canonical` anywhere. | Duplicate title and description across the whole site, and no canonical URLs. | Make the pages Server Components, or add a server `layout.tsx` or `page.tsx` wrapper with `metadata`/`generateMetadata`. Add `robots: { index: false }` to the auth and admin layouts. | S/M |
| FA-12 | P2 | Three different API base URL conventions | `next.config.mjs:7` defaults to `https://api.technoespacio.com` and strips `/api/v1`. `post/[slug]/page.tsx:5` defaults to `https://api.technoespacio.com/api/v1` and assumes the suffix (`${API_URL}/posts/slug/${slug}`, with no `encodeURIComponent`). `lib/api.ts:28-29` has **no default** and returns a relative path on the server. | One env change, such as setting the var without `/api/v1`, silently breaks all post metadata ("Post no encontrado" titles) or the sitemap. | Add `lib/env.ts` that validates and normalises with zod, exporting `API_ORIGIN` and `SITE_URL`. Use it in the rewrites, the server fetchers and `buildApiUrl`. Fail the build if it is missing. | S |
| FA-13 | P2 | Two content formats; legacy renderer relies on heuristics; v2 has no code block and no runtime validation | The legacy path guesses the content type with regexes and includes a **hard-coded slug special case**: `PostPageClient.tsx:284-286` `/seguridad-informatica/i.test(String(slug))`. It does DOM surgery on the client (`:334-402`). `lib/post-content-v2.ts:60-67`: the block union has no `code` block, which matters for a tech blog. `parseContentV2` casts without validating (`:89-97` `return parsed as PostContentBlock[]`), and `PostContentRenderer.tsx` dereferences `block.asset.url` directly. | Code still has to be authored in the legacy format. A malformed v2 payload crashes the page into `error.tsx`. The legacy path blocks SSR (FA-02). | Add a `code` block (language, source) rendered with server-side highlighting. Validate v2 with a zod discriminated union and fall back to legacy if it fails. Do a one-off backend migration of legacy HTML or markdown to v2 (or to sanitized HTML at save time), then delete the heuristics. | M/L |
| FA-14 | P2 | No CI gate; lint never covers `hooks/` and `utils/` | No `.github/` directory. `package.json:9` `"lint": "next lint"` only lints the default dirs (app, components, lib, pages, src). An explicit `--dir hooks` run finds 3 errors: `hooks/comments/useCommentsRefactored.ts:2` (unused import), `hooks/use-media-upload.ts:182` (unused var) and `hooks/use-toast.ts:21`. It also finds 5 `exhaustive-deps` warnings in `hooks/useComments.ts` (476, 641, 784, 814, 851). `eslint-config-next` is pinned to 15.1.4 (`package.json:75`) while `next` is 15.3.9. `next lint` is deprecated from 15.5 and removed in 16. `"test": "vitest"` runs in watch mode. | Regressions like FA-03 ship unnoticed, and there is lint debt in the most complex code. | Add a GitHub Actions job running `npm ci`, `tsc --noEmit`, `eslint .`, `vitest run` and `next build`. Switch to an ESLint flat config that runs `eslint .`. Align `eslint-config-next` with `next`. Make `test` run `vitest run` and add `test:watch`. | S |
| FA-15 | P2 | `npm ci` fails on a peer conflict; leftover Cloudflare script | Verified `ERESOLVE`: `react-day-picker@8.10.1` peers `react ^16.8‖^17‖^18` while the project has `react@19.0.0`. There is no `.npmrc`. `package.json:12` `"pages:build": "npm install --legacy-peer-deps && npx @cloudflare/next-on-pages"`, while the app uses Vercel-only `@vercel/analytics` and `speed-insights` (`app/layout.tsx:87-88`). `@cloudflare/next-on-pages` is deprecated in favour of OpenNext and pulls in wrangler, miniflare and workerd. The README is the create-next-app boilerplate. | Fresh installs and CI fail unless an undocumented `--legacy-peer-deps` flag is set (probably in Vercel project settings). Dead weight in devDependencies. | Upgrade to `react-day-picker@^9` and regenerate the shadcn `calendar.tsx`; the only consumer is `PostsTable.tsx:20`. Interim: commit `.npmrc` with `legacy-peer-deps=true`. Remove `pages:build` and `@cloudflare/next-on-pages`. Write a real README covering env vars and deployment. | S |
| FA-16 | P2 | Analytics loaded without consent | `app/layout.tsx:86` `<GoogleAnalytics gaId="G-7XXV5BXWEF" />` loads unconditionally. There is no consent mechanism (grep for `consent` only matches privacy-policy prose). The site targets Spain (`locale: 'es_ES'`). | GDPR/LSSI exposure; the privacy page mentions cookies, but GA fires before consent. | Add a consent banner and load GA only after opt-in (Consent Mode v2), or drop GA and rely on Vercel Analytics, which is cookieless. | S |
| FA-17 | P3 | Dead code and duplicate comment-hook implementation | `hooks/comments/*` (6 files, about 955 lines, with `index.ts` re-exporting `useCommentsRefactored as useComments`) is **never imported**. `components/blog/Comments.tsx:3` uses the 910-line `hooks/useComments.ts`. Unreferenced files: `components/admin/{ContentEditor,SimpleContentEditor,PostEditContainer,RecentPosts}.tsx`, `components/blog/CodeBlock.tsx`, `components/common/{SkeletonCard,UserAvatar}.tsx`, `lib/editor-config.ts`, `components/ui/carousel.tsx`. Dead routes: `app/(home)/en-construccion` (no inbound links) and `app/(home)/exercises` (`redirect('/courses')`, unlinked). `verify-email` is **live**: the backend emails link to it (`auth.service.ts:102,441`). | Maintenance cost, confusion about which comments hook is canonical, and lint noise. | Delete `hooks/comments/` (or finish the refactor and delete `useComments.ts`; pick one), the unreferenced components and `en-construccion`. Keep `/exercises` as a permanent redirect in `next.config` `redirects()` instead of a page. | S |
| FA-18 | P3 | Unused dependencies | Zero imports for `react-tagsinput` (and `@types/react-tagsinput`), `emoji-picker-react`, `react-masonry-css`, `prism-react-renderer`, `react-google-recaptcha-v3` (`RecaptchaProvider.tsx:34-36` injects the script by hand), and `embla-carousel-react` (only the unused `ui/carousel`). `react-quill-new` is only used by the dead `ContentEditor` and `SimpleContentEditor`. | Install time, audit surface, peer-dependency friction. | Remove them. Consider using `prism-react-renderer` (which is lighter) in place of the full `react-syntax-highlighter` Prism build if the legacy client renderer stays. | S |
| FA-19 | P3 | Inconsistent error handling, logging and telemetry | 51 raw `console.*` calls versus 16 files using `createLogger`. Telemetry goes to `logger.info` (`useComments.ts:111`), but the production log level is `error` (`lib/logger.ts:23-24`), so **telemetry never fires in production**. `app/error.tsx:19` `// TODO: Send to Sentry…` (the error isn't even logged), and there is no `app/global-error.tsx`. `app/not-found.tsx:16-19` renders `Loading...` (in English) on the server. Error strings mix languages (`use-profile.ts` "Failed to load profile data"). | Production errors are invisible, and the telemetry code does nothing. | Route telemetry to Vercel Analytics `track()` or a `/api/telemetry` endpoint. Add Sentry (or `@vercel/otel`) through `instrumentation.ts`, plus `global-error.tsx`. Make `not-found.tsx` a server component. Standardise on toasts for user-facing errors and the logger for everything else. | M |
| FA-20 | P3 | Type layer is scattered and hand-written | Course types live in `hooks/use-courses.ts:7-62`, dashboard types in `lib/dashboard-types.ts`, and everything else in `lib/types.ts`, which contains phantom fields (FA-08). `UserProfile.role` is persisted as a string and re-mapped on rehydrate (`auth.ts:187-199`). | Contract drift goes undetected (FA-08, FA-09). | Generate `lib/api/schema.d.ts` from the backend OpenAPI and derive domain types from it. Keep UI-only types next to the components that use them. | M |
| FA-21 | P3 | Admin protection is client-only (acceptable, but improvable) | There is no `middleware.ts`. `app/admin/layout.tsx:10` wraps everything in a client `ProtectedRoute`. The admin routes are prerendered (`○ /admin…` in the build output), so the bundles are public. `ProtectedRoute.tsx:35-39` tries `refreshAccessToken()` when `user` is null, but `auth.ts:122` `if (user) { set(...) }` **discards the new token when there is no user**, so a valid cookie session can never be restored. The admin layout has no `noindex`. | The data stays protected because the backend enforces roles. However, the admin UI and endpoint map are public, a session cannot be recovered from the cookie alone, and editors can reach admin-only pages (FA-06). | Keep the backend as the authority. Add `export const metadata = { robots: { index: false } }` to `app/admin/layout.tsx`. Add a `middleware.ts` that gates `/admin` on the presence of the `refreshToken` cookie (a UX check, not security; the cookie's `Domain=technoespacio.com` makes it visible to the frontend host). Bootstrap the session on load with refresh, then `profile/me`. | S/M |
| FA-22 | P3 | No client data cache; duplicated requests | `posts/popular-tags` is fetched twice per page (`Sidebar.tsx:48` and `TagFilters.tsx:26`). `TagFilters` expects 8 tags (`:29` `slice(0, 8)`) but the backend defaults to 4 (`posts.controller.ts:161`). `courses/my-progress` is fetched twice (`FeaturedCourses.tsx:29`, `ContinueLearning.tsx:25`). Each `SaveButton` mounts its own `useSavedPosts` list fetch (`SaveButton.tsx:15`). `hooks/use-projects.ts` declares a local function named `fetch` that shadows the global. | Higher API load, which makes FA-04 worse, and more spinners. | For whatever stays on the client after FA-02, use TanStack Query or SWR (dedupe and cache), or pass server-fetched data as props. Pass `?limit=8` explicitly. Rename the shadowing `fetch`. | S/M |
| FA-23 | **P1** (cross-repo) | Public search lets anyone list drafts and scheduled posts | `posts.controller.ts:80-108`: the public `GET posts/search` forwards a user-supplied `status` to `searchPosts`, and `posts.service.ts:621-628` applies it (`whereClause.status = status`). `PaginationDto` allows `status` (`posts/dto/pagination.dto.ts:6-8`). The frontend always sends `status=PUBLISHED` (`search/page.tsx:81`, `(home)/page.tsx:45`), so the parameter is redundant client-side. | Anonymous users can enumerate the titles, excerpts, slugs and tags of drafts and scheduled posts. The 2026-03 "Seguridad de posts" hardening covered `slug/:slug` and `:id`, but not search. | Backend: force `PUBLISHED` on the public search and ignore `status`, leaving `admin/search` as the only status-aware route. Frontend: stop sending `status`. | S |
| FA-24 | **P1** (cross-repo) | Public profile endpoint returns email; login depends on it | `profile.controller.ts:49-52` `@Get(':identifier')` has no guard and returns `getProfileByNickOrId`, which includes `email: profile.email` (`profile.service.ts:135`). The frontend login calls this public route (`lib/auth.ts:55-56` `profile/${decoded.id}`) instead of `profile/me` (`profile.controller.ts:36`). | Any user's email can be fetched by nick, a privacy and spam risk. | Backend: omit `email` (and any other private fields) from `:identifier` and return it only from `profile/me`. Frontend: call `profile/me` after login. | S |

---

## (c) API contract matrix

Legend: the method and path are what the browser sends after `buildApiUrl`. All paths are under `/api/v1`. Backend routes come from `grep @Controller/@Get…`; file:line refers to `blog-fullstack-back/src/…`.

| # | Frontend call (file:line) | Method & path | Backend route | Status |
|---|---|---|---|---|
| 1 | `app/sitemap.ts:8` | GET `posts/sitemap` | — (falls into `GET posts/:id` with ParseIntPipe, 400) | **MISSING** (FA-01) |
| 2 | `post/[slug]/page.tsx:20` (server), `PostPageClient.tsx:227` | GET `posts/slug/:slug` | `posts.controller.ts:272` (OptionalAuth, drafts only for admin/editor) | OK route. **SHAPE**: `comments` is an array, not a number (FA-08). Server copy fetched only for metadata (FA-02). |
| 3 | `(home)/page.tsx:48`, `postService.ts:45` | GET `posts?page&limit&status` | `posts.controller.ts:67` (always PUBLISHED; `status` accepted but ignored) | OK route. **SHAPE**: `{data, meta{total,page,lastPage,limit}}` matches, but `commentCount` vs `comments` (FA-08). |
| 4 | `(home)/page.tsx:44`, `search/page.tsx:92` | GET `posts/search?…&status=PUBLISHED&tags=` | `posts.controller.ts:80` | OK. Backend honours `status` from anonymous callers (FA-23). |
| 5 | `postService.ts:23` (Sidebar) | GET `posts/recommended?limit=3` | `:148` returns `PaginatedPostsDto` | OK (`data.data` read correctly). |
| 6 | `Sidebar.tsx:48`, `TagFilters.tsx:26` | GET `posts/popular-tags` | `:157` (default limit 4) | OK. Semantic mismatch: TagFilters expects up to 8 (FA-22). |
| 7 | `use-posts.ts:259/268`, `:262`, `:265` | GET `posts/published`, `posts/draft`, `posts/scheduled` | `:121`, `:110`, `:133` | OK |
| 8 | `use-posts.ts:249` | GET `posts/admin/search` | `:229` | OK |
| 9 | `use-posts.ts:77` | GET `posts/:id` | `:291` | OK |
| 10 | `use-posts.ts:148,356` / `:309` | PUT / DELETE `posts/:id` | `:310` / `:338` | OK |
| 11 | `use-create-post.ts:108` | POST `posts` (multipart) | `:362` | OK |
| 12 | `use-posts.ts:127`, `use-media-upload.ts:103` | POST `posts/upload` | `:421` | OK |
| 13 | `use-likes.ts:48` | PUT/DELETE `posts/:postId/like` | `:166` / `:181` | OK. Initial `hasLiked` never fetched (FA-09). |
| 14 | `useComments.ts:167` via `resource-endpoints.ts:33` | GET `posts/:postId/comments/nested?page&limit&order` | `posts.controller.ts:211` | OK route and shape (`{data, meta{currentPage,totalPages,totalItems,itemsPerPage}}`, `comments.service.ts:638-645`). **SEMANTIC**: no userId, so `hasLiked` is always false (FA-09). |
| 15 | `comment-utils.ts:142` (plain `fetch`) | GET `comments/replies/:id?limit=50` | `comments.controller.ts:105` (`Cache-Control: private, max-age=600`) | OK. New replies can be stale for up to 10 min in the browser cache. |
| 16 | `useComments.ts:539,682` | POST `comments` | `comments.controller.ts:48` | OK |
| 17 | `useComments.ts:791` / `:821` | DELETE / PATCH `comments/:id` | `:184` / `:161` | OK |
| 18 | `useComments.ts:415` | PUT/DELETE `comments/:id/like` | `:127` / `:144` | OK |
| 19 | `lib/auth.ts:38` | POST `auth/login` | `auth.controller.ts:72` | OK (`{accessToken}` plus refresh cookie) |
| 20 | `lib/auth.ts:103` | POST `auth/refresh-token` | `:131` (rotates) | OK |
| 21 | `lib/auth.ts:134` | POST `auth/logout` | `:113` (400 without cookie) | OK |
| 22 | `AuthProvider.tsx:25` | GET `auth/user-status` | `:191` | OK (`{role, roleAsString, isBanned}`) |
| 23 | `signup/page.tsx:116`, `signin/page.tsx:79`, `verify-email/page.tsx:64`, `RequestResetPassword.tsx:46`, `ResetPasswordForm.tsx:60` | POST `auth/register`, `auth/resend-verification`, `auth/verify-email`, `auth/request-password-reset`, `auth/reset-password` | `:59`, `:224`, `:214`, `:236`, `:247` | OK |
| 24 | `lib/auth.ts:56` | GET `profile/:id` | `profile.controller.ts:49` | OK shape (`userId`, `joinDate`, `socialLinks`, `skills` all match `UserProfile`). Uses the public route, which leaks email (FA-24). |
| 25 | `use-profile.ts:52,226` | GET `profile/:nick` | `:49` | OK |
| 26 | `use-profile.ts:125` / `:200` | PATCH `profile/me` / `profile/cover-image` | `:55` / `:71` | OK |
| 27 | `use-activities.ts:66` | GET `profile/me/activities`, `profile/:nick/activities` | `:92` / `:108` | OK |
| 28 | `use-profile.ts:166`, `lib/auth.ts:149` | PATCH `users/avatar` | `users.controller.ts:157` | OK. Avatar default `/default-avatar.png` doesn't exist (FA-10). |
| 29 | `use-users.ts:42` | GET `users?page&limit&searchTerm` | `users.controller.ts:71` | Route OK. **Client broken**: `new URL(relative)` throws (FA-03). |
| 30 | `use-users.ts:76,103` / `:156` | PATCH `users/:id/status` / `users/:id/role` | `:81` / `:173` | OK |
| 31 | `use-saved-posts.ts:28` / `:63` / `:98` | GET `saved-posts` / POST and DELETE `saved-posts/:postId` | `saved-posts.controller.ts:75` / `:36` / `:53` | OK. Only page 1 is read, and `:postId/check` is unused (FA-09). |
| 32 | `use-courses.ts:73,89` | GET / POST `courses` | `courses.controller.ts:42` / `:33` | OK |
| 33 | `use-courses.ts:104,119` | PUT / DELETE `courses/:id` | `:144` / `:153` | OK |
| 34 | `use-courses.ts:136` (plain fetch) | GET `courses/:slug` | `:130` | OK |
| 35 | `use-courses.ts:151` (plain fetch) | GET `courses/navigation/:postId` | `:163` | OK |
| 36 | `use-course-progress.ts:34` / `:59` / `:94` | POST `courses/progress/:postId`, GET `courses/:courseId/progress`, GET `courses/my-progress` | `:51` / `:74` / `:64` | OK |
| 37 | `use-modules.ts:34,52` / `:68,81` | GET and POST `courses/:id/modules`, PUT and DELETE `courses/modules/:moduleId` | `:89`, `:96` / `:108`, `:120` | OK |
| 38 | `use-exams.ts:18,47,72,100,125,146` | GET `exams/course/:id`, `…/status`, `exams/:id`, `exams/:id/status`, `exams/:id/attempts`, POST `exams/:id/submit` | `exams.controller.ts:42,49,157,137,128,113` | OK |
| 39 | `use-admin-exams.ts:15,46,62,75` | GET `exams/:id/admin`, POST `exams`, PUT and DELETE `exams/:id` | `:102`, `:73`, `:83`, `:92` | OK |
| 40 | `projectService.ts:13` | GET `projects` | `projects.controller.ts:37` | OK |
| 41 | `projectService.ts:25,35,53,68,86,105,117` | GET and POST `admin/projects`, PATCH and DELETE `admin/projects/:id`, POST `…/:id/screenshot`, GET `…/github/repos`, POST `…/github/import` | `projects.controller.ts:43,50,57,64,86,72,79` (all `@Roles(ADMIN)`) | OK. Editors get a 401 from the role check (FA-06). |
| 42 | `use-dashboard.ts:15` | GET `admin/stats` | `admin-stats.controller.ts:14` | OK |
| 43 | `ContactForm.tsx:57` | POST `contact` | `contact.controller.ts:11` | OK |
| 44 | `media-client.ts:93,115,133,147` | POST `media/uploads/init`, `…/complete`, DELETE `media/:key`, GET `media/:key/metadata` | `media.controller.ts:27,60,67,73` | OK |

Backend routes **not used** by the frontend: `posts/:postId/comments` (flat), `posts/upload/image` (legacy), `comments/post/:postId[/nested]` (legacy), `comments/:id` GET, `likes/*` (including the `check` endpoints that FA-09 needs), `saved-posts/:postId/check`, `auth/current-role`, `auth/ban-status`, `courses/id/:id`, `health`.

### Transport, cookies and caching (task item 1)
- **Browser path**: `buildApiUrl` returns `/api/v1/…` (`lib/api.ts:23-25`). Next/Vercel rewrites the request to `api.technoespacio.com` (`next.config.mjs:6-7`). From the browser's point of view every API call is same-origin.
- **Refresh cookie**: `httpOnly; Secure; SameSite=None; Domain=technoespacio.com; 7d` in production (`auth.controller.ts:36-42`). Through the proxy, `Set-Cookie` arrives on a `technoespacio.com` response, so the cookie is accepted. As a consequence it is sent with **every** request to the frontend host (HTML, `/_next/*`, images) as well as the API, which is wider than needed. `SameSite=None` is unnecessary when traffic is same-origin and makes the cookie-only `POST /auth/refresh-token` and `/auth/logout` reachable cross-site (CSRF logout or rotation; the response can't be read cross-origin). On Vercel preview domains (`*.vercel.app`) the cookie is rejected because the domain doesn't match, so preview sessions die after 15 min. If the frontend switches to direct calls (FA-04 option A), make the cookie host-only on `api.technoespacio.com`, `Path=/api/v1/auth` (or `/api/v1` because `AuthGuard` auto-refresh reads it), `SameSite=Lax`.
- **Server path**: `generateMetadata` and `sitemap` call the backend directly, without cookies or a bearer token, so they can only read public data. That is correct for ISR but means drafts can never be server-rendered. The draft preview has to stay client-side, or use Draft Mode.
- **Caching**: the post metadata uses the Data Cache for 60 s (`page.tsx:21`), but the route is dynamic (`ƒ`), and the body is fetched by the client with no cache at all. The sitemap is `○`, revalidated every 1 h, built from an empty list. There is **no on-demand revalidation** (no route handler, no `revalidateTag`), so a publish, edit or the backend's cron auto-publish of SCHEDULED posts cannot purge anything. Responses that go through the rewrite are not edge-cached because the backend sends no cache headers apart from `comments/replies` (`private, max-age=600`).

---

## (d) Rendering strategy map

"Client" means a `"use client"` page. Its static markup is still prerendered, but data arrives through `useEffect`. Build type: `○` static, `ƒ` dynamic.

| Route | Build | Render | Where data is fetched | Metadata | SEO risk |
|---|---|---|---|---|---|
| `/` | ○ | Client page (`(home)/page.tsx:1`) | Browser: `posts`, `popular-tags` twice, `recommended`, `courses` (+ `my-progress` twice, `user-status` when logged in) | Root only | **High**: post list and links are absent from the HTML |
| `/post/[slug]` | ƒ | Server shell plus client `PostPageClient` | Server: `posts/slug` (revalidate 60) for metadata only. Browser: `posts/slug` again, comments, `courses/navigation`, sidebar (2 calls) | Server `generateMetadata` (OG and Twitter OK) | **High**: body, H1 and JSON-LD only after JS; HTTP 200 for missing slugs; 521 kB JS |
| `/courses` | ○ | Client | Browser `courses` | Root only | Medium |
| `/courses/[slug]` | ƒ | Client | Browser `courses/:slug`, progress, exam status | Root only | Medium-high (course landing pages are crawlable content) |
| `/courses/[slug]/exam/[examId]` | ƒ | Client | Browser, auth required | Root only | Low (should be `noindex`) |
| `/projects` | ○ | Client | Browser `projects` | Root only | Medium (portfolio content missing from HTML) |
| `/search` | ○ | Client + Suspense | Browser `posts/search` | Root only | Low (search pages are normally `noindex`) |
| `/about`, `/faq`, `/terminos`, `/politica-privacidad`, `/contact` | ○ | Client (framer-motion), no data | None; content is in the SSR HTML but starts at `opacity:0` (`about/page.tsx:44-45`) until hydration | Root only (duplicate titles) | Low-medium (metadata; LCP delayed by the motion animation) |
| `/profile/[nick]`, `/profile` | ƒ / ○ | Client | Browser `profile/:nick`, activities, saved posts | Root only | Low (disallowed in `robots.ts:14`) |
| `/signin`, `/signup`, `/reset-password`, `/verify-email` | ○ | Client | Browser auth endpoints | Root only | Low (should be `noindex`) |
| `/admin/**` | ○ / ƒ | Client behind `ProtectedRoute` | Browser, bearer token | Root only, no `noindex` | Low (`robots.ts:11` disallows) |
| `/sitemap.xml` | ○, 1 h | Server | Server `posts/sitemap` (missing) | n/a | **Critical** (FA-01) |
| `/robots.txt` | ○ | Server | none | n/a | OK |
| `/en-construccion`, `/exercises` | ○ | Client gate / server redirect | none | — | Dead routes (FA-17) |
| `not-found` / `error` | — | Client (`not-found` SSR renders `Loading...`) | none | — | Low |

---

## (e) Proposed target architecture

1. **Data access split.**
   - `lib/env.ts` validates `API_ORIGIN` and `SITE_URL` with zod.
   - `lib/api/server.ts` (`import 'server-only'`) holds typed fetchers: `getPublishedPosts(page)`, `getPostBySlug(slug)`, `getCourses()`, `getProjects()`, `getSitemapEntries()`. Each uses `fetch(API_ORIGIN+path, { next: { revalidate, tags } })`.
   - `lib/api/client.ts` keeps `customFetch` for authenticated mutations and per-user state (likes, saves, progress, comments).
   - Types are generated from the backend OpenAPI (`openapi-typescript`). Drop the hand-written DTO types.
2. **Public routes as Server Components with ISR and on-demand revalidation.**
   - `/` lists posts with `revalidate: 300` and the tag `posts`. The tag filter and pagination move into `searchParams`, which gives crawlable `/?page=2&tag=x` URLs.
   - `/post/[slug]`:
     - Add `generateStaticParams` over the published slugs (or the top N, with `dynamicParams = true`) and revalidate on the tag `post:<slug>`. Call `notFound()` for unknown slugs.
     - Render on the server: v2 blocks through a server `PostContentRenderer`, and legacy content as sanitized HTML (sanitized at save time on the backend, or with `isomorphic-dompurify`). Code highlighting happens on the server with shiki, so no highlighter ships to the client.
     - Emit JSON-LD from the server.
     - Client islands receive props: `LikeButton` and `SaveButton` (initial state from the `check` endpoints), `ShareMenu`, `QuizBlockView`, and `Comments` (lazy-loaded with `next/dynamic` or `Suspense`).
     - Drafts and scheduled posts move to `/admin/posts/preview/[id]`, which fetches on the client with the bearer token (or uses Draft Mode).
   - `/courses`, `/courses/[slug]` and `/projects` follow the same pattern. Static pages become Server Components that export `metadata`, with motion in small client wrappers or plain CSS.
   - Add `app/api/revalidate/route.ts` (POST, shared secret) that calls `revalidateTag`. The backend calls it on post create, update, delete, publish and in the SCHEDULED cron.
3. **Auth.**
   - Keep the access token in memory. Persist only a non-PII `hasSession` hint, if anything.
   - Bootstrap on load: if `hasSession` is set, call `refresh-token` once and then `profile/me`.
   - Refresh only on demand (401 or the `x-access-token` header), coordinated across tabs with Web Locks and a `BroadcastChannel`.
   - Remove both intervals and check `user-status` on focus or visibility, throttled.
   - The backend returns 403 for role failures; `customFetch` never refreshes on a 403.
   - `middleware.ts` gives `/admin` a UX redirect when the cookie is absent. Add `robots: noindex` to the admin and auth layouts.
4. **Network.** Choose between calling the API directly from the browser (CORS and the cookie domain are already configured; the backend sets `trust proxy 1`) and keeping the rewrite with a signed client-IP header plus a custom throttler tracker. Either way, deduplicate client requests by passing server data as props or using TanStack Query for what stays on the client.
5. **Tooling.**
   - CI runs `npm ci`, `tsc --noEmit`, `eslint .` (flat config) and `vitest run` with coverage, then `next build`, then the Playwright smoke tests.
   - Upgrade `react-day-picker` to v9, remove the Cloudflare script and unused dependencies, and align `eslint-config-next`.
   - Add Sentry or OpenTelemetry through `instrumentation.ts`.

### Minimal high-value test plan (task item 6)
Current coverage: 12 files and 48 tests, all pure `lib/*` helpers. Nothing tests the auth store, `customFetch`, any hook or any component. There is no `vitest.config` (it defaults to the node environment), and `lib/api.test.ts` only exercises the server branch of `buildApiUrl`, which is exactly the gap that let FA-03 through.

Add `vitest.config.ts` with `environment: 'jsdom'` for `*.test.tsx`, `@testing-library/react`, `msw` and coverage thresholds on `lib/` and `hooks/`.

1. **`customFetch`** (MSW):
   - 401 → refresh → retry with the new bearer token.
   - 5 concurrent 401s → exactly 1 refresh call.
   - Refresh fails → `logout` + throw.
   - An `x-access-token` header updates the store.
   - (After the FA-06 fix) a 403 is returned without a refresh.
2. **Auth store**:
   - Login maps the JWT role and profile fields.
   - The token is not persisted (FA-05).
   - Refresh with `user=null` restores the session (FA-21).
   - Logout clears state even on a network error.
   - Rehydrate maps the role string to the enum.
3. **`buildApiUrl`**: browser branch, server branch, missing env should throw (FA-12).
4. **Contract tests** with MSW fixtures copied from the backend DTOs, later generated from OpenAPI:
   - `BlogPost` renders `commentCount`.
   - `useUsers` requests `/api/v1/users?page=1&limit=10`.
   - `sitemap()` emits post URLs.
   - `useComments` paginates with `meta.currentPage/totalPages`.
   - The like and save buttons initialise from the `check` endpoints.
5. **Components**:
   - `ProtectedRoute` redirects anonymous users and editors on admin-only routes.
   - `ContentResolver` chooses v2 or legacy.
   - The legacy renderer strips `<img onerror>` and `<script>`.
6. **Playwright smoke**, run against `next start` with a mocked API or the backend docker-compose:
   - `/` HTML (JS disabled) contains post titles.
   - `/post/<slug>` HTML contains the H1, body and JSON-LD.
   - An unknown slug returns 404.
   - `sitemap.xml` contains `/post/`.
   - Login reaches the admin dashboard.
   - An editor is redirected away from `/admin/users`.

---

## (f) Strengths

- **Small, tested helpers at the boundary.** `lib/api.ts` (URL building and the error-message extraction that handles NestJS array messages), `lib/resource-endpoints.ts`, `lib/media-client.ts` and `lib/upload-fallback-adapter.ts` (new and legacy upload payloads), `lib/profile-adapter.ts`, and `lib/post-content-v2.ts` with safe YouTube ID validation all have unit tests (48 passing).
- **TypeScript strict** with `tsc` at 0 errors. `next build` succeeds, and the default lint has no errors.
- The **server-side `generateMetadata`** for posts (commit `5c44870`) correctly fixed OG and Twitter previews for social crawlers.
- `customFetch` already has a **single-flight refresh mutex** (`customFetch.ts:5,35-41`) and supports the backend's `x-access-token` silent refresh.
- The refresh token is **httpOnly and rotated** server-side. Bans are rechecked on every request (`auth.guard.ts:55-64`), and the frontend reacts by logging the user out (`AuthProvider.tsx:38-51`).
- **Security headers** in `next.config.mjs` (HSTS preload, `X-Frame-Options DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`), `robots.ts` disallows admin and auth paths, and `next/font` self-hosts the fonts.
- The **v2 block content model** (paragraph, heading, image, gallery, video, quiz) with a structured editor is the right foundation for server rendering. Only code blocks and validation are missing.
- **RUM is in place** (Vercel Analytics and Speed Insights), so the impact of the FA-02 migration on LCP/INP can be measured.
- `useSearchParams` consumers are wrapped in `Suspense` (`search/page.tsx:328`, `verify-email/page.tsx:43`), which keeps those routes statically prerenderable.
