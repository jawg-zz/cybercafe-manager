from datetime import datetime

from pydantic import BaseModel

from ..models import Role


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    full_name: str


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: Role = Role.CASHIER


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: Role
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
