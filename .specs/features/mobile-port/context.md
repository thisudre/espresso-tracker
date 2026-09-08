# Mobile Port — Context (Decisões)

## D1: android/ no .gitignore
**Decisão:** `android/` ignorado no git na M8.
**Razão:** Gerado por `npx cap add android`; recriável via `cap sync`. Evita churn de binários.
**Alternativa descartada:** Versionar `android/` (útil só quando customizar MainActivity/plugins nativos).

## D2: appId / appName
- **appId:** `com.espressotracker.app`
- **appName:** `Espresso & Bean`
**Razão:** ID reverso-DNS único; nome curto para launcher.

## D3: webDir
`dist/espresso-tracker/browser` (output do builder `application` Angular 22).
**Razão:** Angular 22 com `outputMode browser` gera `browser/` dentro de `dist/<project>/`.

## D4: Sem plugins na M8
Nenhum `@capacitor/*` além de `core`+`cli`. Sem Haptics/StatusBar/Splash nativo. `isNative` guard se precisar.
