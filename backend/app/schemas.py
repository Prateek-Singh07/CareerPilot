"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, EmailStr


# ── Auth Schemas ──────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    username: str

    model_config = {"from_attributes": True}


class ErrorResponse(BaseModel):
    detail: str
