from fastapi import Request
from sqladmin.authentication import AuthenticationBackend

from app.core.security import decode_token
from app.crud import user as crud_user
from app.db.session import SessionLocal
from app.models.user import UserRole


ACCESS_COOKIE = "access_token"


class AdminAuth(AuthenticationBackend):
    """Пускать только админов, у которых валидная JWT-кука."""

    async def login(self, request: Request) -> bool:
        """SQLAdmin сам вызывает это при попытке залогиниться через /admin/login.
        Мы не даём логиниться через SQLAdmin — только через API. Всегда False."""
        return False

    async def logout(self, request: Request) -> bool:
        """Разлогин — просто снимаем куку access_token."""
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        """Проверяет cookie и роль. Вызывается на каждый запрос к /admin."""
        token = request.cookies.get(ACCESS_COOKIE)
        if not token:
            return False

        payload = decode_token(token)
        if payload is None or payload.get("type") != "access":
            return False

        try:
            user_id = int(payload["sub"])
        except (KeyError, ValueError, TypeError):
            return False

        db = SessionLocal()
        try:
            user = crud_user.get_by_id(db, user_id)
            if user is None or not user.is_active:
                return False
            if user.role != UserRole.ADMIN:
                return False
        finally:
            db.close()

        return True