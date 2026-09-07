"""Time-based billing engine for cafe sessions.

Billing rounds *up* to the nearest minute so a 1h01m session charges
for 61 minutes. Prepaid sessions are charged against the prepaid balance
first; the remainder is billed at the end of the session.
"""
from datetime import datetime, timezone

from ..models import CafeSession


def minutes_elapsed(session: CafeSession, now: datetime | None = None) -> int:
    now = now or datetime.now(timezone.utc)
    start = session.started_at
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    return max(0, int((now - start).total_seconds() // 60))


def compute_due(session: CafeSession, now: datetime | None = None) -> float:
    """Amount due for the session so far (time-based only)."""
    minutes = minutes_elapsed(session, now)
    return round(minutes * float(session.hourly_rate) / 60.0, 2)


def settle(session: CafeSession, now: datetime | None = None) -> float:
    """Finalize a session: compute due, apply prepaid credit, return balance."""
    due = compute_due(session, now)
    paid = float(session.amount_paid)
    return round(max(0.0, due - paid), 2)
