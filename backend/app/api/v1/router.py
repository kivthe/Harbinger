from fastapi import APIRouter

from app.api.v1 import auth, users

router = APIRouter(prefix="/v1")

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])