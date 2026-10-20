# Deploy & Infra — Context (Decisões)

**Decisões do usuário (binding):**
- D-DEPLOY-01: público-alvo é **demo pública sem login** (não é produto com contas; auth UI não entra).
- D-DEPLOY-02: custo **zero**, subdomínio grátis (`*.onrender.com`), sem servidor para administrar.
- D-DEPLOY-03: **UI rápida em CDN**, API pode dormir (cold start aceito).
- D-DEPLOY-04: abordagem aprovada = Render Static Site + Render Web Service (free) + Neon (free), definidos em `render.yaml`.
- D-DEPLOY-05: **cadastro público desligado em produção** por flag (`AUTH_REGISTRATION_ENABLED=false`), mantendo o código.

**Decisões derivadas:**
- API base resolvida em **build time** via `environment.ts` (`/api`) e `environment.prod.ts` (URL do Render): sem runtime config nesta versão.
- `GET /api/health` não consulta o banco, para o healthcheck do Render não acordar o Neon.
- CORS por lista em `CORS_ORIGINS` (default `http://localhost:4200`); dev continua usando o proxy `/api` do `ng serve`.
- Banco: `prisma migrate deploy` no boot + seed idempotente (`upsert` das 3 V60) compilado em `dist/prisma/seed.js`.
- `DATABASE_URL` pooled (Neon) para a API; `DIRECT_URL` direto para migrações (campo `directUrl` no schema).
- Imagem Docker multi-stage `node:24-bookworm-slim` com `openssl`, usuário não-root, `prisma` e `@prisma/client` como dependências de runtime.
- `docker-compose.yml` local passa a construir a API pela mesma imagem (reprodução fiel de produção).
- UX de cold start: aviso após ~3 s e botão **Tentar novamente** nos estados de erro (sem timeout HTTP novo).
- Sem domínio próprio, staging, CI separado, rate limiting, backups, SMTP ou Android em produção nesta versão.
