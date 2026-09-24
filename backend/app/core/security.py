from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ─── Пароли ───────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Хеширует пароль через bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет пароль против хеша."""
    return pwd_context.verify(plain_password, hashed_password)


# ─── JWT ──────────────────────────────────────────────────

ALGORITHM = "HS256"


def _create_token(
    subject: int,
    role: str,
    expires_delta: timedelta,
    token_type: str,
) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "type": token_type,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def create_access_token(user_id: int, role: str) -> str:
    return _create_token(
        subject=user_id,
        role=role,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        token_type="access",
    )


def create_refresh_token(user_id: int, role: str) -> str:
    return _create_token(
        subject=user_id,
        role=role,
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
        token_type="refresh",
    )


def decode_token(token: str) -> dict[str, Any] | None:
    """Декодирует JWT. Возвращает payload или None, если токен невалиден."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return None