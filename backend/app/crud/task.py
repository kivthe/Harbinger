from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskFilter, TaskUpdate


def get_by_id(
    db: Session,
    task_id: int,
    *,
    owner_id: int | None = None,
    include_deleted: bool = False,
) -> Task | None:
    stmt = select(Task).where(Task.id == task_id)
    if owner_id is not None:
        stmt = stmt.where(Task.owner_id == owner_id)
    if not include_deleted:
        stmt = stmt.where(Task.deleted_at.is_(None))
    return db.scalar(stmt)


def list_tasks(
    db: Session,
    *,
    owner_id: int | None = None,
    filters: TaskFilter | None = None,
) -> list[Task]:
    filters = filters or TaskFilter()
    stmt = select(Task)

    if owner_id is not None:
        stmt = stmt.where(Task.owner_id == owner_id)

    if filters.only_deleted:
        stmt = stmt.where(Task.deleted_at.is_not(None))
    elif not filters.include_deleted:
        stmt = stmt.where(Task.deleted_at.is_(None))
    # include_deleted=True и not only_deleted → не фильтруем по deleted_at

    if filters.status is not None:
        stmt = stmt.where(Task.status == filters.status)

    if filters.priority is not None:
        stmt = stmt.where(Task.priority == filters.priority)

    if filters.q:
        like = f"%{filters.q}%"
        stmt = stmt.where(
            or_(Task.title.ilike(like), Task.description.ilike(like))
        )

    stmt = stmt.order_by(Task.created_at.desc()).limit(filters.limit).offset(filters.offset)
    return list(db.scalars(stmt).all())


def count_tasks(
    db: Session,
    *,
    owner_id: int | None = None,
    include_deleted: bool = False,
    only_deleted: bool = False,
) -> int:
    stmt = select(func.count()).select_from(Task)
    if owner_id is not None:
        stmt = stmt.where(Task.owner_id == owner_id)
    if only_deleted:
        stmt = stmt.where(Task.deleted_at.is_not(None))
    elif not include_deleted:
        stmt = stmt.where(Task.deleted_at.is_(None))
    return db.scalar(stmt) or 0


def create(db: Session, data: TaskCreate, *, owner_id: int) -> Task:
    task = Task(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        due_date=data.due_date,
        owner_id=owner_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update(db: Session, task: Task, data: TaskUpdate) -> Task:
    payload = data.model_dump(exclude_unset=True)
    for field, value in payload.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def update_status(db: Session, task: Task, new_status: TaskStatus) -> Task:
    task.status = new_status
    db.commit()
    db.refresh(task)
    return task


def toggle_done(db: Session, task: Task) -> Task:
    task.status = TaskStatus.TODO if task.status == TaskStatus.DONE else TaskStatus.DONE
    db.commit()
    db.refresh(task)
    return task


def soft_delete(db: Session, task: Task) -> Task:
    if task.deleted_at is None:
        task.deleted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
    return task


def restore(db: Session, task: Task) -> Task:
    if task.deleted_at is not None:
        task.deleted_at = None
        db.commit()
        db.refresh(task)
    return task


def hard_delete(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()


def clear_trash(db: Session, owner_id: int | None = None) -> int:
    stmt = select(Task).where(Task.deleted_at.is_not(None))
    if owner_id is not None:
        stmt = stmt.where(Task.owner_id == owner_id)
    tasks = list(db.scalars(stmt).all())
    for task in tasks:
        db.delete(task)
    db.commit()
    return len(tasks)