# V1 Hardening Tasks

## Overview

**Feature:** V1 Hardening (M5)
**Scope:** Large — 4 areas de trabalho, múltiplos componentes
**Dependências:** M1–M4 concluídas
**Testes:** Unit tests existentes + verificação manual de responsividade

---

## Tasks

### T-V1-01: [P] Revisão responsiva — Bottom nav e layout mobile

**What:** Verificar e ajustar bottom nav e layout em viewport ≤480px

**Where:**
- `src/app/app.component.ts` — bottom nav template e CSS
- `src/styles.scss` — media queries globais

**Depends on:** Nenhuma (pode iniciar imediatamente)

**Reuses:** Tokens do DESIGN.md (bottom nav ≤480px, nav horizontal desktop)

**Done when:**
- Bottom nav visível em ≤480px, oculta em >480px
- Nav horizontal visível em >480px, oculta em ≤480px
- Todos os cards e formulários com layout empilhado em mobile
- Nenhum scroll horizontal em viewport 375px

**Tests:** Teste manual — abrir em 375px, navegar por todas as rotas

**Gate:** `ng build` sem erros

---

### T-V1-02: [P] Validação — Bean Form (Marca obrigatória)

**What:** Garantir que Bean Form valida Marca obrigatória com mensagem de erro

**Where:**
- `src/app/features/bean-inventory/bean-form/bean-form.component.ts` — validação
- `src/app/features/bean-inventory/bean-form/bean-form.component.html` — mensagem de erro

**Depends on:** Nenhuma

**Reuses:** Reactive Forms (AD-009), erro inline terracota (AD-010)

**Done when:**
- Submeter com Marca vazia → erro inline visível
- Digitar Marca → erro desaparece
- Submeter com Marca com espaços → erro (whitespace-only conta como vazio)
- Outros campos opcionais aceitos vazios

**Tests:** Teste manual + verificar unit tests existentes

**Gate:** `ng test` sem novas falhas

---

### T-V1-03: [P] Validação — Brew Log Form (Método obrigatório)

**What:** Garantir que Brew Log Form valida Método obrigatório

**Where:**
- `src/app/features/brew-logs/log-form/log-form.component.ts` — validação
- `src/app/features/brew-logs/log-form/log-form.component.html` — mensagem de erro

**Depends on:** Nenhuma

**Reuses:** Reactive Forms (AD-009)

**Done when:**
- Submeter com Método não selecionado → erro visível
- Selecionar Método → erro desaparece
- Todos os outros campos aceitos vazios (opcionais)

**Tests:** Teste manual + verificar unit tests existentes

**Gate:** `ng test` sem novas falhas

---

### T-V1-04: [P] Edge Cases — Degass com data futura e sem data

**What:** Verificar comportamento de degass com edge cases de data

**Where:**
- `src/app/features/bean-inventory/bean-card/bean-card.component.ts` — badge
- `src/app/shared/utils/degass.util.ts` — lógica (já implementada)

**Depends on:** Nenhuma

**Reuses:** `degassInfo()` (AD-010)

**Done when:**
- Bean com data futura → badge "Muito fresco" com dias clamados em ≥0
- Bean sem data de torra → nenhum badge exibido
- Bean com data inválida → nenhum badge exibido

**Tests:** Verificar unit tests de degass existentes; teste manual se necessário

**Gate:** `ng test` sem novas falhas

---

### T-V1-05: [P] Edge Cases — Log sem grão e sem moagem

**What:** Verificar comportamento de brew logs com dados ausentes

**Where:**
- `src/app/features/brew-logs/log-card/log-card.component.ts` — exibição

**Depends on:** Nenhuma

**Reuses:** Valores padrão do BrewLogUtil

**Done when:**
- Log sem grão → card mostra "Sem grão"
- Log sem moagem → card mostra "—"
- Log sem avaliação (estrelas 0) → estrelas não exibidas ou "Não avaliado"

**Tests:** Teste manual + verificar unit tests existentes

**Gate:** `ng test` sem novas falhas

---

### T-V1-06: [P] Edge Cases — Exclusão com confirmação

**What:** Verificar que exclusão de bean e log pede confirmação

**Where:**
- `src/app/features/bean-inventory/beans-page/beans-page.component.ts` — exclusão bean
- `src/app/features/brew-logs/log-detail/log-detail.component.ts` — exclusão log

**Depends on:** Nenhuma

**Reuses:** `<dialog>` nativo (AD-010)

**Done when:**
- Clicar "Excluir" bean → dialog de confirmação aparece
- Confirmar → bean excluído permanentemente
- Cancelar → nada acontece
- Mesmo fluxo para log

**Tests:** Teste manual

**Gate:** `ng build` sem erros

---

### T-V1-07: Testes unitários — Execução e correções

**What:** Rodar suíte completa e corrigir falhas

**Where:** Todos os arquivos de teste (`*.spec.ts`)

**Depends on:** T-V1-01 a T-V1-06 (executar após ajustes)

**Reuses:** Vitest config existente

**Done when:**
- `ng test` retorna 0 falhas
- Cobertura mantida ou aumentada

**Tests:** `ng test`

**Gate:** Todos os testes verdes

---

## Parallel Execution Plan

```
Wave 1 (início imediato):
├── T-V1-01 [P] Responsividade
├── T-V1-02 [P] Validação Bean
├── T-V1-03 [P] Validação Log
├── T-V1-04 [P] Edge Cases Degass
├── T-V1-05 [P] Edge Cases Logs
└── T-V1-06 [P] Edge Cases Exclusão

Wave 2 (após Wave 1):
└── T-V1-07 Testes
```

**Total:** 7 tasks, 2 waves, ~1-2h estimado
