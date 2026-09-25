from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud import user as crud_user
from app.schemas.user import UserCreate


def _login(client: TestClient, username: str, password: str) -> None:
    r = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert r.status_code == 200, r.text


def test_create_task(auth_client: TestClient) -> None:
    r = auth_client.post(
        "/api/v1/tasks",
        json={"title": "First task", "priority": "high"},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["title"] == "First task"
    assert body["status"] == "todo"
    assert body["priority"] == "high"
    assert body["deleted_at"] is None


def test_list_tasks_empty(auth_client: TestClient) -> None:
    r = auth_client.get("/api/v1/tasks")
    assert r.status_code == 200
    assert r.json() == []


def test_list_tasks_filters(auth_client: TestClient) -> None:
    auth_client.post("/api/v1/tasks", json={"title": "A", "priority": "low"})
    auth_client.post("/api/v1/tasks", json={"title": "B", "priority": "high"})
    auth_client.post("/api/v1/tasks", json={"title": "C", "priority": "high"})

    r = auth_client.get("/api/v1/tasks?priority=high")
    assert r.status_code == 200
    assert len(r.json()) == 2

    r = auth_client.get("/api/v1/tasks?q=A")
    assert len(r.json()) == 1


def test_get_task(auth_client: TestClient) -> None:
    created = auth_client.post("/api/v1/tasks", json={"title": "X"}).json()
    r = auth_client.get(f"/api/v1/tasks/{created['id']}")
    assert r.status_code == 200
    assert r.json()["title"] == "X"


def test_update_task(auth_client: TestClient) -> None:
    created = auth_client.post("/api/v1/tasks", json={"title": "Old"}).json()
    r = auth_client.patch(
        f"/api/v1/tasks/{created['id']}",
        json={"title": "New", "priority": "low"},
    )
    assert r.status_code == 200
    assert r.json()["title"] == "New"
    assert r.json()["priority"] == "low"


def test_update_status(auth_client: TestClient) -> None:
    created = auth_client.post("/api/v1/tasks", json={"title": "X"}).json()
    r = auth_client.patch(
        f"/api/v1/tasks/{created['id']}/status",
        json={"status": "in_progress"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "in_progress"


def test_toggle_done(auth_client: TestClient) -> None:
    created = auth_client.post("/api/v1/tasks", json={"title": "X"}).json()
    r = auth_client.patch(f"/api/v1/tasks/{created['id']}/toggle")
    assert r.json()["status"] == "done"
    r = auth_client.patch(f"/api/v1/tasks/{created['id']}/toggle")
    assert r.json()["status"] == "todo"


def test_soft_delete_task(auth_client: TestClient) -> None:
    created = auth_client.post("/api/v1/tasks", json={"title": "X"}).json()
    r = auth_client.delete(f"/api/v1/tasks/{created['id']}")
    assert r.status_code == 204

    # в списке больше нет
    r = auth_client.get("/api/v1/tasks")
    assert r.json() == []

    # GET по id — 404 (потому что soft deleted)
    r = auth_client.get(f"/api/v1/tasks/{created['id']}")
    assert r.status_code == 404


def test_unauthenticated_401(client: TestClient) -> None:
    r = client.get("/api/v1/tasks")
    assert r.status_code == 401


def test_isolation_between_users(
    client: TestClient, db_session: Session
) -> None:
    # создаём двух юзеров
    crud_user.create(db_session, UserCreate(username="alice", password="alice-password-123"))
    crud_user.create(db_session, UserCreate(username="bob", password="bob-password-123"))

    # alice создаёт задачу
    _login(client, "alice", "alice-password-123")
    created = client.post("/api/v1/tasks", json={"title": "Alice's task"}).json()
    task_id = created["id"]

    # logout alice
    client.post("/api/v1/auth/logout")

    # bob логинится
    _login(client, "bob", "bob-password-123")

    # bob не видит задачу alice
    r = client.get("/api/v1/tasks")
    assert r.json() == []

    # bob не может получить задачу alice по id — 404
    r = client.get(f"/api/v1/tasks/{task_id}")
    assert r.status_code == 404

    # bob не может обновить задачу alice
    r = client.patch(f"/api/v1/tasks/{task_id}", json={"title": "Hacked"})
    assert r.status_code == 404

    # bob не может удалить задачу alice
    r = client.delete(f"/api/v1/tasks/{task_id}")
    assert r.status_code == 404