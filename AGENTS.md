# AGENTS.md

## Project state

Milestones M1–M10 concluídos. Frontend **Angular 22** standalone/signals em `src/`; backend **NestJS 12 + Prisma + PostgreSQL** em `backend/`; deploy de produção como **demo público sem login**: UI no Render Static Site (`https://espresso-tracker.onrender.com`), API no Render Web Service (`https://espresso-tracker-api.onrender.com`) e Postgres no Neon. Cadastro público desligado em produção (`AUTH_REGISTRATION_ENABLED=false`); Google OAuth segue bloqueado por credenciais.

## Source of truth

- `.specs/project/PROJECT.md` — vision, tech stack, scope, out-of-scope
- `.specs/project/ROADMAP.md` — milestones M1–M10 (current: M10 — Deploy & Infra, executado)
- `.specs/project/STATE.md` — binding decisions (AD-001..017), todos, deferred ideas; reflects current work
- `.specs/features/<feature>/spec.md` + `context.md` (+ `design.md`/`tasks.md` onde existir) — requirements e decisões por feature
- `Espresso & Bean Tracker` — product vision overview
- `DESIGN.md` — UI design system reference (colors, typography, tokens, components); consult it before any UI work

Read STATE.md before starting work. Decisions recorded in specs/context are binding; propose a new AD in STATE.md rather than re-litigating settled choices.

## Language

All specs, UI copy, and acceptance criteria are **Brazilian Portuguese (PT-BR)** — write UI labels and domain strings in PT-BR (grãos, extração, torra, xícara).

## Hard technical constraints (AD-002, binding for all code)

- Angular 22 (AD-002 fixou Angular 21 + signals; a stack foi atualizada para 22 na M9), **Standalone Components only — no NgModules**
- State is **100% Signals** (`signal()`/`computed()`/`effect()`); use `@if`/`@for`/`@switch` control flow, no NgZone patterns
- All persistence goes through a dedicated generic `StorageService` (`get<T>`/`set<T>`/`remove<T>`); stores never access LocalStorage directly. Payloads carry a `version` schema field; incompatible version or corrupt JSON returns `null`, never throws
- Dados de guias vêm da API (`GuideApiService`); `StorageService` fica só para preferências locais e dados anônimos

## Deploy (M10)

- `render.yaml` (Blueprint) define o Static Site e o Web Service; `git push` na `main` deploya os dois.
- API: `backend/Dockerfile` multi-stage + `backend/docker/entrypoint.sh` (`prisma migrate deploy` → seed → Nest). Healthcheck em `/api/health` (não toca no banco).
- Angular usa `src/environments/environment.ts` (`/api`) e `environment.prod.ts` (URL do Render); produção troca via `fileReplacements` no `angular.json`.
- CORS restrito por `CORS_ORIGINS`; dev usa proxy `/api` → `:3000` (`src/proxy.conf.json`).
- Segredos (`DATABASE_URL` pooled, `DIRECT_URL`, `JWT_SECRET`) só em env — nunca commitar `.env`. Migrações novas: `prisma migrate dev` e commit da pasta `migrations/`.

## Settled product decisions (do not change without a new AD)

- Routes: `''` dashboard, `/extract`, `/guides`, `/guides/:id`, friendly 404 (beans/logs removidos na M7)
- Guias vêm da API (seed de 3 V60); não há login UI no app — demo público anônimo, com preferência local
- Produção é demo gratuita: API pode dormir (cold start tratado na UI); sem domínio próprio, staging, rate limiting ou backups

## Workflow

Spec-driven: specify → design → tasks → execute, with requirement traceability. Always read `DESIGN.md` before any UI work (components, forms, screens, navigation) and follow its tokens and conventions. Verify service logic (storage, stores, cálculos) com testes unitários (Vitest); fluxos de UI (rotas, 404, mobile ≤480px, estados de loading/erro) por navegação manual. Tooling: Angular CLI 22, Vitest (`npm test`), ESLint (`npm run lint`); backend com oxlint e e2e (Vitest + supertest).
