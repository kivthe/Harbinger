from fastapi.testclient import TestClient


def _is_denied(status: int) -> bool:
    """Редирект/401/403 — всё это 'не пустили'."""
    return status in (301, 302, 307, 308, 401, 403)


def test_admin_panel_redirects_anonymous(client: TestClient) -> None:
    r = client.get("/admin/", follow_redirects=False)
    assert _is_denied(r.status_code), f"Got {r.status_code}"


def test_admin_panel_forbidden_for_user(auth_client: TestClient) -> None:
    r = auth_client.get("/admin/", follow_redirects=False)
    assert _is_denied(r.status_code), f"Got {r.status_code}"


def test_admin_panel_accessible_for_admin(admin_client: TestClient) -> None:
    """Админ попадает в админку (с учётом редиректов)."""
    r = admin_client.get("/admin/", follow_redirects=True)
    assert r.status_code == 200, f"Got {r.status_code}: {r.text[:200]}"


def test_admin_panel_users_page(admin_client: TestClient) -> None:
    r = admin_client.get("/admin/user/list", follow_redirects=True)
    assert r.status_code == 200, f"Got {r.status_code}"


def test_admin_panel_tasks_page(admin_client: TestClient) -> None:
    r = admin_client.get("/admin/task/list", follow_redirects=True)
    assert r.status_code == 200, f"Got {r.status_code}"