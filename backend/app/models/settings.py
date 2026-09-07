from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class CafeSettings(Base):
    """Singleton row (id=1) holding cafe-wide configuration."""

    __tablename__ = "cafe_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    cafe_name: Mapped[str] = mapped_column(String(100), default="My Cyber Cafe")
    currency: Mapped[str] = mapped_column(String(10), default="KES")
    tax_rate: Mapped[float] = mapped_column(default=0.0)
    default_hourly_rate: Mapped[float] = mapped_column(default=50.00)
    opening_time: Mapped[str] = mapped_column(String(5), default="08:00")
    closing_time: Mapped[str] = mapped_column(String(5), default="22:00")
