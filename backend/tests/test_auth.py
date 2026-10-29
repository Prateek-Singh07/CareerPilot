def test_signup_success(client):
    res = client.post("/api/auth/signup", json={
        "email": "candidate@example.com",
        "username": "candidate123",
        "password": "Password123!",
    })
    assert res.status_code == 201
    assert "access_token" in res.json()


def test_signup_duplicate_email_case_insensitive(client, demo_user):
    res = client.post("/api/auth/signup", json={
        "email": "DEMO@CAREERPILOT.AI",
        "username": "unique_user",
        "password": "Password123!",
    })
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"].lower()


def test_signup_duplicate_username_case_insensitive(client, demo_user):
    res = client.post("/api/auth/signup", json={
        "email": "unique@example.com",
        "username": "DEMO",
        "password": "Password123!",
    })
    assert res.status_code == 400
    assert "already taken" in res.json()["detail"].lower()


def test_signup_invalid_data(client):
    # Short password
    res = client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "123",
    })
    assert res.status_code == 400

    # Invalid email
    res = client.post("/api/auth/signup", json={
        "email": "notanemail",
        "username": "testuser",
        "password": "Password123!",
    })
    assert res.status_code == 400


def test_login_with_username(client, demo_user):
    res = client.post("/api/auth/login", json={
        "username": "demo",
        "password": "Demo@123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_with_email(client, demo_user):
    res = client.post("/api/auth/login", json={
        "username": "demo@careerpilot.ai",
        "password": "Demo@123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_with_case_differences(client, demo_user):
    # Capitalized username
    res = client.post("/api/auth/login", json={
        "username": "Demo",
        "password": "Demo@123",
    })
    assert res.status_code == 200

    # All-caps username
    res = client.post("/api/auth/login", json={
        "username": "DEMO",
        "password": "Demo@123",
    })
    assert res.status_code == 200

    # Mixed-case email
    res = client.post("/api/auth/login", json={
        "username": "Demo@CareerPilot.AI",
        "password": "Demo@123",
    })
    assert res.status_code == 200


def test_login_with_whitespace_trimming(client, demo_user):
    res = client.post("/api/auth/login", json={
        "username": "  demo  ",
        "password": "Demo@123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_invalid_password(client, demo_user):
    res = client.post("/api/auth/login", json={
        "username": "demo",
        "password": "WrongPassword!",
    })
    assert res.status_code == 401
    assert "invalid username or password" in res.json()["detail"].lower()


def test_login_non_existent_user(client):
    res = client.post("/api/auth/login", json={
        "username": "nonexistent_user",
        "password": "Demo@123",
    })
    assert res.status_code == 401
    assert "invalid username or password" in res.json()["detail"].lower()


def test_auth_me_protected(client, auth_headers):
    # Without token
    res = client.get("/api/auth/me")
    assert res.status_code == 401

    # With valid token
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "demo"
    assert data["email"] == "demo@careerpilot.ai"

