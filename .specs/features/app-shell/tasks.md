# App Shell + Infra (M1) — Tasks

**Design**: `.specs/features/app-shell/design.md`
**Spec**: `.specs/features/app-shell/spec.md`
**Status**: Draft

---

## Contexto de Execução

- Naming: o design assume `app.ts`, `*.page.ts`, `*.store.ts`, `storage.service.ts` (estilo 2025 do CLI). Se o `ng new` gerar sufixos `.component`, renomear para o padrão do design.
- Nota de domínio (AD-008): o dashboard M1 exibe **total de grãos** + empty states. O filtro "grãos abertos" (SHELL-19 no spec original) foi adiado para a M2 (depende do modelo de `status`, AD-004) — decisão confirmada pelo usuário.
- Commits: um por task, formato `feat(shell): <descrição>`.
- Design tokens: toda UI deve consumir os CSS custom properties de `styles.scss` (mapeamento do DESIGN.md), nunca valores hardcoded.

---

## Execution Plan

### Phase 1: Scaffold (Sequential)

```
T1 → T2
```

### Phase 2: Core Infra (Parallel)

```
T1 ──┬─→ T3 [P]  (design tokens → styles.scss)
     └─→ T4 [P]  (StorageService + spec)
```

### Phase 3: Store layer + UI (Parallel)

```
T4 ──→ T5 [P]  (store layer: models + BaseStore + BeanStore/LogStore + specs)
T3 ──┬─→ T6 [P]  (NavComponent top+bottom)
     └─→ T7 [P]  (pages placeholder + NotFound)
```

### Phase 4: Shell wiring (Sequential)

```
T6 ──┐
T7 ──┴─→ T8  (app.config rotas + AppComponent shell)
```

### Phase 5: Dashboard (Sequential)

```
T5 ──┐
T8 ──┴─→ T9  (DashboardPage)
```

### Phase 6: Validação (Sequential)

```
T9 → T10
```

---

## Diagram-Definition Cross-Check

| Task | Depends on (corpo) | Diagram mostra | Status |
| --- | --- | --- | --- |
| T1 | None | início do fluxo | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1 | T1 → T3 | ✅ |
| T4 | T1 | T1 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T1, T3 | T3 → T6 | ✅ |
| T7 | T1, T3 | T3 → T7 | ✅ |
| T8 | T6, T7 | T6, T7 → T8 | ✅ |
| T9 | T5, T8 | T5, T8 → T9 | ✅ |
| T10 | T9 | T9 → T10 | ✅ |

---

## Task Breakdown

### T1: Scaffold Angular 21 (standalone + zoneless + Vitest + SCSS)

**What**: Criar o projeto Angular 21 com `ng new` usando os defaults (Standalone Components, zoneless `provideZonelessChangeDetection`, Vitest via `@angular/build:unit-test`, SCSS, sem SSR/PWA). Shell inicial (AppComponent default) compila e roda.
**Where**: raiz do repo
**Depends on**: None
**Reuses**: AD-002, AD-008 (stack concreta no design)
**Requirement**: SHELL-01, SHELL-02, SHELL-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `ng new` executado com SCSS e os defaults do Angular 21 (standalone/zoneless/Vitest)
- [ ] `ng build` compila sem erros
- [ ] `ng test` roda o spec default e passa
- [ ] `rg "NgModule" src/app` → nenhum match (SHELL-03)

**Tests**: none
**Gate**: build

**Verify**:
- `ng build` → compila
- `ng test` → 1+ teste verde
- `ng serve` → shell default renderiza na raiz

**Commit**: `feat(shell): scaffold Angular 21 standalone`

---

### T2: Lint com angular-eslint 21

**What**: Adicionar lint com `ng add @angular-eslint/schematics` (v21), gerando `eslint.config.ts` via `defineConfig` (flat config). `ng lint` roda limpo no scaffold.
**Where**: raiz do repo (`eslint.config.ts`)
**Depends on**: T1
**Reuses**: AD-008 (angular-eslint v21)
**Requirement**: SHELL-03, SHELL-04

**Done when**:
- [ ] `eslint.config.ts` criado via `defineConfig` (flat config, sem `.eslintrc`)
- [ ] `ng lint` exit 0 sem erros no código gerado pelo CLI

**Tests**: none
**Gate**: lint

**Verify**:
- `ng lint` → limpo

**Commit**: `chore(shell): setup angular-eslint 21`

---

### T3: Design tokens → styles.scss [P]

**What**: Criar `src/styles.scss` global: CSS custom properties mapeando todos os tokens do DESIGN.md (cores, tipografia, radius, spacing, tokens de componente), import da fonte JetBrains Mono (Google Fonts) + stack fallback monospace, e resets (body em `cream`, texto espresso, sem margens default).
**Where**: `src/styles.scss`
**Depends on**: T1
**Reuses**: DESIGN.md (AD-006) — mapear `{colors.*}`, `{typography.*}`, `{rounded.*}`, `{spacing.*}`
**Requirement**: — (base para SHELL-18/19/20)

**Done when**:
- [ ] Variáveis CSS para a paleta completa (espresso, cream, latte, caramel-cream, cocoa, coffee-mute, ash, hairline, hairline-strong, verde-erva, amber-caramelo, terracota)
- [ ] Body global em cream com font-stack `'Berkeley Mono', 'JetBrains Mono', ui-monospace, ...`
- [ ] `ng build` compila sem erros

**Tests**: none
**Gate**: build

**Verify**:
- `ng build` → ok
- Inspeção visual: AppComponent default já renderiza em monospace sobre cream

**Commit**: `feat(shell): design tokens no styles.scss`

---

### T4: StorageService genérico com schema versionado [P]

**What**: Criar `StorageService` em `src/app/core/storage/storage.service.ts` (`providedIn: 'root'`): `get<T>(key): T | null`, `set<T>(key, value): void`, `remove(key): void`, constante `SCHEMA_VERSION = 1`, envelope `StoredEnvelope<T> { version: number; data: T }`. Toda operação em `try/catch`: `get` → `null` se ausente/JSON inválido/versão incompatível; `set`/`remove` → no-op se storage indisponível; `console.warn` uma única vez na primeira falha. Criar `src/app/core/storage/storage.service.spec.ts`.
**Where**: `src/app/core/storage/storage.service.ts` + `storage.service.spec.ts`
**Depends on**: T1
**Reuses**: design.md "Services → StorageService" (D3, SHELL-05..10)
**Requirement**: SHELL-05, SHELL-06, SHELL-07, SHELL-08, SHELL-09, SHELL-10

**Done when**:
- [ ] Interface `get/set/remove` + `SCHEMA_VERSION` + envelope `{ version, data }` implementados
- [ ] Modelos de domínio NÃO carregam `version` (envelope cuida disso)
- [ ] `ng test --include='**/storage.service.spec.ts'` verde cobrindo: roundtrip set→get; key ausente → `null`; versão incompatível → `null`; JSON corrompido → `null`; `remove` apaga a chave; storage indisponível (mock que lança) → `get` `null` / `set`/`remove` no-op sem throw
- [ ] Test count: 6+ testes passando (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/storage.service.spec.ts'` → verde, 6+ testes

**Commit**: `feat(shell): StorageService versionado + unit tests`

---

### T5: Store layer — models + BaseStore + BeanStore/LogStore [P]

**What**: Criar o padrão de store com Signals: `src/app/core/stores/base-store.ts` (`BaseStore<T>` abstrato: `storageKey`, `items = signal<T[]>([])`, `load()` protegido, `persist()` protegido, `add/update/remove` mutando + `persist()` explícito — sem `effect()`; injeta `StorageService`); modelos `src/app/core/models/bean.model.ts` (`id`, `brand`, `createdAt` ISO) e `brew-log.model.ts` (`id`, `method`, `createdAt` ISO); esqueletos `src/app/core/stores/bean.store.ts` e `log.store.ts` (`providedIn: 'root'`, estendem `BaseStore`). Criar specs co-localizadas para BeanStore e LogStore.
**Where**: `src/app/core/stores/base-store.ts`, `bean.store.ts`, `log.store.ts`, `src/app/core/models/*.ts`, specs
**Depends on**: T4
**Reuses**: padrão definido no design (SHELL-11..14)
**Requirement**: SHELL-11, SHELL-12, SHELL-13, SHELL-14

**Done when**:
- [ ] `BaseStore<T>` com `signal`/`computed` e delegação exclusiva ao `StorageService` (SHELL-14)
- [ ] `add/update/remove` chamam `persist()` explícito (mutação + gravação)
- [ ] BeanStore/LogStore esqueletos expõem a base e são consumíveis (SHELL-13)
- [ ] Specs verificam (com StorageService mockado): `items` inicia vazio; `add`/`remove`/`update` mutam o signal e delegam ao storage; leitura `null` vira `[]`
- [ ] `ng test --include='**/*.store.spec.ts'` verde, 8+ testes

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/*.store.spec.ts'` → verde, 8+ testes

**Commit**: `feat(shell): store layer com BaseStore + esqueletos`

---

### T6: NavComponent (top + bottom nav) [P]

**What**: Criar `src/app/shared/nav/nav.component.ts` com `links = [{label:'Home', path:'/', marker:'[⌂]'}, {label:'Grãos', path:'/beans', marker:'[+]'}, {label:'Extrair', path:'/extract', marker:'[~]'}, {label:'Histórico', path:'/logs', marker:'[=]'}]`. Renderiza DUAS barras no template — top nav (≥768px) e bottom nav fixa (≤480px) — alternando **somente** via CSS media query (sem JS de breakpoint). Usa `RouterLink` + `RouterLinkActive`; item ativo em espresso com marker ASCII (`button-tab`/`bottom-nav` do DESIGN).
**Where**: `src/app/shared/nav/nav.component.ts`
**Depends on**: T1, T3
**Reuses**: tokens de navegação do DESIGN.md
**Requirement**: SHELL-18, SHELL-19

**Done when**:
- [ ] Template com top nav e bottom nav (ambos no DOM), alternância só por media query (≤480px / ≥768px)
- [ ] Item ativo destacado via `RouterLinkActive` (classe active → espresso + marker)
- [ ] `ng build` compila

**Tests**: none
**Gate**: build

**Verify**:
- `ng build` → ok
- Redimensionar viewport: ≤480px mostra bottom nav; ≥768px mostra top nav

**Commit**: `feat(shell): NavComponent top + bottom`

---

### T7: Pages placeholder (Grãos/Extrair/Histórico) + NotFound [P]

**What**: Criar `src/app/features/beans/beans.page.ts`, `src/app/features/extract/extract.page.ts`, `src/app/features/logs/logs.page.ts` (título da seção em `heading-md`) e `src/app/features/not-found/not-found.page.ts` (404 amigável com marker ASCII e link de volta à Home via `RouterLink`).
**Where**: `src/app/features/beans/`, `extract/`, `logs/`, `not-found/`
**Depends on**: T1, T3
**Reuses**: `heading-md`, `link-inline` do DESIGN
**Requirement**: SHELL-16, SHELL-17

**Done when**:
- [ ] 3 páginas placeholder renderizando título da seção
- [ ] NotFoundPage com mensagem 404 + link para `''`
- [ ] `ng build` compila

**Tests**: none
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(shell): pages placeholder + NotFound`

---

### T8: Rotas lazy + AppComponent shell

**What**: Criar `src/app/app.config.ts` com `provideRouter` (rotas: `''` → Dashboard lazy, `/beans`, `/extract`, `/logs` via `loadComponent`, `**` → NotFoundPage) e `src/app/app.ts` (AppComponent raiz: wordmark ASCII no header + `NavComponent` + `<router-outlet>`). Atualizar `main.ts` para `bootstrapApplication` com a config.
**Where**: `src/app/app.ts`, `src/app/app.config.ts`, `src/app/main.ts`
**Depends on**: T6, T7
**Reuses**: RouterOutlet, RouterLink (standalone)
**Requirement**: SHELL-01, SHELL-04, SHELL-15, SHELL-16, SHELL-17

**Done when**:
- [ ] Rotas `''`, `/beans`, `/extract`, `/logs` lazy (`loadComponent`) + wildcard `**` → NotFound
- [ ] AppComponent renderiza header wordmark + NavComponent + router-outlet
- [ ] `ng build` compila; console limpo no load (SHELL-04)

**Tests**: none
**Gate**: build

**Verify**:
- `ng serve` → shell renderiza na raiz; navegar `/beans`, `/extract`, `/logs` → placeholders; rota inválida → 404; console limpo

**Commit**: `feat(shell): rotas lazy + AppComponent shell`

---

### T9: DashboardPage (agregados + empty states)

**What**: Criar `src/app/features/dashboard/dashboard.page.ts` na rota `''`: `totalBeans = computed(() => beanStore.items().length)` (número em `display-md`), `recentLogs = computed(() => logStore.items())` (vazio na M1), empty states (`[+] Nenhum grão registrado`, `[+] Nenhuma extração registrada` — token `empty-state`) e atalhos para as 3 seções (RouterLink). ⚠️ Mostrar **total de grãos**, não "abertos" (AD-008; filtro por status fica para M2).
**Where**: `src/app/features/dashboard/dashboard.page.ts`
**Depends on**: T5, T8
**Reuses**: `dashboard-card`, `empty-state`, `display-md`, `link-inline` do DESIGN
**Requirement**: SHELL-15, SHELL-20 (com alteração AD-008)

**Done when**:
- [ ] Dashboard em `''` exibe contagem total de grãos, últimas extrações e atalhos para as 3 seções
- [ ] Sem dados → empty states nos cards (D2) sem erro
- [ ] `ng build` compila

**Tests**: none
**Gate**: full

**Verify**:
- `ng serve` → raiz mostra dashboard com contagem 0 + empty states + atalhos funcionais

**Commit**: `feat(shell): DashboardPage com agregados e empty states`

---

### T10: Validação manual da M1 + full gate

**What**: Passada de validação final da M1: navegação manual das 4 telas (`''`, `/beans`, `/extract`, `/logs`) + 404 em viewport mobile (≤480px, bottom nav) e desktop (≥768px, top nav); dashboard vazio com empty states; console limpo no load. Rodar full gate.
**Where**: — (verificação)
**Depends on**: T9
**Reuses**: checklist de verificação manual do design (Testes & Gate)
**Requirement**: SHELL-01..20

**Done when**:
- [ ] `ng test` → suíte toda verde (unit: storage + stores)
- [ ] `ng build` sem erros
- [ ] `ng lint` limpo
- [ ] Navegação manual: 4 rotas + 404 ok em mobile e desktop
- [ ] Dashboard vazio exibe empty states + contagem 0
- [ ] Console limpo no load (SHELL-04)
- [ ] Cobertura SHELL-01..20 = 20/20 verificada

**Tests**: none (manual + gates)
**Gate**: full

**Verify**:
- `ng test && ng build && ng lint` → todos verdes
- Checklist manual acima concluído

**Commit**: `chore(shell): validação M1`

---

## Parallel Execution Map

```
Phase 1 (Sequential):   T1 ──→ T2
Phase 2 (Parallel):     T1 ──┬─→ T3 [P]
                             └─→ T4 [P]
Phase 3 (Parallel):     T4 ──→ T5 [P]
                        T3 ──┬─→ T6 [P]
                             └─→ T7 [P]
Phase 4 (Sequential):   T6 ──┐
                        T7 ──┴─→ T8
Phase 5 (Sequential):   T5 ──┐
                        T8 ──┴─→ T9
Phase 6 (Sequential):   T9 ──→ T10
```

**Paralelismo**: T3–T7 são `[P]` — testes unitários são parallel-safe (Vitest isola arquivos) e não há estado mutável compartilhado entre elas. T8/T9/T10 são sequenciais (dependências de wiring).

---

## Test Co-location Validation

| Task | Camada criada/alterada | Matriz exige | Task diz | Status |
| --- | --- | --- | --- | --- |
| T1 | scaffold (config/tooling) | none | none | ✅ |
| T2 | config de lint | none | none | ✅ |
| T3 | styles.scss (tokens) | none (manual) | none | ✅ |
| T4 | StorageService | unit | unit | ✅ |
| T5 | Stores (BaseStore/BeanStore/LogStore) | unit | unit | ✅ |
| T6 | NavComponent (UI) | none (manual) | none | ✅ |
| T7 | Pages + NotFound (UI) | none (manual) | none | ✅ |
| T8 | Rotas + AppComponent (UI) | none (manual) | none | ✅ |
| T9 | DashboardPage (UI) | none (manual) | none | ✅ |
| T10 | — (validação) | — | none | ✅ |

---

## Requirement Traceability

| Requirement | Tasks |
| --- | --- |
| SHELL-01 | T1, T8 |
| SHELL-02 | T1 |
| SHELL-03 | T1, T2 |
| SHELL-04 | T2, T8, T10 |
| SHELL-05..10 | T4 |
| SHELL-11..14 | T5 |
| SHELL-15 | T8, T9 |
| SHELL-16 | T7, T8 |
| SHELL-17 | T7, T8 |
| SHELL-18 | T6, T10 |
| SHELL-19 | T6, T10 |
| SHELL-20 | T9 (total de grãos, AD-008) |
| Cobertura | 20/20 via T10 |
