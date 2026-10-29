"""Career Profile endpoints.

Allows authenticated users to manage their personalized career profile:
- Target career role
- Current skill tags
- Experience level
- Weekly study availability
- Career goals & notes

Enforces strict user isolation: each user can only read and update their own profile.
"""

import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.profile import CareerProfileDB
from app.models.user import User
from app.auth import get_current_user

logger = logging.getLogger("careerpilot.api.profile")
router = APIRouter(prefix="/api/profile", tags=["Profile"])

VALID_EXPERIENCE_LEVELS = {"beginner", "intermediate", "advanced"}


class ProfilePayload(BaseModel):
    target_role: str = Field(..., min_length=2, max_length=120)
    current_skills: List[str] = Field(default_factory=list)
    experience_level: str = Field("Beginner", min_length=2, max_length=50)
    weekly_hours: int = Field(10, ge=1, le=80)
    career_goals: Optional[str] = Field("", max_length=1000)


def _validate_payload(req: ProfilePayload):
    role = req.target_role.strip()
    if not role or len(role) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target role must be at least 2 characters long.",
        )

    # Normalize experience level
    exp = req.experience_level.strip().capitalize()
    if exp.lower() not in VALID_EXPERIENCE_LEVELS:
        exp = "Beginner"

    # Validate and clean skills
    if not isinstance(req.current_skills, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current skills must be provided as a list of strings.",
        )

    cleaned_skills = []
    seen = set()
    for s in req.current_skills:
        if isinstance(s, str):
            item = s.strip()
            if item and len(item) <= 60 and item.lower() not in seen:
                cleaned_skills.append(item)
                seen.add(item.lower())
        if len(cleaned_skills) >= 50:
            break

    # Clean goals
    goals = (req.career_goals or "").strip()
    if len(goals) > 1000:
        goals = goals[:1000]

    return role, cleaned_skills, exp, req.weekly_hours, goals


@router.get("")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the personalized career profile for the authenticated user."""
    profile = (
        db.query(CareerProfileDB)
        .filter(CareerProfileDB.user_id == current_user.id)
        .first()
    )
    if not profile:
        return {"profile": None}
    return {"profile": profile.to_dict()}


@router.put("")
@router.post("")
def save_profile(
    req: ProfilePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update the personalized career profile for the authenticated user."""
    role, skills, exp, hours, goals = _validate_payload(req)

    profile = (
        db.query(CareerProfileDB)
        .filter(CareerProfileDB.user_id == current_user.id)
        .first()
    )

    if profile:
        profile.target_role = role
        profile.set_skills(skills)
        profile.experience_level = exp
        profile.weekly_hours = hours
        profile.career_goals = goals
        profile.updated_at = datetime.utcnow()
    else:
        profile = CareerProfileDB(
            user_id=current_user.id,
            target_role=role,
            experience_level=exp,
            weekly_hours=hours,
            career_goals=goals,
        )
        profile.set_skills(skills)
        db.add(profile)

    try:
        db.commit()
        db.refresh(profile)
        logger.info("Saved career profile for user [%s] with role [%s]", current_user.username, role)
        return {
            "message": "Career profile saved successfully",
            "profile": profile.to_dict(),
        }
    except Exception as exc:
        db.rollback()
        logger.error("Failed to persist career profile: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save career profile to database.",
        )

