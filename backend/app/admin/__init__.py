from app.admin.auth import AdminAuth
from app.admin.views import TaskAdmin, UserAdmin
from app.db.session import engine
from sqladmin import Admin


def create_admin(app) -> Admin:
    """Создаёт SQLAdmin с кастомной аутентификацией."""
    admin = Admin(
        app,
        engine,
        authentication_backend=AdminAuth(secret_key=""),  # секрет не нужен, читаем JWT
        title="Harbinger Admin",
        base_url="/admin",
    )
    admin.add_view(UserAdmin)
    admin.add_view(TaskAdmin)
    return admin