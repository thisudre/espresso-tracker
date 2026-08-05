# Extraction Panel — Design

**Spec**: `.specs/features/extraction-panel/spec.md`
**Context**: `.specs/features/extraction-panel/context.md`
**Status**: Approved (2026-08-05 — usuário aprovou)

---

## Resumo executivo

A M3 transforma a `ExtractPage` placeholder da M1 no painel de extração em tempo real: seletor de método com ratio preset, calculadora reativa de água sugerida (pó → água) e cronômetro com fases de pré-infusão/extração. **Nada é persistido** — o painel é 100% ferramenta de bancada (D-EXTR-05), e o estado final do brew fica exposto em um `computed` (`BrewState`) para a M4 consumir.

Nenhum contrato da M1 muda: **rotas, StorageService, BaseStore** são herdados intactos; a `ExtractPage` placeholder é substituída. **StorageService não é usado** — primeiro store do app que não persiste (transiente em memória). A lógica de domínio (cálculo de ratio + máquina de estados do cronômetro) vive em **funções puras** unit-testáveis, seguindo o padrão da M2 (degass/validators). O intervalo do cronômetro usa `effect()` (AD-008 reservou effects para side effects reativos da M3).

Decisões de design no escopo do "Agent's Discretion" do context.md: visual do cronômetro (display digital do token `timer-display`, sem progresso circular), ordem dos cards, estados dos chips de método, formato do readout de água e contrato do estado derivado.

---

## Architecture Overview

Fluxo de dados: **Componente → ExtractionStore (signals) → computed**. Componentes de UI só leem signals e chamam métodos do store; lógica pura fica em utils sem dependência de Angular. Não há storage — o store é raiz (`providedIn: 'root'`) e sobrevive à navegação para expor o estado à M4.

```mermaid
graph TD
    subgraph UI
        Extract[ExtractPage - /extract]
        TimerC[BrewTimerComponent]
        MethodC[MethodSelectorComponent]
        Calc[RatioCalculatorComponent]
    end

    subgraph Core
        EStore[ExtractionStore - transiente]
        Ratio[RatioUtil - funcao pura]
        TUtil[TimerUtil - maquina de estados pura]
        Model[BrewModel - metodos + BrewState]
    end

    Extract -->|compoe| TimerC
    Extract -->|compoe| MethodC
    Extract -->|compoe| Calc

    TimerC -->|le signals + start/pause/reset/advance| EStore
    MethodC -->|le metodo + selectMethod| EStore
    Calc -->|le dose/ratio/water + setDose/setRatio| EStore

    EStore -->|brewState computed| M4[Brew Logs (M4) - consome BrewState]

    EStore -->|ratio preset aplicado| Model
    EStore -->|water = suggestedWater| Ratio
    EStore -->|timer state machine| TUtil
    EStore -->|effect interval + tick| TUtil
    Calc -->|readout de agua| Ratio

    classDef ph stroke:#b45309,stroke-dasharray:4 2
    class TimerC,MethodC,Calc ph
```

`*` = componentes novos da M3. `ExtractPage` substitui o placeholder da M1. A M4 não existe ainda — `BrewState` é o contrato futuro (EXTRACT-20..22).

---

## Code Reuse Analysis

### Contratos herdados da M1 (sem mudança)

| Recurso | Localização | Como usamos |
|---|---|---|
| Rota `/extract` lazy | `src/app/app.config.ts` | `loadComponent` já aponta para a feature — a M3 substitui o conteúdo da página, sem tocar no router |
| `BaseStore<T>` | `src/app/core/stores/base-store.ts` | **Não herdado** — o ExtractionStore é transiente (nada a persistir). Documenta a primeira variante de store do padrão |
| `StorageService` | `src/app/core/storage/storage.service.ts` | Não usado na M3 (sem persistência) |
| Tokens do DESIGN.md | `styles.scss` | `timer-display`, `button-tab`/`button-tab-active`, `text-input`, `button-primary`/`button-secondary`, `heading-md`, `display-md`, `caption-md`, `body-md`, `hairline` |
| Padrão de lógica pura | `src/app/core/utils/degass.util.ts` (M2) | Mesmo formato para `brew-ratio.util.ts` e `timer.util.ts` (função pura + `today`/parâmetro injetável) |
| Padrão de store com Signals | `src/app/core/stores/bean.store.ts` (M2) | Signals + `computed()` derivados; sem `persist()` |
| `effect()` | `@angular/core` | AD-008 reservou effects para side effects reativos da M3 — usado para o ciclo de vida do intervalo do cronômetro |
| `ReactiveFormsModule` | @angular/forms (AD-009) | **Não aplicável** — o painel usa inputs simples com `ngModel`-like via signals (`setDose`/`setRatio`), não formulários; edição livre em tempo real não exige validação de submit |

### Integration Points

| Sistema | Método de integração |
|---|---|
| M4 (futuro) ↔ M3 | `ExtractionStore.brewState` (`computed<BrewState>`) — contrato congelado neste design; M4 consome método/dose/água/tempos sem refazer cálculos |
| M4 ↔ métodos | `BrewMethod` union + `BREW_METHODS` (labels PT-BR) — M4 reutiliza os mesmos identificadores no select de método |
| Dashboard ↔ M3 | Sem integração — painel não persiste, dashboard segue lendo BeanStore/LogStore |

---

## Components

### ExtractPage (substitui placeholder da M1)

- **Propósito**: rota `/extract` — cabeçalho "Extrair" + composição das 3 seções do painel (timer no topo, chips de método, calculadora) e chamada de reset do cronômetro ao sair da rota.
- **Localização**: `src/app/features/extract/extract.page.ts`
- **Interfaces**:
  - Template: `<app-brew-timer>`, `<app-method-selector>`, `<app-ratio-calculator>` empilhados em coluna com ritmo de seção (D-EXTR-04: timer em destaque no topo, chips, calculadora em cards)
  - `ngOnDestroy` (via `DestroyRef.onDestroy`): `extractStore.routeExited()` — cronômetro zera ao sair de `/extract` (EXTRACT-18, D-EXTR-03); método/dose/ratio permanecem (são inputs, não estado do brew em andamento)
- **Dependências**: `BrewTimerComponent`, `MethodSelectorComponent`, `RatioCalculatorComponent`, `ExtractionStore`.
- **Reusa**: `heading-md`, `spacing.section` do DESIGN.

### BrewTimerComponent

- **Propósito**: o centro do painel — display digital do cronômetro (`timer-display`): fase atual (Pré-infusão/Extração), tempo da fase em mm:ss (destaque), total acumulado, e controles Iniciar/Pausar/Reiniciar/Avançar fase.
- **Localização**: `src/app/features/extract/brew-timer.component.ts`
- **Interfaces**:
  - `timer = computed(() => extractStore.timer())` — `TimerState` (status, fase, segundos da fase, total)
  - `phaseLabel = computed(() => PHASE_LABEL[timer().phase])`
  - `phaseTime = computed(() => formatMmSs(timer().phaseSeconds))`
  - `totalTime = computed(() => formatMmSs(timer().totalSeconds))`
  - `start()`, `pause()`, `reset()`, `advancePhase()` — delegam ao store
  - Template: label da fase (`heading-md`), número grande (`timer-xl` via `timer-display`), "Total {mm:ss}" abaixo (`display-md`), botões `button-primary` (Iniciar/Pausar, alterna pelo status) + `button-secondary` (Reiniciar, Avançar fase)
- **Dependências**: `ExtractionStore`.
- **Reusa**: `timer-display` (caramel-cream + timer-xl 40px, 32px mobile), `button-primary`, `button-secondary`, `heading-md`, `display-md` do DESIGN.

**Decisão de design**: cronômetro digital simples (sem progresso circular) — o token `timer-display` do DESIGN já define a superfície e tipografia. Fase em destaque grande + total em `display-md` abaixo satisfaz "dois números" (D-EXTR-03). Botão Iniciar/Pausar alterna rótulo pelo `status`; "Avançar fase" sempre visível (preinfusão→extração, 1 toque — D-EXTR-03).

### MethodSelectorComponent

- **Propósito**: seleção do método de preparo em chips horizontais roláveis (Espresso, Prensa Francesa, Coado/V60, Aeropress), com um selecionado por padrão.
- **Localização**: `src/app/features/extract/method-selector.component.ts`
- **Interfaces**:
  - `methods = BREW_METHODS` (const do modelo)
  - `selected = computed(() => extractStore.method())`
  - `select(m: BrewMethod): void` — `extractStore.selectMethod(m)`
  - Template: container `overflow-x: auto` (sem scroll horizontal da página) com `@for` de chips `button-tab`/`button-tab-active`; chip ativo com marker `[*]`
- **Dependências**: `ExtractionStore`.
- **Reusa**: `button-tab`/`button-tab-active` do DESIGN (seletor de método de preparo é o uso declarado no DESIGN.md).

**Decisão de design**: os chips exibem só o rótulo do método; o ratio preset aparece na calculadora (onde é editável). Chips roláveis via `overflow-x: auto` nativo — sem scroll horizontal do documento em mobile (edge case EXTRACT do spec).

### RatioCalculatorComponent

- **Propósito**: calculadora reativa de ratio — campo Dose (g), campo Ratio (1:X) e readout destacado de Água sugerida (g).
- **Localização**: `src/app/features/extract/ratio-calculator.component.ts`
- **Interfaces**:
  - `dose = computed(() => extractStore.doseInput())` — valor cru do input (string)
  - `ratio = computed(() => extractStore.ratioInput())`
  - `water = computed(() => extractStore.water())` — `number | null`
  - `onDose(v: string)`, `onRatio(v: string)` — delegam `setDose`/`setRatio` (edição livre a qualquer momento, inclusive com timer rodando — EXTRACT-19)
  - Template: card com `text-input` de Dose (type="text", inputmode="decimal"), `text-input` de Ratio com prefixo "1 :" em `caption-md`, e readout em `display-md` (espresso) sobre `latte` com rótulo "Água sugerida" e unidade "g" em `caption-md`/`coffee-mute`; `—` quando `water` é `null`
- **Dependências**: `ExtractionStore`.
- **Reusa**: `text-input`, `display-md`, `caption-md`, `coffee-mute`, `hairline` do DESIGN.

**Decisão de design**: readout sem token novo — `display-md` em espresso sobre superfície latte com unidade "g" (vocabulário existente, princípio do DESIGN.md). Inputs de dose/ratio são strings cruas; parse puro decide validade (dose vazia/zero → `—`, sem quebrar — EXTRACT-10/11).

---

## Services

### ExtractionStore (novo — transiente, sem BaseStore)

- **Propósito**: estado global do painel de extração com Signals. **Não persiste** (nada é salvo na M3) — primeiro store do app que não estende `BaseStore`. `providedIn: 'root'` mantém o estado vivo entre navegações para a M4 consumir.
- **Localização**: `src/app/core/stores/extraction.store.ts` (`providedIn: 'root'`)
- **Interfaces**:
  - Signals de input:
    - `method = signal<BrewMethod>('espresso')` — default = primeiro da lista (EXTRACT-01: um selecionado por padrão)
    - `doseInput = signal<string>('')` — campo Dose (D-EXTR-01: inicia vazio, sem dose sugerida)
    - `ratioInput = signal<string>('2')` — valor X do `1:X`, inicializado com o preset do método atual
    - `timer = signal<TimerState>(createTimerState())` — máquina de estados do cronômetro
  - Derivados:
    - `water = computed(() => suggestedWater(doseInput(), ratioInput()))` — `number | null` (EXTRACT-06..11)
    - `dose = computed(() => parsePositiveNumber(doseInput()))` / `ratio = computed(() => parsePositiveNumber(ratioInput()))` — `number | null` para o contrato da M4
    - `brewState = computed<BrewState>(...)` — contrato M4 (EXTRACT-20..22)
  - Métodos:
    - `selectMethod(m: BrewMethod): void` — aplica o preset (`RATIO_PRESETS[m]`) ao `ratioInput`, **mantém** `doseInput` e recalcula água (EXTRACT-03/04/05)
    - `setDose(v: string): void` / `setRatio(v: string): void` — atualizam input (EXTRACT-09)
    - `start(): void` — status `running` (o `effect` do intervalo dispara)
    - `pause(): void` — status `paused` (congela; o `effect` limpa o intervalo)
    - `reset(): void` — `timer.set(createTimerState())` (EXTRACT-14)
    - `advancePhase(): void` — pré-infusão → extração, zera a fase, preserva o total (EXTRACT-15)
    - `routeExited(): void` — `reset()`; chamado pelo `DestroyRef` da página (EXTRACT-18)
  - Interno:
    - `effect(() => { if (timer().status === 'running') { const id = setInterval(() => tick(), 1000); return () => clearInterval(id) } })` — ciclo de vida do intervalo (AD-008); `tick()` aplica `tickTimer()` puro
- **Dependências**: nada além do modelo/utils.
- **Reusa**: `TimerUtil` (máquina pura), `RatioUtil` (cálculo puro), `BrewModel` (constantes).

**Decisão de design**: persistência é deliberadamente ausente — o store não herda `BaseStore` e não injeta `StorageService`. O intervalo do cronômetro é gerido por `effect()` com cleanup automático (start/pause controlam o ciclo); nos testes usa-se fake timers (`vi.useFakeTimers`) + `flushEffects()`.

### RatioUtil (novo — função pura)

- **Propósito**: cálculo do brew ratio. Sem dependência de Angular; entrada são strings cruas dos inputs.
- **Localização**: `src/app/core/utils/brew-ratio.util.ts`
- **Interfaces**:
  - `RATIO_PRESETS: Record<BrewMethod, number>` — `{ espresso: 2, v60: 16, prensa: 15, aeropress: 15 }` (D-EXTR-01)
  - `parsePositiveNumber(v: string): number | null` — vazio/não-numérico/≤0 → `null` (usa ponto como separador decimal)
  - `suggestedWater(dose: string, ratio: string): number | null` — `null` se qualquer entrada inválida; senão `Math.round(dose × ratio)` (EXTRACT-06/07)
- **Dependências**: nada.
- **Reusa**: nada (lógica nova de domínio).

### TimerUtil (novo — máquina de estados pura)

- **Propósito**: a máquina de estados do cronômetro como funções puras, sem `setInterval` (o store aplica o tick). Formatação mm:ss.
- **Localização**: `src/app/core/utils/timer.util.ts`
- **Interfaces**:
  - `createTimerState(): TimerState` — `{ status: 'idle', phase: 'preinfusion', phaseSeconds: 0, totalSeconds: 0 }`
  - `tickTimer(state: TimerState): TimerState` — incrementa `phaseSeconds` e `totalSeconds` em 1; **no-op se status ≠ 'running'** (defensivo + testável)
  - `advancePhase(state: TimerState): TimerState` — se `phase === 'preinfusion'` → `phase: 'extraction'`, `phaseSeconds: 0`, `totalSeconds` preservado (EXTRACT-15); se já é `extraction`, retorna o estado inalterado (no-op)
  - `formatMmSs(totalSeconds: number): string` — `MM:SS` com padding (0 → "00:00", 7 → "00:07", 65 → "01:05", 3600 → "60:00"); clamp ≥ 0
- **Dependências**: nada.
- **Reusa**: nada (lógica nova).

---

## Data Models

### BrewModel

```typescript
export type BrewMethod = 'espresso' | 'v60' | 'prensa' | 'aeropress'
export type BrewPhase = 'preinfusion' | 'extraction'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface BrewMethodInfo {
  id: BrewMethod
  label: string        // PT-BR: 'Espresso' | 'Prensa Francesa' | 'Coado/V60' | 'Aeropress'
}

export const BREW_METHODS: BrewMethodInfo[] = [
  { id: 'espresso', label: 'Espresso' },
  { id: 'v60', label: 'Coado/V60' },
  { id: 'prensa', label: 'Prensa Francesa' },
  { id: 'aeropress', label: 'Aeropress' },
]

export const RATIO_PRESETS: Record<BrewMethod, number> = {
  espresso: 2, v60: 16, prensa: 15, aeropress: 15,
}

export const PHASE_LABEL: Record<BrewPhase, string> = {
  preinfusion: 'Pré-infusão',
  extraction: 'Extração',
}

export interface TimerState {
  status: TimerStatus
  phase: BrewPhase
  phaseSeconds: number
  totalSeconds: number
}

export interface BrewState {   // contrato para a M4 (EXTRACT-20..22)
  method: BrewMethod
  methodLabel: string
  dose: number | null
  ratio: number | null
  water: number | null        // água sugerida (dose × ratio), arredondada
  phase: BrewPhase
  phaseLabel: string
  phaseTime: number           // segundos da fase atual
  totalTime: number           // segundos totais acumulados
  running: boolean
}
```

**Relacionamentos**: `ExtractionStore.brewState` é a única fonte do `BrewState`. `BREW_METHODS`/`RATIO_PRESETS` são compartilhados com a M4 (identificadores estáveis). Nada é persistido (envelope/`version` não se aplicam — o modelo não passa por `StorageService`).

---

## Error Handling Strategy

| Cenário | Tratamento | Impacto no usuário |
|---|---|---|
| Dose vazia, zero, negativa ou não numérica | `parsePositiveNumber` → `null`; `suggestedWater` → `null` | Readout mostra `—`, sem quebrar (EXTRACT-10/11) |
| Ratio vazio, zero ou negativo | Idem — `null` até corrigir (edge case do spec) | Sem sugestão de água até o valor ser válido |
| Troca de método com brew ativo | `selectMethod` só muda método/ratio; `timer` intocado | Cronômetro segue inalterado (EXTRACT-08 edge) |
| Edição de dose/ratio com timer rodando | `setDose`/`setRatio` não tocam o timer | Cronômetro inalterado; água recalcula em tempo real (EXTRACT-19) |
| Sair da rota `/extract` com timer rodando ou pausado | `routeExited()` (DestroyRef) → reset | Ao voltar, cronômetro zerado — perda intencional (D-EXTR-03) |
| Timer em background da aba | `setInterval` pode atrasar no browser | Aceito na v1 (resolução 1s; reinício na volta à rota) |
| Método sem infusão real (ex.: espresso) | Fase de pré-infusão presente; "Avançar fase" manual em 1 toque | Sem bloqueio — basta avançar (D-EXTR-03) |
| Storage/LocalStorage | Não aplicável — nada é persistido na M3 | N/A |

---

## Tech Decisions (não óbvias)

| Decisão | Escolha | Rationale |
|---|---|---|
| Persistência | **Nenhuma** — ExtractionStore não estende `BaseStore` nem injeta `StorageService` | D-EXTR-05 (nada salvo); primeiro store transiente; contratos da M1 intactos |
| Cronômetro | `effect()` gerencia o ciclo de vida do `setInterval` (start/pause controlam) com cleanup automático | AD-008 reservou effects para side effects reativos da M3; testes usam fake timers + `flushEffects()` |
| Lógica de domínio | Funções puras `suggestedWater` + `tickTimer`/`advancePhase`/`formatMmSs` | Mesmo padrão de testabilidade da M2 (degass); sem mock de clock no unit test |
| Método default | `espresso` (primeiro de `BREW_METHODS`) | EXTRACT-01 exige um selecionado por padrão; ordem do spec preservada |
| Ratio/Dose nos inputs | Strings cruas (`doseInput`/`ratioInput`); parse puro decide validade | Input livre em tempo real tolera vazio/inválido sem quebrar; `null` → readout `—` |
| Identificadores de método | `BrewMethod` union estável + `BREW_METHODS` com labels PT-BR | M4 reutiliza no select de método; evita strings livres |
| Visual do cronômetro | Display digital (`timer-display`, timer-xl 40px, 32px mobile) | Token já existe no DESIGN (AD-006); sem progresso circular (Agent's Discretion) |
| Chips de método | `button-tab`/`button-tab-active` (espresso + marker `[*]`), rolagem horizontal nativa | Uso declarado do DESIGN.md para o seletor de método; sem scroll da página |
| Readout de água | `display-md` espresso sobre latte + unidade "g" e `—` quando nulo | Vocabulário existente — sem token novo (princípio do DESIGN) |
| Reset ao sair da rota | `routeExited()` no `DestroyRef` da página; **só** o cronômetro zera | D-EXTR-03; método/dose/ratio são inputs e permanecem p/ M4 |
| Forms | Sem Reactive Forms | Painel não tem formulário com submit; edição livre via signals é mais simples (AD-009 cobre formulários reais da M2/M4) |

---

## Testes & Gate

**Unit tests (Vitest):**
- `brew-ratio.util.spec.ts`: `RATIO_PRESETS` (espresso 2, v60 16, prensa 15, aeropress 15); `suggestedWater('15','16') = 240`; arredondamento (`'10.3','16'` → 165); dose vazia/zero/negativa/não numérica → `null`; ratio vazio/zero/negativo → `null`.
- `timer.util.spec.ts`: `createTimerState`; `tickTimer` (running incrementa fase+total; paused/idle → no-op); `advancePhase` (pré→extração zera fase preserva total; já em extração → no-op); `formatMmSs` (0→00:00, 7→00:07, 65→01:05, 3600→60:00).
- `extraction.store.spec.ts`: default `espresso` + ratio `'2'`; `selectMethod('v60')` → ratio `'16'`, dose preservada, water recalcula (EXTRACT-04/05); `setDose`/`setRatio` → `water` reativo; input inválido → `water null` sem throw; `start`/`pause`/`reset`/`advancePhase` com fake timers (fase vs total); `routeExited` → timer zerado; `brewState` reflete método/dose/ratio/tempos (EXTRACT-20..22) e, sem brew ativo, expõe fase pré-infusão + tempo zero (EXTRACT-22).

**Verificação manual (navegador):**
- Chips: 4 métodos; troca aplica preset; troca com dose preenchida mantém dose e recalcula água (EXTRACT-03/05).
- Calculadora: 15g + V60 → 240g; 16g → 256g; ratio 1:17 → 272g; zerar dose → `—` (Independent Test do spec).
- Timer: Start → pré-infusão marca; Avançar fase → extração reinicia a fase e o total continua; Pause congela; Reset zera e volta à pré-infusão; editar dose/ratio com timer rodando → timer inalterado, água recalcula; sair de `/extract` e voltar → cronômetro zerado.
- Mobile ≤ 480px: chips roláveis e timer legível (40px → 32px) sem scroll horizontal; bottom nav intacta.
- Console limpo no load.

**Gate:** `ng test` verde (unit: ratio + timer + store) · `ng build` sem erros · `ng lint` limpo · navegação manual acima em mobile e desktop.

---

## Fora do escopo desta fase (design)

- Persistência de presets customizados de ratio (D-EXTR-01 — deferred).
- Cronômetro contínuo em background (D-EXTR-03 — reinício na v1).
- Atalho "enviar para histórico" na UI (requer M4 — AD-007).
- Fórmula reversa água → pó (D-EXTR-02).
- Campos de receita (moagem, temperatura) — M4.
- Feedback sonoro/háptico ao fim de fase (deferred).
- Multi-brews simultâneos (fora do escopo v1).
