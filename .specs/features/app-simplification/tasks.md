# Tasks — App Simplificado (M7)

**Spec**: `spec.md` | **Design**: `design.md` | **Status**: Draft

## T1 — Rotas + Nav (SIMP-01..03)
- O que: Remover rotas beans/logs de `app.routes.ts`; Nav com 3 itens (Home, Extrair, Guias) desktop + bottom-nav.
- Onde: `src/app/app.routes.ts`, `src/app/shared/nav/nav.component.ts` (+ spec se houver)
- Depende: -
- Done: nav 3 itens, `/beans` e `/logs` → 404
- Testes: `app.spec` ajustado

## T2 — Dashboard simplificado (SIMP-04)
- O que: Dashboard só com atalhos Extrair/Guias + receita preferida opcional (GuideStore). Remover BeanStore/LogStore.
- Onde: `src/app/features/dashboard/dashboard.page.ts` (+ template/style)
- Depende: T1
- Done: `''` sem contadores de grãos/logs

## T3 — Limpeza Extract (SIMP-05..07)
- O que: Remover atalho "Salvar no histórico" de `extract.page.ts`; garantir fluxo receita→timer intacto.
- Onde: `src/app/features/extract/extract.page.ts`
- Depende: T1
- Done: painel sem referência a logs, receita dirige timer

## T4 — Deleção de código beans/logs (SIMP-09..10) [P]
- O que: Deletar models/stores/utils/components/specs de beans e logs + órfãos (BaseStore se sem uso, degass, brew-log, validators, autocomplete-field, star-rating).
- Onde: `src/app/core/models/bean.model.ts`, `brew-log.model.ts`, `src/app/core/stores/bean.store.ts`, `log.store.ts`, `base-store.ts`, `src/app/core/utils/degass.util*`, `brew-log.util*`, `validators.util*`, `src/app/features/beans/*`, `src/app/features/logs/*`, `src/app/shared/autocomplete-field/*`, `src/app/shared/star-rating/*`
- Depende: T1,T2,T3
- Done: `grep -r "bean\|log" src --include="*.ts" | grep -v guide` sem matches relevantes; build/lint verdes
- Gate: `npm test` (~110 tests), `ng build`, `ng lint`

## T5 — Validação final + docs
- O que: Atualizar STATE.md/ROADMAP.md, `app.spec` final, verificação manual.
- Onde: `.specs/project/STATE.md`, `.specs/project/ROADMAP.md`
- Depende: T4
- Done: docs atualizados, bundle menor, suite verde
