from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.crud import user as crud_user
from app.db.session import get_db
from app.models.user import User, UserRole


def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )

    if access_token is None:
        raise credentials_exception

    payload = decode_token(access_token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception

    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError, TypeError):
        raise credentials_exception

    user = crud_user.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user