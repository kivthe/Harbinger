#!/usr/bin/env bash
# scripts/setup.sh
# Настройка проекта Harbinger для Linux / macOS.
# Запуск: bash scripts/setup.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"

echo "==> Harbinger setup"
echo "Root:    $ROOT"
echo "Backend: $BACKEND"
echo ""

# ─── 1. Проверка Python ──────────────────────────────────
echo "==> Checking Python..."
PYTHON=""
for cmd in python3.13 python3.12 python3 python; do
    if command -v "$cmd" >/dev/null 2>&1; then
        version=$("$cmd" --version 2>&1)
        if echo "$version" | grep -qE "Python 3\.(1[2-9]|[2-9][0-9])"; then
            PYTHON="$cmd"
            echo "    Found: $version ($cmd)"
            break
        fi
    fi
done
if [ -z "$PYTHON" ]; then
    echo "    ERROR: Python 3.12+ не найден в PATH."
    echo "    Ubuntu: sudo apt install python3.12 python3.12-venv"
    echo "    macOS:  brew install python@3.12"
    exit 1
fi

# ─── 2. Проверка psql ────────────────────────────────────
echo "==> Checking PostgreSQL client (psql)..."
if ! command -v psql >/dev/null 2>&1; then
    echo "    WARNING: psql не найден в PATH."
    echo "    Ubuntu: sudo apt install postgresql-client"
    echo "    macOS:  brew install libpq && brew link --force libpq"
    read -rp "    Продолжить без создания БД? (y/N): " cont
    [[ "$cont" =~ ^[Yy]$ ]] || exit 1
else
    echo "    Found: $(command -v psql)"

    echo "==> Creating database and user (if not exist)..."
    read -rp "    Postgres superuser [postgres]: " PG_USER
    PG_USER="${PG_USER:-postgres}"

    psql -U "$PG_USER" -h localhost -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'taskuser') THEN
      CREATE ROLE taskuser WITH LOGIN PASSWORD 'taskpass';
   END IF;
END
$$;

SELECT 'CREATE DATABASE harbinger OWNER taskuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'harbinger')\gexec

SELECT 'CREATE DATABASE harbinger_test OWNER taskuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'harbinger_test')\gexec
SQL

    echo "    Databases 'harbinger' and 'harbinger_test' ready."
fi

# ─── 3. Backend .env ─────────────────────────────────────
echo "==> Preparing backend/.env..."
ENV_FILE="$BACKEND/.env"
ENV_EXAMPLE="$BACKEND/.env.example"

if [ -f "$ENV_FILE" ]; then
    echo "    .env already exists — skipping."
else
    if [ ! -f "$ENV_EXAMPLE" ]; then
        echo "    ERROR: backend/.env.example не найден."
        exit 1
    fi
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "    Created from .env.example"

    SECRET=$("$PYTHON" -c "import secrets; print(secrets.token_hex(32))")

    # Заменяем SECRET_KEY и ADMIN_PASSWORD (кроссплатформенно через sed)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^SECRET_KEY=.*|SECRET_KEY=$SECRET|" "$ENV_FILE"
        sed -i '' "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=change-me-strong-password-123|" "$ENV_FILE"
    else
        sed -i "s|^SECRET_KEY=.*|SECRET_KEY=$SECRET|" "$ENV_FILE"
        sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=change-me-strong-password-123|" "$ENV_FILE"
    fi
    echo "    Generated SECRET_KEY and ADMIN_PASSWORD"
fi

# ─── 4. venv + зависимости ───────────────────────────────
echo "==> Creating virtual environment..."
cd "$BACKEND"

if [ ! -d ".venv" ]; then
    "$PYTHON" -m venv .venv
    echo "    Created backend/.venv"
else
    echo "    backend/.venv already exists."
fi

VENV_PYTHON="$BACKEND/.venv/bin/python"

echo "==> Installing dependencies..."
"$VENV_PYTHON" -m pip install --upgrade pip >/dev/null
"$VENV_PYTHON" -m pip install -r requirements-dev.txt

# ─── 5. Миграции ─────────────────────────────────────────
echo "==> Applying migrations..."
"$VENV_PYTHON" -m alembic upgrade head

# ─── 6. Админ ────────────────────────────────────────────
echo "==> Creating admin (if not exists)..."
"$VENV_PYTHON" -m app.scripts.create_admin

echo ""
echo "==> Setup complete!"
echo ""
echo "Запустить backend:"
echo "    cd backend"
echo "    source .venv/bin/activate"
echo "    uvicorn app.main:app --reload"
echo ""
echo "Или через Docker:"
echo "    docker compose up --build"
echo ""
echo "Swagger:  http://localhost:8000/docs"
echo "SQLAdmin: http://localhost:8000/admin"