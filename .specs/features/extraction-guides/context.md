# Guias de Extração — Context

**Gathered:** 2026-08-06
**Spec:** `.specs/features/extraction-guides/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Guias de extração: usuário seleciona um método e recebe um guia passo a passo em fases (bloom, vertida, finalização) com volume de água e tempo por etapa. Duas superfícies: **biblioteca** (rota `/guides`, consulta passiva) e **integração com o painel `/extract`** (a receita dirige o cronômetro). Conteúdo v1: 3 receitas de Coado/V60 (Equilibrada, Intensa, Suave) embutidas no app, base 20g/300g. Constrói sobre a M1/M3 (rotas, ExtractionStore, timer, StorageService).

---

## Implementation Decisions

### D-GUIDE-01: Onde o guia vive

- **Dois lugares**: biblioteca de guias em rota própria (`/guides`, consulta passiva) + integração com o painel `/extract` (a receita dirige o cronômetro).
- Acesso à biblioteca via **atalho dentro do painel** — sem nova aba na navegação principal (bottom nav mobile / nav top desktop permanecem as 4: Painel, Beans, Logs, Dashboard).

### D-GUIDE-02: Escopo de métodos

- **Só Coado/V60** com as 3 receitas nesta milestone. O modelo de dados aceita mais métodos no futuro.
- **Chemex não é método do app** — os métodos existentes são espresso, v60, prensa, aeropress (contrato M3). Não adicionar Chemex nesta v1.

### D-GUIDE-03: Volumes seguem o total de água sugerida

- Os volumes das fases são **porcentagens** dos volumes acumulados da receita sobre o **total de água sugerida** (dose × ratio). A última fase sempre iguala o total sugerido — o guia e a calculadora do painel ficam consistentes.
- A receita base define a razão implícita (300g/20g = 1:15); o **preset V60 1:16 do painel permanece intocado** e as fases se ajustam ao total resultante.

### D-GUIDE-04: Semântica de volume

- `volumeAgua` = **total acumulado** de água ao fim da fase (40 → 160 → 300), como dizem as receitas ("adicionar até X").
- **Sempre presente** — fase sem vertida (ex.: decantação) repete o total acumulado da fase anterior.

### D-GUIDE-05: Semântica de tempo

- `tempoObjetivo` = **tempo decorrido cumulativo** ao fim da fase (30s → 1m15s → 2m30s), batendo com "aguardar até X" e "tempo total esperado".

### D-GUIDE-06: Escala pelo total de água

- Volumes escalam como **porcentagens do total de água sugerida** (`round(volumeAcumulado × totalSugerido / totalBase)`), mantendo as proporções da receita. **Tempos sempre fixos** (não escalam).

### D-GUIDE-07: Origem do total de água

- **Painel `/extract`**: usa dose e ratio do `ExtractionStore` (M3) — total = dose × ratio (readout "Água sugerida").
- **Biblioteca `/guides`**: campos de dose e ratio próprios, default **20g / 1:15** (base das receitas).

### D-GUIDE-08: Receita dirige o cronômetro + modo simples

- Selecionar receita no painel (V60) configura o cronômetro com **as fases da receita** como suas fases (número variável: 3 ou 4).
- **Avanço automático** ao atingir a meta de tempo **+ avanço manual** (1 toque).
- **Modo simples** (2 fases pré-infusão/extração da M3) acessível a qualquer momento, como saída do modo receita.

### D-GUIDE-09: Biblioteca passiva

- A rota `/guides` é **consulta passiva** — lista de fases com volumes escalados e tempos, **sem cronômetro embutido**.

### D-GUIDE-10: Conteúdo estático

- As receitas são **conteúdo estático embutido no app** (constantes), como os presets de método — sem edição pelo usuário na v1.

### D-GUIDE-11: Preferência de receita

- O painel abre **sem receita** (modo simples) por padrão.
- Ao selecionar uma receita, o id é **persistido como preferência** (StorageService) — o painel restaura a receita nas próximas visitas.
- **"Modo simples" limpa a preferência** (opt-out explícito).
- **Troca de método** para um sem receitas desativa a receita **só na sessão** (timer 2 fases) mas **preserva a preferência** do V60 — voltar ao V60 restaura.
- Preferência corrompida/incompatível/inexistente → abre sem receita, sem erro.

### D-GUIDE-12: Metadados da receita

- Cada receita carrega **nome, foco, dica de moagem e tempo total estimado**, exibidos nos cards do seletor/biblioteca e no guia.

---

## Agent's Discretion

- Visual do guia passo a passo (layout da lista de fases, indicação de fase atual/concluída, estado "concluída").
- Nome/estilo do atalho "Guias" no painel `/extract`.
- Exibição exata de tempo no modo receita (tempo decorrido cumulativo + meta; formato do readout que reusa tokens do DESIGN).
- Contrato do estado de receita no store (id, fases ativas, índice da fase atual, meta, running) e como ele estende o `TimerState` da M3 sem quebrar o `BrewState` da M4.
- Estrutura exata das constantes das receitas (arquivo/formato).
- Ordem e disposição do seletor de receita dentro do painel (abaixo dos chips de método).

---

## Specific References

- Receitas de V60 fornecidas pelo usuário (base 20g/300g): **Equilibrada** (40/30s → 160/1m15s → 300/final, ~2m30s), **Intensa** (50/40s → 300/1m30s → decantação, ~2m05s), **Suave** (40/30s → 150/1m → 225/1m30s → 300/3m, ~3m). Registradas na tabela de conteúdo do spec.

---

## Deferred Ideas

- [ ] Receitas editáveis pelo usuário (CRUD próprio) — conteúdo estático na v1 (D-GUIDE-10).
- [ ] Receitas para outros métodos (espresso, prensa, aeropress) e método Chemex — modelo extensível, conteúdo v1 só V60.
- [ ] Cronômetro embutido na biblioteca `/guides` — consulta passiva na v1 (D-GUIDE-09).
- [ ] Feedback sonoro/háptico ao fim de fase — fora do escopo v1.
- [ ] Estatísticas de resultados por receita (cruzamento com Brew Logs) — requer agregação por receita no log.
- [ ] Compartilhamento de receitas.
