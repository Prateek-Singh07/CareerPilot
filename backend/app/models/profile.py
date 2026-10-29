"""Career profile database model."""

import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class CareerProfileDB(Base):
    __tablename__ = "career_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    target_role = Column(String(120), nullable=False)
    current_skills_json = Column(Text, default="[]")
    experience_level = Column(String(50), nullable=False, default="Beginner")
    weekly_hours = Column(Integer, nullable=False, default=10)
    career_goals = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")

    def get_skills(self) -> list:
        if not self.current_skills_json:
            return []
        try:
            val = json.loads(self.current_skills_json)
            return val if isinstance(val, list) else []
        except Exception:
            return []

    def set_skills(self, skills: list):
        if not isinstance(skills, list):
            skills = []
        # Clean, trim, and deduplicate preserving order
        cleaned = []
        seen = set()
        for s in skills:
            if s and isinstance(s, str):
                trimmed = s.strip()
                if trimmed and trimmed.lower() not in seen:
                    cleaned.append(trimmed)
                    seen.add(trimmed.lower())
        self.current_skills_json = json.dumps(cleaned)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "target_role": self.target_role,
            "current_skills": self.get_skills(),
            "experience_level": self.experience_level,
            "weekly_hours": self.weekly_hours,
            "career_goals": self.career_goals or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

