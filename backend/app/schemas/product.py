from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    name: str
    category: str = "snacks"
    price: float
    stock: int = 0


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    price: float | None = None
    stock: int | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    price: float
    stock: int
    created_at: datetime


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class SaleItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: float
    product_name: str | None = None
