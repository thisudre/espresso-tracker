# Brew Logs — Design

**Spec**: `.specs/features/brew-logs/spec.md`
**Context**: `.specs/features/brew-logs/context.md`
**Status**: Draft (aguardando aprovação)

---

## Resumo executivo

A M4 transforma o `LogsPage` placeholder da M1 no histórico de xícaras (brew logs): formulário de receita + avaliação sensorial, lista com filtros, detalhe com edição/exclusão e o atalho "Salvar no histórico" no painel da M3. **Duas vias de criação** (D-LOG-01): atalho do painel (pré-preenchido, nada persistido pela M3) e formulário manual em `/logs`.

Nenhum contrato da M1/M2/M3 muda: **StorageService**, **BaseStore**, **rotas lazy**, **tokens do DESIGN** e o **`computed<BrewState>`** da M3 são herdados intactos. `LogStore` (esqueleto da M1) é completado com o modelo sensorial; o atalho toca o código da M3 (`ExtractPage`) adicionando um botão que navega para o formulário — trade-off já registrado no AD-007.

A lógica de domínio nova (ratio derivado, mm:ss, filtros combinados) vive em **funções puras** unit-testáveis (`brew-log.util.ts`), no padrão da M2/M3. O formulário usa **Reactive Forms** (AD-009) e **reutiliza** o `AutocompleteFieldComponent` da M2 para "moagem". Avaliação em estrelas é um componente compartilhado novo (`StarRatingComponent`, CVA) com markers `★/☆` em monospace — sem ícone SVG, no espírito do DESIGN. O pré-preenchimento do atalho trafega via **router state** (snapshot efêmero no momento do toque), e não via store, para que o formulário manual nunca herde estado velho do painel.

---

## Architecture Overview

Fluxo de dados segue o padrão: **Componente → Store (signals) → StorageService → LocalStorage**. Lógica pura em utils; componentes de UI nunca tocam storage. O `LogStore` completa o esqueleto da M1; `BeanStore` (M2) fornece a lista para o vínculo opcional; `ExtractionStore.brewState` (M3) fornece o snapshot do atalho.

```mermaid
graph TD
    subgraph UI
        Logs[LogsPage - /logs]
        LCard[LogCardComponent]
        LForm[LogFormComponent - /logs/new + /logs/:id/edit]
        Detail[LogDetailPage - /logs/:id]
        Stars[StarRatingComponent - shared]
        Extract[ExtractPage - M3 + atalho]
    end

    subgraph Core
        LStore[LogStore - completado]
        BStore[BeanStore - M2]
        EStore[ExtractionStore - M3]
        Util[BrewLogUtil - funcoes puras]
        Base[BaseStore&lt;T&gt;]
        Storage[StorageService]
    end

    Extract -->|navigate /logs/new + router state brew| LForm
    Logs -->|RouterLink /logs/new| LForm
    Logs -->|@for de itens| LCard
    LCard -->|RouterLink /logs/:id| Detail
    Detail -->|RouterLink /logs/:id/edit| LForm
    LForm -->|autocomplete moagem| LStore
    LForm -->|seletor de grao| BStore
    LForm -->|add / update| LStore
    LForm -->|estrelas| Stars
    Detail -->|byId + remove| LStore
    Logs -->|filtros| Util
    LCard -->|ratio + tempo| Util
    LForm -->|ratio derivado + mm:ss| Util
    LStore -->|extends| Base
    Base -->|inject| Storage
    Storage -->|get/set/remove| LS[(LocalStorage)]

    classDef ph stroke:#b45309,stroke-dasharray:4 2
    class LCard,LForm,Detail,Stars,Util ph
```

`*` = componentes novos da M4. `LogsPage` substitui o placeholder da M1; `ExtractPage` (M3) recebe apenas o botão atalho.

---

## Code Reuse Analysis

### Contratos herdados (sem mudança)

| Recurso | Localização | Como usamos |
|---|---|---|
| `StorageService` | `src/app/core/storage/storage.service.ts` | Persistência única; envelope `{version, data}`; `null` em JSON inválido/versão incompatível — a M4 não toca |
| `BaseStore<T>` | `src/app/core/stores/base-store.ts` | `items = signal<T[]>`, `add/update/remove` com `persist()` explícito — herdado sem mudança |
| `LogStore` esqueleto | `src/app/core/stores/log.store.ts` | Completado: modelo `BrewLog` completo + `byId`/`grindSuggestions` + normalização de leitura |
| `BeanStore` (M2) | `src/app/core/stores/bean.store.ts` | Lista de grãos para o vínculo opcional (D-LOG-02); snapshot de nome no save |
| `ExtractionStore.brewState` (M3) | `src/app/core/stores/extraction.store.ts` | `computed<BrewState>` — snapshot do atalho (método, dose, água, tempo); nenhum campo novo |
| `BrewMethod`/`BREW_METHODS` (M3) | `src/app/core/models/brew.model.ts` | Select de método do log usa os mesmos identificadores/labels |
| `formatMmSs` (M3) | `src/app/core/utils/timer.util.ts` | Display e prefill do tempo total (mm:ss) |
| `parsePositiveNumber` (M3) | `src/app/core/utils/brew-ratio.util.ts` | Parse de dose/água no save do formulário |
| `AutocompleteFieldComponent` (M2) | `src/app/shared/autocomplete-field/` | Campo "moagem" (mesmo CVA + suggestions, D-LOG-07) |
| `ReactiveFormsModule` | @angular/forms (AD-009) | `FormGroup`/`FormControl` no `LogFormComponent` e `StarRatingComponent` (CVA) |
| `<dialog>` nativo | M2 (BeansPage) | Confirmação de exclusão do log (token `dialog-confirm`) |
| `distinctNonEmpty` pattern | M2 (BeanStore) | `grindSuggestions` (distinct, não-vazio) |
| Tokens do DESIGN.md | `styles.scss` | `bean-card`, `card-title`, `caption-md`, `body-strong`, `text-input`, `textarea`, `select`, `empty-state`, `dialog-confirm`, `button-*`, `link-inline` |

### Integration Points

| Sistema | Método de integração |
|---|---|
| M3 (painel) → M4 | Botão "Salvar no histórico" na `ExtractPage` → `router.navigate(['/logs/new'], { state: { brew: extractStore.brewState() } })`; formulário lê `router.getCurrentNavigation()?.extras?.state?.brew` no init e limpa (não guarda) |
| M2 (grãos) → M4 | `BeanStore.items` alimenta o select de grão; `beanName` é **snapshot** gravado no save (D-LOG-02) |
| Dashboard ↔ LogStore | Sem mudança — o dashboard da M1 já lê `LogStore.items` ("últimas extrações"); com a M4 os dados passam a existir |

---

## Components

### LogsPage (substitui placeholder da M1)

- **Propósito**: rota `/logs` — cabeçalho "Histórico", filtros (grão + método), CTA "Novo log", listagem em cards e estados vazios.
- **Localização**: `src/app/features/logs/logs.page.ts`
- **Interfaces**:
  - `logs = computed(() => logStore.items())` — ordenado `createdAt` desc; empate de data resolvido por `id` (determinístico)
  - `beanFilter = signal<string>('')` / `methodFilter = signal<BrewMethod | ''>('')` — filtros combinados (AND)
  - `filtered = computed(() => filterLogs(logs(), { beanId: beanFilter() || null, method: methodFilter() || null }))`
  - `beans = computed(() => beanStore.items())` — opções do filtro de grão
  - `clearFilters(): void` — zera ambos os filtros (ação do empty state com filtro ativo)
  - Template: header (`heading-md`) + CTA `button-primary` "+ Novo log" (`/logs/new`) + selects de filtro (`select`: "Todos os grãos"/"Todos os métodos" como default) + `@if`: sem logs → `empty-state` "[+] Nenhuma xícara registrada" + CTA; filtro ativo sem resultados → `empty-state` "Nenhuma xícara para este filtro" + `button-secondary` "Limpar filtros"; senão `@for` de `LogCardComponent`
- **Dependências**: `LogStore`, `BeanStore`, `BrewLogUtil` (filterLogs), `LogCardComponent`, `RouterLink`.
- **Reusa**: `empty-state`, `select`, `button-primary`, `button-secondary`, `heading-md`, `bean-card` do DESIGN.

**Decisão de design**: filtros **combinados** (grão E método simultâneos) — satisfaz LOG-15/16 e é mais útil que um-por-vez; implementado como função pura `filterLogs` (AND). Estado vazio distingue "sem nenhum log" de "filtro sem resultado" (LOG-19 vs LOG-20).

### LogCardComponent

- **Propósito**: card de um log na lista — método (título), snapshot do grão + ratio + tempo (caption) e resumo da avaliação (estrelas da Nota Geral). Toque abre o detalhe.
- **Localização**: `src/app/features/logs/log-card.component.ts`
- **Interfaces**:
  - `log = input.required<BrewLog>()`
  - `methodLabel = computed(() => methodLabelFor(log().method))` — fallback seguro se método inválido
  - `ratio = computed(() => formatRatio(log().dose, log().water))` — `string | null` (derivado, "1:16"/"1:16.7")
  - `time = computed(() => log().totalSeconds > 0 ? formatMmSs(log().totalSeconds) : '—')`
  - `hasRating = computed(() => hasRating(log().rating))` — decide estrelas vs "Sem avaliação"
  - Template: `RouterLink` para `/logs/:id`; linha 1 = método (`card-title`) + resumo (estrelas readonly da Nota Geral, ou `caption-md`/`coffee-mute` "Sem avaliação"); linha 2 = `beanName · ratio · tempo` em `caption-md`/`coffee-mute` (campos nulos omitidos)
- **Dependências**: `BrewLogUtil`, `BREW_METHODS` (M3), `StarRatingComponent` (readonly), `RouterLink`.
- **Reusa**: `bean-card` (estilo de card genérico do DESIGN: cream, hairline, `card-title`), `caption-md`, `coffee-mute`.

**Decisão de design**: card reutiliza o token `bean-card` (não há token `log-card`; a força do sistema é reusar — nada de token novo). Resumo usa **Nota Geral** (o atributo que condensa a avaliação); os demais atributos ficam no detalhe.

### LogFormComponent (novo + editar)

- **Propósito**: formulário de novo log e de edição, rota `/logs/new` (id ausente; pode receber prefill do atalho via router state) ou `/logs/:id/edit` (id no param). Salvar → `add`/`update` no store + navega para `/logs`; Cancelar → volta para `/logs` sem salvar.
- **Localização**: `src/app/features/logs/log-form.component.ts`
- **Interfaces**:
  - `form = new FormGroup({ method: ['', Validators.required], dose: [''], water: [''], grind: [''], beanId: [''], totalTime: ['', mmSsValidator], acidity: [0], body: [0], sweetness: [0], overall: [0], notes: [''] })`
  - `grindSuggestions = computed(() => logStore.grindSuggestions())`
  - `beans = computed(() => beanStore.items())`
  - `ratioReadout = computed(() => formatRatio(parsePositiveNumber(form.value.dose), parsePositiveNumber(form.value.water)))` — exibido como readout "1:X" ou `—`
  - `isEdit = computed(() => !!id())` — id do param de rota
  - `ngOnInit`: se edição → carrega `logStore.byId(id)` e preenche (id inexistente → redireciona `/logs`); se novo → lê `router.getCurrentNavigation()?.extras?.state?.brew` e preenche os campos disponíveis
  - `save(): void` — se `form.invalid` → marca touched + erro de método/tempo; senão monta `BrewLog` (novo: `crypto.randomUUID()` + `createdAt = new Date().toISOString()`; edição: preserva `id`/`createdAt`), grava `beanName` snapshot, chama `add`/`update`, navega `/logs`
  - `cancel(): void` — `router.navigate(['/logs'])`
- **Dependências**: `ReactiveFormsModule`, `LogStore`, `BeanStore`, `AutocompleteFieldComponent`, `StarRatingComponent`, `BrewLogUtil`, `BREW_METHODS`, `Router`/`ActivatedRoute`.
- **Reusa**: `text-input`, `select`, `textarea`, `autocomplete-suggestion`, `button-primary`, `button-secondary`, `heading-md`, `caption-md` do DESIGN; erro inline em `caption-md`/`terracota`.

**Prefill do atalho (D-LOG-01, LOG-02..04)**: o router state carrega `{ brew: BrewState }`. Preenche `method` ← `brew.method`; `dose` ← `brew.dose` (se `number|null` → string); `water` ← `brew.water`; `totalTime` ← `formatMmSs(brew.totalTime)` (se > 0). `ratio` deriva ao vivo. Com dose vazia (`brew.dose === null`) dose/água ficam vazias e o readout mostra `—` — sem quebrar (LOG-03). Nada é persistido pela M3; o router state é efêmero e o formulário **não guarda** o draft (LOG-01).

### LogDetailPage

- **Propósito**: rota `/logs/:id` — exibe todos os campos do log, com ações de editar e excluir (D-LOG-05).
- **Localização**: `src/app/features/logs/log-detail.page.ts`
- **Interfaces**:
  - `log = computed(() => logStore.byId(id()))` — id do param; inexistente → redireciona `/logs`
  - `delete(): void` — abre o `<dialog>` de confirmação com o método do log
  - `confirmDelete(): void` — `logStore.remove(id)` + fecha + navega `/logs`
  - `cancelDelete(): void` — apenas fecha o dialog
  - Template: header método (`heading-md`) + data de criação (`caption-md`); seção Receita (dose, água, ratio derivado, moagem, tempo total) em linhas `caption-md`; seção Grão (`beanName` snapshot ou "Sem grão vinculado"); seção Avaliação (4 linhas de `StarRatingComponent` readonly — Acidez, Corpo, Doçura, Nota Geral — ou "Sem avaliação"); seção Observações; ações `button-secondary` "Editar" (`/logs/:id/edit`) + `button-danger` "Excluir" (`<dialog #confirmDialog>` token `dialog-confirm`)
- **Dependências**: `LogStore`, `BrewLogUtil`, `StarRatingComponent`, `RouterLink`, `<dialog>` nativo.
- **Reusa**: `dialog-confirm`, `button-secondary`, `button-danger`, `heading-md`, `caption-md`, `coffee-mute`, `hairline` do DESIGN.

### StarRatingComponent (novo — compartilhado)

- **Propósito**: avaliação em estrelas (1–5) por atributo; 0 = não avaliado. Edição por toque no formulário, exibição readonly no card/detalhe. Implementa `ControlValueAccessor` (AD-009).
- **Localização**: `src/app/shared/star-rating/star-rating.component.ts`
- **Interfaces**:
  - `label = input<string>()` — rótulo do atributo ("Acidez", "Corpo", "Doçura", "Nota Geral")
  - `readonly = input(false)` — modo exibição (desabilita toque)
  - CVA: `writeValue(v: number)`, `registerOnChange`, `registerOnTouched`, `setDisabledState`
  - `value = signal(0)` — 0–5; `tap(index): void` — edição: `value = (value === index ? 0 : index)` (0 = limpa ao tocar a estrela ativa; `readonly`/disabled → no-op)
  - Template: label (`caption-md`) + 5 células de estrela `★`/`☆` em monospace (`body-md`); preenchida em `espresso`, vazia em `ash`; célula ativa com área de toque ~36px (mobile ok)
- **Dependências**: `ReactiveFormsModule` (`NG_VALUE_ACCESSOR` provider), nada mais.
- **Reusa**: `caption-md`, `coffee-mute`, `espresso`, `ash` do DESIGN.

**Decisão de design**: estrelas como **glyphs `★`/`☆` em monospace** — leitura de "estrelas" (D-LOG-03) sem ícone SVG, coerente com "a fonte é a identidade" do DESIGN. Toque na estrela ativa limpa para 0 (todas opcionais). O mesmo componente cobre edição (CVA) e exibição (`readonly` + valor via `writeValue`/form control).

### ExtractPage (M3 — adição do atalho)

- **Propósito**: painel da M3 ganha o atalho "Salvar no histórico" (LOG-01) — sem mudar o layout existente (timer topo, chips, calculadora).
- **Localização**: `src/app/features/extract/extract.page.ts` (M4 altera)
- **Interfaces**:
  - `saveToHistory(): void` — `router.navigate(['/logs/new'], { state: { brew: extractStore.brewState() } })`
  - Template: `button-secondary` "Salvar no histórico" ao final da página (abaixo da calculadora), sempre visível
- **Dependências**: `Router`, `ExtractionStore` (M3).
- **Reusa**: `button-secondary` do DESIGN.

---

## Services

### LogStore (completado a partir do esqueleto da M1)

- **Propósito**: estado global dos logs com Signals; mutação + persistência via `BaseStore` (sem mudança de contrato).
- **Localização**: `src/app/core/stores/log.store.ts` (`providedIn: 'root'`)
- **Interfaces** (adicionadas na M4):
  - `grindSuggestions = computed(() => distinctNonEmpty(items(), l => l.grind))` — autocomplete de moagem (D-LOG-07)
  - `byId(id: string): BrewLog | undefined` — para detalhe/edição
  - herdado: `items`, `add/update/remove` (BaseStore)
  - **Normalização na leitura** (legado M1): log sem campos novos → `dose: null`, `water: null`, `totalSeconds: 0`, `rating` zeros, `grind`/`bean*`/`notes` ausentes; `method` fora de `BREW_METHODS` → fallback `'espresso'` (nunca crash)
- **Dependências**: `BaseStore`, `StorageService`.
- **Reusa**: padrão `BaseStore` da M1, `distinctNonEmpty` da M2.

### BrewLogUtil (novo — funções puras)

- **Propósito**: lógica de domínio da M4 sem dependência de Angular — ratio derivado, mm:ss, filtros combinados.
- **Localização**: `src/app/core/utils/brew-log.util.ts`
- **Interfaces**:
  - `deriveRatio(dose: number | null, water: number | null): number | null` — `water/dose` se ambos `> 0` e válidos; senão `null` (LOG-07/08)
  - `formatRatio(dose, water): string | null` — `"1:16"` (inteiro) ou `"1:16.7"` (1 decimal, arredondado); `null` → exibe `—`
  - `parseMmSs(value: string): number | null` — `"m:ss"`/`"mm:ss"` (min 1–3 dígitos, seg 2 dígitos ≤ 59) → segundos; vazio/inválido → `null` (LOG-15)
  - `mmSsValidator(control): ValidationErrors | null` — opcional: vazio → `null`; preenchido inválido → `{ mmSs: true }`
  - `filterLogs(logs, { beanId?: string | null, method?: BrewMethod | null }): BrewLog[]` — filtros combinados (AND); ambos ausentes → lista completa (LOG-15..18)
  - `hasRating(rating: BrewRating): boolean` — alguma estrela `> 0` (edge "Sem avaliação")
- **Dependências**: `BrewMethod` (M3), `BrewLog`/`BrewRating` (modelo M4).
- **Reusa**: nada de Angular; `formatMmSs`/`parsePositiveNumber` ficam nos utils da M3 (importados de lá).

---

## Data Models

### BrewLog

```typescript
import type { BrewMethod } from './brew.model'   // M3 — union estável

export interface BrewRating {
  acidity: number      // 0–5 estrelas; 0 = não avaliado
  body: number
  sweetness: number
  overall: number      // Nota Geral — manual e independente (D-LOG-03)
}

export interface BrewLog {
  id: string
  method: BrewMethod           // único obrigatório (D-LOG-08)
  dose: number | null          // g; null = não informado
  water: number | null         // g; null = não informado
  grind?: string               // moagem — texto livre (autocomplete)
  beanId?: string              // vínculo opcional (D-LOG-02)
  beanName?: string            // snapshot do nome do grão (sobrevive à exclusão)
  totalSeconds: number         // tempo total mm:ss; 0 = não cronometrado (D-LOG-06)
  rating: BrewRating           // zeros = não avaliado
  notes?: string               // observações — texto livre opcional
  createdAt: string            // ISO datetime — ordenação newest-first
}
```

**Relacionamentos**: `LogStore.items: BrewLog[]`. `ratio` **não é persistido** — derivado por `deriveRatio(dose, water)` na exibição (single source of truth, D-LOG-08). `beanId`/`beanName` são snapshot no momento do save (exclusão posterior do grão não quebra nem perde o nome). Modelo não carrega `version` (envelope cuida disso). **Migração**: log legado da M1 (só `id`/`method`/`createdAt`) é normalizado na leitura (ver LogStore) — sem migração formal na v1.

### BrewState (M3 — consumido, não modificado)

O atalho consome `ExtractionStore.brewState()` (método, dose, ratio, water, totalTime, etc.). A M4 usa apenas `method`, `dose`, `water`, `totalTime` (segundos). Nenhum campo novo no contrato.

---

## Error Handling Strategy

| Cenário | Tratamento | Impacto no usuário |
|---|---|---|
| Storage indisponível / JSON corrompido / versão incompatível | `StorageService` (M1) retorna `null` → lista vazia, sem crash | App funciona; dados não persistem |
| Log legado da M1 sem campos novos | Normalização na leitura (defaults + método fallback `espresso`) | Card/detalhe exibem valores coerentes, sem crash |
| `method` inválido (corrompido) | Fallback `'espresso'` + label via `methodLabelFor` | Exibição segura, sem crash |
| Dose/água vazia, zero ou não numérica | `parsePositiveNumber` → `null`; `formatRatio` → `null` | Readout `—`; log salva `null`, sem quebrar (LOG-08) |
| Tempo total vazio ou `0` | `totalSeconds: 0`; display `—` (D-LOG-06) | Sem tempo exibido, sem erro |
| Tempo digitado inválido (ex.: "ab:12") | `mmSsValidator` bloqueia submit; mensagem inline terracota | Não salva com tempo malformado |
| Salvar sem método | `Validators.required` bloqueia; erro inline terracota | Não salva log sem método (LOG-13) |
| Rota `/logs/:id` ou `/logs/:id/edit` com id inexistente | Redireciona para `/logs` | Volta à lista sem erro visível |
| Grão vinculado excluído depois | `beanName` snapshot persistido no log (D-LOG-02) | Nome permanece no card/detalhe, sem quebra (LOG-25) |
| Atalho tocado sem dados do painel | Router state com `brew` preenche só o disponível (LOG-03) | Form vazio no que faltou, salva sem erro |
| Cancelar exclusão | `<dialog>` apenas fecha; `remove` não é chamado | Lista inalterada |
| Filtro ativo sem resultados | Empty state identificando o filtro + "Limpar filtros" (LOG-20) | Usuário entende e limpa |

---

## Tech Decisions (não óbvias)

| Decisão | Escolha | Rationale |
|---|---|---|
| Rotas | `/logs` (lista), `/logs/new` (form novo), `/logs/:id` (detalhe), `/logs/:id/edit` (form editar) — lazy | Padrão da M2 (rotas separadas); deep-linkable; `/logs/new` antes de `/logs/:id` (ranking do Router resolve) |
| Prefill do atalho | **Router state** (`navigate('/logs/new', { state: { brew } })`), lido no init e não persistido | Snapshot efêmero no momento do toque (D-LOG-01); formulário manual nunca herda estado velho do painel; nada a limpar no store |
| Ratio | **Derivado e não persistido** (`deriveRatio`/`formatRatio` puros) | D-LOG-08; evita inconsistência entre dose/água e ratio |
| Tempo total | `totalSeconds: number` + `parseMmSs`/`formatMmSs` puros | D-LOG-06 (só total, mm:ss); reusa formatação da M3 |
| Filtros | **Combinados** (grão E método, AND) via `filterLogs` puro | Agent's Discretion; mais útil que um-por-vez, satisfaz LOG-15..18 |
| Avaliação | `StarRatingComponent` CVA, `★`/`☆` monospace, toque na ativa limpa (0) | Agent's Discretion; sem SVG, coerente com o DESIGN; todas opcionais (D-LOG-03) |
| Vínculo com grão | Select de `BeanStore.items` + **snapshot** `beanId`/`beanName` no save | D-LOG-02; sobrevive à exclusão do grão |
| Autocomplete de moagem | Reusa `AutocompleteFieldComponent` (M2) + `grindSuggestions` | D-LOG-07; mesmo padrão Origem/Variedade |
| Exclusão | `<dialog>` nativo + `button-danger`, permanente | Mesmo padrão da M2 (BEAN-19); D-LOG-05 |
| Edição | Rota `/logs/:id/edit` reutilizando `LogFormComponent` | D-LOG-05 ("via detalhe"); consistente com M2 |
| Normalização de legado | Defaults na leitura; método inválido → `espresso` | M1 nunca teve dados reais; robustez sem migração formal |
| Card do log | Reusa token `bean-card` + Nota Geral como resumo | Sem token novo; condensação legível da avaliação |

---

## Testes & Gate

**Unit tests (Vitest):**
- `brew-log.util.spec.ts`: `deriveRatio`/`formatRatio` (dose/água válidas → `1:16`; fração → `1:16.7`; inválidas/≤0 → `null`); `parseMmSs` ("02:15"→135, "2:05"→125, "60:00"→3600, vazio/inválido → `null`, seg > 59 → `null`); `mmSsValidator` (vazio ok, válido ok, inválido → erro); `filterLogs` (por grão, por método, combinados, sem filtros → completo); `hasRating` (tudo 0 → false).
- `log.store.spec.ts`: `add` persiste `BrewLog` completo; `update` preserva `id`/`createdAt`; `remove`; `byId`; `grindSuggestions` (distinct, ignora vazios); leitura de log legado M1 → normalização (método inválido → `espresso`, campos default); storage `null` → lista vazia. (StorageService mockado.)

**Verificação manual (navegador):**
- Atalho: painel `/extract` com método+dose+cronômetro → "Salvar no histórico" → formulário `/logs/new` chega preenchido (método, dose, água, tempo); sem dose → dose/água vazias, readout `—`, sem quebra; salvar → log na lista (Independent Test do spec).
- Form manual: criar log com dose 16g/água 256g → ratio `1:16`; salvar sem método → bloqueado; salvar completo → topo da lista.
- Moagem: digitar novo valor → aceito; reaparece nas sugestões de outro log.
- Avaliação: tocar estrelas define 1–5; tocar a ativa limpa (0); tudo 0 → "Sem avaliação" no card/detalhe.
- Filtros: 3 logs com grãos/métodos diferentes → filtrar por grão, por método e combinado; limpar → lista completa; filtro sem resultado → empty state com "Limpar filtros".
- Detalhe/edição/exclusão: abrir log → editar avaliação e salvar → lista reflete; excluir com confirmação → some do histórico; excluir o grão vinculado → nome permanece no log.
- Mobile ≤ 480px: lista, formulário, filtros, dialog e estrelas utilizáveis sem scroll horizontal; bottom nav intacta.
- Console limpo no load.

**Gate:** `ng test` verde (unit: brew-log util + log store) · `ng build` sem erros · `ng lint` limpo · navegação manual acima em mobile e desktop.

---

## Requisitos → Design (traceability)

| Requirement ID | Story | Design Element |
|---|---|---|
| LOG-01 | Atalho do Painel | `ExtractPage.saveToHistory()` — botão "Salvar no histórico" |
| LOG-02 | Atalho do Painel | `ExtractPage` → router state → `LogFormComponent.ngOnInit` (prefill) |
| LOG-03 | Atalho do Painel | `LogFormComponent` prefill — dose `null` → campos vazios, readout `—` |
| LOG-04 | Atalho do Painel | `LogFormComponent.save()` → `LogStore.add` |
| LOG-05 | Formulário de Novo Log | `LogsPage` CTA + rota `/logs/new` → `LogFormComponent` |
| LOG-06 | Formulário de Novo Log | `form.controls.method` — select `BREW_METHODS` + `Validators.required` |
| LOG-07 | Formulário de Novo Log | `ratioReadout` = `formatRatio(deriveRatio(...))` |
| LOG-08 | Formulário de Novo Log | `formatRatio` → `null` → `—` (parse inválido) |
| LOG-09 | Formulário de Novo Log | `AutocompleteFieldComponent` + `grindSuggestions` |
| LOG-10 | Formulário de Novo Log | select de `BeanStore.items` + snapshot `beanId`/`beanName` |
| LOG-11 | Formulário de Novo Log | 4× `StarRatingComponent` (CVA) — opcionais (0) |
| LOG-12 | Formulário de Novo Log | `form.controls.notes` — `textarea` |
| LOG-13 | Formulário de Novo Log | `Validators.required` + erro inline terracota |
| LOG-14 | Formulário de Novo Log | `LogStore.add` com `createdAt` automático; lista `createdAt` desc |
| LOG-15 | Formulário de Novo Log | `totalTime` + `parseMmSs`/`mmSsValidator` |
| LOG-16 | Histórico com Filtros | `LogsPage.logs` — ordenação `createdAt` desc |
| LOG-17 | Histórico com Filtros | `filterLogs({ beanId })` |
| LOG-18 | Histórico com Filtros | `filterLogs({ method })` |
| LOG-19 | Histórico com Filtros | `LogsPage` empty state sem logs + CTA |
| LOG-20 | Histórico com Filtros | `LogsPage` empty state com filtro ativo + "Limpar filtros" |
| LOG-21 | Histórico com Filtros | `LogCardComponent` → `RouterLink` `/logs/:id` |
| LOG-22 | Detalhe, Edição, Exclusão | `LogDetailPage` — receita/avaliação/observações/data |
| LOG-23 | Detalhe, Edição, Exclusão | `LogDetailPage` "Editar" → `/logs/:id/edit` → `LogFormComponent` |
| LOG-24 | Detalhe, Edição, Exclusão | `LogDetailPage` `<dialog>` confirmação + `LogStore.remove` |
| LOG-25 | Detalhe, Edição, Exclusão | `beanName` snapshot persistido (exclusão do grão não quebra) |

**Cobertura:** 25 requisitos mapeados ao design. ⚠️ A tabela da spec listava 22 (faltavam LOG-23..25 da P2) — **corrigida neste design**.

---

## Fora do escopo desta fase (design)

- Gráficos de evolução sensorial por grão/método (deferred — STATE.md).
- Export de logs (CSV/JSON) — fora da v1.
- Nota Geral calculada (média automática) — D-LOG-03: manual.
- Pré-infusão como campo separado do log — D-LOG-06: só total.
- Filtro por período/data no histórico — deferred.
- Múltiplas xícaras de um mesmo brew — fora da v1.
- Migração formal de schema — v1 usa `null` + normalização de campos ausentes.
- Atalho que persiste dados na M3 — D-EXTR-05: nada persistido; o log é salvo na M4.
