# Guias de Extração — Specification

**Milestone:** M6 (pós-v1)
**Status:** Specified

## Problem Statement

O usuário conhece os métodos, mas precisa lembrar de cabeça (ou consultar fora do app) os passos, volumes de água e tempos de uma receita de preparo. Sem receita guiada, cada extração varia e o painel M3 (timer de 2 fases + calculadora) não ajuda a seguir uma sequência específica. A M6 entrega **guias de extração**: receitas passo a passo por método, com fases (bloom, vertida, finalização), volume acumulado de água e meta de tempo cumulativa por fase — consultáveis na biblioteca e capazes de dirigir o cronômetro do painel `/extract`.

## Goals

- [ ] Usuário consulta a receita certa para o método e segue o passo a passo com volumes de água e tempos precisos, sem consulta externa — medido por guia com fases, volumes e metas corretos na biblioteca `/guides`.
- [ ] Receita selecionada dirige o cronômetro do painel, com metas cumulativas e avanço automático/manual — medido por cronômetro em modo receita seguindo as fases e metas da receita.
- [ ] Volumes das fases seguem o total de água sugerida (dose × ratio) — medido por última fase igual ao total sugerido, proporções da receita mantidas, tempos fixos.
- [ ] Preferência de receita sobrevive entre visitas ao painel — medido por receita restaurada ao reabrir `/extract`.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Receitas editáveis pelo usuário (criar/editar/excluir) | Receitas são conteúdo estático embutido na v1 (D-GUIDE-10) |
| Receitas para outros métodos (espresso, prensa, aeropress) | Conteúdo v1 só Coado/V60; modelo de dados extensível (D-GUIDE-02) |
| Chemex como novo método | Não existe no app (métodos: espresso, v60, prensa, aeropress) |
| Cronômetro embutido na biblioteca `/guides` | Biblioteca é consulta passiva (D-GUIDE-09) |
| Exibição de ratio no guia | Decisão D-GUIDE-03: só volumes em gramas por fase |
| Persistência da dose do painel | Dose segue transiente como na M3 (D-EXTR-05) |
| Notificações/feedback sonoro ao fim de fase | Fora do escopo v1 |
| Histórico/estatísticas por receita | Não listado no escopo v1 |
| Compartilhamento de receitas | Não listado no escopo v1 |

---

## User Stories

### P1: Biblioteca de Guias — lista e detalhe (`/guides`) ⭐ MVP

**User Story**: Como usuário, quero consultar as receitas de preparo por método e ver o passo a passo de fases com volumes e tempos, para seguir uma receita consistente sem anotações externas.

**Why P1**: É o conteúdo central da feature — a receita passo a passo é o que o usuário consulta e o que alimenta o painel.

**Acceptance Criteria**:

1. WHEN o usuário abre `/guides` THEN o sistema SHALL listar as receitas do método Coado/V60 (Equilibrada, Intensa, Suave) em cards com nome, foco, dica de moagem e tempo total estimado.
2. WHEN o usuário toca em uma receita THEN o sistema SHALL exibir o detalhe com as fases em ordem (nome, volume acumulado de água, tempo cumulativo e descrição).
3. WHEN o detalhe exibe um volume de fase THEN o sistema SHALL apresentá-lo como **total acumulado** ao fim da fase (ex.: 40g → 160g → 300g).
4. WHEN uma fase não adiciona água (ex.: decantação) THEN o sistema SHALL exibir o volume acumulado da fase anterior, sem fase com volume vazio.

**Independent Test**: Abrir `/guides`, ver os 3 cards; abrir a Equilibrada e conferir as fases 40g/30s → 160g/1m15s → 300g/2m30s; abrir a Intensa e conferir a decantação exibindo 300g (acumulado).

---

### P1: Acesso à biblioteca pelo painel ⭐ MVP

**User Story**: Como usuário na bancada, quero abrir a biblioteca de guias a partir do painel de extração, para consultar a receita sem sair do fluxo.

**Why P1**: Liga o conteúdo (biblioteca) ao contexto de uso (painel) — a receita consultada é a mesma que dirige o cronômetro.

**Acceptance Criteria**:

1. WHEN o painel `/extract` está aberto THEN o sistema SHALL exibir um atalho "Guias" para a biblioteca.
2. WHEN o usuário toca no atalho THEN o sistema SHALL navegar para `/guides` preservando o estado do painel (método, dose, receita selecionada).

**Independent Test**: Abrir `/extract`, tocar no atalho, ver a biblioteca; voltar ao painel com o estado preservado.

---

### P1: Receita dirige o cronômetro ⭐ MVP

**User Story**: Como usuário na bancada, quero que o cronômetro do painel use as fases da receita selecionada com metas de tempo, para ser guiado etapa por etapa sem olhar a receita no papel.

**Why P1**: É o valor central da feature integrada ao painel (D-GUIDE-08) — o cronômetro da M3 vira o guia em tempo real.

**Acceptance Criteria**:

1. WHEN o usuário seleciona uma receita no painel com método V60 THEN o sistema SHALL configurar o cronômetro com as fases da receita (3 na Equilibrada/Intensa, 4 na Suave), iniciando na primeira fase.
2. WHEN o cronômetro roda em modo receita THEN o sistema SHALL exibir a fase atual (nome), o tempo decorrido cumulativo (mm:ss) e a meta de tempo da fase.
3. WHEN o tempo decorrido atinge a meta da fase atual THEN o sistema SHALL avançar automaticamente para a próxima fase, preservando o total acumulado.
4. WHEN o usuário toca "Avançar fase" THEN o sistema SHALL avançar manualmente para a próxima fase (mesmo antes da meta), preservando o total acumulado.
5. WHEN a última fase é concluída (meta atingida ou avanço manual) THEN o sistema SHALL marcar a extração como concluída e parar o avanço automático.
6. WHEN o usuário toca Pause ou Reset no modo receita THEN o sistema SHALL congelar o tempo (Pause) ou zerar e voltar à primeira fase (Reset), como no modo simples.
7. WHEN o usuário troca a dose com o cronômetro rodando em modo receita THEN o sistema SHALL recalcular os volumes das fases sem afetar o cronômetro.

**Independent Test**: Selecionar a Suave, Start, ver "Pré-infusão (Bloom)" com meta 0:30; aos 30s avançar sozinho para "1ª Vertida" com meta 1:00; avançar manualmente antes da meta e ver a "2ª Vertida"; concluir a última fase e ver o estado de conclusão.

---

### P1: Modo simples (2 fases) ⭐ MVP

**User Story**: Como usuário, quero voltar ao cronômetro de 2 fases (pré-infusão/extração) quando não quero seguir uma receita, para usar o painel como na M3.

**Why P1**: Preserva o comportamento existente e dá saída do modo receita (D-GUIDE-08).

**Acceptance Criteria**:

1. WHEN o usuário toca "Modo simples" com uma receita ativa THEN o sistema SHALL remover a seleção de receita, resetar o cronômetro e voltar às 2 fases padrão (pré-infusão/extração).
2. WHEN o painel abre sem receita selecionada THEN o sistema SHALL usar o cronômetro de 2 fases padrão da M3.

**Independent Test**: Com a Suave ativa, tocar "Modo simples" e ver o cronômetro voltar a Pré-infusão/Extração zerado; recarregar o painel sem preferência e ver o mesmo.

---

### P1: Escala de volumes pelo total de água ⭐ MVP

**User Story**: Como usuário, quero que os volumes das fases acompanhem o total de água sugerido (dose × ratio), para usar a mesma receita com diferentes quantidades e razões.

**Why P1**: As receitas são definidas para 20g/300g; sem acompanhar o total sugerido, o guia diverge da calculadora do painel (D-GUIDE-03/06).

**Acceptance Criteria**:

1. WHEN o usuário informa dose e ratio válidos no painel OU no detalhe da biblioteca THEN o sistema SHALL calcular cada volume como porcentagem do total sugerido (`round(volumeBase × totalSugerido / totalBase)`), mantendo as proporções da receita e os tempos inalterados.
2. WHEN dose e ratio são os da base da receita (20g / 1:15, total 300g) THEN o sistema SHALL exibir os volumes originais da receita.
3. WHEN a dose ou o ratio é inválido (vazio, zero, negativo ou não numérico) THEN o sistema SHALL exibir os volumes da receita base sem quebrar a tela.
4. WHEN o volume calculado não é inteiro THEN o sistema SHALL arredondá-lo ao grama inteiro mais próximo.
5. WHEN a última fase é calculada THEN o sistema SHALL exibi-la igual ao total de água sugerido.

**Independent Test**: No painel, dose 25g + ratio 16 (total 400g) com a Equilibrada → fases 53g → 213g → 400g (40×400/300=53, 160×400/300=213, 300×400/300=400); na biblioteca, dose inválida → volumes de 20g/1:15.

---

### P2: Preferência de receita persistida

**User Story**: Como usuário, quero que o painel lembre a receita que costumo usar, para não selecioná-la toda vez.

**Why P2**: Melhora o fluxo recorrente sem ser necessário para a v1 funcionar; decisão do usuário (D-GUIDE-11).

**Acceptance Criteria**:

1. WHEN o usuário seleciona uma receita no painel THEN o sistema SHALL persistir o id da receita como preferência.
2. WHEN o usuário abre `/extract` e existe uma preferência de receita válida THEN o sistema SHALL restaurar a receita selecionada com o cronômetro zerado na primeira fase.
3. WHEN a preferência é inválida, de método incompatível ou inexistente THEN o sistema SHALL abrir sem receita (modo simples) sem erro.
4. WHEN o usuário toca "Modo simples" THEN o sistema SHALL limpar a preferência de receita persistida.

**Independent Test**: Selecionar a Intensa, sair de `/extract`, voltar e ver a Intensa restaurada (timer zerado); corromper a preferência no LocalStorage e ver o painel abrir sem receita.

---

### P2: Troca de método desfaz a receita

**User Story**: Como usuário, quero que trocar de método desative a receita, pois as receitas são por método.

**Why P2**: Consistência — a receita ativa só faz sentido no método dela (D-GUIDE-11).

**Acceptance Criteria**:

1. WHEN o usuário troca o método para um sem receitas (espresso, prensa, aeropress) com receita ativa THEN o sistema SHALL desativar a receita para a sessão (cronômetro volta às 2 fases), preservando a preferência do V60.
2. WHEN o usuário volta ao método V60 com preferência de receita salva THEN o sistema SHALL restaurar a receita da preferência.

**Independent Test**: Com a Suave ativa no V60, trocar para Espresso → timer de 2 fases; voltar ao V60 → Suave restaurada.

---

## Data Model (referência para design)

```typescript
type GuideMethod = 'v60' // extensível a outros métodos na v2

interface RecipePhase {
  nome: string            // ex.: 'Pré-infusão (Bloom)'
  tempoObjetivo: number   // segundos — tempo decorrido CUMULATIVO ao fim da fase (D-GUIDE-05)
  volumeAgua: number      // gramas — total ACUMULADO ao fim da fase; sempre presente, sem vertida repete o anterior (D-GUIDE-04)
  descricao: string       // instrução técnica, ex.: 'Despeje a água em círculos suaves'
}

interface ExtractionRecipe {
  id: string              // ex.: 'v60-equilibrada'
  method: GuideMethod     // 'v60'
  nome: string            // ex.: 'Equilibrada'
  foco: string            // ex.: 'Doçura e corpo médio'
  moagem: string          // dica de moagem (texto livre)
  baseDose: number        // 20g — base de escala dos volumes (D-GUIDE-06)
  tempoTotalEstimado: number // segundos — tempo total esperado da receita
  fases: RecipePhase[]    // em ordem de execução
}
```

**Escala:** `volumeExibido = round(volumeAcumulado × totalSugerido / totalBase)`; `totalSugerido = dose × ratio`; `totalBase` = volume da última fase (300g); tempos sempre fixos.

### Conteúdo v1 (Coado/V60, base 20g / 300g)

| Receita | Foco | Moagem | Fases (nome · tempo cumulativo · volume acumulado) | Total |
| ------- | ---- | ------ | ------------------------------------------------- | ----- |
| **Equilibrada** | Doçura e corpo médio | padrão | 1. Pré-infusão (Bloom) · 30s · 40g — "Despeje 40g de água em círculos suaves e aguarde 30s." · 2. Vertida Principal · 1m15s · 160g — "Adicione água até 160g e aguarde até 1m15s." · 3. Finalização · 2m30s · 300g — "Adicione até 300g e aguarde a extração terminar." | ~2m30s |
| **Intensa** | Acidez e brilho | levemente mais fina | 1. Pré-infusão (Bloom) · 40s · 50g — "Despeje 50g de água e aguarde 40s." · 2. Vertida única · 1m30s · 300g — "Adicione o restante da água (até 300g) de forma constante e circular até 1m30s." · 3. Decantação · 2m05s · 300g — "Deixe fluir até finalizar." | ~2m05s |
| **Suave** | Doçura prolongada | um pouco mais grossa | 1. Pré-infusão (Bloom) · 30s · 40g — "Despeje 40g de água e aguarde 30s." · 2. 1ª Vertida · 1m00s · 150g — "Adicione até 150g e aguarde 30s." · 3. 2ª Vertida · 1m30s · 225g — "Adicione até 225g e aguarde 30s." · 4. Finalização · 3m00s · 300g — "Adicione até 300g e aguarde a extração terminar." | ~3m00s |

---

## Edge Cases

- WHEN a preferência de receita está corrompida ou com versão incompatível no LocalStorage THEN o sistema SHALL abrir sem receita (modo simples), sem crash (StorageService retorna `null`).
- WHEN o usuário avança manualmente na última fase antes da meta THEN o sistema SHALL marcar como concluída e parar o avanço automático.
- WHEN o usuário seleciona uma receita com o cronômetro rodando THEN o sistema SHALL resetar o cronômetro e iniciar na primeira fase da receita.
- WHEN o usuário sai da rota `/extract` com o cronômetro em modo receita THEN o sistema SHALL resetar o cronômetro (comportamento M3, D-EXTR-03); a preferência de receita permanece.
- WHEN o método atual não é V60 THEN o atalho "Guias" do painel SHALL continuar disponível (a biblioteca só contém Coado/V60 na v1).
- WHEN o volume escalado é arredondado THEN a soma dos incrementos entre fases pode divergir da última fase em 1g — aceito (cada fase é exibida como acumulado arredondado).
- WHEN a viewport é móvel (≤ 480px) THEN a biblioteca e o guia SHALL ser utilizáveis sem scroll horizontal (fases em ordem vertical legível).
- WHEN o contrato `BrewState` da M4 é consumido com o timer em modo receita THEN a fase atual SHALL expor o nome da fase da receita sem quebrar os logs (logs só registram tempo total).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| GUIDE-01 | P1: Biblioteca — lista e detalhe | Specified | Pending |
| GUIDE-02 | P1: Biblioteca — lista e detalhe | Specified | Pending |
| GUIDE-03 | P1: Biblioteca — lista e detalhe | Specified | Pending |
| GUIDE-04 | P1: Biblioteca — lista e detalhe | Specified | Pending |
| GUIDE-05 | P1: Acesso pela painel | Specified | Pending |
| GUIDE-06 | P1: Acesso pela painel | Specified | Pending |
| GUIDE-07 | P1: Receita dirige o cronômetro | Specified | Pending |
| GUIDE-08 | P1: Receita dirige o cronômetro | Specified | Pending |
| GUIDE-09 | P1: Receita dirige o cronômetro | Specified | Pending |
| GUIDE-10 | P1: Receita dirige o cronômetro | Specified | Pending |
| GUIDE-11 | P1: Receita dirige o cronômetro | Specified | Pending |
| GUIDE-12 | P1: Receita dirige o cronômetro | Specified | Pending |
| GUIDE-13 | P1: Receita dirige o cronômetro | Specified | Pending |
| GUIDE-14 | P1: Modo simples | Specified | Pending |
| GUIDE-15 | P1: Modo simples | Specified | Pending |
| GUIDE-16 | P1: Escala de volumes | Specified | Pending |
| GUIDE-17 | P1: Escala de volumes | Specified | Pending |
| GUIDE-18 | P1: Escala de volumes | Specified | Pending |
| GUIDE-19 | P1: Escala de volumes | Specified | Pending |
| GUIDE-20 | P2: Preferência persistida | Specified | Pending |
| GUIDE-21 | P2: Preferência persistida | Specified | Pending |
| GUIDE-22 | P2: Preferência persistida | Specified | Pending |
| GUIDE-23 | P2: Preferência persistida | Specified | Pending |
| GUIDE-24 | P2: Troca de método | Specified | Pending |
| GUIDE-25 | P2: Troca de método | Specified | Pending |

**Coverage:** 25 total, 0 mapped to tasks, 25 unmapped ⚠️

---

## Success Criteria

- [ ] Fluxo completo demo-ável: `/extract` → selecionar receita → cronômetro dirigido pelas fases com volumes escalados e metas cumulativas → avanço automático/manual → concluída → "Modo simples" de volta.
- [ ] `/guides` consultável: lista de receitas com foco/moagem/tempo total e detalhe passo a passo com dose editável.
- [ ] Preferência de receita sobrevive à navegação e é limpa pelo "Modo simples".
- [ ] 100% dos requisitos GUIDE-01..25 mapeados e verificados.
- [ ] Suíte de testes unitários (escala de volumes, máquina de fases da receita, preferência) verde.
- [ ] Tela utilizável em viewport móvel (≤ 480px) sem scroll horizontal.
