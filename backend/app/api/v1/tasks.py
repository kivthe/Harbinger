from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus
from app.core.deps import get_current_user
from app.crud import task as crud_task
from app.db.session import get_db
from app.models.task import TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskFilter,
    TaskRead,
    TaskStatusUpdate,
    TaskUpdate,
)

router = APIRouter()


def _get_owned_or_404(
    db: Session,
    task_id: int,
    current_user: User,
) -> "Task":
    task = crud_task.get_by_id(db, task_id, owner_id=current_user.id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return task


@router.get("", response_model=list[TaskRead])
def list_tasks(
    status_: TaskStatus | None = Query(default=None, alias="status"),
    priority: TaskPriority | None = None,
    q: str | None = Query(default=None, max_length=200),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list["Task"]:
    filters = TaskFilter(
        status=status_,
        priority=priority,
        q=q,
        limit=limit,
        offset=offset,
        include_deleted=False,
    )
    return crud_task.list_tasks(db, owner_id=current_user.id, filters=filters)


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> "Task":
    return crud_task.create(db, data, owner_id=current_user.id)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> "Task":
    return _get_owned_or_404(db, task_id, current_user)


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> "Task":
    task = _get_owned_or_404(db, task_id, current_user)
    return crud_task.update(db, task, data)


@router.patch("/{task_id}/status", response_model=TaskRead)
def update_status(
    task_id: int,
    data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> "Task":
    task = _get_owned_or_404(db, task_id, current_user)
    return crud_task.update_status(db, task, data.status)


@router.patch("/{task_id}/toggle", response_model=TaskRead)
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> "Task":
    task = _get_owned_or_404(db, task_id, current_user)
    return crud_task.toggle_done(db, task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    task = _get_owned_or_404(db, task_id, current_user)
    crud_task.soft_delete(db, task)