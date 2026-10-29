def test_root_endpoint(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "CareerPilot AI API"
    assert data["status"] == "running"
    assert data["service"] == "careerpilot-api"


def test_health_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "UP"
    assert data["database"] == "connected"
    assert data["service"] == "careerpilot-api"

