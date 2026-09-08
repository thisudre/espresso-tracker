# Mobile Port — Design

**Milestone:** M8
**Decisões:** context.md D1-D4

## Arquitetura

```
Angular 22 (mesma codebase) → ng build → dist/espresso-tracker/browser
                                        ↕ capacitor.config.ts (webDir)
                                   npx cap sync → android/ (gerado, gitignored)
```

- **Capacitor 7** (compatível com Angular 22 / Node 22): `core` + `cli` apenas.
- **Config:** `capacitor.config.ts` na raiz (TS, não JSON), `appId: com.espressotracker.app`, `appName: Espresso & Bean`, `webDir: dist/espresso-tracker/browser`.
- **Sem código Angular tocado:** nenhum service/component importa `@capacitor/*` na M8. Guard `Capacitor.isNativePlatform()` só quando futuro plugin for adicionado.
- **Web inalterado:** `ng serve`/`build`/`test`/`lint` sem alteração; `cap sync` só copia `dist` para `android/`.

## Estrutura

- `capacitor.config.ts` (raiz)
- `android/` (gerado, `.gitignore`)
- `package.json` scripts opcionais: `cap:sync`, `cap:open:android` (conveniência, não obrigatório)

## Fluxo

1. `ng build` → `dist/espresso-tracker/browser`
2. `npx cap sync android` → copia + atualiza plugins
3. `npx cap open android` / `npx cap run android` → Android Studio / device

## Riscos

- `webDir` errado quebra sync (validar com `ls dist/espresso-tracker/browser/index.html` após build).
- Angular 22 com `application` builder exige `browser/` no path (não `dist/espresso-tracker` direto).

## Verificação

- `npm run build` OK + `npx cap sync` sem erro
- `ng test` / `ng lint` verdes
- App abre no emulador com 3 rotas + timer

## Fora do design (futuro)
- Splash/StatusBar/Haptics, SQLite, background timer, iOS target.
