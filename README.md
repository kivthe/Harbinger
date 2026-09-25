# Harbinger

Простой таск-трекер: FastAPI + React + PostgreSQL, JWT, SQLAdmin, soft-delete.

[![Backend CI](https://github.com/kivthe/Harbinger/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/kivthe/Harbinger/actions/workflows/backend-ci.yml)
[![Publish Docker image](https://github.com/kivthe/Harbinger/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/kivthe/Harbinger/actions/workflows/docker-publish.yml)

## Стек

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0, psycopg 3, Alembic, SQLAdmin
- **Frontend:** React + TypeScript + Vite *(в разработке)*
- **DB:** PostgreSQL 16
- **CI/CD:** GitHub Actions, GHCR

## Быстрый старт

### Требования

- Python 3.12+
- PostgreSQL 16
- *(опционально)* Docker Desktop
- *(для фронта)* Node.js 20+

### Установка

**Windows:**
```powershell
git clone git@github.com:kivthe/Harbinger.git
cd Harbinger
.\scripts\setup.ps1
```

**Linux / macOS:**
```bash
git clone git@github.com:kivthe/Harbinger.git
cd Harbinger
bash scripts/setup.sh
```

Скрипт создаст БД, `backend/.env`, venv, установит зависимости, применит миграции и создаст админа.

### Запуск

**Локально (uvicorn):**
```bash
cd backend
# Windows: .venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
uvicorn app.main:app --reload
```

**Через Docker:**
```bash
docker compose up --build
```

Открыть:

- Swagger: http://localhost:8000/docs
- SQLAdmin: http://localhost:8000/admin
- Health: http://localhost:8000/health

## API

Префикс: `/api/v1`

### Auth

| Метод | Путь | Описание |
|:-----:|------|----------|
| `POST` | `/auth/register` | Регистрация |
| `POST` | `/auth/login` | Вход, cookie `access_token` + `refresh_token` |
| `POST` | `/auth/refresh` | Обновить access-токен |
| `POST` | `/auth/logout` | Выход |
| `GET` | `/auth/me` | Текущий пользователь |

### Users

| Метод | Путь | Описание |
|:-----:|------|----------|
| `GET` | `/users/me` | Профиль |

### Tasks

| Метод | Путь | Описание |
|:-----:|------|----------|
| `GET` | `/tasks` | Список · фильтры `status`, `priority`, `q`, `limit`, `offset` |
| `POST` | `/tasks` | Создать |
| `GET` | `/tasks/{id}` | Получить |
| `PATCH` | `/tasks/{id}` | Обновить |
| `PATCH` | `/tasks/{id}/status` | Сменить статус *(drag&drop)* |
| `PATCH` | `/tasks/{id}/toggle` | Переключить `done` ↔ `todo` |
| `DELETE` | `/tasks/{id}` | В корзину *(soft delete)* |

### Trash

| Метод | Путь | Описание |
|:-----:|------|----------|
| `GET` | `/trash` | Список удалённых |
| `PATCH` | `/trash/{id}/restore` | Восстановить |
| `DELETE` | `/trash/{id}` | Удалить навсегда |
| `DELETE` | `/trash` | Очистить корзину |

### Admin

> Требуется роль `admin`.

| Метод | Путь | Описание |
|:-----:|------|----------|
| `GET` | `/admin/users` | Все пользователи |
| `GET` | `/admin/users/{id}` | Один пользователь |
| `PATCH` | `/admin/users/{id}` | Роль / `is_active` |
| `DELETE` | `/admin/users/{id}` | Удалить |
| `GET` | `/admin/tasks` | Все задачи, включая удалённые |

Полная документация — на `/docs`.

## Структура

```
Harbinger/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # JSON API
│   │   ├── admin/          # SQLAdmin
│   │   ├── core/           # config, security, deps
│   │   ├── db/             # engine, session
│   │   ├── models/         # SQLAlchemy
│   │   ├── schemas/        # Pydantic
│   │   ├── crud/           # доступ к БД
│   │   └── scripts/        # bootstrap
│   ├── alembic/            # миграции
│   └── tests/              # pytest
├── frontend/               # React (в разработке)
├── scripts/                # setup-скрипты
└── docker-compose.yml
```

## Разработка

```bash
# Миграции
alembic revision --autogenerate -m "add something"
alembic upgrade head
alembic downgrade -1

# Тесты
pytest
pytest -v
pytest tests/test_api_auth.py
```

## Переменные окружения

Все настройки — в `backend/.env` (создаётся из `.env.example`).

| Переменная | Обязательна | Описание |
|---|---|---|
| `SECRET_KEY` | ✅ | Ключ JWT, ≥16 символов |
| `DATABASE_URL` | ✅ | `postgresql+psycopg://...` |
| `TEST_DATABASE_URL` | ❌ | Для тестов |
| `ENVIRONMENT` | ❌ | `development` / `production` / `test` |
| `DEBUG` | ❌ | SQL-логи |
| `CORS_ORIGINS` | ❌ | Список origin'ов через запятую |
| `ADMIN_USERNAME` | ❌ | По умолчанию `admin` |
| `ADMIN_PASSWORD` | ❌ | Для bootstrap админа, ≥8 символов |

## CI/CD

- **CI** (`backend-ci.yml`) — pytest на Postgres при push в `main`/`dev` и в PR.
- **CD** (`docker-publish.yml`) — публикация образа в GHCR при push в `main`.