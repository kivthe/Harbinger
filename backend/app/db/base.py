from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Базовый класс для всех SQLAlchemy-моделей."""
    pass

from app.models import task, user  # noqa: E402, F401