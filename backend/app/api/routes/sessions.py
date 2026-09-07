from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import CafeSession, Customer, SessionStatus, Station, StationStatus, User
from ...schemas.session import SessionOut, SessionStart
from ...services.billing import compute_due, minutes_elapsed, settle
from ..deps import get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionOut])
def list_sessions(
    active_only: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    qq = db.query(CafeSession)
    if active_only:
        qq = qq.filter(CafeSession.status == SessionStatus.ACTIVE)
    return qq.order_by(CafeSession.started_at.desc()).limit(100).all()


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def start_session(
    body: SessionStart,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    station = db.get(Station, body.station_id)
    if station is None:
        raise HTTPException(status_code=404, detail="Station not found")
    if station.status != StationStatus.AVAILABLE:
        raise HTTPException(
            status_code=409, detail=f"Station is {station.status.value}, not available"
        )

    customer_id = body.customer_id
    if customer_id is None and (body.customer_name or body.customer_phone):
        customer = Customer(
            name=body.customer_name or "Walk-in",
            phone=body.customer_phone,
        )
        db.add(customer)
        db.flush()
        customer_id = customer.id

    session = CafeSession(
        station_id=station.id,
        customer_id=customer_id,
        started_by=user.id,
        hourly_rate=float(station.hourly_rate),
    )
    if body.prepaid_minutes > 0:
        prepaid = round(body.prepaid_minutes * float(station.hourly_rate) / 60.0, 2)
        session.amount_paid = prepaid

    station.status = StationStatus.IN_USE
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/end", response_model=SessionOut)
def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    session = db.get(CafeSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Session is not active")

    now = datetime.now(timezone.utc)
    session.ended_at = now
    session.status = SessionStatus.ENDED
    session.amount_due = compute_due(session, now)

    station = db.get(Station, session.station_id)
    if station is not None:
        station.status = StationStatus.AVAILABLE

    db.commit()
    db.refresh(session)
    return session


@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    session = db.get(CafeSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/{session_id}/balance")
def session_balance(
    session_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    session = db.get(CafeSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    due = compute_due(session)
    return {
        "session_id": session.id,
        "status": session.status.value,
        "minutes": minutes_elapsed(session),
        "amount_due": due,
        "amount_paid": float(session.amount_paid),
        "balance": settle(session),
    }
