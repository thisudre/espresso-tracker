# Internacionalização (i18n) — Specification

**Milestone:** M7 (pós-v1)
**Status:** Specified

## Problem Statement

Todo o texto do app é PT-BR hardcoded em templates e em labels de domínio (métodos, fases, degass, ratings) e no conteúdo estático dos guias. Para alcançar falantes de inglês sem duplicar código, todas as strings precisam sair do código e ir para um mecanismo de tradução reativo, com troca instantânea de idioma e preferência persistida.

## Goals

- [ ] App utilizável em Inglês com cobertura total de strings (UI, labels de domínio e conteúdo dos guias) — medido por app navegado de ponta a ponta em EN sem texto PT-BR restante.
- [ ] Troca PT-BR ↔ EN instantânea, sem reload, preservando estado — medido por troca durante timer/forms rodando sem perda de estado.
- [ ] Preferência de idioma persistida — medido por idioma restaurado após recarregar/voltar ao app.
- [ ] Datas localizadas conforme o idioma ativo — medido por log-detail exibindo `dd/MM/yyyy HH:mm` em PT-BR e `MM/dd/yyyy h:mm a` em EN.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Idiomas além de PT-BR e EN | Decisão GA-1; mecanismo extensível mas só 2 idiomas na v1 |
| Tradução de conteúdo do usuário (marcas, notas, observações) | É dado digitado pelo usuário, não texto do app (GA-6) |
| Detecção automática de idioma do navegador | Descartada na discussão (GA-1); sempre PT-BR no primeiro acesso |
| Página de configurações | Seletor é atalho no header/dashboard (GA-2) |
| Tradução dos processos (Washed/Natural/Honey/Outro) | Vocabulário de café já internacional (GA-4) |
| rtl/layout bidirecional | Não se aplica a PT-BR/EN |

---

## User Stories

### P1: Cobertura total de strings em Inglês ⭐ MVP

**User Story**: Como falante de inglês, quero usar o app inteiro em Inglês, para navegar, cadastrar grãos, extrair e registrar logs sem texto em português.

**Why P1**: É o núcleo da feature — sem cobertura total não há internacionalização.

**Acceptance Criteria**:

1. WHEN o idioma ativo é EN THEN o sistema SHALL exibir todas as strings de UI (nav, headers, botões, labels, placeholders, empty states, mensagens de erro) em Inglês.
2. WHEN o idioma ativo é EN THEN o sistema SHALL exibir labels de domínio derivados em Inglês: métodos (Coado/V60 → V60/Pourover), fases do timer (Pré-infusão → Pre-infusion, Extração → Extraction), badges de degass (Muito fresco → Very fresh, No ideal → In the sweet spot, Passou do ideal → Past its peak), rating labels (Acidez → Acidity, Corpo → Body, Doçura → Sweetness, Nota Geral → Overall).
3. WHEN o idioma ativo é EN THEN o sistema SHALL exibir o conteúdo dos guias V60 em Inglês (nome, foco, moagem, descrições de fase) sem perder volumes/tempos.
4. WHEN o idioma ativo é PT-BR THEN o sistema SHALL exibir todas as strings como hoje, sem regressão.

**Independent Test**: Trocar para EN e percorrer `/`, `/beans`, `/extract`, `/guides`, `/logs` verificando nenhum texto PT-BR visível (exceto dados do usuário); voltar a PT-BR e ver o app original.

---

### P1: Troca instantânea de idioma ⭐ MVP

**User Story**: Como usuário, quero trocar PT-BR ↔ EN sem recarregar, para alternar o idioma no meio de uma sessão sem perder o que estou fazendo.

**Why P1**: Troca instantânea é o comportamento central decidido (GA-3), coerente com a arquitetura Signals.

**Acceptance Criteria**:

1. WHEN o usuário toca no atalho "PT/EN" THEN o sistema SHALL trocar o idioma ativo imediatamente, sem reload.
2. WHEN o timer está rodando OU um form tem dados preenchidos durante a troca THEN o sistema SHALL preservar o estado (tempo, fases, valores preenchidos).
3. WHEN o idioma troca THEN todos os componentes visíveis SHALL atualizar suas strings reativamente (via Signals/computed), sem navegação forçada.
4. WHEN um texto usa interpolação (ex.: "Muito fresco (2d)", "Meta 0:30") THEN o sistema SHALL exibir o número/valor no contexto do novo idioma.

**Independent Test**: Com o timer rodando em `/extract` e dose preenchida, trocar PT→EN e ver fases/labels em EN com timer continuando e dose preservada.

---

### P1: Seletor de idioma acessível ⭐ MVP

**User Story**: Como usuário, quero um controle óbvio para trocar de idioma no desktop e no mobile, para descobrir a funcionalidade sem procurar.

**Why P1**: Define onde o usuário troca o idioma (GA-2) — acessibilidade sem novo fluxo de config.

**Acceptance Criteria**:

1. WHEN a viewport é desktop (≥768px) THEN o sistema SHALL exibir o atalho "PT/EN" no header global.
2. WHEN a viewport é mobile (≤480px) THEN o sistema SHALL exibir o atalho "PT/EN" no rodapé da dashboard.
3. WHEN o atalho é um botão THEN o sistema SHALL exibir o idioma de destino (PT ao ativo for EN; EN ao ativo for PT) e ser acionável por teclado (foco + Enter/Espaço).
4. WHEN o idioma ativo muda THEN o rótulo do atalho SHALL atualizar para refletir o idioma de destino.

**Independent Test**: Desktop — atalho no header troca idioma; mobile ≤480px — atalho no rodapé da dashboard troca idioma; ambos focáveis por teclado.

---

### P1: Preferência de idioma persistida ⭐ MVP

**User Story**: Como usuário, quero que o app lembre meu idioma entre sessões, para não redefinir toda vez.

**Why P1**: Sem persistência a troca é descartada ao sair — preferência padrão do AD-013.

**Acceptance Criteria**:

1. WHEN o usuário troca o idioma THEN o sistema SHALL persistir a preferência via StorageService (envelope versionado).
2. WHEN o app carrega com preferência válida THEN o sistema SHALL restaurar o idioma salvo.
3. WHEN a preferência está corrompida/versão incompatível THEN o sistema SHALL abrir em PT-BR sem crash (StorageService retorna `null`).
4. WHEN o primeiro acesso não tem preferência THEN o sistema SHALL abrir em PT-BR.

**Independent Test**: Trocar para EN, recarregar a página e ver o app em EN; corromper a chave no LocalStorage e ver PT-BR sem erro.

---

### P2: Datas localizadas

**User Story**: Como usuário, quero que datas sigam a convenção do idioma ativo, para ler o histórico de forma natural.

**Why P2**: Consistência cultural; decidido em GA-5. Não bloqueia a v1 de i18n, mas é esperado com EN.

**Acceptance Criteria**:

1. WHEN o idioma ativo é PT-BR THEN o sistema SHALL formatar datas como `dd/MM/yyyy HH:mm`.
2. WHEN o idioma ativo é EN THEN o sistema SHALL formatar datas como `MM/dd/yyyy h:mm a` (locale en-US).
3. WHEN um log criado em um idioma é visto no outro THEN o sistema SHALL re-formatar a data conforme o idioma ativo (labels derivados traduzem ao vivo, GA-6).

**Independent Test**: No `/logs/:id`, trocar PT↔EN e ver a data mudar de `06/08/2026 14:30` para `08/06/2026 2:30 PM`.

---

## Edge Cases

- WHEN a preferência de idioma está corrompida no LocalStorage THEN o sistema SHALL abrir em PT-BR sem crash (StorageService retorna `null`).
- WHEN o atalho de idioma é pressionado rapidamente em sequência THEN o sistema SHALL alternar de forma estável (último estado vence, sem glitch).
- WHEN um texto interpola número/valor (badge degass, meta de tempo, contagem de grãos) THEN o formato numérico SHALL acompanhar o idioma sem quebrar a unidade (g, mm:ss).
- WHEN o timer está em modo receita com fases traduzidas THEN o `BrewState.phaseLabel` exposto para logs SHALL usar o label do idioma ativo.
- WHEN o conteúdo do guia traduzido referencia números (volumes/tempos) THEN apenas o texto descritivo traduz; números permanecem os dados do modelo.
- WHEN a viewport é móvel (≤480px) THEN o atalho de idioma no rodapé da dashboard SHALL ser tocável sem conflito com a bottom-nav.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| I18N-01 | P1: Cobertura total — UI | Specified | Pending |
| I18N-02 | P1: Cobertura total — labels de domínio | Specified | Pending |
| I18N-03 | P1: Cobertura total — conteúdo dos guias | Specified | Pending |
| I18N-04 | P1: Cobertura total — PT-BR sem regressão | Specified | Pending |
| I18N-05 | P1: Troca instantânea — sem reload | Specified | Pending |
| I18N-06 | P1: Troca instantânea — estado preservado | Specified | Pending |
| I18N-07 | P1: Troca instantânea — atualização reativa | Specified | Pending |
| I18N-08 | P1: Troca instantânea — interpolação | Specified | Pending |
| I18N-09 | P1: Seletor — header desktop | Specified | Pending |
| I18N-10 | P1: Seletor — rodapé dashboard mobile | Specified | Pending |
| I18N-11 | P1: Seletor — acessível por teclado | Specified | Pending |
| I18N-12 | P1: Seletor — rótulo reflete destino | Specified | Pending |
| I18N-13 | P1: Preferência — persistir | Specified | Pending |
| I18N-14 | P1: Preferência — restaurar | Specified | Pending |
| I18N-15 | P1: Preferência — corrupta → PT-BR | Specified | Pending |
| I18N-16 | P1: Preferência — primeiro acesso PT-BR | Specified | Pending |
| I18N-17 | P2: Datas — formato PT-BR | Specified | Pending |
| I18N-18 | P2: Datas — formato EN | Specified | Pending |
| I18N-19 | P2: Datas — re-formatação ao vivo | Specified | Pending |

**Coverage:** 19 total, 0 mapped to tasks, 19 unmapped ⚠️

---

## Success Criteria

- [ ] App completo navegado em EN (`, /beans, /extract, /guides, /logs`) sem texto PT-BR de UI visível.
- [ ] Troca PT-BR ↔ EN instantânea com estado preservado (timer rodando, forms preenchidos).
- [ ] Preferência sobrevive ao reload e corrupção cai para PT-BR sem erro.
- [ ] Datas localizadas por idioma no log-detail.
- [ ] 100% dos requisitos I18N-01..19 mapeados e verificados.
- [ ] Suíte de testes unitários (mecanismo de tradução, preferência, labels dinâmicos) verde.
- [ ] Atalho utilizável em viewport móvel (≤480px) sem conflito com a bottom-nav.
