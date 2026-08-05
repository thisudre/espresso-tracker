# Extraction Panel Context

Data de captura: 2026-08-05
Fase: Specify (discuss gray areas)
Spec: `.specs/features/extraction-panel/spec.md`
Status: Ready for design

---

## Feature Boundary

Painel de extração em tempo real na bancada: seletor de método (Espresso, Prensa Francesa, Coado/V60, Aeropress), calculadora reativa de ratio (pó → água sugerida) e cronômetro com fases de pré-infusão/extração. Construído sobre a infra da M1/M2. Nada é salvo na M3 — o estado final do brew fica exposto para a M4 consumir.

---

## Implementation Decisions

### D-EXTR-01: Presets de método e ratio

- Cada método carrega um ratio preset ao ser selecionado: Espresso 1:2, V60 1:16, Prensa 1:15, Aeropress 1:15.
- Sem limite para o valor X do ratio (qualquer `1:X` é aceito).
- O ratio é editável livremente a qualquer momento; o preset é apenas o ponto de partida e volta a valer na próxima troca de método.
- Sem dose de pó sugerida — o campo de dose inicia vazio.

### D-EXTR-02: Entradas da calculadora

- Direção do cálculo: só pó → água sugerida (`água = dose × ratio`).
- Água sugerida arredondada para o grama inteiro mais próximo.
- Unidade: gramas (assumindo 1g = 1ml, padrão barista).
- Exibição: readout destacado com rótulo de unidade, abaixo do campo de dose.
- Cálculo reativo em tempo real a cada mudança de dose ou ratio.

### D-EXTR-03: Cronômetro e fases

- A fase de pré-infusão está sempre presente em todos os métodos; o avanço para a extração é manual (um toque) — para métodos sem infusão real, basta avançar.
- Display: dois números — timer da fase atual e total acumulado (o total inclui a pré-infusão).
- Resolução: segundos, formato mm:ss.
- Controles: Start/Pause e Reset; o Reset zera tudo e volta à pré-infusão.
- Ao sair da rota `/extract`, o cronômetro reinicia (o brew em andamento é perdido intencionalmente — sem persistência).

### D-EXTR-04: Layout e interação durante o brew

- Edição de dose/ratio permitida com o cronômetro rodando; a água sugerida recalcula sem afetar o timer.
- Timer em destaque no topo da tela; seletor de método em chips horizontais roláveis; calculadora em cards abaixo.
- Mobile-first (≤ 480px) sem scroll horizontal.

### D-EXTR-05: Vínculo com Brew Logs (M4)

- Nada é salvo na M3 — painel 100% ferramenta em tempo real.
- O estado final do brew (método, dose, ratio, água sugerida, fase atual, tempo da fase, tempo total) fica exposto em estado derivado (`computed`) pronto para a M4 consumir.
- Sem atalho de "enviar para histórico" na UI (requer M4).

### Agent's Discretion

- Visual do cronômetro (digital simples vs. progresso circular) — semântica definida, estética a cargo do design.
- Estrutura/ordem dos cards da calculadora e rótulos de campo.
- Estados visuais dos chips de método (selecionado vs. não selecionado).
- Formato do readout destacado da água sugerida (tamanho/estilo).
- Contrato exato do estado derivado exposto à M4 (estrutura do objeto) — decidido no design.

---

## Specific References

- No specific requirements — open to standard approaches.

---

## Deferred Ideas

- [ ] Persistência de presets customizados de ratio por usuário — surgiu durante discussão de presets; extensão natural para depois da v1.
- [ ] Cronômetro contínuo em background (sair da rota e continuar) — decidido como reinício na v1; viável como melhoria futura.
- [ ] Atalho "enviar para histórico" pré-preenchendo log da M4 — requer Brew Logs; retomar na especificação da M4.
- [ ] Feedback sonoro/háptico ao fim de fase — fora do escopo v1; extensão possível.
