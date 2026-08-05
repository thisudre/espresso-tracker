# Brew Logs Context

Data de captura: 2026-08-05
Fase: Specify (discuss gray areas)
Spec: `.specs/features/brew-logs/spec.md`
Status: Ready for design

---

## Feature Boundary

Registro de xícaras (brew logs) como histórico persistente: salvar receita (método, dose, água, ratio, moagem, tempo total), avaliação sensorial com estrelas (Acidez, Corpo, Doçura, Nota Geral), observações; consultar com lista + filtros + detalhe; editar e excluir. Criado via atalho do painel M3 (pré-preenchido) ou formulário manual em `/logs`. Construído sobre a infra da M1/M2 e consumindo o estado final exposto pela M3.

---

## Implementation Decisions

### D-LOG-01: Origem do log

- Duas vias: atalho "Salvar no histórico" no painel de extração (M3) e formulário independente em `/logs`.
- Atalho do painel: pré-preenche o formulário de novo log com método, dose, ratio, água sugerida e tempo total atuais, e navega para `/logs`.
- O atalho só pré-preenche o que existe: com dose vazia, dose/água ficam vazias sem quebrar.
- Nada é persistido pela M3 — o pré-preenchimento carrega o estado vivo do painel no momento do toque.

### D-LOG-02: Vínculo com grão

- Vínculo opcional: seletor de grãos cadastrados em `/beans` quando existirem; log sem grão é permitido.
- O log guarda id + nome do grão (snapshot): se o grão for excluído depois, o log mantém o nome exibível e não quebra.

### D-LOG-03: Avaliação sensorial

- Representação: estrelas (1–5) por atributo — Acidez, Corpo, Doçura — e Nota Geral.
- Nota Geral é manual e independente (não é média dos atributos).
- Todas opcionais: 0 estrelas = não avaliado; exibição "Sem avaliação" quando tudo em 0.

### D-LOG-04: Histórico consultável

- Listagem em cards ordenados por data de criação, mais recente primeiro.
- Filtros por grão e por método; filtro com lista vazia mostra estado vazio identificando o filtro ativo com ação de limpar.
- Sem logs: estado vazio com chamada para criar o primeiro.
- Toque em um log abre tela de detalhe com todos os campos.

### D-LOG-05: Edição e exclusão

- Edição via tela de detalhe, qualquer campo alterável.
- Exclusão com diálogo de confirmação; exclusão permanente (sem undo).

### D-LOG-06: Tempo registrado

- Só o tempo total da extração (mm:ss), herdado do painel ou digitado no formulário manual.
- Pré-infusão não é campo separado do log.
- Tempo 0/vazio → exibição "—".

### D-LOG-07: Campo moagem

- Texto livre com autocomplete de valores já usados em logs anteriores (mesmo padrão Origem/Variedade da M2).
- Valor digitado novo é aceito e passa a aparecer nas sugestões.

### D-LOG-08: Método no log

- Método é o único campo obrigatório do log.
- Via atalho vem do painel; no formulário manual é select fixo dos 4 métodos (Espresso, Prensa Francesa, Coado/V60, Aeropress).
- Ratio é derivado (água ÷ dose) quando ambos são válidos e > 0; não é campo editável no formulário manual (herdado do painel no fluxo de atalho apenas como valor derivado quando houver dose/água).

### Agent's Discretion

- Layout dos cards de log e campos visíveis (além de método/grão/badge de avaliação) — decidido na execução.
- Filtros combinados (grão + método simultâneos) vs. um por vez — semântica definida, mecânica a cargo do design.
- Implementação do autocomplete de moagem (componente próprio vs. nativo).
- Visual das estrelas de avaliação (ícones, seleção por toque).
- Estrutura exata da tela de detalhe e da ordenação em casos de mesma data.
- Contrato exato do estado pré-preenchido consumido do painel M3 (estrutura do objeto) — decidido no design.

---

## Specific References

- No specific requirements — open to standard approaches.

---

## Deferred Ideas

- [ ] Nota Geral calculada automaticamente (média dos atributos) — surgiu durante discussão da avaliação; opcional de configurar depois da v1.
- [ ] Filtro por período/data no histórico — extensão natural do consultável; fora do escopo v1.
- [ ] Gráficos de evolução sensorial por grão/método — já registrado em STATE.md; requer os logs desta feature.
- [ ] Export de logs (CSV/JSON) — já registrado em STATE.md.
- [ ] Registrar pré-infusão como campo separado do log — decidido como total apenas na v1; viável se o painel expuser o tempo da fase.
