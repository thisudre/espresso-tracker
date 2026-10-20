# Roadmap

**Current Milestone:** M10 - Deploy & Infra (EXECUTED — demo público no Render + Neon)

---

## M1 - Fundação da Aplicação

**Goal:** Base Angular 21 standalone, estado com Signals, persistência em LocalStorage e shell de navegação responsivo.
**Target:** Semana 1

### Features

**[App Shell + Infrastructure]** - DESIGNED (design.md em `.specs/features/app-shell/`)

- Projeto Angular 21 com Standalone Components (sem NgModules)
- Serviço de storage dedicado (LocalStorage) com interface para migração futura
- Estado global com Signals (`signal()`, `computed()`, `effect()`)
- Layout responsivo mobile-first, rotas para os 3 módulos

---

## M2 - Gestão de Inventário de Grãos

**Goal:** Cadastrar, editar e monitorar grãos com status do pacote e degass window.
**Target:** Semana 1-2

### Features

**[Bean Inventory CRUD]** - DESIGNED (design.md em `.specs/features/bean-inventory/`)

- Cadastro e edição (Marca/Torrefação, Origem, Variedade, Processo, Data de Torra, Notas Sensoriais)
- Status do pacote (Aberto, Fechado, Finalizado)
- Indicador visual de dias desde a torra (degass window ideal)
- Listagem e exclusão

---

## M3 - Painel de Extração (Brew Timer & Ratio Calculator)

**Goal:** Cronometrar extrações com fases e calcular automaticamente a proporção água/café.
**Target:** Semana 2-3

### Features

**[Extraction Panel]** - DESIGNED (design.md em `.specs/features/extraction-panel/`)

- Seletor de método (Espresso, Prensa Francesa, Coado/V60, Aeropress)
- Calculadora reativa de ratio (pó → água sugerida, ex: 1:15, 1:2)
- Cronômetro interativo com fases de pré-infusão e extração total

---

## M4 - Registro de Xícaras (Brew Logs)

**Goal:** Salvar receitas e avaliações sensoriais para evolução de parâmetros.
**Target:** Semana 3-4

### Features

**[Brew Logs]** - EXECUTED

- Salvar receita (método, dose, água, ratio, moagem, tempo total)
- Avaliação sensorial com estrelas (Acidez, Corpo, Doçura, Nota Geral)
- Campo de observações
- Histórico consultável vinculado ao grão e método (lista, filtros, detalhe)
- Origem via atalho do painel M3 (pré-preenchido) ou formulário manual

---

## M5 - Polimento & V1 Release

**Goal:** UAT, ajustes finos e fechamento do escopo de 30 dias.
**Target:** Semana 4

### Features

**[V1 Hardening]** - EXECUTED

- Revisão responsiva em dispositivos móveis (bancada)
- Validação de campos e edge cases
- Testes da suíte e correções

---

## M6 - Guias de Extração

**Goal:** Receitas passo a passo por método, consultáveis na biblioteca e capazes de dirigir o cronômetro do painel.
**Target:** Pós-v1

### Features

**[Extraction Guides]** - EXECUTED

- Biblioteca `/guides` com receitas de Coado/V60 (Equilibrada, Intensa, Suave) e fases com volume acumulado + tempo cumulativo
- Receita selecionada dirige o cronômetro do painel (fases = fases da receita, avanço automático/manual, modo simples)
- Volumes escalam pela dose (base 20g, tempos fixos)
- Preferência de receita persistida (StorageService)

---

## M7 - Simplificação do App

**Goal:** App enxuto em torno do fluxo principal de extração (receitas → cronômetro → grãos).
**Target:** Pós-M6

### Features

**[Simplificação M7]** - EXECUTED

- Remoção das telas de beans/logs; navegação com 3 itens (Dashboard, Receitas, Extração)
- Dashboard simplificado (estados vazios sem seed)

---

## M8 - Port Capacitor Android

**Goal:** Build Android em paridade com o M7 (sem código nativo próprio).
**Target:** Pós-M7

### Features

**[Capacitor Android]** - EXECUTED

- Projeto Capacitor gerado e dependências instaladas
- Paridade com M7; sem plugin nativo (rede/offline segue web)

---

## M9 - Backend para Receitas

**Goal:** API persistente (auth + guias) consumida pelo frontend, substituindo o conteúdo estático de receitas.
**Target:** Pós-M7

### Features

**[Backend Guias]** - EXECUTED (6/7 tasks)

- Task 1 - scaffold NestJS + Prisma + Postgres (docker-compose) ✅
- Task 2 - auth JWT (register/login/refresh/me) + e2e ✅
- Task 3 - Google OAuth (rotas prontas; **bloqueado** por credenciais reais `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`) ⚠️
- Task 4 - CRUD de guias com ownership + seed das 3 receitas V60 + e2e ✅
- Task 5 - preferências de receita via `GET/PATCH /me/preferences` + e2e ✅
- Task 6 - frontend consome API (`GuideApiService`, `AuthService`, interceptor) ✅
- Task 7 - `RECIPES` estático removido; loading/erro/vazio nas páginas ✅

---

## M10 - Deploy & Infra

**Goal:** Publicar uma demo pública sem login com custo zero, deploy reproduzível e operação mínima.
**Target:** Pós-M9

### Features

**[Deploy & Infra]** - EXECUTED (`.specs/features/deploy-infra/`)

- UI Angular em Render Static Site (CDN, SPA fallback)
- API NestJS em Render Web Service free (Docker, healthcheck, cold start tratado)
- Postgres gerenciado no Neon free (`DATABASE_URL` pooled + `DIRECT_URL`)
- Migração inicial + seed idempotente no boot do container
- API base por environment no frontend; CORS restrito; cadastro público desligado
- Blueprint `render.yaml` + documentação de provisionamento/smoke/rollback

---

## Future Considerations

- Migração de LocalStorage para API/Firebase
- Gráficos de evolução sensorial por grão/método
- Múltiplos perfis de usuário
- Export de logs (CSV/JSON)
- Receitas editáveis pelo usuário (pós-M6)
- Receitas para outros métodos / método Chemex (pós-M6)
