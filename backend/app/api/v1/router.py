from fastapi import APIRouter

from app.api.v1 import admin, auth, tasks, trash, users

router = APIRouter(prefix="/v1")

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
router.include_router(trash.router, prefix="/trash", tags=["trash"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])