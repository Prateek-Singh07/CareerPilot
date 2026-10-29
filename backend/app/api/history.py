"""Interview history endpoint — returns past sessions for the current user."""

import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.interview import InterviewSessionDB
from app.models.user import User
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api", tags=["History"])


@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all interview sessions for the current user, ordered by newest first."""
    sessions = (
        db.query(InterviewSessionDB)
        .filter(InterviewSessionDB.user_id == current_user.id)
        .order_by(InterviewSessionDB.created_at.desc())
        .all()
    )

    result = []
    for s in sessions:
        scores = json.loads(s.scores_json) if s.scores_json else []
        avg_score = round(sum(scores) / len(scores), 2) if scores else 0

        result.append({
            "id": s.id,
            "date": s.created_at.isoformat() if s.created_at else None,
            "total_questions": s.total_questions,
            "questions_answered": len(json.loads(s.answers_json) if s.answers_json else []),
            "average_score": avg_score,
            "completed": bool(s.completed),
            "is_demo": bool(getattr(s, "is_demo", 0)),
        })

    return {"sessions": result, "total": len(result)}
