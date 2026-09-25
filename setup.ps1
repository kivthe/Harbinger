# scripts/setup.ps1
# Настройка проекта Harbinger для Windows.
# Запуск: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"

Write-Host "==> Harbinger setup" -ForegroundColor Cyan
Write-Host "Root:    $Root"
Write-Host "Backend: $Backend"
Write-Host ""

# ─── 1. Проверка Python ──────────────────────────────────
Write-Host "==> Checking Python..." -ForegroundColor Cyan
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try {
        $version = & $cmd --version 2>&1
        if ($version -match "Python 3\.(1[2-9]|[2-9]\d)") {
            $pythonCmd = $cmd
            Write-Host "    Found: $version ($cmd)"
            break
        }
    } catch { }
}
if (-not $pythonCmd) {
    Write-Host "    ERROR: Python 3.12+ не найден в PATH." -ForegroundColor Red
    Write-Host "    Установи: https://www.python.org/downloads/"
    exit 1
}

# ─── 2. Проверка psql ────────────────────────────────────
Write-Host "==> Checking PostgreSQL client (psql)..." -ForegroundColor Cyan
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Host "    WARNING: psql не найден в PATH." -ForegroundColor Yellow
    Write-Host "    Если Postgres установлен — добавь его bin в PATH."
    Write-Host "    Обычно: C:\Program Files\PostgreSQL\16\bin"
    Write-Host "    Или создай БД и пользователя вручную, потом продолжи."
    $continue = Read-Host "    Продолжить без создания БД? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") { exit 1 }
} else {
    Write-Host "    Found: $($psql.Source)"

    Write-Host "==> Creating database and user (if not exist)..." -ForegroundColor Cyan
    $pgUser = Read-Host "    Postgres superuser [postgres]"
    if ([string]::IsNullOrWhiteSpace($pgUser)) { $pgUser = "postgres" }

    $sql = @"
DO `$`$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'taskuser') THEN
      CREATE ROLE taskuser WITH LOGIN PASSWORD 'taskpass';
   END IF;
END
`$`$;

SELECT 'CREATE DATABASE harbinger OWNER taskuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'harbinger')\gexec

SELECT 'CREATE DATABASE harbinger_test OWNER taskuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'harbinger_test')\gexec
"@

    $sql | psql -U $pgUser -h localhost -v ON_ERROR_STOP=1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ERROR: Не удалось создать БД. Проверь пароль Postgres." -ForegroundColor Red
        exit 1
    }
    Write-Host "    Databases 'harbinger' and 'harbinger_test' ready."
}

# ─── 3. Backend .env ─────────────────────────────────────
Write-Host "==> Preparing backend/.env..." -ForegroundColor Cyan
$envFile = Join-Path $Backend ".env"
$envExample = Join-Path $Backend ".env.example"

if (Test-Path $envFile) {
    Write-Host "    .env already exists — skipping."
} else {
    if (-not (Test-Path $envExample)) {
        Write-Host "    ERROR: backend/.env.example не найден." -ForegroundColor Red
        exit 1
    }
    Copy-Item $envExample $envFile
    Write-Host "    Created from .env.example"

    # Сгенерировать SECRET_KEY
    $secret = & $pythonCmd -c "import secrets; print(secrets.token_hex(32))"
    $content = Get-Content $envFile -Raw
    $content = $content -replace "SECRET_KEY=.*", "SECRET_KEY=$secret"
    $content = $content -replace "ADMIN_PASSWORD=.*", "ADMIN_PASSWORD=change-me-strong-password-123"
    Set-Content -Path $envFile -Value $content -NoNewline
    Write-Host "    Generated SECRET_KEY and ADMIN_PASSWORD"
}

# ─── 4. venv + зависимости ───────────────────────────────
Write-Host "==> Creating virtual environment..." -ForegroundColor Cyan
Push-Location $Backend
try {
    if (-not (Test-Path ".venv")) {
        & $pythonCmd -m venv .venv
        Write-Host "    Created backend/.venv"
    } else {
        Write-Host "    backend/.venv already exists."
    }

    $venvPython = Join-Path $Backend ".venv\Scripts\python.exe"

    Write-Host "==> Installing dependencies..." -ForegroundColor Cyan
    & $venvPython -m pip install --upgrade pip | Out-Null
    & $venvPython -m pip install -r requirements-dev.txt

    # ─── 5. Миграции ────────────────────────────────────
    Write-Host "==> Applying migrations..." -ForegroundColor Cyan
    & $venvPython -m alembic upgrade head

    # ─── 6. Админ ───────────────────────────────────────
    Write-Host "==> Creating admin (if not exists)..." -ForegroundColor Cyan
    & $venvPython -m app.scripts.create_admin
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "==> Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Запустить backend:" -ForegroundColor Yellow
Write-Host "    cd backend"
Write-Host "    .venv\Scripts\Activate.ps1"
Write-Host "    uvicorn app.main:app --reload"
Write-Host ""
Write-Host "Или через Docker:" -ForegroundColor Yellow
Write-Host "    docker compose up --build"
Write-Host ""
Write-Host "Swagger:  http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "SQLAdmin: http://localhost:8000/admin" -ForegroundColor Yellow