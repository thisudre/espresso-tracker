# Espresso & Bean Tracker

**Vision:** Aplicação web reativa para entusiastas de café especial registrarem, acompanharem e aprimorarem suas extrações (espressos e filtrados) e o histórico dos grãos utilizados.
**For:** Entusiastas de café especial que preparam em casa e querem consistência e evolução nas receitas.
**Solves:** Falta de rastreabilidade dos grãos e de método na otimização de receitas — o usuário não sabe o que funcionou e o que não funcionou na xícara.

## Goals

- [ ] Permitir catalogar grãos (origem, torra, notas) e saber visualmente o estado de cada pacote — medido por cadastro completo + indicador de degass window funcional.
- [ ] Auxiliar extrações em tempo real com cronômetro e cálculo automático de brew ratio — medido por extrações registradas usando o painel sem calculadora externa.
- [ ] Acumular histórico sensorial por xícara que identifique parâmetros ideais — medido por logs com avaliação sensorial salvos e consultáveis.

## Tech Stack

**Core:**

- Framework: Angular 21 (Standalone Components, sem NgModules)
- Language: TypeScript
- Database: LocalStorage (migração futura para API/Firebase)
- Estado: Signals (`signal()`, `computed()`, `effect()`)

**Key dependencies:**

- Angular Router (rotas standalone)
- Angular Reactive Forms (AD-009)
- CSS responsivo (mobile-first, sem framework UI obrigatório)

## Scope

**v1 includes (30 dias):**

- Gestão de inventário de grãos (CRUD, status do pacote, degass window)
- Painel de extração (timer com fases + calculadora de ratio)
- Registro de xícaras (brew logs com avaliação sensorial)

**Explicitly out of scope:**

- Backend/API real (apenas LocalStorage na v1)
- Autenticação / multi-usuário / nuvem
- Import/export de dados
- Receitas compartilhadas ou comunidade
- Integração com balanças/cafeteiras (Bluetooth, etc.)

## Constraints

- Timeline: 30 dias para escopo v1
- Technical: 100% Signals, Standalone Components, `@if`/`@for`/`@switch`
- Resources: projeto local, sem time de backend
