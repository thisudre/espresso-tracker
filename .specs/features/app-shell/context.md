# App Shell - User Decisions (Context)

Data de captura: 2026-08-05
Fase: Specify (discuss gray areas)

---

## D1: Estrutura de navegação

**Decisão:** Home/dashboard + 3 seções (Grãos, Extrair, Histórico).
**Detalhes:** Rota raiz `''` mostra o dashboard com resumo; rotas `/beans`, `/extract` e `/logs`; página 404 amigável.
**Impacto:** Dashboard precisa de dados agregados (contagem de grãos abertos, últimos logs) que vêm dos stores — estende o escopo da M1 além de simples redirecionamento.

## D2: Persistência no primeiro uso

**Decisão:** Começar vazio (sem dados de exemplo).
**Detalhes:** Sem seed. Dashboard exibe estado vazio nos cards.
**Impacto:** Requisito de estado vazio no dashboard (edge case) e aceitação de "nenhum grão registrado".

## D3: Contrato do StorageService

**Decisão:** Serviço genérico com schema versionado.
**Detalhes:** Métodos `get<T>(key)`, `set<T>(key, value)`, `remove(key)`; payloads de domínio com campo `version`; leitura de versão incompatível ou JSON corrompido retorna `null` sem crash. Pronto para migração futura para API/Firebase.
**Impacto:** Toda persistência de domínio passa por este serviço; stores delegam a ele, nunca acessam LocalStorage diretamente.

## D4: Verificação da M1

**Decisão:** Unit tests de services (storage + stores) com o runner de testes do Angular.
**Detalhes:** Verificação automatizada dos services; o framework de testes concreto será definido na execução (Jasmine/Karma ou alternativas compatíveis com Angular 21).
**Impacto:** Acceptance criteria SHELL-05..14 são verificáveis por teste unitário; demais por navegação manual.

---

## Gray areas ainda em aberto

- Nenhum. As 4 áreas cinza foram resolvidas nesta sessão.
