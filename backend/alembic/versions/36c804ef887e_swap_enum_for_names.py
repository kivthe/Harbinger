"""Swap enum for names

Revision ID: 36c804ef887e
Revises: 98a35dcc9d83
Create Date: 2026-09-25 15:52:24.125865

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '36c804ef887e'
down_revision: Union[str, Sequence[str], None] = '98a35dcc9d83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("UPDATE users SET role = LOWER(role)")
    op.execute("UPDATE tasks SET status = LOWER(status)")
    op.execute("UPDATE tasks SET priority = LOWER(priority)")


def downgrade() -> None:
    op.execute("UPDATE users SET role = UPPER(role)")
    op.execute("UPDATE tasks SET status = UPPER(status)")
    op.execute("UPDATE tasks SET priority = UPPER(priority)")