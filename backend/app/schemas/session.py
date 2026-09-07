from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..models import SessionStatus


class SessionStart(BaseModel):
    station_id: int
    customer_id: int | None = None
    customer_name: str | None = None
    customer_phone: str | None = None
    prepaid_minutes: int = 0  # 0 = pay at end


class SessionEnd(BaseModel):
    pass


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    station_id: int
    customer_id: int | None
    started_by: int
    started_at: datetime
    ended_at: datetime | None
    status: SessionStatus
    hourly_rate: float
    amount_due: float
    amount_paid: float
