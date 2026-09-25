from sqladmin import ModelView
from sqladmin.filters import (
    AllUniqueStringValuesFilter,
    BooleanFilter,
    ForeignKeyFilter,
)

from app.models.task import Task
from app.models.user import User


class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"

    column_list = [
        User.id,
        User.username,
        User.role,
        User.is_active,
        User.created_at,
    ]
    column_searchable_list = [User.username]
    column_sortable_list = [
        User.id,
        User.username,
        User.role,
        User.is_active,
        User.created_at,
    ]
    column_filters = [
        AllUniqueStringValuesFilter(User.role),
        BooleanFilter(User.is_active),
    ]
    column_details_exclude_list = [User.hashed_password]
    form_excluded_columns = [User.hashed_password]
    can_create = False
    can_delete = True
    page_size = 50


class TaskAdmin(ModelView, model=Task):
    name = "Task"
    name_plural = "Tasks"
    icon = "fa-solid fa-list-check"

    column_list = [
        Task.id,
        Task.title,
        Task.status,
        Task.priority,
        Task.owner_id,
        Task.due_date,
        Task.deleted_at,
        Task.created_at,
    ]
    column_searchable_list = [Task.title, Task.description]
    column_sortable_list = [
        Task.id,
        Task.title,
        Task.status,
        Task.priority,
        Task.created_at,
        Task.due_date,
    ]
    column_filters = [
        AllUniqueStringValuesFilter(Task.status),
        AllUniqueStringValuesFilter(Task.priority),
        ForeignKeyFilter(Task.owner_id, User.username),
    ]
    can_create = False
    can_delete = True
    page_size = 50