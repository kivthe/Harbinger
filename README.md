# Harbinger - таск-трекер

Таск-трекер на FastAPI (backend) + React (frontend) + PostgreSQL, с SQLAdmin,
аутентификацией по username/password и CI/CD через GitHub Actions.

## Стек

### Backend
- Python 3.12, FastAPI, Uvicorn
- SQLAlchemy 2.0 (async), Alembic, asyncpg
- Pydantic v2 + pydantic-settings
- JWT (httpOnly cookie), passlib[bcrypt]
- SQLAdmin — готовая админка на `/admin`
- pytest, pytest-asyncio, httpx, ruff

### Frontend
- React 18 + TypeScript
- Vite (сборка и dev-сервер)
- React Router v6
- TanStack Query v5 — серверные данные
- Zustand — клиентский стейт (auth)
- react-hook-form + zod — формы
- Tailwind CSS + shadcn/ui
- Axios — HTTP-клиент с refresh-интерцептором

### Инфраструктура
- PostgreSQL 16 (локально, в CI, в проде — одинаковая)
- Docker — только для CI/CD и прода (локально не требуется)
- GitHub Actions: `backend-ci.yml`, `frontend-ci.yml`, `docker-publish.yml`