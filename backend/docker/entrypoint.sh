#!/bin/sh
set -e

echo "[entrypoint] aplicando migrações..."
npx prisma migrate deploy

echo "[entrypoint] garantindo seed das receitas..."
node dist/prisma/seed.js

echo "[entrypoint] iniciando API..."
exec node dist/main.js
