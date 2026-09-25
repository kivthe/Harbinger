from fastapi.testclient import TestClient


def _create_task(auth_client: TestClient, title: str = "Task") -> dict:
    r = auth_client.post("/api/v1/tasks", json={"title": title})
    assert r.status_code == 201, r.text
    return r.json()


def _soft_delete(auth_client: TestClient, task_id: int) -> None:
    r = auth_client.delete(f"/api/v1/tasks/{task_id}")
    assert r.status_code == 204, r.text


def test_trash_empty(auth_client: TestClient) -> None:
    r = auth_client.get("/api/v1/trash")
    assert r.status_code == 200
    assert r.json() == []


def test_soft_delete_moves_to_trash(auth_client: TestClient) -> None:
    task = _create_task(auth_client, "To delete")
    _soft_delete(auth_client, task["id"])

    r = auth_client.get("/api/v1/trash")
    assert r.status_code == 200
    body = r.json()
    assert len(body) == 1
    assert body[0]["id"] == task["id"]
    assert body[0]["deleted_at"] is not None


def test_restore_from_trash(auth_client: TestClient) -> None:
    task = _create_task(auth_client, "Restore me")
    _soft_delete(auth_client, task["id"])

    r = auth_client.patch(f"/api/v1/trash/{task['id']}/restore")
    assert r.status_code == 200
    assert r.json()["deleted_at"] is None

    # снова в активных
    r = auth_client.get("/api/v1/tasks")
    assert len(r.json()) == 1

    # и не в корзине
    r = auth_client.get("/api/v1/trash")
    assert r.json() == []


def test_restore_active_task_404(auth_client: TestClient) -> None:
    #Нельзя восстановить задачу, которая не в корзине.
    task = _create_task(auth_client, "Active")
    r = auth_client.patch(f"/api/v1/trash/{task['id']}/restore")
    assert r.status_code == 404


def test_hard_delete(auth_client: TestClient) -> None:
    task = _create_task(auth_client, "Delete forever")
    _soft_delete(auth_client, task["id"])

    r = auth_client.delete(f"/api/v1/trash/{task['id']}")
    assert r.status_code == 204

    # нет ни в активных, ни в корзине
    assert auth_client.get("/api/v1/tasks").json() == []
    assert auth_client.get("/api/v1/trash").json() == []


def test_hard_delete_active_task_404(auth_client: TestClient) -> None:
    #Нельзя hard delete'нуть активную задачу — сначала в корзину.
    task = _create_task(auth_client, "Active")
    r = auth_client.delete(f"/api/v1/trash/{task['id']}")
    assert r.status_code == 404


def test_clear_trash(auth_client: TestClient) -> None:
    t1 = _create_task(auth_client, "A")
    t2 = _create_task(auth_client, "B")
    t3 = _create_task(auth_client, "C")
    _soft_delete(auth_client, t1["id"])
    _soft_delete(auth_client, t2["id"])

    r = auth_client.delete("/api/v1/trash")
    assert r.status_code == 200
    assert r.json() == {"deleted": 2}

    # в корзине пусто, но t3 в активных остался
    assert auth_client.get("/api/v1/trash").json() == []
    active = auth_client.get("/api/v1/tasks").json()
    assert len(active) == 1
    assert active[0]["id"] == t3["id"]


def test_trash_isolation(
    client: TestClient, auth_client: TestClient
) -> None:
    # Юзер не видит чужую корзину и не может восстановить чужую задачу.
    from app.crud import user as crud_user
    from app.schemas.user import UserCreate

    # auth_client — это test_user; создаём задачу и удаляем её
    task = _create_task(auth_client, "Secret task")
    _soft_delete(auth_client, task["id"])

    # логинимся другим юзером (используем тот же client — он без cookie)
    client.post("/api/v1/auth/logout")

    # для создания второго юзера нужен доступ к БД; используем register через API
    r = client.post(
        "/api/v1/auth/register",
        json={"username": "another", "password": "another-password-123"},
    )
    assert r.status_code == 201

    # у другого корзина пуста
    assert client.get("/api/v1/trash").json() == []

    # не может восстановить чужую
    r = client.patch(f"/api/v1/trash/{task['id']}/restore")
    assert r.status_code == 404

    # не может hard delete'нуть чужую
    r = client.delete(f"/api/v1/trash/{task['id']}")
    assert r.status_code == 404