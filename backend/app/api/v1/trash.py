from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud import task as crud_task
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskFilter, TaskRead

router = APIRouter()


def _get_deleted_or_404(
    db: Session,
    task_id: int,
    current_user: User,
) -> Task:
    task = crud_task.get_by_id(
        db, task_id,
        owner_id=current_user.id,
        include_deleted=True,
    )
    if task is None or task.deleted_at is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found in trash")
    return task


@router.get("", response_model=list[TaskRead])
def list_trash(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Task]:
    filters = TaskFilter(
        only_deleted=True,
        limit=limit,
        offset=offset,
    )
    return crud_task.list_tasks(db, owner_id=current_user.id, filters=filters)


@router.patch("/{task_id}/restore", response_model=TaskRead)
def restore_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    task = _get_deleted_or_404(db, task_id, current_user)
    return crud_task.restore(db, task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def hard_delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    task = _get_deleted_or_404(db, task_id, current_user)
    crud_task.hard_delete(db, task)


@router.delete("", status_code=status.HTTP_200_OK)
def clear_trash(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, int]:
    deleted_count = crud_task.clear_trash(db, owner_id=current_user.id)
    return {"deleted": deleted_count}