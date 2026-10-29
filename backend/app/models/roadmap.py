"""Career roadmap database model."""

import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class CareerRoadmapDB(Base):
    __tablename__ = "career_roadmaps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    target_role = Column(String, nullable=False)
    skill_level = Column(String, nullable=False)
    existing_skills = Column(Text, default="")
    hours_per_week = Column(Integer, default=10)
    timeline = Column(String, default="")
    next_action = Column(Text, default="")
    roadmap_json = Column(Text, default="{}")

    user = relationship("User")

    def get_roadmap(self) -> dict:
        return json.loads(self.roadmap_json) if self.roadmap_json else {}

