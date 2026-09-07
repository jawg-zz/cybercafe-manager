def test_dashboard(client, auth_headers):
    resp = client.get("/api/reports/dashboard", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["stations_total"] == 0
    assert body["active_sessions"] == 0
    assert body["today_revenue"] == 0.0


def test_dashboard_reflects_activity(client, auth_headers):
    station = client.post(
        "/api/stations", json={"name": "PC-01"}, headers=auth_headers
    ).json()
    client.post(
        "/api/sessions", json={"station_id": station["id"]}, headers=auth_headers
    )
    client.post(
        "/api/payments", json={"amount": 200.0, "method": "cash"}, headers=auth_headers
    )

    body = client.get("/api/reports/dashboard", headers=auth_headers).json()
    assert body["stations_total"] == 1
    assert body["active_sessions"] == 1
    assert body["today_revenue"] == 200.0


def test_revenue_report(client, auth_headers):
    client.post(
        "/api/payments", json={"amount": 75.0, "method": "cash"}, headers=auth_headers
    )
    resp = client.get("/api/reports/revenue", headers=auth_headers)
    assert resp.status_code == 200
    days = resp.json()["days"]
    assert len(days) >= 1
    assert days[-1]["revenue"] == 75.0


def test_csv_export(client, auth_headers):
    client.post(
        "/api/payments", json={"amount": 30.0, "method": "cash"}, headers=auth_headers
    )
    resp = client.get("/api/reports/export", headers=auth_headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert "amount" in resp.text
