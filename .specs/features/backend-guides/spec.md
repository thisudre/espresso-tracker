# Backend Guias — Specification

**Milestone:** M8 — Backend para Receitas
**Status:** Specified
**Depende de:** M7 simplificação (só Extrair + Guias)

## Problem Statement
Receitas hoje são estáticas em `guide.model.ts` (3 V60). Sem backend não há criação/edição pelo usuário nem persistência real. Precisamos de API que sirva receitas (leitura pública) e permita CRUD autenticado, com frontend consumindo via HTTP.

## Goals
- [ ] `GET /guides` e `GET /guides/:id` públicos retornam receitas (seed 3 V60 + criadas)
- [ ] `POST/PATCH/DELETE /guides` exigem auth JWT (email/senha + Google OAuth); só dono edita/deleta
- [ ] Frontend remove `RECIPES` estático e consome API; preferência `guide:preferredRecipe` migra para `PATCH /me/preferences` quando logado (fallback LocalStorage quando deslogado)

## Out of Scope
| Feature | Reason |
| ------- | ------ |
| Beans/Logs | Removidos na simplificação |
| Curtir/compartilhar, comentários | Futuro |
| Sync offline-first | Futuro |
| Paginação complexa/filtros além de method | v1 simples |

## User Stories

### P1: Leitura pública de receitas ⭐ MVP
**Como** visitante, **quero** listar e ver detalhe de receitas sem login.
- **AC1:** `GET /api/guides` SHALL retornar array de receitas (id, method, nome, foco, moagem, baseDose, tempoTotalEstimado, fases[], authorId, createdAt) — 200.
- **AC2:** `GET /api/guides/:id` SHALL retornar 200 se existe, 404 se não.
- **AC3:** Seed SHALL conter as 3 V60 (equilibrada/intensa/suave) idênticas ao `guide.model.ts` atual.

### P1: Auth (email/senha + Google OAuth) ⭐ MVP
**Como** usuário, **quero** registrar/logar para criar receitas.
- **AC1:** `POST /api/auth/register` (email, password, name) SHALL criar user, hashear senha (bcrypt), retornar 201 + JWT access/refresh. *(D-BE-API-01: campos da API em inglês, UI em PT-BR)*
- **AC2:** `POST /api/auth/login` SHALL validar e retornar JWT; 401 se inválido.
- **AC3:** `POST /api/auth/refresh` SHALL renovar access via refresh token.
- **AC4:** `GET /api/auth/google` + callback SHALL autenticar via Google OAuth e retornar JWT (Passport).
- **AC5:** `GET /api/me` autenticado SHALL retornar perfil.
- **AC6:** Senha SHALL ter mínimo 8 chars; email único; validação via class-validator.

### P1: Criação/edição autenticada
**Como** usuário logado, **quero** criar e editar minhas receitas.
- **AC1:** `POST /api/guides` com JWT SHALL criar receita (validação: nome/foco/method obrigatórios, fases >=1 com nome/tempoObjetivo/volumeAgua), setar authorId = userId — 201.
- **AC2:** `PATCH /api/guides/:id` SHALL permitir só se authorId == userId — 403 caso contrário.
- **AC3:** `DELETE /api/guides/:id` SHALL permitir só dono — 204.
- **AC4:** Sem JWT SHALL retornar 401 para POST/PATCH/DELETE.

### P2: Preferência persistida no backend
**Como** usuário logado, **quero** minha receita preferida salva na conta.
- **AC1:** `PATCH /api/me/preferences { preferredRecipeId }` autenticado SHALL salvar; `GET /me/preferences` retorna.
- **AC2:** Frontend: se logado, `GuideStore` lê/salva via API; se deslogado, mantém LocalStorage `guide:preferredRecipe` (fallback).

### P2: Frontend consome API
**Como** usuário, **quero** que `/guides` e `/extract` carreguem receitas da API.
- **AC1:** `GuidesPage`/`GuideDetailPage`/`ExtractPage` SHALL buscar via `GuideApiService` (HttpClient); loading/erro tratados.
- **AC2:** `guide.model.ts` estático removido (ou mantido só como tipo); seed no backend é fonte da verdade.

## Edge Cases
- WHEN token expirado THEN API retorna 401, frontend redireciona para login ou mostra estado deslogado.
- WHEN `preferredRecipeId` aponta para receita deletada THEN backend limpa preferência ou frontend cai para modo simples.
- WHEN Google OAuth falha THEN retorna 401 com mensagem PT-BR.

## Requirement Traceability
| ID | Story | Status |
| -- | ----- | ------ |
| GUIDE-API-01 | P1 leitura lista | Pending |
| GUIDE-API-02 | P1 leitura detalhe | Pending |
| GUIDE-API-03 | P1 seed 3 V60 | Pending |
| AUTH-01 | P1 register | Pending |
| AUTH-02 | P1 login | Pending |
| AUTH-03 | P1 refresh | Pending |
| AUTH-04 | P1 Google OAuth | Pending |
| AUTH-05 | P1 GET /me | Pending |
| GUIDE-API-04 | P1 criar autenticado | Pending |
| GUIDE-API-05 | P1 editar só dono | Pending |
| GUIDE-API-06 | P1 deletar só dono | Pending |
| PREF-01 | P2 preferência | Pending |
| FE-01 | P2 frontend consome API | Pending |

## Success Criteria
- [ ] `GET /guides` público retorna 3+ receitas; CRUD autenticado com 401/403 corretos.
- [ ] Login email/senha + Google funciona; `GET /me` retorna perfil.
- [ ] Frontend sem import de `RECIPES` estático; `/guides` e `/extract` via HTTP.
