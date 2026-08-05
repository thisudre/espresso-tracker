# Bean Inventory Context

Data de captura: 2026-08-05
Fase: Specify (discuss gray areas)
Spec: `.specs/features/bean-inventory/spec.md`
Status: Ready for design

---

## Feature Boundary

CRUD de grãos (cadastro, edição, listagem, exclusão) com status do pacote (Aberto/Fechado/Finalizado) e indicador visual de dias desde a torra (degass window ideal). Construído sobre a infra da M1 (StorageService, signals, shell). Sem vínculo com Brew Logs (M4).

---

## Implementation Decisions

### Degass Window

- Janela ideal: 3 a 14 dias após a torra (inclusive).
- Exibição: badge colorido por estado no card da listagem, com contagem de dias no texto.
- Estados textuais: "Muito fresco (Xd)", "No ideal (Xd)", "Passou do ideal (Xd)".
- Sem Data de Torra → badge não renderiza.
- Data de Torra futura → tratar como "Muito fresco", sem quebrar.

### Status do Pacote

- Status (Aberto/Fechado/Finalizado) definido manualmente pelo usuário.
- Independente do badge de degass — um não altera o outro.
- Alteração via seletor rápido direto no card da listagem, sem entrar na edição.

### Formulário de Cadastro

- Obrigatório: apenas Marca/Torrefação (espaços em branco contam como vazio).
- Data de Torra opcional; sem torra = sem badge de degass.
- Origem e Variedade: texto livre com autocomplete de valores já usados em outros grãos; valor digitado novo é aceito e passa a aparecer nas sugestões.
- Processo: select fixo (Washed, Natural, Honey, Outro).
- Todos os campos editáveis a qualquer momento (status via seletor rápido).

### Listagem e Exclusão

- Ordenação padrão: data de criação, mais recente primeiro.
- Layout: cards.
- Exclusão: botão com diálogo de confirmação; exclusão permanente (sem undo).

### Agent's Discretion

- Cores exatas dos badges de estado (fresco/ideal/passou) — semântica definida, paleta a cargo do design.
- Estrutura do card (quais campos visíveis além de marca/origem/badge/status) — decidida na execução.
- Implementação do autocomplete (componente próprio vs nativo) — a cargo do design.

---

## Specific References

- No specific requirements — open to standard approaches.

---

## Deferred Ideas

- [ ] Processo "Outro" com texto customizado ao selecionar — surgiu durante discussão do formulário; extensão natural para depois da v1.
- [ ] Histórico de uso por pacote (datas de abertura/finalização) — relacionado ao status; avaliar com Brew Logs (M4).
