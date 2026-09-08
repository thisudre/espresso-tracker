# App Simplificado — Só Receitas + Extração Guiada — Specification

**Milestone:** M7 (simplificação pós-M6)
**Status:** Specified
**Tipo:** Refactor breaking — corte de escopo

## Problem Statement

O app acumulou 3 domínios (Grãos com degass/status, Extração com timer/ratio, Logs com avaliações) + Guias (M6). O usuário reporta sensação de "features demais" e quer um app mais simples: **receitas base + auxílio durante a extração com dose/ratio ajustáveis**. Grãos (marca, torra, degass) e Logs (histórico/avaliações) não são necessários para esse uso.

## Goals

- [ ] App foca em extração guiada: biblioteca de receitas + painel que dirige o timer pelas fases da receita, com volumes escalados por dose×ratio — medido por fluxo `/guides` → `/extract` com receita selecionada funcionando.
- [ ] Navegação e dashboard refletem o escopo reduzido (sem Grãos/Histórico) — medido por nav com 3 itens e dashboard sem agregados de beans/logs.
- [ ] Código e rotas de Grãos/Logs removidos sem quebrar Guias/Extração — medido por build/lint/testes verdes e bundle menor.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| CRUD de grãos, degass, status Aberto/Fechado/Finalizado | Corte explícito pedido pelo usuário |
| Brew Logs, avaliações sensoriais, filtros por grão/método | Corte explícito |
| Receitas editáveis pelo usuário | Mantém fora como na M6 |
| Novos métodos/receitas além de V60 Equilibrada/Intensa/Suave | Sem expansão nesta milestone |
| Migração de dados antigos de beans/logs | Chaves órfãs ignoradas; sem migração |

---

## User Stories

### P1: Navegação simplificada ⭐ MVP

**User Story:** Como usuário, quero ver só Home, Extrair e Guias na navegação, para entender que o app é sobre extração guiada.

**Acceptance Criteria:**
1. WHEN o usuário abre qualquer página THEN o sistema SHALL exibir nav com 3 itens: Home (`''`), Extrair (`/extract`), Guias (`/guides`) — sem Grãos/Logs.
2. WHEN a viewport é ≤480px THEN o sistema SHALL exibir bottom-nav com os mesmos 3 itens.
3. WHEN o usuário navega para `/beans`, `/logs` ou sub-rotas antigas THEN o sistema SHALL cair no 404 amigável.

**Independent Test:** Ver nav desktop e mobile com 3 itens; acessar `/beans` e `/logs` e ver 404.

---

### P1: Dashboard simplificado ⭐ MVP

**User Story:** Como usuário, quero um dashboard que me leve direto a extrair ou consultar guias, sem contadores de grãos/logs.

**Acceptance Criteria:**
1. WHEN o usuário abre `''` THEN o sistema SHALL exibir atalhos para `/extract` e `/guides` e opcionalmente a receita preferida atual — sem total de grãos, sem últimos logs, sem empty states de beans/logs.

**Independent Test:** Abrir `''` e ver apenas cards de Extrair/Guias.

---

### P1: Extração guiada preservada ⭐ MVP

**User Story:** Como usuário, quero escolher uma receita V60 no painel, ajustar dose/ratio e ser guiado pelo timer com fases da receita (auto-advance + manual), como na M6.

**Acceptance Criteria:**
1. WHEN o usuário seleciona receita V60 no `/extract` THEN o sistema SHALL configurar o timer com as fases da receita (volumes escalados por `totalWater = dose × ratio` via `scaledPhases(totalWater)`).
2. WHEN dose/ratio mudam com receita ativa THEN o sistema SHALL reescalar volumes sem resetar o timer.
3. Modo simples (2 fases) continua disponível e limpa a preferência persistida.

**Independent Test:** Selecionar Suave, ajustar dose 25g/ratio 16, ver fases 53g→213g→400g; Start e verificar auto-advance.

---

### P1: Biblioteca preservada ⭐ MVP

**User Story:** Como usuário, quero consultar `/guides` e `/guides/:id` com dose+ratio ajustáveis, sem depender de grãos/logs.

**Acceptance Criteria:**
1. WHEN o usuário abre `/guides` e `/guides/:id` THEN o sistema SHALL listar/detalhar as 3 receitas V60 com fases, volumes acumulados e tempos cumulativos, com campos dose/ratio locais escalando por `totalWater`.

**Independent Test:** Abrir `/guides`, ver 3 cards; abrir detalhe e ajustar dose/ratio e ver volumes reescalarem.

---

### P2: Limpeza de código

**User Story:** Como dev, quero que código de beans/logs (stores, utils, comps, specs, rotas) seja removido para reduzir bundle e complexidade.

**Acceptance Criteria:**
1. WHEN o build roda THEN não SHALL haver imports de `bean.store`, `log.store`, `base.store` (se sem uso), `degass.util`, `brew-log.model`, `bean-form`, `log-form`, etc.
2. WHEN `npm test` roda THEN a suíte SHALL passar com ~110-120 tests (sem specs de beans/logs).

**Independent Test:** `npm run build`, `ng lint`, `npm test` verdes; grep por `bean`/`log` sem matches em src.

---

## Edge Cases

- WHEN LocalStorage contém chaves `beans`/`logs` antigas THEN o sistema SHALL ignorá-las (sem leitura, sem crash).
- WHEN preferência `guide:preferredRecipe` existe THEN o sistema SHALL restaurá-la normalmente (única persistência restante além do theme se houver).

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| SIMP-01 | P1: Navegação simplificada | Specified | Pending |
| SIMP-02 | P1: Navegação simplificada | Specified | Pending |
| SIMP-03 | P1: Navegação simplificada | Specified | Pending |
| SIMP-04 | P1: Dashboard simplificado | Specified | Pending |
| SIMP-05 | P1: Extração guiada preservada | Specified | Pending |
| SIMP-06 | P1: Extração guiada preservada | Specified | Pending |
| SIMP-07 | P1: Extração guiada preservada | Specified | Pending |
| SIMP-08 | P1: Biblioteca preservada | Specified | Pending |
| SIMP-09 | P2: Limpeza de código | Specified | Pending |
| SIMP-10 | P2: Limpeza de código | Specified | Pending |

**Coverage:** 10 total, 0 mapped to tasks, 10 unmapped

---

## Success Criteria

- [ ] Nav com 3 itens, rotas antigas → 404, dashboard sem grãos/logs.
- [ ] Fluxo guiado completo funcionando (receita → timer → escala por dose×ratio).
- [ ] Build/lint/testes verdes, bundle menor, sem código morto de beans/logs.
