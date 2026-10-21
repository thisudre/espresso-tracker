# Extraction Panel — Meta de peso no timer (addendum)

**Design base**: `.specs/features/extraction-panel/design.md`
**Data**: 2026-10-21
**Status**: Aprovado pelo usuário (2026-10-21)

---

## Problema

No modo receita (V60), o cronômetro mostra a etapa atual e a meta de tempo ("Meta 1:15"), mas não mostra a meta de peso da etapa. O peso existe na receita (`RecipePhase.volumeAgua`, acumulado — "adicione água até 160g") e já aparece na lista lateral de etapas escalonada conforme dose × ratio, mas `recipeToTimerPhases()` descarta o `volumeAgua` ao projetar o `TimerPhase` — o timer não tem acesso a peso algum.

## Decisão (aprovada)

Mostrar o peso alvo **acumulado** da etapa atual na linha "Meta" do timer, no formato `Meta 1:15 · até 160g`.

**Abordagem escolhida: lookup no store (sem mudar o modelo `TimerPhase`).** Um novo computed no `ExtractionStore` lê `scaledActivePhases()[phaseIndex()]` e expõe o `volumeAgua` da etapa atual. Alternativa rejeitada: estender `TimerPhase` com `targetWeightG` — mais código (modelo + util + 4 call sites + testes) e o peso ficaria congelado no timer se o usuário alterasse ratio durante a extração, divergindo da lista lateral.

Critério de alinhamento: `phaseIndex` do timer alinha com as fases da receita (mesma receita, mesma ordem); acesso defensivo (`?? null`) para não quebrar se não houver correspondência.

## Mudanças

### ExtractionStore (`src/app/core/stores/extraction.store.ts`)

- Novo computed `currentPhaseWeightG: number | null`:
  - modo receita com receita selecionada e fase existente → `scaledActivePhases()[phaseIndex].volumeAgua` (gramas, acumulado, já escalonado por dose × ratio);
  - caso contrário (modo simples, sem receita, índice fora do range) → `null`.
- `scaledActivePhases` já existe e é a mesma fonte da lista lateral — peso no timer e na lista nunca divergem, mesmo editando dose/ratio durante a extração.

### BrewTimerComponent (`src/app/features/extract/brew-timer.component.ts`)

- Branch de receita: linha da meta passa de `Meta {{ phaseTarget() }}` para:
  - com peso: `Meta 1:15 · até 160g` (`phaseWeight()` formatted);
  - sem peso (`null`): mantém `Meta 1:15` (ou `Meta —` quando sem tempo).
- Branch modo simples inalterada (sem peso no modelo de dados do espresso).

## Fora de escopo

- Peso alvo no modo simples/espresso (não há dado de peso no modelo).
- Mudanças no modelo `TimerPhase` ou nas funções puras de `timer.util.ts`.
- Balança/integração real — é só meta informativa.

## Testes

`extraction.store.spec.ts` (Vitest):
- Em modo receita com receita selecionada, `currentPhaseWeightG` retorna o `volumeAgua` escalonado correto para a fase atual (confere escalonamento por dose × ratio);
- Avançar de fase muda o peso exposto para a próxima fase;
- Fora de modo receita / sem receita → `null`.

Verificação manual: extrair V60 com receita, conferir "Meta mm:ss · até Ng" acompanhando a lista lateral ao vivo ao editar dose durante a extração; mobile ≤ 480px sem quebra de layout.
