# Testing Strategy

**Fonte**: `.specs/features/app-shell/design.md` (Testes & Gate) · AD-008 · context.md D4
**Runner**: Vitest via builder `@angular/build:unit-test` (default do Angular 21), zoneless.

## Tipos de teste por camada

| Camada de código | Tipo de teste | Parallel-safe | Notas |
| --- | --- | --- | --- |
| StorageService | unit | Yes | `storage.spec.ts` (mock de LocalStorage) |
| Stores (BaseStore, BeanStore, LogStore) | unit | Yes | specs co-localizadas; delegate via mock do StorageService |
| Modelos de domínio (Bean, BrewLog) | none | - | tipagem simples, sem lógica |
| Componentes de UI (Nav, Dashboard, pages placeholder, NotFound, App) | none (manual) | - | verificação por navegação manual no browser |
| Rotas / app.config | none (manual) | - | lazy loading + wildcard 404 |
| styles.scss (design tokens) | none (manual) | - | verificação visual + build |

## Gate Check Commands

| Nível | Comando | Quando |
| --- | --- | --- |
| quick | `ng test --include='**/<spec>.spec.ts'` | após task que cria/edita service ou store |
| full | `ng test` | após conclusão do milestone / integração |
| build | `ng build` | após qualquer mudança estrutural |
| lint | `ng lint` | após qualquer mudança em TS |
| manual | navegação no browser (rotas, 404, mobile/desktop, empty states, console) | após tasks de UI |

## Regras

- Testes são **co-localizados**: toda task que cria um service/store com requirement `unit` escreve o spec na própria task.
- UI não gera teste automatizado na v1 (D4): verificação manual é o gate — registrar o checklist no `tasks.md`.
- Testes unitários rodam em paralelo com segurança (arquivos Vitest isolados).
- Nunca silenciar a remoção de testes: `Done when` sempre traz contagem esperada de testes passando.
