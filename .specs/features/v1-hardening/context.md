# V1 Hardening - User Decisions

## D-V1-01: Responsividade - Quais breakpoints testar?

**Pergunta**: Quais viewports específicos testar para garantir responsividade?

**Opções**:
- Apenas ≤480px (bottom nav) — mais simples, cobre o caso principal
- 375px (iPhone SE) + 414px (iPhone Plus) + 480px — mais completo
- Usar breakpoints do DESIGN.md — consistente com o design system

**Decisão do usuário**: 375px + 480px (Recommended)

---

## D-V1-02: Validação - Quais campos adicionais precisam de validação?

**Pergunta**: Além de Marca (bean) e Método (log), quais campos precisam de validação obrigatória?

**Opções**:
- Apenas os já definidos (Marca, Método) — mínima intervenção
- Adicionar validação de data futura no bean — previne erros de digitação
- Adicionar validação de dose > 0 no log — previne divisão por zero no ratio

**Decisão do usuário**: Só Marca e Método como obrigatórios (Recommended)

---

## D-V1-03: Edge Cases - Tratamento de dados legados?

**Pergunta**: Beans/logs criados antes de validações existentes precisam de normalização?

**Opções**:
- Não — dados legados já são tratados (Bean sem status → fechado, AD-010)
- Sim — normalizar todos os dados na leitura para garantir consistência

**Recomendação**: Não adicionar normalização extra; o código já normaliza Bean legado (status) e Log sem grão/moagem já mostra placeholders.
