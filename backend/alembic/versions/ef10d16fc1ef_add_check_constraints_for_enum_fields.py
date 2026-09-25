"""add check constraints for enum fields

Revision ID: ef10d16fc1ef
Revises: d47382d4bfb9
Create Date: 2026-09-25 16:02:22.560559

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ef10d16fc1ef'
down_revision: Union[str, Sequence[str], None] = 'd47382d4bfb9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'admin')",
    )
    op.create_check_constraint(
        "ck_tasks_status",
        "tasks",
        "status IN ('todo', 'in_progress', 'done')",
    )
    op.create_check_constraint(
        "ck_tasks_priority",
        "tasks",
        "priority IN ('low', 'medium', 'high')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_tasks_priority", "tasks", type_="check")
    op.drop_constraint("ck_tasks_status", "tasks", type_="check")
    op.drop_constraint("ck_users_role", "users", type_="check")
