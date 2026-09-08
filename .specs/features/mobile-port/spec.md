# Mobile Port (Capacitor) — Specification

**Milestone:** M8
**Status:** Draft
**Tipo:** Port — wrapper nativo do app simplificado (M7)

## Problem Statement
O app atual é web-only (Angular 22, rotas `''`/`/extract`/`/guides`/`/guides/:id`). Para uso na bancada como app instalável (Android primeiro, iOS depois), precisamos empacotá-lo como app nativo via **Capacitor**, com paridade total com o web simplificado e sem capacidades nativas na primeira entrega.

## Goals
- [ ] App instalável via Capacitor (Android alvo inicial) com paridade total: dashboard, extração guiada (dose/ratio + timer + receitas V60) e biblioteca — medido por build nativo instalável e fluxo `/guides` → `/extract` funcionando no device/emulador.
- [ ] Zero regressão no web: `ng serve`/`ng build`/`ng test`/`ng lint` continuam verdes; mesma codebase serve web e mobile — medido por CI local.
- [ ] Preparado para evoluir com capacidades nativas futuras (timer em background, etc.) sem re-arquitetar — medido por estrutura Capacitor isolada.

## Out of Scope
| Feature | Reason |
| ------- | ------ |
| Notificações / timer em background | Explicitamente adiado (resposta do usuário) |
| SQLite / Preferences nativo vs LocalStorage | Mantém StorageService/LocalStorage na v1 mobile |
| Câmera, compartilhar, Haptics, Push | Sem uso nativo na primeira entrega |
| iOS build/signing nesta milestone | Android primeiro; iOS depois (mesma base) |
| Grãos/Logs (beans/logs) | Já removidos na M7 — fora do escopo mobile também |

---

## User Stories

### P1: Wrapper Capacitor com paridade web ⭐ MVP

**User Story:** Como usuário, quero instalar o app no Android e usar Home, Extrair e Guias exatamente como no web.

**Acceptance Criteria:**
1. WHEN o projeto roda `npx cap sync` + build Android THEN o sistema SHALL gerar app instalável que abre nas rotas existentes (`''`, `/extract`, `/guides`, `/guides/:id`, 404).
2. WHEN o app roda no device/emulador THEN navegação (nav 3 itens + bottom-nav ≤480px) e dashboard simplificado SHALL se comportar idêntico ao web.
3. WHEN o usuário seleciona receita V60 no `/extract` e ajusta dose/ratio THEN o timer SHALL dirigir fases com volumes escalados por `totalWater = dose × ratio` (mesma lógica M6/M7).

**Independent Test:** `npm run build && npx cap sync android && npx cap open android` compila; fluxo manual no emulador.

---

### P1: Web inalterado (mesma codebase) ⭐ MVP

**User Story:** Como dev, quero que web e mobile compartilhem 100% do código Angular sem duplicação.

**Acceptance Criteria:**
1. WHEN `ng serve` / `ng build` / `ng test` / `ng lint` rodam THEN SHALL passar sem config específica de mobile (schematics Capacitor não quebram web).
2. WHEN `capacitor.config.ts` existe THEN `webDir` SHALL apontar para output do `ng build` (`dist/espresso-tracker/browser` ou equivalente) e `server` sem URL externa.
3. Nenhum import Capacitor SHALL estar em runtime web crítico (guard via `isNative` se necessário).

**Independent Test:** Rodar `npm run build && npm test && ng lint` verdes antes e depois do `cap init`.

---

### P2: Tooling e docs

**User Story:** Como dev, quero instruções mínimas para build/run Android.

**Acceptance Criteria:**
1. WHEN README ou `.specs` documenta THEN SHALL haver passos: `npm i`, `ng build`, `npx cap sync`, `npx cap run android`.
2. `android/` gerado SHALL estar em `.gitignore` (ou decisão explícita de versionar) — registrar em STATE.md.

**Independent Test:** Seguir docs em máquina com Android Studio e instalar.

---

## Edge Cases
- WHEN app roda no browser (sem Capacitor) THEN `Capacitor.isNativePlatform()` = false e nenhum plugin é chamado.
- WHEN `android/` não existe (clone fresco) THEN `npx cap add android` + `npx cap sync` SHALL recriar sem editar código Angular.

## Requirement Traceability
| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| MOB-01 | P1: Wrapper | Specified | Pending |
| MOB-02 | P1: Wrapper | Specified | Pending |
| MOB-03 | P1: Wrapper | Specified | Pending |
| MOB-04 | P1: Web inalterado | Specified | Pending |
| MOB-05 | P1: Web inalterado | Specified | Pending |
| MOB-06 | P1: Web inalterado | Specified | Pending |
| MOB-07 | P2: Tooling | Specified | Pending |
| MOB-08 | P2: Tooling | Specified | Pending |

**Coverage:** 8 total, 0 mapped to tasks, 8 unmapped

---

## Success Criteria
- [ ] `npx cap sync` + build Android OK; app instalável com paridade total (3 rotas + timer + guias).
- [ ] Web continua verde (build/test/lint).
- [ ] Docs de setup mobile + decisão sobre `android/` no git registrada.

## Open Questions (para context.md se necessário)
- D1: Versionar `android/` ou `.gitignore`? (recomendação: ignorar na M8)
- D2: `appId` / `appName` do Capacitor? (sugestão: `com.espressotracker.app`, `Espresso & Bean`)
