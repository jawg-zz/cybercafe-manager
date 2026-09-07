from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import CafeSession, Product, SaleItem, SessionStatus, User
from ...schemas.product import ProductCreate, ProductOut, ProductUpdate, SaleItemCreate, SaleItemOut
from ..deps import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(
    category: str = "",
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    qq = db.query(Product)
    if category:
        qq = qq.filter(Product.category == category)
    return qq.order_by(Product.category, Product.name).all()


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    body: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    product = Product(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    body: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/stock", response_model=ProductOut)
def adjust_stock(
    product_id: int,
    delta: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    product.stock = max(0, product.stock + delta)
    db.commit()
    db.refresh(product)
    return product


@router.post("/sell", response_model=SaleItemOut, status_code=status.HTTP_201_CREATED)
def sell_item(
    body: SaleItemCreate,
    session_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    session = db.get(CafeSession, session_id)
    if session is None or session.status != SessionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Active session required")
    product = db.get(Product, body.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < body.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    product.stock -= body.quantity
    item = SaleItem(
        session_id=session.id,
        product_id=product.id,
        quantity=body.quantity,
        unit_price=float(product.price),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
