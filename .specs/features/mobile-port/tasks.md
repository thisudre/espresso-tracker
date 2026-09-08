# Mobile Port — Tasks

| # | Task | Reuses | Done when | Tests | Gate |
|---|------|--------|-----------|-------|------|
| 1 | Instalar @capacitor/core + @capacitor/cli e `npx cap init` com appId/appName + criar capacitor.config.ts com webDir correto | capacitor.config.ts | `npx cap sync` sem erro após `ng build` | - | `npm run build` OK |
| 2 | `npx cap add android` + ajustar .gitignore para `android/` + scripts de conveniência | .gitignore, package.json | `ls android/` existe localmente, git ignora | - | `git check-ignore android` |
| 3 | Verificação: build/test/lint verdes + sync OK + doc curta no STATE/ROADMAP | STATE.md, ROADMAP.md | Docs atualizados, gates verdes | - | `npm test` + `ng lint` |

**Dependências:** 1 → 2 → 3 (sequencial)
