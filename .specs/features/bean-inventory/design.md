# Bean Inventory — Design

**Spec**: `.specs/features/bean-inventory/spec.md`
**Context**: `.specs/features/bean-inventory/context.md`
**Status**: Approved (2026-08-05 — usuário aprovou; rotas separadas + status default `fechado` confirmados)

---

## Resumo executivo

A M2 transforma a `BeansPage` placeholder da M1 em um CRUD completo de grãos sobre contratos já estabelecidos (StorageService, BaseStore, rotas lazy, tokens do DESIGN.md). Nenhum contrato da M1 muda: **StorageService**, **BaseStore** e **rotas** são herdados intactos; `BeanStore` (esqueleto da M1) é completado com o modelo de domínio e derivados; `BeansPage` é substituída. Duas decisões novas de UX confirmadas: formulário em **rotas separadas** (`/beans/new`, `/beans/:id/edit`) e **status default `fechado`** ao cadastrar.

Novidade de lógica de domínio: o **cálculo de degass** (janela 3–14 dias) vive numa função pura unit-testável (`degass.util.ts`), consumida pelo badge do card. Formulários usam **Reactive Forms** (AD-009); o **autocomplete** de Origem/Variedade é um componente reutilizável (`ControlValueAccessor`) que a M4 também usará para "moagem". A exclusão usa o **`<dialog>` nativo** (zero dependência, acessível, token `dialog-confirm`).

---

## Architecture Overview

Fluxo de dados segue o padrão da M1: **Componente → Store (signals) → StorageService → LocalStorage**. Componentes de UI nunca tocam storage; mutação e persistência vivem no store. Lógica pura (degass, validação) fica em utils sem dependência de Angular, facilmente testável.

```mermaid
graph TD
    subgraph UI
        Beans[BeansPage - /beans]
        Card[BeanCardComponent]
        Form[BeanFormComponent - /beans/new + /beans/:id/edit]
        Auto[AutocompleteFieldComponent]
        Dash[DashboardPage]
    end

    subgraph Core
        BStore[BeanStore]
        Degass[DegassUtil - funcao pura]
        Valid[ValidatorsUtil - funcao pura]
        Base[BaseStore&lt;T&gt;]
        Storage[StorageService]
    end

    Beans -->|RouterLink /beans/new| Form
    Beans -->|@for de itens| Card
    Form -->|autocomplete origem/variedade| Auto
    Beans -->|computed le| BStore
    Card -->|update status / emit delete| BStore
    Form -->|add / update| BStore
    Dash -->|openBeans computed| BStore
    BStore -->|extends| Base
    Base -->|inject| Storage
    Card -->|badge de degass| Degass
    Form -->|validacao Marca| Valid
    Storage -->|get/set/remove| LS[(LocalStorage)]

    classDef ph stroke:#b45309,stroke-dasharray:4 2
    class Beans,Card,Form,Auto ph
```

`*` = componentes novos da M2. `BeansPage` substitui o placeholder da M1; `DashboardPage` ganha um `computed` (integração SHELL-19/AD-008).

---

## Code Reuse Analysis

### Contratos herdados da M1 (sem mudança)

| Recurso | Localização | Como usamos |
|---|---|---|
| `StorageService` | `src/app/core/storage/storage.service.ts` | Persistência única; envelope `{version, data}`; `null` em JSON inválido/versão incompatível — a M2 não toca |
| `BaseStore<T>` | `src/app/core/stores/base-store.ts` | `items = signal<T[]>`, `add/update/remove` com `persist()` explícito — herdado sem mudança |
| Rotas lazy + wildcard 404 | `src/app/app.config.ts` | Adicionar `beans/new` e `beans/:id/edit` via `loadComponent` |
| Tokens do DESIGN.md | `styles.scss` | `bean-card`, `status-selector`, `badge-degass-*`, `text-input`, `textarea`, `select`, `autocomplete-suggestion`, `empty-state`, `dialog-confirm`, `button-*`, `link-inline` |
| `ReactiveFormsModule` | @angular/forms (AD-009) | `FormGroup`/`FormControl` no BeanFormComponent e no AutocompleteFieldComponent |
| `BeanStore` esqueleto | `src/app/core/stores/bean.store.ts` | Completado: modelo Bean expandido + `suggestions`/`byId` |

### Integration Points

| Sistema | Método de integração |
|---|---|
| Dashboard ↔ BeanStore | `DashboardPage` passa a exibir **contagem de grãos abertos** (`openBeans = computed(...)`), cumprindo o que AD-008 adiou da M1 (SHELL-19) |
| M4 (futuro) ↔ autocomplete | `AutocompleteFieldComponent` é reutilizado na M4 para o campo "moagem" (mesmo padrão CVA + suggestions) |
| BeanStore ↔ degass | Badge consome `degassInfo()` puro; store não conhece degass |

---

## Components

### BeansPage (substitui placeholder da M1)

- **Propósito**: rota `/beans` — cabeçalho da seção, CTA "+ Adicionar grão", listagem de cards (mais recentes primeiro) e estado vazio.
- **Localização**: `src/app/features/beans/beans.page.ts`
- **Interfaces**:
  - `beans = computed(() => beanStore.items())` — ordenado por `createdAt` desc (mais recente primeiro)
  - `delete(id: string): void` — abre o `<dialog>` de confirmação com a Marca do grão
  - `confirmDelete(): void` — `beanStore.remove(id)` + fecha o dialog
  - `cancelDelete(): void` — apenas fecha o dialog
  - Template: `@if (beans().length === 0)` → `empty-state` `[+] Nenhum grão registrado` + CTA; senão `@for` de `BeanCardComponent`; `<dialog #confirmDialog>` no template (token `dialog-confirm`: pergunta + `button-secondary` Cancelar + `button-danger` Excluir)
- **Dependências**: `BeanStore`, `BeanCardComponent`, `RouterLink` (`/beans/new`), `DialogRef`/template ref do `<dialog>` nativo.
- **Reusa**: `empty-state`, `dialog-confirm`, `button-primary`, `button-secondary`, `button-danger`, `heading-md` do DESIGN.

### BeanCardComponent

- **Propósito**: card de um grão — Marca (título), Origem · Processo (caption), badge de degass, seletor de status e ação de excluir.
- **Localização**: `src/app/features/beans/bean-card.component.ts`
- **Interfaces**:
  - `bean = input.required<Bean>()`
  - `degass = computed(() => degassInfo(bean().roastDate ?? null))` — `DegassInfo | null`; `null` → badge não renderiza
  - `statusLabel = computed(() => STATUS_LABEL[bean().status])`
  - `selectorOpen = signal(false)` — expande/colapsa o seletor de status inline
  - `setStatus(status: BeanStatus): void` — emite `update` no `BeanStore` e colapsa o seletor
  - `delete = output<void>()` — delegado à `BeansPage` (que abre o dialog)
  - Template: linha 1 = Marca (link para `/beans/:id/edit`, `card-title`); linha 2 = `origem · processo` em `caption-md`/`coffee-mute` (omitida se ambos ausentes); badge `badge-degass-*` no canto; `status-selector` embutido; ação `[x]` em terracota
- **Dependências**: `BeanStore` (persistir status), `DegassUtil`, `RouterLink`.
- **Reusa**: `bean-card`, `card-title`, `caption-md`, `badge-degass-*`, `status-selector`/`status-selector-active`, `link-inline` do DESIGN.

**Decisão de design**: o **seletor de status expande inline no card** (estado atual como `status-selector`; ao tocar, mostra os 3 status como chips `status-selector-active` para o corrente). Sem popover — alinhado ao sistema "sem efeitos chamativos" e sem posicionamento frágil em mobile. O badge de degass é renderizado inline no card (é um `<span>` com token), pois a lógica testável está no util.

### BeanFormComponent (novo + editar)

- **Propósito**: formulário de cadastro e edição, rota `/beans/new` (id ausente) ou `/beans/:id/edit` (id no param). Salvar → `add`/`update` no store + navega de volta para `/beans`; Cancelar → volta sem salvar.
- **Localização**: `src/app/features/beans/bean-form.component.ts`
- **Interfaces**:
  - `form = new FormGroup({ brand: ['', [Validators.required, requiredTrimmed]], origin: [''], variety: [''], process: [''], roastDate: [''], notes: [''] })`
  - `originSuggestions = beanStore.originSuggestions`, `varietySuggestions = beanStore.varietySuggestions`
  - `save(): void` — se `form.invalid` → marca touched e mostra erro de Marca; senão monta `Bean` (novo: `crypto.randomUUID()`, `createdAt = new Date().toISOString()`, `status: 'fechado'`; edição: preserva `id`/`createdAt`/`status`) e chama `add`/`update`
  - `cancel(): void` — `router.navigate(['/beans'])`
- **Dependências**: `ReactiveFormsModule`, `BeanStore`, `AutocompleteFieldComponent`, `Router`/`ActivatedRoute`, `ValidatorsUtil`.
- **Reusa**: `text-input`, `textarea`, `select`, `autocomplete-suggestion`, `button-primary`, `button-secondary`, `heading-md` do DESIGN; mensagem de erro inline em `caption-md`/`terracota`.

**Decisão de design**: Processo usa `<select>` com opção vazia placeholder ("Selecionar…") como default — só Marca é obrigatória (D5), então `process` pode ficar sem valor. `roastDate` é `<input type="date">` (ISO `yyyy-MM-dd`, optional). **Erro de Marca** ("Marca é obrigatória.") em `caption-md` terracota — fecha o gap de validação apontado no DESIGN.md.

### AutocompleteFieldComponent (compartilhado)

- **Propósito**: input de texto livre com sugestões dos valores já usados em outros grãos; valor digitado novo é aceito. Implementa `ControlValueAccessor` para integrar com Reactive Forms (AD-009).
- **Localização**: `src/app/shared/autocomplete-field/autocomplete-field.component.ts` (compartilhado — M4 reusa para "moagem")
- **Interfaces**:
  - `suggestions = input<string[]>([])` — lista completa de valores conhecidos
  - `label = input<string>()` — label do campo
  - `placeholder = input<string>()`
  - `writeValue(v: string): void` / `registerOnChange(fn)` / `registerOnTouched(fn)` — contrato CVA
  - `filtered = computed(() => filterCaseInsensitive(suggestions(), value(), LIMIT))` — contém (case-insensitive), máx. 6 sugestões; `open` ao focar/digitar, colapsa ao selecionar/blur
  - `select(v: string): void` — grava via onChange + colapsa
- **Dependências**: `ReactiveFormsModule` (`NG_VALUE_ACCESSOR` provider), nada mais.
- **Reusa**: `text-input`, `autocomplete-suggestion`, `caption-md` do DESIGN.

---

## Services

### BeanStore (completado a partir do esqueleto da M1)

- **Propósito**: estado global dos grãos com Signals; mutação + persistência via `BaseStore` (sem mudança de contrato).
- **Localização**: `src/app/core/stores/bean.store.ts` (`providedIn: 'root'`)
- **Interfaces** (adicionadas na M2):
  - `originSuggestions = computed(() => distinctNonEmpty(items(), b => b.origin))`
  - `varietySuggestions = computed(() => distinctNonEmpty(items(), b => b.variety))`
  - `byId(id: string): Bean | undefined` — para a rota de edição
  - herdado: `items`, `add/update/remove` (BaseStore)
- **Dependências**: `BaseStore`, `StorageService`.
- **Reusa**: padrão `BaseStore` da M1.

### DegassUtil (novo — função pura)

- **Propósito**: calcular o estado da degass window a partir da Data de Torra. Sem dependência de Angular; `today` injetável para testes de fronteira.
- **Localização**: `src/app/core/utils/degass.util.ts`
- **Interfaces**:
  - `DEGASS_WINDOW_MIN = 3`, `DEGASS_WINDOW_MAX = 14`
  - `degassInfo(roastDate: string | null, today: Date = new Date()): DegassInfo | null`
  - retorna `null` se `roastDate` ausente **ou data inválida** (`isNaN(Date.parse)`) → badge não renderiza
  - `days = Math.floor((meiaNoite(today) - meiaNoite(roastDate)) / 86_400_000)`
  - `days < 3` → `{ state: 'fresco', label: 'Muito fresco (Xd)' }` (inclui datas futuras/negativas; exibição clampada em ≥ 0 para evitar "-3d")
  - `3 ≤ days ≤ 14` → `{ state: 'ideal', label: 'No ideal (Xd)' }`
  - `days > 14` → `{ state: 'passou', label: 'Passou do ideal (Xd)' }`
- **Dependências**: nada.
- **Reusa**: nada (lógica nova de domínio).

### ValidatorsUtil (novo — função pura)

- **Propósito**: validadores reutilizáveis para formulários. Na M2, apenas `requiredTrimmed`.
- **Localização**: `src/app/core/utils/validators.util.ts`
- **Interfaces**:
  - `requiredTrimmed(control: AbstractControl): ValidationErrors | null` — erro `{ requiredTrimmed: true }` se o valor trimado é vazio (Marca com só espaços = vazio, D5)
- **Dependências**: `@angular/forms` (tipos).
- **Reusa**: nada.

---

## Data Models

### Bean (expandido a partir do esqueleto da M1)

```typescript
export type BeanProcess = 'Washed' | 'Natural' | 'Honey' | 'Outro'
export type BeanStatus = 'aberto' | 'fechado' | 'finalizado'

export interface Bean {
  id: string
  brand: string            // única obrigatória (D5) — whitespace-only conta como vazio
  origin?: string          // autocomplete de valores usados
  variety?: string         // idem
  process?: BeanProcess    // select fixo; undefined = não escolhido
  roastDate?: string       // ISO yyyy-MM-dd (input type=date); ausente → sem badge
  notes?: string           // Notas Sensoriais
  status: BeanStatus       // default 'fechado' na criação (confirmado)
  createdAt: string        // ISO datetime — ordenação newest-first
}
```

**Relacionamentos**: `BeanStore.items: Bean[]`. Modelo não carrega `version` (envelope cuida disso). **Migração**: schema antigo da M1 (Bean com só `id`/`brand`/`createdAt`) tem `version` compatível mas campos novos ausentes → a leitura deve tolerar `undefined` nos campos opcionais (normalização no load, sem migração formal na v1). ⚠️ *Nota de execução: validar no M1+seed o comportamento de Bean legado sem `status` — tratar como `fechado` na leitura.*

### DegassInfo (saída do util)

```typescript
export type DegassState = 'fresco' | 'ideal' | 'passou'

export interface DegassInfo {
  state: DegassState
  days: number            // dias desde a torra (pode ser negativo p/ data futura)
  label: string           // "Muito fresco (Xd)" | "No ideal (Xd)" | "Passou do ideal (Xd)"
}
```

**Relacionamentos**: calculado por `degassInfo(roastDate)`; consumido apenas pelo `BeanCardComponent` (renderização de badge). Não é persistido.

---

## Error Handling Strategy

| Cenário | Tratamento | Impacto no usuário |
|---|---|---|
| Storage indisponível / JSON corrompido / versão incompatível | `StorageService` (M1) retorna `null` → lista vazia, sem crash | App funciona; dados não persistem |
| Bean legado da M1 sem `status` | Normalização na leitura → default `fechado` | Sem crash; card exibe status coerente |
| `roastDate` inválida (parse falha) | `degassInfo` retorna `null` | Badge de degass não renderiza (como sem data) |
| Data de Torra futura (dias negativos) | `degassInfo` → `fresco`; label clampada em ≥ 0 | Badge "Muito fresco (0d)" — não quebra |
| Rota `/beans/:id/edit` com id inexistente | Form redireciona para `/beans` | Volta à listagem sem erro visível |
| Marca vazia / só espaços | `requiredTrimmed` bloqueia submit; mensagem inline "Marca é obrigatória." (terracota) | Usuário não salva sem Marca |
| Cancelar exclusão | `<dialog>` apenas fecha; `remove` não é chamado | Lista inalterada |
| Autocomplete sem sugestões | Input aceita texto livre; sugestões futuras passam a incluí-lo | Campo funciona como input normal |

---

## Tech Decisions (não óbvias)

| Decisão | Escolha | Rationale |
|---|---|---|
| Navegação do formulário | Rotas `beans/new` + `beans/:id/edit` (lazy, componente compartilhado, id via param) | Confirmado pelo usuário; lista limpa, deep-linkable, padrão Angular |
| Status default na criação | `fechado` | Confirmado pelo usuário (pacote recém-cadastrado está lacrado) |
| Lógica de degass | Função pura `degassInfo` com `today` injetável | Fronteiras (3/14) e datas futuras testáveis por unidade, sem mock de clock |
| Badge de degass no card | Renderização inline (`<span>` com token `badge-degass-*`) | Lógica testável está no util; componente extra seria cerimônia |
| Seletor de status | Expansão inline no card (chips) | Sem popover/posicionamento; sistema "sem efeitos chamativos"; touch target ≥ ~44px |
| Confirmação de exclusão | `<dialog>` nativo (`showModal()`/`close()`) | Zero dependência, acessível, token `dialog-confirm` do DESIGN |
| Autocomplete | `ControlValueAccessor` compartilhado com filtro case-insensitive (contém) | AD-009 (Reactive Forms); reutilizável na M4 ("moagem") |
| Validação de Marca | `requiredTrimmed` + mensagem inline terracota | Fecha gap de validação do DESIGN.md; espaços = vazio (D5) |
| Sugestões de autocomplete | `computed` no store (distinct, não-vazio) | Derivado de dados existentes; nenhum armazenamento extra |
| Dashboard | Contagem de **grãos abertos** (`status === 'aberto'`) | Cumpre SHELL-19/AD-008 (adiado da M1); `Bean` agora tem `status` |
| Exibição de dias negativos | Clampada em ≥ 0 no label | "Muito fresco (0d)" em vez de "-3d" para data futura |
| Data de Torra | `<input type="date">` → ISO `yyyy-MM-dd` | Validação de data nativa do browser; ordenável/parseável |

---

## Testes & Gate

**Unit tests (Vitest):**
- `degass.util.spec.ts`: fronteiras 2/3/14/15 dias → fresco/ideal/ideal/passou; sem data → `null`; data futura → fresco (clamp ≥ 0); data inválida → `null`; label exato ("No ideal (7d)" etc.).
- `validators.util.spec.ts`: `requiredTrimmed` — vazio → erro; só espaços → erro; texto → `null`.
- `bean.store.spec.ts` (estende o spec da M1): `add` persiste Bean com `status`; `update` preserva `id`/`createdAt`; `remove`; `byId`; `originSuggestions`/`varietySuggestions` — distinct, ignora vazios, case-insensitive dedup; leitura de Bean legado sem `status` → normaliza `fechado`; storage `null` → lista vazia. (StorageService mockado.)

**Verificação manual (navegador):**
- CRUD completo: adicionar → aparece no topo; editar → alterações persistem após reload.
- Badge de degass: sem data (ausente), < 3 dias, 3–14, > 14, e data futura → estado e cor corretos.
- Validação: salvar sem Marca e com "   " → bloqueado com mensagem.
- Autocomplete: sugere valores usados; valor novo digitado é aceito e aparece nas sugestões futuras.
- Seletor de status: trocar Aberto/Fechado/Finalizado na lista → persiste após reload; não altera o badge de degass.
- Exclusão: confirmar → some e não volta após reload; cancelar → nada muda.
- Dashboard: contagem de **grãos abertos** reflete o status.
- Mobile ≤ 480px: listagem, formulário e dialog utilizáveis sem scroll horizontal; bottom nav intacta.

**Gate:** `ng test` verde (unit: degass + validators + stores) · `ng build` sem erros · `ng lint` limpo · navegação manual acima em mobile e desktop.

---

## Fora do escopo desta fase (design)

- Processo "Outro" com texto customizado (D4 — extensão futura).
- Histórico de uso por pacote (datas de abertura/finalização) — deferred.
- Filtro/ordenação extra na listagem além de created desc (não especificado na M2).
- Undo de exclusão (exclusão é permanente, BEAN-19).
- Migração formal de schema (v1 = `null` + normalização de campos ausentes).
