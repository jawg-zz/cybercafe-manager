from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..models import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    session_id: int | None = None
    amount: float
    method: PaymentMethod = PaymentMethod.CASH
    reference: str = ""
    phone: str | None = None  # required for mpesa


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int | None
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    reference: str
    received_by: int
    created_at: datetime
