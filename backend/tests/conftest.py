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
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session: Session):
    return crud_user.create(
        db_session,
        UserCreate(username="test_user", password="test-password-123"),
    )


@pytest.fixture
def auth_client(client: TestClient, test_user) -> TestClient:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "test_user", "password": "test-password-123"},
    )
    assert response.status_code == 200, response.text
    return client