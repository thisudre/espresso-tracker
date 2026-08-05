# Bean Inventory Specification

## Problem Statement

O usuário compra grãos especiais, mas não acompanha quantos pacotes tem, quando cada um foi torrado nem se estão no momento ideal de uso. Sem rastreabilidade do inventário, o café é usado fora da degass window ideal e não há base para avaliar o que funcionou na xícara. A M2 entrega o CRUD de grãos com status do pacote e um indicador visual de dias desde a torra, construído sobre a infra da M1 (storage, signals, shell).

## Goals

- [ ] Usuário cadastra e edita grãos com os campos do domínio (Marca, Origem, Variedade, Processo, Data de Torra, Notas Sensoriais) — medido por cadastro/edição persistente após reload.
- [ ] Usuário vê de imediato, na lista, se cada pacote está na degass window ideal (3-14 dias pós-torra) — medido por badge correto nos 3 estados e na ausência de data de torra.
- [ ] Usuário gerencia o estado do pacote (Aberto/Fechado/Finalizado) sem entrar na edição — medido por troca de status em um toque com persistência.

## Out of Scope

| Feature                                        | Reason                                                  |
| ---------------------------------------------- | ------------------------------------------------------- |
| Vínculo com Brew Logs (M4)                     | Feature M4 especificada em separado                     |
| Histórico de uso por pacote                    | Não listado no escopo M2                                |
| Import/export de grãos (CSV/JSON)              | Fora do escopo v1 (PROJECT.md)                          |
| Gráficos de evolução sensorial por grão        | Deferred Ideas                                          |
| Foto do pacote / upload de imagem              | Não listado no escopo v1                                |
| Processo "Outro" com texto customizado         | Decisão D4: "Outro" é opção fixa; extensão fica para depois |

---

## User Stories

### P1: Registro e Edição de Grãos ⭐ MVP

**User Story**: Como entusiasta de café, quero cadastrar e editar meus grãos com Marca, Origem, Variedade, Processo, Data de Torra e Notas Sensoriais, para manter meu inventário atualizado e persistente.

**Why P1**: É o núcleo do inventário; nada mais (status, degass, exclusão) existe sem o cadastro.

**Acceptance Criteria**:

1. WHEN o usuário salva um novo grão com Marca preenchida THEN o sistema SHALL persistir o grão e exibi-lo na listagem.
2. WHEN Marca está vazia THEN o sistema SHALL bloquear o salvamento com mensagem de validação.
3. WHEN o usuário edita um grão existente THEN todos os campos SHALL ser editáveis e as alterações SHALL ser persistidas.
4. WHEN o usuário digita em Origem ou Variedade THEN o sistema SHALL sugerir valores já usados em outros grãos (autocomplete).
5. WHEN o usuário escolhe Processo THEN as opções SHALL ser Washed, Natural, Honey e Outro.
6. WHEN o usuário informa Data de Torra THEN o sistema SHALL armazenar a data e usá-la no indicador de degass.
7. WHEN a página é recarregada THEN os grãos previamente salvos SHALL continuar listados.

**Independent Test**: Cadastrar um grão via UI, recarregar a página, verificar persistência; tentar salvar sem Marca e ver bloqueio; editar um campo e verificar a mudança.

---

### P1: Listagem com Indicador de Degass ⭐ MVP

**User Story**: Como usuário na bancada, quero ver em um olhar se cada pacote está no ponto ideal de consumo (degass window), para escolher o grão certo sem cálculo mental.

**Why P1**: É o valor central da M2 (PROJECT.md goal 1) — saber visualmente o estado de cada pacote.

**Acceptance Criteria**:

1. WHEN a listagem renderiza THEN os grãos SHALL aparecer como cards ordenados por data de criação, mais recentes primeiro.
2. WHEN um grão possui Data de Torra THEN o card SHALL exibir um badge com o estado da degass window e os dias desde a torra.
3. WHEN os dias desde a torra são menores que 3 THEN o badge SHALL indicar estado "Muito fresco (Xd)" com cor de estado.
4. WHEN os dias desde a torra estão entre 3 e 14 (inclusive) THEN o badge SHALL indicar estado "No ideal (Xd)" com cor de destaque.
5. WHEN os dias desde a torra são maiores que 14 THEN o badge SHALL indicar estado "Passou do ideal (Xd)" com cor de alerta.
6. WHEN um grão não possui Data de Torra THEN o badge de degass SHALL não ser renderizado.
7. WHEN não existem grãos cadastrados THEN a listagem SHALL exibir estado vazio ("nenhum grão registrado").

**Independent Test**: Cadastrar 3 grãos (sem torra, torra de ontem, torra de 20 dias) e verificar a presença/ausência e o estado do badge em cada card.

---

### P1: Gestão de Status do Pacote ⭐ MVP

**User Story**: Como usuário, quero mudar o status do pacote (Aberto, Fechado, Finalizado) em um toque direto na lista, para refletir o uso real do pacote sem abrir formulários.

**Why P1**: Status do pacote é requisito explícito do escopo v1.

**Acceptance Criteria**:

1. WHEN o usuário toca no status de um card THEN o sistema SHALL abrir um seletor com as opções Aberto, Fechado e Finalizado.
2. WHEN o usuário escolhe um status THEN o sistema SHALL persistir a mudança e atualizar o card imediatamente.
3. WHEN um grão tem status e Data de Torra THEN o status do pacote SHALL ser independente do badge de degass (um não altera o outro).

**Independent Test**: Alterar o status de um grão pela lista, recarregar a página e verificar a persistência; confirmar que o badge de degass não muda.

---

### P1: Exclusão de Grãos ⭐ MVP

**User Story**: Como usuário, quero excluir um grão do inventário com confirmação, para remover entradas erradas ou pacotes que nunca vou usar.

**Why P1**: Exclusão é parte do escopo de "Listagem e exclusão" da M2.

**Acceptance Criteria**:

1. WHEN o usuário toca em excluir em um card THEN o sistema SHALL exibir diálogo de confirmação antes de remover.
2. WHEN o usuário confirma a exclusão THEN o sistema SHALL remover o grão permanentemente e atualizar a listagem.
3. WHEN o usuário cancela a exclusão THEN o sistema SHALL não realizar nenhuma mudança.

**Independent Test**: Excluir um grão confirmando → some da lista e não volta após reload; cancelar → grão permanece.

---

## Edge Cases

- WHEN a Data de Torra é futura (dias negativos) THEN o sistema SHALL tratar como "Muito fresco" sem quebrar o cálculo.
- WHEN um grão não possui Data de Torra THEN o badge de degass SHALL não renderizar e nenhum texto de degass SHALL aparecer.
- WHEN dois grãos têm a mesma Marca e Origem THEN o sistema SHALL permitir o cadastro (sem constraint de unicidade).
- WHEN o autocomplete não encontra valores anteriores THEN o valor digitado SHALL ser aceito e passar a aparecer nas sugestões futuras.
- WHEN a exclusão é cancelada THEN o estado da lista SHALL permanecer inalterado.
- WHEN o usuário tenta salvar com apenas espaços em Marca THEN o sistema SHALL bloquear o salvamento (Marca tratada como vazia).
- WHEN o storage falha ao ler os grãos THEN a listagem SHALL exibir estado vazio sem crash (delegação ao StorageService da M1).

---

## Requirement Traceability

| Requirement ID | Story                       | Phase  | Status  |
| -------------- | --------------------------- | ------ | ------- |
| BEAN-01        | P1: Registro e Edição       | Design | Pending |
| BEAN-02        | P1: Registro e Edição       | Design | Pending |
| BEAN-03        | P1: Registro e Edição       | Design | Pending |
| BEAN-04        | P1: Registro e Edição       | Design | Pending |
| BEAN-05        | P1: Registro e Edição       | Design | Pending |
| BEAN-06        | P1: Registro e Edição       | Design | Pending |
| BEAN-07        | P1: Registro e Edição       | Design | Pending |
| BEAN-08        | P1: Listagem + Degass       | Design | Pending |
| BEAN-09        | P1: Listagem + Degass       | Design | Pending |
| BEAN-10        | P1: Listagem + Degass       | Design | Pending |
| BEAN-11        | P1: Listagem + Degass       | Design | Pending |
| BEAN-12        | P1: Listagem + Degass       | Design | Pending |
| BEAN-13        | P1: Listagem + Degass       | Design | Pending |
| BEAN-14        | P1: Listagem + Degass       | Design | Pending |
| BEAN-15        | P1: Status do Pacote        | Design | Pending |
| BEAN-16        | P1: Status do Pacote        | Design | Pending |
| BEAN-17        | P1: Status do Pacote        | Design | Pending |
| BEAN-18        | P1: Exclusão                | Design | Pending |
| BEAN-19        | P1: Exclusão                | Design | Pending |
| BEAN-20        | P1: Exclusão                | Design | Pending |

**Coverage:** 20 total, 0 mapped to tasks, 20 unmapped ⚠️

---

## Success Criteria

- [ ] Fluxo completo demo-ável: cadastrar, ver badge de degass correto, trocar status, editar, excluir — tudo persistente após reload.
- [ ] 100% dos requisitos BEAN-01..20 mapeados e verificados.
- [ ] Suíte de testes unitários dos services (store + cálculo de degass) verde.
- [ ] Listagem e formulário utilizáveis em viewport móvel (≤ 480px) sem scroll horizontal.
