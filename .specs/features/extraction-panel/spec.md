# Extraction Panel Specification

## Problem Statement

O usuário na bancada usa calculadora e cronômetro externos para preparar café — calcula a água pela proporção e marca tempos de pré-infusão e extração em apps genéricos, sem relação com os métodos que usa. A M3 entrega um painel de extração em tempo real: seletor de método com ratio preset, calculadora reativa de água sugerida (pó → água) e cronômetro com fases de pré-infusão/extração, construído sobre a infra da M1/M2 (storage, signals, shell).

## Goals

- [ ] Usuário escolhe o método e obtém a proporção água/café sugerida sem calculadora externa — medido por água sugerida correta (dose × ratio) e atualizada em tempo real.
- [ ] Usuário cronometra a extração com fases de pré-infusão e extração sem app externo — medido por cronômetro com controle de fase, pausa/reset e display de tempo total.
- [ ] Estado final do brew (pó, água, ratio, tempo) fica acessível para a M4 (Brew Logs) consumir quando existir.

## Out of Scope

| Feature                                  | Reason                                              |
| ---------------------------------------- | --------------------------------------------------- |
| Salvar logs / registro de xícaras        | Feature M4 especificada em separado                 |
| Atalho "enviar para histórico" na UI     | Requer M4; decisão D-EXTR-05 (nada salvo na M3)     |
| Persistência de presets customizados     | Presets fixos na v1 (decisão D-EXTR-01)             |
| Cronômetro contínuo em background        | Decisão D-EXTR-03: reinicia ao sair da rota         |
| Campos de receita (moagem, temperatura)  | Pertencem à M4 (Brew Logs)                          |
| Vários brews simultâneos                 | Não listado no escopo v1                            |
| Feedback sonoro / notificações           | Não listado no escopo v1                            |
| Fórmula "água → pó" (direção reversa)    | Decisão D-EXTR-02: só pó → água na v1               |

---

## User Stories

### P1: Seletor de Método com Ratio Preset ⭐ MVP

**User Story**: Como usuário, quero escolher o método de preparo e ver a proporção sugerida para ele, para começar a extração já com o parâmetro certo sem lembrar de cabeça.

**Why P1**: É a entrada do fluxo; sem método não há ratio nem contexto de extração.

**Acceptance Criteria**:

1. WHEN o painel carrega THEN o sistema SHALL apresentar os 4 métodos (Espresso, Prensa Francesa, Coado/V60, Aeropress) como chips horizontais, com um selecionado por padrão.
2. WHEN um método é selecionado THEN o sistema SHALL aplicar o ratio preset do método (Espresso 1:2, V60 1:16, Prensa 1:15, Aeropress 1:15).
3. WHEN o usuário toca em outro chip THEN o sistema SHALL trocar o método e aplicar o preset do novo método.
4. WHEN o usuário edita o ratio THEN o sistema SHALL usar o valor editado no cálculo até a próxima troca de método.
5. WHEN o usuário troca de método com uma dose já preenchida THEN o sistema SHALL manter a dose e recalcular a água com o novo ratio.

**Independent Test**: Trocar entre os 4 chips e conferir o ratio preset aplicado; editar o ratio e trocar de método para ver o reset ao preset.

---

### P1: Calculadora de Ratio (pó → água) ⭐ MVP

**User Story**: Como usuário, quero digitar a dose de pó e ver imediatamente a água sugerida para o ratio do método, para acertar a proporção sem conta mental.

**Why P1**: É o valor central da M3 (PROJECT.md goal 2) — cálculo automático de brew ratio.

**Acceptance Criteria**:

1. WHEN o usuário digita uma dose maior que zero THEN o sistema SHALL calcular a água sugerida como `dose × ratio` e exibi-la em gramas.
2. WHEN a água sugerida é calculada THEN o sistema SHALL arredondar para o grama inteiro mais próximo.
3. WHEN a água é exibida THEN o sistema SHALL apresentá-la em um readout destacado com rótulo de unidade (g).
4. WHEN o usuário muda a dose OU o ratio THEN o sistema SHALL atualizar a água sugerida em tempo real.
5. WHEN a dose está vazia ou é zero THEN o sistema SHALL não exibir sugestão de água (placeholder vazio).
6. WHEN a dose é inválida (não numérica ou negativa) THEN o sistema SHALL ignorar o valor no cálculo sem quebrar a tela.

**Independent Test**: Digitar dose 15g com V60 (1:16) → 240g; trocar para 16g → 256g; editar ratio para 1:17 → 272g; zerar a dose → sem sugestão.

---

### P1: Cronômetro com Fases de Pré-infusão/Extração ⭐ MVP

**User Story**: Como usuário na bancada, quero cronometrar a extração em fases (pré-infusão e extração) com pausa e reset, para seguir a receita no ritmo certo.

**Why P1**: É o segundo valor central da M3 (PROJECT.md goal 2) — cronômetro com fases em tempo real.

**Acceptance Criteria**:

1. WHEN o usuário toca Start THEN o sistema SHALL iniciar o cronômetro na fase de pré-infusão e exibir o tempo da fase atual e o total acumulado.
2. WHEN o usuário toca Pause THEN o sistema SHALL congelar o tempo mantendo os valores da fase e do total.
3. WHEN o usuário toca Reset THEN o sistema SHALL zerar o cronômetro e retornar à fase de pré-infusão.
4. WHEN o usuário toca para avançar de fase THEN o sistema SHALL passar da pré-infusão para a extração mantendo o total acumulado e zerando o contador da fase.
5. WHEN o cronômetro roda THEN o sistema SHALL exibir o tempo no formato mm:ss.
6. WHEN a fase de pré-infusão está ativa THEN o display da fase SHALL indicar "Pré-infusão" e, na extração, "Extração".
7. WHEN o usuário sai da rota `/extract` com o cronômetro rodando THEN o sistema SHALL reiniciar o cronômetro (perde-se o brew em andamento).
8. WHEN o usuário edita dose/ratio com o cronômetro rodando THEN o sistema SHALL manter o cronômetro inalterado e continuar recalculando a água.

**Independent Test**: Start → pré-infusão marca; avançar fase → extração reinicia a fase mas total continua; Pause congela; Reset zera e volta à pré-infusão; navegar para outra rota e voltar → cronômetro zerado.

---

### P2: Estado Final Exposto para Brew Logs (M4)

**User Story**: Como desenvolvedor, quero que o painel exponha o estado final do brew (método, dose, ratio, água sugerida, tempos) em um estado consumível, para que a M4 construa logs sem refazer cálculos.

**Why P2**: Não é visível ao usuário na M3, mas evita retrabalho na M4 (decisão D-EXTR-05).

**Acceptance Criteria**:

1. WHEN o painel está em uso THEN o sistema SHALL manter um estado derivado (`computed`) com método, dose, ratio, água sugerida, fase atual, tempo da fase e tempo total.
2. WHEN os inputs mudam THEN o estado derivado SHALL refletir os últimos valores sem ação extra do usuário.
3. WHEN não há brew ativo THEN o estado derivado SHALL expor tempo zero e fase pré-infusão, sem erro.

**Independent Test**: Unit test do store verificando que o estado derivado reflete mudanças de método, dose e cronômetro.

---

## Edge Cases

- WHEN a dose é 0 ou vazia THEN o readout de água SHALL ficar sem sugestão (sem quebrar).
- WHEN o ratio editado é vazio, zero ou negativo THEN o sistema SHALL não exibir sugestão de água até ser corrigido.
- WHEN o usuário troca de método com brew ativo THEN o cronômetro SHALL permanecer inalterado (independência entre método e timer).
- WHEN o usuário edita o ratio durante a extração THEN a água sugerida SHALL recalcular sem afetar o cronômetro.
- WHEN a viewport é móvel (≤ 480px) THEN a tela SHALL ser utilizável sem scroll horizontal (chips roláveis verticalmente estáveis).
- WHEN o timer é pausado e o usuário sai da rota THEN ao voltar o cronômetro SHALL estar zerado (perda intencional, decisão D-EXTR-03).
- WHEN o usuário avança da pré-infusão para extração THEN o total acumulado SHALL incluir o tempo já gasto na pré-infusão.

---

## Requirement Traceability

| Requirement ID | Story                          | Phase  | Status  |
| -------------- | ------------------------------ | ------ | ------- |
| EXTRACT-01     | P1: Seletor de Método          | Design | Pending |
| EXTRACT-02     | P1: Seletor de Método          | Design | Pending |
| EXTRACT-03     | P1: Seletor de Método          | Design | Pending |
| EXTRACT-04     | P1: Seletor de Método          | Design | Pending |
| EXTRACT-05     | P1: Seletor de Método          | Design | Pending |
| EXTRACT-06     | P1: Calculadora de Ratio       | Design | Pending |
| EXTRACT-07     | P1: Calculadora de Ratio       | Design | Pending |
| EXTRACT-08     | P1: Calculadora de Ratio       | Design | Pending |
| EXTRACT-09     | P1: Calculadora de Ratio       | Design | Pending |
| EXTRACT-10     | P1: Calculadora de Ratio       | Design | Pending |
| EXTRACT-11     | P1: Calculadora de Ratio       | Design | Pending |
| EXTRACT-12     | P1: Cronômetro com Fases       | Design | Pending |
| EXTRACT-13     | P1: Cronômetro com Fases       | Design | Pending |
| EXTRACT-14     | P1: Cronômetro com Fases       | Design | Pending |
| EXTRACT-15     | P1: Cronômetro com Fases       | Design | Pending |
| EXTRACT-16     | P1: Cronômetro com Fases       | Design | Pending |
| EXTRACT-17     | P1: Cronômetro com Fases       | Design | Pending |
| EXTRACT-18     | P1: Cronômetro com Fases       | Design | Pending |
| EXTRACT-19     | P1: Cronômetro com Fases       | Design | Pending |
| EXTRACT-20     | P2: Estado Final p/ M4         | Design | Pending |
| EXTRACT-21     | P2: Estado Final p/ M4         | Design | Pending |
| EXTRACT-22     | P2: Estado Final p/ M4         | Design | Pending |

**Coverage:** 22 total, 0 mapped to tasks, 22 unmapped ⚠️

---

## Success Criteria

- [ ] Fluxo completo demo-ável: escolher método, ver ratio preset, digitar dose, ver água sugerida, cronometrar com fases, pausar/reset — sem app externo.
- [ ] 100% dos requisitos EXTRACT-01..22 mapeados e verificados.
- [ ] Suíte de testes unitários dos services (cálculo de ratio + lógica do cronômetro) verde.
- [ ] Tela utilizável em viewport móvel (≤ 480px) sem scroll horizontal.
