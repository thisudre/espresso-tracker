# Backend Guias — Context (Decisões)

**Decisões do usuário (binding):**
- D1: Receitas saem do código e vêm da API.
- D2: Auth obrigatório para criar/editar (leitura pública).
- D3: Permitir criar e editar sim (CRUD completo por dono).
- D4: Stack NestJS + Postgres (Supabase/Neon) + Prisma, monorepo `/backend`, low-cost, começar do zero.
- D5: Stack anterior (NestJS recomendado, Postgres, ambos auth) confirmado em 2026-09-08.

**Decisões derivadas:**
- Seed das 3 V60 via Prisma seed (idênticas ao guide.model.ts).
- authorId: só dono edita/deleta; outros veem.
- Preferência: backend quando logado, LocalStorage fallback quando deslogado.
- Validação: class-validator + class-transformer no backend.
- JWT: access curto + refresh longo; Passport para local + Google.

**Decisões (2026-09-28, verificação da feature):**
- D-BE-API-01: campos de auth da API em inglês (`email`, `password`, `name`); UI continua PT-BR. Spec AC1 de register atualizado para refletir.
- D-BE-API-02: DTO de guide relaxado para seguir o AC GUIDE-API-04 — cliente não envia `fases[].id` (servidor gera `fase-N` por índice) e `descricao` é opcional (default `''`).
- D-BE-API-03: verificação das tasks 2/4/5 também via e2e automatizados (`backend/test/auth.e2e-spec.ts`, `backend/test/guides.e2e-spec.ts`), não só manual.
- Infra: dev server Angular usa proxy `/api` → `:3000` (`src/proxy.conf.json`); sem ele o frontend recebia `index.html` e quebrava com erro de parsing.
