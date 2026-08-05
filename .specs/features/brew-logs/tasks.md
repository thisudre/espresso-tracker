# Brew Logs (M4) — Tasks

**Design**: `.specs/features/brew-logs/design.md`
**Spec**: `.specs/features/brew-logs/spec.md`
**Status**: Approved (2026-08-05 — usuário aprovou)

---

## Contexto de Execução

- A M4 executa **sobre a M1/M2/M3 concluídas** (StorageService, BaseStore, LogStore esqueleto, rotas lazy, tokens do DESIGN.md em `styles.scss`, `AutocompleteFieldComponent` da M2, `ExtractionStore.brewState`/`BREW_METHODS`/`formatMmSs`/`parsePositiveNumber` da M3). Nenhum contrato da M1/M2/M3 muda.
- Naming: estilo 2025 do CLI — `*.page.ts`, `*.component.ts`, `*.store.ts`, `*.model.ts`, `*.util.ts`.
- Commits: um por task, formato `feat(logs): <descrição>`.
- Design tokens: toda UI consome os CSS custom properties de `styles.scss` (mapeamento do DESIGN.md), nunca valores hardcoded.
- Constantes de domínio (`RATING_KEYS`, `RATING_LABELS`, `DEFAULT_LOG_METHOD`) vivem no **modelo** (`brew-log.model.ts`), não nos componentes.
- O atalho "Salvar no histórico" modifica a `ExtractPage` da M3 (AD-007 trade-off) — task separada, executa sobre o código da M3.
- Sub-agents: tasks `[P]` via um sub-agent por task, em paralelo; tasks sequenciais via um sub-agent por vez. Cada sub-agent recebe só a definição da task + convenções (AGENTS.md, DESIGN.md, TESTING.md).

---

## Execution Plan

### Phase 1: Modelo + componente independente (Parallel)

```
T1 [P]  modelo brew-log
T4 [P]  StarRatingComponent (independente)
```

### Phase 2: Util puro + store (Parallel após T1)

```
T1 ──┬─→ T2 [P]  (BrewLogUtil)
     └─→ T3 [P]  (LogStore completado)
```

### Phase 3: Card, form e detalhe (Parallel)

```
T2 ──┬─→ T5 [P]  (LogCardComponent)
T3 ──┼─→ T6 [P]  (LogFormComponent)
     └─→ T7 [P]  (LogDetailPage)
```

### Phase 4: Página de lista (Sequential)

```
T5 → T8  (LogsPage)
```

### Phase 5: Rotas (Sequential)

```
T6, T7, T8 → T9
```

### Phase 6: Atalho no painel M3 (Sequential)

```
T9 → T10  (ExtractPage + botão "Salvar no histórico")
```

### Phase 7: Validação (Sequential)

```
T10 → T11
```

---

## Diagram-Definition Cross-Check

| Task | Depends on (corpo) | Diagram mostra | Status |
| --- | --- | --- | --- |
| T1 | None | início do fluxo | ✅ |
| T4 | None | início do fluxo | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1 | T1 → T3 | ✅ |
| T5 | T1, T2, T4 | T2 → T5 | ✅ |
| T6 | T1, T2, T3, T4 | T2/T3 → T6 | ✅ |
| T7 | T1, T2, T3, T4 | T2/T3 → T7 | ✅ |
| T8 | T2, T3, T5 | T5 → T8 | ✅ |
| T9 | T6, T7, T8 | T6/T7/T8 → T9 | ✅ |
| T10 | T9 | T9 → T10 | ✅ |
| T11 | T10 | T10 → T11 | ✅ |

---

## Task Breakdown

### T1: Modelo BrewLog completo + constantes de domínio

**What**: Expandir o modelo esqueleto da M1 com os campos de domínio do log: `BrewRating`, `BrewLog` completo e constantes de avaliação.
**Where**: `src/app/core/models/brew-log.model.ts` (expandir)
**Depends on**: None
**Reuses**: esqueleto da M1 (`BrewLog { id, method, createdAt }`); `BrewMethod` de `src/app/core/models/brew.model.ts` (M3)
**Requirement**: LOG-06, LOG-10, LOG-11, LOG-14

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `RatingKey = 'acidity' | 'body' | 'sweetness' | 'overall'`; `RATING_KEYS: RatingKey[]`; `RATING_LABELS: Record<RatingKey, string>` = Acidez/Corpo/Doçura/Nota Geral
- [ ] `BrewRating { acidity, body, sweetness, overall }` — todos `number` (0–5, 0 = não avaliado)
- [ ] `BrewLog { id, method: BrewMethod, dose: number|null, water: number|null, grind?, beanId?, beanName?, totalSeconds: number, rating: BrewRating, notes?, createdAt }`
- [ ] `DEFAULT_LOG_METHOD: BrewMethod = 'espresso'` (fallback de normalização)
- [ ] Modelo NÃO carrega `version` (envelope cuida disso)
- [ ] `ng build` compila sem erros

**Tests**: none (modelo — sem lógica)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(logs): modelo BrewLog completo + constantes`

---

### T2: BrewLogUtil — ratio derivado, mm:ss e filtros puros [P]

**What**: Funções puras da M4: `deriveRatio`/`formatRatio`, `parseMmSs`/`mmSsValidator`, `filterLogs`, `hasRating`, `methodLabelFor` + spec unitário.
**Where**: `src/app/core/utils/brew-log.util.ts` + `brew-log.util.spec.ts`
**Depends on**: T1
**Reuses**: `BrewMethod`/`BREW_METHODS` (M3); `formatMmSs`/`parsePositiveNumber` (M3 utils); tipos `BrewLog`/`BrewRating` (T1)
**Requirement**: LOG-07, LOG-08, LOG-15, LOG-16, LOG-17, LOG-18

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `deriveRatio(dose: number|null, water: number|null): number|null` — `water/dose` se ambos `> 0`; senão `null`; `formatRatio(...): string|null` — `"1:16"` (inteiro) / `"1:16.7"` (1 decimal arredondado), `null` → display `—`
- [ ] `parseMmSs(value: string): number|null` — `"m:ss"`/`"mm:ss"` (min 1–3 dígitos, seg 2 dígitos ≤ 59) → segundos; vazio/inválido/seg > 59 → `null`; `mmSsValidator(control): ValidationErrors|null` — vazio → `null`, preenchido inválido → `{ mmSs: true }`
- [ ] `filterLogs(logs, { beanId?: string|null, method?: BrewMethod|null }): BrewLog[]` — filtros combinados (AND); ambos ausentes → lista completa
- [ ] `hasRating(rating): boolean` — alguma estrela `> 0`; `methodLabelFor(method: string): string` — label via `BREW_METHODS`, método desconhecido → fallback `DEFAULT_LOG_METHOD` label
- [ ] Spec cobre: `deriveRatio`/`formatRatio` (válidas → `1:16`; fração → `1:16.7`; inválidas/≤0 → `null`); `parseMmSs` ("02:15"→135, "2:05"→125, "60:00"→3600, vazio/inválido/seg>59 → `null`); `mmSsValidator` (vazio ok, válido ok, inválido → erro); `filterLogs` (grão, método, combinado, sem filtros); `hasRating` (tudo 0 → false); `methodLabelFor` (válido + desconhecido)
- [ ] `ng test --include='**/brew-log.util.spec.ts'` verde — Test count: 20+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/brew-log.util.spec.ts'` → verde, 20+ testes

**Commit**: `feat(logs): brew log util puro + unit tests`

---

### T3: LogStore — grindSuggestions, byId e normalização legado [P]

**What**: Completar o `LogStore` esqueleto da M1: computeds de sugestões de moagem, `byId` e normalização de logs legados (M1) na leitura + spec unitário.
**Where**: `src/app/core/stores/log.store.ts` (expandir) + `log.store.spec.ts` (estender)
**Depends on**: T1
**Reuses**: `BaseStore<T>` da M1 (add/update/remove + persist explícito); `StorageService`; `DEFAULT_LOG_METHOD`/`BrewLog` (T1); `BREW_METHODS` (M3)
**Requirement**: LOG-09, LOG-14, LOG-24, LOG-25

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `grindSuggestions = computed(...)` — distinct, ignora vazios, case-insensitive dedup (padrão da M2)
- [ ] `byId(id: string): BrewLog | undefined`
- [ ] Normalização na leitura: log legado (M1, só `id`/`method`/`createdAt`) → `dose: null`, `water: null`, `totalSeconds: 0`, `rating` zeros, `grind`/`bean*`/`notes` ausentes; `method` fora de `BREW_METHODS` → `DEFAULT_LOG_METHOD`
- [ ] Spec estende o da M1 (StorageService mockado): `add` persiste log completo; `update` preserva `id`/`createdAt`; `remove`; `byId`; `grindSuggestions` distinct/ignora vazios; leitura legado → normalização (método inválido → `espresso`, campos default); storage `null` → `[]`
- [ ] `ng test --include='**/log.store.spec.ts'` verde — Test count: 12+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/log.store.spec.ts'` → verde, 12+ testes

**Commit**: `feat(logs): LogStore com suggestions/byId + normalização`

---

### T4: StarRatingComponent — estrelas monospace (CVA) [P]

**What**: Componente compartilhado de avaliação em estrelas (1–5, 0 = não avaliado) com `ControlValueAccessor` e modo readonly, glyphs `★`/`☆` em monospace.
**Where**: `src/app/shared/star-rating/star-rating.component.ts`
**Depends on**: None
**Reuses**: `ReactiveFormsModule` (AD-009, `NG_VALUE_ACCESSOR`); tokens `caption-md`/`coffee-mute` + cores `espresso`/`ash` do DESIGN
**Requirement**: LOG-11

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `label = input<string>()`; `readonly = input(false)`; implementa `writeValue`/`registerOnChange`/`registerOnTouched`/`setDisabledState` (provider `NG_VALUE_ACCESSOR`); `value = signal(0)`
- [ ] `tap(index)`: edição — `value = (value === index ? 0 : index)` (tocar a ativa limpa para 0); `readonly`/disabled → no-op
- [ ] Template: label (`caption-md`) + 5 células `★`/`☆` (`body-md`); preenchida em `espresso`, vazia em `ash`; área de toque ~36px
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(logs): StarRatingComponent compartilhado (CVA)`

---

### T5: LogCardComponent — card de log com resumo [P]

**What**: Card de um log na lista: método (título), snapshot do grão + ratio + tempo (caption) e resumo da avaliação (estrelas da Nota Geral ou "Sem avaliação"); toque abre o detalhe.
**Where**: `src/app/features/logs/log-card.component.ts`
**Depends on**: T1, T2, T4
**Reuses**: tokens `bean-card`/`card-title`/`caption-md`/`coffee-mute`; `BREW_METHODS` (M3); `BrewLogUtil` (`formatRatio`/`formatMmSs`/`hasRating`/`methodLabelFor`); `StarRatingComponent` (readonly); `RouterLink`
**Requirement**: LOG-16, LOG-21, LOG-25

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `log = input.required<BrewLog>()`; `methodLabel` via `methodLabelFor`; `ratio` via `formatRatio(log.dose, log.water)`; `time` via `formatMmSs` (ou `'—'` quando `totalSeconds` = 0); `hasRating` decide estrelas vs "Sem avaliação"
- [ ] Template: `RouterLink` para `/logs/:id`; linha 1 = método (`card-title`) + resumo (estrelas readonly da Nota Geral, ou `caption-md`/`coffee-mute` "Sem avaliação"); linha 2 = `beanName · ratio · tempo` em `caption-md`/`coffee-mute` (campos nulos/ausentes omitidos)
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(logs): LogCardComponent com resumo`

---

### T6: LogFormComponent — cadastro, edição e prefill do atalho [P]

**What**: Formulário de novo log e de edição (`/logs/new` + `/logs/:id/edit`): método obrigatório, dose/água, moagem (autocomplete), grão opcional (snapshot), tempo mm:ss, 4 avaliações em estrelas e observações; prefill via router state do atalho M3.
**Where**: `src/app/features/logs/log-form.component.ts`
**Depends on**: T1, T2, T3, T4
**Reuses**: `ReactiveFormsModule` (AD-009); tokens `text-input`/`select`/`textarea`/`button-primary`/`button-secondary`/`heading-md`/`caption-md`; `AutocompleteFieldComponent` (M2); `StarRatingComponent` (T4); `LogStore` (T3, `grindSuggestions`); `BeanStore` (M2); `BrewLogUtil` (T2: `formatRatio`/`parseMmSs`/`mmSsValidator`); `BREW_METHODS`/`parsePositiveNumber` (M3); `Router`/`ActivatedRoute`
**Requirement**: LOG-02, LOG-03, LOG-04, LOG-05, LOG-06, LOG-07, LOG-08, LOG-09, LOG-10, LOG-11, LOG-12, LOG-13, LOG-14, LOG-15, LOG-23, LOG-25

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `FormGroup`: `method` (select `BREW_METHODS`, `Validators.required`, placeholder "Selecionar…"), `dose`/`water` (`text-input`, inputmode decimal), `grind` (`AutocompleteFieldComponent` ← `grindSuggestions`), `beanId` (select de `BeanStore.items`, opção vazia "Sem grão vinculado"), `totalTime` (`text-input` placeholder "mm:ss", `mmSsValidator`), `acidity`/`body`/`sweetness`/`overall` (4× `StarRatingComponent`, opcionais), `notes` (`textarea`)
- [ ] `ratioReadout = computed(() => formatRatio(parsePositiveNumber(dose), parsePositiveNumber(water)))` — exibido como readout `1:X` ou `—` (LOG-07/08)
- [ ] Mensagem de erro inline terracota para método obrigatório e tempo inválido ("Use o formato mm:ss (ex.: 02:15).")
- [ ] `ngOnInit`: edição → carrega `logStore.byId(id)` e preenche (id inexistente → redireciona `/logs`); novo → lê `router.getCurrentNavigation()?.extras?.state?.brew` (BrewState da M3) e preenche `method`←`brew.method`, `dose`←`brew.dose`, `water`←`brew.water`, `totalTime`←`formatMmSs(brew.totalTime)` quando > 0; dose `null` → campos vazios sem quebrar (LOG-03)
- [ ] `save()`: inválido → marca touched, não salva; válido → monta `BrewLog` (novo: `crypto.randomUUID()` + `createdAt = new Date().toISOString()`; edição: preserva `id`/`createdAt`), grava `beanName` snapshot via `BeanStore.byId`, `totalSeconds` via `parseMmSs` (0 se vazio), `dose`/`water` via `parsePositiveNumber`; chama `add`/`update`; navega `/logs`
- [ ] `cancel()` (`button-secondary`) → volta para `/logs` sem salvar
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(logs): formulario de cadastro/edicao com prefill`

---

### T7: LogDetailPage — detalhe, edição e exclusão [P]

**What**: Página de detalhe (`/logs/:id`): receita, avaliação (estrelas readonly), observações e data; ações de editar (`/logs/:id/edit`) e excluir com `<dialog>` nativo.
**Where**: `src/app/features/logs/log-detail.page.ts`
**Depends on**: T1, T2, T3, T4
**Reuses**: tokens `dialog-confirm`/`button-secondary`/`button-danger`/`heading-md`/`caption-md`/`coffee-mute`/`hairline`; `LogStore` (T3, `byId`/`remove`); `StarRatingComponent` (T4, readonly); `BrewLogUtil` (T2: `formatRatio`/`formatMmSs`/`hasRating`/`methodLabelFor`); `RouterLink`
**Requirement**: LOG-21, LOG-22, LOG-23, LOG-24, LOG-25

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `log = computed(() => logStore.byId(id()))` — id inexistente → redireciona para `/logs`
- [ ] Exibe: método (`heading-md`) + data de criação (`caption-md`); Receita (dose, água, ratio derivado, moagem, tempo total); Grão (`beanName` snapshot ou "Sem grão vinculado"); Avaliação (4× `StarRatingComponent` readonly com `RATING_LABELS`, ou "Sem avaliação" quando tudo 0); Observações
- [ ] `delete()` abre `<dialog>` (token `dialog-confirm`) com o método do log + `button-secondary` Cancelar + `button-danger` Excluir; `confirmDelete()` → `logStore.remove(id)` + fecha + navega `/logs`; `cancelDelete()` → só fecha
- [ ] Ações: `button-secondary` "Editar" (`RouterLink` `/logs/:id/edit`)
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(logs): pagina de detalhe com edicao/exclusao`

---

### T8: LogsPage — listagem, filtros e empty states

**What**: Substituir o placeholder de `/logs` pela página real: cabeçalho, CTA "+ Novo log", filtros combinados (grão + método), listagem de cards (newest-first) e estados vazios (sem logs / filtro sem resultado).
**Where**: `src/app/features/logs/logs.page.ts`
**Depends on**: T2, T3, T5
**Reuses**: tokens `empty-state`/`select`/`button-primary`/`button-secondary`/`heading-md`/`bean-card`; `LogCardComponent` (T5); `LogStore` (T3); `BeanStore` (M2); `BrewLogUtil` (`filterLogs`); `RouterLink`
**Requirement**: LOG-16, LOG-17, LOG-18, LOG-19, LOG-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `logs = computed(() => logStore.items())` ordenado `createdAt` desc (empate por `id`, determinístico); `beanFilter = signal('')` / `methodFilter = signal<BrewMethod|''>('')`; `filtered = computed(() => filterLogs(logs(), { beanId: beanFilter() || null, method: methodFilter() || null }))`; `beans = computed(() => beanStore.items())`
- [ ] `clearFilters()` zera ambos os filtros
- [ ] Header `heading-md` "Histórico" + CTA `button-primary` "+ Novo log" (`/logs/new`); selects de filtro (`select`): "Todos os grãos"/"Todos os métodos" como default
- [ ] Empty states: sem logs → `[+] Nenhuma xícara registrada` + CTA; filtro ativo sem resultados → "Nenhuma xícara para este filtro" + `button-secondary` "Limpar filtros"
- [ ] Lista → `@for` de `LogCardComponent`
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(logs): LogsPage com filtros e empty states`

---

### T9: Rotas `/logs/new`, `/logs/:id`, `/logs/:id/edit`

**What**: Registrar as três rotas da M4 via `loadComponent` (form novo, detalhe, form edição) na ordem correta — `/logs/new` antes de `/logs/:id`.
**Where**: `src/app/app.config.ts`
**Depends on**: T6, T7, T8
**Reuses**: rotas lazy da M1 (`loadComponent`); wildcard 404
**Requirement**: LOG-05, LOG-21, LOG-23

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `{ path: 'logs/new', loadComponent: ... LogFormComponent }`, `{ path: 'logs/:id', loadComponent: ... LogDetailPage }`, `{ path: 'logs/:id/edit', loadComponent: ... LogFormComponent }` registrados (rota `logs` já existe da M1; `/logs/new` e `/logs/:id/edit` antes de `/logs/:id`)
- [ ] `ng build` compila sem erros

**Tests**: none (rotas — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(logs): rotas de formulario/detalhe`

---

### T10: Atalho "Salvar no histórico" na ExtractPage (M3)

**What**: Adicionar ao painel da M3 o atalho que navega para o formulário de novo log com o estado atual do brew (router state).
**Where**: `src/app/features/extract/extract.page.ts` (modificar — código da M3)
**Depends on**: T9
**Reuses**: `ExtractionStore` (M3, `brewState`); `Router`; token `button-secondary` do DESIGN
**Requirement**: LOG-01, LOG-02, LOG-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `saveToHistory(): void` — `router.navigate(['/logs/new'], { state: { brew: extractStore.brewState() } })`
- [ ] Template: `button-secondary` "Salvar no histórico" ao final da página (abaixo da calculadora), sempre visível (LOG-01)
- [ ] Não altera o layout existente do painel (timer topo, chips, calculadora) nem o `routeExited()` do DestroyRef
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(logs): atalho salvar no historico no painel`

---

### T11: Validação manual da M4 + full gate

**What**: Passada de validação final da M4: fluxo do atalho, formulário manual, filtros, detalhe/edição/exclusão, snapshot de grão, mobile. Rodar full gate.
**Where**: — (verificação)
**Depends on**: T10
**Reuses**: checklist de verificação manual do design (Testes & Gate)
**Requirement**: LOG-01..25

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `ng test` → suíte toda verde (brew-log util + log store)
- [ ] `ng build` sem erros; `ng lint` limpo
- [ ] Atalho: painel `/extract` com método+dose+cronômetro → "Salvar no histórico" → `/logs/new` preenchido (método, dose, água, tempo); sem dose → dose/água vazias, readout `—`, sem quebra; salvar → log na lista (Independent Test do spec)
- [ ] Form manual: dose 16g/água 256g → ratio `1:16`; salvar sem método → bloqueado; salvar completo → topo da lista
- [ ] Moagem: valor novo aceito; reaparece nas sugestões de outro log
- [ ] Avaliação: tocar estrelas define 1–5; tocar a ativa limpa (0); tudo 0 → "Sem avaliação"
- [ ] Filtros: 3 logs com grãos/métodos diferentes → filtrar por grão, método e combinado; limpar → lista completa; filtro sem resultado → empty state com "Limpar filtros"
- [ ] Detalhe/edição/exclusão: abrir log → editar avaliação e salvar → lista reflete; excluir com confirmação → some do histórico; excluir o grão vinculado → nome permanece no log
- [ ] Mobile ≤ 480px: lista, formulário, filtros, dialog e estrelas utilizáveis sem scroll horizontal; bottom nav intacta
- [ ] Console limpo no load
- [ ] Cobertura LOG-01..25 = 25/25 verificada

**Tests**: none (manual + gates)
**Gate**: full

**Verify**:
- `ng test && ng build && ng lint` → todos verdes
- Checklist manual acima concluído

**Commit**: `chore(logs): validacao M4`

---

## Parallel Execution Map

```
Phase 1 (Parallel):   T1 [P] ──┐
                      T4 [P] ──┤
Phase 2 (Parallel):   T1 ──┬─→ T2 [P]
                            └─→ T3 [P]
Phase 3 (Parallel):   T2 ──┬─→ T5 [P]
                      T3 ──┼─→ T6 [P]
                            └─→ T7 [P]
Phase 4 (Sequential): T5 → T8
Phase 5 (Sequential): T6, T7, T8 → T9
Phase 6 (Sequential): T9 → T10
Phase 7 (Sequential): T10 → T11
```

**Paralelismo**: unit tests são parallel-safe (Vitest isola arquivos); tasks de UI não têm estado mutável compartilhado. T1/T4 (independentes) e T2/T3 (dependem do modelo T1) e T5/T6/T7 (dependem de T1–T4) são `[P]`. T8 depende do card (T5); T9 depende dos componentes (T6/T7/T8); T10 depende da rota `/logs/new` (T9); T11 valida tudo.

---

## Test Co-location Validation

| Task | Camada criada/alterada | Matriz exige | Task diz | Status |
| --- | --- | --- | --- | --- |
| T1 | Modelo de domínio (BrewLog) | none | none | ✅ |
| T2 | Util puro (brew-log) | unit* | unit | ✅ |
| T3 | LogStore (store) | unit | unit | ✅ |
| T4 | StarRating (UI) | none (manual) | none | ✅ |
| T5 | LogCard (UI) | none (manual) | none | ✅ |
| T6 | LogForm (UI) | none (manual) | none | ✅ |
| T7 | LogDetailPage (UI) | none (manual) | none | ✅ |
| T8 | LogsPage (UI) | none (manual) | none | ✅ |
| T9 | app.config (rotas) | none (manual) | none | ✅ |
| T10 | ExtractPage (UI — M3) | none (manual) | none | ✅ |
| T11 | — (validação) | — | none | ✅ |

*Utils de lógica pura → `unit`, estendendo a matriz do TESTING.md (AD-007 exige ratio derivado + validação de mm:ss unit-testáveis).

---

## Requirement Traceability

| Requirement | Tasks |
| --- | --- |
| LOG-01 | T10 |
| LOG-02 | T6, T10 |
| LOG-03 | T6, T10 |
| LOG-04 | T3, T6 |
| LOG-05 | T6, T9 |
| LOG-06 | T1, T6 |
| LOG-07 | T2, T6 |
| LOG-08 | T2, T6 |
| LOG-09 | T3, T6 |
| LOG-10 | T1, T6 |
| LOG-11 | T1, T4, T6 |
| LOG-12 | T6 |
| LOG-13 | T6 |
| LOG-14 | T1, T3, T6 |
| LOG-15 | T2, T6 |
| LOG-16 | T2, T5, T8 |
| LOG-17 | T2, T8 |
| LOG-18 | T2, T8 |
| LOG-19 | T8 |
| LOG-20 | T8 |
| LOG-21 | T5, T7, T9 |
| LOG-22 | T7 |
| LOG-23 | T6, T7, T9 |
| LOG-24 | T3, T7 |
| LOG-25 | T3, T5, T6, T7 |
| Cobertura | LOG 25/25 via T11 |
