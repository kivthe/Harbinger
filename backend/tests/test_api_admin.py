from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud import user as crud_user
from app.schemas.user import UserCreate


def test_admin_users_requires_admin(auth_client: TestClient) -> None:
    r = auth_client.get("/api/v1/admin/users")
    assert r.status_code == 403


def test_admin_users_requires_login(client: TestClient) -> None:
    r = client.get("/api/v1/admin/users")
    assert r.status_code == 401


def test_admin_can_list_users(admin_client: TestClient) -> None:
    r = admin_client.get("/api/v1/admin/users")
    assert r.status_code == 200
    usernames = {u["username"] for u in r.json()}
    assert "admin_user" in usernames


def test_admin_can_get_user(admin_client: TestClient) -> None:
    users = admin_client.get("/api/v1/admin/users").json()
    uid = users[0]["id"]
    r = admin_client.get(f"/api/v1/admin/users/{uid}")
    assert r.status_code == 200


def test_admin_get_unknown_user_404(admin_client: TestClient) -> None:
    r = admin_client.get("/api/v1/admin/users/999999")
    assert r.status_code == 404


def test_admin_can_update_user_role(
    admin_client: TestClient, db_session: Session
) -> None:
    u = crud_user.create(
        db_session,
        UserCreate(username="promote_me", password="promote-me-123"),
    )
    r = admin_client.patch(
        f"/api/v1/admin/users/{u.id}",
        json={"role": "admin"},
    )
    assert r.status_code == 200
    assert r.json()["role"] == "admin"


def test_admin_can_deactivate_user(
    admin_client: TestClient, db_session: Session
) -> None:
    u = crud_user.create(
        db_session,
        UserCreate(username="deactivate_me", password="deactivate-me-123"),
    )
    r = admin_client.patch(
        f"/api/v1/admin/users/{u.id}",
        json={"is_active": False},
    )
    assert r.status_code == 200
    assert r.json()["is_active"] is False


def test_admin_cannot_change_own_role(admin_client: TestClient) -> None:
    me = admin_client.get("/api/v1/auth/me").json()
    r = admin_client.patch(
        f"/api/v1/admin/users/{me['id']}",
        json={"role": "user"},
    )
    assert r.status_code == 400


def test_admin_cannot_delete_self(admin_client: TestClient) -> None:
    me = admin_client.get("/api/v1/auth/me").json()
    r = admin_client.delete(f"/api/v1/admin/users/{me['id']}")
    assert r.status_code == 400


def test_admin_can_delete_user(
    admin_client: TestClient, db_session: Session
) -> None:
    u = crud_user.create(
        db_session,
        UserCreate(username="delete_me", password="delete-me-123"),
    )
    r = admin_client.delete(f"/api/v1/admin/users/{u.id}")
    assert r.status_code == 204

    r = admin_client.get(f"/api/v1/admin/users/{u.id}")
    assert r.status_code == 404


def test_admin_list_all_tasks(
    admin_client: TestClient, auth_client: TestClient
) -> None:
    r = auth_client.post("/api/v1/tasks", json={"title": "User's task"})
    assert r.status_code == 201, r.text

    r = admin_client.get("/api/v1/admin/tasks")
    assert r.status_code == 200, r.text
    titles = {t["title"] for t in r.json()}
    assert "User's task" in titles


def test_admin_sees_deleted_tasks(
    admin_client: TestClient, auth_client: TestClient
) -> None:
    created = auth_client.post("/api/v1/tasks", json={"title": "Soon deleted"}).json()
    r = auth_client.delete(f"/api/v1/tasks/{created['id']}")
    assert r.status_code == 204, r.text

    r = admin_client.get("/api/v1/admin/tasks")
    assert r.status_code == 200, r.text
    ids = {t["id"] for t in r.json()}
    assert created["id"] in ids


def test_admin_can_exclude_deleted(
    admin_client: TestClient, auth_client: TestClient
) -> None:
    created = auth_client.post("/api/v1/tasks", json={"title": "Exclude me"}).json()
    r = auth_client.delete(f"/api/v1/tasks/{created['id']}")
    assert r.status_code == 204, r.text

    r = admin_client.get("/api/v1/admin/tasks?include_deleted=false")
    assert r.status_code == 200, r.text
    ids = {t["id"] for t in r.json()}
    assert created["id"] not in ids