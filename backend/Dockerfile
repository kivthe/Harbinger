FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Системные зависимости для сборки psycopg (компилятор нужен только тут)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Копируем только requirements — для лучшего кэша слоёв
COPY requirements.txt ./

# Ставим всё в /install — потом перенесём в runtime-стадию
RUN pip install --upgrade pip \
    && pip install --prefix=/install -r requirements.txt

FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PATH="/install/bin:${PATH}"

# Только libpq (рантайм-зависимость psycopg), без компилятора
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root пользователь
RUN groupadd --system app && \
    useradd --system --gid app --home /app --shell /bin/bash app

# Переносим установленные пакеты из builder-стадии
COPY --from=builder /install /usr/local

WORKDIR /app

# Копируем код
COPY --chown=app:app . .

# Убираем лишнее (тесты, кэш, локальные env)
RUN rm -rf tests .pytest_cache .ruff_cache .coverage coverage.xml \
    && find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

USER app

EXPOSE 8000

# Healthcheck — образ сам себя проверяет
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]