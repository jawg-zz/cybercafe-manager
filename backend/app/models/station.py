import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class StationStatus(str, enum.Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class Station(Base):
    __tablename__ = "stations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    specs: Mapped[str] = mapped_column(String(255), default="")
    hourly_rate: Mapped[float] = mapped_column(Numeric(10, 2), default=50.00)
    status: Mapped[StationStatus] = mapped_column(
        Enum(StationStatus), default=StationStatus.AVAILABLE
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
