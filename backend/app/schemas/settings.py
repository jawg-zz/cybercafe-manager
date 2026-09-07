from pydantic import BaseModel, ConfigDict


class SettingsUpdate(BaseModel):
    cafe_name: str | None = None
    currency: str | None = None
    tax_rate: float | None = None
    default_hourly_rate: float | None = None
    opening_time: str | None = None
    closing_time: str | None = None


class SettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cafe_name: str
    currency: str
    tax_rate: float
    default_hourly_rate: float
    opening_time: str
    closing_time: str
