# Bean Inventory (M2) — Tasks

**Design**: `.specs/features/bean-inventory/design.md`
**Spec**: `.specs/features/bean-inventory/spec.md`
**Status**: Draft

---

## Contexto de Execução

- A M2 executa **sobre a M1 concluída** (StorageService, BaseStore, rotas, tokens do DESIGN.md em `styles.scss`). Nenhum contrato da M1 muda.
- Naming: estilo 2025 do CLI — `*.page.ts`, `*.component.ts`, `*.store.ts`, `*.model.ts`, `*.util.ts`.
- Commits: um por task, formato `feat(beans): <descrição>`.
- Design tokens: toda UI consome os CSS custom properties de `styles.scss` (mapeamento do DESIGN.md), nunca valores hardcoded.
- Constantes de domínio (STATUS_LABEL, STATUS_ORDER, DEFAULT_BEAN_STATUS) vivem no modelo (`bean.model.ts`), não nos componentes.
- Sub-agents: tasks `[P]` via um sub-agent por task, em paralelo; tasks sequenciais via um sub-agent por vez. Cada sub-agent recebe só a definição da task + convenções (AGENTS.md, DESIGN.md, TESTING.md).

---

## Execution Plan

### Phase 1: Domínio puro + modelo + autocomplete (Parallel)

```
T1 ──┬─→ T4  (modelo → store)
T2 [P]  degass util
T3 [P]  validators util
T5 [P]  autocomplete field (independente)
```

### Phase 2: BeanStore (Sequential)

```
T4  (depende do modelo T1)
```

### Phase 3: Cards, form e dashboard (Parallel)

```
T4 ──┬─→ T6 [P]  (BeanCard: badge + status)
     ├─→ T7 [P]  (BeanForm: depende de T4/T5 e de validators T3)
     └─→ T10 [P] (Dashboard: grãos abertos)
```

### Phase 4: Rotas e página (Sequential)

```
T7 ──→ T9  (rotas beans/new + beans/:id/edit)
T9 ──→ T8  (BeansPage substitui placeholder)
```

### Phase 5: Validação (Sequential)

```
T8 ──┐
T10 ─┴─→ T11
```

---

## Diagram-Definition Cross-Check

| Task | Depends on (corpo) | Diagram mostra | Status |
| --- | --- | --- | --- |
| T1 | None | início do fluxo | ✅ |
| T2 | None | início do fluxo | ✅ |
| T3 | None | início do fluxo | ✅ |
| T5 | None | início do fluxo | ✅ |
| T4 | T1 | T1 → T4 | ✅ |
| T6 | T1, T2, T4 | T4 → T6 | ✅ |
| T7 | T1, T3, T4, T5 | T4/T5 → T7 | ✅ |
| T10 | T4 | T4 → T10 | ✅ |
| T9 | T7 | T7 → T9 | ✅ |
| T8 | T4, T6, T9 | T9 → T8 | ✅ |
| T11 | T8, T10 | T8, T10 → T11 | ✅ |

---

## Task Breakdown

### T1: Modelo Bean completo + constantes de domínio

**What**: Expandir o modelo esqueleto da M1 com os campos de domínio e as constantes de status do pacote.
**Where**: `src/app/core/models/bean.model.ts` (expandir)
**Depends on**: None
**Reuses**: esqueleto da M1 (`Bean { id, brand, createdAt }`)
**Requirement**: BEAN-01, BEAN-02, BEAN-05, BEAN-06, BEAN-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `Bean` completo: `id`, `brand`, `origin?`, `variety?`, `process?` (`BeanProcess` = `'Washed' | 'Natural' | 'Honey' | 'Outro'`), `roastDate?` (ISO `yyyy-MM-dd`), `notes?`, `status: BeanStatus`, `createdAt`
- [ ] `BeanStatus` = `'aberto' | 'fechado' | 'finalizado'`; `STATUS_LABEL: Record<BeanStatus, string>` (Aberto/Fechado/Finalizado); `STATUS_ORDER: BeanStatus[]`; `DEFAULT_BEAN_STATUS: BeanStatus = 'fechado'`
- [ ] Modelo NÃO carrega `version` (envelope cuida disso)
- [ ] `ng build` compila sem erros

**Tests**: none (modelo — sem lógica)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(beans): modelo Bean completo + constantes de status`

---

### T2: DegassUtil — cálculo puro da degass window [P]

**What**: Função pura `degassInfo(roastDate, today?)` com fronteiras 3–14 dias, data futura e data inválida, + spec unitário.
**Where**: `src/app/core/utils/degass.util.ts` + `degass.util.spec.ts`
**Depends on**: None
**Reuses**: nada (lógica nova de domínio)
**Requirement**: BEAN-09, BEAN-10, BEAN-11, BEAN-12, BEAN-13 (edge: data futura, data inválida)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `DEGASS_WINDOW_MIN = 3`, `DEGASS_WINDOW_MAX = 14`; `degassInfo(roastDate: string | null, today: Date = new Date()): DegassInfo | null`
- [ ] `null` quando `roastDate` ausente **ou** data inválida (`isNaN(Date.parse)`); `days` via meia-noite local (subtração de `Date` normalizada)
- [ ] `days < 3` → `{ state: 'fresco', label: 'Muito fresco (Xd)' }` (inclui datas futuras; label clampada em ≥ 0); `3 ≤ days ≤ 14` → `{ state: 'ideal', label: 'No ideal (Xd)' }`; `days > 14` → `{ state: 'passou', label: 'Passou do ideal (Xd)' }`
- [ ] Spec cobre: fronteiras 2/3/14/15 dias; sem data → `null`; data futura → `fresco` com clamp; data inválida → `null`; label exato em cada estado
- [ ] `ng test --include='**/degass.util.spec.ts'` verde — Test count: 10+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/degass.util.spec.ts'` → verde, 10+ testes

**Commit**: `feat(beans): degass util puro + unit tests`

---

### T3: ValidatorsUtil — requiredTrimmed [P]

**What**: Validador puro `requiredTrimmed` que trata whitespace-only como vazio, + spec unitário.
**Where**: `src/app/core/utils/validators.util.ts` + `validators.util.spec.ts`
**Depends on**: None
**Reuses**: tipos de `@angular/forms`
**Requirement**: BEAN-02 (Marca obrigatória; espaços = vazio)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `requiredTrimmed(control: AbstractControl): ValidationErrors | null` — erro `{ requiredTrimmed: true }` se o valor trimado é vazio
- [ ] Spec cobre: vazio → erro; `'   '` → erro; texto → `null`
- [ ] `ng test --include='**/validators.util.spec.ts'` verde — Test count: 3+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/validators.util.spec.ts'` → verde, 3+ testes

**Commit**: `feat(beans): requiredTrimmed + unit tests`

---

### T4: BeanStore — suggestions, byId e normalização legado

**What**: Completar o `BeanStore` esqueleto da M1: computeds de sugestões de autocomplete, `byId` e normalização de Beans legados sem `status`.
**Where**: `src/app/core/stores/bean.store.ts` (expandir) + `bean.store.spec.ts` (estender)
**Depends on**: T1
**Reuses**: `BaseStore<T>` da M1 (add/update/remove + persist explícito); `StorageService`
**Requirement**: BEAN-01, BEAN-03, BEAN-04, BEAN-07, BEAN-15, BEAN-16

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `originSuggestions = computed(...)` / `varietySuggestions = computed(...)` — distinct, ignora vazios, case-insensitive dedup
- [ ] `byId(id: string): Bean | undefined`
- [ ] Normalização na leitura: Bean legado (M1) sem `status` → `DEFAULT_BEAN_STATUS` ('fechado'); `roastDate`/campos opcionais ausentes tolerados (`undefined`)
- [ ] Spec estende o da M1 (StorageService mockado): `add` persiste Bean com `status`; `update` preserva `id`/`createdAt`; `remove`; `byId`; sugestões distinct/case-insensitive/ignora vazios; Bean legado sem `status` → `fechado`; storage `null` → `[]`
- [ ] `ng test --include='**/bean.store.spec.ts'` verde — Test count: 10+ (sem remoções silenciosas)

**Tests**: unit
**Gate**: quick

**Verify**:
- `ng test --include='**/bean.store.spec.ts'` → verde, 10+ testes

**Commit**: `feat(beans): BeanStore com suggestions/byId + normalização`

---

### T5: AutocompleteFieldComponent — ControlValueAccessor compartilhado [P]

**What**: Componente de input com sugestões (`ControlValueAccessor`) reutilizável (M4 usará para "moagem").
**Where**: `src/app/shared/autocomplete-field/autocomplete-field.component.ts`
**Depends on**: None
**Reuses**: `ReactiveFormsModule` (AD-009), tokens `text-input`/`autocomplete-suggestion`/`caption-md`
**Requirement**: BEAN-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `suggestions = input<string[]>([])`, `label`/`placeholder` inputs; implementa `writeValue`/`registerOnChange`/`registerOnTouched` (provider `NG_VALUE_ACCESSOR`)
- [ ] `filtered` — contém case-insensitive, máx. 6 sugestões; lista abre ao focar/digitar, colapsa ao selecionar/blur
- [ ] `select(v)` grava via `onChange` + colapsa; valor digitado novo é aceito (sem restrição a sugestões)
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(beans): AutocompleteField compartilhado (CVA)`

---

### T6: BeanCardComponent — badge de degass + seletor de status [P]

**What**: Card de grão com Marca, metadados, badge de degass (via `degassInfo`), seletor de status inline e ação de excluir.
**Where**: `src/app/features/beans/bean-card.component.ts`
**Depends on**: T1, T2, T4
**Reuses**: tokens `bean-card`/`card-title`/`caption-md`/`badge-degass-*`/`status-selector`/`link-inline`; `DegassUtil`; `BeanStore` (persistir status)
**Requirement**: BEAN-08, BEAN-09, BEAN-10, BEAN-11, BEAN-12, BEAN-13, BEAN-15, BEAN-16, BEAN-17

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `bean = input.required<Bean>()`; `degass = computed(() => degassInfo(bean().roastDate ?? null))` — `null` → badge não renderiza (`@if`)
- [ ] Linha 1: Marca (link `/beans/:id/edit`, `card-title`); linha 2: `origem · processo` em `caption-md`/`coffee-mute` (omitida se ambos ausentes)
- [ ] Seletor de status: estado atual como `status-selector`; ao tocar, expande para os 3 status (`STATUS_ORDER`) com `status-selector-active` no corrente; `setStatus` chama `beanStore.update` e colapsa
- [ ] Ação `[x]` em terracota emite `delete` (output) — dialog fica na `BeansPage`
- [ ] Badge de degass independente do status do pacote (um não altera o outro)
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(beans): BeanCard com badge de degass + status selector`

---

### T7: BeanFormComponent — cadastro e edição (Reactive Forms) [P]

**What**: Formulário de cadastro/edição com validação de Marca, autocomplete de Origem/Variedade, select de Processo, data de torra e notas; salva via BeanStore.
**Where**: `src/app/features/beans/bean-form.component.ts`
**Depends on**: T1, T3, T4, T5
**Reuses**: `ReactiveFormsModule` (AD-009); tokens `text-input`/`textarea`/`select`/`button-primary`/`button-secondary`/`heading-md`; `AutocompleteFieldComponent`; `ValidatorsUtil`; `BeanStore`; `Router`/`ActivatedRoute`
**Requirement**: BEAN-01, BEAN-02, BEAN-03, BEAN-04, BEAN-05, BEAN-06, BEAN-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `FormGroup` com `brand` (required + `requiredTrimmed`), `origin`, `variety` (ambos com `AutocompleteFieldComponent` ligado às sugestões do store), `process` (select fixo com placeholder "Selecionar…"), `roastDate` (`<input type="date">`, opcional), `notes` (textarea)
- [ ] Mensagem de erro inline "Marca é obrigatória." em `caption-md`/terracota quando `brand` inválido (fecha gap do DESIGN.md)
- [ ] `save()`: form inválido → marca touched, não salva; válido → monta Bean (novo: `crypto.randomUUID()`, `createdAt = new Date().toISOString()`, `status: DEFAULT_BEAN_STATUS`; edição: preserva `id`/`createdAt`/`status`) e chama `add`/`update`; navega para `/beans`
- [ ] Rota de edição: carrega via `beanStore.byId(param)`; id inexistente → redireciona para `/beans`; cancelar (`button-secondary`) volta sem salvar
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(beans): formulario de cadastro/edicao`

---

### T9: Rotas `/beans/new` + `/beans/:id/edit`

**What**: Registrar as duas rotas do formulário via `loadComponent` apontando para o `BeanFormComponent` (novo com id ausente; edição com id no param). Ordem: `beans/new` antes de `beans/:id/edit`.
**Where**: `src/app/app.config.ts`
**Depends on**: T7
**Reuses**: rotas lazy da M1 (`loadComponent`)
**Requirement**: BEAN-01, BEAN-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `{ path: 'beans/new', loadComponent: () => import('.../bean-form.component').then(m => m.BeanFormComponent) }` e `{ path: 'beans/:id/edit', ... }` registrados antes/independentes da rota `beans`
- [ ] `ng build` compila sem erros

**Tests**: none (rotas — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(beans): rotas de formulario`

---

### T8: BeansPage — listagem, empty state e exclusão

**What**: Substituir o placeholder de `/beans` pela página real: cabeçalho, CTA "+ Adicionar grão", listagem de cards (newest-first) e `<dialog>` nativo de confirmação de exclusão.
**Where**: `src/app/features/beans/beans.page.ts`
**Depends on**: T4, T6, T9
**Reuses**: tokens `empty-state`/`dialog-confirm`/`button-primary`/`button-secondary`/`button-danger`/`heading-md`; `BeanCardComponent`; `BeanStore`; `RouterLink`
**Requirement**: BEAN-08, BEAN-14, BEAN-18, BEAN-19, BEAN-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `beans = computed(() => beanStore.items())` ordenado por `createdAt` desc (mais recente primeiro)
- [ ] Vazio → `empty-state` `[+] Nenhum grão registrado` + CTA "+ Adicionar grão" (`button-primary`, `RouterLink` `/beans/new`)
- [ ] Lista → `@for` de `BeanCardComponent`; `delete(id)` abre `<dialog>` (token `dialog-confirm`) com a Marca do grão, `button-secondary` Cancelar e `button-danger` Excluir; confirmar → `beanStore.remove(id)` + fecha; cancelar → só fecha
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(beans): BeansPage com listagem + exclusao`

---

### T10: Dashboard — contagem de grãos abertos [P]

**What**: Atualizar o `DashboardPage` para exibir **grãos abertos** (`status === 'aberto'`) em vez de total, cumprindo o que AD-008 adiou da M1 (SHELL-19).
**Where**: `src/app/features/dashboard/dashboard.page.ts`
**Depends on**: T4
**Reuses**: tokens `dashboard-card`/`display-md`/`empty-state`; `BeanStore`
**Requirement**: SHELL-19 (herdado — AD-008/AD-010)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `openBeans = computed(() => beanStore.items().filter(b => b.status === 'aberto').length)` exibido como número (`display-md`) com label "grãos abertos"
- [ ] Sem grãos abertos → empty state (sem erro)
- [ ] `ng build` compila sem erros

**Tests**: none (UI — verificação manual na T11)
**Gate**: build

**Verify**:
- `ng build` → ok

**Commit**: `feat(beans): dashboard conta graos abertos`

---

### T11: Validação manual da M2 + full gate

**What**: Passada de validação final da M2: fluxo CRUD completo, badges de degass, validação, autocomplete, seletor de status, exclusão, dashboard e mobile. Rodar full gate.
**Where**: — (verificação)
**Depends on**: T8, T10
**Reuses**: checklist de verificação manual do design (Testes & Gate)
**Requirement**: BEAN-01..20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `ng test` → suíte toda verde (degass + validators + stores)
- [ ] `ng build` sem erros; `ng lint` limpo
- [ ] CRUD: adicionar → topo da lista; editar → persiste após reload; reload mantém dados
- [ ] Badge: sem data (ausente), < 3, 3–14, > 14, e data futura → estado/cor corretos
- [ ] Validação: salvar sem Marca e com `"   "` → bloqueado com mensagem terracota
- [ ] Autocomplete: sugere valores usados; valor novo aceito e aparece nas sugestões futuras
- [ ] Seletor de status: troca Aberto/Fechado/Finalizado na lista → persiste após reload; não altera o badge
- [ ] Exclusão: confirmar → some e não volta após reload; cancelar → nada muda
- [ ] Dashboard: contagem de grãos abertos reflete o status
- [ ] Mobile ≤ 480px: listagem, formulário e dialog utilizáveis sem scroll horizontal; bottom nav intacta
- [ ] Cobertura BEAN-01..20 = 20/20 verificada

**Tests**: none (manual + gates)
**Gate**: full

**Verify**:
- `ng test && ng build && ng lint` → todos verdes
- Checklist manual acima concluído

**Commit**: `chore(beans): validacao M2`

---

## Parallel Execution Map

```
Phase 1 (Parallel):     T1 ──┬─→ T4
                          T2 [P]
                          T3 [P]
                          T5 [P]
Phase 2 (Sequential):   T4
Phase 3 (Parallel):     T4 ──┬─→ T6 [P]
                              ├─→ T7 [P]
                              └─→ T10 [P]
Phase 4 (Sequential):   T7 ──→ T9 ──→ T8
Phase 5 (Sequential):   T8 ──┐
                        T10 ─┴─→ T11
```

**Paralelismo**: unit tests são parallel-safe (Vitest isola arquivos); tasks de UI não têm estado mutável compartilhado. T1/T2/T3/T5 e T6/T7/T10 são `[P]`. T4 depende do modelo (T1); T9 depende do form (T7); T8 depende do card (T6), do store (T4) e das rotas (T9); T11 valida tudo.

---

## Test Co-location Validation

| Task | Camada criada/alterada | Matriz exige | Task diz | Status |
| --- | --- | --- | --- | --- |
| T1 | Modelo de domínio (Bean) | none | none | ✅ |
| T2 | Util puro (degass) | unit* | unit | ✅ |
| T3 | Util puro (validators) | unit* | unit | ✅ |
| T4 | BeanStore (store) | unit | unit | ✅ |
| T5 | AutocompleteField (UI) | none (manual) | none | ✅ |
| T6 | BeanCard (UI) | none (manual) | none | ✅ |
| T7 | BeanForm (UI) | none (manual) | none | ✅ |
| T9 | app.config (rotas) | none (manual) | none | ✅ |
| T8 | BeansPage (UI) | none (manual) | none | ✅ |
| T10 | DashboardPage (UI) | none (manual) | none | ✅ |
| T11 | — (validação) | — | none | ✅ |

*Utils de lógica pura → `unit`, estendendo a matriz do TESTING.md (AD-004 exige cálculo de dias unit-testável).

---

## Requirement Traceability

| Requirement | Tasks |
| --- | --- |
| BEAN-01 | T1, T4, T7, T9 |
| BEAN-02 | T1, T3, T7 |
| BEAN-03 | T4, T7, T9 |
| BEAN-04 | T4, T5, T7 |
| BEAN-05 | T1, T7 |
| BEAN-06 | T1, T7 |
| BEAN-07 | T1, T4, T7 |
| BEAN-08 | T6, T8 |
| BEAN-09 | T2, T6 |
| BEAN-10 | T2, T6 |
| BEAN-11 | T2, T6 |
| BEAN-12 | T2, T6 |
| BEAN-13 | T2, T6 |
| BEAN-14 | T8 |
| BEAN-15 | T4, T6 |
| BEAN-16 | T4, T6 |
| BEAN-17 | T6 |
| BEAN-18 | T8 |
| BEAN-19 | T8 |
| BEAN-20 | T8 |
| SHELL-19 (herdado) | T10 |
| Cobertura | BEAN 20/20 via T11 |
