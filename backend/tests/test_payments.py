def test_cash_payment(client, auth_headers):
    resp = client.post(
        "/api/payments",
        json={"amount": 100.0, "method": "cash"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "completed"
    assert body["reference"].startswith("CASH-")


def test_mpesa_stub_payment(client, auth_headers):
    resp = client.post(
        "/api/payments",
        json={"amount": 50.0, "method": "mpesa", "phone": "0712345678"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["reference"].startswith("MPESA-")


def test_mpesa_requires_phone(client, auth_headers):
    resp = client.post(
        "/api/payments",
        json={"amount": 50.0, "method": "mpesa"},
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_payment_attached_to_session(client, auth_headers):
    station = client.post(
        "/api/stations", json={"name": "PC-01"}, headers=auth_headers
    ).json()
    session = client.post(
        "/api/sessions", json={"station_id": station["id"]}, headers=auth_headers
    ).json()

    resp = client.post(
        "/api/payments",
        json={"session_id": session["id"], "amount": 50.0, "method": "cash"},
        headers=auth_headers,
    )
    assert resp.status_code == 201

    balance = client.get(
        f"/api/sessions/{session['id']}/balance", headers=auth_headers
    ).json()
    assert balance["amount_paid"] == 50.0


def test_negative_amount_rejected(client, auth_headers):
    resp = client.post(
        "/api/payments",
        json={"amount": -5.0, "method": "cash"},
        headers=auth_headers,
    )
    assert resp.status_code == 400
