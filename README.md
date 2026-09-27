# Harbinger

Harbinger - это такс-трекер с повозможность создания и отслеживания задач. Имеет встроеный аудиоплеер

[![Backend CI](https://github.com/kivthe/Harbinger/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/kivthe/Harbinger/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/kivthe/Harbinger/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/kivthe/Harbinger/actions/workflows/frontend-ci.yml)
[![Publish Docker images](https://github.com/kivthe/Harbinger/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/kivthe/Harbinger/actions/workflows/docker-publish.yml)

## Стек

**Backend**
- Python 3.12, FastAPI, Uvicorn
- SQLAlchemy 2.0 (sync) + psycopg 3
- Alembic (миграции)
- Pydantic v2 + pydantic-settings
- python-jose (JWT), pwdlib + bcrypt
- SQLAdmin
- pytest

**Frontend**
- React 18 + TypeScript
- Vite, React Router v6
- TanStack Query, Zustand
- Tailwind CSS
- `@dnd-kit/core` (drag&drop)
- Axios

**База данных** — PostgreSQL 16

**Инфраструктура**
- Docker + docker-compose
- Nginx (внутри frontend-образа)
- GitHub Actions (CI/CD)
- GHCR (публикация образов)

## Быстрый старт

### Требования

- Python 3.12+
- PostgreSQL 16
- Node.js 20+
- *(опционально)* Docker Desktop

### Установка

### Docker:
**Windows:**
```cmd
copy .env.example .env
```
**Linux:**
```bash
cp .env.example .env
```
---
```bash
docker compose up --build
```

### Windows (CMD):
**Бэкенд:**
```cmd
net start postgresql-x64-16
psql -U postgres -h localhost
```
```cmd
CREATE USER taskuser WITH PASSWORD 'taskpass';
CREATE DATABASE harbinger OWNER taskuser;
CREATE DATABASE harbinger_test OWNER taskuser;
\q
```
```cmd
psql -U taskuser -h localhost -d harbinger -c "SELECT 1"

cd backend
python -m venv .venv
.venv\Scripts\activate.bat
```
```cmd
python -m pip install --upgrade pip
pip install -r requirements.txt

copy .env.example .env

alembic upgrade head
python -m app.scripts.create_admin

uvicorn app.main:app --reload
```
---
**Фронтенд:**
```cmd
cd frontend
npm install
npm run dev
```
---
### Linux / macOS:
**Бэкенд:**
```bash
sudo systemctl start postgresql
sudo -u postgres psql
```
```bash
CREATE USER taskuser WITH PASSWORD 'taskpass';
CREATE DATABASE harbinger OWNER taskuser;
CREATE DATABASE harbinger_test OWNER taskuser;
\q
```
```bash
psql -U taskuser -h localhost -d harbinger -c "SELECT 1"

cd backend
python3 -m venv .venv
source .venv/bin/activate
```
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env

alembic upgrade head
python -m app.scripts.create_admin

uvicorn app.main:app --reload
```
---
**Фронтенд:**
```bash
cd frontend
npm install
npm run dev
```
---
## Использование
Проверка фронтенда:
- Главная страница: http://localhost:5173

Проверка бэкенда:
- Swagger:  http://localhost:8000/docs
- SQLAdmin: http://localhost:8000/admin (Нужна предварительная авторизация через Swagger)
- Health:   http://localhost:8000/health




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