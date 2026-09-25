from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


def create_db_engine(url: str | None = None, *, echo: bool = False) -> Engine:
    return create_engine(
        url or settings.database_url,
        echo=echo or settings.debug,
        pool_pre_ping=True,
        future=True
    )


engine: Engine = create_db_engine()

SessionLocal: sessionmaker[Session] = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI-зависимость: одна сессия на запрос (синхронная)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()