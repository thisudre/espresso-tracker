# App Shell + Infrastructure Specification

## Problem Statement

O projeto está no papel (PROJECT.md/ROADMAP.md) mas não existe código. Antes de qualquer feature de domínio (Bean Inventory, Extraction Panel, Brew Logs), precisamos de uma base Angular 21 standalone funcional com persistência LocalStorage isolada, estado reativo com Signals e um shell de navegação responsivo mobile-first que abrigue as 3 seções do produto.

## Goals

- [ ] Projeto Angular 21 (Standalone Components, sem NgModules) compila e roda localmente com roteamento.
- [ ] StorageService genérico sobre LocalStorage com schema versionado, pronto para migração futura para API/Firebase.
- [ ] Estado global com Signals consumível pelos 3 módulos futuros.
- [ ] Layout responsivo mobile-first com Home/dashboard e navegação para as 3 seções.

## Out of Scope

| Feature                          | Reason                                         |
| -------------------------------- | ---------------------------------------------- |
| Backend/API real / Firebase      | Decisão AD-001: v1 é 100% LocalStorage          |
| Autenticação / multi-usuário     | Fora do escopo v1 (PROJECT.md)                 |
| Implementação de CRUD de domínio | Features M2/M3/M4 especificadas em separado    |
| PWA / offline-first / service worker | Não listado no escopo v1                    |
| Biblioteca de UI / componentes prontos | Estilo próprio CSS responsivo, mobile-first |

---

## User Stories

### P1: App Bootstrapped - Angular 21 Standalone ⭐ MVP

**User Story**: Como desenvolvedor, quero um projeto Angular 21 limpo com Standalone Components e sem NgModules, para que a base esteja alinhada ao padrão técnico decidido (AD-002).

**Why P1**: Tudo depende do projeto existir com o padrão correto.

**Acceptance Criteria**:

1. WHEN o servidor de desenvolvimento roda THEN a aplicação SHALL responder na raiz com a página inicial carregada.
2. WHEN inspeciono o código THEN a aplicação SHALL usar apenas Standalone Components (`standalone: true` / componente standalone).
3. WHEN busco por `NgModule` THEN o código-fonte da aplicação SHALL não conter NgModules declarados.
4. WHEN a aplicação inicia THEN não SHALL haver erros de console no carregamento inicial.

**Independent Test**: `ng serve` → abrir a raiz no navegador → ver o shell renderizado e console limpo.

---

### P1: Storage Service Genérico com Schema Versionado ⭐ MVP

**User Story**: Como desenvolvedor, quero um serviço de storage que encapsule LocalStorage com acesso genérico e schema versionado, para que os módulos de domínio persistam dados sem acoplar à implementação de storage.

**Why P1**: Isolar o storage é pré-requisito do AD-001 (migração futura para API/Firebase).

**Acceptance Criteria**:

1. WHEN qualquer parte da app chama `storage.get<T>(key)` THEN o serviço SHALL retornar o dado tipado, ou `null` quando não existir.
2. WHEN qualquer parte da app chama `storage.set<T>(key, value)` THEN o serviço SHALL gravar o valor em LocalStorage serializado em JSON.
3. WHEN a app persiste dados de domínio THEN o payload armazenado SHALL conter um campo `version` indicando a versão do schema.
4. WHEN a app lê um schema com versão diferente da atual THEN o serviço SHALL retornar `null` sem quebrar a aplicação (dados não migrados ficam indisponíveis).
5. WHEN `storage.remove(key)` é chamado THEN o serviço SHALL apagar a chave do LocalStorage.
6. WHEN dados corrompidos (JSON inválido) são encontrados para uma chave THEN o serviço SHALL retornar `null` e não lançar exceção ao consumidor.

**Independent Test**: Teste unitário do StorageService usando LocalStorage fake/real: set → get, versão incompatível → null, JSON corrompido → null.

---

### P1: Estado Global com Signals ⭐ MVP

**User Story**: Como desenvolvedor, quero um estado global reativo baseado em Signals que as features M2/M3/M4 possam consumir, para garantir o padrão de reatividade 100% Signals do projeto.

**Why P1**: É o padrão técnico central (AD-002); as features seguintes serão construídas sobre ele.

**Acceptance Criteria**:

1. WHEN um módulo de domínio precisa de estado THEN ele SHALL expor `signal()`/`computed()` e atualizações via `signal.set`/`update`.
2. WHEN estado é derivado de outro estado THEN a derivação SHALL ser feita com `computed()` (ex: contagem de grãos abertos no dashboard).
3. WHEN algo observa mudança de estado (ex: timer) THEN o efeito colateral SHALL ser registrado com `effect()` quando necessário.
4. WHEN um store de domínio precisa ler/escrever persistência THEN ele SHALL delegar ao StorageService, nunca acessando LocalStorage diretamente.

**Independent Test**: Unit test de um store de exemplo (ex: BeanStore stub) verificando `set`/`update`/`computed` e a delegação ao storage.

---

### P1: Shell Responsivo com Home + 3 Seções ⭐ MVP

**User Story**: Como usuário no celular na bancada do café, quero navegar facilmente entre o dashboard e as seções de Grãos, Extração e Histórico, para usar a app com uma mão.

**Why P1**: É a estrutura de navegação que as demais features habitam.

**Acceptance Criteria**:

1. WHEN a app abre na raiz THEN o usuário SHALL ver a Home/dashboard (rota `''` redirecionando ou renderizando o dashboard).
2. WHEN o usuário navega THEN a app SHALL ter rotas para `/beans`, `/extract` e `/logs` (rotas placeholder renderizando título de seção).
3. WHEN o usuário acessa uma rota inexistente THEN a app SHALL mostrar uma página 404 amigável com link de volta à Home.
4. WHEN visualizado em viewport móvel (≤ 480px) THEN a navegação SHALL estar acessível via bottom nav fixa.
5. WHEN visualizado em viewport desktop THEN a navegação SHALL ser visível sem scroll e o layout SHALL manter-se utilizável.
6. WHEN a Home renderiza THEN ela SHALL exibir: contagem de grãos abertos, últimas extrações registradas e atalhos para as 3 seções (com dados zerados/vazios no M1).

**Independent Test**: Navegar no navegador por todas as rotas + redimensionar viewport (mobile ↔ desktop) verificando bottom nav/layout + acessar rota inválida e ver o 404.

---

## Edge Cases

- WHEN o LocalStorage está indisponível (bloqueado pelo browser) THEN o StorageService SHALL não lançar na inicialização da app e os consumidores SHALL receber `null`/estado vazio.
- WHEN uma chave do schema sobe de versão THEN leituras antigas SHALL retornar `null` (sem crash) até existir migração.
- WHEN a navegação é iniciada por deep link em rota inválida THEN o shell SHALL exibir o 404 em vez de tela em branco.
- WHEN o dashboard não tem dados THEN os cards SHALL exibir estado vazio ("nenhum grão registrado") sem erro.
- WHEN há dados corrompidos em qualquer chave THEN a app SHALL continuar funcionando para as demais chaves.

---

## Requirement Traceability

| Requirement ID | Story                     | Phase  | Status  |
| -------------- | ------------------------- | ------ | ------- |
| SHELL-01       | P1: App Bootstrapped      | Design | Pending |
| SHELL-02       | P1: App Bootstrapped      | Design | Pending |
| SHELL-03       | P1: App Bootstrapped      | Design | Pending |
| SHELL-04       | P1: App Bootstrapped      | Design | Pending |
| SHELL-05       | P1: Storage Service       | Design | Pending |
| SHELL-06       | P1: Storage Service       | Design | Pending |
| SHELL-07       | P1: Storage Service       | Design | Pending |
| SHELL-08       | P1: Storage Service       | Design | Pending |
| SHELL-09       | P1: Storage Service       | Design | Pending |
| SHELL-10       | P1: Storage Service       | Design | Pending |
| SHELL-11       | P1: Estado Global         | Design | Pending |
| SHELL-12       | P1: Estado Global         | Design | Pending |
| SHELL-13       | P1: Estado Global         | Design | Pending |
| SHELL-14       | P1: Estado Global         | Design | Pending |
| SHELL-15       | P1: Shell Responsivo      | Design | Pending |
| SHELL-16       | P1: Shell Responsivo      | Design | Pending |
| SHELL-17       | P1: Shell Responsivo      | Design | Pending |
| SHELL-18       | P1: Shell Responsivo      | Design | Pending |
| SHELL-19       | P1: Shell Responsivo      | Design | Pending |
| SHELL-20       | P1: Shell Responsivo      | Design | Pending |

**Coverage:** 20 total, 0 mapped to tasks, 20 unmapped ⚠️

---

## Success Criteria

- [ ] `ng serve` + `ng build` passam sem erros no CI local.
- [ ] 100% dos requisitos SHELL-01..20 mapeados e verificados.
- [ ] Suíte de testes unitários dos services (storage + store) verde.
- [ ] Navegação manual pelas 4 telas (Home, Grãos, Extrair, Histórico) + 404 funciona em mobile e desktop.
