#!/bin/sh
set -e

cd /app/backend

echo "[entrypoint] Waiting for database..."
until node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.end().then(() => process.exit(0)))
  .catch(() => process.exit(1));
"; do
  sleep 2
done

echo "[entrypoint] Applying database schema..."
npx drizzle-kit push

echo "[entrypoint] Seeding defaults (if needed)..."
node dist/db/init.js || true

echo "[entrypoint] Starting server..."
exec node dist/server.js
