def test_login_success(client, admin_token):
    assert admin_token


def test_login_wrong_password(client):
    resp = client.post(
        "/api/auth/login", json={"username": "admin", "password": "wrong"}
    )
    assert resp.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_with_token(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["username"] == "admin"
    assert resp.json()["role"] == "admin"


def test_create_user_requires_admin(client, auth_headers):
    resp = client.post(
        "/api/auth/users",
        json={"username": "cashier1", "password": "pass123", "full_name": "Cashier One"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["role"] == "cashier"


def test_create_user_duplicate(client, auth_headers):
    payload = {"username": "dup", "password": "x", "full_name": "Dup"}
    assert client.post("/api/auth/users", json=payload, headers=auth_headers).status_code == 201
    assert client.post("/api/auth/users", json=payload, headers=auth_headers).status_code == 400
