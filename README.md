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
