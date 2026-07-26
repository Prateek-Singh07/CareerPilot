"""Interview session models - both in-memory session and DB persistence.

Session state is now isolated per authenticated user via InterviewSessionManager.
"""

import json
from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class InterviewSessionDB(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    total_questions = Column(Integer, default=0)
    questions_json = Column(Text, default="[]")
    answers_json = Column(Text, default="[]")
    feedbacks_json = Column(Text, default="[]")
    scores_json = Column(Text, default="[]")
    current_question = Column(Integer, default=0)
    completed = Column(Integer, default=0)

    user = relationship("User")

    def get_questions(self) -> list:
        return json.loads(self.questions_json) if self.questions_json else []

    def get_answers(self) -> list:
        return json.loads(self.answers_json) if self.answers_json else []

    def get_feedbacks(self) -> list:
        return json.loads(self.feedbacks_json) if self.feedbacks_json else []

    def get_scores(self) -> list:
        return json.loads(self.scores_json) if self.scores_json else []


class InterviewSession:
    """In-memory interview state for a single session."""

    def __init__(self):
        self.reset()

    def reset(self):
        self.questions = []
        self.answers = []
        self.feedbacks = []
        self.scores = []
        self.current_question = 0
        self.db_session_id = None

    def load_questions(self, questions):
        self.reset()
        self.questions = questions

    def get_next_question(self):
        if self.current_question >= len(self.questions):
            return None
        question = self.questions[self.current_question]
        self.current_question += 1
        return question

    def save_answer(self, answer):
        self.answers.append(answer)

    def save_feedback(self, feedback):
        self.feedbacks.append(feedback)
        if isinstance(feedback, dict) and "score" in feedback:
            self.scores.append(feedback["score"])

    def average_score(self):
        if len(self.scores) == 0:
            return 0
        return round(sum(self.scores) / len(self.scores), 2)

    def summary(self):
        return {
            "questions_answered": len(self.answers),
            "total_questions": len(self.questions),
            "average_score": self.average_score(),
            "questions": self.questions,
            "answers": self.answers,
            "feedbacks": self.feedbacks,
            "scores": self.scores,
        }

    def persist_to_db(self, user_id: int):
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            if self.db_session_id:
                rec = db.query(InterviewSessionDB).filter_by(id=self.db_session_id).first()
                if rec:
                    rec.answers_json = json.dumps(self.answers)
                    rec.feedbacks_json = json.dumps(self.feedbacks)
                    rec.scores_json = json.dumps(self.scores)
                    rec.current_question = self.current_question
                    rec.completed = 1 if self.current_question >= len(self.questions) else 0
            else:
                rec = InterviewSessionDB(
                    user_id=user_id,
                    total_questions=len(self.questions),
                    questions_json=json.dumps(self.questions),
                    answers_json=json.dumps(self.answers),
                    feedbacks_json=json.dumps(self.feedbacks),
                    scores_json=json.dumps(self.scores),
                    current_question=self.current_question,
                    completed=0,
                )
                db.add(rec)
                db.commit()
                db.refresh(rec)
                self.db_session_id = rec.id
            db.commit()
        finally:
            db.close()


class InterviewSessionManager:
    """Manages per-user interview sessions in memory.

    Each authenticated user gets their own InterviewSession instance,
    preventing cross-user interference while keeping the existing API identical.
    """

    def __init__(self):
        self._sessions: dict[int, InterviewSession] = {}

    def get_session(self, user_id: int) -> InterviewSession:
        """Return the interview session for a given user.

        Creates a new session if one does not exist.
        """
        if user_id not in self._sessions:
            self._sessions[user_id] = InterviewSession()
        return self._sessions[user_id]

    def remove_session(self, user_id: int) -> None:
        """Remove a user's session (e.g. on completion or reset)."""
        self._sessions.pop(user_id, None)


# Singleton manager – the only global state, keyed by user_id
session_manager = InterviewSessionManager()
