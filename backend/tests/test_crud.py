from sqlalchemy.orm import Session

from app.crud import task as crud_task
from app.crud import user as crud_user
from app.models.task import TaskPriority, TaskStatus
from app.models.user import UserRole
from app.schemas.task import TaskCreate, TaskFilter, TaskUpdate
from app.schemas.user import UserCreate, UserRoleUpdate, UserUpdate


# ─── User CRUD ───────────────────────────────────────────

def test_create_user_hashes_password(db_session: Session) -> None:
    user = crud_user.create(
        db_session,
        UserCreate(username="alice", password="strong-password-123"),
    )
    assert user.id is not None
    assert user.hashed_password != "strong-password-123"
    assert user.role == UserRole.USER


def test_authenticate_success(db_session: Session) -> None:
    crud_user.create(
        db_session, UserCreate(username="bob", password="strong-password-123")
    )
    user = crud_user.authenticate(db_session, "bob", "strong-password-123")
    assert user is not None
    assert user.username == "bob"


def test_authenticate_wrong_password(db_session: Session) -> None:
    crud_user.create(
        db_session, UserCreate(username="bob", password="strong-password-123")
    )
    assert crud_user.authenticate(db_session, "bob", "wrong") is None


def test_authenticate_unknown_user(db_session: Session) -> None:
    assert crud_user.authenticate(db_session, "ghost", "any") is None


def test_update_password(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="carol", password="old-password-123")
    )
    crud_user.update_password(db_session, user, UserUpdate(password="new-password-456"))
    assert crud_user.authenticate(db_session, "carol", "new-password-456") is not None


def test_update_role_and_active(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="dave", password="strong-password-123")
    )
    crud_user.update_role(
        db_session, user, UserRoleUpdate(role=UserRole.ADMIN, is_active=False)
    )
    assert user.role == UserRole.ADMIN
    assert user.is_active is False


# ─── Task CRUD ───────────────────────────────────────────

def test_create_task(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="owner", password="strong-password-123")
    )
    t = crud_task.create(
        db_session,
        TaskCreate(title="Write docs", priority=TaskPriority.HIGH),
        owner_id=user.id,
    )
    assert t.id is not None
    assert t.title == "Write docs"
    assert t.priority == TaskPriority.HIGH
    assert t.status == TaskStatus.TODO
    assert t.owner_id == user.id


def test_list_active_tasks(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="owner", password="strong-password-123")
    )
    crud_task.create(db_session, TaskCreate(title="A"), owner_id=user.id)
    crud_task.create(db_session, TaskCreate(title="B"), owner_id=user.id)

    tasks = crud_task.list_tasks(db_session, owner_id=user.id)
    assert len(tasks) == 2
    assert {t.title for t in tasks} == {"A", "B"}


def test_soft_delete_and_restore(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="owner", password="strong-password-123")
    )
    t = crud_task.create(db_session, TaskCreate(title="X"), owner_id=user.id)

    crud_task.soft_delete(db_session, t)
    assert t.deleted_at is not None
    assert crud_task.list_tasks(db_session, owner_id=user.id) == []

    trash = crud_task.list_tasks(
        db_session, owner_id=user.id, filters=TaskFilter(include_deleted=True)
    )
    assert len(trash) == 1

    crud_task.restore(db_session, t)
    assert t.deleted_at is None
    assert len(crud_task.list_tasks(db_session, owner_id=user.id)) == 1


def test_update_task(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="owner", password="strong-password-123")
    )
    t = crud_task.create(db_session, TaskCreate(title="Old"), owner_id=user.id)
    crud_task.update(db_session, t, TaskUpdate(title="New", priority=TaskPriority.LOW))
    assert t.title == "New"
    assert t.priority == TaskPriority.LOW


def test_toggle_done(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="owner", password="strong-password-123")
    )
    t = crud_task.create(db_session, TaskCreate(title="X"), owner_id=user.id)
    assert t.status == TaskStatus.TODO

    crud_task.toggle_done(db_session, t)
    assert t.status == TaskStatus.DONE

    crud_task.toggle_done(db_session, t)
    assert t.status == TaskStatus.TODO


def test_hard_delete(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="owner", password="strong-password-123")
    )
    t = crud_task.create(db_session, TaskCreate(title="X"), owner_id=user.id)
    crud_task.soft_delete(db_session, t)
    crud_task.hard_delete(db_session, t)

    assert crud_task.get_by_id(db_session, t.id, include_deleted=True) is None


def test_clear_trash(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="owner", password="strong-password-123")
    )
    t1 = crud_task.create(db_session, TaskCreate(title="A"), owner_id=user.id)
    t2 = crud_task.create(db_session, TaskCreate(title="B"), owner_id=user.id)
    crud_task.soft_delete(db_session, t1)
    crud_task.soft_delete(db_session, t2)

    count = crud_task.clear_trash(db_session, owner_id=user.id)
    assert count == 2
    assert crud_task.list_tasks(db_session, owner_id=user.id) == []


def test_search_filter(db_session: Session) -> None:
    user = crud_user.create(
        db_session, UserCreate(username="owner", password="strong-password-123")
    )
    crud_task.create(db_session, TaskCreate(title="Buy milk"), owner_id=user.id)
    crud_task.create(db_session, TaskCreate(title="Read book"), owner_id=user.id)

    result = crud_task.list_tasks(
        db_session, owner_id=user.id, filters=TaskFilter(q="milk")
    )
    assert len(result) == 1
    assert result[0].title == "Buy milk"