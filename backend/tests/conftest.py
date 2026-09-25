from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.crud import user as crud_user
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User, UserRole
from app.schemas.user import UserCreate


@pytest.fixture(scope="session")
def test_engine() -> Generator[Engine, None, None]:
    url = settings.test_database_url or settings.database_url
    engine = create_engine(url, echo=False)

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    yield engine

    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def db_session(test_engine: Engine) -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection, expire_on_commit=False)()

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def _override_db(db_session: Session) -> Generator[None, None, None]:
    """Общий override get_db — работает на уровне приложения."""

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client(_override_db) -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture
def test_user(db_session: Session) -> User:
    return crud_user.create(
        db_session,
        UserCreate(username="test_user", password="test-password-123"),
    )


@pytest.fixture
def auth_client(
    _override_db, test_user: User
) -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        r = c.post(
            "/api/v1/auth/login",
            json={"username": "test_user", "password": "test-password-123"},
        )
        assert r.status_code == 200, r.text
        yield c


@pytest.fixture
def admin_user(db_session: Session) -> User:
    return crud_user.create(
        db_session,
        UserCreate(username="admin_user", password="admin-password-123"),
        role=UserRole.ADMIN,
    )


@pytest.fixture
def admin_client(
    _override_db, admin_user: User
) -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        r = c.post(
            "/api/v1/auth/login",
            json={"username": "admin_user", "password": "admin-password-123"},
        )
        assert r.status_code == 200, r.text
        yield c