# AGENTS.md

## Project state

This repo has **no code yet** — it is in the specification phase. There is no `package.json` or Angular scaffold, and git has zero commits. Do not run `ng`/`npm` commands expecting an app; the Angular 21 scaffold is created when M1 is executed.

## Source of truth

- `.specs/project/PROJECT.md` — vision, tech stack, scope, out-of-scope
- `.specs/project/ROADMAP.md` — milestones M1–M9 (current: M9, executed 6/7 — Google OAuth pendente de credenciais)
- `.specs/project/STATE.md` — binding decisions (AD-001..006), todos, deferred ideas; reflects current work
- `.specs/features/<feature>/spec.md` + `context.md` — requirements (SHELL-01..20, BEAN-01..20, EXTRACT-01..22) and per-feature user decisions (D1–D8, D-EXTR-01..05)
- `Espresso & Bean Tracker` — product vision overview
- `DESIGN.md` — UI design system reference (colors, typography, tokens, components); consult it before any UI work

Read STATE.md before starting work. Decisions recorded in specs/context are binding; propose a new AD in STATE.md rather than re-litigating settled choices.

## Language

All specs, UI copy, and acceptance criteria are **Brazilian Portuguese (PT-BR)** — write UI labels and domain strings in PT-BR (grãos, extração, torra, xícara).

## Hard technical constraints (AD-002, binding for all code)

- Angular 21, **Standalone Components only — no NgModules**
- State is **100% Signals** (`signal()`/`computed()`/`effect()`); use `@if`/`@for`/`@switch` control flow, no NgZone patterns
- All persistence goes through a dedicated generic `StorageService` (`get<T>`/`set<T>`/`remove<T>`); stores never access LocalStorage directly. Payloads carry a `version` schema field; incompatible version or corrupt JSON returns `null`, never throws

## Settled product decisions (do not change without a new AD)

- Routes: `''` dashboard, `/beans`, `/extract`, `/logs`, friendly 404
- App starts empty — no seed data; dashboard cards show empty states
- M2 Bean Inventory: degass window 3–14 days with badges "Muito fresco"/"No ideal"/"Passou do ideal"; only Marca required (whitespace-only counts as empty); Origem/Variedade autocomplete from existing values; Processo fixed select (Washed, Natural, Honey, Outro); cards newest-first by creation date; delete needs confirmation and is permanent; package status (Aberto/Fechado/Finalizado) via quick selector on the card, independent of the degass badge

## Workflow

Spec-driven: specify → design → tasks → execute, with requirement traceability. Always read `DESIGN.md` before any UI work (components, forms, screens, navigation) and follow its tokens and conventions. Verify service logic (storage, stores, degass calc) with Angular unit tests; verify UI flows (routing, 404, mobile ≤480px with bottom nav, empty states) by manual navigation. Concrete tooling (Angular CLI, test runner, lint) is still to be decided at M1 execution.
