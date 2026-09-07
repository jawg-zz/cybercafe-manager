def test_create_and_sell_product(client, auth_headers):
    product = client.post(
        "/api/products",
        json={"name": "Soda", "category": "drinks", "price": 50.0, "stock": 10},
        headers=auth_headers,
    ).json()
    assert product["stock"] == 10

    station = client.post(
        "/api/stations", json={"name": "PC-01"}, headers=auth_headers
    ).json()
    session = client.post(
        "/api/sessions", json={"station_id": station["id"]}, headers=auth_headers
    ).json()

    resp = client.post(
        f"/api/products/sell?session_id={session['id']}",
        json={"product_id": product["id"], "quantity": 2},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["unit_price"] == 50.0

    updated = client.get("/api/products", headers=auth_headers).json()
    assert next(p for p in updated if p["id"] == product["id"])["stock"] == 8


def test_sell_insufficient_stock(client, auth_headers):
    product = client.post(
        "/api/products",
        json={"name": "Chips", "price": 100.0, "stock": 1},
        headers=auth_headers,
    ).json()
    station = client.post(
        "/api/stations", json={"name": "PC-01"}, headers=auth_headers
    ).json()
    session = client.post(
        "/api/sessions", json={"station_id": station["id"]}, headers=auth_headers
    ).json()

    resp = client.post(
        f"/api/products/sell?session_id={session['id']}",
        json={"product_id": product["id"], "quantity": 5},
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_stock_adjustment(client, auth_headers):
    product = client.post(
        "/api/products",
        json={"name": "Water", "price": 30.0, "stock": 5},
        headers=auth_headers,
    ).json()
    resp = client.post(
        f"/api/products/{product['id']}/stock?delta=10", headers=auth_headers
    )
    assert resp.json()["stock"] == 15
