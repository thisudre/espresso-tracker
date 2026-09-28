# Backend Guias — Design

## Arquitetura
```
monorepo/
  src/              # Angular 21 (existente)
  backend/          # NestJS 11
    src/
      auth/         # register/login/refresh/google (Passport JWT + Google OAuth20)
      guides/       # CRUD + seed
      users/        # User + Preferences
      prisma/       # PrismaService
    prisma/
      schema.prisma
      seed.ts
```

## Prisma Schema (resumo)
```prisma
model User { id String @id @default(cuid()); email String @unique; password String?; googleId String? @unique; name String; preferredRecipeId String?; createdAt DateTime @default(now()) }
model Guide { id String @id @default(cuid()); method String; nome String; foco String; moagem String; baseDose Int; tempoTotalEstimado Int; authorId String?; author User? @relation(fields:[authorId], references:[id]); fases Json; createdAt DateTime @default(now()) }
```
Fases como Json (array RecipePhase) — simples v1, sem tabela separada.

## API
- `POST /api/auth/register, /login, /refresh, /google, /google/callback, GET /me`
- `GET /api/guides, GET /api/guides/:id` (public)
- `POST /api/guides, PATCH /api/guides/:id, DELETE /api/guides/:id` (JWT)
- `GET/PATCH /api/me/preferences` (JWT)

Guards: `JwtAuthGuard` (401), ownership check no service (403).

## Frontend
- `GuideApiService` (HttpClient) com `getAll(), getById(id), create(dto), update(id,dto), delete(id)` + `getPreferences/patchPreferences`.
- `GuideStore` passa a carregar via API (signal `recipes`, `loading`, `error`); mantém fallback LocalStorage quando deslogado.
- `AuthService` + `AuthInterceptor` (header Authorization).
- `guide.model.ts`: mantém interfaces, remove `RECIPES`/`RECIPES_BY_ID` (ou deprecia).

## Infra
- `backend/.env.example` (DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID/SECRET)
- `docker-compose.yml` (postgres local + api)
- Seed: `npx prisma db seed` com 3 V60.
