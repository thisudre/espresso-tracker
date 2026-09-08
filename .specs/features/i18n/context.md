# Internacionalização (i18n) — Context

**Gathered:** 2026-08-06
**Spec:** `.specs/features/i18n/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Extrair todas as strings PT-BR hardcoded do app para um mecanismo de tradução reativo, permitir seleção de idioma **PT-BR ↔ EN** com troca instantânea (sem reload) e preferência persistida. Fora de escopo: tradução de conteúdo digitado pelo usuário (marcas, notas, observações).

---

## Implementation Decisions

### GA-1 — Idiomas

- Idiomas suportados: **PT-BR (default)** e **Inglês (EN)**. Somente esses dois na v1.
- Primeiro acesso (sem preferência salva) **sempre abre em PT-BR** — sem detecção de navegador.

### GA-2 — Seletor de idioma

- Atalho compacto **"PT/EN"** no **header desktop (≥768px)**, ao lado da nav.
- No **mobile (≤480px)**, o mesmo atalho fica no **rodapé da dashboard** (header só tem a marca, nav é bottom-nav).
- Sem página de configurações na v1 — seletor é sempre visível em ambos os breakpoints.

### GA-3 — Comportamento da troca

- Troca **instantânea via Signals**, sem recarregar a página, coerente com AD-002.
- Estado em andamento (timer, forms, método selecionado) preservado durante a troca.
- Preferência persistida via **StorageService** (padrão "preferência" do AD-013, envelope versionado).

### GA-4 — Escopo do conteúdo traduzido

- **Tudo** traduz, incluindo o conteúdo estático dos guias:
  - Chrome de UI: botões, labels, nav, headers, empty states, placeholders, mensagens de erro.
  - Labels de domínio: badges de degass, nomes de método, fases do timer, rating labels.
  - **Conteúdo dos 3 guias V60**: nomes (Equilibrada/Intensa/Suave), focos, dicas de moagem, descrições técnicas de fase.
- Processos (Washed/Natural/Honey/Outro) permanecem como estão (vocabulário de café já internacional, sem tradução).

### GA-5 — Datas

- Formato de datas **localizado por idioma**: PT-BR `dd/MM/yyyy HH:mm`, EN `MM/dd/yyyy h:mm a` (locale dinâmico no DatePipe).

### GA-6 — Labels persistidos vs dinâmicos

- Labels **derivados de id** (método, fase, rating, degass) **traduzem ao vivo** ao trocar idioma — nunca são gravados nos dados.
- Snapshot de nome do grão (marca) fica como digitado — é conteúdo do usuário, não traduz.

### Agent's Discretion

- Mecanismo técnico de tradução (i18n runtime próprio com Signals vs lib como ngx-translate) — decidido no design, mantendo o princípio "100% Signals / zero dependência pesada" do projeto.
- Nome/marcação visual exata do atalho "PT/EN" no header e no rodapé da dashboard.
- Chaves/estrutura dos arquivos de tradução.

---

## Specific References

- Switcher: usuário explicitou "só pra inglês" (GA-1) e atalho no header desktop + dashboard mobile (GA-2).
- Troca instantânea sem reload — coerente com o AD-002 (Signals) e o padrão de "preferência persistida" do AD-013 (GuideStore).

---

## Deferred Ideas

- **Idiomas adicionais (ES, FR, etc.)** — o mecanismo deve suportar >2 idiomas sem refactor, mas só PT-BR/EN são traduzidos na v1.
- **Detecção automática de idioma do navegador no primeiro acesso** — descartada na discussão; pode voltar como P3.
- **Página de configurações com mais preferências** — fora do escopo v1.
