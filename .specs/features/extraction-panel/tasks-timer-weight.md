# Meta de Peso no Timer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar o peso alvo acumulado da etapa atual (escalonado por dose × ratio) na linha "Meta" do cronômetro em modo receita.

**Architecture:** Lookup simples no store: novo `computed currentPhaseWeightG` no `ExtractionStore` lê `scaledActivePhases()[phaseIndex]` (mesma fonte da lista lateral de etapas). O `BrewTimerComponent` renderiza `Meta mm:ss · até Ng` na branch de receita; `null` → sem sufixo. Nenhuma mudança no modelo `TimerPhase` nem em `timer.util.ts`.

**Tech Stack:** Angular 22 (signals), Vitest.

**Spec:** `.specs/features/extraction-panel/design-timer-weight.md`

## Global Constraints

- UI copy e labels em PT-BR ("até Ng").
- State 100% Signals; componentes standalone; sem NgModules.
- Lógica de domínio em store/`computed`; UI só lê signals.
- Tokens do DESIGN.md para estilo (linha da meta usa a classe existente `total-time`/`display-md` — sem token novo).
- Verificação de UI por navegação manual (AGENTS.md); lógica de store por unit test.

## Review Focus

- Peso deve reagir a mudança de dose/ratio **durante** a extração (mesma fonte da lista lateral — conferir que editar dose muda o valor exibido sem reiniciar o timer).
- Modo simples (espresso) não pode exibir peso (não há dado) — branch inalterada.
- Sem receita selecionada em modo receita não deve quebrar (peso `null` → sem sufixo).
- `phaseIndex` fora do range de `scaledActivePhases` (ex.: após última fase/completed) → `null`, sem throw.
- Mobile ≤ 480px: linha da meta não pode estourar layout com texto maior.

---

### Task 1: `currentPhaseWeightG` no ExtractionStore

**Files:**
- Modify: `src/app/core/stores/extraction.store.ts` (computed logo após `scaledActivePhases`, ~linha 31)
- Test: `src/app/core/stores/extraction.store.spec.ts` (novo bloco `describe('currentPhaseWeightG')` ao final, seguindo o padrão de setup existente do arquivo)

**Interfaces:**
- Consumes: `this.scaledActivePhases()` (`ScaledPhase[]`, com `volumeAgua: number`), `this.timer().phaseIndex` (`number`), `this.timer().mode` (`'simple' | 'recipe'`).
- Produces: `currentPhaseWeightG: ComputedRef<number | null>` — gramas acumuladas da etapa atual (escalonadas), ou `null`.

- [ ] **Step 1: Escrever os testes falhando**

Adicionar ao final de `extraction.store.spec.ts`:

```ts
describe('currentPhaseWeightG', () => {
  it('returns null in simple mode (espresso)', () => {
    expect(store.currentPhaseWeightG()).toBeNull();
  });

  it('returns scaled cumulative weight of current phase in recipe mode', () => {
    store.selectMethod('v60');
    store.setDose('15');
    store.selectRecipe('v60-suave');

    // 15g × ratio 16 = 240g; Bloom 40 * 240/300 = 32
    expect(store.currentPhaseWeightG()).toBe(32);
  });

  it('updates weight when advancing phase', () => {
    store.selectMethod('v60');
    store.setDose('15');
    store.selectRecipe('v60-suave');
    store.advancePhase();

    // 1ª Vertida 150 * 240/300 = 120
    expect(store.currentPhaseWeightG()).toBe(120);
  });

  it('reacts to dose change during extraction without resetting timer', () => {
    store.selectMethod('v60');
    store.setDose('15');
    store.selectRecipe('v60-suave');
    store.start();
    vi.advanceTimersByTime(5000);
    TestBed.flushEffects();

    store.setDose('20'); // 20 × 16 = 320; Bloom 40 * 320/300 = 43

    expect(store.currentPhaseWeightG()).toBe(43);
    expect(store.timer().totalSeconds).toBe(5); // timer não resetou
  });

  it('returns null when no recipe selected', () => {
    store.selectMethod('v60');

    expect(store.currentPhaseWeightG()).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar falha**

Run: `npx ng test --watch=false` (ou `npm test`)
Expected: FAIL — `store.currentPhaseWeightG is not a function`

- [ ] **Step 3: Implementar o computed em `extraction.store.ts`**

Após o computed `scaledActivePhases`:

```ts
currentPhaseWeightG = computed<number | null>(() => {
  if (this.timer().mode !== 'recipe') return null;
  const phase = this.scaledActivePhases()[this.timer().phaseIndex];
  return phase ? phase.volumeAgua : null;
});
```

- [ ] **Step 4: Rodar os testes e confirmar passagem**

Run: `npm test`
Expected: PASS — suite `currentPhaseWeightG` verde e nenhum teste existente quebrado.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/stores/extraction.store.ts src/app/core/stores/extraction.store.spec.ts
git commit -m "feat(extract): currentPhaseWeightG expõe peso alvo da etapa atual"
```

### Task 2: Renderizar o peso no BrewTimerComponent

**Files:**
- Modify: `src/app/features/extract/brew-timer.component.ts` (branch `@if (isRecipeMode())` do template, linha 14; e bloco `computed` da classe)

**Interfaces:**
- Consumes: `extractStore.currentPhaseWeightG()` (`number | null`) da Task 1.
- Produces: novo computed `phaseWeight = computed(() => { const w = this.extractStore.currentPhaseWeightG(); return w !== null ? \`até ${w}g\` : null; })` — string PT-BR ou `null`.

- [ ] **Step 1: Adicionar o computed `phaseWeight` na classe**

- [ ] **Step 2: Alterar a linha da meta no template**

De:

```html
<div class="total-time display-md">Meta {{ phaseTarget() }}</div>
```

Para:

```html
<div class="total-time display-md">
  Meta {{ phaseTarget() }}@if (phaseWeight(); as weight) { · {{ weight }} }
</div>
```

(Sem mudança de estilo — mesma classe `total-time`/`display-md`; a branch simples fica intacta.)

- [ ] **Step 3: Build + lint**

Run: `npm run build && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Verificação manual**

`npm start` → `/extract` → método V60 + receita + dose 15:
- Linha da meta mostra `Meta 00:30 · até 32g` na Bloom;
- Mudar dose para 20 com timer rodando → muda para `· até 43g` sem resetar;
- Trocar para método Espresso → nenhuma exibição de peso;
- Mobile ≤ 480px: linha sem overflow.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/extract/brew-timer.component.ts
git commit -m "feat(extract): exibe meta de peso acumulada no timer da receita"
```
