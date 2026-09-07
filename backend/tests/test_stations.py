def test_create_station(client, auth_headers):
    resp = client.post(
        "/api/stations",
        json={"name": "PC-01", "hourly_rate": 60.0},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "available"
    assert resp.json()["hourly_rate"] == 60.0


def test_duplicate_station_name(client, auth_headers):
    payload = {"name": "PC-01"}
    assert client.post("/api/stations", json=payload, headers=auth_headers).status_code == 201
    assert client.post("/api/stations", json=payload, headers=auth_headers).status_code == 400


def test_update_station_status(client, auth_headers):
    created = client.post(
        "/api/stations", json={"name": "PC-02"}, headers=auth_headers
    ).json()
    resp = client.patch(
        f"/api/stations/{created['id']}",
        json={"status": "maintenance"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "maintenance"


def test_list_stations_requires_auth(client):
    assert client.get("/api/stations").status_code == 401
