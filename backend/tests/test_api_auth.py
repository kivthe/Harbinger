from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud import user as crud_user


def test_register(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "newuser", "password": "new-password-123"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "newuser"
    assert body["role"] == "user"
    assert "hashed_password" not in body
    # cookie установилась
    assert "access_token" in response.cookies


def test_register_duplicate(client: TestClient, test_user) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "test_user", "password": "another-pass-123"},
    )
    assert response.status_code == 409


def test_login_success(client: TestClient, test_user) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "test_user", "password": "test-password-123"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "test_user"
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies


def test_login_wrong_password(client: TestClient, test_user) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "test_user", "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_login_unknown_user(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "ghost", "password": "whatever"},
    )
    assert response.status_code == 401


def test_me_authenticated(auth_client: TestClient) -> None:
    response = auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "test_user"


def test_me_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout(auth_client: TestClient) -> None:
    response = auth_client.post("/api/v1/auth/logout")
    assert response.status_code == 204
    # после logout cookie нет
    follow_up = auth_client.get("/api/v1/auth/me")
    assert follow_up.status_code == 401


def test_refresh(auth_client: TestClient) -> None:
    response = auth_client.post("/api/v1/auth/refresh")
    assert response.status_code == 200
    assert response.json()["username"] == "test_user"


def test_users_me(auth_client: TestClient) -> None:
    response = auth_client.get("/api/v1/users/me")
    assert response.status_code == 200
    assert response.json()["username"] == "test_user"