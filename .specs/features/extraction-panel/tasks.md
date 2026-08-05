# Extraction Panel (M3) — Tasks

**Design**: `.specs/features/extraction-panel/design.md`
**Spec**: `.specs/features/extraction-panel/spec.md`
**Status**: Approved (2026-08-05 — usuário aprovou)

---

## Contexto de Execução

- A M3 executa **sobre a M1 concluída** (rota `/extract` lazy, tokens do DESIGN.md em `styles.scss`, padrão de store com Signals). Nenhum contrato da M1 muda; **nenhuma rota nova** (a `/extract` já existe).
- Naming: estilo 2025 do CLI — `*.page.ts`, `*.component.ts`, `*.store.ts`, `*.model.ts`, `*.util.ts`.
- Commits: um por task, formato `feat(extract): <descrição>`.
- Design tokens: toda UI consome os CSS custom properties de `styles.scss` (mapeamento do DESIGN.md), nunca valores hardcoded.
- Constantes de domínio (`BREW_METHODS`, `RATIO_PRESETS`, `PHASE_LABEL`) vivem no **modelo** (`brew.model.ts`), não nos componentes nem nos utils — o `RatioUtil` importa `RATIO_PRESETS` do modelo (esclarecimento: o design menciona o preset no util, mas a seção de Data Models o define como canônico; manter a fonte única no modelo).
- `ExtractionStore` é **transiente** (não estende `BaseStore`, não injeta `StorageService`) — ver AD-011.
- Sub-agents: tasks `[P]` via um sub-agent por task, em paralelo; tasks sequenciais via um sub-agent por vez. Cada sub-agent recebe só a definição da task + convenções (AGENTS.md, DESIGN.md, TESTING.md).

---

## Execution Plan

### Phase 1: Modelo + utils puros (Parallel após T1)

```
T1 ──┬─→ T2 [P]  (RatioUtil)
     └─→ T3 [P]  (TimerUtil)
```

### Phase 2: ExtractionStore (Sequential)

```
T2, T3 → T4
```

### Phase 3: Componentes de UI (Parallel)

```
T4 ──┬─→ T5 [P]  (MethodSelector)
     ├─→ T6 [P]  (RatioCalculator)
     └─→ T7 [P]  (BrewTimer)
```

### Phase 4: Página (Sequential)

```
T5, T6, T7 → T8
```

### Phase 5: Validação (Sequential)

```
T8 → T9
```

---

## Diagram-Definition Cross-Check

| Task | Depends on (corpo) | Diagram mostra | Status |
| --- | --- | --- | --- |
| T1 | None | início do fluxo | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1 | T1 → T3 | ✅ |
| T4 | T1, T2, T3 | T2, T3 → T4 | ✅ |
| T5 | T1, T4 | T4 → T5 | ✅ |
| T6 | T1, T2, T4 | T4 → T6 | ✅ |
| T7 | T1, T3, T4 | T4 → T7 | ✅ |
| T8 | T4, T5, T6, T7 | T5, T6, T7 → T8 | ✅ |
| T9 | T8 | T8 → T9 | ✅ |

---

## Task Breakdown

### T1: BrewModel — tipos, constantes e contrato BrewState

**What**: Criar o modelo de domínio do painel: tipos `BrewMethod`/`BrewPhase`/`TimerStatus`, constantes `BREW_METHODS`/`RATIO_PRESETS`/`PHASE_LABEL`, `TimerState` e o contrato `BrewState` (M4).
**Where**: `src/app/core/models/brew.model.ts`
**Depends on**: None
**Reuses**: nada (domínio novo; modelo da M1 não é tocado)
**Requirement**: EXTRACT-01, EXTRACT-02, EXTRACT-17, EXTRACT-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `BrewMethod = 'espresso' | 'v60' | 'prensa' | 'aeropress'`; `BrewPhase = 'preinfusion' | 'extraction'`; `TimerStatus = 'idle' | 'running' | 'paused'`
- [ ] `BREW_METHODS: BrewMethodInfo[]` na ordem do spec (Espresso, Coado/V60, Prensa Francesa, Aeropress) com labels PT-BR; `RATIO_PRESETS: Record<BrewMethod, number>` = `{ espresso: 2, v60: 16, prensa: 15, aeropress: 15 }`; `PHASE_LABEL` = Pré-infusão/Extração
- [ ] `TimerState { status, phase, phaseSeconds, totalSeconds }`; `BrewState { method, methodLabel, dose: number|null, ratio: number|null, water: number|null, phase, phaseLabel, phaseTime, totalTime, running }`
- [ ] Modelo NÃO carrega `version` (envelope é para persistência; aqui não há)
- [ ] `ng build` compila sem erros

**Tests**: none (modelo — sem lógica)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): modelo do painel (BrewState, métodos, presets)`

---

### T2: RatioUtil — cálculo puro do brew ratio [P]

**What**: Funções puras `parsePositiveNumber` e `suggestedWater` (dose × ratio, arredondado ao inteiro, `null` se inválido) + spec unitário.
**Where**: `src/app/core/utils/brew-ratio.util.ts` + `brew-ratio.util.spec.ts`
**Depends on**: T1
**Reuses**: `RATIO_PRESETS`/`BrewMethod` de `brew.model.ts`
**Requirement**: EXTRACT-02, EXTRACT-06, EXTRACT-07, EXTRACT-09, EXTRACT-10, EXTRACT-11

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `parsePositiveNumber(v: string): number | null` — vazio/não numérico/≤0 → `null`; ponto como separador decimal
- [ ] `suggestedWater(dose: string, ratio: string): number | null` — `null` se qualquer entrada inválida; senão `Math.round(dose × ratio)`
- [ ] `RATIO_PRESETS` lido do modelo (fonte única)
- [ ] Spec cobre: `suggestedWater('15','16') = 240`; arredondamento (`'10.3','16'` → 165); dose vazia/zero/negativa/não numérica → `null`; ratio vazio/zero/negativo → `null`; presets do modelo
- [ ] `ng test --include='**/brew-ratio.util.spec.ts'` verde — Test count: 10+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/brew-ratio.util.spec.ts'` → verde, 10+ testes

**Commit**: `feat(extract): brew ratio util puro + unit tests`

---

### T3: TimerUtil — máquina de estados pura do cronômetro [P]

**What**: Funções puras `createTimerState`/`tickTimer`/`advancePhase`/`formatMmSs` (a lógica do cronômetro sem `setInterval`) + spec unitário.
**Where**: `src/app/core/utils/timer.util.ts` + `timer.util.spec.ts`
**Depends on**: T1
**Reuses**: `TimerState`/`BrewPhase` de `brew.model.ts`
**Requirement**: EXTRACT-12, EXTRACT-13, EXTRACT-14, EXTRACT-15, EXTRACT-16

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `createTimerState(): TimerState` — `{ status: 'idle', phase: 'preinfusion', phaseSeconds: 0, totalSeconds: 0 }`
- [ ] `tickTimer(state): TimerState` — incrementa fase+total em 1; **no-op se status ≠ 'running'**
- [ ] `advancePhase(state): TimerState` — pré-infusão → extração: `phase: 'extraction'`, `phaseSeconds: 0`, `totalSeconds` preservado; já em `extraction` → no-op
- [ ] `formatMmSs(seconds): string` — `MM:SS` com padding, clamp ≥ 0 (0 → "00:00", 7 → "00:07", 65 → "01:05", 3600 → "60:00")
- [ ] Spec cobre: `createTimerState`; tick (running → incrementa; paused/idle → no-op); `advancePhase` (pré→extração zera fase preserva total; já extração → no-op); `formatMmSs` (4 casos acima)
- [ ] `ng test --include='**/timer.util.spec.ts'` verde — Test count: 10+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/timer.util.spec.ts'` → verde, 10+ testes

**Commit**: `feat(extract): timer util puro (maquina de estados) + unit tests`

---

### T4: ExtractionStore — estado transiente + cronômetro + brewState

**What**: Store global do painel (transiente, `providedIn: 'root'`): inputs método/dose/ratio/timer, derivados `water`/`brewState`, métodos de edição e do cronômetro (com `effect()` gerindo o intervalo), `routeExited` + spec unitário.
**Where**: `src/app/core/stores/extraction.store.ts` + `extraction.store.spec.ts`
**Depends on**: T1, T2, T3
**Reuses**: `TimerUtil` (`createTimerState`/`tickTimer`/`advancePhase`), `RatioUtil` (`suggestedWater`/`parsePositiveNumber`), `BrewModel` (tipos/constantes). **Não** herda `BaseStore`, **não** injeta `StorageService` (AD-011)
**Requirement**: EXTRACT-02, EXTRACT-03, EXTRACT-04, EXTRACT-05, EXTRACT-06, EXTRACT-09, EXTRACT-10, EXTRACT-11, EXTRACT-12, EXTRACT-13, EXTRACT-14, EXTRACT-15, EXTRACT-18, EXTRACT-19, EXTRACT-20, EXTRACT-21, EXTRACT-22

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `method = signal<BrewMethod>('espresso')`; `doseInput = signal('')`; `ratioInput = signal('2')`; `timer = signal<TimerState>(createTimerState())`
- [ ] `selectMethod(m)`: aplica `RATIO_PRESETS[m]` ao `ratioInput`, **mantém** `doseInput`, não toca no `timer`; `setDose`/`setRatio` atualizam inputs (funcionam com timer rodando)
- [ ] `water = computed(() => suggestedWater(doseInput(), ratioInput()))` — `number | null`; `dose`/`ratio` computeds via `parsePositiveNumber`; `brewState = computed<BrewState>` refletindo método/label/dose/ratio/água/fase/faseLabel/tempos/running (EXTRACT-20/21); sem brew ativo → fase pré-infusão, tempos 0, running false, sem erro (EXTRACT-22)
- [ ] Cronômetro: `start()`/`pause()`/`reset()`/`advancePhase()` mutam `timer` via utils puros; `effect()` gerencia `setInterval` de 1s apenas quando `status === 'running'` (com cleanup no pause/reset); `tick()` aplica `tickTimer`
- [ ] `routeExited()`: `reset()` do timer (método/dose/ratio permanecem)
- [ ] Spec (StorageService NÃO é usado — sem mock): default `espresso` + ratio `'2'`; `selectMethod('v60')` → ratio `'16'`, dose preservada, water recalcula; inputs inválidos → `water null` sem throw; fake timers para start/pause/reset/advancePhase (fase vs total); `routeExited` → timer zerado; `brewState` reflete mudanças e caso sem brew
- [ ] `ng test --include='**/extraction.store.spec.ts'` verde — Test count: 12+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/extraction.store.spec.ts'` → verde, 12+ testes

**Commit**: `feat(extract): extraction store transiente + unit tests`

---

### T5: MethodSelectorComponent — chips de método [P]

**What**: Chips horizontais roláveis dos 4 métodos com estado ativo (marker `[*]`), delegando seleção ao store.
**Where**: `src/app/features/extract/method-selector.component.ts`
**Depends on**: T1, T4
**Reuses**: tokens `button-tab`/`button-tab-active`; `BREW_METHODS`; `ExtractionStore`
**Requirement**: EXTRACT-01, EXTRACT-03, EXTRACT-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `methods = BREW_METHODS`; `selected = computed(() => extractStore.method())`; `select(m)` → `extractStore.selectMethod(m)`
- [ ] Template: container `overflow-x: auto` (sem scroll horizontal da página) com `@for` de chips `button-tab`/`button-tab-active`; chip ativo com marker `[*]` e `RouterLinkActive` não é necessário (estado vem do store)
- [ ] Utilizável em mobile ≤ 480px sem scroll horizontal da página
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T9)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): MethodSelector chips`

---

### T6: RatioCalculatorComponent — dose, ratio e readout de água [P]

**What**: Calculadora reativa: campo Dose (g), campo Ratio (1:X) e readout destacado de Água sugerida (`display-md` sobre latte, unidade "g", `—` quando nulo).
**Where**: `src/app/features/extract/ratio-calculator.component.ts`
**Depends on**: T1, T2, T4
**Reuses**: tokens `text-input`/`display-md`/`caption-md`/`coffee-mute`; `ExtractionStore` (`doseInput`/`ratioInput`/`water`); `suggestedWater` indireto via store
**Requirement**: EXTRACT-06, EXTRACT-08, EXTRACT-09, EXTRACT-10, EXTRACT-11, EXTRACT-19

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `dose = computed(() => extractStore.doseInput())`; `ratio = computed(() => extractStore.ratioInput())`; `water = computed(() => extractStore.water())`; `onDose`/`onRatio` delegam `setDose`/`setRatio`
- [ ] Inputs `text-input`: Dose (inputmode decimal), Ratio com prefixo "1 :" em `caption-md`; readout em `display-md` espresso sobre superfície latte com rótulo "Água sugerida" e unidade "g"; `—` quando `water` é `null`
- [ ] Edição funcional com timer rodando (EXTRACT-19) — inputs não são bloqueados
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T9)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): RatioCalculator com readout de agua`

---

### T7: BrewTimerComponent — display do cronômetro + controles [P]

**What**: Display digital do cronômetro (`timer-display`): fase, tempo da fase em mm:ss (destaque), total acumulado e controles Iniciar/Pausar/Reiniciar/Avançar fase.
**Where**: `src/app/features/extract/brew-timer.component.ts`
**Depends on**: T1, T3, T4
**Reuses**: tokens `timer-display`/`heading-md`/`display-md`/`button-primary`/`button-secondary`; `TimerUtil` (`formatMmSs`); `PHASE_LABEL`; `ExtractionStore`
**Requirement**: EXTRACT-12, EXTRACT-13, EXTRACT-14, EXTRACT-15, EXTRACT-16, EXTRACT-17

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `timer = computed(() => extractStore.timer())`; `phaseLabel` (PHASE_LABEL), `phaseTime`/`totalTime` via `formatMmSs`
- [ ] Template: label da fase (`heading-md`), número grande (`timer-xl` via `timer-display`), "Total {mm:ss}" (`display-md`), botões `button-primary` (Iniciar/Pausar alternando pelo `status`) + `button-secondary` (Reiniciar, Avançar fase)
- [ ] Start → pré-infusão marca; Avançar fase → extração (fase reinicia, total continua); Pausar congela; Reiniciar zera e volta à pré-infusão
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T9)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): BrewTimer display + controles`

---

### T8: ExtractPage — composição do painel + reset ao sair da rota

**What**: Substituir o placeholder de `/extract` pela página real: cabeçalho "Extrair" + timer no topo, chips de método e calculadora empilhados; chamar `routeExited()` no `DestroyRef` (cronômetro zera ao sair da rota).
**Where**: `src/app/features/extract/extract.page.ts` (substitui placeholder da M1; rota já existe)
**Depends on**: T4, T5, T6, T7
**Reuses**: tokens `heading-md`/`spacing.section`; `BrewTimerComponent`/`MethodSelectorComponent`/`RatioCalculatorComponent`; `ExtractionStore`
**Requirement**: EXTRACT-01, EXTRACT-18

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Página compõe `<app-brew-timer>`, `<app-method-selector>`, `<app-ratio-calculator>` empilhados (timer no topo, ritmo de seção) com cabeçalho "Extrair"
- [ ] `DestroyRef.onDestroy` → `extractStore.routeExited()` — ao sair de `/extract`, cronômetro zera (EXTRACT-18); método/dose/ratio permanecem
- [ ] Não toca `app.config.ts` (rota `/extract` já registrada na M1)
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T9)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(extract): ExtractPage painel + reset na saida`

---

### T9: Validação manual da M3 + full gate

**What**: Passada de validação final da M3: seletor de método, calculadora reativa, cronômetro com fases, reset na saída da rota, mobile. Rodar full gate.
**Where**: — (verificação)
**Depends on**: T8
**Reuses**: checklist de verificação manual do design (Testes & Gate)
**Requirement**: EXTRACT-01..22

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `ng test` → suíte toda verde (ratio + timer + extraction store)
- [ ] `ng build` sem erros; `ng lint` limpo
- [ ] Chips: 4 métodos; troca aplica preset; troca com dose preenchida mantém dose e recalcula água (EXTRACT-03/05)
- [ ] Calculadora: 15g + V60 → 240g; 16g → 256g; ratio 1:17 → 272g; zerar dose → `—` (Independent Test do spec)
- [ ] Timer: Start → pré-infusão marca; Avançar fase → extração reinicia fase, total continua; Pausar congela; Reiniciar zera e volta à pré-infusão; editar dose/ratio com timer rodando → timer inalterado, água recalcula; sair de `/extract` e voltar → cronômetro zerado
- [ ] Mobile ≤ 480px: chips roláveis e timer legível (40px → 32px) sem scroll horizontal; bottom nav intacta
- [ ] Console limpo no load
- [ ] Cobertura EXTRACT-01..22 = 22/22 verificada

**Tests**: none (manual + gates)
**Gate**: full

**Verify**:
- `ng test && ng build && ng lint` → todos verdes
- Checklist manual acima concluído

**Commit**: `chore(extract): validacao M3`

---

## Parallel Execution Map

```
Phase 1 (Sequential):   T1
Phase 2 (Parallel):     T1 ──┬─→ T2 [P]
                              └─→ T3 [P]
Phase 3 (Sequential):   T2, T3 → T4
Phase 4 (Parallel):     T4 ──┬─→ T5 [P]
                              ├─→ T6 [P]
                              └─→ T7 [P]
Phase 5 (Sequential):   T5, T6, T7 → T8
Phase 6 (Sequential):   T8 → T9
```

**Paralelismo**: unit tests são parallel-safe (Vitest isola arquivos); tasks de UI não têm estado mutável compartilhado. T2/T3 (utils puros, dependem do modelo T1) e T5/T6/T7 (componentes, dependem do store T4) são `[P]`. T4 depende dos utils; T8 depende dos 3 componentes; T9 valida tudo.

---

## Test Co-location Validation

| Task | Camada criada/alterada | Matriz exige | Task diz | Status |
| --- | --- | --- | --- | --- |
| T1 | Modelo de domínio (BrewModel) | none | none | ✅ |
| T2 | Util puro (brew-ratio) | unit* | unit | ✅ |
| T3 | Util puro (timer) | unit* | unit | ✅ |
| T4 | ExtractionStore (store) | unit | unit | ✅ |
| T5 | MethodSelector (UI) | none (manual) | none | ✅ |
| T6 | RatioCalculator (UI) | none (manual) | none | ✅ |
| T7 | BrewTimer (UI) | none (manual) | none | ✅ |
| T8 | ExtractPage (UI) | none (manual) | none | ✅ |
| T9 | — (validação) | — | none | ✅ |

*Utils de lógica pura → `unit`, estendendo a matriz do TESTING.md (AD-005 exige cálculo de ratio + máquina de estados unit-testáveis).

---

## Requirement Traceability

| Requirement | Tasks |
| --- | --- |
| EXTRACT-01 | T1, T5, T8 |
| EXTRACT-02 | T1, T2, T4 |
| EXTRACT-03 | T4, T5 |
| EXTRACT-04 | T4, T6 |
| EXTRACT-05 | T4, T5 |
| EXTRACT-06 | T2, T4, T6 |
| EXTRACT-07 | T2, T4 |
| EXTRACT-08 | T6 |
| EXTRACT-09 | T2, T4, T6 |
| EXTRACT-10 | T2, T4, T6 |
| EXTRACT-11 | T2, T4, T6 |
| EXTRACT-12 | T3, T4, T7 |
| EXTRACT-13 | T3, T4, T7 |
| EXTRACT-14 | T3, T4, T7 |
| EXTRACT-15 | T3, T4, T7 |
| EXTRACT-16 | T3, T7 |
| EXTRACT-17 | T1, T7 |
| EXTRACT-18 | T4, T8 |
| EXTRACT-19 | T4, T6 |
| EXTRACT-20 | T1, T4 |
| EXTRACT-21 | T4 |
| EXTRACT-22 | T4 |
| Cobertura | EXTRACT 22/22 via T9 |
