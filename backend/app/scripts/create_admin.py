"""
Запуск:
    python -m app.scripts.create_admin
"""

from app.core.config import settings
from app.crud import user as crud_user
from app.db.session import SessionLocal
from app.models.user import UserRole
from app.schemas.user import UserCreate


def main() -> None:
    username = settings.admin_username
    password = settings.admin_password

    if not password:
        print("ADMIN_PASSWORD is not set in .env — skipping")
        return

    db = SessionLocal()
    try:
        existing = crud_user.get_by_username(db, username)
        if existing is not None:
            print(f"Admin '{username}' already exists (id={existing.id})")
            return

        admin = crud_user.create(
            db,
            UserCreate(username=username, password=password),
            role=UserRole.ADMIN,
        )
        print(f"Created admin '{admin.username}' (id={admin.id})")
    finally:
        db.close()


if __name__ == "__main__":
    main()