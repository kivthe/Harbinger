from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.crud import user as crud_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest
from app.schemas.user import UserCreate, UserRead

router = APIRouter()

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"

ACCESS_MAX_AGE = settings.access_token_expire_minutes * 60
REFRESH_MAX_AGE = settings.refresh_token_expire_days * 24 * 60 * 60


def _set_auth_cookies(response: Response, user: User) -> None:
    access = create_access_token(user_id=user.id, role=user.role.value)
    refresh = create_refresh_token(user_id=user.id, role=user.role.value)

    response.set_cookie(
        ACCESS_COOKIE, access,
        max_age=ACCESS_MAX_AGE, httponly=True, samesite="lax",
        secure=settings.is_production, path="/",
    )
    response.set_cookie(
        REFRESH_COOKIE, refresh,
        max_age=REFRESH_MAX_AGE, httponly=True, samesite="lax",
        secure=settings.is_production, path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(
    data: UserCreate,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    if crud_user.get_by_username(db, data.username) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")

    user = crud_user.create(db, data)
    _set_auth_cookies(response, user)
    return user


@router.post("/login", response_model=UserRead)
def login(
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    user = crud_user.authenticate(db, data.username, data.password)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")

    _set_auth_cookies(response, user)
    return user


@router.post("/refresh", response_model=UserRead)
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    token = request.cookies.get(REFRESH_COOKIE)
    if token is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh token")

    payload = decode_token(token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")

    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token payload")

    user = crud_user.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")

    _set_auth_cookies(response, user)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    _clear_auth_cookies(response)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user