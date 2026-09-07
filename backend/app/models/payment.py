import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    MPESA = "mpesa"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int | None] = mapped_column(
        ForeignKey("sessions.id"), nullable=True
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod))
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus), default=PaymentStatus.COMPLETED
    )
    reference: Mapped[str] = mapped_column(String(100), default="")
    received_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    session = relationship("CafeSession")
