from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.crud import task as crud_task
from app.crud import user as crud_user
from app.db.session import get_db
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import TaskFilter, TaskRead
from app.schemas.user import UserRead, UserRoleUpdate

router = APIRouter()


# ─── Users ────────────────────────────────────────────────

@router.get("/users", response_model=list[UserRead])
def list_users(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[User]:
    return crud_user.list_users(db, limit=limit, offset=offset)


@router.get("/users/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> User:
    user = crud_user.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
) -> User:
    user = crud_user.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    if (
        user.id == current_admin.id
        and data.role is not None
        and data.role != current_admin.role
    ):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Cannot change your own role",
        )

    return crud_user.update_role(db, user, data)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
) -> None:
    if user_id == current_admin.id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Cannot delete yourself",
        )

    user = crud_user.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    crud_user.delete(db, user)


# ─── Tasks ────────────────────────────────────────────────

@router.get("/tasks", response_model=list[TaskRead])
def list_all_tasks(
    status_: TaskStatus | None = Query(default=None, alias="status"),
    priority: TaskPriority | None = None,
    q: str | None = Query(default=None, max_length=200),
    include_deleted: bool = Query(default=True),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[Task]:
    filters = TaskFilter(
        status=status_,
        priority=priority,
        q=q,
        include_deleted=include_deleted,
        only_deleted=False,
        limit=limit,
        offset=offset,
    )
    return crud_task.list_tasks(db, owner_id=None, filters=filters)