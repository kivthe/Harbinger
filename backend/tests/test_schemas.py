import pytest
from pydantic import ValidationError

from app.models.task import TaskPriority, TaskStatus
from app.models.user import UserRole
from app.schemas.task import TaskCreate, TaskFilter, TaskUpdate
from app.schemas.user import UserCreate


def test_user_create_valid() -> None:
    u = UserCreate(username="alice", password="strong-password-123")
    assert u.username == "alice"


def test_user_create_short_username_fails() -> None:
    with pytest.raises(ValidationError):
        UserCreate(username="a", password="strong-password-123")


def test_user_create_short_password_fails() -> None:
    with pytest.raises(ValidationError):
        UserCreate(username="alice", password="short")


def test_user_create_invalid_username_chars_fails() -> None:
    with pytest.raises(ValidationError):
        UserCreate(username="alice with spaces", password="strong-password-123")


def test_task_create_defaults() -> None:
    t = TaskCreate(title="Do something")
    assert t.status == TaskStatus.TODO
    assert t.priority == TaskPriority.MEDIUM


def test_task_create_invalid_priority() -> None:
    with pytest.raises(ValidationError):
        TaskCreate(title="x", priority="super-high")  # type: ignore[arg-type]


def test_task_update_partial() -> None:
    t = TaskUpdate(title="New title")
    assert t.title == "New title"
    assert t.description is None


def test_task_filter_defaults() -> None:
    f = TaskFilter()
    assert f.include_deleted is False
    assert f.limit == 100
    assert f.offset == 0


def test_task_filter_limit_bounds() -> None:
    with pytest.raises(ValidationError):
        TaskFilter(limit=0)
    with pytest.raises(ValidationError):
        TaskFilter(limit=1000)