"""Authentication API routes – signup, login, and current user info."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models.user import User
from app.schemas import SignupRequest, LoginRequest, TokenResponse, UserResponse
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def signup(request: Request, req: SignupRequest, db: Session = Depends(get_db)):
    """Create a new user account and return a JWT token."""
    email = req.email.strip().lower()
    username = req.username.strip()

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email address is required")

    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Case-insensitive duplicate check for email and username
    if db.query(User).filter(func.lower(User.email) == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(User).filter(func.lower(User.username) == username.lower()).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=email,
        username=username,
        hashed_password=get_password_hash(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("20/minute")
def login(request: Request, req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user using either username or email and return a JWT token."""
    identifier = req.username.strip()
    if not identifier or not req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Match identifier against username OR email, case-insensitively
    user = db.query(User).filter(
        or_(
            func.lower(User.username) == identifier.lower(),
            func.lower(User.email) == identifier.lower(),
        )
    ).first()

    if not user:
        # Hash a dummy password to maintain constant execution timing and prevent user enumeration
        get_password_hash("dummy_timing_filler")
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
@limiter.limit("60/minute")
def get_me(request: Request, current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user
