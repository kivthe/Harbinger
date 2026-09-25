from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=128)


class TokenPayload(BaseModel):
    """Содержимое JWT."""

    sub: int          # user_id
    role: str         # 'user' | 'admin'
    exp: int          # unix timestamp
    type: str = "access"  # 'access' | 'refresh'