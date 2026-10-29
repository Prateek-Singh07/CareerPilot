import os
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

import app.database as app_db
from app.database import Base, get_db
from app.auth import get_password_hash, create_access_token
from app.models.user import User
from app.models.interview import session_manager
from main import app, limiter as main_limiter
from app.api.auth_router import limiter as auth_limiter

# Isolated in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch):
    """Ensure all database operations during tests target the isolated in-memory DB."""
    monkeypatch.setattr(app_db, "engine", test_engine)
    monkeypatch.setattr(app_db, "SessionLocal", TestingSessionLocal)

    main_limiter.enabled = False
    auth_limiter.enabled = False

    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session_manager._sessions.clear()

    yield

    Base.metadata.drop_all(bind=test_engine)
    session_manager._sessions.clear()


@pytest.fixture
def db():
    """Provide a database session connected to the in-memory test DB."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    """Provide a FastAPI TestClient with DB dependency overridden."""
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def demo_user(client, db):
    """Retrieve or create the verified demo user in the test database."""
    user = db.query(User).filter(User.username == "demo").first()
    if not user:
        user = User(
            email="demo@careerpilot.ai",
            username="demo",
            hashed_password=get_password_hash("Demo@123"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@pytest.fixture
def auth_headers(demo_user):
    """Return Authorization Bearer headers for the demo user."""
    token = create_access_token(data={"sub": str(demo_user.id)})
    return {"Authorization": f"Bearer {token}"}
