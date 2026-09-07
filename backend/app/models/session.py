import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class SessionStatus(str, enum.Enum):
    ACTIVE = "active"
    ENDED = "ended"
    CANCELLED = "cancelled"


class CafeSession(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"))
    customer_id: Mapped[int | None] = mapped_column(
        ForeignKey("customers.id"), nullable=True
    )
    started_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus), default=SessionStatus.ACTIVE
    )
    hourly_rate: Mapped[float] = mapped_column(Numeric(10, 2))
    amount_due: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)
    amount_paid: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)

    station = relationship("Station")
    customer = relationship("Customer")
