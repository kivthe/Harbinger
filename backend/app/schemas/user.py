from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):

    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserRoleUpdate(BaseModel):

    role: UserRole | None = None
    is_active: bool | None = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    is_active: bool
    created_at: datetime