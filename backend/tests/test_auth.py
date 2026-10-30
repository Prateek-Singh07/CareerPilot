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
        "email": demo_user.email.upper(),
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


def test_login_with_hirepilot_app_email(client, demo_user):
    res = client.post("/api/auth/login", json={
        "username": "demo@hirepilot.app",
        "password": "Demo@123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_with_careerpilot_ai_email(client, demo_user):
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
        "username": "Demo@HirePilot.App",
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
        "username": "demo@hirepilot.app",
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
    assert data["email"] in ["demo@hirepilot.app", "demo@careerpilot.ai"]


def test_demo_account_initialization_and_repair(db):
    from app.auth import ensure_demo_user, verify_password, get_password_hash
    from app.models.user import User

    # 1. Ensure created
    user1 = ensure_demo_user(db)
    assert user1.username == "demo"
    assert user1.email == "demo@hirepilot.app"
    assert verify_password("Demo@123", user1.hashed_password)

    # 2. Idempotent call doesn't duplicate
    user2 = ensure_demo_user(db)
    assert user2.id == user1.id

    # 3. Repair if password hash corrupted
    user1.hashed_password = "corrupted_invalid_hash"
    db.commit()
    user3 = ensure_demo_user(db)
    assert verify_password("Demo@123", user3.hashed_password)

    # 4. Normal user is not overwritten or affected
    normal_user = User(
        email="normal@example.com",
        username="normaluser",
        hashed_password=get_password_hash("MySecret@456"),
    )
    db.add(normal_user)
    db.commit()

    ensure_demo_user(db)
    refreshed_normal = db.query(User).filter(User.username == "normaluser").first()
    assert refreshed_normal is not None
    assert verify_password("MySecret@456", refreshed_normal.hashed_password)

