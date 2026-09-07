from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import CafeSession, Payment, PaymentMethod, PaymentStatus, User
from ...schemas.payment import PaymentCreate, PaymentOut
from ...services.payments import CashProvider, MpesaStubProvider
from ..deps import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])

PROVIDERS = {
    PaymentMethod.CASH: CashProvider(),
    PaymentMethod.MPESA: MpesaStubProvider(),
}


@router.get("", response_model=list[PaymentOut])
def list_payments(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Payment).order_by(Payment.created_at.desc()).limit(100).all()


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(
    body: PaymentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    session = None
    if body.session_id is not None:
        session = db.get(CafeSession, body.session_id)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found")

    provider = PROVIDERS[body.method]
    result = provider.charge(body.amount, phone=body.phone)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    payment = Payment(
        session_id=body.session_id,
        amount=body.amount,
        method=body.method,
        status=PaymentStatus.COMPLETED,
        reference=result.reference,
        received_by=user.id,
    )
    db.add(payment)

    if session is not None:
        session.amount_paid = float(session.amount_paid) + body.amount

    db.commit()
    db.refresh(payment)
    return payment
