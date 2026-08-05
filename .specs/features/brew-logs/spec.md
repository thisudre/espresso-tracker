# Brew Logs Specification

## Problem Statement

O usuário extrai e avalia cafés, mas não registra o que funcionou: sem histórico, cada preparo recomeça do zero e não há como identificar os parâmetros ideais por grão e método. A M4 entrega o registro de xícaras (brew logs): salvar a receita (método, dose, água, ratio, moagem, tempo), avaliar sensorialmente (Acidez, Corpo, Doçura, Nota Geral) com estrelas, anotar observações e consultar o histórico com filtros e tela de detalhe — consumindo o estado final exposto pela M3 e construído sobre a infra da M1/M2.

## Goals

- [ ] Usuário salva uma xícara como log com receita e avaliação sensorial, sem refazer cálculos — medido por logs criados via atalho do painel M3 (pré-preenchido) e via formulário manual.
- [ ] Usuário consulta o histórico por grão e método para comparar resultados — medido por listagem com filtros e tela de detalhe funcionais.
- [ ] Logs são editáveis e excluíveis com controle — medido por edição via detalhe e exclusão com confirmação.

## Out of Scope

| Feature                                      | Reason                                             |
| -------------------------------------------- | -------------------------------------------------- |
| Gráficos de evolução sensorial               | Ideia diferida (STATE.md); requer agregação extra  |
| Export de logs (CSV/JSON)                    | Fora do escopo v1 (PROJECT.md)                     |
| Nota Geral calculada (média automática)      | Decisão D-LOG-03: Nota Geral manual                |
| Pré-infusão separada no log                  | Decisão D-LOG-06: só tempo total                   |
| Agrupamento do histórico por grão (abas)     | Decisão D-LOG-04: lista com filtros                |
| Filtro por período/data                      | Não listado no escopo v1                           |
| Várias xícaras de um mesmo brew              | Não listado no escopo v1                           |
| Atalho "salvar" com dados salvos na M3       | Decisão D-EXTR-05: nada persistido na M3           |

---

## User Stories

### P1: Atalho do Painel de Extração (M3 → M4) ⭐ MVP

**User Story**: Como usuário na bancada, quero mandar o brew que acabei de extrair para o histórico com um toque, para não digitar dose, água e tempo de novo.

**Why P1**: É a ponte direta entre o painel (M3) e o registro (M4) — o caminho mais natural e o motivo do estado final exposto da M3.

**Acceptance Criteria**:

1. WHEN o painel de extração (`/extract`) está em uso THEN o sistema SHALL exibir um atalho "Salvar no histórico".
2. WHEN o usuário toca no atalho THEN o sistema SHALL navegar para `/logs` abrindo o formulário de novo log pré-preenchido com método, dose, ratio, água sugerida e tempo total atuais do painel.
3. WHEN o atalho é tocado com dose vazia THEN o sistema SHALL pré-preencher apenas os campos disponíveis (método, ratio, tempo), deixando dose e água vazias, sem quebrar.
4. WHEN o formulário pré-preenchido é salvo THEN o sistema SHALL persistir o log com os valores herdados do painel.

**Independent Test**: No painel, escolher método, digitar dose, cronometrar e tocar "Salvar no histórico" → formulário em `/logs` chega preenchido; salvar → aparece na lista.

---

### P1: Formulário de Novo Log ⭐ MVP

**User Story**: Como usuário, quero criar um log de xícara manualmente ou completar um pré-preenchido, para registrar receita e avaliação sem depender do painel.

**Why P1**: É o núcleo da M4 — todo log nasce aqui, seja manual (sem painel) ou herdado do atalho.

**Acceptance Criteria**:

1. WHEN o usuário acessa `/logs` THEN o sistema SHALL permitir criar um novo log a partir de um formulário vazio.
2. WHEN o formulário está aberto THEN o sistema SHALL exigir o método como único campo obrigatório, via select dos 4 métodos (Espresso, Prensa Francesa, Coado/V60, Aeropress).
3. WHEN o usuário digita dose (g) e água (g) maiores que zero THEN o sistema SHALL exibir o ratio resultante (água ÷ dose) como valor derivado.
4. WHEN dose ou água é vazia, zero ou inválida THEN o sistema SHALL não exibir ratio, sem quebrar o formulário.
5. WHEN o usuário digita a moagem THEN o sistema SHALL sugerir valores já usados em logs anteriores (autocomplete).
6. WHEN o usuário seleciona um grão THEN o sistema SHALL permitir escolher entre os grãos cadastrados em `/beans`; o vínculo é opcional.
7. WHEN o usuário preenche a avaliação THEN o sistema SHALL aceitar de 1 a 5 estrelas para cada atributo (Acidez, Corpo, Doçura) e Nota Geral, todos opcionais (0 = não avaliado).
8. WHEN o usuário escreve observações THEN o sistema SHALL aceitar texto livre, opcional.
9. WHEN o usuário tenta salvar sem método THEN o sistema SHALL bloquear o envio com mensagem de validação.
10. WHEN o usuário salva o log THEN o sistema SHALL persistir com data de criação automática e exibi-lo na lista.
11. WHEN o usuário registra o tempo total THEN o sistema SHALL aceitar o formato mm:ss (herdado do painel ou digitado manualmente).

**Independent Test**: Criar log manual com método, dose 16g, água 256g → ratio 1:16 exibido; salvar sem método → bloqueado; salvar completo → aparece no topo da lista.

---

### P1: Histórico com Filtros ⭐ MVP

**User Story**: Como usuário, quero ver o histórico de xícaras em lista e filtrar por grão e método, para comparar resultados de receitas sem varredura manual.

**Why P1**: É o valor consultável da M4 (PROJECT.md goal 3) — sem isso o log não ajuda a evoluir.

**Acceptance Criteria**:

1. WHEN o usuário acessa `/logs` THEN o sistema SHALL listar os logs em cards ordenados por data de criação, mais recente primeiro.
2. WHEN o usuário aplica o filtro por grão THEN o sistema SHALL exibir apenas os logs vinculados ao grão selecionado.
3. WHEN o usuário aplica o filtro por método THEN o sistema SHALL exibir apenas os logs do método selecionado.
4. WHEN não há logs THEN o sistema SHALL exibir estado vazio com chamada para criar o primeiro log.
5. WHEN um filtro resulta em lista vazia THEN o sistema SHALL exibir estado vazio indicando o filtro ativo e opção de limpar.
6. WHEN o usuário toca em um log THEN o sistema SHALL abrir a tela de detalhe do log.

**Independent Test**: Criar 3 logs com grãos/métodos diferentes → filtrar por um grão e depois por um método → listas correspondentes; limpar filtro → lista completa.

---

### P2: Detalhe, Edição e Exclusão

**User Story**: Como usuário, quero abrir um log para ver tudo e poder editá-lo ou excluí-lo, para corrigir avaliações e manter o histórico relevante.

**Why P2**: Não é o caminho principal de uso, mas sem edição/exclusão o histórico acumula erros e logs sem sentido.

**Acceptance Criteria**:

1. WHEN o detalhe de um log abre THEN o sistema SHALL exibir receita, avaliação, observações e data de criação.
2. WHEN o usuário edita um log no detalhe THEN o sistema SHALL permitir alterar qualquer campo e salvar as alterações.
3. WHEN o usuário exclui um log THEN o sistema SHALL pedir confirmação e, confirmada, remover permanentemente.
4. WHEN um log referencia um grão THEN o sistema SHALL exibir o nome do grão no card e no detalhe, mesmo que o grão tenha sido excluído depois.

**Independent Test**: Abrir log → editar avaliação e salvar → lista reflete; excluir com confirmação → some do histórico; excluir o grão vinculado → nome permanece no log.

---

## Edge Cases

- WHEN o grão vinculado é excluído do inventário THEN o log SHALL manter o nome do grão persistido (snapshot) e não quebrar.
- WHEN a dose é 0 ou vazia THEN o ratio SHALL não ser exibido.
- WHEN o tempo total é 0 ou vazio THEN o log SHALL exibir "—" no lugar do tempo.
- WHEN todas as avaliações estão em 0 THEN o log SHALL exibir "Sem avaliação" no card/detalhe.
- WHEN o atalho do painel é tocado sem nenhum dado THEN o log SHALL salvar apenas método e campos herdados disponíveis, sem erro.
- WHEN um filtro ativo não retorna resultados THEN o sistema SHALL mostrar estado vazio com o filtro identificado e ação de limpar.
- WHEN a viewport é móvel (≤ 480px) THEN a lista, o formulário e o detalhe SHALL ser utilizáveis sem scroll horizontal.

---

## Dependencies

| Milestone | Dependency                                                        |
| --------- | ----------------------------------------------------------------- |
| M1        | StorageService (persistência), stores com Signals, shell/rota /logs |
| M2        | Lista de grãos cadastrados para o seletor de grão (vínculo opcional) |
| M3        | Estado final do brew exposto (método, dose, ratio, água, tempo) + atalho "Salvar no histórico" na UI do painel |

---

## Requirement Traceability

| Requirement ID | Story                          | Phase  | Status  |
| -------------- | ------------------------------ | ------ | ------- |
| LOG-01         | P1: Atalho do Painel           | Design | Pending |
| LOG-02         | P1: Atalho do Painel           | Design | Pending |
| LOG-03         | P1: Atalho do Painel           | Design | Pending |
| LOG-04         | P1: Atalho do Painel           | Design | Pending |
| LOG-05         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-06         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-07         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-08         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-09         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-10         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-11         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-12         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-13         | P1: Formulário de Novo Log     | Design | Pending |
| LOG-14         | P1: Histórico com Filtros       | Design | Pending |
| LOG-15         | P1: Histórico com Filtros       | Design | Pending |
| LOG-16         | P1: Histórico com Filtros       | Design | Pending |
| LOG-17         | P1: Histórico com Filtros       | Design | Pending |
| LOG-18         | P1: Histórico com Filtros       | Design | Pending |
| LOG-19         | P2: Detalhe, Edição, Exclusão   | Design | Pending |
| LOG-20         | P2: Detalhe, Edição, Exclusão   | Design | Pending |
| LOG-21         | P2: Detalhe, Edição, Exclusão   | Design | Pending |
| LOG-22         | P2: Detalhe, Edição, Exclusão   | Design | Pending |
| LOG-23         | P2: Detalhe, Edição, Exclusão   | Design | Pending |
| LOG-24         | P2: Detalhe, Edição, Exclusão   | Design | Pending |
| LOG-25         | P2: Detalhe, Edição, Exclusão   | Design | Pending |

**Coverage:** 25 total, 0 mapped to tasks, 25 unmapped ⚠️

---

## Success Criteria

- [ ] Fluxo completo demo-ável: extrair no painel, tocar "Salvar no histórico", completar avaliação, salvar, filtrar por grão/método e abrir o detalhe.
- [ ] Log criado manualmente sem painel também é demo-ável (formulário independente).
- [ ] 100% dos requisitos LOG-01..22 mapeados e verificados.
- [ ] Suíte de testes unitários dos services (persistência do log + cálculo de ratio derivado) verde.
- [ ] Tela utilizável em viewport móvel (≤ 480px) sem scroll horizontal.
