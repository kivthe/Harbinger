from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User, UserRole


def test_create_user_with_defaults(db_session: Session) -> None:
    user = User(username="alice", hashed_password="hashed")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.role == UserRole.USER
    assert user.is_active is True


def test_create_task_linked_to_user(db_session: Session) -> None:
    user = User(username="bob", hashed_password="hashed")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    task = Task(title="Write docs", owner_id=user.id)
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    assert task.id is not None
    assert task.status == TaskStatus.TODO
    assert task.priority == TaskPriority.MEDIUM
    assert task.deleted_at is None


def test_query_active_tasks(db_session: Session) -> None:
    user = User(username="carol", hashed_password="hashed")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    active = Task(title="Active", owner_id=user.id)
    deleted = Task(title="Deleted", owner_id=user.id)
    db_session.add_all([active, deleted])
    db_session.commit()
    db_session.refresh(deleted)

    deleted.deleted_at = datetime.now(timezone.utc)
    db_session.commit()

    result = db_session.execute(select(Task).where(Task.deleted_at.is_(None)))
    tasks = result.scalars().all()

    assert len(tasks) == 1
    assert tasks[0].title == "Active"