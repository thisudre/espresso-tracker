# Tasks — Backend Guias

| # | Task | Req | Verificação | Status |
|---|------|-----|-------------|--------|
| 1 | Scaffold NestJS em `/backend` + Prisma + docker-compose + .env | GUIDE-API-03 | `npm --prefix backend run start` sobe | **Done** — `prisma db push` + seed OK, API sobe em :3000 |
| 2 | Auth email/senha + JWT + refresh + GET /me | AUTH-01,02,03,05 | testes e2e 201/401/200 | **Done** — `test/auth.e2e-spec.ts` (10 e2e: register 201/409/400, login 201/401, /me 200/401, refresh 201/401) |
| 3 | Google OAuth (Passport) | AUTH-04 | callback retorna JWT | **Blocked (credenciais)** — boot corrigido sem credenciais; fluxo real requer `GOOGLE_CLIENT_ID/SECRET` |
| 4 | CRUD Guides (public GET, auth POST/PATCH/DELETE + ownership) + seed 3 V60 | GUIDE-API-01..06 | e2e 200/201/403/404 | **Done** — `test/guides.e2e-spec.ts` (14 e2e: GET 200/404, POST 201/401/400, PATCH 200/403, DELETE 403/200, GET pós-delete 404) |
| 5 | Preferências `PATCH /me/preferences` | PREF-01 | e2e | **Done (implementado agora)** — rotas novas + 4 e2e (401, GET 200 null, PATCH 200 set, PATCH 200 clear) |
| 6 | Frontend GuideApiService + GuideStore via API + AuthService/Interceptor | FE-01 | `npm test` + navegação /guides via API | **Done** — 112/112 tests; `/guides` e `/extract` renderizam as 3 receitas da API via proxy |
| 7 | Remover RECIPES estático, ajustar guides/extract pages para loading/erro | FE-01 | build OK, sem import RECIPES | **Done** — build OK, lint OK, 0 imports de `RECIPES` em `src/` |

**Suíte final:** frontend 112/112 + backend 1 unit + 25 e2e = tudo verde; lint frontend OK, lint backend 0 errors, `nest build` OK.

## Correções feitas durante a verificação (2026-09-28)

- `google.strategy.ts`: `??` → `||` (string vazia em `GOOGLE_CLIENT_ID` derrubava o boot: *OAuth2Strategy requires a clientID option*).
- `auth.module.ts`/`guides.module.ts`: `PassportModule.register({ defaultStrategy: 'jwt' })` — `@nestjs/passport` 12 exige o token `AuthModuleOptions` para os guards de GUIDES/AUTH (DI error no boot).
- **Task 5 não existia** (rota 404): criado `PreferencesDto`, `AuthService.getPreferences/updatePreferences` e rotas `GET/PATCH api/me/preferences` no `MeController`.
- Dev server sem proxy: criado `src/proxy.conf.json` (`/api` → `:3000`) + `proxyConfig` em `angular.json` — sem isso o frontend recebia `index.html` e falhava com erro de parsing.

## Pontos abertos

1. **Google OAuth (task 3)**: requer `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` reais para testar o fluxo de callback — bloqueio de credenciais, não de código.
2. ~~Nomes de campos do register~~ → resolvido (D-BE-API-01): `email/password/name`.
3. ~~DTO de guide mais estrito que o AC~~ → resolvido (D-BE-API-02): id gerado, `descricao` opcional.
4. ~~e2e automatizados~~ → resolvidos: 25 e2e (`auth`, `guides` + preferências).

## Notas da task 7 (2026-09-28)

- `guide.model.ts` ficou só com tipos (`GuideMethod`, `RecipePhase`, `ExtractionRecipe`); `RECIPES`/`RECIPES_BY_ID` removidos.
- `guide.util.spec.ts` usa fixtures locais; `guide.store.spec.ts`/`extraction.store.spec.ts` mockam `GuideApiService`/`AuthService` e seedam `TEST_RECIPES` (novo `src/app/core/testing/guide-fixtures.ts`).
- `GuideStore.restorePreference()` não dispara mais `api.list()` redundante.
- `ExtractPage` carrega receitas via `GuideStore.load()` e entra no modo receita via `effect()` quando a preferência resolve depois do carregamento assíncrono (guard: timer idle + método compatível).
- Estados de loading/erro/vazio renderizados em `RecipeSelector`, `GuidesPage` e `GuideDetailPage` (erro em `--color-terracota`).
