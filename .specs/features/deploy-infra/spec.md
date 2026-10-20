# Deploy & Infra — Specification

**Milestone:** M10 — Deploy em Produção (demo público)
**Status:** Executed — código validado localmente; provisionamento (Neon + Blueprint) pendente
**Depende de:** M9 (API NestJS + Prisma + Postgres consumida pelo frontend)

## Problem Statement
O app só roda localmente (`ng serve` + API em `:3000` + Postgres em Docker). Não há imagem da API, migrações versionadas, URL de API configurável, CORS, healthcheck nem blueprint de deploy. Precisamos publicar uma **demo pública sem login**, com UI servida por CDN e custo zero, para que o projeto possa ser acessado e compartilhado por link.

## Goals
- [ ] UI Angular publicada em CDN (Render Static Site) com SPA fallback — *código/blueprint prontos; publicação pendente*
- [ ] API NestJS publicada em container free (Render Web Service) conectada a Postgres gerenciado (Neon free) — *imagem validada; publicação pendente*
- [x] Deploy reproduzível por `render.yaml` (infra como código) a partir de `git push` na `main`
- [x] Banco versionado (migração inicial) e seed idempotente aplicados no boot
- [x] Frontend aponta para a API de produção e trata o cold start do free tier
- [x] Cadastro público desligado em produção

## Out of Scope
| Item | Reason |
| ---- | ------ |
| Domínio próprio / TLS customizado | Usuário aceitou subdomínio grátis (`*.onrender.com`) |
| Staging / preview environment | v1 do deploy é só produção |
| CI separado (GitHub Actions) | Auto-deploy do Render cobre build + deploy |
| Rate limiting / WAF | Demo pública, cadastro desligado; adiado |
| Login UI / Google OAuth | Sem usuários no demo (M9 task 3 segue bloqueada por credenciais) |
| Backups / PITR | Dados são 3 receitas semeadas; descartáveis |
| App Android apontando para produção | Escopo é a demo web |
| Domínio de e-mail / SMTP | Não há fluxo de e-mail |

## User Stories

### P1: Demo pública acessível por link ⭐ MVP
**Como** visitante, **quero** abrir a URL pública e usar guias + painel de extração sem login.
- **AC1:** `GET https://<static-site>/` SHALL servir o bundle Angular; rotas `/extract`, `/guides`, `/guides/:id` e rota inexistente SHALL resolver via SPA fallback (sem 404 do host).
- **AC2:** A UI SHALL chamar a API pela URL pública configurada no build (`/api` em dev, URL do Render em produção).
- **AC3:** `GET /api/guides` e `/api/guides/:id` SHALL responderem em produção com as 3 receitas semeadas; chamadas de escrita continuam exigindo JWT.
- **AC4:** O primeiro acesso após ociosidade SHALL exibir loading com aviso de que a API pode levar até ~1 min para acordar, e oferecer **Tentar novamente** em caso de erro.

### P1: Deploy reproduzível e operável ⭐ MVP
**Como** mantenedor, **quero** publicar e reverter por Git sem administrar servidor.
- **AC1:** O repositório SHALL conter `render.yaml` criando o Static Site e o Web Service (Docker) com healthcheck em `/api/health`.
- **AC2:** `backend/Dockerfile` SHALL construir a API para produção (multi-stage, não-root) e o entrypoint SHALL aplicar migrações, rodar o seed idempotente e subir o Nest.
- **AC3:** O Postgres SHALL ser externo (Neon), configurado por `DATABASE_URL` (pooled) e `DIRECT_URL` (direto, usado por migrações), nunca versionados.
- **AC4:** `GET /api/health` SHALL responder `{ status: 'ok', uptime }` sem consultar o banco.
- **AC5:** CORS SHALL aceitar apenas as origens listadas em `CORS_ORIGINS` (default `http://localhost:4200`).

### P1: Superfície pública reduzida ⭐ MVP
**Como** mantenedor, **quero** evitar que o demo público seja usado como API aberta de cadastro.
- **AC1:** Com `AUTH_REGISTRATION_ENABLED=false`, `POST /api/auth/register` SHALL retornar 403 sem criar usuário.
- **AC2:** Com a variável ausente ou `true` (dev/e2e), o cadastro SHALL continuar funcionando como hoje.

## Edge Cases
- WHEN a API está dormindo THEN a UI permanece navegável e exibe mensagem de espera; erro permite retry sem recarregar a página.
- WHEN `DATABASE_URL`/`DIRECT_URL` estão ausentes THEN o boot SHALL falhar explicitamente nos logs (não servir API sem banco).
- WHEN a migração falha THEN o container SHALL não subir a API (falha rápida), preservando o estado do banco.
- WHEN o seed roda novamente THEN o upsert das 3 receitas SHALL permanecer idempotente.
- WHEN o host estático recebe uma rota desconhecida THEN o rewrite SHALL entregar `index.html` e o Angular exibir a página 404.
- WHEN a origem do frontend não está em `CORS_ORIGINS` THEN o preflight SHALL ser negado (sem liberar `*`).

## Requirement Traceability
| ID | Story | Status |
| -- | ----- | ------ |
| DEPLOY-01 | P1 static site + SPA fallback | Código/blueprint prontos — publicação pendente |
| DEPLOY-02 | P1 API em container | Imagem validada — publicação pendente |
| DEPLOY-03 | P1 Postgres Neon | Configurado por env — provisionamento pendente |
| DEPLOY-04 | P1 CORS restrito | Done |
| DEPLOY-05 | P1 healthcheck | Done |
| DEPLOY-06 | P1 API base no frontend | Done |
| DEPLOY-07 | P1 migrações + seed no boot | Done |
| DEPLOY-08 | P1 cadastro desligado | Done |
| DEPLOY-09 | P1 UX de cold start | Done |
| DEPLOY-10 | P1 blueprint + documentação | Done |
| DEPLOY-11 | P1 verificação local e smoke | Done |

## Success Criteria
- [ ] URL pública abre a UI e as 3 receitas carregam da API (com cold start tratado). — *aguarda provisionamento*
- [x] `git push` na `main` dispara deploy dos dois serviços; rollback pelos 2 deploys anteriores funciona. — *blueprint pronto; comportamento do Render documentado*
- [x] `docker compose up --build` reproduz API + Postgres localmente. — *imagem e entrypoint validados contra banco limpo; compose config válido*
- [x] Suítes verdes: frontend 118, backend 1 unit + 27 e2e (incluindo health e cadastro desligado); lint e build OK.
