import csv
import io
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import (
    CafeSession,
    Payment,
    PaymentStatus,
    SessionStatus,
    Station,
    StationStatus,
    User,
)
from ..deps import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


def _day_bounds(day: date) -> tuple[datetime, datetime]:
    """Naive UTC bounds — SQLite stores naive datetimes."""
    start = datetime.combine(day, time.min)
    end = start + timedelta(days=1)
    return start, end


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    today_start, _ = _day_bounds(date.today())

    stations = db.query(Station).all()
    status_counts = {s.value: 0 for s in StationStatus}
    for st in stations:
        status_counts[st.status.value] = status_counts.get(st.status.value, 0) + 1

    today_revenue = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            Payment.status == PaymentStatus.COMPLETED,
            Payment.created_at >= today_start,
        )
        .scalar()
    )

    active_sessions = (
        db.query(CafeSession)
        .filter(CafeSession.status == SessionStatus.ACTIVE)
        .count()
    )

    return {
        "stations_total": len(stations),
        "stations_by_status": status_counts,
        "active_sessions": active_sessions,
        "today_revenue": float(today_revenue or 0),
    }


@router.get("/revenue")
def revenue_report(
    start: date = Query(default_factory=lambda: date.today() - timedelta(days=6)),
    end: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    start_dt, _ = _day_bounds(start)
    _, end_dt = _day_bounds(end)
    rows = (
        db.query(
            func.date(Payment.created_at).label("day"),
            func.sum(Payment.amount).label("total"),
            func.count(Payment.id).label("count"),
        )
        .filter(
            Payment.status == PaymentStatus.COMPLETED,
            Payment.created_at >= start_dt,
            Payment.created_at < end_dt,
        )
        .group_by(func.date(Payment.created_at))
        .order_by(func.date(Payment.created_at))
        .all()
    )
    return {
        "start": start.isoformat(),
        "end": end.isoformat(),
        "days": [
            {"date": r.day, "revenue": float(r.total or 0), "payments": r.count}
            for r in rows
        ],
    }


@router.get("/utilization")
def utilization(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Minutes of usage per station over the last 7 days."""
    since = datetime.now(timezone.utc) - timedelta(days=7)
    rows = (
        db.query(
            Station.name.label("station"),
            func.coalesce(
                func.sum(
                    func.julianday(CafeSession.ended_at)
                    - func.julianday(CafeSession.started_at)
                )
                * 1440,
                0,
            ).label("minutes"),
        )
        .join(CafeSession, CafeSession.station_id == Station.id)
        .filter(
            CafeSession.status == SessionStatus.ENDED,
            CafeSession.ended_at >= since,
        )
        .group_by(Station.id)
        .order_by(Station.name)
        .all()
    )
    return [
        {"station": r.station, "minutes": round(float(r.minutes or 0), 1)} for r in rows
    ]


@router.get("/export")
def export_csv(
    start: date = Query(default_factory=lambda: date.today() - timedelta(days=30)),
    end: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    start_dt, _ = _day_bounds(start)
    _, end_dt = _day_bounds(end)
    payments = (
        db.query(Payment)
        .filter(
            Payment.status == PaymentStatus.COMPLETED,
            Payment.created_at >= start_dt,
            Payment.created_at < end_dt,
        )
        .order_by(Payment.created_at)
        .all()
    )
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["date", "method", "amount", "reference", "session_id"])
    for p in payments:
        writer.writerow(
            [
                p.created_at.isoformat(),
                p.method.value,
                float(p.amount),
                p.reference,
                p.session_id or "",
            ]
        )
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=payments.csv"},
    )
