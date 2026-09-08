# State

**Last Updated:** 2026-08-06
**Current Work:** M8 concluída — port Capacitor Android (paridade M7 simplificado, sem nativo). M6/M7 concluídas (13/13 tasks verificadas). Guias de Extração completo: generalização do TimerState (modo simple/recipe com fases variáveis), 3 receitas V60 estáticas (Equilibrada, Intensa, Suave), GuideUtil puro (escala de volumes por dose), GuideStore (preferência persistida), ExtractionStore orquestrando modo receita (routeEntered/selectRecipe/exitRecipe/selectMethod/reset mode-aware), UI completa (BrewTimer variante receita, RecipeSelector, GuidesPage, GuideDetailPage), rotas `/guides` e `/guides/:id`. Suíte 191 tests, 13 files, lint OK, build OK. **AD-015 (pós-M6):** volumes das receitas agora seguem o total de água sugerida (dose × ratio) por porcentagens — painel `/extract` consistente com a calculadora, biblioteca `/guides/:id` ganha campo de ratio.

---

## Recent Decisions (Last 60 days)

### AD-001: Escopo v1 = 30 dias, 3 features (2026-08-05)

**Decision:** A v1 abrange 3 features: Bean Inventory, Extraction Panel (timer + ratio) e Brew Logs.
**Reason:** O arquivo de visão do produto define explicitamente um escopo de 30 dias com essas funcionalidades.
**Trade-off:** Sem backend, autenticação ou integrações na v1 — persistência apenas em LocalStorage.
**Impact:** Arquitetura deve isolar storage em serviço dedicado para facilitar migração futura.

### AD-002: Stack Angular 21 com Signals 100% (2026-08-05)

**Decision:** Reatividade 100% via Signals, Standalone Components sem NgModules, sintaxe `@if`/`@for`/`@switch`.
**Reason:** Requisito técnico explícito do arquivo de visão do produto.
**Trade-off:** Abandono de convenções NgModule/Zone.js tradicionais do Angular.
**Impact:** Todo componente e serviço novo deve seguir esse padrão.

### AD-003: M1 com Home/dashboard + 3 seções (2026-08-05)

**Decision:** Shell com rota raiz `''` renderizando dashboard (resumo + atalhos) e rotas `/beans`, `/extract`, `/logs`; StorageService genérico com schema versionado; dados iniciam vazios; verificação via unit tests de services.
**Reason:** Decisões do usuário durante specify da M1 (context.md D1-D4).
**Trade-off:** Dashboard adiciona agregados (contagem de grãos, últimos logs) já no M1.
**Impact:** M1 depende de stores com dados agregados consumíveis pelo dashboard.

### AD-004: M2 com degass 3-14 dias, status manual, só Marca obrigatória (2026-08-05)

**Decision:** Degass window 3-14 dias com badge colorido de 3 estados (fresco/ideal/passou + dias); status do pacote manual e independente do degass, alterado por seletor rápido na lista; formulário exige só Marca (Data de Torra opcional, sem badge se ausente), Origem/Variedade com autocomplete, Processo em select fixo; listagem em cards por data de criação desc; exclusão com confirmação permanente.
**Reason:** Decisões do usuário durante specify da M2 (context.md D5-D8).
**Trade-off:** Autocomplete e badge adicionam complexidade de UI à M2; "Outro" de processo sem texto customizado na v1.
**Impact:** M2 precisa de um seletor rápido de status no card (interação nova no shell) e de lógica de cálculo de dias (unit-testável).

### AD-005: M3 com ratio preset por método, timer com fase pulável e nada salvo (2026-08-05)

**Decision:** Painel de extração 100% em tempo real: ratio preset por método (Espresso 1:2, V60 1:16, Prensa 1:15, Aeropress 1:15) editável livremente e sem limite de X; calculadora só pó → água sugerida (g, arredondada ao inteiro, reativa); cronômetro mm:ss com fase de pré-infusão sempre presente e pulável (avanço manual), display fase + total, Start/Pause/Reset, reinicia ao sair da rota; edição de dose/ratio permitida com timer rodando; timer em destaque no topo, método em chips horizontais, calculadora em cards. Nada salvo na M3; estado final (método, dose, ratio, água, tempos) exposto em computed para a M4 consumir.
**Reason:** Decisões do usuário durante specify da M3 (context.md D-EXTR-01..05).
**Trade-off:** Sem presets persistidos, sem timer em background e sem atalho para histórico na v1 — simplifica o painel; a ponte com Brew Logs fica para M4.
**Impact:** M3 precisa de lógica pura unit-testável (cálculo de ratio + máquina de estados do timer) e um estado derivado consumível pela M4.

### AD-006: Design system monospace com paleta café completa (2026-08-05)

**Decision:** `DESIGN.md` vira o design system do app (antes descrevia o site de marketing do OpenCode): 100% monospace (Berkeley Mono → fallback JetBrains Mono/ui-monospace), paleta café completa (espresso `#3b2f2a` como cor de destaque, canvas cream, superfícies latte/caramel-cream), markers ASCII como única iconografia, 4px radius em interativos, hairline 1px como divisores. Badges de degass em tom de café: verde-erva (No ideal), âmbar-caramelo (Muito fresco), terracota (Passou do ideal) — sem cores HIG puras. Bottom nav fixa ≤480px; nav horizontal no topo em desktop. `DESIGN.md` é referência obrigatória antes de qualquer trabalho de UI (registrado no AGENTS.md).
**Reason:** Decisões do usuário durante brainstorming visual (estética café, monospace, badges em tom de café).
**Trade-off:** Visual monospace/planilha é mais austero que um app de consumo convencional; Berkeley Mono é pago, requer fallback open-source.
**Impact:** Todo componente/serviço de UI (M1..M5) deve consumir os tokens do DESIGN.md; linter `npx @google/design.md lint DESIGN.md` roda após edições.

### AD-007: M4 com log de receita + estrelas, grão opcional, atalho do painel M3 (2026-08-05)

**Decision:** Brew Logs com duas origens: atalho "Salvar no histórico" no painel M3 (pré-preenche método/dose/ratio/água/tempo e navega para `/logs`) e formulário manual em `/logs`; método é o único campo obrigatório (select dos 4 métodos); grão opcional via seletor de `/beans` com snapshot de nome no log; moagem em texto livre com autocomplete dos valores já usados; avaliação em estrelas 1–5 (Acidez, Corpo, Doçura) com Nota Geral manual e independente, todas opcionais (0 = não avaliado); só tempo total (mm:ss) no log; histórico em cards por data de criação desc com filtros por grão e método, estado vazio com CTA, tela de detalhe com edição; exclusão com confirmação permanente.
**Reason:** Decisões do usuário durante specify da M4 (context.md D-LOG-01..08).
**Trade-off:** O atalho adiciona UI ao painel M3 (trabalho M4 tocando código M3); sem gráficos, export e Nota Geral automática na v1.
**Impact:** M4 precisa de lógica pura unit-testável (ratio derivado água ÷ dose + validação de mm:ss) e de uma ponte entre o estado exposto da M3 e o formulário pré-preenchido.

---

### AD-008: Tooling concreto e arquitetura da M1 (2026-08-05)

**Decision:** Stack concreta: Angular CLI 21 + builder `application` (esbuild), Vitest como test runner (`@angular/build:unit-test`), zoneless (`provideZonelessChangeDetection`), lint com `ng add @angular-eslint/schematics` v21 (eslint.config.ts via defineConfig), SCSS, sem SSR/PWA. Arquitetura: fluxo `Componente → Store (signals) → StorageService → LocalStorage`; StorageService genérico com envelope `{ version, data }` + `SCHEMA_VERSION` (versão incompatível/JSON corrompido → `null`, sem crash); `BaseStore<T>` abstrato com `items = signal<T[]>` e `persist()` explícito (não via `effect()`, reservado p/ side effects reativos da M3); BeanStore/LogStore como esqueletos que M2/M4 completam; nav top/bottom alternando só via CSS media query; rotas lazy (`loadComponent`) + 404 wildcard. Dashboard M1 mostra **total de grãos** + empty states; filtro "grãos abertos" (SHELL-19) adiado para M2 (domínio do status, AD-004) — confirmado pelo usuário.
**Reason:** Angular 21 tornou Vitest/zoneless/standalone os defaults (verificado em docs oficiais); isolamento do storage é pré-requisito AD-001; envelope versionado mantém serviço genérico sem acoplar domínio.
**Trade-off:** Sem migração de schema na v1 (dados antigos retornam `null`); dashboard M1 não mostra filtro por status; persistência explícita exige chamada manual de `persist()`.
**Impact:** Contratos (StorageService, BaseStore, rotas, tokens CSS) são herdados por M2–M4 sem mudança; design completo em `.specs/features/app-shell/design.md`.

---

### AD-009: Formulários com Angular Reactive Forms (2026-08-05)

**Decision:** Todos os formulários do app (M2 Bean form, M4 Brew Logs form + autocomplete de Origem/Variedade/moagem) usam Angular Reactive Forms (`ReactiveFormsModule`, `FormGroup`/`FormControl`) via imports standalone — sem template forms.
**Reason:** Autocomplete de valor livre (Origem/Variedade na M2, moagem na M4) exige controle fino de input + validação reativa; padroniza e é facilmente testável por unidade, coerente com a stack Signals.
**Trade-off:** Mais boilerplate que template forms; não afeta a M1 (sem formulários no shell).
**Impact:** Componentes de formulário (M2, M4) importam `ReactiveFormsModule`; specs das features devem referenciar validação e autocomplete via forms reativos.

---

### AD-010: Arquitetura da M2 — Bean Inventory (2026-08-05)

**Decision:** Design completo em `.specs/features/bean-inventory/design.md` (aprovado): formulário em **rotas separadas** `/beans/new` + `/beans/:id/edit` (lazy, componente compartilhado, id via param); **status default `fechado`** na criação; lógica de degass como **função pura** `degassInfo(roastDate, today?)` (janela 3–14, datas futuras → "Muito fresco" com clamp ≥0, data inválida/ausente → `null` sem badge) + `requiredTrimmed` puro; badge de degass **inline no card**; **seletor de status expande inline** no card; exclusão via **`<dialog>` nativo**; **autocomplete** como `ControlValueAccessor` compartilhado (`src/app/shared/autocomplete-field/`) filtro case-insensitive contém; `BeanStore` completado com `originSuggestions`/`varietySuggestions` (distinct, não-vazio) e `byId`; **Dashboard passa a contar grãos abertos** (`status === 'aberto'`, fecha SHELL-19/AD-008); Bean legado da M1 sem `status` → **normalizado para `fechado` na leitura**; erro de Marca inline em terracota (fecha gap do DESIGN.md). Nenhum contrato da M1 muda (StorageService/BaseStore/rotas intactos).
**Reason:** Decisões do usuário durante o design (rotas separadas, status default); funcionalidades novas (degass, validação, autocomplete) colocadas em lógica pura/componente compartilhado para testabilidade unitária e reuso na M4.
**Trade-off:** Duas rotas novas no shell; normalização de Bean legado (sem migração formal na v1); badge/status selector ampliam o bean-card mas mantêm o vocabulário do DESIGN.
**Impact:** M2 executa sobre a M1 (que define os contratos); M4 reutiliza `AutocompleteFieldComponent`; todo requisito BEAN-01..20 tem design de suporte.

---

### AD-011: Arquitetura da M3 — Extraction Panel (2026-08-05)

**Decision:** Design completo em `.specs/features/extraction-panel/design.md` (aprovado): `ExtractPage` (substitui placeholder M1, sem mudar rota) compõe 3 componentes — `BrewTimerComponent` (display `timer-display`, fase + total, Iniciar/Pausar/Reiniciar/Avançar fase), `MethodSelectorComponent` (chips `button-tab` roláveis) e `RatioCalculatorComponent` (Dose g + Ratio 1:X + readout de água `display-md` com `—` quando nulo); **`ExtractionStore` transiente** — primeiro store que **não** estende `BaseStore` nem usa `StorageService` (D-EXTR-05, nada persiste), `providedIn: 'root'` para a M4 consumir; lógica pura unit-testável em `brew-ratio.util.ts` (`suggestedWater`, `parsePositiveNumber`, `RATIO_PRESETS`) e `timer.util.ts` (máquina `createTimerState`/`tickTimer`/`advancePhase`/`formatMmSs`); **intervalo do cronômetro via `effect()`** (AD-008) com cleanup automático; método default `espresso`; reset **só do cronômetro** ao sair da rota (`routeExited` via `DestroyRef`) — método/dose/ratio permanecem; **contrato M4 = `computed<BrewState>`** (método, métodoLabel, dose/ratio/water `number|null`, fase, faseLabel, tempos, running) + `BrewMethod` union estável com labels PT-BR; sem Reactive Forms no painel (inputs livres via signals). Nenhum contrato da M1 muda.
**Reason:** Decisões do usuário durante o design (aprovação); D-EXTR-01..05 do context.md; lógica de domínio em funções puras segue o padrão de testabilidade da M2 (degass).
**Trade-off:** ExtractionStore fora do padrão BaseStore (sem persistência é a exceção que confirma a regra); effect() no timer exige `flushEffects()` + fake timers nos testes; default `espresso` é arbitrário mas EXTRACT-01 exige um selecionado.
**Impact:** M3 executa sobre a M1 (rota `/extract` + tokens do DESIGN); M4 reutiliza `BREW_METHODS`/`BrewState` sem refazer cálculos; sem nova rota no shell.

---

### AD-013: Arquitetura da M6 — Guias de Extração (2026-08-06)

**Decision:** Design completo em `.specs/features/extraction-guides/design.md` (aprovado): **`TimerState` generalizado** (M3 → M6) com `mode: 'simple' | 'recipe'`, `phaseIndex`, `phases: TimerPhase[]` (`{id, label, targetSeconds}`) e `completed` — modo simples mantém as 2 fases da M3 (sem meta, sem auto-advance), modo receita usa as fases da receita (metas **cumulativas**) com auto-advance no `tickTimer` puro (`totalSeconds >= target`) e conclusão na última fase; **`BrewState` preservado** — `phase` widened para `string`, `phaseLabel` = nome da fase ativa (M4 só lê `totalTime`, verificado no log-form); `guide.model.ts` com 3 receitas V60 estáticas (`RECIPES`/`RECIPES_BY_ID`, D-GUIDE-10); `guide.util.ts` puro (`scaledPhases` com `round(volume×dose/20)` e dose inválida → base, `recipeToTimerPhases`); **`GuideStore`** novo injeta `StorageService` para a **preferência** (chave `guide:preferredRecipe`, payload id, envelope versionado — primeiro padrão "preferência" fora dos stores de domínio); **`ExtractionStore` injeta `GuideStore`** e orquestra `routeEntered` (restaura receita zerada), `selectRecipe` (persiste), `exitRecipe` (Modo simples limpa preferência), `selectMethod` (desativa só na sessão p/ método ≠ V60, restaura ao voltar) e `reset` mode-aware; UI: `RecipeSelectorComponent` (atalho "biblioteca →" sempre visível + cards V60 + fases escaladas + "Modo simples"), variante no `BrewTimerComponent` (total cumulativo + meta + "[OK] Concluída"), `GuidesPage`/`GuideDetailPage` passivas (dose local 20g) nas rotas `/guides` e `/guides/:id`. Nenhum contrato da M1 muda (StorageService/BaseStore/rotas existentes intactos).
**Reason:** Decisões do usuário durante o design (aprovação); AD-012 e D-GUIDE-01..12 do context.md; generalização do timer como pré-requisito para fases variáveis sem duplicar componentes.
**Trade-off:** Refactor breaking interno do `TimerState` (M3 é interno; specs de timer/extraction são reescritos na M6); `GuideStore` é a primeira persistência fora do padrão BaseStore (preferência, não coleção); reset em modo receita volta à 1ª fase da receita (não sai do modo).
**Impact:** M6 executa sobre M1/M3 (rota `/extract`, ExtractionStore, timer, StorageService, tokens do DESIGN); tasks cobrem escala pura + máquina de fases + preferência (unit-testáveis) e UI (painel + biblioteca + rotas); `BrewState` da M4 continua válido para logs.

---

### AD-012: M6 com guias de extração — biblioteca + receita dirige timer (2026-08-06)

**Decision:** Guias de Extração (M6) em duas superfícies: biblioteca própria `/guides` (consulta passiva, acessada por atalho dentro do painel, sem nova aba na nav) e integração com `/extract` (receita selecionada configura o cronômetro com as fases da receita como suas fases, avanço automático na meta + manual, modo simples de 2 fases como saída). Escopo v1: só Coado/V60 com 3 receitas (Equilibrada, Intensa, Suave) — conteúdo estático embutido, base 20g/300g; o guia **não exibe ratio** (volumes em gramas por fase), resolvendo o conflito 1:15 vs preset V60 1:16 da M3 (que permanece). Modelo de fase: `volumeAgua` = total acumulado ao fim da fase (sempre presente; sem vertida repete o anterior) e `tempoObjetivo` = tempo decorrido cumulativo. Volumes escalam pela dose (`volume × dose / 20`, arredondado), tempos fixos; dose do painel vem do `ExtractionStore`, biblioteca tem campo próprio (default 20g). Preferência de receita persistida (StorageService): painel abre sem receita; selecionar persiste o id; "Modo simples" limpa a preferência; troca de método desativa a receita só na sessão mas preserva a preferência do V60. Sem Chemex (não é método do app). Contrato `BrewState` da M4 permanece válido (logs só usam tempo total).
**Reason:** Decisões do usuário durante discussão dos gray areas (GA-1..5 + fechamentos): biblioteca + painel, só V60, sem ratio, semânticas cumulativas, escala por dose, receita dirige + modo simples, preferência persistida, conteúdo estático.
**Trade-off:** Extensão do timer da M3 (fases fixas → fases variáveis por receita) sem quebrar `BrewState`; preferência de receita é a primeira coisa persistida fora dos stores de domínio (novo padrão de "preferência"; StorageService herdado).
**Impact:** M6 executa sobre M1/M3 (rota, ExtractionStore, timer, tokens do DESIGN); design precisa estender `TimerState`/`BrewPhase` e definir o store/estado de guia; tarefas cobrem escala pura + máquina de fases + preferência (unit-testáveis) e UI (painel + biblioteca + rota).

---

### AD-015: Volumes das receitas seguem o total de água sugerida (2026-08-06)

**Decision:** Os volumes das fases de uma receita deixam de escalar só pela dose (`volume × dose / 20`, D-GUIDE-06 antigo) e passam a ser **porcentagens do total de água sugerida**: `round(volumeAcumulado × totalSugerido / totalBase)`, com `totalBase` = volume da última fase (300g) e `totalSugerido = dose × ratio`. No painel `/extract`, o total vem do `ExtractionStore` (dose × ratio, o mesmo readout "Água sugerida") — a última fase sempre iguala o total sugerido, eliminando a divergência receita (300g) vs preset V60 1:16 (320g). Na biblioteca `/guides/:id`, um novo campo **ratio** (default 1:15, razão implícita da receita) acompanha o campo de dose (D-GUIDE-07). `scaledPhases(recipe, totalWater)` agora recebe o total (não mais a dose); `recipeBaseTotal` deriva o total base da receita.
**Reason:** Usuário reportou que o painel usava o volume por fase sem considerar o total de água sugerida; solicitado cálculo por porcentagens sobre o total sugerido.
**Trade-off:** A biblioteca passa a expor ratio (contra D-GUIDE-03 antigo, "guia sem exibir ratio"); receita base mantém razão implícita 1:15, mas o preset V60 1:16 do painel muda as fases para 320g em dose 20g.
**Impact:** `guide.util.ts` (scaledPhases/scaleVolume/recipeBaseTotal), `extraction.store.ts` (scaledActivePhases → water()), `guide-detail.page.ts` (campo ratio + suggestedWater); specs/context M6 atualizados (D-GUIDE-03/06/07, story de escala).

---

### AD-014: Header global minimalista com marca em texto (2026-08-06)

**Decision:** O header global deixa de usar o wordmark ASCII block-pixel (bloco de 6 linhas "SPYRTO" que ocupava espaço sem função) e passa a mostrar a marca `[ espresso & bean ]` em texto monospace bold (cor `--color-espresso`, token heading-md) como link para a dashboard. No desktop (≥768px) o header é uma única linha: marca à esquerda e a nav horizontal (Home · Grãos · Extrair · Histórico) à direita, divididas pela hairline inferior; no mobile (≤480px) o header mostra só a marca, pois a navegação é a bottom-nav fixa. Todo o contexto e ações permanecem nos headers de página. O CSS `.wordmark`, o `overflow-x: clip` e o `preserveWhitespaces: true` (necessários só para o ASCII art) são removidos.
**Reason:** Brainstorming do usuário (header atual "não faz sentido"): escolhida a opção "Só marca, minimalista" e o tratamento `[ espresso & bean ]`; nome oficial "Espresso & Bean Tracker" mantido no 404/footer.
**Trade-off:** Quebra a regra "não renderize o nome da marca como vetor/texto, é sempre wordmark ASCII block-pixel" do AD-006/DESIGN.md — a marca agora é texto monospace com brackets, preservando a identidade de terminal sem o custo do bloco.
**Impact:** Atualiza `app.html`/`app.scss` (brand link) e `NavComponent` (nav-top sem borda própria, alinhada no header); app.spec.ts passa a verificar `.brand`; atualizar DESIGN.md (Seção "Profundidade Decorativa" e Don'ts) e AGENTS.md se referenciarem o wordmark.

---

## Active Blockers

Nenhum.

---

## Lessons Learned

- **Angular lint + unused imports in specs**: importing a store/class in a spec file for `TestBed` DI doesn't count as "usage" for `@typescript-eslint/no-unused-vars`. If the class is only used via DI (not referenced directly in test code), don't import it — the mock/provider pattern handles it without the import.

- **Vitest + jsdom**: `vitest.config.ts` com `environment: 'jsdom'` fornece `localStorage` nativamente — não precisa de polyfill manual nem `test-setup.ts`. Arquivos de setup em `src/` são incluídos pelo `tsconfig.app.json` e quebram o build se importarem de pacotes sem tipos.
- **Angular lint + buttons**: Elementos `<span>` com `(click)` violam `@angular-eslint/template/click-events-have-key-events`. Usar `<button type="button">` com reset de estilo resolve sem perder acessibilidade.
- **Labels + form controls**: `@angular-eslint/template/label-has-associated-control` exige `for`/`id` em pares label→input. Reactive Forms não automata isso.
- **Angular effect() return type**: O compilador TypeScript do Angular exige que `effect()` retorne value em todos os code paths — mesmo o branch `else` que não tem cleanup. Usar `return undefined` no branch sem cleanup resolve o TS7030.
- **Vitest globals**: `vitest.config.ts` precisa de `globals: true` para `describe`/`it`/`expect` funcionarem sem import explícito.
- **Node.js 22+ + localStorage**: Em Node 22+, `localStorage` não está disponível por padrão nos testes (precisa de `--localstorage-file`). Testes M1/M2 que chamam `localStorage.clear()` falham nesse ambiente — não é regressão da M3.
- **Angular `preserveWhitespaces` default = false**: o compilador colapsa quebras de linha em nós de texto do template. ASCII art (wordmark) com `white-space: pre` vira UMA linha de 306 chars → 1836px → scroll lateral. Fix: `preserveWhitespaces: true` no decorator do componente + `font-size: clamp(7px, 2.3vw, 10px)` e `overflow-x: clip` no header como rede de segurança.
- **Reset global `margin: 0` quebra centragem de `<dialog>`**: o `<dialog>` nativo centraliza via `margin: auto` do user-agent; o reset `* { margin: 0 }` (styles.scss) anula isso e o modal abre no canto (0,0). Fix: `.dialog-confirm { position: fixed; inset: 0; margin: auto; }`.
- **Tokens de design são styles scoped, não globais**: os tokens do DESIGN (`button-primary`, `button-secondary`, `select`, `heading-md`, `body-md`, etc.) são re-definidos como styles scoped em cada componente — NÃO existem em `styles.scss`. Página que usa `class="button-primary"` sem definir o estilo no próprio componente renderiza controle nativo do browser (link azul, dropdown Arial 13px, h1 32px). Achei isso em `ExtractPage` e `LogsPage` (M3/M4). Ao usar token no template, verificar que o componente define o CSS correspondente.
- **`<button>` não herda `font-family` — texto de botão cai para Arial**: regras `button-*` que omitem `font-family: var(--font-family)` renderizam o rótulo em Arial (viola AD-006 100% monospace). Diferente de `<a>`, que herda. Fix aplicado a `button-primary`/`button-secondary`/`button-danger` em beans/brew-timer/logs/log-form/log-detail/extract. Ao criar estilo de botão, SEMPRE incluir `font-family`.

---

## Quick Tasks Completed

| #   | Description              | Date       | Commit | Status  |
| --- | ------------------------ | ---------- | ------ | ------- |
| 001 | Fix layout: wordmark ASCII com scroll lateral + dialogs fora do centro | 2026-08-06 | fedd418 | Done |
| 002 | Fix extract: atalho "Salvar no histórico" sem estilo (token `button-secondary` não definido no componente) | 2026-08-06 | 7dcd704 | Done |
| 003 | Fix logs: botões e dropdowns do histórico sem estilo (tokens `button-primary`/`button-secondary`/`select`/`heading-md`/`body-md` não definidos no componente) | 2026-08-06 | 8957706 | Done |
| 004 | Varredura de tokens scoped ausentes: bean-form/extract (heading), log-form (form inteira nativa), log-detail (botões/headings nativos) + `font-family` faltando em todos os `button-*` (texto em Arial) + `--font-button-md-family` indefinido | 2026-08-06 | f171578 | Done |

---

## Deferred Ideas

- [ ] Gráficos de evolução sensorial por grão/método — Capturado durante: init do projeto
- [ ] Migração LocalStorage → API/Firebase — Capturado durante: init do projeto
- [ ] Export de logs (CSV/JSON) — Capturado durante: init do projeto

---

## Todos

- [x] Especificar feature: App Shell + Infra (M1) — spec.md + context.md criados
- [x] Definir stack concreta (Angular CLI 21, Vitest, angular-eslint 21) — AD-008
- [x] Design feature: App Shell + Infra (M1) — design.md aprovado
- [x] Especificar feature: Bean Inventory (M2) — spec.md + context.md criados
- [x] Especificar feature: Extraction Panel (M3) — spec.md + context.md criados
- [x] Definir design system (AD-006) — DESIGN.md reescrito como referência de UI
- [x] Especificar feature: Brew Logs (M4) — spec.md + context.md criados
- [x] Design feature: Bean Inventory (M2) — design.md aprovado (AD-010)
- [x] Criar tasks da M2 (Bean Inventory) — tasks.md aprovado (11 tasks)
- [x] Design feature: Extraction Panel (M3) — design.md aprovado (AD-011)
- [x] Criar tasks da M3 (Extraction Panel) — tasks.md aprovado (9 tasks)
- [x] Design feature: Brew Logs (M4) — design.md aprovado
- [x] Criar tasks da M4 (Brew Logs) — tasks.md aprovado (11 tasks)
- [x] Executar feature: App Shell + Infra (M1) — 10 tasks concluídas
- [x] Executar feature: Bean Inventory (M2) — 11 tasks concluídas
- [x] Executar feature: Extraction Panel (M3) — 9 tasks concluídas
- [x] Executar feature: Brew Logs (M4) — 11 tasks concluídas
- [x] Especificar feature: V1 Hardening (M5) — spec.md + context.md criados
- [x] Criar tasks da M5 (V1 Hardening) — tasks.md criado (7 tasks)
- [x] Executar feature: V1 Hardening (M5) — 7 tasks concluídas
- [x] Especificar feature: Guias de Extração (M6) — spec.md + context.md criados (AD-012)
- [x] Design feature: Guias de Extração (M6) — design.md aprovado (AD-013)
- [x] Criar tasks da M6 (Guias de Extração) — tasks.md aprovado (13 tasks)
- [x] Executar feature: Guias de Extração (M6) — 13 tasks concluídas

---

## Preferences

**Model Guidance Shown:** never
