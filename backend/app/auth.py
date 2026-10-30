"""JWT authentication utilities and demo account management."""

import os
import logging
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

logger = logging.getLogger("careerpilot.auth")

# ── Config ────────────────────────────────────────────────────

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production-use-a-real-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))  # 24h by default

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

DEMO_USERNAME = "demo"
DEMO_EMAIL = "demo@hirepilot.app"
DEMO_PASSWORD_DEFAULT = "Demo@123"


# ── Password utilities ────────────────────────────────────────

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# ── Demo Account Utilities ────────────────────────────────────

def ensure_demo_user(db: Session) -> User:
    """Safely and idempotently initialize or repair the demo account.

    Guarantees:
    1. A demo user exists with username 'demo' and email 'demo@hirepilot.app'.
    2. The password hash is valid and verifies against 'Demo@123' using bcrypt.
    3. If the password hash was invalid or outdated, it is safely repaired.
    4. Normal user accounts or passwords are never altered or overwritten.
    """
    demo_user = db.query(User).filter(
        or_(
            func.lower(User.username) == DEMO_USERNAME,
            func.lower(User.email) == DEMO_EMAIL,
            func.lower(User.email) == "demo@careerpilot.ai",
        )
    ).first()

    if not demo_user:
        demo_user = User(
            email=DEMO_EMAIL,
            username=DEMO_USERNAME,
            hashed_password=get_password_hash(DEMO_PASSWORD_DEFAULT),
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        logger.info("Demo user initialized: username=%s email=%s", DEMO_USERNAME, DEMO_EMAIL)
    else:
        # Verify password validity; repair if corrupted or mismatched
        is_pwd_valid = False
        try:
            is_pwd_valid = verify_password(DEMO_PASSWORD_DEFAULT, demo_user.hashed_password)
        except Exception:
            is_pwd_valid = False

        modified = False
        if not is_pwd_valid:
            demo_user.hashed_password = get_password_hash(DEMO_PASSWORD_DEFAULT)
            modified = True
            logger.info("Repaired demo user password hash to match Demo@123")

        # Normalize demo user username and email to supported demo credentials
        if demo_user.username.lower() != DEMO_USERNAME:
            demo_user.username = DEMO_USERNAME
            modified = True
        if demo_user.email.lower() not in (DEMO_EMAIL, "demo@careerpilot.ai"):
            demo_user.email = DEMO_EMAIL
            modified = True

        if modified:
            db.commit()
            db.refresh(demo_user)

    return demo_user


# ── Token utilities ───────────────────────────────────────────

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Dependency ────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency that extracts and validates the JWT, returning the User."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
