#!/bin/bash
set -e

export PATH="$PATH:/usr/lib/postgresql/15/bin"

echo "=== Permify Startup ==="

# Start PostgreSQL
echo "Starting PostgreSQL..."
su postgres -c "pg_ctl -D /var/lib/postgresql/data -l /var/log/postgresql.log start" || true

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  if su postgres -c "pg_isready -q" 2>/dev/null; then
    echo "PostgreSQL is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 1
done

# Initialize database
echo "Initializing database..."
su postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='app_db'\"" | grep -q 1 || \
  su postgres -c "createdb app_db"

su postgres -c "psql -d app_db -f /app/init.sql" 2>/dev/null || true

echo "Database initialized."

# Start Next.js
echo "Starting Next.js on port 7860..."
cd /app

export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
export JWT_SECRET="orgflow_jwt_secret_key_2024_secure"
export NODE_ENV="production"
export PORT=7860
export HOSTNAME="0.0.0.0"

npm start
