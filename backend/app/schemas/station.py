from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..models import StationStatus


class StationCreate(BaseModel):
    name: str
    specs: str = ""
    hourly_rate: float = 50.00


class StationUpdate(BaseModel):
    name: str | None = None
    specs: str | None = None
    hourly_rate: float | None = None
    status: StationStatus | None = None


class StationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    specs: str
    hourly_rate: float
    status: StationStatus
    created_at: datetime
