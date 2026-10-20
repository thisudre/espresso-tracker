# ☕ Espresso & Bean Tracker

Aplicação web reativa para entusiastas de café especial registrarem, acompanharem e aprimorarem suas extrações (espressos e filtrados) e o histórico dos grãos utilizados.

## Funcionalidades

- **Inventário de Grãos** (`/beans`) — cadastro e edição de grãos (marca, origem, variedade, processo, data de torra e notas sensoriais), status do pacote (Aberto/Fechado/Finalizado) via seletor rápido e indicador visual da janela de degass (3–14 dias) com badge colorido.
- **Painel de Extração** (`/extract`) — cronômetro interativo com fase de pré-infusão, seletor de método (Espresso, Prensa Francesa, Coado/V60, Aeropress) e calculadora reativa de brew ratio (pó → água sugerida).
- **Registro de Xícaras** (`/logs`) — salvamento de receitas (método, dose, água, ratio, moagem e tempo), avaliação sensorial em estrelas (Acidez, Corpo, Doçura e Nota Geral), observações, filtros por grão/método e tela de detalhe.

## Stack

- **Angular 21** com Standalone Components (sem NgModules)
- **100% Signals** (`signal()`, `computed()`, `effect()`) e control flow `@if`/`@for`/`@switch`
- **TypeScript**, zoneless (`provideZonelessChangeDetection`)
- **LocalStorage** via `StorageService` genérico com payload versionado (migração futura para API/Firebase)
- **SCSS** responsivo mobile-first (bottom nav em telas ≤480px)
- **Vitest** como test runner e **ESLint** com `angular-eslint`

## Arquitetura

```
Componente → Store (Signals) → StorageService → LocalStorage
```

- `StorageService` genérico (`get<T>`/`set<T>`/`remove<T>`) com envelope `{ version, data }`; dados incompatíveis ou JSON corrompido retornam `null`, nunca lançam erro.
- `BaseStore<T>` abstrato com `items = signal<T[]>` e persistência explícita.
- Lógica de domínio em funções puras unit-testáveis: `degass.util.ts`, `brew-ratio.util.ts`, `timer.util.ts`, `brew-log.util.ts`, `validators.util.ts`.
- Rotas lazy (`loadComponent`) com 404 amigável.

## Como rodar

Pré-requisito: Node.js e npm.

```bash
npm install
npm start        # servidor de desenvolvimento em http://localhost:4200/
```

Com a API local (guias):

```bash
npm --prefix backend install
cp backend/.env.example backend/.env   # DATABASE_URL local + DIRECT_URL + JWT_SECRET
docker compose up -d postgres          # Postgres em :5432
npm --prefix backend run start:dev     # API em :3000 (proxy /api do ng serve)
npm start                              # frontend em :4200
```

Ou tudo em containers (reproduz produção):

```bash
docker compose up --build
```

> Se o banco local foi criado antigamente com `prisma db push`, faça o baseline das migrações uma vez:
> `cd backend && npx prisma migrate resolve --applied 20261020130000_init`

## Deploy em produção (demo)

Custo zero: UI no **Render Static Site** (CDN), API no **Render Web Service** (Docker, free) e Postgres no **Neon** (free). O blueprint [render.yaml](render.yaml) cria os dois serviços do Render.

- UI: https://espresso-tracker.onrender.com
- API: https://espresso-tracker-api.onrender.com (`/api/health`)

### Provisionamento (uma vez)

1. Criar o projeto `espresso-tracker` no Neon, na mesma região do Render (sugestão: Virginia), e copiar as connection strings **pooled** e **direct**.
2. Render → **New → Blueprint** → repo `thisudre/espresso-tracker` → branch `main` → **Apply**.
3. Preencher `DATABASE_URL` (pooled) e `DIRECT_URL` (direct) quando o Render solicitar (`JWT_SECRET` é gerado).
4. Nos logs do primeiro deploy, confirmar a migração `20261020130000_init` aplicada e `Seeded 3 guides`.
5. Smoke: `/`, `/extract`, `/guides`, `/guides/v60-equilibrada`, uma rota inexistente, layout ≤480 px e `curl <api>/api/health`.

### Operação

- A API dorme após 15 min sem tráfego e acorda em ~1 min; a UI mostra "Acordando a API…" e oferece **Tentar novamente**.
- Se a primeira query falhar ao acordar o Neon (timeout de conexão), acrescente `&connect_timeout=15` ao final da `DATABASE_URL` (e da `DIRECT_URL`).
- `AUTH_REGISTRATION_ENABLED=false` desliga o cadastro público em produção.
- `git push` na `main` dispara o deploy dos dois serviços. Rollback: dashboard do Render (2 deploys anteriores).
- Segredos (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`) vivem só no Render/Neon — nunca commitar `.env`.


## Comandos

```bash
npm start        # servidor de desenvolvimento
npm run build    # build de produção em dist/
npm test         # testes unitários (Vitest)
npm run lint     # lint (ESLint + angular-eslint)
```

## Estrutura

```
src/app/
├── core/            # models, storage, stores, utils (lógica pura)
├── features/        # beans, extract, logs, dashboard, not-found
├── shared/          # nav, autocomplete-field, star-rating
└── styles.scss      # reset global
.specs/              # especificações e decisões do projeto
```

## Documentação

- `AGENTS.md` — convenções e constraints do projeto
- `DESIGN.md` — design system (tokens, paleta, tipografia)
- `.specs/project/` — visão (`PROJECT.md`), roadmap (`ROADMAP.md`) e decisões (`STATE.md`)
- `.specs/features/` — especificações e contextos por feature

## Roadmap

M1–M5 concluídos: fundação da app, inventário de grãos, painel de extração, registro de xícaras e polimento v1. Ideias adiadas (gráficos, migração para API, export de logs) estão em `STATE.md`.
