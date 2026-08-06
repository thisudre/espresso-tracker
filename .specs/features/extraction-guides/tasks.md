# Guias de Extração (M6) — Tasks

**Design**: `.specs/features/extraction-guides/design.md`
**Spec**: `.specs/features/extraction-guides/spec.md`
**Status**: Approved (2026-08-06 — usuário aprovou)

---

## Contexto de Execução

- A M6 executa **sobre a M1/M3/M5 concluídas**: rota `/extract` + `ExtractionStore` + `TimerState` da M3, `StorageService` da M1, `BrewState` consumido pela M4 (logs só leem `totalTime`). Nenhum contrato da M1 muda; **duas rotas novas** (`/guides`, `/guides/:id`).
- **Refactor interno**: o `TimerState` da M3 é **generalizado** (mode/phaseIndex/phases/completed). Isso quebra literalmente `timer.util.spec` e alguns asserts de `extraction.store.spec` — as tasks que tocam o timer incluem a atualização das specs afetadas (merge, não task separada de "fix compile").
- Naming: padrão 2025 do CLI — `*.page.ts`, `*.component.ts`, `*.store.ts`, `*.model.ts`, `*.util.ts`.
- Commits: um por task — `feat(guides):`, `feat(extract):`, `refactor(extract):`, `chore(guides):`.
- Design tokens: toda UI consome os CSS custom properties de `styles.scss` (mapeamento do DESIGN.md), **nunca** valores hardcoded; tokens são styles **scoped** por componente (Lessons Learned — verificar que cada componente define o CSS que usa no template) e `font-family` em todo `button-*`.
- Constantes de receita vivem no **modelo** (`guide.model.ts`), como `BREW_METHODS`/`RATIO_PRESETS` no `brew.model.ts` (fonte única). `ExtractionStore` injeta `GuideStore` (sem ciclo — `GuideStore` não conhece o `ExtractionStore`).
- Preferência: chave `guide:preferredRecipe`, payload `string` (id), envelope versionado via `StorageService` (corrompida → `null` → abre sem receita).
- Sub-agents: tasks `[P]` via um sub-agent por task, em paralelo; tasks sequenciais via um sub-agent por vez. Cada sub-agent recebe só a definição da task + convenções (AGENTS.md, DESIGN.md, TESTING.md).
- MCPs/Skills: NENHUM aplicável à execução (confirmado com o usuário; sem MCPs configurados, sem skill de código instalada além do tlc-spec-driven).

---

## Execution Plan

### Phase 1: Modelos (Parallel)

```
T1  (BrewModel — TimerMode/TimerPhase, aditivo)
T2  (GuideModel — receitas)
```

### Phase 2: Utils e GuideStore (Parallel)

```
T1 ──┬─→ T3 [P]  (GuideUtil)
     └─→ T4 [P]  (TimerState generalizado + fallout)
T2 ──┬─→ T3 [P]
     ├─→ T5 [P]  (GuideStore)
     └─→ T4 [P]  (via T1)
```

### Phase 3: ExtractionStore (Sequential)

```
T3, T4, T5 → T6
```

### Phase 4: Componentes de UI (Parallel)

```
T6 ──┬─→ T7 [P]  (BrewTimer variante)
     └─→ T8 [P]  (RecipeSelector)
T2 ──→ T9 [P]  (GuidesPage)
T2, T3 ──→ T10 [P]  (GuideDetailPage)
```

### Phase 5: Wiring (Parallel)

```
T9, T10 → T11 [P]  (app.routes)
T7, T8 → T12 [P]  (ExtractPage)
```

### Phase 6: Validação (Sequential)

```
T11, T12 → T13
```

---

## Diagram-Definition Cross-Check

| Task | Depends on (corpo) | Diagram mostra | Status |
| --- | --- | --- | --- |
| T1 | None | início do fluxo | ✅ |
| T2 | None | início do fluxo | ✅ |
| T3 | T1, T2 | T1/T2 → T3 | ✅ |
| T4 | T1 | T1 → T4 | ✅ |
| T5 | T2, T3 | T2/T3 → T5 | ✅ |
| T6 | T3, T4, T5 | T3/T4/T5 → T6 | ✅ |
| T7 | T4, T6 | T6 → T7 | ✅ |
| T8 | T2, T3, T6 | T6 → T8 | ✅ |
| T9 | T2 | T2 → T9 | ✅ |
| T10 | T2, T3 | T2/T3 → T10 | ✅ |
| T11 | T9, T10 | T9/T10 → T11 | ✅ |
| T12 | T7, T8 | T7/T8 → T12 | ✅ |
| T13 | T11, T12 | T11/T12 → T13 | ✅ |

---

## Task Breakdown

### T1: BrewModel — adicionar `TimerMode` e `TimerPhase`

**What**: Adicionar os tipos `TimerMode = 'simple' | 'recipe'` e `TimerPhase { id, label, targetSeconds }` ao modelo do brew. **Aditivo** — `TimerState`/`BrewState` NÃO mudam nesta task (fica para T4).
**Where**: `src/app/core/models/brew.model.ts`
**Depends on**: None
**Reuses**: estrutura existente do `brew.model.ts`
**Requirement**: GUIDE-07, GUIDE-08 (base para fases do cronômetro)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `export type TimerMode = 'simple' | 'recipe'`
- [ ] `export interface TimerPhase { id: string; label: string; targetSeconds: number | null }`
- [ ] `TimerState`/`BrewState` intocados nesta task (tipos existentes seguem compilando sem mudança)
- [ ] `ng build` compila sem erros

**Tests**: none (modelo — sem lógica)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): TimerMode e TimerPhase no modelo do brew`

---

### T2: GuideModel — tipos + 3 receitas estáticas V60 [P]

**What**: Criar o modelo de domínio dos guias: `GuideMethod`, `RecipePhase`, `ExtractionRecipe`, constante `RECIPES` (Equilibrada, Intensa, Suave) e `RECIPES_BY_ID` (D-GUIDE-10 — conteúdo estático embutido).
**Where**: `src/app/core/models/guide.model.ts`
**Depends on**: None
**Reuses**: nada (domínio novo); padrão de constantes de `brew.model.ts`
**Requirement**: GUIDE-02, GUIDE-03, GUIDE-04, GUIDE-05, GUIDE-12

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `GuideMethod = 'v60'`; `RecipePhase { id, nome, tempoObjetivo, volumeAgua, descricao }`; `ExtractionRecipe { id, method, nome, foco, moagem, baseDose, tempoTotalEstimado, fases }`
- [ ] `RECIPES` com exatamente o conteúdo da tabela do spec (base 20g/300g):
  - **Equilibrada** (`v60-equilibrada`, foco "Doçura e corpo médio", moagem "padrão", ~150s): Bloom 40g/30s → Vertida Principal 160g/75s → Finalização 300g/150s
  - **Intensa** (`v60-intensa`, foco "Acidez e brilho", moagem "levemente mais fina", ~125s): Bloom 50g/40s → Vertida única 300g/90s → **Decantação 300g/125s** (volume repete o acumulado — sem fase vazia, GUIDE-04)
  - **Suave** (`v60-suave`, foco "Doçura prolongada", moagem "um pouco mais grossa", ~180s): Bloom 40g/30s → 1ª Vertida 150g/60s → 2ª Vertida 225g/90s → Finalização 300g/180s
- [ ] `tempoObjetivo` e `volumeAgua` são **cumulativos** (D-GUIDE-04/05); `id` de cada fase estável (ex.: `v60-equilibrada-1`)
- [ ] `RECIPES_BY_ID: Record<string, ExtractionRecipe>` derivado de `RECIPES`
- [ ] `ng build` compila sem erros

**Tests**: none (modelo — conteúdo estático sem lógica)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(guides): modelo das receitas (3 V60 estaticas)`

---

### T3: GuideUtil — escala de volumes pura + ponte para fases do timer [P]

**What**: Funções puras `scaleVolume`, `scaledPhases` e `recipeToTimerPhases` (D-GUIDE-06: `volume × dose / baseDose`, arredondado; tempos fixos; dose inválida → base) + spec unitário.
**Where**: `src/app/core/utils/guide.util.ts` + `guide.util.spec.ts`
**Depends on**: T1, T2
**Reuses**: `TimerPhase` de `brew.model.ts` (T1); `ExtractionRecipe`/`RecipePhase` de `guide.model.ts` (T2); `parsePositiveNumber` de `brew-ratio.util.ts` (usado pelos chamadores, não no util)
**Requirement**: GUIDE-15, GUIDE-16, GUIDE-17, GUIDE-18

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `interface ScaledPhase { nome: string; volumeAgua: number; tempoObjetivo: number; descricao: string }`
- [ ] `scaleVolume(volume, dose, baseDose): number` — `Math.round(volume × dose / baseDose)`
- [ ] `scaledPhases(recipe, dose: number | null): ScaledPhase[]` — dose `null` → volumes base (20g); tempos **sempre** fixos
- [ ] `recipeToTimerPhases(recipe): TimerPhase[]` — `{ id: f.id, label: f.nome, targetSeconds: f.tempoObjetivo }` (metas cumulativas)
- [ ] Spec cobre: `scaleVolume(40,25,20)=50`, `(160,25,20)=200`, `(300,25,20)=375`; `scaledPhases(Equilibrada, 25)` → 50/200/375; dose `null` → 40/160/300; arredondamento (`40×23/20 → 46`); tempos fixos após escala; `recipeToTimerPhases(Suave)` → targets `[30, 60, 90, 180]` e labels dos nomes
- [ ] `ng test --include='**/guide.util.spec.ts'` verde — Test count: 12+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/guide.util.spec.ts'` → verde, 12+ testes

**Commit**: `feat(guides): guia util puro (escala + fases) + unit tests`

---

### T4: TimerState generalizado + TimerUtil (modo receita) + fallout de compilação

**What**: Refactor atômico do timer: `TimerState` ganha `mode`/`phaseIndex`/`phases`/`completed` e `BrewState.phase` vira `string`; `timer.util` é generalizado (`SIMPLE_PHASES`, `createRecipeTimerState`, `currentPhase`, `tickTimer` com auto-advance, `advancePhase` de receita/completude); ajustar os consumidores que quebram na compilação (store, brew-timer) e as specs afetadas no MESMO task (merge).
**Where**: `src/app/core/models/brew.model.ts` · `src/app/core/utils/timer.util.ts` · `timer.util.spec.ts` · `src/app/core/stores/extraction.store.ts` · `extraction.store.spec.ts` · `src/app/features/extract/brew-timer.component.ts`
**Depends on**: T1
**Reuses**: `PHASE_LABEL` (construir `SIMPLE_PHASES`), `TimerPhase` (T1)
**Requirement**: GUIDE-07, GUIDE-08, GUIDE-09, GUIDE-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Modelo: `TimerState { status, mode: TimerMode, phaseIndex, phases: TimerPhase[], phaseSeconds, totalSeconds, completed }`; `BrewState.phase: string` (id da fase ativa)
- [ ] `timer.util`: `SIMPLE_PHASES` (Pré-infusão/Extração, `targetSeconds: null`); `createTimerState()` → modo `simple`, `phaseIndex 0`, `completed false`; `createRecipeTimerState(phases)` → modo `recipe` idle na 1ª fase; `currentPhase(state)` → `phases[phaseIndex]`
- [ ] `tickTimer`: incrementa `phaseSeconds`+`totalSeconds`; **modo receita e não concluído**: `totalSeconds >= targetSeconds` da fase atual → avança (próxima fase, `phaseSeconds 0`, total preservado); última fase → `completed: true` (para de avançar, total continua); idle/paused → **mesma referência** (comportamento M3)
- [ ] `advancePhase`: **simples** — pré-infusão → extração (já em extração → mesma referência); **receita** — próxima fase; última → `completed`; concluído → no-op; `formatMmSs` intocado
- [ ] `extraction.store`: computeds gerais `currentPhase`/`currentPhaseLabel`/`currentPhaseTarget`; `brewState` usa `currentPhase().id`/`.label` (fase da receita em modo receita); `PHASE_LABEL` deixado de ser importado
- [ ] `brew-timer.component`: `phaseLabel = computed(() => extractStore.currentPhaseLabel())` (display da M3 permanece: `phaseSeconds` + "Total")
- [ ] Specs atualizadas no mesmo task: `timer.util.spec` reescrito (casos simples M3 preservados + modo receita: auto-advance ao atingir meta, `phaseSeconds` reseta, conclusão na última, manual no last, no-op concluído, mesmas referências idle/paused); `extraction.store.spec` asserts `timer().phase` → `currentPhase().id` (`'preinfusion'`)
- [ ] `ng test --include='**/timer.util.spec.ts'` e `--include='**/extraction.store.spec.ts'` verde — Test count: timer 20+ · extraction.store 13+ (sem remoções silenciosas)
- [ ] `ng build` compila sem erros (árvore verde ao fim do task)

**Tests**: unit
**Gate**: quick + build

**Verify**:
- `ng test --include='**/timer.util.spec.ts' --include='**/extraction.store.spec.ts'` → verde
- `ng build` → ok

**Commit**: `refactor(extract): TimerState generalizado (modo receita) + unit tests`

---

### T5: GuideStore — preferência de receita persistida [P]

**What**: Store global das receitas e da preferência: seleção em sessão + persistência do id via `StorageService` (chave `guide:preferredRecipe`, envelope versionado) + spec unitário. **Não** herda `BaseStore` (é preferência, não coleção).
**Where**: `src/app/core/stores/guide.store.ts` + `guide.store.spec.ts`
**Depends on**: T2, T3
**Reuses**: `StorageService` (herdado da M1 — `get`/`set`/`remove` com envelope); `RECIPES_BY_ID` de `guide.model.ts`
**Requirement**: GUIDE-19, GUIDE-21, GUIDE-22

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `selectedId = signal<string | null>(null)`; `selectedRecipe = computed<ExtractionRecipe | null>` (resolve em `RECIPES_BY_ID`; id inexistente → `null`)
- [ ] `restorePreference()`: `storage.get<string>('guide:preferredRecipe')`; id válido → `selectedId.set(id)`; inválido/corrompido → `selectedId.set(null)` (sem throw — GUIDE-22)
- [ ] `select(id)`: id válido → `selectedId.set(id)` + `storage.set(KEY, id)` (GUIDE-19); id inválido → no-op
- [ ] `clearPreference()`: `selectedId.set(null)` + `storage.remove(KEY)` (GUIDE-22)
- [ ] Spec com mock do `StorageService` (padrão dos stores M2/M4): `select` persiste; `restorePreference` carrega id válido; id inexistente → `null`; `clearPreference` remove e zera `selectedId`
- [ ] `ng test --include='**/guide.store.spec.ts'` verde — Test count: 8+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/guide.store.spec.ts'` → verde, 8+ testes

**Commit**: `feat(guides): guide store com preferencia persistida + unit tests`

---

### T6: ExtractionStore — orquestração do modo receita

**What**: Estender o `ExtractionStore` (injeta `GuideStore`) com a orquestração da receita: computeds (`selectedRecipe`, `isRecipeMode`, `isCompleted`, `scaledActivePhases`), métodos (`routeEntered`, `selectRecipe`, `exitRecipe`, `selectMethod` recipe-aware, `reset` mode-aware), `brewState` recipe-aware e spec estendido.
**Where**: `src/app/core/stores/extraction.store.ts` + `extraction.store.spec.ts`
**Depends on**: T3, T4, T5
**Reuses**: `TimerUtil` generalizado (T4: `createRecipeTimerState`, `createTimerState`), `GuideUtil` (T3: `recipeToTimerPhases`, `scaledPhases`), `GuideStore` (T5), `RECIPES_BY_ID`
**Requirement**: GUIDE-07, GUIDE-08, GUIDE-09, GUIDE-10, GUIDE-11, GUIDE-12, GUIDE-13, GUIDE-14, GUIDE-15, GUIDE-19, GUIDE-20, GUIDE-21, GUIDE-22, GUIDE-23, GUIDE-24, GUIDE-25

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Computeds: `selectedRecipe` (do `GuideStore`); `isRecipeMode` (`timer().mode === 'recipe'`); `isCompleted`; `scaledActivePhases` (receita ativa ? `scaledPhases(recipe, dose())` : `[]`)
- [ ] `routeEntered()`: `guideStore.restorePreference()`; receita válida **e** `recipe.method === this.method()` → `timer.set(createRecipeTimerState(recipeToTimerPhases(recipe)))` zerado; senão `timer.set(createTimerState())` (GUIDE-20/21/22)
- [ ] `selectRecipe(id)`: `RECIPES_BY_ID[id]` → `guideStore.select(id)` (persiste) + `running(false)` + timer na receita zerado (reset ao selecionar com timer rodando — edge do spec)
- [ ] `exitRecipe()`: `guideStore.clearPreference()` + `running(false)` + timer simples (GUIDE-14/15)
- [ ] `selectMethod(m)`: aplica preset; **m ≠ v60** e timer em modo receita → timer simples **preservando a preferência** (GUIDE-23); **m = v60** com `selectedRecipe` → restaura a receita zerada (GUIDE-24)
- [ ] `reset()` **mode-aware**: modo receita → volta à 1ª fase da receita (zerado); simples → `createTimerState()` (GUIDE-11); `routeExited()` → `reset()` (preferência permanece)
- [ ] `brewState`: `phase` = `currentPhase().id`, `phaseLabel` = `currentPhase().label` (nome da fase da receita em modo receita); `totalTime`/`running` intactos (M4)
- [ ] Spec estendido (fake timers + `flushEffects` + mock do StorageService p/ `GuideStore`): `routeEntered` restaura preferência compatível (v60 → modo receita, 1ª fase zerada) e NÃO restaura incompatível/inexistente; `selectRecipe` configura fases + reseta + persiste; `exitRecipe` volta a simples + limpa preferência; `selectMethod('espresso')` com receita ativa → simples e preferência preservada; voltar ao v60 → restaurada; `reset` em receita → 1ª fase zerado; auto-advance real no tick; `brewState` em modo receita → `phaseLabel` = nome da fase, `totalTime` reflete ticks
- [ ] `ng test --include='**/extraction.store.spec.ts'` verde — Test count: 20+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/extraction.store.spec.ts'` → verde, 20+ testes

**Commit**: `feat(extract): orquestracao do modo receita no ExtractionStore + unit tests`

---

### T7: BrewTimerComponent — variante visual do modo receita [P]

**What**: Adaptar o display do cronômetro: no modo receita, o número em destaque vira o **total cumulativo** + linha de "Meta {mm:ss}" + indicador "[OK] Concluída" quando `completed`; modo simples permanece idêntico à M3.
**Where**: `src/app/features/extract/brew-timer.component.ts`
**Depends on**: T4, T6
**Reuses**: `timer-display`, `timer-xl`, `display-md`, `caption-md`, `heading-md`, `button-primary`/`button-secondary`, `formatMmSs`, `ExtractionStore` (`isRecipeMode`, `isCompleted`, `currentPhaseTarget`, `currentPhaseLabel`)
**Requirement**: GUIDE-07, GUIDE-08, GUIDE-10, GUIDE-11

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Modo simples: display da M3 intacto (`phaseSeconds` em `timer-xl`, "Total {mm:ss}" em `display-md`)
- [ ] Modo receita: `timer-xl` exibe `totalSeconds` cumulativo; `caption-md` "Meta {mm:ss}" (via `currentPhaseTarget`); quando `isCompleted` → indicador "[OK] Concluída" (vocabulário ASCII, sem token novo)
- [ ] Controles Iniciar/Pausar/Reiniciar/Avançar fase inalterados (delegam ao store; auto-advance/`completed` vêm do estado)
- [ ] Tokens definidos como styles scoped no componente (não global) + `font-family` em todo `button-*` (Lessons Learned)
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T13)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): BrewTimer com variante modo receita`

---

### T8: RecipeSelectorComponent — seletor + fases ativas + atalho biblioteca [P]

**What**: Nova seção do painel: header "Guias de extração" com atalho "biblioteca →" (sempre visível — GUIDE-13), cards das receitas V60 (seleção), lista de fases da receita ativa com volumes escalados pela dose e botão "Modo simples".
**Where**: `src/app/features/extract/recipe-selector.component.ts`
**Depends on**: T2, T3, T6
**Reuses**: `RECIPES` de `guide.model.ts`; `ExtractionStore` (`selectedRecipe`, `isRecipeMode`, `phaseIndex`, `isCompleted`, `scaledActivePhases`, `selectRecipe`, `exitRecipe`); tokens `button-tab`/`button-tab-active`, `link-inline`, `heading-md`, `body-strong`, `caption-md`, `coffee-mute`, `button-secondary`; `formatMmSs`
**Requirement**: GUIDE-05, GUIDE-06, GUIDE-12, GUIDE-13, GUIDE-14, GUIDE-15, GUIDE-16

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Header: `heading-md` "[~] Guias de extração" + `link-inline` "biblioteca →" (`routerLink="/guides"`) — renderizado mesmo com método ≠ V60 (GUIDE-05/13)
- [ ] `@if (method() === 'v60')`: cards `button-tab`/`button-tab-active` dos 3 `RECIPES` (marker `[*]`/`[ ]` + nome + `caption-md` foco · moagem · "~{formatMmSs(tempoTotalEstimado)}"); clique → `selectRecipe(id)`; `@else`: `caption-md coffee-mute` "Receitas disponíveis para Coado/V60."
- [ ] Receita ativa (`isRecipeMode`): lista de fases de `scaledActivePhases()` (marker `[*]` fase atual / `[x]` concluída / `[ ]` futura + nome `body-strong` + `caption-md coffee-mute` "{volumeAgua}g · {formatMmSs(tempoObjetivo)}") — volumes escalados pela dose do painel (GUIDE-12/15/16)
- [ ] Botão `button-secondary` "Modo simples" → `exitRecipe()` (GUIDE-14)
- [ ] Tokens scoped + `font-family` nos botões (Lessons Learned); mobile ≤ 480px sem scroll horizontal da página
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T13)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): RecipeSelector (seletor + fases + atalho)`

---

### T9: GuidesPage — biblioteca de receitas (lista) [P]

**What**: Página `/guides` de consulta passiva: lista as 3 receitas V60 em cards (nome, foco, moagem, tempo total) com navegação ao detalhe (D-GUIDE-09 — sem cronômetro).
**Where**: `src/app/features/guides/guides.page.ts`
**Depends on**: T2
**Reuses**: `RECIPES`; tokens `button-tab`, `card-title`, `caption-md`, `coffee-mute`, `heading-md`, `body-md`; `formatMmSs`
**Requirement**: GUIDE-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `recipes = RECIPES`; cards com `routerLink="['/guides', recipe.id]"`
- [ ] Template: `heading-md` "[~] Guias de Extração" + nota `body-md` "Receitas passo a passo por método. Na v1: Coado/V60."
- [ ] Cada card: nome (`card-title`), foco · "Moagem {moagem}" · "~{formatMmSs(tempoTotalEstimado)}" (`caption-md coffee-mute`)
- [ ] Tokens scoped + `font-family` nos botões/links-button (Lessons Learned); sem scroll horizontal em mobile
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T13)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(guides): pagina da biblioteca`

---

### T10: GuideDetailPage — detalhe da receita com dose local [P]

**What**: Página `/guides/:id` de consulta passiva: fases em ordem com volume **acumulado** escalado por um campo de dose local (default 20g) e descrição (D-GUIDE-07 — dose da biblioteca é própria, não persistida).
**Where**: `src/app/features/guides/guide-detail.page.ts`
**Depends on**: T2, T3
**Reuses**: `RECIPES_BY_ID`; `scaledPhases`/`ScaledPhase` de `guide.util.ts` (T3); `parsePositiveNumber` de `brew-ratio.util.ts`; tokens `text-input`, `heading-md`, `body-md`, `body-strong`, `caption-md`, `coffee-mute`, `hairline`; `formatMmSs`; padrão de redirect de `log-detail.page.ts`
**Requirement**: GUIDE-01, GUIDE-02, GUIDE-03, GUIDE-04, GUIDE-16, GUIDE-17

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `recipe = computed(() => RECIPES_BY_ID[id])`; id ausente/inexistente → `router.navigate(['/guides'])` (padrão `log-detail`)
- [ ] `doseInput = signal('20')`; `phases = computed(() => scaledPhases(recipe(), parsePositiveNumber(doseInput())))` — dose inválida → volumes base (GUIDE-17)
- [ ] Template: nome (`heading-md`), foco (`body-md`), "Moagem: {moagem}" (`caption-md coffee-mute`), campo Dose (`text-input` inputmode decimal), nota `caption-md coffee-mute` "Volumes acumulados ao fim da fase · Tempos cumulativos" (GUIDE-03)
- [ ] Fases em ordem: nome (`body-strong`), "{volumeAgua}g · {formatMmSs(tempoObjetivo)}" (`caption-md coffee-mute`), descrição (`body-md`); fase sem vertida (decantação da Intensa) exibe o acumulado anterior (GUIDE-04)
- [ ] Tokens scoped; sem scroll horizontal em mobile
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T13)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(guides): detalhe da receita com dose local`

---

### T11: app.routes — rotas da biblioteca [P]

**What**: Registrar `/guides` e `/guides/:id` como rotas lazy (padrão das demais), mantendo o wildcard 404.
**Where**: `src/app/app.routes.ts`
**Depends on**: T9, T10
**Reuses**: padrão `loadComponent` das rotas existentes
**Requirement**: GUIDE-01, GUIDE-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `{ path: 'guides', loadComponent: () => import('./features/guides/guides.page') }`
- [ ] `{ path: 'guides/:id', loadComponent: () => import('./features/guides/guide-detail.page') }`
- [ ] Ordem antes do wildcard `**`; wildcard 404 intacto
- [ ] `ng build` compila sem erros

**Tests**: none (rotas — verificação manual na T13)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(guides): rotas da biblioteca`

---

### T12: ExtractPage — compor RecipeSelector + routeEntered [P]

**What**: Página `/extract` passa a compor o `RecipeSelectorComponent` (abaixo dos chips de método) e chamar `routeEntered()` no init (restaura receita preferida); mantém `routeExited()` no destroy (M3).
**Where**: `src/app/features/extract/extract.page.ts`
**Depends on**: T7, T8
**Reuses**: `RecipeSelectorComponent` (T8), `ExtractionStore` (`routeEntered`/`routeExited` da T6), composição existente
**Requirement**: GUIDE-05, GUIDE-06, GUIDE-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Template compõe `<app-recipe-selector />` entre `<app-method-selector />` e `<app-ratio-calculator />` (ordem do design)
- [ ] `constructor()`: `extractStore.routeEntered()` (restaura receita zerada na 1ª fase — GUIDE-20/21)
- [ ] `destroyRef.onDestroy` → `extractStore.routeExited()` (reset; preferência permanece — GUIDE-06/12 edge)
- [ ] Botão "Salvar no histórico" da M4 intacto (navega com `brewState`)
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T13)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): ExtractPage compoe RecipeSelector + routeEntered`

---

### T13: Validação manual da M6 + full gate

**What**: Passada de validação final: fluxo completo demo-ável, biblioteca, preferência, troca de método, mobile. Rodar full gate.
**Where**: — (verificação)
**Depends on**: T11, T12
**Reuses**: checklist de verificação manual do design (Testes & Gate) + Independent Tests do spec
**Requirement**: GUIDE-01..25

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `ng test` → suíte toda verde (guide.util + timer.util + guide.store + extraction.store + demais)
- [ ] `ng build` sem erros; `ng lint` limpo
- [ ] Biblioteca: `/guides` lista 3 cards; `/guides/v60-equilibrada` mostra 40/30s → 160/1m15s → 300/2m30s; Intensa mostra a decantação com 300g acumulado; dose 25g no detalhe → 50/200/375 (Independent Tests GUIDE-01/03/04)
- [ ] Painel: atalho "biblioteca →" navega a `/guides` e volta preservando método/dose/receita (GUIDE-05/06)
- [ ] Receita dirige o timer: selecionar Suave, Start → "Pré-infusão (Bloom)" meta 0:30; aos 30s avança sozinho para "1ª Vertida"; avanço manual antes da meta; concluir última → "[OK] Concluída" sem avanço automático; dose 25g → volumes 50/187/281/375 (Independent Tests GUIDE-07..10, GUIDE-15/16)
- [ ] Modo simples: limpa receita, timer 2 fases zerado; recarregar painel sem preferência → simples (GUIDE-14/15)
- [ ] Preferência: selecionar Intensa → sair e voltar a `/extract` → restaurada zerada; corromper LocalStorage → abre sem receita, sem erro (GUIDE-19..22)
- [ ] Troca de método: Suave ativa → Espresso → 2 fases (preferência preservada); voltar ao V60 → Suave restaurada (GUIDE-23/24)
- [ ] Mobile ≤ 480px: biblioteca e fases em coluna, sem scroll horizontal; bottom nav intacta
- [ ] Console limpo no load
- [ ] Cobertura GUIDE-01..25 = 25/25 verificada

**Tests**: none (manual + gates)
**Gate**: full

**Verify**:
- `ng test && ng build && ng lint` → todos verdes
- Checklist manual acima concluído

**Commit**: `chore(guides): validacao M6`

---

## Parallel Execution Map

```
Phase 1 (Parallel):   T1  T2
Phase 2 (Parallel):   T1 ──┬─→ T3 [P]
                            ├─→ T4 [P]
                      T2 ──┬─→ T3 [P]
                            ├─→ T5 [P]
                            └─→ T4 [P]
Phase 3 (Sequential): T3, T4, T5 → T6
Phase 4 (Parallel):   T6 ──┬─→ T7 [P]
                            └─→ T8 [P]
                      T2 ──→ T9 [P]
                      T2, T3 ──→ T10 [P]
Phase 5 (Parallel):   T9, T10 → T11 [P]
                      T7, T8 → T12 [P]
Phase 6 (Sequential): T11, T12 → T13
```

**Paralelismo**: unit tests são parallel-safe (Vitest isola arquivos); tasks de UI não têm estado mutável compartilhado entre si. **Cuidado com arquivos compartilhados**: T4 e T6 tocam `extraction.store.ts`/`extraction.store.spec.ts` e `brew-timer.component.ts` (sequencial: T4 → T7/T6); T1 e T4 tocam `brew.model.ts` (T4 depende de T1 — nunca em paralelo). T3/T4/T5 (Phase 2) não se sobrepõem em arquivos. T11 (rotas) e T12 (página) são independentes (arquivos distintos).

---

## Test Co-location Validation

| Task | Camada criada/alterada | Matriz exige | Task diz | Status |
| --- | --- | --- | --- | --- |
| T1 | Modelo (brew.model) | none | none | ✅ |
| T2 | Modelo (guide.model) | none | none | ✅ |
| T3 | Util puro (guide.util) | unit* | unit | ✅ |
| T4 | TimerState + TimerUtil + stores/component afetados | unit* | unit | ✅ |
| T5 | GuideStore (store) | unit | unit | ✅ |
| T6 | ExtractionStore (store) | unit | unit | ✅ |
| T7 | BrewTimer (UI) | none (manual) | none | ✅ |
| T8 | RecipeSelector (UI) | none (manual) | none | ✅ |
| T9 | GuidesPage (UI) | none (manual) | none | ✅ |
| T10 | GuideDetailPage (UI) | none (manual) | none | ✅ |
| T11 | Rotas (app.routes) | none (manual) | none | ✅ |
| T12 | ExtractPage (UI) | none (manual) | none | ✅ |
| T13 | — (validação) | — | none | ✅ |

*Utils de lógica pura e a generalização do timer → `unit` (estende a matriz do TESTING.md, mesmo padrão AD-005/AD-011: cálculo e máquina de estados unit-testáveis).

---

## Requirement Traceability

| Requirement | Tasks |
| --- | --- |
| GUIDE-01 | T9, T10, T11 |
| GUIDE-02 | T2, T10 |
| GUIDE-03 | T2, T10 |
| GUIDE-04 | T2, T10 |
| GUIDE-05 | T2, T8, T11, T12 |
| GUIDE-06 | T8, T12 |
| GUIDE-07 | T1, T4, T6, T7 |
| GUIDE-08 | T1, T4, T6, T7 |
| GUIDE-09 | T4, T6 |
| GUIDE-10 | T4, T6, T7 |
| GUIDE-11 | T6, T7 |
| GUIDE-12 | T6, T8 |
| GUIDE-13 | T6, T8 |
| GUIDE-14 | T6, T8 |
| GUIDE-15 | T3, T6, T8, T10 |
| GUIDE-16 | T3, T8, T10 |
| GUIDE-17 | T3, T10 |
| GUIDE-18 | T3 |
| GUIDE-19 | T5, T6 |
| GUIDE-20 | T5, T6, T12 |
| GUIDE-21 | T5, T6 |
| GUIDE-22 | T5, T6 |
| GUIDE-23 | T6 |
| GUIDE-24 | T6 |
| GUIDE-25 | T6 |
| Cobertura | GUIDE 25/25 via T13 |
