# Context — App Simplificado

**Decisões do usuário (discussão 2026-09-08):**

- D-SIMP-01: App vira só receitas base + auxílio durante extração com dose/ratio ajustáveis (opção B da calibragem).
- D-SIMP-02: Corte seco — remover `/beans` e `/logs` por completo (opção A), não esconder nem dobrar dentro da extração.
- D-SIMP-03: Fluxo Large com Specify→Design→Tasks→Execute via TLC Spec-Driven (pedido explícito do usuário).
- Gray areas fechadas: dose/ratio editáveis reescalam fases por `totalWater = dose × ratio` (AD-015 mantido); modo simples preservado; biblioteca `/guides` preservada; chaves órfãs ignoradas sem migração.
