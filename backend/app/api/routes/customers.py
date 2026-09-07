from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Customer, User
from ...schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from ..deps import get_current_user

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=list[CustomerOut])
def list_customers(
    q: str = "",
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    qq = db.query(Customer)
    if q:
        qq = qq.filter(Customer.name.ilike(f"%{q}%") | Customer.phone.ilike(f"%{q}%"))
    return qq.order_by(Customer.name).all()


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    body: CustomerCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if body.phone:
        existing = db.query(Customer).filter(Customer.phone == body.phone).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone already registered")
    customer = Customer(**body.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.patch("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    body: CustomerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer
