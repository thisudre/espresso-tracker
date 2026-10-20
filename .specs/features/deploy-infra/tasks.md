# Deploy & Infra — Tasks (M10)

> **For agentic workers:** execute as tasks na ordem. Cada task termina com verificação própria e um commit atômico. Steps em `- [ ]`.

**Goal:** publicar o app como demo público (UI em CDN, API free com cold start, Neon grátis) com deploy reproduzível por `render.yaml`.

**Architecture:** Render Static Site (Angular) + Render Web Service (NestJS/Docker) + Neon Postgres, um único `render.yaml`; API base resolvida em build time; migrações + seed no boot.

**Tech Stack:** Angular 22, NestJS 12, Prisma 6, PostgreSQL (Neon), Docker, Render Blueprint, Vitest.

**Spec:** `.specs/features/deploy-infra/spec.md` · **Design:** `.specs/features/deploy-infra/design.md`

## Global Constraints
- Standalone components + Signals (AD-002); sem NgModules/Zone.js.
- UI em PT-BR; textos de espera/erro em PT-BR.
- Segredos só em env (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`); nunca no repo.
- `AUTH_REGISTRATION_ENABLED` ausente/`true` mantém o comportamento atual (e2e existentes verdes).
- Custo zero: nada de recurso pago; nada de pinger de uptime.
- Suítes atuais devem continuar verdes (frontend 112+, backend 25 e2e) + lint/build.

## Review Focus
- **API base errada em produção:** `/api` relativo bate no Static Site e volta `index.html` → erro de parse JSON em vez de dados. Teste: URL gerada pelo `GuideApiService` contém `environment.apiBase`.
- **Migração em banco já existente:** volume local criado por `db push` faz `migrate deploy` falhar com "table already exists". Teste/verificação: compose com volume limpo aplica a migração; README documenta o reset único.
- **Seed não compilado:** mover `prisma/seed.ts` sem checar `dist/prisma/seed.js` gera crash loop no container. Teste/verificação: `npm run build` + `node dist/prisma/seed.js`.
- **Flag de cadastro:** se lida só no boot do módulo, o e2e não alterna. Teste: e2e seta a env, chama `POST /register` e espera 403.
- **Rewrite de SPA engolindo assets:** `/* → /index.html` pode servir HTML no lugar de `.js`. Verificação: smoke na URL pública carrega bundle e deep links.
- **CORS/PATCH autenticado:** preflight de `PATCH` com `Authorization` negado quebra preferências logadas. Verificação: `allowedHeaders` inclui `Content-Type` e `Authorization`.

---

| # | Task | Req | Verificação | Status |
|---|------|-----|-------------|--------|
| 1 | API base configurável no frontend | DEPLOY-06 | unit test de URL + build prod | **Done** — `guide-api.service.spec.ts`/`auth.service.spec.ts` (4 tests); bundle prod contém URL do Render |
| 2 | Backend de produção: CORS + health + flag de cadastro | DEPLOY-04,05,08 | e2e novos + suíte backend | **Done** — `app.e2e-spec` health 200; `auth.e2e-spec` register 403 com flag; 27 e2e |
| 3 | Banco versionado: migração inicial + directUrl + seed compilado | DEPLOY-07 | `migrate deploy` em banco limpo + seed | **Done** — `20261020130000_init` aplicada em DB limpo; `dist/prisma/seed.js` → `Seeded 3 guides` |
| 4 | Imagem Docker da API + entrypoint + compose | DEPLOY-02,07 | `docker compose up --build` sobe API | **Done** — build + container em DB limpo: migrate/seed/health/guides/CORS preflight OK |
| 5 | UX de cold start (aviso + retry) | DEPLOY-09 | navegação com API parada → retry | **Done** — `GuideStore.slow` (2 tests), `AsyncStateComponent` em guias/seletor/detalhe |
| 6 | Blueprint `render.yaml` + documentação | DEPLOY-01,03,10 | blueprint válido + README/AGENTS | **Done** — YAML válido; README/AGENTS/ROADMAP/STATE atualizados (AD-017) |
| 7 | Verificação final e smoke | DEPLOY-11 | suítes + lint + build + smoke | **Done** — frontend 118, backend 1+27; lint/build OK; smoke Playwright `/`, `/extract`, `/guides`, detalhe, 404 e 390×844 |

---

### Task 1: API base configurável (frontend)

**Files:** create `src/environments/environment.ts`, `src/environments/environment.prod.ts`; modify `angular.json`, `src/app/core/api/guide-api.service.ts`, `src/app/core/auth/auth.service.ts`; test `src/app/core/api/guide-api.service.spec.ts`.

**Interfaces:**
- Produces: `environment.apiBase: string` (`'/api'` em dev, URL absoluta em prod).
- Consumes: `GuideApiService.list()/getById()`, `AuthService.getPreferences()/updatePreferences()`.

- [x] **Step 1:** criar `environment.ts` com `export const environment = { production: false, apiBase: '/api' };` e `environment.prod.ts` com `apiBase: 'https://espresso-tracker-api.onrender.com/api'`.
- [x] **Step 2:** em `angular.json` → `configurations.production`, adicionar `fileReplacements` trocando `src/environments/environment.ts` por `environment.prod.ts`.
- [x] **Step 3:** escrever spec do `GuideApiService` com `HttpTestingController` esperando `GET /api/guides` e `GET /api/guides/abc` (ambiente de teste = dev).
- [x] **Step 4:** rodar `npm test -- --run src/app/core/api/guide-api.service.spec.ts`; esperar falha por URL montada sem `apiBase`.
- [x] **Step 5:** trocar os literais `'/api'` por `${environment.apiBase}` nos dois serviços; rodar o spec e esperar PASS.
- [x] **Step 6:** commit `feat(web): api base configurável por environment (dev /api, prod Render)`.

### Task 2: Backend de produção (CORS, health, flag)

**Files:** modify `backend/src/main.ts`, `backend/src/app.controller.ts`, `backend/src/auth/auth.service.ts`, `backend/.env.example`; test `backend/test/app.e2e-spec.ts`, `backend/test/auth.e2e-spec.ts`.

**Interfaces:**
- Produces: `GET /api/health` → `{ status: 'ok', uptime: number }`; CORS a partir de `CORS_ORIGINS`; `register()` lança `ForbiddenException` quando `AUTH_REGISTRATION_ENABLED === 'false'`.

- [x] **Step 1:** e2e de health (`GET /api/health` → 200 + `status: 'ok'`, sem banco) e de cadastro desligado (setar `process.env.AUTH_REGISTRATION_ENABLED='false'`, `POST /api/auth/register` → 403, restaurar env).
- [x] **Step 2:** rodar `npm --prefix backend run test:e2e`; esperar falha (404 no health / 201 no register).
- [x] **Step 3:** implementar health em `AppController`; `enableCors` em `main.ts` com origens, métodos e headers; guarda em `AuthService.register` lendo a env a cada chamada.
- [x] **Step 4:** adicionar `CORS_ORIGINS` e `AUTH_REGISTRATION_ENABLED` ao `.env.example`; rodar a suíte e2e → PASS.
- [x] **Step 5:** commit `feat(backend): health, CORS por env e cadastro desativável`.

### Task 3: Banco versionado e seed compilado

**Files:** modify `backend/prisma/schema.prisma` (`directUrl`), `backend/package.json` (seed path, deps de runtime), `backend/.env`, `backend/.env.example`; create `backend/prisma/migrations/20261020120000_init/migration.sql`, `migration_lock.toml`; move `backend/prisma/seed.ts` → `backend/src/prisma/seed.ts`.

- [x] **Step 1:** adicionar `directUrl = env("DIRECT_URL")` ao `datasource`; `DIRECT_URL` em `.env`/`.env.example`; mover `@prisma/client` e `prisma` para `dependencies`.
- [x] **Step 2:** gerar SQL inicial com `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` e gravar em `prisma/migrations/20261020120000_init/migration.sql` + lock com `provider = "postgresql"`.
- [x] **Step 3:** mover o seed para `src/prisma/seed.ts` (mesmo conteúdo upsert) e ajustar `prisma.seed` para `tsx src/prisma/seed.ts`.
- [x] **Step 4:** `npm --prefix backend run build` → confirmar `backend/dist/prisma/seed.js`; rodar `node dist/prisma/seed.js` contra o banco local → `Seeded 3 guides`.
- [x] **Step 5:** validar a migração em banco limpo (`docker compose down -v && up postgres`, `prisma migrate deploy`) → tabelas criadas; depois recriar o banco local e rodar os e2e.
- [x] **Step 6:** commit `feat(backend): migração inicial, directUrl e seed compilado`.

### Task 4: Imagem Docker da API

**Files:** create `backend/Dockerfile`, `backend/docker/entrypoint.sh`, `backend/.dockerignore`; modify `docker-compose.yml`.

- [x] **Step 1:** Dockerfile multi-stage `node:22-bookworm-slim` (deps → generate → build → runtime com `openssl`, deps prod, `dist`, `prisma/`, entrypoint; `USER node`; `EXPOSE 3000`).
- [x] **Step 2:** entrypoint `set -e`: `npx prisma migrate deploy` → `node dist/prisma/seed.js` → `exec node dist/main.js`.
- [x] **Step 3:** `.dockerignore` (node_modules, dist, .env, test) e compose usando `build: ./backend` com `env_file`.
- [x] **Step 4:** `docker compose build api` e `docker compose up -d api`; `curl localhost:3000/api/health` e `/api/guides` → 200.
- [x] **Step 5:** commit `chore(backend): Dockerfile multi-stage e entrypoint de produção`.

### Task 5: UX de cold start

**Files:** modify `src/app/core/stores/guide.store.ts` (+ spec), `src/app/features/guides/guides.page.ts`, `src/app/features/guides/guide-detail.page.ts`, `src/app/features/extract/recipe-selector.component.ts`.

**Interfaces:**
- Produces: `GuideStore.slow: Signal<boolean>` (true após 3 s de `load()` pendente, resetado em sucesso/erro).

- [x] **Step 1:** teste do store: com fake timers, `load()` pendente → `slow()` false, avança 3 s → true; resposta → false.
- [x] **Step 2:** implementar `slow` no `GuideStore` (timer limpo em `next`/`error`) e usar o texto "Acordando a API… pode levar até 1 min" nos três templates.
- [x] **Step 3:** botão **Tentar novamente** no estado de erro de `/guides`, `RecipeSelector` e detalhe (`store.load()` / nova chamada `getById`).
- [x] **Step 4:** `npm test` → PASS; commit `feat(web): aviso de cold start e retry nos guias`.

### Task 6: Blueprint e documentação

**Files:** create `render.yaml`; modify `README.md`, `AGENTS.md`, `.specs/project/ROADMAP.md`, `.specs/project/STATE.md`.

- [x] **Step 1:** `render.yaml` com web service Docker (`free`, `healthCheckPath: /api/health`, secrets `sync:false`, `JWT_SECRET` gerado, `CORS_ORIGINS`, `AUTH_REGISTRATION_ENABLED=false`) e static site (`NODE_VERSION=24`, build, `staticPublishPath`, rewrite SPA).
- [x] **Step 2:** README ganha "Deploy em produção" (pré-requisitos, Neon, blueprint, smoke, rollback); AGENTS ganha URL/limites e regra de não versionar segredos.
- [x] **Step 3:** ROADMAP ganha M10 e STATE ganha `AD-017` + todos.
- [x] **Step 4:** commit `docs(deploy): blueprint Render, README e decisões M10`.

### Task 7: Verificação final

- [x] **Step 1:** `npm test`, `npm run lint`, `npm run build` no root → verdes; inspecionar `main-*.js` contendo a URL da API do Render.
- [x] **Step 2:** `npm --prefix backend run test`, `test:e2e`, `lint`, `build` → verdes.
- [x] **Step 3:** validar a imagem contra banco **novo** (`espresso_docker_check`) → migração aplicada, `Seeded 3 guides`, health 200, 3 guias, `register` 403 (flag), PATCH preflight OK. Banco local preservado e baselined com `migrate resolve --applied` (documentado no README).
- [x] **Step 4:** smoke com `ng serve` via Playwright: `/`, `/extract`, `/guides`, `/guides/v60-equilibrada`, rota inexistente e viewport 390×844 sem overflow horizontal.
- [x] **Step 5:** atualizar a tabela de tasks com resultados e commit final `chore(deploy): verificação M10`.

---

## Resultados

**Commits:** `d5f9deb` (task 1) → `68e8906` (2) → `1e4cf3a` (3) → `d0073dd` (4) → `dc3d23e` (5) → `751dd24` (6).

**Verificação executada (2026-10-20):**
- Frontend: 118/118 tests, ESLint limpo, build de produção com a URL `espresso-tracker-api.onrender.com/api` no bundle.
- Backend: 1 unit + 27 e2e, oxlint 0 erros (1 warning pré-existente de `no-unused-vars`), `nest build` OK.
- Container: `node:24-bookworm-slim`, `prisma migrate deploy` + seed + boot validados em banco vazio; health/guides/preflight conferidos.
- Banco local: baseline aplicado (`migrate resolve --applied 20261020130000_init`), schema up to date e seed reaplicável.
- Smoke: rotas principais, detalhe de guia, 404 e mobile 390×844 renderizam sem overflow.

**Pendente (manual, fora do código):** criar projeto no Neon, aplicar o Blueprint no Render e informar `DATABASE_URL`/`DIRECT_URL`; depois rodar o smoke na URL pública (checklist no README).

