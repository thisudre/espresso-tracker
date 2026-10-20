# Deploy & Infra — Design

## Arquitetura

```
visitante
   │
   ├─ https://espresso-tracker.onrender.com   (Render Static Site / CDN)
   │     └─ Angular bundle (dist/espresso-tracker/browser)
   │           └─ fetch https://espresso-tracker-api.onrender.com/api/...
   │
   └─ https://espresso-tracker-api.onrender.com  (Render Web Service, Docker, free)
         └─ NestJS :3000 → Prisma → Neon Postgres (free)
```

- Dois serviços no Render, um único `render.yaml` (Blueprint) na raiz.
- Sem CORS em dev (proxy `/api`); em produção CORS restrito à origem do Static Site.
- API dorme após 15 min sem tráfego; Neon suspende após 5 min. A UI não dorme (CDN).
- Auth existente permanece, mas sem UI de login e com cadastro desligado em produção.

## Variáveis de ambiente

| Variável | Onde | Exemplo | Observação |
| -------- | ---- | ------- | ---------- |
| `DATABASE_URL` | Render (secret) | `postgresql://u:p@ep-x-pooler.neon.tech/espresso?sslmode=require` | Neon pooled |
| `DIRECT_URL` | Render (secret) | `postgresql://u:p@ep-x.neon.tech/espresso?sslmode=require` | Neon direto (migrações) |
| `JWT_SECRET` | Render (gerado) | — | `generateValue: true` |
| `CORS_ORIGINS` | render.yaml | `https://espresso-tracker.onrender.com` | lista por vírgula |
| `AUTH_REGISTRATION_ENABLED` | render.yaml | `false` | ausente/`true` em dev |
| `PORT` | Render (padrão) | `3000` | Render injeta |
| `NODE_VERSION` | render.yaml (static) | `22` | build Angular |

Frontend: `src/environments/environment.ts` → `apiBase: '/api'`; `environment.prod.ts` → `apiBase: 'https://espresso-tracker-api.onrender.com/api'`, trocado por `fileReplacements` na configuração `production`.

## Estrutura de arquivos

```
render.yaml                          # blueprint: static site + web service + envs
backend/Dockerfile                   # imagem multi-stage da API
backend/docker/entrypoint.sh         # migrate deploy → seed → node dist/main.js
backend/.dockerignore
backend/prisma/schema.prisma         # + directUrl
backend/prisma/migrations/…          # migração inicial versionada
backend/src/prisma/seed.ts           # seed compilado pelo nest build
backend/src/main.ts                  # CORS por env
backend/src/app.controller.ts        # GET /api/health
backend/src/auth/auth.service.ts     # flag de cadastro
src/environments/environment*.ts     # apiBase
angular.json                         # fileReplacements (production)
src/app/core/api/guide-api.service.ts
src/app/core/auth/auth.service.ts
src/app/core/stores/guide.store.ts   # flag de cold start
src/app/features/**                  # hint de espera + retry
```

## Ordem de provisionamento

1. Neon: projeto `espresso-tracker`, região igual à do Render; copiar pooled + direct.
2. Commit do código/infra na `main`.
3. Render → New → Blueprint → repo → Apply; preencher `DATABASE_URL`/`DIRECT_URL`.
4. Primeiro deploy: logs devem mostrar migração aplicada e `Seeded 3 guides`.
5. Smoke: `/`, `/extract`, `/guides`, `/guides/v60-equilibrada`, rota inexistente, ≤480 px,
   `curl /api/health`, `curl /api/guides`, `POST /api/auth/register` → 403.

## Operação e limites (free tier)

- Render web: 512 MB / 0,1 CPU, 750 h/mês, dorme em 15 min, acorda em ~1 min; 5 GB de banda/mês;
  rollback para os 2 deploys anteriores.
- Render static: CDN, sem horas de instância, mesmo limite de banda do workspace.
- Neon: 1 GB, 100 CU-horas/projeto, suspende em 5 min; sem backup/PITR no free.
- Sem uptime pinger (manteria a API acordada e consumiria as horas).
