---
version: alpha
name: Espresso-Tracker-design-system
description: |
  Design system do Espresso & Bean Tracker — o app é a bancada do café: 100% monospace, paleta completa de café (espresso, cocoa, latte, cream) e markers ASCII como única iconografia. Toda a interface (dashboard, inventário de grãos, painel de extração, logs) lê como uma planilha de receita impressa em monospace sobre canvas cream, com badges de degass em tons de café (verde-erva para "No ideal", âmbar-caramelo para "Muito fresco", terracota para "Passou do ideal"). Sem sombras, sem gradientes, sem imagens decorativas: apenas hairline rules de 1px, radius de 4px nos elementos interativos e o tema café como cor de destaque.

colors:
  primary: "#3b2f2a"
  espresso: "#3b2f2a"
  espresso-deep: "#221a16"
  cream: "#fdfcfc"
  latte: "#f6f1ea"
  caramel-cream: "#efe6d9"
  cocoa: "#6f4e37"
  coffee-mute: "#756b62"
  ash: "#c8bfb4"
  hairline: "rgba(34,26,22,0.12)"
  hairline-strong: "#6f4e37"
  on-espresso: "#fdfcfc"
  verde-erva: "#2f7d4a"
  amber-caramelo: "#b45309"
  terracota: "#b5472f"
  terracota-hover: "#933a26"

typography:
  timer-xl:
    fontFamily: Berkeley Mono
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  display-md:
    fontFamily: Berkeley Mono
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0
  heading-md:
    fontFamily: Berkeley Mono
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0
  body-md:
    fontFamily: Berkeley Mono
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-strong:
    fontFamily: Berkeley Mono
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: 0
  card-title:
    fontFamily: Berkeley Mono
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  link-md:
    fontFamily: Berkeley Mono
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  button-md:
    fontFamily: Berkeley Mono
    fontSize: 14px
    fontWeight: 500
    lineHeight: 2
    letterSpacing: 0
  caption-md:
    fontFamily: Berkeley Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  badge-md:
    fontFamily: Berkeley Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: 0

rounded:
  none: 0px
  sm: 4px
  full: 9999px

spacing:
  xxs: 1px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.on-espresso}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 4px 20px
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.espresso-deep}"
    textColor: "{colors.on-espresso}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.espresso}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 4px 20px
  button-danger:
    backgroundColor: "{colors.terracota}"
    textColor: "{colors.cream}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 4px 16px
  button-danger-active:
    backgroundColor: "{colors.terracota-hover}"
    textColor: "{colors.cream}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 4px 16px
  button-tab:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.coffee-mute}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
    padding: 8px 12px
  button-tab-active:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.espresso}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
  button-disabled:
    backgroundColor: "{colors.caramel-cream}"
    textColor: "{colors.ash}"
    rounded: "{rounded.sm}"
  text-input:
    backgroundColor: "{colors.latte}"
    textColor: "{colors.espresso}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
    height: 40px
  text-input-focused:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.sm}"
  textarea:
    backgroundColor: "{colors.latte}"
    textColor: "{colors.espresso}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px
  select:
    backgroundColor: "{colors.latte}"
    textColor: "{colors.espresso}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
    height: 40px
  autocomplete-suggestion:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.espresso}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 8px 12px
  badge-degass-fresco:
    backgroundColor: "{colors.amber-caramelo}"
    textColor: "{colors.cream}"
    typography: "{typography.badge-md}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  badge-degass-ideal:
    backgroundColor: "{colors.verde-erva}"
    textColor: "{colors.cream}"
    typography: "{typography.badge-md}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  badge-degass-passou:
    backgroundColor: "{colors.terracota}"
    textColor: "{colors.cream}"
    typography: "{typography.badge-md}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  status-selector:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.espresso}"
    typography: "{typography.badge-md}"
    rounded: "{rounded.sm}"
    padding: 4px 10px
  status-selector-active:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.on-espresso}"
    typography: "{typography.badge-md}"
    rounded: "{rounded.sm}"
    padding: 4px 10px
  bean-card:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.espresso}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 16px
  dashboard-card:
    backgroundColor: "{colors.latte}"
    textColor: "{colors.espresso}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 16px
  bottom-nav:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.coffee-mute}"
    typography: "{typography.badge-md}"
    rounded: "{rounded.none}"
    height: 56px
  bottom-nav-active:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.espresso}"
    typography: "{typography.badge-md}"
    rounded: "{rounded.none}"
  timer-display:
    backgroundColor: "{colors.caramel-cream}"
    textColor: "{colors.espresso}"
    typography: "{typography.timer-xl}"
    rounded: "{rounded.sm}"
    padding: 16px 24px
  empty-state:
    backgroundColor: "{colors.latte}"
    textColor: "{colors.coffee-mute}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 32px 16px
  dialog-confirm:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.espresso}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 20px
  list-row:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cocoa}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 12px 0px
  link-inline:
    textColor: "{colors.espresso}"
    typography: "{typography.link-md}"
---

## Visão Geral

O Espresso & Bean Tracker é a bancada do café transformada em terminal: cada palavra na tela — do timer de 40px no painel de extração até o caption de 13px na listagem — é renderizada na mesma fonte monoespaçada (Berkeley Mono, com fallback open-source). A identidade visual vem dessa única decisão tipográfica: a interface lê como uma planilha de receita impressa, com markers ASCII `[+]` / `[-]` / `[x]` como única iconografia e um wordmark em ASCII block-pixel no cabeçalho. Não existe sans-serif, fonte display, itálico ou ornamento decorativo — o sistema é uma fonte e um peso longe de uma folha de `man`.

O chrome é austero e quente: canvas cream (`{colors.cream}` — `#fdfcfc` com um leve cast quente), tinta espresso (`{colors.espresso}` — `#3b2f2a`, o "preto" do café) e uma escada de neutros café (cocoa, coffee-mute, ash) para corpo, metadados e texto desabilitado. Cards não são superfícies elevadas — seções são blocos de texto com borda hairline de 1px (`{colors.hairline}`) assentados direto sobre o canvas, com `{spacing.section}` (64px) de ar entre eles.

A paleta de café completa distingue este sistema do manpage tradicional: espresso como cor de destaque em CTA primário, cabeçalhos e item ativo da navegação; superfícies latte e caramel-cream para inputs e cards de dashboard; e uma rampa semântica em tom de café para o estado dos grãos — `{colors.verde-erva}` (No ideal), `{colors.amber-caramelo}` (Muito fresco), `{colors.terracota}` (Passou do ideal). Nada de vermelho `#ff3b30` ou azul Apple: até o perigo é torrado.

**Características-chave:**
- 100% monospace em todos os papéis de texto (Berkeley Mono → JetBrains Mono → ui-monospace)
- Canvas cream `{colors.cream}` como único fundo de página — sem bandas de seção alternadas
- Tinta espresso `{colors.espresso}` como cor primária de texto e de destaque
- Superfícies café (latte, caramel-cream) para inputs, cards de dashboard e timer
- 4px de radius (`{rounded.sm}`) em todo elemento interativo; containers são retângulos em 1px hairline
- Markers ASCII (`[+]`, `[-]`, `[x]`) como bullets, toggles e seleção de método
- Badges de degass em tons de café: verde-erva (ideal), âmbar-caramelo (fresco), terracota (passou)
- Ritmo de `{spacing.section}` (64px) entre seções, apenas hairline de 1px como divisor

## Cores

> **Fontes:** todas as telas do app (Dashboard, Grãos, Extrair, Histórico, 404). A paleta é idêntica em todas.

### Marca & Destaque
- **Espresso** (`{colors.espresso}` — `#3b2f2a`): a "única cor" da marca. Títulos, corpo principal, fill do CTA primário, links da nav, item ativo do bottom nav, status ativo no card. Trata o marrom quase-preto como cor de marca em vez de preto puro, para manter o texto legível sobre o canvas cream.
- **Espresso Deep** (`{colors.espresso-deep}` — `#221a16`): estado pressionado do CTA primário e superfície escura reservada (mockup/timer dark). Carrega o subtom quente do café.
- **Cream** (`{colors.cream}` — `#fdfcfc`): o branco quente assinatura. Fundo de toda página e de todo card de grão; texto on-primary nas superfícies escuras.

### Superfície
- **Latte** (`{colors.latte}` — `#f6f1ea`): fundo padrão de text-input/textarea/select, cards de dashboard e empty-state.
- **Caramel Cream** (`{colors.caramel-cream}` — `#efe6d9`): fill do timer-display, fundo de botão desabilitado.
- **Espresso** (`{colors.espresso}`): o dark surface do sistema — CTA primário, mockup dark do painel, status ativo.
- **Hairline** (`{colors.hairline}` — `rgba(34,26,22,0.12)`): 1px de divisor de seção. O subtom quente translúcido combina com o cast do canvas.
- **Hairline Strong** (`{colors.hairline-strong}` — `#6f4e37`): regra inferior de tab strip e divisor inline mais forte.

### Texto
- **Espresso** (`{colors.espresso}` — `#3b2f2a`): títulos, corpo principal, links da nav, texto de botão em superfície clara.
- **Cocoa** (`{colors.cocoa}` — `#6f4e37`): corpo padrão em list-rows e descrições.
- **Coffee Mute** (`{colors.coffee-mute}` — `#756b62`): labels de tab (default), metadados, links do footer, anotações secundárias.
- **Ash** (`{colors.ash}` — `#c8bfb4`): texto desabilitado e anotação secundária em superfícies escuras.

### Semântica (estado dos grãos)
A rampa semântica é dedicada ao indicador de degass e ao estado de alerta — sempre em tom de café, nunca em cores HIG puras.

- **Verde-erva** (`{colors.verde-erva}` — `#2f7d4a`): estado "No ideal" (janela 3–14 dias). Sucesso/positivo.
- **Âmbar-caramelo** (`{colors.amber-caramelo}` — `#b45309`): estado "Muito fresco" (< 3 dias). Atenção/cautela.
- **Terracota** (`{colors.terracota}` — `#b5472f`): estado "Passou do ideal" (> 14 dias). Perigo/destrutivo; também o `{component.button-danger}` para exclusão de grão.
- **Terracota Hover** (`{colors.terracota-hover}` — `#933a26`): estado pressionado de terracota.

## Tipografia

### Família
**Berkeley Mono** é a face monoespaçada proprietária usada em todos os papéis de texto do sistema. Carrega os pesos 400 (regular), 500 (medium) e 700 (bold) e cai para uma pilha monospace — **JetBrains Mono → ui-monospace → SFMono-Regular → Menlo → Monaco → Consolas**. Berkeley Mono é pago; no app usa-se o fallback open-source (JetBrains Mono é o substituto recomendado, aproximando-se das métricas dentro de ~3% em tamanhos de corpo).

A decisão de fonte única é a marca. Não há fonte display, sans de corpo, alternativa itálica ou fallback proporcional em lugar nenhum — nem o copyright do footer usa outra coisa. A identidade é "o aplicativo é uma folha de receita."

### Hierarquia

| Token | Tamanho | Peso | Line Height | Uso |
|---|---|---|---|---|
| `{typography.timer-xl}` | 40px | 700 | 1.2 | Cronômetro do painel de extração |
| `{typography.display-md}` | 24px | 700 | 1.4 | Contagem do dashboard, título de tela vazia |
| `{typography.heading-md}` | 16px | 700 | 1.5 | Título de seção, label de formulário |
| `{typography.body-md}` | 15px | 400 | 1.6 | Corpo, parágrafos, descrições de card |
| `{typography.body-strong}` | 15px | 500 | 1.6 | Ênfase inline, item ativo de nav desktop |
| `{typography.card-title}` | 15px | 500 | 1.5 | Marca do grão no bean-card |
| `{typography.link-md}` | 15px | 400 | 1.6 | Link inline em prosa |
| `{typography.button-md}` | 14px | 500 | 2 | Label de todo botão |
| `{typography.caption-md}` | 13px | 400 | 1.6 | Metadados, notas, texto do footer |
| `{typography.badge-md}` | 12px | 500 | 1.6 | Badges de degass, status selector, bottom nav |

### Princípios
A hierarquia é construída quase inteiramente por contraste de tamanho e peso sobre uma única face. O timer (40px/700) e o heading-md (16px/700) compartilham peso; a diferença é só o tamanho. Body e link compartilham tamanho, peso e line-height — apenas o contexto os distingue. Botões recebem line-height deliberadamente alto (2.0) para os labels parecerem calmamente espaçados dentro do retângulo de 4px.

## Layout

### Sistema de Espaçamento
- **Unidade base:** 8px (com passos finos de 1/2/4px para gaps inline apertados).
- **Tokens:** `{spacing.xxs}` (1px) · `{spacing.xs}` (4px) · `{spacing.sm}` (8px) · `{spacing.md}` (12px) · `{spacing.lg}` (16px) · `{spacing.xl}` (24px) · `{spacing.xxl}` (32px) · `{spacing.section}` (64px).
- **Ritmo universal de seção:** `{spacing.section}` (64px) entre blocos de conteúdo principais em todas as telas. É o token de espaçamento mais alto do sistema e o principal sinal de layout.
- **Padding interno:** linhas de conteúdo ficam em `{spacing.lg}` (16px) vertical, sem padding horizontal — o texto começa rente à borda esquerda da seção.

### Grid & Container
- **Max width:** ~960px de coluna de conteúdo em desktop; o app é desenhado mobile-first, com a coluna ~480px em telas pequenas.
- **Mobile (≤ 480px):** navegação via `{component.bottom-nav}` fixa na parte inferior; conteúdo em coluna única.
- **Desktop (≥ 768px):** a bottom nav dá lugar a uma nav horizontal no topo (links `{typography.body-strong}` com item ativo em `{colors.espresso}`).

### Filosofia do Whitespace
O whitespace é estrutural e generoso. Seções ficam 64px apartadas, sem divisores decorativos — a regra hairline de 1px é o único sinal de separação. Dentro de uma seção, o conteúdo é flush à esquerda; bullets usam prefixos ASCII (`[+]` / `[-]`) em vez de layout por indentação. O resultado é uma tela que parece uma listagem impressa de receitas, não um layout de app estilizado.

## Elevação & Profundidade

| Nível | Tratamento | Uso |
|---|---|---|
| 0 — Plano | Sem borda, sem sombra | Corpo de seções, bean-cards, list-rows, footer |
| 1 — Hairline rule | 1px solid `{colors.hairline}` | Divisores de seção, entre blocos de conteúdo |
| 2 — Hairline strong | 1px solid `{colors.hairline-strong}` | Regra inferior do tab strip, divisor destacado |
| 3 — Invertido escuro | fill `{colors.espresso}` | CTA primário, mockup dark do painel de extração — a única "elevação" usa cor, não sombra |

Não há drop shadows no sistema. Nada flutua, nada levita. A única forma de um elemento registrar-se "acima" de outro é a superfície escura espresso usada no CTA primário e no painel.

### Profundidade Decorativa
A profundidade vem da densidade tipográfica e do único mockup escuro, não de efeitos CSS:
- **Wordmark ASCII block-pixel** — o nome "Espresso & Bean Tracker" renderizado como um bloco de 5 linhas de células monospaced, usado no cabeçalho.
- **Timer display** — superfície `{colors.caramel-cream}` com o cronômetro em `{typography.timer-xl}` (40px/700), o centro visual do painel de extração.
- **Empty-states** — superfície latte com texto em coffee-mute e marker ASCII (`[+] Nenhum grão registrado`).

## Shapes

### Escala de Border Radius

| Token | Valor | Uso |
|---|---|---|
| `{rounded.none}` | 0px | Seções, bean-cards, bottom nav, list-rows, footer — todo container que não é botão |
| `{rounded.sm}` | 4px | Todo elemento interativo — CTA, inputs, selects, badges, status selector, autocomplete, dialog |
| `{rounded.full}` | 9999px | (Reservado) avatares, não usado na v1 |

O vocabulário de radius tem dois valores: 4px para interativos e 0px para o resto. Não há fotografia; elementos visuais são limitados ao wordmark ASCII, markers ASCII e os badges de degass.

## Componentes

> **Nenhum estado de hover documentado** por política do sistema. Cada spec cobre Default e Ativo/Pressionado apenas.

### Botões

**`button-primary`** — o CTA universal do app
- Fundo `{colors.espresso}`, texto `{colors.on-espresso}`, tipo `{typography.button-md}`, padding `4px 20px`, altura ~40px, radius `{rounded.sm}`.
- Usado para "+ Adicionar grão", "Salvar", "Iniciar extração", "Salvar log".
- Estado pressionado em `button-primary-active` — fundo cai para `{colors.espresso-deep}`.

**`button-secondary`** — alternativa delineada
- Fundo `{colors.cream}`, texto `{colors.espresso}`, borda 1px solid `{colors.hairline-strong}`, tipo `{typography.button-md}`, padding `4px 20px`, radius `{rounded.sm}`.
- CTA de menor ênfase — "Cancelar", "Fechar", ao lado de um primary.

**`button-danger`** + **`button-danger-active`** — ação destrutiva
- Fundo `{colors.terracota}`, texto `{colors.cream}`, tipo `{typography.button-md}`, padding `4px 16px`, radius `{rounded.sm}`.
- Estado pressionado em `button-danger-active` — fundo cai para `{colors.terracota-hover}`.
- Confirmar exclusão de grão no dialog.

**`button-tab`** + **`button-tab-active`** — strip de seleção
- Default: fundo `{colors.cream}`, texto `{colors.coffee-mute}`, tipo `{typography.button-md}`, padding `8px 12px`, radius `{rounded.none}`.
- Ativo: mesmo fundo, texto `{colors.espresso}`, com sublinhado inferior 2px `{colors.ash}`.
- Usado no seletor de método de preparo (Espresso, Prensa Francesa, Coado/V60, Aeropress).

**`button-disabled`**
- Fundo `{colors.caramel-cream}`, texto `{colors.ash}`, radius `{rounded.sm}`.

### Badges de Degass

Os três estados do indicador de dias desde a torra — sempre exibidos no bean-card, omitidos quando não há Data de Torra.

**`badge-degass-ideal`** — "No ideal (Xd)"
- Fundo `{colors.verde-erva}`, texto `{colors.cream}`, tipo `{typography.badge-md}`, padding `2px 8px`, radius `{rounded.sm}`.
- Janela 3–14 dias pós-torra (inclusive). Cor de destaque positiva.

**`badge-degass-fresco`** — "Muito fresco (Xd)"
- Fundo `{colors.amber-caramelo}`, texto `{colors.cream}`, tipo `{typography.badge-md}`, padding `2px 8px`, radius `{rounded.sm}`.
- Menos de 3 dias pós-torra; Data de Torra futura também cai aqui (tratado como "Muito fresco", sem quebrar).

**`badge-degass-passou`** — "Passou do ideal (Xd)"
- Fundo `{colors.terracota}`, texto `{colors.cream}`, tipo `{typography.badge-md}`, padding `2px 8px`, radius `{rounded.sm}`.
- Mais de 14 dias pós-torra. Cor de alerta.

### Status Selector

**`status-selector`** + **`status-selector-active`** — troca rápida de status do pacote
- Default: fundo `{colors.cream}`, texto `{colors.espresso}`, tipo `{typography.badge-md}`, padding `4px 10px`, radius `{rounded.sm}`, borda 1px `{colors.hairline}`.
- Ativo: fundo `{colors.espresso}`, texto `{colors.on-espresso}`.
- Aberto / Fechado / Finalizado. Fica direto no bean-card (um toque para abrir as opções), independente do badge de degass.

### Bean Card

**`bean-card`** — o card de grão na listagem
- Fundo `{colors.cream}`, texto `{colors.espresso}`, tipo `{typography.body-md}`, padding `16px`, radius `{rounded.none}`, com 1px `{colors.hairline}` inferior.
- Estrutura: `{typography.card-title}` com a Marca na primeira linha; Origem · Processo em `{typography.caption-md}` `{colors.coffee-mute}` na segunda; `{component.badge-degass-*}` no canto; `{component.status-selector}` embutido; ação de excluir.
- Cards ordenados por data de criação, mais recentes primeiro.

### Inputs & Formulários

**`text-input`** + **`text-input-focused`**
- Default: fundo `{colors.latte}`, texto `{colors.espresso}`, 1px solid `{colors.hairline}`, tipo `{typography.body-md}`, padding `8px 12px`, altura ~40px, radius `{rounded.sm}`.
- Focado: fundo flips para `{colors.cream}`, borda vira 1px solid `{colors.espresso}` (o sinal de foco plano do canvas — sem halo, sem glow).
- Campos: Marca (obrigatório; espaços em branco contam como vazio), Origem, Variedade, Data de Torra.

**`textarea`**
- Fundo `{colors.latte}`, texto `{colors.espresso}`, 1px solid `{colors.hairline}`, tipo `{typography.body-md}`, padding `12px`, radius `{rounded.sm}`.
- Notas Sensoriais.

**`select`**
- Fundo `{colors.latte}`, texto `{colors.espresso}`, tipo `{typography.body-md}`, padding `8px 12px`, altura ~40px, radius `{rounded.sm}`.
- Processo: opções fixas Washed, Natural, Honey, Outro.

**`autocomplete-suggestion`**
- Fundo `{colors.cream}`, texto `{colors.espresso}`, tipo `{typography.body-md}`, padding `8px 12px`, radius `{rounded.none}`, com 1px `{colors.hairline}` inferior.
- Sugestões de Origem/Variedade baseadas em valores já usados em outros grãos; valor digitado novo é aceito.

### Cards de Dashboard

**`dashboard-card`**
- Fundo `{colors.latte}`, texto `{colors.espresso}`, tipo `{typography.body-md}`, padding `16px`, radius `{rounded.sm}`.
- Agregados: contagem de grãos abertos (número em `{typography.display-md}`), últimas extrações registradas, atalhos para as 3 seções. Sem dados → `{component.empty-state}`.

### Navegação

**`bottom-nav`** + **`bottom-nav-active`**
- Fundo `{colors.cream}`, texto `{colors.coffee-mute}` em `{typography.badge-md}`, altura ~56px, radius `{rounded.none}`, com 1px `{colors.hairline}` superior.
- Itens: Grãos / Extrair / Histórico (Home acessível pelo item ativo/dashboard). Ativo: texto `{colors.espresso}` com marker ASCII.
- Exibida em viewport ≤ 480px, fixa na base. Em desktop vira nav horizontal no topo.

### Cronômetro & Cálculo

**`timer-display`**
- Fundo `{colors.caramel-cream}`, texto `{colors.espresso}` em `{typography.timer-xl}` (40px/700), padding `16px 24px`, radius `{rounded.sm}`.
- O centro do painel de extração. O cronômetro monospace mantém os dígitos fixos enquanto correm.

### Empty States

**`empty-state`**
- Fundo `{colors.latte}`, texto `{colors.coffee-mute}`, tipo `{typography.body-md}`, padding `32px 16px`, radius `{rounded.sm}`.
- "Nenhum grão registrado", "Nenhuma extração registrada" — sempre com marker ASCII `[+]`. A app começa vazia, sem seed data.

### Diálogo de Confirmação

**`dialog-confirm`**
- Fundo `{colors.cream}`, texto `{colors.espresso}`, tipo `{typography.body-md}`, padding `20px`, radius `{rounded.sm}`, borda 1px `{colors.hairline-strong}`.
- Confirmação de exclusão de grão: pergunta + `{component.button-secondary}` (Cancelar) + `{component.button-danger}` (Excluir). Exclusão permanente, sem undo.

### Inline

**`link-inline`** — link âncora em prosa
- `{colors.espresso}` com underline. O único affordance de link da marca — mesmo links em parágrafos usam espresso, não azul.

## Do's and Don'ts

### Do
- Renderize cada papel de texto em monospace. A decisão de fonte única é toda a identidade.
- Mantenha `{colors.cream}` (`#fdfcfc`) como único fundo de página. Não introduza bandas de seção em cinza.
- Use markers ASCII (`[+]`, `[-]`, `[x]`) como bullets, toggles e seleção de método. São a única iconografia da marca.
- Use espresso `{colors.espresso}` como cor de destaque — CTA primário, item ativo de nav, status ativo.
- Reserve a rampa semântica em tom de café para o estado dos grãos (degass e status do pacote).
- Use `{rounded.sm}` (4px) em todo elemento interativo e `{rounded.none}` (0px) em todo container.
- Empilhe seções com ritmo `{spacing.section}` (64px) e apenas hairline de 1px entre elas.
- Exiba a bottom nav fixa em viewport ≤ 480px; troque por nav horizontal no topo em desktop.

### Don't
- Não introduza sans-serif de corpo, fonte display ou estilo itálico. Monospace carrega tudo.
- Não adicione drop shadows, gradientes ou fundos atmosféricos. O sistema é plano sobre cream.
- Não troque markers ASCII por ícones SVG. Os brackets são os ícones.
- Não use cores HIG puras (`#30d158`, `#ff9f0a`, `#ff3b30`) nos badges de degass — use os tons de café.
- Não aplique a rampa semântica em CTAs de marketing/primários. Ela pertence aos estados dos grãos.
- Não dê padding interno de 24px+ a cards. Bean-cards ficam em 16px; list-rows em 12px vertical.
- Não renderize o nome da marca como vetor. É sempre wordmark ASCII block-pixel.

## Comportamento Responsivo

### Breakpoints

| Nome | Largura | Mudanças-chave |
|---|---|---|
| desktop | 1280px+ | Coluna de conteúdo ~960px, nav horizontal no topo |
| desktop-narrow | 768px | Nav horizontal mantida |
| tablet | 640px | Formulários de 2 colunas empilham em 1 coluna |
| mobile | 480px | **Bottom nav fixa aparece**; coluna única; timer cai 40px → 32px |

### Touch Targets
Todos os elementos interativos atingem WCAG AA na faixa ~36–40px de altura. `{component.button-primary}`, `{component.text-input}`, `{component.select}` ficam em ~40px. `{component.status-selector}` e `{component.button-tab}` estendem para ~44px de área tocável via padding inline. Itens da bottom nav usam `{typography.badge-md}` (12px) com ~28px de line-height e altura de ~56px.

### Estratégia de Colapso
- **Navegação:** desktop horizontal no topo → mobile `{component.bottom-nav}` fixa na base em ≤ 480px.
- **Timer display:** mantém a superfície `{colors.caramel-cream}` em todos os breakpoints; o número em `{typography.timer-xl}` (40px) escala para ~32px em mobile.
- **Formulários:** colunas lado a lado em desktop → 1 coluna em tablet/mobile.
- **Seções:** `{spacing.section}` (64px) desktop → 48px tablet → 32px mobile.
- **Empty-states:** mantêm padding generoso `32px 16px` em todos os breakpoints.

## Guia de Iteração

1. Foque em UM componente por vez. Puxe sua entrada YAML e verifique se cada propriedade resolve.
2. Referencie nomes de componentes e tokens diretamente (`{colors.espresso}`, `{component.badge-degass-ideal}`, `{rounded.sm}`) — não parafraseie.
3. Rode `npx @google/design.md lint DESIGN.md` após edições — warnings de `broken-ref`, `contrast-ratio` e `orphaned-tokens` sinalizam problemas automaticamente.
4. Adicione novas variantes como entradas de componente separadas (`-active`, `-disabled`) — não as enterre em prosa.
5. Default de corpo é `{typography.body-md}`; use `{typography.body-strong}` para ênfase; reserve `{typography.timer-xl}` estritamente para o cronômetro e `{typography.display-md}` para contagens do dashboard.
6. Mantenha a superfície escura escassa — apenas o CTA primário, o timer e o status ativo usam `{colors.espresso}`. A cor escura é um dispositivo narrativo, não um tratamento de chrome.
7. Ao introduzir um novo componente, pergunte se ele pode ser expresso com o vocabulário existente (markers ASCII + radius 4px + monospace + paleta café) antes de adicionar tokens. A força do sistema é quase nunca precisar de novos.

## Gaps Conhecidos

- **Estados de hover não documentados** por política do sistema (apenas Default e Ativo/Pressionado).
- **Estado de erro/validação de formulário** (mensagens inline de sucesso/erro) não detalhado — as mensagens de validação de Marca obrigatória serão definidas na implementação usando `{colors.terracota}`.
- **Animações/transições** (troca de status, abrir/fechar seletor, timing do cronômetro) não especificadas — decididas na execução, mantendo o princípio de "sem efeitos chamativos".
- **Wordmark ASCII block-pixel** precisa ser desenhado na execução da M1 (não há asset ainda).
- **Data de Torra futura** tratada como "Muito fresco" — sem estado visual extra necessário.
