"""Database setup with SQLAlchemy.

Supports SQLite (default) and PostgreSQL via DATABASE_URL env var.
"""

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("hirepilot.database")

# ── Determine database URL ────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(DB_DIR, exist_ok=True)
    DB_PATH = os.path.join(DB_DIR, "ai_career.db")
    DATABASE_URL = f"sqlite:///{DB_PATH}"
    logger.info("DATABASE_URL not set — falling back to SQLite: %s", DB_PATH)

# SQLite needs check_same_thread=False for FastAPI's threaded access
_connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    _connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Verify the database is reachable. Returns True if connected."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error("Database connection check failed: %s", exc)
        return False


def init_db():
    """Create all tables. Called at startup."""
    from app.models.user import User  # noqa: F401 – registers model
    from app.models.interview import InterviewSessionDB  # noqa: F401
    Base.metadata.create_all(bind=engine)
