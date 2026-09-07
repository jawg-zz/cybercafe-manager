from datetime import datetime, timedelta, timezone

from app.database import SessionLocal
from app.models import CafeSession, SessionStatus, Station, StationStatus


def _make_station(client, auth_headers, name="PC-01"):
    return client.post(
        "/api/stations", json={"name": name, "hourly_rate": 60.0}, headers=auth_headers
    ).json()


def test_start_session_marks_station_in_use(client, auth_headers):
    station = _make_station(client, auth_headers)
    resp = client.post(
        "/api/sessions", json={"station_id": station["id"]}, headers=auth_headers
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "active"

    stations = client.get("/api/stations", headers=auth_headers).json()
    assert next(s for s in stations if s["id"] == station["id"])["status"] == "in_use"


def test_cannot_start_session_on_busy_station(client, auth_headers):
    station = _make_station(client, auth_headers)
    client.post("/api/sessions", json={"station_id": station["id"]}, headers=auth_headers)
    resp = client.post(
        "/api/sessions", json={"station_id": station["id"]}, headers=auth_headers
    )
    assert resp.status_code == 409


def test_end_session_computes_due(client, auth_headers):
    station = _make_station(client, auth_headers)
    session = client.post(
        "/api/sessions", json={"station_id": station["id"]}, headers=auth_headers
    ).json()

    # Backdate the session start so billing has something to compute
    db = SessionLocal()
    row = db.get(CafeSession, session["id"])
    row.started_at = datetime.now(timezone.utc) - timedelta(hours=1)
    db.commit()
    db.close()

    resp = client.post(f"/api/sessions/{session['id']}/end", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ended"
    assert body["amount_due"] == 60.0  # 1 hour at 60/hour

    stations = client.get("/api/stations", headers=auth_headers).json()
    assert next(s for s in stations if s["id"] == station["id"])["status"] == "available"


def test_prepaid_session(client, auth_headers):
    station = _make_station(client, auth_headers)
    resp = client.post(
        "/api/sessions",
        json={"station_id": station["id"], "prepaid_minutes": 30},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["amount_paid"] == 30.0  # 30 min at 60/hr


def test_balance_endpoint(client, auth_headers):
    station = _make_station(client, auth_headers)
    session = client.post(
        "/api/sessions", json={"station_id": station["id"]}, headers=auth_headers
    ).json()
    resp = client.get(f"/api/sessions/{session['id']}/balance", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "active"
    assert resp.json()["balance"] >= 0
