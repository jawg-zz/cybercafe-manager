from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CustomerCreate(BaseModel):
    name: str
    phone: str | None = None
    notes: str = ""


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    notes: str | None = None


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str | None
    notes: str
    created_at: datetime
