# V1 Hardening Specification

## Problem Statement

O app foi construído nas M1–M4 com funcionalidades completas, mas precisa de polimento antes do release v1. Existem gaps de responsividade em dispositivos móveis (bancada), validação de campos incompleta, edge cases não tratados e a suíte de testes precisa ser executada e corrigida. A M5 garante que o app está pronto para uso real.

## Goals

- [ ] App funciona corretamente em dispositivos móveis ≤480px com bottom nav — medido por teste manual em viewport mobile.
- [ ] Todos os formulários têm validação adequada e mensagens de erro claras — medido por testes de validação em Bean Form e Brew Log Form.
- [ ] Edge cases são tratados (datas inválidas, dados ausentes, estados vazios) — medido por testes unitários existentes passando.
- [ ] Suíte de testes unitários está verde — medido por `ng test` sem falhas.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Novas funcionalidades | M5 é polimento, não adição |
| Mudanças de design system | DESIGN.md já definido (AD-006) |
| Migração de storage | Fora do escopo v1 (AD-001) |
| Testes E2E/integração | Apenas unit tests na v1 |
| Performance/otimização | Não listado no escopo v1 |

---

## User Stories

### P1: Responsividade Mobile ⭐ MVP

**User Story**: Como usuário na bancada, quero usar o app no celular com bottom nav para acessar todas as funcionalidades sem zoom ou scroll horizontal.

**Why P1**: O app é mobile-first (AD-003) e a bottom nav é o padrão de navegação ≤480px (DESIGN.md).

**Acceptance Criteria**:

1. WHEN o viewport é ≤480px THEN o sistema SHALL exibir bottom nav fixa no rodapé.
2. WHEN o viewport é ≤480px THEN o sistema SHALL exibir conteúdo sem scroll horizontal.
3. WHEN o viewport é ≤480px THEN o sistema SHALL exibir cards e formulários com layout empilhado.
4. WHEN o usuário navega entre rotas THEN o sistema SHALL manter bottom nav visível e funcional.

**Independent Test**: Abrir app em viewport 375px (iPhone SE) → navegar por todas as rotas → verificar bottom nav, layout empilhado, sem scroll horizontal.

---

### P1: Validação de Formulários ⭐ MVP

**User Story**: Como usuário, quero mensagens de erro claras ao preencher formulários incorretamente, para saber o que corrigir.

**Why P1**: Validação existe parcialmente (Marca obrigatória na M2, método obrigatório na M4), mas precisa ser consistente e completa.

**Acceptance Criteria**:

1. WHEN o formulário de bean é submetido com Marca vazia THEN o sistema SHALL exibir erro inline em terracota (AD-010).
2. WHEN o formulário de brew log é submetido com método não selecionado THEN o sistema SHALL exibir erro de validação.
3. WHEN o usuário corrige o campo com erro THEN o sistema SHALL remover a mensagem de erro automaticamente.
4. WHEN campos opcionais estão vazios THEN o sistema SHALL aceitar sem erro.

**Independent Test**: Submeter bean form sem Marca → ver erro; selecionar Marca → erro desaparece; submeter brew log sem método → ver erro.

---

### P1: Edge Cases ⭐ MVP

**User Story**: Como usuário, quero que o app lide graciosamente com dados ausentes ou inválidos, sem quebrar.

**Why P1**: Degass com data futura, logs sem grão, beans sem status — todos precisam de tratamento (AD-004, AD-007).

**Acceptance Criteria**:

1. WHEN bean tem data de torra futura THEN o sistema SHALL mostrar badge "Muito fresco" com dias clamados em ≥0.
2. WHEN bean não tem data de torra THEN o sistema SHALL não exibir badge de degass.
3. WHEN brew log não tem grão vinculado THEN o sistema SHALL exibir "Sem grão" no card.
4. WHEN brew log tem moagem vazia THEN o sistema SHALL exibir "—" no card.
5. WHEN usuário exclui bean/log THEN o sistema SHALL pedir confirmação e excluir permanentemente.

**Independent Test**: Criar bean com data futura → badge "Muito fresco"; criar bean sem data → sem badge; criar log sem grão → card mostra "Sem grão"; excluir → confirmação → sumiu.

---

### P2: Suíte de Testes

**User Story**: Como desenvolvedor, quero que todos os testes passem para garantir que o app está funcional.

**Why P1**: Testes existem desde M1, mas precisam ser executados e corrigidos antes do release.

**Acceptance Criteria**:

1. WHEN `ng test` é executado THEN o sistema SHALL retornar 0 falhas.
2. WHEN testes rodam THEN o sistema SHALL cobrir stores, utilitários e componentes principais.
3. WHEN há falhas THEN o sistema SHALL identificar e corrigir a causa raiz.

**Independent Test**: Rodar `ng test` → todos verdes; verificar cobertura de BeanStore, LogStore, degass util, brew ratio util.

---

## Requirements Traceability

| ID | Requirement | Story | Status |
|----|-------------|-------|--------|
| V1-01 | Bottom nav visível ≤480px | Responsividade Mobile | Pending |
| V1-02 | Layout empilhado sem scroll horizontal | Responsividade Mobile | Pending |
| V1-03 | Validação Marca obrigatória (bean) | Validação de Formulários | Pending |
| V1-04 | Validação método obrigatório (log) | Validação de Formulários | Pending |
| V1-05 | Degass com data futura clampada | Edge Cases | Pending |
| V1-06 | Degass sem data ausente | Edge Cases | Pending |
| V1-07 | Log sem grão "Sem grão" | Edge Cases | Pending |
| V1-08 | Exclusão com confirmação | Edge Cases | Pending |
| V1-09 | Testes unitários verdes | Suíte de Testes | Pending |
