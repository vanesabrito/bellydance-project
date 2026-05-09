#!/bin/sh
set -e

echo "Waiting for database to be available..."
# Best-effort wait for Postgres to be ready; use service name and defaults from compose
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-student_docs}
DB_USER=${DB_USER:-postgres}

for i in $(seq 1 30); do
  if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    echo "Database is ready."
    break
  fi
  echo "Waiting for Postgres ($i/30)..."
  sleep 2
done

# push prisma schema and seed
if [ -f /usr/src/app/prisma/schema.prisma ]; then
  echo "Pushing Prisma schema to database..."
  # Retry prisma db push a few times in case DB just became available
  npx prisma db push || (sleep 2 && npx prisma db push) || (sleep 2 && npx prisma db push) || echo "prisma db push failed (continuing)"
  if [ -f /usr/src/app/scripts/seed-admin.js ]; then
    echo "Seeding admin user (if not exists)..."
    node /usr/src/app/scripts/seed-admin.js || echo "seed script failed (will continue)"
  fi
fi

echo "Starting Next.js"
exec yarn start
