# Guias de Extração — Design

**Spec**: `.specs/features/extraction-guides/spec.md`
**Context**: `.specs/features/extraction-guides/context.md`
**Status**: Approved (2026-08-06 — usuário aprovou)

---

## Resumo executivo

A M6 entrega guias de extração em duas superfícies: a **biblioteca** (rota `/guides`, consulta passiva com lista + detalhe) e a **integração com o painel `/extract`** (a receita selecionada dirige o cronômetro com as fases da receita, avanço automático na meta + manual, e modo simples como saída). Conteúdo v1: 3 receitas de Coado/V60 (Equilibrada, Intensa, Suave) como **constantes estáticas** (D-GUIDE-10), base 20g/300g.

O coração do design é a **generalização do `TimerState` da M3**: o timer deixa de ter fases fixas (`preinfusion`/`extraction`) e passa a carregar uma **lista de fases ativas** (`phases: TimerPhase[]`) + índice da fase atual + modo (`simple` | `recipe`) + flag de conclusão. No modo simples, a lista é a mesma de 2 fases da M3 (sem meta → sem avanço automático). No modo receita, a lista vem da receita (nome + meta cumulativa por fase) e o `tickTimer` puro avança automaticamente quando o total atinge a meta. O contrato `BrewState` da M4 **permanece válido** — logs só consomem `totalTime` (verificado em `log-form.component.ts`), e `phaseLabel` passa a expor o nome da fase da receita em modo receita.

A **preferência de receita** é a primeira coisa persistida fora dos stores de domínio (novo padrão "preferência", AD-012): um `GuideStore` dedicado injeta o `StorageService` herdado da M1, guarda o id da receita sob a chave `guide:preferredRecipe` (envelope versionado, corrompido → `null` → abre sem receita). O `ExtractionStore` orquestra: restaura a preferência ao entrar na rota (`routeEntered`, simétrico ao `routeExited` da M3), desativa a receita **só na sessão** ao trocar de método e restaura ao voltar ao V60, e o "Modo simples" limpa a preferência.

Escala de volumes fica em **função pura** (`scaledPhases`: `round(volume × dose / baseDose)`, dose inválida → base), seguindo o padrão de testabilidade das M2/M3 (degass, ratio, timer). Nenhum contrato da M1 muda (rotas ganham `/guides` e `/guides/:id`; StorageService/BaseStore intactos).

---

## Architecture Overview

Fluxo de dados: **Componente → ExtractionStore (timer) / GuideStore (catálogo+preferência) → utils puras**. `GuideStore` é a única ponte com `StorageService` nesta M6; `ExtractionStore` continua transiente em tudo que é brew, mas injeta `GuideStore` para conhecer a receita ativa e a preferência. Lógica de receita (escala + fases do timer) vive em funções puras sem dependência de Angular.

```mermaid
graph TD
    subgraph UI
        Extract[ExtractPage - /extract]
        TimerC[BrewTimerComponent]
        MethodC[MethodSelectorComponent]
        RecipeC[RecipeSelectorComponent *]
        Calc[RatioCalculatorComponent]
        Guides[GuidesPage - /guides *]
        GuideD[GuideDetailPage - /guides/:id *]
    end

    subgraph Core
        EStore[ExtractionStore - orquestra timer + receita]
        GStore[GuideStore - catalogo + preferencia *]
        TimerU[TimerUtil - estendido (fases genericas)]
        GuideU[GuideUtil - escala + fases da receita *]
        GuideM[GuideModel - receitas estaticas *]
        BrewM[BrewModel - TimerState generalizado]
        Storage[StorageService - herdado M1]
    end

    Extract -->|compoe| TimerC
    Extract -->|compoe| MethodC
    Extract -->|compoe| RecipeC
    Extract -->|compoe| Calc
    Extract -->|routeEntered no init| EStore
    Extract -->|routeExited no destroy| EStore

    TimerC -->|le timer / isRecipeMode / isCompleted| EStore
    MethodC -->|selectMethod desativa/restaura receita| EStore
    RecipeC -->|selectRecipe / exitRecipe| EStore
    RecipeC -->|routerLink /guides| Guides
    Guides -->|routerLink /guides/:id| GuideD

    EStore -->|restore / select / clearPreference| GStore
    GStore -->|get / set / remove| Storage
    EStore -->|recipeToTimerPhases / scaledPhases| GuideU
    EStore -->|maquina de estados do timer| TimerU
    GuideD -->|scaledPhases + dose local| GuideU

    GStore -->|RECIPES / RECIPES_BY_ID| GuideM
    GuideU -->|tipos RecipePhase| GuideM
    TimerU -->|TimerState / TimerPhase| BrewM

    classDef ph stroke:#b45309,stroke-dasharray:4 2
    class RecipeC,Guides,GuideD,GStore,GuideU,GuideM ph
```

`*` = novidades da M6. `ExtractionStore`/`BrewModel`/`TimerUtil` são **estendidos** (não recriados). `StorageService` é herdado intacto.

---

## Code Reuse Analysis

### Contratos herdados (sem quebra)

| Recurso | Localização | Como usamos |
|---|---|---|
| `StorageService` (get/set/remove + envelope versionado) | `src/app/core/storage/storage.service.ts` | `GuideStore` persiste a preferência; `get<string>` retorna `null` em envelope corrompido/incompatível → abre sem receita (GUIDE-22, edge case do spec) |
| `ExtractionStore` (timer + dose/ratio + `brewState`) | `src/app/core/stores/extraction.store.ts` | **Estendido** com modo receita; contrato `BrewState` preservado (M4 só lê `totalTime` — confirmado no `log-form.component.ts` linhas 320-325) |
| `TimerState`/`BrewPhase`/`PHASE_LABEL` | `src/app/core/models/brew.model.ts` | **Generalizados** (`TimerState` com `phases: TimerPhase[]`); `BrewPhase`/`PHASE_LABEL` permanecem como ids/labels do modo simples |
| `timer.util.ts` (`createTimerState`/`tickTimer`/`advancePhase`/`formatMmSs`) | `src/app/core/utils/timer.util.ts` | **Estendido** com `createRecipeTimerState`, fases genéricas, auto-advance e conclusão; `formatMmSs` intocado |
| `parsePositiveNumber` | `src/app/core/utils/brew-ratio.util.ts` | Reuso na dose do detalhe da biblioteca (dose inválida → `null` → volumes base) |
| Padrão de store com Signals + `computed` | `src/app/core/stores/*.store.ts` | `GuideStore` segue o padrão (signals + derivados), sem herdar `BaseStore` (não é coleção persistida — é preferência) |
| Padrão de lógica pura unit-testável | `src/app/core/utils/degass.util.ts` / `brew-ratio.util.ts` / `timer.util.ts` | `guide.util.ts` no mesmo formato (função pura, sem Angular) |
| Padrão de página list→detalhe | `src/app/features/logs/logs.page.ts` + `log-detail.page.ts` | `GuidesPage`/`GuideDetailPage` seguem o mesmo vocabulário de tokens (heading, cards, caption) |
| Tokens do DESIGN.md | tokens scoped por componente | `button-tab`/`button-tab-active` (cards de receita), `link-inline` (atalho biblioteca), `text-input`, `heading-md`, `body-md`, `caption-md`, `coffee-mute`, `button-primary`/`button-secondary`, `hairline` |
| `formatMmSs` | `src/app/core/utils/timer.util.ts` | Exibição de tempos (cumulativos) em cards, fases e metadados |

### Integration Points

| Sistema | Método de integração |
|---|---|
| Painel ↔ Biblioteca | Atalho "biblioteca →" no `RecipeSelectorComponent` (`routerLink="/guides"`), sempre visível (GUIDE-05/13); estado do painel preservado porque `ExtractionStore`/`GuideStore` são `providedIn: 'root'` (GUIDE-06) |
| Receita ↔ Cronômetro | `recipeToTimerPhases(recipe)` → `TimerPhase[]` (nome + meta cumulativa) → `createRecipeTimerState` no timer do `ExtractionStore` (GUIDE-07/08) |
| Dose ↔ Volumes | Painel: `scaledPhases(recipe, extractStore.dose())` — dose do `ExtractionStore` (D-GUIDE-07). Biblioteca: dose local (default 20g) (GUIDE-16..19) |
| Preferência ↔ Storage | `GuideStore` injeta `StorageService`, chave `guide:preferredRecipe`, payload `string` (id da receita) com envelope versionado (GUIDE-20..23) |
| M4 ↔ M6 | `BrewState.phaseLabel` expõe o nome da fase da receita em modo receita; `phase` vira `string` (id da fase) — logs seguem consumindo só `totalTime` (edge case do spec) |

---

## Components

### ExtractPage (extendida)

- **Propósito**: continua sendo a rota `/extract`; passa a compor o `RecipeSelectorComponent`, chamar `routeEntered()` no init e manter o `routeExited()` no destroy (reset do cronômetro, M3).
- **Localização**: `src/app/features/extract/extract.page.ts`
- **Interfaces**:
  - Template: `Timer` → `MethodSelector` → `RecipeSelector` (novo, abaixo dos chips — D-GUIDE Agent's discretion) → `RatioCalculator` → botão "Salvar no histórico"
  - `constructor()`: `extractStore.routeEntered()` (restaura preferência / timer zerado na 1ª fase — GUIDE-21) + `destroyRef.onDestroy(() => extractStore.routeExited())` (M3, GUIDE-12 edge)
- **Dependências**: `BrewTimerComponent`, `MethodSelectorComponent`, `RecipeSelectorComponent`, `RatioCalculatorComponent`, `ExtractionStore`.
- **Reusa**: nada além da composição existente; sem mudança no reset do destroy.

### BrewTimerComponent (adaptado)

- **Propósito**: display do cronômetro; ganha uma variante visual para o modo receita (total em destaque + meta da fase + estado de conclusão) sem mudar o modo simples da M3.
- **Localização**: `src/app/features/extract/brew-timer.component.ts`
- **Interfaces**:
  - `timer = computed(() => extractStore.timer())`
  - `isRecipeMode = computed(() => extractStore.isRecipeMode())`
  - `phaseLabel = computed(() => extractStore.currentPhaseLabel())` — substitui `PHASE_LABEL[timer().phase]` (label vem do `TimerPhase` ativo; no modo simples é o mesmo texto da M3)
  - `phaseTime = computed(() => formatMmSs(extractStore.currentPhase().phaseSeconds))` → **modo simples**: mantém `phaseSeconds` em destaque + "Total" abaixo (M3)
  - `recipeTotalTime = computed(() => formatMmSs(timer().totalSeconds))` → **modo receita**: total cumulativo em destaque (metas são cumulativas — D-GUIDE-05) + linha de meta
  - `phaseTarget = computed(() => extractStore.currentPhaseTarget())` — `number | null`
  - `isCompleted = computed(() => extractStore.isCompleted())`
  - `start()/pause()/reset()/advancePhase()` — delegam ao store (intactos)
  - Template (modo receita): label da fase + `timer-xl` com total cumulativo + linha `caption-md` "Meta {mm:ss}" (+ volume da fase vindo do `RecipeSelector` ou aqui — decidido: volume na lista de fases do RecipeSelector, meta aqui) + badge "Concluída" (`[OK]`) quando `isCompleted`; controles idênticos.
- **Dependências**: `ExtractionStore`.
- **Reusa**: `timer-display`, `timer-xl` (40px/32px mobile), `button-primary`/`button-secondary`, `heading-md`, `display-md`, `caption-md` do DESIGN.

**Decisão de design**: no modo receita o número grande é o **total cumulativo** (comparável à meta cumulativa — D-GUIDE-05); no modo simples permanece o `phaseSeconds` da M3. O estado "Concluída" é um texto `[OK] Concluída` em `caption-md` sobre a superfície do timer, sem token novo (vocabulário ASCII do DESIGN).

### RecipeSelectorComponent (novo)

- **Propósito**: a seção de receitas do painel — atalho para a biblioteca (sempre visível, GUIDE-13), cards das receitas V60 (seletor), lista de fases da receita ativa com volumes escalados pela dose e o botão "Modo simples" (GUIDE-14/15).
- **Localização**: `src/app/features/extract/recipe-selector.component.ts`
- **Interfaces**:
  - `recipes = RECIPES` (const do modelo)
  - `isV60 = computed(() => extractStore.method() === 'v60')`
  - `selectedId = computed(() => extractStore.selectedRecipe()?.id ?? null)`
  - `isRecipeMode = computed(() => extractStore.isRecipeMode())`
  - `phaseIndex = computed(() => extractStore.timer().phaseIndex)`
  - `isCompleted = computed(() => extractStore.isCompleted())`
  - `scaledPhases = computed(() => extractStore.scaledActivePhases())` — `ScaledPhase[]` (volume escalado pela dose do painel, GUIDE-16/17)
  - `selectRecipe(id)`, `exitRecipe()` — delegam ao store
  - `phaseMarker(i)`: atual `[*]` · concluída `[x]` · futura `[ ]`
  - Template:
    - Header: `heading-md` "[~] Guias de extração" + `link-inline` "biblioteca →" (`routerLink="/guides"`)
    - `@if (isV60())`: cards `button-tab`/`button-tab-active` com marker ASCII + nome + `caption-md` (foco · moagem · tempo total `formatMmSs(tempoTotalEstimado)`); receita ativa destacada
      - `@if (isRecipeMode())`: lista de fases (`guide-phase` rows: marker + nome em `body-strong` + `caption-md coffee-mute` "{volume}g · {mm:ss}" acumulados), fase atual em espresso, anteriores `[x]`; botão `button-secondary` "Modo simples"
    - `@else`: `caption-md coffee-mute` "Receitas disponíveis para Coado/V60."
- **Dependências**: `ExtractionStore` (não injeta `GuideStore` diretamente — receitas vêm do modelo; seleção vira método do store).
- **Reusa**: `button-tab`/`button-tab-active`, `link-inline`, `heading-md`, `body-strong`, `body-md`, `caption-md`, `coffee-mute`, `button-secondary`, `hairline` do DESIGN.

**Decisão de design**: o seletor vive sempre no painel (header + atalho) e só mostra cards quando o método é V60 (GUIDE-13). A lista de fases da receita ativa fica inline no seletor — é o "guia em tempo real" (D-GUIDE-08) — com volumes escalados pela dose do painel. "Modo simples" aparece só com receita ativa (GUIDE-14).

### GuidesPage (novo)

- **Propósito**: biblioteca passiva de receitas — lista as 3 receitas V60 em cards com nome, foco, dica de moagem e tempo total estimado (GUIDE-01).
- **Localização**: `src/app/features/guides/guides.page.ts`
- **Interfaces**:
  - `recipes = RECIPES`
  - Template: `heading-md` "[~] Guias de Extração" + nota "Receitas passo a passo por método. Na v1: Coado/V60." + cards `button-tab`-like com `routerLink="['/guides', recipe.id]"`
- **Dependências**: `RouterLink`, modelo.
- **Reusa**: `button-tab`, `card-title`, `caption-md`, `coffee-mute`, `heading-md`, `body-md`, `formatMmSs`.

**Decisão de design**: sem cronômetro na biblioteca (D-GUIDE-09 — consulta passiva). Cards seguem o vocabulário de list-rows/cards do app.

### GuideDetailPage (novo)

- **Propósito**: detalhe passo a passo de uma receita — fases em ordem com volume acumulado, tempo cumulativo e descrição, escalados por um **campo de dose local** (default 20g, D-GUIDE-07).
- **Localização**: `src/app/features/guides/guide-detail.page.ts`
- **Interfaces**:
  - `recipe = computed(() => RECIPES_BY_ID[routeId()])`; id ausente/inexistente → `router.navigate(['/guides'])` (padrão `log-detail`)
  - `doseInput = signal('20')` — dose própria da biblioteca (D-GUIDE-07)
  - `dose = computed(() => parsePositiveNumber(doseInput()))` — inválida → `null` → volumes base (GUIDE-18)
  - `phases = computed(() => scaledPhases(recipe(), dose()))` — `ScaledPhase[]` (GUIDE-16/17)
  - Template: nome (`heading-md`), foco (`body-md`), "Moagem: {moagem}" (`caption-md coffee-mute`), campo Dose (`text-input`, inputmode decimal), nota "Volumes acumulados ao fim da fase · Tempos cumulativos", lista de fases (nome `body-strong`, "{volume}g · {mm:ss}" `caption-md coffee-mute`, descrição `body-md`)
- **Dependências**: `ActivatedRoute`, `Router`, modelo + `guide.util`.
- **Reusa**: `text-input`, `heading-md`, `body-md`, `body-strong`, `caption-md`, `coffee-mute`, `hairline`, `formatMmSs`, `parsePositiveNumber`.

**Decisão de design**: dose local não persistida (D-GUIDE-07 — só o painel persiste seleção; a dose da biblioteca é consulta). Volumes exibidos são **acumulados** (GUIDE-03/04) — a nota de rodapé esclarece a semântica.

---

## Services / Stores

### GuideStore (novo — preferência + catálogo)

- **Propósito**: estado global das receitas e da preferência de receita. Único consumidor de `StorageService` na M6 (novo padrão "preferência", AD-012). `providedIn: 'root'` sobrevive à navegação.
- **Localização**: `src/app/core/stores/guide.store.ts`
- **Interfaces**:
  - `selectedId = signal<string | null>(null)` — receita selecionada/preferida na sessão
  - `selectedRecipe = computed<ExtractionRecipe | null>(...)` — resolve via `RECIPES_BY_ID`; id inexistente → `null`
  - `restorePreference(): void` — `storage.get<string>('guide:preferredRecipe')`; id válido (`RECIPES_BY_ID[id]`) → `selectedId.set(id)`; inválido/corrompido → `null` (GUIDE-22)
  - `select(id: string): void` — id válido → `selectedId.set(id)` + `storage.set(KEY, id)` (GUIDE-20)
  - `clearPreference(): void` — `selectedId.set(null)` + `storage.remove(KEY)` (GUIDE-23)
- **Dependências**: `StorageService`.
- **Reusa**: `StorageService` (envelope versionado herdado da M1); modelo `guide.model.ts`.

**Decisão de design**: `GuideStore` não herda `BaseStore` — não é coleção de domínio, é uma preferência (payload único `string`). O id da receita já codifica o método (`v60-*`); validação de compatibilidade com o método atual fica no `ExtractionStore` (que conhece o método).

### ExtractionStore (estendido)

- **Propósito**: continua dono do timer e dos inputs do brew; ganha o **modo receita** (fases da receita dirigindo o cronômetro) e a orquestração da preferência via `GuideStore`.
- **Localização**: `src/app/core/stores/extraction.store.ts`
- **Interfaces** (novas/alteradas):
  - `selectedRecipe = computed(() => guideStore.selectedRecipe())`
  - `currentPhase = computed(() => currentPhase(this.timer()))` — `TimerPhase` ativo (util pura)
  - `currentPhaseLabel / currentPhaseTarget / isRecipeMode / isCompleted` — computeds derivados do timer
  - `scaledActivePhases = computed(() => recipe ? scaledPhases(recipe, this.dose()) : [])` — volumes da receita ativa pela dose do painel (GUIDE-16/17)
  - `routeEntered(): void` — `guideStore.restorePreference()`; receita válida **e** `recipe.method === this.method()` → `timer.set(createRecipeTimerState(...))` zerado; senão `timer.set(createTimerState())` (GUIDE-21/22)
  - `selectRecipe(id): void` — `guideStore.select(id)` (persiste) + timer reset para a receita (fases + 1ª fase, zerado) (GUIDE-20; edge "selecionar com timer rodando → reset")
  - `exitRecipe(): void` — `guideStore.clearPreference()` + timer volta ao modo simples (GUIDE-14/23)
  - `selectMethod(m): void` — aplica preset; **m ≠ v60** e timer em modo receita → desativa a receita **só na sessão** (timer simples, `guideStore.selectedId` intocado — GUIDE-24); **m = v60** com `selectedRecipe` → restaura a receita zerada (GUIDE-25)
  - `reset(): void` — **mode-aware**: em modo receita volta à 1ª fase da receita (GUIDE-12 edge); em modo simples volta à pré-infusão (M3)
  - `routeExited(): void` — `reset()` (M3 intacto; preferência permanece — GUIDE-12 edge)
  - `advancePhase()/start()/pause()` — delegam às utils generalizadas (intactos na semântica)
  - `brewState`: `phase` vira `string` (id da fase ativa) e `phaseLabel` usa `currentPhaseLabel()` (nome da fase da receita em modo receita — edge case do spec)
- **Dependências**: `GuideStore` (novo), `TimerUtil` (estendido), `GuideUtil` (novo), `BrewModel`, `RatioUtil`.
- **Reusa**: `timer.util` generalizado, `recipeToTimerPhases`, `scaledPhases`, `RATIO_PRESETS`.

**Decisão de design**: orquestração no store (não nos componentes) para testabilidade unitária — `routeEntered` é o espelho do `routeExited` da M3 e centraliza restauração. O reset mode-aware garante "Reset volta à primeira fase" em receita e à pré-infusão em simples. O `effect` do intervalo da M3 permanece intacto (só `start`/`pause` controlam o ciclo).

### GuideUtil (novo — função pura)

- **Propósito**: escala de volumes e ponte receita → fases do timer. Sem dependência de Angular.
- **Localização**: `src/app/core/utils/guide.util.ts`
- **Interfaces**:
  - `interface ScaledPhase { nome: string; volumeAgua: number; tempoObjetivo: number; descricao: string }`
  - `scaleVolume(volume, dose, baseDose): number` — `Math.round(volume × dose / baseDose)` (GUIDE-16/19)
  - `scaledPhases(recipe, dose: number | null): ScaledPhase[]` — dose `null`/inválida → volumes base (GUIDE-18); tempos intocados (D-GUIDE-06)
  - `recipeToTimerPhases(recipe): TimerPhase[]` — `{ id: f.id, label: f.nome, targetSeconds: f.tempoObjetivo }` (metas cumulativas, D-GUIDE-05)
- **Dependências**: `guide.model` (tipos), `brew.model` (`TimerPhase`).
- **Reusa**: nada (lógica nova de domínio).

### TimerUtil (estendido)

- **Propósito**: máquina de estados do cronômetro generalizada. Fases vêm no próprio `TimerState` (modo simples ou receita).
- **Localização**: `src/app/core/utils/timer.util.ts`
- **Interfaces** (novas/alteradas):
  - `SIMPLE_PHASES: TimerPhase[]` — `[{preinfusion, 'Pré-infusão', null}, {extraction, 'Extração', null}]` (derivado de `PHASE_LABEL`)
  - `createTimerState(): TimerState` — modo `simple`, fases `SIMPLE_PHASES`, `phaseIndex 0`, `completed false`
  - `createRecipeTimerState(phases): TimerState` — modo `recipe`, fases dadas, idle na 1ª fase
  - `currentPhase(state): TimerPhase` — `state.phases[state.phaseIndex]`
  - `tickTimer(state)` — incrementa `phaseSeconds`/`totalSeconds`; **modo receita e não concluído**: se `totalSeconds >= targetSeconds` da fase atual → avança (próxima fase com `phaseSeconds` 0, total preservado); última fase → `completed: true` (GUIDE-09/10, avança no máximo uma fase por tick)
  - `advancePhase(state)` — **simples**: pré-infusão → extração (no-op se já extração, preserva referência — M3); **receita**: próxima fase; última → `completed`; já concluído → no-op (GUIDE-10)
  - `formatMmSs` — intocado
- **Dependências**: `brew.model` (`TimerState`, `TimerPhase`, `PHASE_LABEL`).
- **Reusa**: `PHASE_LABEL` para construir `SIMPLE_PHASES`.

**Decisão de design**: auto-advance e conclusão vivem na util pura (testável sem clock/mocks). Fases de receita têm `targetSeconds` **cumulativo** (D-GUIDE-05) e a comparação é `totalSeconds >= target` — como o total é cumulativo e as metas são cumulativas, cada tick avança no máximo uma fase.

---

## Data Models

### BrewModel (extendido — `src/app/core/models/brew.model.ts`)

```typescript
export type BrewPhase = 'preinfusion' | 'extraction'; // ids do modo simples (intacto)
export type TimerMode = 'simple' | 'recipe';

export interface TimerPhase {
  id: string;               // 'preinfusion' | 'extraction' (simples) | f.id da receita (receita)
  label: string;            // 'Pré-infusão' | 'Extração' | nome da fase da receita
  targetSeconds: number | null; // meta CUMULATIVA ao fim da fase; null = sem auto-advance
}

export interface TimerState {   // estendido
  status: TimerStatus;
  mode: TimerMode;
  phaseIndex: number;           // índice em phases
  phases: TimerPhase[];         // fases ativas (2 no simples, N na receita)
  phaseSeconds: number;         // segundos na fase atual
  totalSeconds: number;         // segundos acumulados (contrato M4 intacto)
  completed: boolean;           // só tem efeito no modo receita
}

export interface BrewState {    // phaseLabel passa a ser o nome da fase ativa
  method: BrewMethod;
  methodLabel: string;
  dose: number | null;
  ratio: number | null;
  water: number | null;
  phase: string;                // widened de BrewPhase → id da fase ativa
  phaseLabel: string;           // nome da fase ativa (fase da receita em modo receita)
  phaseTime: number;
  totalTime: number;
  running: boolean;
}
```

**Relacionamentos**: `BrewState.phase`/`phaseLabel` passam a derivar de `currentPhase()` (label do `TimerPhase` ativo) — em modo simples produzem exatamente os valores da M3 (verificado: os testes existentes seguem passando com os mesmos asserts). `TimerPhase` é produzido por `recipeToTimerPhases` (receita) ou `SIMPLE_PHASES` (simples).

### GuideModel (novo — `src/app/core/models/guide.model.ts`)

```typescript
export type GuideMethod = 'v60'; // extensível a outros métodos na v2

export interface RecipePhase {
  id: string;              // ex.: 'v60-equilibrada-1'
  nome: string;            // ex.: 'Pré-infusão (Bloom)'
  tempoObjetivo: number;   // segundos — CUMULATIVO ao fim da fase (D-GUIDE-05)
  volumeAgua: number;      // gramas — ACUMULADO ao fim da fase (D-GUIDE-04); sem vertida repete o anterior
  descricao: string;
}

export interface ExtractionRecipe {
  id: string;              // ex.: 'v60-equilibrada'
  method: GuideMethod;     // 'v60'
  nome: string;            // 'Equilibrada'
  foco: string;            // 'Doçura e corpo médio'
  moagem: string;          // dica de moagem (texto livre)
  baseDose: number;        // 20g
  tempoTotalEstimado: number; // segundos
  fases: RecipePhase[];    // em ordem de execução
}

export const RECIPES: ExtractionRecipe[] = [ /* conteúdo v1 (3 receitas, tabela do spec) */ ];
export const RECIPES_BY_ID: Record<string, ExtractionRecipe> = /* derivado de RECIPES */;
```

**Relacionamentos**: conteúdo estático (D-GUIDE-10), no mesmo formato de `BREW_METHODS`/`RATIO_PRESETS` do `brew.model.ts`. `RecipePhase.id` é estável e vira o `TimerPhase.id` no timer (fase atual é rastreável à receita).

---

## Error Handling Strategy

| Cenário | Tratamento | Impacto no usuário |
|---|---|---|
| Preferência corrompida/incompatível/inexistente no LocalStorage | `StorageService.get` → `null`; `GuideStore.restorePreference` valida id em `RECIPES_BY_ID`; `routeEntered` cai para `createTimerState()` | Painel abre sem receita (modo simples), sem crash (GUIDE-22) |
| Preferência de método incompatível (ex.: id de receita não-V60 com método atual ≠) | `routeEntered` exige `recipe.method === this.method()` | Não restaura; modo simples até trocar para o método certo |
| Dose inválida (vazia/zero/negativa/não numérica) | `parsePositiveNumber` → `null` → `scaledPhases` usa `baseDose` | Volumes da receita base (20g) sem quebrar a tela (GUIDE-18) |
| Troca de método para sem receitas com receita ativa | `selectMethod` → timer volta a `simple`, `guideStore.selectedId` preservado | Cronômetro 2 fases; voltar ao V60 restaura a preferência (GUIDE-24/25) |
| Última fase concluída (meta atingida ou avanço manual) | `tickTimer`/`advancePhase` → `completed: true`, sem mais auto-advance; timer segue contando | UI mostra "Concluída"; Pause/Reset disponíveis (GUIDE-10) |
| Selecionar receita com cronômetro rodando | `selectRecipe` → reset para a 1ª fase da nova receita | Reinício limpo da receita nova (edge case do spec) |
| Sair da rota `/extract` em modo receita | `routeExited` → `reset()` (mode-aware: volta à 1ª fase da receita); preferência permanece | Ao voltar, `routeEntered` restaura zerado (GUIDE-21; comportamento M3) |
| Volume escalado arredondado | `Math.round` por fase; soma de incrementos pode divergir 1g do acumulado | Aceito — fases exibem acumulado arredondado (edge case do spec) |
| Volume de fase sem vertida (decantação) | `volumeAgua` repete o anterior (modelo) | Exibido corretamente, sem fase com volume vazio (GUIDE-04) |
| Mobile ≤ 480px | Fases em coluna vertical, lista sem `white-space: nowrap` de página | Sem scroll horizontal na biblioteca/guia (edge case do spec) |
| `effect()` do timer em background da aba | `setInterval` pode atrasar (resolução 1s) | Aceito na v1, igual à M3 |

---

## Tech Decisions (não óbvias)

| Decisão | Escolha | Rationale |
|---|---|---|
| Fases do timer | `TimerState` generalizado: `mode` + `phaseIndex` + `phases: TimerPhase[]` + `completed` (substitui o `phase: BrewPhase` fixo) | O mesmo timer serve às 2 fases da M3 e às N fases da receita sem componentes duplicados; `BrewPhase`/`PHASE_LABEL` permanecem como modo simples |
| Contrato M4 | `BrewState.phase` widened para `string`; `phaseLabel` = nome da fase ativa (receita em modo receita) | Logs só consomem `totalTime` (verificado em `log-form.component.ts`); edge case do spec exige expor o nome da fase da receita |
| Store de guia | `GuideStore` separado do `ExtractionStore`, injeta `StorageService` | Primeira persistência fora dos stores de domínio (novo padrão "preferência", AD-012); mantém o `ExtractionStore` "transiente no brew" e evita acoplar timer a storage |
| Orquestração | `ExtractionStore` injeta `GuideStore` e orquestra `routeEntered`/`selectRecipe`/`exitRecipe`/`selectMethod`/`reset` (mode-aware) | Testável por unidade (fake timers + StorageService mock); nenhum ciclo (GuideStore não conhece o ExtractionStore) |
| Auto-advance | Dentro de `tickTimer` puro (modo receita, `totalSeconds >= targetSeconds`) | Testável sem mocks; metas cumulativas garantem no máx. 1 avanço/tick |
| Escala de volumes | Função pura `scaledPhases` (`round(volume × dose / baseDose)`; dose inválida → base; tempos fixos) | Padrão de testabilidade das M2/M3; D-GUIDE-06; GUIDE-16..19 |
| Reset em modo receita | Mode-aware: volta à 1ª fase da receita (não sai do modo receita) | GUIDE-12 edge ("zerar e voltar à primeira fase"); o "Modo simples" é a única saída explícita (GUIDE-14/15) |
| Preferência | Chave `guide:preferredRecipe`, payload `string` (id), envelope versionado | StorageService herdado; corrompida → `null` → abre sem receita (GUIDE-22) |
| Conteúdo das receitas | Constantes estáticas em `guide.model.ts` (`RECIPES`/`RECIPES_BY_ID`) | D-GUIDE-10; mesmo padrão de `BREW_METHODS`/`RATIO_PRESETS` |
| Visual do modo receita | Timer mostra total cumulativo em destaque + "Meta {mm:ss}"; fase em `BrewTimer`, volumes na lista do `RecipeSelector`; "Concluída" = `[OK]` em caption | Metas cumulativas (D-GUIDE-05) comparam direto com o total; sem token novo (vocabulário ASCII) |
| Atalho biblioteca | `link-inline` "biblioteca →" no header do `RecipeSelector`, sempre visível | GUIDE-05/13 (disponível mesmo fora do V60); sem nova aba na nav (D-GUIDE-01) |
| Dose da biblioteca | Local (default 20g), não persistida | D-GUIDE-07 — biblioteca é consulta passiva; só o painel tem preferência persistida |
| Forms | Sem Reactive Forms nos novos componentes (dose é input livre via signals) | Mesma lógica da M3 (AD-009 cobre formulários reais M2/M4); AD-009 não se aplica a inputs livres |

---

## Testes & Gate

**Unit tests (Vitest):**
- `guide.util.spec.ts`: `scaleVolume(40, 25, 20) = 50`, `scaleVolume(160, 25, 20) = 200`, `scaleVolume(300, 25, 20) = 375`; `scaledPhases(Equilibrada, 25)` → 50/200/375; dose `null` → 40/160/300 (base); dose fracionária → arredonda (`40 × 23 / 20 = 46`); tempos sempre fixos; `recipeToTimerPhases` → `{id, label: nome, targetSeconds: tempoObjetivo}` cumulativos (Suave: 30/60/90/180).
- `timer.util.spec.ts` (atualizado + novos): `createTimerState` (mode simple, 2 fases, index 0, completed false); `createRecipeTimerState`; `tickTimer` simples (incrementa; idle/paused → mesma referência — M3); **modo receita**: atinge meta → avança com `phaseSeconds 0` e total preservado; última meta → `completed: true` e para de avançar (total continua); `advancePhase` simples (pré→extração; extração → mesma referência) e receita (próxima fase; última → `completed`; concluído → no-op); `currentPhase`.
- `guide.store.spec.ts`: `select` persiste via StorageService (mock); `restorePreference` carrega id válido; id inválido/inexistente → `null`; `clearPreference` remove e zera `selectedId`.
- `extraction.store.spec.ts` (atualizado + novos): default simples (pré-infusão, sem meta); `routeEntered` restaura preferência compatível (method v60 → modo receita, 1ª fase, zerado) e **não** restaura quando incompatível/inválida; `selectRecipe` configura fases da receita + reseta timer + persiste; `exitRecipe` volta a simples + limpa preferência; `selectMethod('espresso')` com receita ativa → timer simples **e** `guideStore.selectedId` preservado; voltar a `v60` → receita restaurada; `reset` em modo receita → 1ª fase da receita zerado; auto-advance real com fake timers (`vi.useFakeTimers` + `flushEffects`); `brewState` em modo receita → `phaseLabel` = nome da fase da receita, `totalTime` intacto (M4).

**Verificação manual (navegador):**
- Rotas `/guides` (lista 3 cards) e `/guides/:id` (fases escaladas pela dose local; Equilibrada 40/160/300, Intensa com decantação 300 acumulado — Independent Tests do spec).
- Painel: atalho "biblioteca →" navega a `/guides` e volta com método/dose/receita preservados (GUIDE-05/06).
- Suave selecionada → Start → "Pré-infusão (Bloom)" meta 0:30; aos 30s avança sozinho para "1ª Vertida"; avanço manual antes da meta; concluir última → "Concluída", sem avanço automático; dose 25g → volumes 50/187/281/375 (Independent Test).
- Modo simples: limpa receita, timer 2 fases zerado; recarregar painel sem preferência → simples.
- Preferência: selecionar Intensa → sair e voltar a `/extract` → restaurada zerada; corromper LocalStorage → abre sem receita, sem erro.
- Troca de método: Suave ativa → Espresso → 2 fases; voltar ao V60 → Suave restaurada.
- Mobile ≤ 480px: fases em coluna, sem scroll horizontal; bottom nav intacta.
- Console limpo no load.

**Gate:** `ng test` verde (unit: guide.util + timer.util + guide.store + extraction.store — contagens esperadas nos `Done when` das tasks) · `ng build` sem erros · `ng lint` limpo · navegação manual acima em mobile e desktop.

---

## Fora do escopo desta fase (design)

- Receitas editáveis pelo usuário (conteúdo estático — D-GUIDE-10, deferred).
- Receitas para outros métodos (espresso, prensa, aeropress) e Chemex (D-GUIDE-02).
- Cronômetro embutido na biblioteca `/guides` (D-GUIDE-09).
- Persistência da dose do painel (D-EXTR-05, transiente).
- Feedback sonoro/háptico ao fim de fase (deferred).
- Histórico/estatísticas por receita (cruzamento com Brew Logs — deferred).
- Compartilhamento de receitas.
