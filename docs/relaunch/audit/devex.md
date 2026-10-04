# Audit: Developer Experience, CI/CD, Deployment, Dependency Health, Repo Hygiene

Repos: `/home/user/blog-fullstack-back` (NestJS 11 / Prisma 6 / Postgres / Docker) and `/home/user/blog-fullstack-front` (Next.js 15.3.9 / React 19).
Audit date: 2026-10-04. Heads: back `b6787d6` (origin/main == origin/develop), front `29e168a` (origin/main == origin/develop).
Everything below was verified with a command run during this audit unless marked "(inferred)" or "(not executed)".

---

## (a) Executive summary

Both repos are small, compile cleanly and the frontend is in decent shape (tsc 0 errors, `next build` OK, 0 lint errors, 48/48 unit tests green). The weaknesses are all around the engineering system, not the code:

1. **There is no safety net at all.** Neither repo has a `.github/` directory; GitHub reports 0 workflows, 0 pull requests ever, no protected branches, and Dependabot alerts disabled on both repos (`gh api` 403 "Dependabot alerts are disabled"). All work is pushed straight to `main`.
2. **The backend `main` would fail any CI you add today**: 330 ESLint errors, 2 failing Jest tests (both stale "grep the source" specs), and 26 of 35 spec files assert on source text via `readFileSync` instead of behavior (statement coverage 7.72%).
3. **Known-vulnerable production dependencies, mostly fixable in-range.** Frontend `next@15.3.9` matches 28 advisories (2 critical, several high); `npm install next@15.5.27` is inside the existing `^15.3.9` range. Backend prod audit: 46 vulnerabilities (4 critical, 13 high) incl. direct `@nestjs/core`/`platform-express` <=11.1.17, `handlebars` 4.7.8, `axios` 1.8.3, `multer` 1.x (deprecated by its maintainers).
4. **Leftover Cloudflare Pages integration is red on every frontend commit** (2 Cloudflare Pages check-runs = `failure` on the last 6/6 commits) while Vercel is green. `@cloudflare/next-on-pages` is npm-deprecated.
5. **Deployment config is fragile and partly invisible**: backend image ships all dev dependencies (475 MB vs 170 MB prod-only) on a Node 20 base (EOL since 2026-04-30) while local dev is Node 22; `NODE_ENV` is never set by the image, so a missing platform variable silently turns on Swagger/localhost-CORS/lax cookies; `.env.example` is stale (`SENDGRID_API_KEY` vs the `RESEND_API_KEY` the app requires at boot); the frontend has no `.env.example` (its own `.gitignore` pattern `.env*` would swallow it) and `npm ci` fails without `--legacy-peer-deps`, a flag that is not recorded anywhere in the repo.
6. **Observability is thin.** The backend has good Nest `Logger` discipline (0 `console.*` in `src/`), but the global `AllExceptionsFilter` (`@Catch()`) returns a 500 for any non-HTTP exception **without logging it**, and neither repo has error tracking (`app/error.tsx` still has `// TODO: Send to Sentry/DataDog/etc.`).
7. **Repo hygiene**: backend GitHub default branch is `master` (8 commits behind `main`); committed stale artefacts (`eslint-report.json`, `jest-results.json`, `failed-tests.txt` with `C:\Users\juancmunoz\...` paths); both READMEs are untouched framework templates; no LICENSE / CONTRIBUTING / CODEOWNERS / PR template; `.claude`/`.agents` are git-ignored at HEAD so agent configuration is local-only.

No P0 (active outage / confirmed data exposure) was found. The two closest are the dependency-advisory items (DX-04, DX-05); they are rated P1 because Vercel hosts the image optimizer/edge for the frontend and the backend fixes are in-range, but they should be done first.

**P1 titles:** DX-01 No CI/CD, PR flow or branch protection in either repo; DX-02 Backend `main` is not green (2 failing tests, 330 lint errors); DX-03 Cloudflare Pages checks fail on every frontend commit; DX-04 Next 15.3.9 has 28 advisories (2 critical), in-range fix available; DX-05 Backend prod dependencies: 46 advisories (4 critical, 13 high), most in-range; DX-06 Global exception filter swallows unhandled errors with no logging, and no error tracking anywhere.

---

## (b) Findings

Severity: P0 outage/exposure now; P1 fix this sprint; P2 fix soon; P3 hygiene. Effort: S <= 1h, M <= 1 day, L > 1 day.

| ID | Sev | Title | Evidence | Impact | Recommended fix | Effort |
|---|---|---|---|---|---|---|
| DX-01 | P1 | No CI/CD, no PR flow, no branch protection (both repos) | `ls /home/user/blog-fullstack-{back,front}/.github` -> absent. `gh api repos/JuanCMPDev/<repo>/actions/workflows --jq .total_count` -> `0` (both). `gh api .../pulls?state=all --jq length` -> `0` (both). `gh api .../branches` -> `protected=false` for main/develop(/master). Back `commits/main/check-runs` total_count 0, combined status `pending`, 0 statuses. | Regressions (like the red test suite in DX-02) land unnoticed; only Vercel (front) builds anything. | Add the workflows in section (e); enable branch protection on `main` requiring the `verify` job; work via PRs even as a solo dev (gives Vercel previews + a CI record). | S-M |
| DX-02 | P1 | Backend `main` is not green: 2 failing tests, 330 ESLint errors, 23 files fail Prettier | `jest --ci --json` (scratch): 35 suites -> 32 pass / **3 fail**; 84 tests -> 82 pass / **2 fail**. Failures: `src/auth/auth.controller.cookies.spec.ts` (expects literal `sameSite: 'none'`, code is now `sameSite: isProduction ? 'none' : 'lax'`, `auth.controller.ts:39`); `src/storage/phase2-cloudflare-env.spec.ts` (`readFileSync('../../.env')` -> ENOENT; `.env` is git-ignored so this can never pass on a clean clone/CI); `src/auth/auth.controller.flow.spec.ts` suite did not run: `Cannot find module .../bcrypt/lib/binding/napi-v3/bcrypt_lib.node` (sandbox artefact: native binding absent here; status in real CI unknown). `eslint 'src/**/*.ts' 'test/**/*.ts' -f json`: 133 files, **330 errors / 8 warnings** (279 auto-fixable), 274 are `prettier/prettier`; hot spots `comments.service.ts` 102, `posts.service.ts` 78, `exams.service.ts` 23. `prettier --check` -> 23 files. | A new CI job would be red from the first run, which trains people to ignore it. | Fix the two stale specs first (assert behavior, or delete); run `eslint --fix` once in a dedicated formatting commit (clears ~279), then hand-fix the ~59 remaining (`no-unsafe-*`, unused vars). Then make CI blocking. | M |
| DX-03 | P1 | Cloudflare Pages checks fail on every frontend commit; `pages:build` leftover | `gh api repos/JuanCMPDev/blog-fullstack-front/commits/<sha>/check-runs` for the last 6 commits (29e168a, 27e8230, 6f4aed0, 67df158, e969c38, 5c44870): `Cloudflare Pages: blog-fullstack-front-techno-espacio=failure`, `Cloudflare Pages: blog-fullstack-front=failure`, `Vercel Preview Comments=success` on all 6. `package.json:12` `"pages:build": "npm install --legacy-peer-deps && npx @cloudflare/next-on-pages"`; `npm view @cloudflare/next-on-pages deprecated` -> "Please use the OpenNext adapter instead". No `export const runtime = 'edge'` anywhere in `app/` (next-on-pages needs it for the 7 dynamic routes) (not executed: `pages:build` itself). Deployments API shows `vercel[bot]` Production + Preview deployments, so Vercel is the live host. | Permanent red X on every commit hides real failures; two Cloudflare projects may also be consuming build minutes; `@cloudflare/next-on-pages` carries a high audit entry. | Disconnect (or delete) both Cloudflare Pages projects from the repo in the Cloudflare dashboard; remove `pages:build` and `@cloudflare/next-on-pages` (+ its transitive `miniflare`/`workerd` tooling) from `package.json`. If Cloudflare hosting is wanted later, use OpenNext. | S |
| DX-04 | P1 | Frontend `next@15.3.9` matches 28 security advisories (2 critical, 10 high) | `npm audit --omit=dev --json` (front): 12 prod vulns (1 critical, 5 high, 5 moderate, 1 low); `next` entry lists 28 advisories, e.g. GHSA-2xp9-vwfh-vxw4 (critical, RCE in Image Optimization API w/ AVIF, `<15.5.24`), GHSA-p293-qw3h-jr36 (critical, RCE on Windows-hosted servers, `<15.5.24`), GHSA-p9j2-gv94-2wf4 (high, SSRF in rewrites via attacker-controlled destination hostname, `<15.5.21`), GHSA-8h8q-6873-q5fj / GHSA-q4gf-8mx6-v5v3 (high, DoS with Server Components, `<15.5.16`), GHSA-267c-6grr-h53f (high, middleware bypass via segment-prefetch). `npm outdated`: next current 15.3.9, **wanted 15.5.27**, latest 16.3.8. `fixAvailable: true` for `next`, `sharp`, `postcss`, `lodash`, `nanoid`. | Production framework version with known DoS/SSRF/RCE advisories. Exploitability on Vercel is reduced (platform runs the image optimizer; no `middleware.ts` exists; rewrite destination is fixed), but the Server-Components DoS applies to the app bundle. If any non-Vercel host serves this build, treat as P0. | `npm install next@^15.5.27 @next/third-parties@^15.5.27 eslint-config-next@15.5.27 --legacy-peer-deps`; run `next build`; ship. Plan Next 16 separately (see DX-16). | S |
| DX-05 | P1 | Backend production dependencies: 46 advisories (4 critical, 13 high), mostly fixable in-range | `npm audit --omit=dev --json` (back): `{critical:4, high:13, moderate:27, low:2}` (full tree incl. dev: 128 = 6/69/43/10). Critical: `handlebars` (direct, 4.7.8, fix 4.7.9 non-breaking), `fast-xml-parser` (via `@aws-sdk/*` <=3.893), `form-data` (via axios chain), `tar` (via `bcrypt@5` -> `@mapbox/node-pre-gyp`; fix = bcrypt 6, major). High direct: `@nestjs/core` + `@nestjs/platform-express` `<=11.1.17` (installed 11.0.9; wanted 11.2.7), `axios` 1.8.3 (wanted 1.20.0), `@nestjs/swagger` <=11.2.6, `bcrypt`. High transitive: `path-to-regexp`, `jws` (HMAC verification), `lodash`, `js-yaml`, `validator`. `npm ls multer` -> direct `multer@1.4.5-lts.1`; `npm view multer@1.4.5-lts.1 deprecated` -> "Multer 1.x is impacted by a number of vulnerabilities... upgrade to 2.x". `npm view @nestjs/platform-express@11.2.7 dependencies.multer` -> `2.4.0`. | Several are DoS/ReDoS in request-path libs (express routing, validators, multer uploads used by 4 controllers: projects/users/profile/posts). `handlebars` risk is lower (templates are static repo files) but it is a direct critical. | `npm update @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/swagger @nestjs/config @nestjs/jwt axios handlebars uuid resend @aws-sdk/client-s3 @aws-sdk/s3-request-presigner` (all within ^ ranges); remove the direct `multer` dep (only `@types/multer` is needed; Nest brings its own, 2.4.0 after the bump); then re-run `npm audit --omit=dev`. Evaluate `bcrypt@6` (prebuilt binaries, drops `node-pre-gyp`/`tar`). | M |
| DX-06 | P1 | Global exception filter swallows unhandled errors silently; no error tracking | `src/common/filters/http-exception.filter.ts`: `@Catch()` filter returns `{statusCode:500, message:'Internal server error'}` for non-`HttpException`s and contains no `Logger`/`console` call (the default Nest handler that logs such errors is replaced via `app.useGlobalFilters(new AllExceptionsFilter())` in `main.ts`). `grep -rn sentry\|pino\|winston\|opentelemetry\|terminus package.json src` -> none (both repos). Front `app/error.tsx:19` `// TODO: Send to Sentry/DataDog/etc.`; no `app/global-error.tsx`. | Unexpected failures (Prisma errors, S3 errors, bugs) vanish from the container logs; there is no alerting path. | In the filter: `new Logger('Exceptions').error(exception instanceof Error ? exception.stack : String(exception))` for status >= 500. Add Sentry (`@sentry/nestjs`, `@sentry/nextjs`) or at least Vercel log drains; add `global-error.tsx`. | S (log) / M (Sentry) |
| DX-07 | P2 | Frontend install fails without `--legacy-peer-deps`; the flag is not recorded in the repo | `npm ci --dry-run` (front) -> `npm error code ERESOLVE ... While resolving: react-day-picker@8.10.1` (exit 1); `npm ci --legacy-peer-deps --dry-run` -> exit 0. `npm ls react` shows invalid peers for **three** packages: `react-day-picker` (^16.8-^18), `react-google-recaptcha-v3` (^16.3-^18), `react-tagsinput` (^15-^18). No `.npmrc`, no `vercel.json` (`ls -a`). Only the `pages:build` script carries the flag. Backend: `npm ci --dry-run` exit 0, `npm ls --depth=0` clean. | Any CI/devcontainer that runs plain `npm ci` fails; Vercel's install flag lives only in dashboard settings (config drift). | Immediate: commit `.npmrc` with `legacy-peer-deps=true`. Proper: `react-google-recaptcha-v3` and `react-tagsinput` are not imported anywhere (DX-20) so remove them; upgrade `react-day-picker` to >=9 (`npm view react-day-picker@latest peerDependencies` -> `react >=16.8.0`; used only via `components/ui/calendar.tsx` <- `components/admin/PostsTable.tsx`); then drop the flag. | S (flag) / M (upgrade) |
| DX-08 | P2 | Backend runtime image ships every dev dependency | `Dockerfile` final stage: `COPY --from=builder /app/node_modules ./node_modules` after builder ran plain `npm ci` (no `--omit=dev`, no `npm prune`). Measured: full `node_modules` 475 MB / 613 top-level dirs vs `npm ci --omit=dev --ignore-scripts` 170 MB / 229 (scratch copy). The prod-only install still contains `prisma@6.4.0` (it is a peer of `@prisma/client`), so `npx prisma migrate deploy` keeps working. Docker daemon is not running here -> image not built (not executed). | ~300 MB larger image, slower deploys, and dev-tool advisories (jest, @swc/cli, @nestjs/cli dependency chains in the full-tree audit) ship inside the runtime container. | In the builder stage after `npm run build`: `RUN npm prune --omit=dev` (and keep `.prisma/client`), or a separate `deps` stage with `npm ci --omit=dev && npx prisma generate`; verify with `docker build` + `docker run --rm <img> npx prisma -v`. | S |
| DX-09 | P2 | Node version drift: Dockerfile Node 20 (EOL), local Node 22, no `engines`/`.nvmrc` | `Dockerfile` `FROM node:20-alpine` (both stages); sandbox `node -v` -> `v22.22.0`; back `@types/node ^22.10.7` (installed 22.13.1) vs front `@types/node ^20` (installed 20.17.12); `grep '"engines"' package.json` -> none in both; no `.nvmrc`/`.node-version` in either repo (`ls -a`). Node 20 reached end-of-life 2026-04-30 per the Node release schedule. | Production runs an unsupported runtime that differs from what developers type-check against (22 APIs compile but may fail at runtime on 20). | `FROM node:22-alpine` (or 24) in both stages; add `"engines": {"node": ">=22 <23"}` and `.nvmrc` (`22`) in both repos; align `@types/node` to the same major. | S |
| DX-10 | P2 | `NODE_ENV` not set by image/compose: missing platform variable silently enables dev behavior | `grep -n '^ENV ' Dockerfile` -> none. `docker-compose.yml:25` `NODE_ENV: ${NODE_ENV}` with no default (commit `ec13fce` "remove all default values... for Coolify"). `src/main.ts:12` and `src/auth/auth.controller.ts:34` use `process.env.NODE_ENV === 'production'` to gate: Swagger at `/api/docs`, localhost CORS origin, `secure`/`sameSite:'none'` cookie flags and `domain`. `docker compose -f docker-compose.yml config` with nothing exported -> 22 "variable is not set. Defaulting to a blank string" warnings. With `PORT=""`, `process.env.PORT ?? 3001` yields `''` and Node throws `ERR_SOCKET_BAD_PORT` (reproduced). | Forgetting one variable in Coolify either exposes Swagger + lax cookies (NODE_ENV) or crash-loops the container (PORT). | `ENV NODE_ENV=production` in the final stage; in compose use `${NODE_ENV:-production}` / `${PORT:-3001}` for the non-secret values; add startup validation (`ConfigModule.forRoot({ validationSchema })` with Joi/zod) so a missing secret fails fast with a clear message. | S |
| DX-11 | P2 | `.env.example` is stale: lists `SENDGRID_API_KEY`, lacks `RESEND_API_KEY` | `src/mail/mail.service.ts:18` `getOrThrow<string>('RESEND_API_KEY')` (runs in `onModuleInit`); `docker-compose.yml:30` passes `RESEND_API_KEY`; `.env.example:22` has `SENDGRID_API_KEY`; `grep -rn SENDGRID src` -> none. Set difference (script, scratch): source reads 22 vars; the only one missing from `.env.example` is `RESEND_API_KEY`; `.env.example`-only vars: `SENDGRID_API_KEY` (+ `DATABASE_URL`, read by Prisma). `ConfigModule.forRoot({isGlobal:true})` has no validation schema. | A developer who copies `.env.example` gets a crash at boot with `Configuration key "RESEND_API_KEY" does not exist`. | Replace `SENDGRID_API_KEY` by `RESEND_API_KEY`; document required vs optional (AWS_* legacy block); add the validation schema from DX-10. | S |
| DX-12 | P2 | Frontend has no `.env.example`, and cannot have one with the current `.gitignore`; missing vars degrade silently | `git check-ignore -v .env.example` -> `.gitignore:34:.env*`. Env vars read (grep): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MEDIA_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_APP_LOG_LEVEL`, `NEXT_PUBLIC_ENABLE_LEGACY_BASE64_FALLBACK`. Scratch `next build` with none set succeeded but logged `Error fetching posts for sitemap: TypeError: Failed to parse URL from posts/sitemap` (SSR `buildApiUrl` returns the relative path when `NEXT_PUBLIC_API_URL` is empty, `lib/api.ts:28-29`) and two `metadataBase property in metadata export is not set ... using "http://localhost:3000"` warnings. `next.config.mjs:7` has a different hardcoded fallback `https://api.technoespacio.com`. | Build "succeeds" with an empty sitemap and wrong OG base URL when a Vercel env var is missing; new contributors cannot discover the variables. | Add `!.env.example` to `.gitignore` and commit `.env.example` listing the 6 vars; validate required vars at build time (`next.config.mjs` throwing if `NEXT_PUBLIC_API_URL`/`SITE_URL` missing in production); set `metadataBase` from `NEXT_PUBLIC_SITE_URL`. | S |
| DX-13 | P2 | Malformed URL fallbacks `'https//...'` (missing colon) in 5 places | `app/robots.ts:4`, `app/sitemap.ts:4`, `app/(home)/post/[slug]/page.tsx:4-5` (both `SITE_URL` and `API_URL`), `app/(home)/post/[slug]/PostPageClient.tsx:525`: `process.env.NEXT_PUBLIC_SITE_URL \|\| 'https//technoespacio.com'`. | If the env var is unset, robots/sitemap/OG/canonical URLs become invalid and the server-side post metadata fetch targets `https//api.technoespacio.com/...` (invalid). Currently masked by the Vercel env vars. | Fix to `https://` or centralize in one `lib/site-config.ts` constant that throws when missing in production. | S |
| DX-14 | P2 | Backend tests assert on source text, not behavior; `test:db` starts Postgres that no test uses | 26 of 35 `src/**/*.spec.ts` import `readFileSync` and `toContain()`-check TypeScript source (e.g. `phase7-performance-queries.spec.ts`, `phase8-health-endpoint.spec.ts`: the route test greps `app.controller.ts` for `@Get('health')`). Only 1 file in `src`+`test` uses `Test.createTestingModule`. `grep -rE 'DATABASE_URL\|PrismaClient\|new PrismaService' src test --include=*spec.ts` -> **no matches**: no spec needs a DB. `jest --coverage` (scratch dir): Statements **7.72%**, Branches 8.22%, Functions 5.03%, Lines 7.56%; no `coverageThreshold` in the `package.json` jest block. `package.json` `test:db` = `docker compose -f docker-compose.db.yml up -d && npm run test -- src/phase7-performance-queries.spec.ts src/phase7-findallnested-performance.spec.ts src/prisma/phase7-indexes.spec.ts && npm run build`: couples Docker + tests + build, and the 2nd path does not exist (`src/phase7-findallnested-performance.spec.ts`; the file lives in `src/comments/`) so jest silently skips it. `test/app.e2e-spec.ts` boots the whole `AppModule` (needs Postgres + `RESEND_API_KEY`/`MAIL_FROM`/`JWT_SECRET`), is not wired into any CI. Stray duplicate `prisma/phase7-indexes.spec.ts` (differs from `src/prisma/phase7-indexes.spec.ts`; outside jest `rootDir: src`, never runs, copied into the Docker image by `COPY prisma`). | Green tests give false confidence: refactoring that preserves behavior breaks them, while real regressions (auth, throttling, Prisma queries) are untested. | Keep a handful of contract greps if desired, but add behavior tests for auth/posts/comments with `@nestjs/testing` + mocked `PrismaService`; for real DB tests use a Postgres service container and `prisma migrate deploy`; split `test:db` into `db:up` / `test`; add `coverageThreshold` as a ratchet. | L |
| DX-15 | P2 | Frontend test infra is minimal and cannot import most of the app | 12 test files / 48 tests, all in `lib/` (3.0 s run, all pass); 205 non-test TS/TSX files. No `vitest.config.*`, no `jsdom`/`happy-dom`, no Testing Library, no Playwright/Cypress (`ls node_modules`), no `@vitest/coverage-*` (`ls node_modules/@vitest`). Probe in scratch copy: a test importing `lib/customFetch.ts` fails with `Error: Cannot find package '@/lib/auth'` (tsconfig `paths` alias not resolved by Vitest). `package.json` `"test": "vitest"` is watch mode (hangs in CI; `test:run` exists). | Auth/refresh logic (`lib/auth.ts`, `lib/customFetch.ts`), hooks and all components are untestable as-is. | Add `vitest.config.ts` with `resolve.alias {'@': root}` (or `vite-tsconfig-paths`), `environment: 'jsdom'`, `@testing-library/react`, `@vitest/coverage-v8`; add 1-2 Playwright smoke tests (home, post page) run against the Vercel preview. | M |
| DX-16 | P2 | Lint/script hygiene: `lint` mutates files; `next lint` disappears in Next 16; config mismatch | Back `package.json`: `"lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"` (auto-writes; cannot be a CI gate). Front `"lint": "next lint"`; `grep -n lint node_modules/next/dist/bin/next` shows the `lint` command in 15.3.9 while the `next@16.3.8` tarball has no `dist/cli/next-lint.js` and no `lint` string in `dist/bin/next`; in 15.3.9 `next build` runs lint implicitly ("Linting and checking validity of types"). `eslint-config-next` is pinned `15.1.4` vs `next ^15.3.9` (resolved 15.3.9), `@next/third-parties ^15.2.2` (resolved 15.2.2). No `typecheck` script in either repo (front type errors only surface inside `next build`). | Upgrading to Next 16 silently removes linting from the build; mismatched plugin/framework versions drift. | Back: `"lint": "eslint ... "`, `"lint:fix": "... --fix"`. Front: `"lint": "eslint ."` (flat config already exists), `"typecheck": "tsc --noEmit"`, align `eslint-config-next` and `@next/third-parties` to the installed `next` version. | S |
| DX-17 | P2 | Branch model: backend default branch is stale `master`; `develop` duplicates `main`; no protection | Back: `gh api repos/.../branches/{main,develop,master}` -> `main b6787d6 2026-03-31`, `develop b6787d6` (identical), `master 11392c1 2025-03-19`; `gh api repos/JuanCMPDev/blog-fullstack-back --jq .default_branch` -> `master`; `compare/master...main` -> `ahead_by 8, behind_by 0`. Front default branch is `main` (repo is **public**), `develop == main == 29e168a`. `git log --graph --all` (back) shows the `15519c4 merge: integrate all platform updates into master` followed by 5 direct commits. All `protected=false`. Deploy branch of Coolify is not visible from the repo (Dockerfile only); commit messages `c74f437..2d1099b` show Coolify deploys. | New clones, PR targets, "compare" views and any tool using the default branch see 1-year-old code; if Coolify tracks the default branch it would deploy stale code (not verifiable from here). `develop` carries no distinct purpose. | Change backend default branch to `main` (GitHub Settings -> Branches), delete `master`/`develop` or document the flow; add a branch-protection rule/ruleset on `main` (require PR + `verify` check). Confirm the Coolify branch setting. | S |
| DX-18 | P2 | Dependabot alerts disabled; no update automation; deps 6-12 months behind within semver range | `gh api .../dependabot/alerts` -> HTTP 403 "Dependabot alerts are disabled for this repository" (both). No `.github/dependabot.yml`/renovate config. `npm audit` totals: front 50 (2 critical/32 high/11 moderate/5 low; prod-only 12), back 128 (6/69/43/10; prod-only 46). `npm outdated`: 49 packages each; e.g. react 19.0.0 -> 19.3.0, prisma 6.4.0 -> 6.19.3, @nestjs/* 11.0.9 -> 11.2.7, @aws-sdk 3.758 -> 3.1146. See section (d). | Advisories (DX-04/05) were never surfaced; drift keeps growing. | Enable Dependabot alerts + security updates in repo settings; add a weekly grouped `dependabot.yml` (sketch in section (e)); do one catch-up `npm update` per repo. | S |
| DX-19 | P2 | Container start/stop sequence: `migrate deploy` inside CMD, no graceful shutdown (inferred) | `Dockerfile:40` `CMD ["sh","-c","npx prisma migrate deploy && npm run start:prod"]` (PID 1 = `sh`, `npm` in between, `node` last). `grep -rn enableShutdownHooks src` -> none, so `PrismaService.onModuleDestroy` only runs on `app.close()`. Compose healthcheck `start_period: 30s`, `interval: 10s`, `retries: 5` must cover the migration time. Not executed (no Docker daemon). | A failing/slow migration crash-loops the API (no separate migrate step/rollback); `docker stop` likely waits for the 10 s SIGKILL; in-flight requests and cron (`@nestjs/schedule`) are not drained. Prisma takes an advisory lock so concurrent replicas are safe, but a bad migration still blocks every start. | `CMD ["node","dist/main"]` with `exec`; run `npx prisma migrate deploy` as a Coolify pre-deploy command/one-off job; call `app.enableShutdownHooks()` in `main.ts`; use `tini`/`--init`. | S-M |
| DX-20 | P2 | Unused dependencies in both repos (several cause the ERESOLVE and audit noise) | Scripted import scan + per-package `grep -rF` over `app components hooks lib utils` (front) and `src test scripts nest-cli.json` (back). Front not imported anywhere: `emoji-picker-react`, `prism-react-renderer` (only `react-syntax-highlighter` is used, in `components/blog/CodeBlock.tsx` and `PostPageClient.tsx`), `react-google-recaptcha-v3` (the app has its own `components/common/RecaptchaProvider.tsx`), `react-masonry-css`, `react-tagsinput` (only CSS selectors in `app/globals.css`). Back not imported: `multer` (direct), `uuid`, `class-sanitizer` (only a spec asserting it is *not* used), `@swc/cli`, `@swc/core`, `ts-loader` (nest-cli has no `builder`, so tsc is used), `source-map-support`. `body-parser` is imported in `src/main.ts` but not declared in `package.json` (phantom dependency). `/post/[slug]` First Load JS is 521 kB (route chunk 301 kB) in the `next build` table. | Install time, audit surface (`@swc/cli` brings critical `@xhmikosr/decompress`), and the legacy-peer-deps flag. | `npm uninstall` the unused ones after a quick manual confirmation; declare `body-parser` or use `app.useBodyParser`. | S |
| DX-21 | P3 | Committed stale artefacts in the backend root | `git ls-files`: `eslint-report.json` (246,924 B, UTF-16 from PowerShell; snapshot = 112 files / 40 errors / 5 warnings vs 330/8 today), `jest-results.json` (334,618 B; 34 suites / 7 failed / 66 tests, contains `C:\\Users\\juancmunoz`), `failed-tests.txt` (677 B, 7 Windows paths `C:\Users\juancmunoz\Documents\Proyectos\blog-fullstack-back\...`). All added once in `3a440d7` (2026-03-23) and never updated. `.dockerignore` lists them, `.gitignore` does not. | Noise, misleading metrics, leaks local username/path. | `git rm` the three files; add `eslint-report.json`, `jest-results.json`, `failed-tests.txt`, `coverage/` to `.gitignore`. | S |
| DX-22 | P3 | Frontend `public/` leftovers and heavy images | `grep -rF` over source: no references to `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` (create-next-app leftovers), `google.json` (non-standard file dated 2024-03-30), `placeholder-hero-image.jpg` (448,515 B). Referenced but large: `placeholder-post-image.jpeg` 898,048 B (`components/layout/Sidebar.tsx:111`), `tecno-espacio.png` 425,972 B (OG image), `profile.jpg` 194,567 B. `public/` total ~2.0 MB. Curriculum PDF 62,761 B is referenced by `DownloadCV.tsx` (fine). | Wasted bytes; confusing repo (public repo shows template assets). | Delete the 7 unreferenced files; convert big images to WebP/AVIF at proper dimensions (or serve via the CDN already configured). | S |
| DX-23 | P3 | Docs/ownership files missing; agent config not committed | Both `README.md` are template text (back: NestJS "Mau" ad; front: create-next-app). `git ls-files` shows no `LICENSE`, `CONTRIBUTING`, `CODEOWNERS`, `.github/`, `CLAUDE.md`, `AGENTS.md`, `.editorconfig`, `.nvmrc` in either repo; back `package.json:7` `"license":"UNLICENSED"`; front is a **public** repo without a license (all rights reserved by default). `gh api .../community/profile` -> `health_percentage: 14` (both). `git show HEAD:.gitignore` ends with `/.agents` + `/.claude` in both, and `.claude/` exists locally (agents, skills, workflows; front also settings.json) so agent setup is local-only. (During this audit, untracked `CLAUDE.md`, `docs/`, `.claude/` and an edited `.gitignore` appeared in both working trees at 02:34-02:36; they were not created by this audit's commands.) | Onboarding friction; unclear reuse rights; agent instructions disappear with the machine. | Write a real README (what it is, env vars, run/test/deploy, architecture); add a LICENSE (or an explicit "All rights reserved" notice); commit `CLAUDE.md`/`AGENTS.md` and a narrowed ignore (`/.claude/settings.local.json`, `/.claude/worktrees/`). | S-M |
| DX-24 | P3 | Commit conventions and identities are inconsistent | `git log --format=%s origin/main`: back 7/28 messages follow Conventional Commits (`feat:`/`fix:`/`docs:`/`merge:`), front 3/32; the rest mix Spanish and English, several are 200+ char paragraphs (e.g. back `e95cee4`, front `0b1d086`). `git shortlog -sne`: 3 author names for the same email in back, 4 in front (incl. `Juan Carlos Muñoz Pico <juancdev@192.168.10.9>`). No `commitlint`, `husky`, `.mailmap`. | History is hard to scan; no automated changelog/versioning. | Pick one language + Conventional Commits (subject <=72 chars, body for detail); add `.mailmap`; optionally `commitlint` + `husky`. | S |
| DX-25 | P3 | Backend build copies mail templates twice (and one asset glob is dead) | `package.json` build: `nest build && cpy "src/mail/templates/**/*" "dist/mail/templates"`; `nest-cli.json` assets: `mail/templates/**/*` -> `dist/src`, `config/templates/**/*` -> `dist/src` (but `src/config/` does not exist: `ls src/config` -> No such file). After `nest build` alone `find dist -path '*templates*'` -> `dist/src/mail/templates/*.hbs` only; `MailService.loadTemplates` therefore probes 3 directories (`dist/mail/templates`, `dist/src/mail/templates`, `dist/../src/mail/templates`) to find whichever copy exists. `deleteOutDir:true` + `watchAssets:true` also set. | Two mechanisms + a path-probing fallback hide which one is authoritative; a missing-template failure only logs a `warn` (`mail.service.ts`). | Keep only the nest-cli asset (`outDir: dist`, then load `join(__dirname,'templates')`); remove `cpy-cli` and the `config/templates` entry; fail fast if a template is missing. | S |
| DX-26 | P3 | Health endpoint exists but is not what the healthcheck uses, and does not check the DB | `app.controller.ts`: `@Get()` -> "Hello World!" (`/api/v1`), `@Get('health')` -> `{status:'ok',timestamp}` (`/api/v1/health`) under `setGlobalPrefix('api/v1')`; compose healthcheck `wget -q --spider http://localhost:3001/api/v1` hits the hello route, so the path itself is valid. Both go through the global `ThrottlerGuard` (20 req/min). No `@nestjs/terminus`. | Healthy container reports OK even if Postgres is unreachable; Hello route is a placeholder. | Point the healthcheck to `/api/v1/health`, mark it `@SkipThrottle()`, add a DB ping (`SELECT 1` via Prisma or Terminus `PrismaHealthIndicator`) on a separate `/health/ready`. | S |
| DX-27 | P3 | Frontend logging: 51 raw `console.*` calls despite a logger wrapper | `grep -rn "console\." app components hooks lib utils` (non-test): 55 hits = 4 inside `lib/logger.ts` + **51 elsewhere** (49 `console.error`, 1 `log`, 3 `warn`...). Top: `hooks/use-users.ts` 5, `hooks/use-posts.ts` 5, `hooks/use-profile.ts` 4, `hooks/comments/useCommentInteractions.ts` 4, `lib/customFetch.ts` 3. `lib/logger.ts` (level via `NEXT_PUBLIC_APP_LOG_LEVEL`, default `error` in prod) is imported by 15 files. GA id hard-coded `app/layout.tsx:86` `<GoogleAnalytics gaId="G-7XXV5BXWEF" />` (public id, but not env-driven). | Inconsistent client logging, no central place to forward to an error tracker. | Replace with `createLogger(...)`, forward `error` to Sentry when added; read GA id from env. | S |
| DX-28 | P3 | Loose version specifiers | `package.json` back: `"@nestjs/mapped-types": "*"` (installed 2.1.0, `npm outdated` shows **wanted 12.0.0**, a major, because of `*`); `eslint-config-next` pinned exact in front (`15.1.4`). Back `tsconfig.json` has `noImplicitAny:false` and no `strict` (explains the `no-unsafe-*` lint noise: 18 `no-unsafe-assignment`, 15 `no-unsafe-member-access`, 8 `no-unsafe-return`). | `npm update` could jump a major unnoticed; weak typing. | Pin `@nestjs/mapped-types` to `^2.1.0` (or `^11` aligned with Nest); consider `strict` gradually (`noImplicitAny` first). | S |

---

## (c) Check results

All commands run non-destructively: back checks in the repo (outputs to scratchpad), front checks in a throw-away copy `/tmp/claude-0/.../scratchpad/front-copy` (the coordinator's own `front-checks2.log`, ending `=== END OF CHECKS (complete)`, agrees on every front result).

| Repo | tsc | ESLint | Tests | Build | Other |
|---|---|---|---|---|---|
| Backend | `tsc --noEmit` exit 0 | **330 errors / 8 warnings** in 133 files (32 with problems; 279 auto-fixable; 274 are prettier). Top rules: prettier 274, no-unsafe-assignment 18, no-unsafe-member-access 15, no-unsafe-return 8, unused-imports 8. `prettier --check`: 23 files | Jest: 35 suites -> **32 pass / 3 fail**; 84 tests -> **82 pass / 2 fail** (11 s). Failing: `auth.controller.cookies.spec.ts` (stale source grep), `phase2-cloudflare-env.spec.ts` (reads git-ignored `.env`), `auth.controller.flow.spec.ts` (suite did not load: bcrypt native binding missing in this sandbox; real status unknown). **Needs a DB: 0 specs** (e2e `test/app.e2e-spec.ts` would need Postgres + env; not run). Coverage 7.72% stmts / 8.22% branches / 5.03% funcs. 26/35 specs are source-grep | `nest build` exit 0 (dist produced; `npm run build` adds the cpy step) | `prisma validate` OK only with `DATABASE_URL` set (fails with "Validation Error Count: 1" otherwise); plain `npm ci --dry-run` exit 0; `npm ls --depth=0` clean; Docker image not built (daemon not running) |
| Frontend | `tsc --noEmit` exit 0 (47.6 s cold) | `next lint`: **0 errors / 3 warnings** (`react-hooks/exhaustive-deps` x2 in `PostPageClient.tsx:278` and `modules/page.tsx:97`, `no-img-element` in `profile/[nick]/page.tsx:126`) (24 s) | Vitest 4.0.18: **12 files / 48 tests, all pass** (3 s), 0 need a backend/DB (node env, no DOM) | `next build` (Next 15.3.9) **OK** (113 s with other load), 29 static pages; warnings: `metadataBase` not set (x2), `Error fetching posts for sitemap: Failed to parse URL from posts/sitemap` (no `NEXT_PUBLIC_API_URL`). Largest route: `/post/[slug]` 301 kB / 521 kB First Load | plain `npm ci --dry-run` **exit 1 (ERESOLVE)**; with `--legacy-peer-deps` exit 0 |

---

## (d) Dependency table

Source: `npm outdated` (current = lockfile version). "Risk" combines `npm audit` (full tree; **prod** = reachable in runtime image/bundle) and upgrade difficulty. Only packages the commands actually flagged are listed.

### Frontend (`blog-fullstack-front`)

| Package | Current | Wanted (in range) | Latest | Risk / note |
|---|---|---|---|---|
| next | 15.3.9 | 15.5.27 | 16.3.8 | **High (prod, critical advisories)**; in-range bump fixes; 16 removes `next lint` (DX-16) |
| @next/third-parties | 15.2.2 | 15.5.27 | 16.3.8 | Align with next |
| eslint-config-next | 15.1.4 (exact) | 15.1.4 | 16.3.8 | Pin mismatch with next 15.3.9; audit: `@next/eslint-plugin-next` high (dev) |
| react / react-dom | 19.0.0 | 19.3.0 | 19.3.0 | Low; in-range |
| react-day-picker | 8.10.1 | 8.10.2 | 10.0.2 | **Medium**: peer range excludes React 19 (ERESOLVE); latest peers `react >=16.8.0`; v9+ API change affects `components/ui/calendar.tsx` |
| react-google-recaptcha-v3 | 1.10.1 | 1.11.0 | 1.11.0 | Unused import-wise; peer excludes React 19 -> remove |
| react-tagsinput | (installed) | - | - | Unused (CSS only); peer excludes React 19 -> remove (+ `@types/react-tagsinput`) |
| prism-react-renderer | (installed) | - | - | Unused; remove (second highlighter) |
| react-syntax-highlighter | 15.6.1 | 15.6.6 | 16.1.1 | Medium: audit moderate (prismjs DOM clobbering via refractor); fix = v16 major; the only highlighter actually used |
| emoji-picker-react / react-masonry-css | 4.12.0 / 1.0.16 | 4.22.3 / - | 4.22.3 / - | Unused; remove |
| tailwindcss | 3.4.17 | 3.4.19 | 4.3.3 | Medium: v4 is a config/PostCSS rewrite; audit high via chokidar/fast-glob (dev) |
| @tailwindcss/typography / tailwindcss-animate | 0.5.16 / 1.0.7 | 0.5.20 / 1.0.7 | 0.5.20 / 1.0.7 | audit high (via tailwindcss, dev) |
| vitest | 4.0.18 | 4.1.11 | 5.0.3 | audit **critical (dev only)** GHSA-5xrq-8626-4rwp (Vitest UI server); fixed in-range |
| typescript | 5.7.3 | 5.9.3 | 7.0.2 | Low; in-range to 5.9 |
| eslint / @eslint/eslintrc | 9.18.0 / 3.2.0 | 9.39.5 / 3.3.7 | 10.12.0 / 3.3.7 | Low; stay on 9 |
| @types/node | 20.17.12 | 20.19.43 | 26.6.4 | Align with runtime Node major (DX-09) |
| @cloudflare/next-on-pages | (installed) | - | - | **Deprecated** (use OpenNext); audit high; remove (DX-03) |
| @radix-ui/* (18 pkgs) | 1.1.x-2.1.x | up to 1.2.20 etc. | same | Low; in-range |
| zod | 3.24.1 | 3.25.76 | 4.6.5 | Low (v4 migration optional) |
| recharts / framer-motion / lucide-react / date-fns / jose / tailwind-merge / @hookform/resolvers | 2.15.0 / 11.18.0 / 0.471.1 / 3.6.0 / 5.9.6 / 2.6.0 / 3.10.0 | in-range patch bumps | 3.10.1 / 14.0.0 / 1.51.0 / 4.4.0 / 6.2.12 / 3.7.0 / 5.9.1 | Majors available; none urgent |
| postcss, nanoid, sharp, lodash(-es) | 8.5.6 / 3.3.11 / 0.34.5 / transitive | in range | - | audit high (prod) via next/tailwind; `fixAvailable: true` |

### Backend (`blog-fullstack-back`)

| Package | Current | Wanted (in range) | Latest | Risk / note |
|---|---|---|---|---|
| @nestjs/core, common, platform-express, testing | 11.0.9 | 11.2.7 | 12.1.2 | **High (prod)**: `core`/`platform-express` <=11.1.17 advisory; `common` 11.0.x moderate; in-range |
| @nestjs/swagger | 11.0.6 | 11.4.7 | 12.0.2 | High (prod, via js-yaml/lodash) `<=11.2.6`; in-range |
| @nestjs/config / jwt / schedule / throttler / passport | 4.0.0 / 11.0.0 / 5.0.1 / 6.5.0 / 11.0.5 | 4.0.4 / 11.0.2 / 5.0.1 / 6.7.1 / 11.0.5 | 12.0.1 / 12.0.2 / 12.0.2 / 6.7.1 / 12.0.0 | `config` <=4.0.2 moderate (lodash); majors track Nest 12 |
| @nestjs/mapped-types | 2.1.0 | **12.0.0** | 12.0.0 | Spec is `"*"`, so `npm update` jumps to the Nest-12 line (DX-28) |
| @nestjs/cli / schematics | 11.0.2 / 11.0.0 | 11.0.24 / 11.1.0 | 12.0.8 / 12.0.0 | dev; high via `@angular-devkit/*` chain |
| @prisma/client / prisma | 6.4.0 | 6.19.3 | 7.10.0 / 8.0.0-rc.19 (`latest` dist-tag is an RC; `prev` = 7.10.0) | Medium: 6.4 -> 6.19 in-range; Prisma 7 is a major (generator/config changes), plan separately |
| multer | 1.4.5-lts.1 | 1.4.5-lts.2 | 2.4.0 | **Deprecated 1.x** (npm notice); direct dep not imported by code; drop it, Nest 11.2.7 pulls 2.4.0 |
| @types/multer | 1.4.12 | 1.4.13 | 2.3.0 | Keep (types for `Express.Multer.File`) |
| bcrypt / @types/bcrypt | 5.1.1 / 5.0.2 | 5.1.1 / 5.0.2 | 6.0.0 / 6.0.0 | **High/critical via `@mapbox/node-pre-gyp` -> `tar`** (install-time chain); fix = major 6; native binding must be downloaded/built at install |
| axios | 1.8.3 | 1.20.0 | 1.20.0 | **High (prod)** DoS + NO_PROXY SSRF; in-range |
| handlebars | 4.7.8 | 4.7.9 | 4.7.9 | **Critical (prod, direct)** AST type-confusion injection; in-range |
| uuid | 11.0.5 | 11.1.1 | 14.0.2 | Moderate (bounds check) and **unused** -> remove |
| @aws-sdk/client-s3, s3-request-presigner | 3.758.0 | 3.1146.0 | 3.1146.0 | Moderate chain (`fast-xml-parser` critical) fixed by bump |
| resend | 6.9.4 | 6.32.0 | 6.32.0 | Moderate (via svix/uuid); in-range |
| class-validator | 0.14.1 | 0.14.4 | 0.15.1 | High transitive `validator`; in-range to 0.14.4 |
| helmet / rxjs / @types/express | 8.1.0 / 7.8.1 / 5.0.0 | 8.3.0 / 7.8.2 / 5.0.6 | same | Low |
| jest / ts-jest / @types/jest | 29.7.0 / 29.2.5 / 29.5.14 | 29.7.0 / 29.4.14 / 29.5.14 | 30.5.2 / 29.4.14 / 30.0.0 | audit high chain (dev) fixable only by Jest 30 (major) |
| typescript / typescript-eslint | 5.7.3 / 8.24.0 | 5.9.3 / 8.71.0 | 7.0.2 / 8.71.0 | audit high (dev) fixed in-range |
| eslint / @eslint/js | 9.20.1 / 9.20.0 | 9.39.5 | 10.12.0 | Low |
| eslint-plugin-prettier / eslint-config-prettier / prettier | 5.2.3 / 10.0.1 / 3.5.0 | 5.5.6 / 10.1.8 / 3.9.9 | same | Low; note `eslint-config-prettier` and `source-map-support`, `ts-loader`, `@swc/*` are not referenced by code/config |
| @swc/cli / @swc/core | 0.6.0 / 1.10.15 | 0.6.0 / 1.16.13 | 0.8.1 / 1.16.13 | Unused (no swc builder); `@swc/cli` carries critical/high dev advisories -> remove |
| cpy-cli | 5.0.0 | 5.0.0 | 7.0.0 | high (via cpy/globby, dev); removable (DX-25) |
| @types/node | 22.13.1 | 22.20.5 | 26.6.4 | Aligned with Node 22, not with Docker's Node 20 (DX-09) |

---

## (e) Proposed CI workflows (sketches, not executed)

### Backend: `.github/workflows/ci.yml`

```yaml
name: ci
on:
  pull_request:
  push: { branches: [main] }
concurrency: { group: "ci-${{ github.ref }}", cancel-in-progress: true }
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/blog_test   # needed by prisma validate/generate only
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci                      # plain npm ci works here (verified)
      - run: npx prisma validate && npx prisma generate
      - run: npx tsc --noEmit -p tsconfig.json
      - run: npx eslint "{src,test}/**/*.ts"        # NOT `npm run lint` (it uses --fix); also covers prettier
      - run: npx jest --ci --coverage
      - run: npm run build
  migrations:                            # real-DB check; replaces `npm run test:db` + docker-compose.db.yml
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_PASSWORD: postgres, POSTGRES_DB: blog_test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres" --health-interval 5s --health-retries 10
    env: { DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/blog_test" }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code   # schema/migration drift
  docker:
    needs: verify
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with: { context: ., push: false, cache-from: "type=gha", cache-to: "type=gha,mode=max" }
```
Prerequisite: DX-02 (otherwise `verify` is red on day one). Make `eslint` non-blocking (`continue-on-error: true`) for the first week if the cleanup is staged.

### Frontend: `.github/workflows/ci.yml`

```yaml
name: ci
on:
  pull_request:
  push: { branches: [main] }
concurrency: { group: "ci-${{ github.ref }}", cancel-in-progress: true }
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      NEXT_TELEMETRY_DISABLED: "1"
      NEXT_PUBLIC_API_URL: https://api.technoespacio.com/api/v1
      NEXT_PUBLIC_SITE_URL: https://technoespacio.com
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: ci-dummy
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci --legacy-peer-deps   # required today (ERESOLVE); drop after DX-07 or commit .npmrc
      - run: npx tsc --noEmit
      - run: npx next lint               # 0 errors / 3 warnings today; switch to `eslint .` before Next 16
      - run: npx vitest run              # NOT `npm test` (watch mode)
      - uses: actions/cache@v4
        with:
          path: .next/cache
          key: next-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
      - run: npx next build
```
Vercel preview deployments stay automatic; make `verify` a required check next to the Vercel one. The repo is public, so Actions minutes are free.

### Dependabot (both repos): `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
    groups:
      minor-and-patch: { update-types: [minor, patch] }
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: monthly }
  - package-ecosystem: docker      # backend only
    directory: /
    schedule: { interval: monthly }
```

---

## (f) Strengths (verified)

- **Backend compiles and builds clean** (`tsc` exit 0, `nest build` exit 0); `lockfileVersion 3` committed; plain `npm ci` and `prisma validate` work; 13 timestamped Prisma migrations + `migration_lock.toml`.
- **Disciplined server logging**: `grep -rn "console\." src` (non-spec) -> 0; 17 `new Logger(...)` instances, 51 `logger.*` calls.
- **Sensible runtime hardening in the API**: `helmet()`, global `ValidationPipe({whitelist, forbidNonWhitelisted, transform})`, global `ThrottlerGuard`, per-route `@Throttle`, reCAPTCHA guard, Swagger only when not production, CORS allow-list.
- **Dockerfile basics are right**: multi-stage, dependency-layer caching (`COPY package*.json` before `COPY . .`), non-root `nestjs` user (uid 1001), `.dockerignore` excludes `.env`, `node_modules`, `.git`, reports; compose uses `depends_on: service_healthy`, Postgres is not published to the host, healthchecks defined, named volume for data.
- **Frontend is green locally**: `tsc` strict clean, `next lint` 0 errors, `next build` succeeds (29 pages), Vitest 48/48 in 3 s.
- **Frontend security headers** in `next.config.mjs` (HSTS preload, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`), `images.remotePatterns` limited to 3 hosts, `.env*` ignored, `sitemap.ts`/`robots.ts` present, typed logger wrapper with env-driven level (`lib/logger.ts`) and a test for it.
- **Frontend hosting is wired**: Vercel Production + Preview deployments created by `vercel[bot]`, `Vercel Preview Comments` check green, `@vercel/analytics`, `@vercel/speed-insights` and GA4 loaded in `app/layout.tsx:86-88`; `@vercel/*` packages are current (not in `npm outdated`).
- **Small, tidy repositories**: `.git` 2.9 MB (front); no vendored binaries beyond `public/`; clear folder layout (`app/`, `components/`, `hooks/`, `lib/`; Nest modules per feature).
- **Operational scripts exist** for storage migration/verification (`scripts/r2-*.js`, `smoke:r2`), showing a smoke-test culture that CI can reuse.

---

## Method and caveats

- Backend `tsc`/`nest build` results come from the coordinator's `back-checks2.log` (complete, but ESLint/Jest output there is `tail`-truncated); ESLint and Jest were re-run here with JSON output to scratchpad (`b-eslint.json`, `b-jest.json`) and a coverage run into `b-cov/`. `jest` was never run with `--outputFile` inside the repo, so the committed `jest-results.json` is untouched.
- Frontend checks were run in a scratch copy; the front `front-checks2.log` produced by the coordinator matches (tsc 0, lint 3 warnings, vitest 48/48, build OK).
- `npm ci` was only run with `--dry-run` (both repos) so `node_modules` stayed intact; the prod-only size (170 MB) was measured in a scratch directory with `--ignore-scripts`.
- Not executed: Docker image build (no daemon: `docker info` -> cannot connect to `/var/run/docker.sock`), `pages:build`, backend e2e, `prisma migrate diff` in the CI sketch, the real `auth.controller.flow.spec.ts` (bcrypt binding missing in the sandbox).
- Which branch Coolify deploys, and how Vercel overrides the install command, cannot be seen from the repos or the GitHub API (Deployments API returned 403 for the private backend repo).
- Registry/audit data is as of 2026-10-04 from the sandbox npm proxy; advisory IDs are quoted as printed by `npm audit`.
